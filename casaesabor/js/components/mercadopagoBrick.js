export class MercadoPagoBrick {
  constructor(publicKey) {
    this.publicKey = publicKey;
    this.mercadopago = null;
  }

  initialize() {
    try {
      this.mercadopago = new MercadoPago(this.publicKey, {
        locale: 'pt-BR'
      });
      console.log('SDK MercadoPago inicializado');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar MercadoPago SDK:', error);
      return false;
    }
  }

  async renderCardPaymentBrick(containerId, paymentId, amount, email, onSubmitCallback) {
    if (!this.mercadopago) {
      throw new Error('SDK do Mercado Pago não inicializado');
    }

    const bricksBuilder = this.mercadopago.bricks();
    const container = document.getElementById(containerId);
    
    if (container) {
      container.innerHTML = '';
    }

    const settings = {
      initialization: {
        amount,
        payer: { email }
      },
      callbacks: {
        onReady: () => console.log('Card Payment Brick pronto'),
        onSubmit: onSubmitCallback,
        onError: (error) => {
          console.error('Erro no Card Payment Brick:', error);
          throw error;
        }
      },
      customization: {
        visual: {
          hideFormTitle: true,
          hidePaymentButton: false,
          theme: 'dark'
        },
        paymentMethods: {
          maxInstallments: 12
        }
      },
      locale: 'pt-BR'
    };
    
    await bricksBuilder.create('cardPayment', containerId, settings);
  }
}