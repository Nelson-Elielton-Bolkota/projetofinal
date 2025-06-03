export default class Cart {
    constructor() {
        this.CART_STORAGE_KEY = 'armazemCart';
    }

    init(state, DOM) {
        this.loadCart(state);
        this.updateCartDisplay(state, DOM);
        this.renderCartItems(state, DOM);
        this.setupEventListeners(state, DOM);
    }

    loadCart(state) {
        if (!state) return false;
        

        if (!state.cart) {
            state.cart = { items: [], total: 0 };
        }
        
        const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
        if (savedCart) {
            state.cart = JSON.parse(savedCart);
            return true;
        }
        return false;
    }

    addToCart(state, product) {

        if (!state.cart) {
            state.cart = { items: [], total: 0 };
        }
        

        if (!state.cart.items) {
            state.cart.items = [];
        }
        
        const existingItem = state.cart.items.find(item => item._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            state.cart.items.push({...product, quantity: 1});
        }
        
        this.updateState(state);
    }

    saveCart(state) {
        if (!state || !state.cart) return;
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(state.cart));
    }

    clearCart(state, DOM) {

        if (!state) {
            console.error('Cannot clear cart: state is undefined');
            return;
        }
        

        if (!state.cart) {
            state.cart = { items: [], total: 0 };
        } else {
            state.cart.items = [];
            state.cart.total = 0;
        }
        
        this.saveCart(state);
        this.updateCartDisplay(state, DOM);
        

        if (DOM && DOM.cartSidebar) {
            DOM.cartSidebar.classList.add('shake');
            setTimeout(() => DOM.cartSidebar.classList.remove('shake'), 500);
        }
    }


    updateCartDisplay(state, DOM) {
        if (!state || !DOM) return;
        

        if (!state.cart) {
            state.cart = { items: [], total: 0 };
        }
        

        if (!state.cart.items) {
            state.cart.items = [];
        }
        

        const itemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        if (DOM.cartCount) DOM.cartCount.textContent = itemCount;
        if (DOM.cartSum) DOM.cartSum.textContent = this.formatCurrency(state.cart.total);
        if (DOM.floatingCart) DOM.floatingCart.classList.toggle('has-items', itemCount > 0);


        if (DOM.cartSidebar?.classList.contains('open')) {
            this.renderCartItems(state, DOM);
        }
    }

    updateState(state) {
        if (!state || !state.cart) return;
        
        state.cart.total = this.calculateTotal(state);
        this.saveCart(state);
    }

    calculateTotal(state) {
        if (!state?.cart?.items) return 0;
        
        return state.cart.items.reduce((total, item) => {
            return total + (Number(item.price) || 0) * (Number(item.quantity) || 0);
        }, 0);
    }


    renderCartItems(state, DOM) {
        if (!DOM || !DOM.cartItemsContainer) return;
        

        if (!state.cart) {
            state.cart = { items: [], total: 0 };
        }
        

        if (!state.cart.items) {
            state.cart.items = [];
        }
        
        DOM.cartItemsContainer.innerHTML = state.cart.items.map(item => `
        <div class="cart-item" data-id="${item._id}">
            <div class="cart-item-image-container">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/60'">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">${this.formatCurrency(item.price)} cada</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-action="decrease" data-id="${item._id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-action="increase" data-id="${item._id}">+</button>
                </div>
                <div class="item-total">
                    ${this.formatCurrency(item.price * item.quantity)}
                </div>
                <button class="remove-item-btn" data-id="${item._id}">&times;</button>
            </div>
        </div>
    `).join('');

        if (DOM.cartTotal) {
            DOM.cartTotal.textContent = this.formatCurrency(state.cart.total);
        }
        

        this.attachQuantityControlListeners(state, DOM);
    }
    

    attachQuantityControlListeners(state, DOM) {
        if (!DOM.cartItemsContainer) return;
        

        const quantityButtons = DOM.cartItemsContainer.querySelectorAll('.quantity-btn');
        

        quantityButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = button.dataset.id;
                const action = button.dataset.action;
                
                if (action === 'increase') {
                    this.increaseQuantity(state, itemId, DOM);
                } else if (action === 'decrease') {
                    this.decreaseQuantity(state, itemId, DOM);
                }
                

                e.stopPropagation();
            });
        });
        

        const removeButtons = DOM.cartItemsContainer.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = button.dataset.id;
                this.removeFromCart(state, itemId, DOM);
                e.stopPropagation();
            });
        });
    }

    setupEventListeners(state, DOM) {
        if (DOM.cartItemsContainer) {
            DOM.cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target;
                
                if (target.classList.contains('remove-item-btn')) {
                    const itemId = target.dataset.id;
                    this.removeFromCart(state, itemId, DOM);
                }
                
                if (target.classList.contains('quantity-btn')) {
                    const itemId = target.dataset.id;
                    const action = target.dataset.action;
                    
                    if (action === 'increase') {
                        this.increaseQuantity(state, itemId, DOM);
                    } else if (action === 'decrease') {
                        this.decreaseQuantity(state, itemId, DOM);
                    }
                }
            });
        }
    }
    
    increaseQuantity(state, itemId, DOM) {
        if (!state || !state.cart || !state.cart.items) return;
        
        const item = state.cart.items.find(item => item._id === itemId);
        if (item) {
            item.quantity += 1;
            this.updateState(state);
            this.updateCartDisplay(state, DOM);
            console.log(`Aumentou quantidade de ${item.name} para ${item.quantity}`);
        }
    }
    
    decreaseQuantity(state, itemId, DOM) {
        if (!state || !state.cart || !state.cart.items) return;
        
        const item = state.cart.items.find(item => item._id === itemId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.updateState(state);
                this.updateCartDisplay(state, DOM);
                console.log(`Diminuiu quantidade de ${item.name} para ${item.quantity}`);
            } else {
                this.removeFromCart(state, itemId, DOM);
            }
        }
    }
    
    removeFromCart(state, itemId, DOM) {
        if (!state || !state.cart || !state.cart.items) return;
        
        const item = state.cart.items.find(item => item._id === itemId);
        const itemName = item ? item.name : 'Item';
        
        state.cart.items = state.cart.items.filter(item => item._id !== itemId);
        this.updateState(state);
        this.updateCartDisplay(state, DOM);
        
        console.log(`Removeu item ${itemName} do carrinho`);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}