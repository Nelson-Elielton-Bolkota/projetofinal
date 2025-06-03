import Cart from './Cart.js';

export class CheckoutService {
    constructor() {
        this.cart = new Cart();
        this.state = { cart: { items: [], total: 0 } };
        this.DOM = {
            orderItems: document.getElementById('order-items'),
        };
    }

    async loadCartItems() {
        try {
            const cartLoaded = this.cart.loadCart(this.state);

            if (!cartLoaded || !this.state.cart?.items?.length) {
                return { isEmpty: true };
            }

            const subtotal = this.state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                items: this.state.cart.items,
                subtotal,
                total: this.state.cart.total,
                isEmpty: false
            };
        } catch (error) {
            console.error('Erro ao carregar itens do carrinho:', error);
            throw error;
        }
    }

    getEmptyCartHTML() {
        return `
      <div class="empty-cart-message">
        <i class="fas fa-shopping-basket" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
        <p>Seu carrinho está vazio</p>
        <a href="index.html" class="back-to-shop">Voltar às compras</a>
      </div>
    `;
    }

    async createPaymentSession(customerData) {
        if (!this.state.cart.items?.length) {
            throw new Error('Carrinho vazio. Adicione produtos antes de finalizar a compra.');
        }

        const formattedItems = this.state.cart.items.map(item => ({
            id: item._id || `item-${Date.now()}`,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image
        }));

        const response = await fetch('https://casaesabor.onrender.com/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                items: formattedItems,
                customer: customerData,
                total_amount: this.state.cart.total
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || `Erro na requisição: ${response.status}`);
        }

        return await response.json();
    }

    clearCart() {
        this.cart.clearCart(this.state, this.DOM);
    }
}