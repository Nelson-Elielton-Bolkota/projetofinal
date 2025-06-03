import { CheckoutService } from './checkoutService.js';
import { MercadoPagoBrick } from './mercadopagoBrick.js';
import { FormService } from './formService.js';
import { UIService } from './uiService.js';


const PUBLIC_KEY = 'TEST-604ec1a7-7d02-461b-9883-feff8176f939';
const checkoutService = new CheckoutService();
const mpBrick = new MercadoPagoBrick(PUBLIC_KEY);


document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página de checkout carregada');


    if (!mpBrick.initialize()) {
        UIService.showFeedback('Erro', 'Não foi possível inicializar o checkout. Recarregue a página.', 'error');
        return;
    }


    await loadCartItems();


    FormService.setupInputMasks();
    setupFormValidation();
});

async function loadCartItems() {
    try {
        const cartData = await checkoutService.loadCartItems();

        if (cartData.isEmpty) {
            document.getElementById('order-items').innerHTML = checkoutService.getEmptyCartHTML();
            return;
        }

        UIService.renderCartItems(cartData.items, cartData.subtotal, cartData.total);
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
        UIService.showFeedback('Erro', 'Não foi possível carregar os itens do carrinho. Tente novamente.', 'error');
    }
}

function setupFormValidation() {
    const form = document.getElementById('customer-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!FormService.validateForm()) {
            UIService.showFeedback('Formulário incompleto', 'Preencha todos os campos obrigatórios', 'error');
            return;
        }

        try {
            UIService.showLoading('submit-checkout', true);
            const customerData = FormService.getCustomerData();
            const paymentSession = await checkoutService.createPaymentSession(customerData);

            await setupCardPayment(paymentSession.id);
        } catch (error) {
            handlePaymentError(error);
        } finally {
            UIService.showLoading('submit-checkout', false);
        }
    });
}

async function setupCardPayment(paymentId) {
    try {
        const email = document.getElementById('email').value.trim() || '';
        const amount = checkoutService.state.cart.total;

        await mpBrick.renderCardPaymentBrick(
            'card-payment-brick-container',
            paymentId,
            amount,
            email,
            async (cardFormData) => {
                return processPayment(paymentId, cardFormData);
            }
        );
    } catch (error) {
        handlePaymentError(error);
    }
}
  
async function processPayment(paymentId, cardFormData) {
    try {
        const transactionAmount = Number(checkoutService.state.cart.total).toFixed(2);

        if (isNaN(transactionAmount)) {
            throw new Error('Valor total do carrinho é inválido');
        }

        const response = await fetch('https://casaesabor.onrender.com/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payment_id: paymentId,
                token: cardFormData.token,
                issuer_id: cardFormData.issuer_id,
                payment_method_id: cardFormData.payment_method_id,
                transaction_amount: transactionAmount,
                installments: cardFormData.installments,
                payer: {
                    email: document.getElementById('email').value.trim() || '',
                    identification: {
                        type: cardFormData.payer?.identification?.type,
                        number: cardFormData.payer?.identification?.number
                    }
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Erro ao processar pagamento');
        }

        const data = await response.json();

        switch (data.status) {
            case 'approved':
                checkoutService.clearCart();
                UIService.showFeedback('Sucesso!', 'Seu pagamento foi aprovado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = 'sucess.html';
                }, 2000);
                break;

            case 'pending':
            case 'in_process':
                checkoutService.clearCart();
                UIService.showFeedback(
                    'Pagamento em Processamento',
                    'Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail.',
                    'warning'
                );
                setTimeout(() => {
                    window.location.href = 'pending-confirmation.html';
                }, 2000);
                break;

            case 'rejected':

                UIService.showFeedback(
                    'Pagamento Recusado',
                    `Seu pagamento foi recusado. Motivo: ${data.status_detail || 'não especificado'}. Por favor, tente novamente.`,
                    'error'
                );
                break;

            default:
                throw new Error(`Status de pagamento desconhecido: ${data.status}`);
        }

        return data;
    } catch (error) {
        handlePaymentError(error);
        throw error;
    }
}
function handlePaymentError(error) {
  console.error('Erro no pagamento:', error);
  

  const statusMap = {
    'cc_rejected_bad_filled_card_number': 'Número do cartão incorreto',
    'cc_rejected_bad_filled_date': 'Data de expiração incorreta',
    'cc_rejected_bad_filled_other': 'Informações do cartão incorretas',
    'cc_rejected_bad_filled_security_code': 'Código de segurança incorreto',
    'cc_rejected_blacklist': 'Cartão não permitido',
    'cc_rejected_call_for_authorize': 'Você deve autorizar o pagamento',
    'cc_rejected_card_disabled': 'Cartão desativado',
    'cc_rejected_card_error': 'Não foi possível processar o cartão',
    'cc_rejected_duplicated_payment': 'Você já efetuou um pagamento com esse valor',
    'cc_rejected_high_risk': 'Pagamento recusado por prevenção de fraude',
    'cc_rejected_insufficient_amount': 'Saldo insuficiente',
    'cc_rejected_invalid_installments': 'Parcelamento não permitido',
    'cc_rejected_max_attempts': 'Limite de tentativas excedido',
    'cc_rejected_other_reason': 'Pagamento recusado'
  };

  let title = 'Erro no Pagamento';
  let message = error.message;
  let type = 'error';


  if (error.response && error.response.status_detail) {
    const reason = statusMap[error.response.status_detail] || error.response.status_detail;
    title = 'Pagamento Recusado';
    message = `Motivo: ${reason}. Por favor, tente novamente com outro método de pagamento.`;
  } else if (error.message.includes('rejected')) {
    title = 'Pagamento Recusado';
    message = 'Seu pagamento foi recusado. Por favor, tente novamente com outro método de pagamento.';
  }

  UIService.showFeedback(title, message, type);
  

  if (process.env.NODE_ENV === 'development') {
    console.group('Detalhes do Erro');
    console.log('Tipo:', error.name || 'Erro genérico');
    console.log('Mensagem original:', error.message);
    if (error.response) {
      console.log('Resposta da API:', error.response);
    }
    console.groupEnd();
  }
}