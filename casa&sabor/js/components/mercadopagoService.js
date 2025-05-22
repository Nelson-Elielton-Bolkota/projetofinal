const Order = require('../../models/Orders');
const { MercadoPagoConfig, Payment } = require('mercadopago');

class MercadoPagoService {
    constructor() {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-6946449067067572-051815-70a3213b50c643ad3c5e157283744b52-1663314629'
        });
        this.paymentSessions = {};
    }

    async createPaymentSession(sessionData) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        this.paymentSessions[sessionId] = {
            ...sessionData,
            created_at: new Date(),
            status: 'pending'
        };

        return { id: sessionId };
    }

    async processPayment(paymentData) {
        const { payment_id, token, issuer_id, payment_method_id, transaction_amount, installments, payer } = paymentData;

        if (!this.paymentSessions[payment_id]) {
            throw new Error('Sessão de pagamento não encontrada');
        }

        const sessionData = this.paymentSessions[payment_id];

        const paymentRequest = {
            transaction_amount: Number(transaction_amount),
            token: token,
            description: `Compra na Casa & Sabor - ${payment_id}`,
            installments: Number(installments),
            payment_method_id: payment_method_id,
            issuer_id: issuer_id,
            payer: {
                email: payer.email,
                identification: payer.identification
            }
        };

        try {
            const payment = await new Payment(this.client).create({ body: paymentRequest });

            let orderStatus = 'pending';
            if (payment.status === 'approved') {
                orderStatus = 'approved';
            } else if (payment.status === 'rejected') {
                orderStatus = 'rejected';
            }

            console.log(`Pagamento processado - ID: ${payment.id}, Status: ${payment.status}`);

            if (payment.status === 'rejected') {
                console.log(`❌ Pagamento REJEITADO - ID: ${payment.id}, Motivo: ${payment.status_detail}`);


                this.paymentSessions[payment_id].status = 'rejected';
                this.paymentSessions[payment_id].payment_details = {
                    status: payment.status,
                    status_detail: payment.status_detail,
                    mercadopago_id: payment.id
                };


                return payment;
            }
            const newOrder = new Order({
                paymentId: payment_id,
                mercadoPagoId: payment.id,
                status: orderStatus,
                items: sessionData.items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                customer: {
                    name: payer.name || sessionData.customer.name,
                    email: payer.email,
                    phone: sessionData.customer.phone,
                    address: {
                        street: sessionData.customer.address.street_name,
                        number: sessionData.customer.address.street_number,
                        neighborhood: sessionData.customer.address.neighborhood,
                        city: sessionData.customer.address.city,
                        state: sessionData.customer.address.federal_unit,
                        zipCode: sessionData.customer.address.zip_code
                    }
                },
                total: sessionData.total_amount,
                paymentMethod: payment.payment_method_id,
                paymentStatus: payment.status // Status do pagamento no MP
            });

            const savedOrder = await newOrder.save();
            console.log(`💾 Pedido salvo - ID: ${savedOrder._id}, Status: ${orderStatus}, PaymentStatus: ${payment.status}`);


            this.paymentSessions[payment_id].status = payment.status;
            this.paymentSessions[payment_id].payment_details = {
                status: payment.status,
                status_detail: payment.status_detail,
                mercadopago_id: payment.id,
                order_id: savedOrder._id
            };

            return payment;

        } catch (error) {
            console.error('💥 Erro ao processar pagamento:', error);


            this.paymentSessions[payment_id].status = 'error';
            this.paymentSessions[payment_id].error = error.message;

            throw error;
        }
    }

    async getPaymentStatus(id) {

        if (this.paymentSessions[id]) {
            const sessionData = this.paymentSessions[id];


            if (sessionData.payment_details && sessionData.payment_details.mercadopago_id) {
                try {
                    const payment = await new Payment(this.client).get({
                        id: sessionData.payment_details.mercadopago_id
                    });


                    sessionData.status = payment.status;
                    sessionData.payment_details = {
                        ...sessionData.payment_details,
                        status: payment.status,
                        status_detail: payment.status_detail,
                        date_approved: payment.date_approved
                    };

                    return {
                        status: payment.status,
                        details: payment,
                        session_id: id,
                        payment_id: sessionData.payment_details.mercadopago_id
                    };
                } catch (error) {
                    console.error('Erro ao buscar pagamento no Mercado Pago:', error);
                }
            }

            return {
                status: sessionData.status,
                session_id: id,
                payment_id: sessionData.payment_details?.mercadopago_id,
                details: sessionData.payment_details,
                error: sessionData.error
            };
        }


        try {
            const payment = await new Payment(this.client).get({ id });
            return {
                status: payment.status,
                details: payment
            };
        } catch (error) {
            throw new Error('Pagamento não encontrado');
        }
    }

    async handleWebhook(data) {
        const { type, data: paymentData } = data;

        if (type === 'payment') {
            const paymentId = paymentData.id;
            console.log(`📞 Webhook recebido para pagamento #${paymentId}`);

            try {
                const payment = await new Payment(this.client).get({ id: paymentId });
                console.log(`📞 Status atual do pagamento #${paymentId}: ${payment.status}`);


                const order = await Order.findOne({ mercadoPagoId: paymentId });
                if (order) {

                    let newStatus;
                    switch (payment.status) {
                        case 'approved':
                            newStatus = 'approved';
                            break;
                        case 'pending':
                        case 'in_process':
                        case 'in_mediation':
                            newStatus = 'pending';
                            break;
                        case 'rejected':
                        case 'cancelled':
                            newStatus = 'rejected';
                            break;
                        default:
                            newStatus = order.status; 
                    }

                    if (order.status !== newStatus) {
                        order.status = newStatus;
                        order.paymentStatus = payment.status;
                        await order.save();
                        console.log(`📞 Pedido ${order._id} atualizado via webhook - Status: ${newStatus}`);
                    }
                } else {
                    console.log(`📞 Nenhum pedido encontrado para pagamento ${paymentId}`);
                }

                return payment;
            } catch (error) {
                console.error('📞 Erro ao processar webhook:', error);
                throw error;
            }
        }

        return null;
    }

    cleanExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];

        Object.keys(this.paymentSessions).forEach(sessionId => {
            const session = this.paymentSessions[sessionId];
            const sessionAge = now - new Date(session.created_at).getTime();


            if (sessionAge > 24 * 60 * 60 * 1000) {
                expiredSessions.push(sessionId);
            }
        });

        if (expiredSessions.length > 0) {
            console.log(`🧹 Limpando ${expiredSessions.length} sessões de pagamento expiradas`);
            expiredSessions.forEach(sessionId => {
                delete this.paymentSessions[sessionId];
            });
        }
    }
}

module.exports = new MercadoPagoService();