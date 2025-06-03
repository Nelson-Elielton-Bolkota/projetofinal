import Cart from './components/Cart.js';
import Products from './components/produtos.js';
import { loadVLibras } from './components/vlibras-loader.js';


const API_BASE_URL = 'https://casaesabor.onrender.com';
const CART_ANIMATION_DURATION = 1000; 


const cart = new Cart();
const products = new Products();


const DOM = {
    floatingCart: document.getElementById('floating-cart'),
    cartCount: document.getElementById('cart-count'),
    cartSum: document.getElementById('cart-sum'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    cartTotal: document.getElementById('cart-total'),
    closeCart: document.getElementById('close-cart'),
    clearCart: document.getElementById('clear-cart'),
    cartOverlay: document.getElementById('cart-overlay'),
    checkoutBtn: document.getElementById('checkout-btn'),
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    productGrids: {
        hortifruti: document.getElementById('hortifruti-grid'),
        caseiros: document.getElementById('caseiros-grid')
    }
};


const state = {
    cart: {
        items: [],
        total: 0
    },
    products: []
};


async function init() {
    try {
        await loadProducts();
        setupEventListeners();
        updateCartUI();
        
    } catch (error) {
        console.error("Erro na inicialização:", error);
        showError("Falha ao carregar os produtos");
    }
}


async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        state.products = await response.json();
        renderProducts(state.products);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        throw error;
    }
}


function renderProducts(products) {
    if (!products || products.length === 0) {
        DOM.productGrids.hortifruti.innerHTML = '<p>Nenhum produto disponível</p>';
        DOM.productGrids.caseiros.innerHTML = '';
        return;
    }


    const hortifruti = products.filter(p => p.category.toLowerCase() === 'hortifruti');
    const caseiros = products.filter(p => p.category.toLowerCase() === 'caseiros');


    renderProductGrid(DOM.productGrids.hortifruti, hortifruti);
    renderProductGrid(DOM.productGrids.caseiros, caseiros);
}


function renderProductGrid(gridElement, products) {
    if (!gridElement) return;
    
    gridElement.innerHTML = products.map(product => `
        <article class="product-card" data-id="${product._id}">
            <h3 class="product-name">${product.name}</h3>
            <span class="product-price">${formatCurrency(product.price)}</span>
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/150'">
            <button class="cart-button">+</button>
        </article>
    `).join('');
}


function setupEventListeners() {

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-button')) {
            handleAddToCart(e);
            loadVLibras();
        }
    });


    DOM.floatingCart.addEventListener('click', openCart);
    DOM.closeCart.addEventListener('click', closeCart);
    DOM.cartOverlay.addEventListener('click', closeCart);
    DOM.clearCart.addEventListener('click', clearCart);
    DOM.checkoutBtn.addEventListener('click', handleCheckout);


    if (DOM.searchButton && DOM.searchInput) {
        DOM.searchButton.addEventListener('click', handleSearch);
        DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
}


function handleAddToCart(e) {
    const productCard = e.target.closest('.product-card');
    if (!productCard) return;

    const productId = productCard.dataset.id;
    const product = state.products.find(p => p._id === productId);

    if (product) {
        cart.addToCart(state, product);
        updateCartUI();
        showAddFeedback(e.target);
    } else {
        console.error('Produto não encontrado:', productId);
    }
}

function updateCartUI() {
    cart.renderCartItems(state, DOM); 
    updateCartSummary();
    cart.saveCart(state);
}


function updateCartSummary() {
    DOM.cartCount.textContent = state.cart.items.length;
    DOM.cartSum.textContent = formatCurrency(state.cart.total);
    DOM.cartTotal.textContent = formatCurrency(state.cart.total);
}


function openCart() {
    DOM.cartSidebar.classList.add('open');
    DOM.cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}


function closeCart() {
    DOM.cartSidebar.classList.remove('open');
    DOM.cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}


function clearCart() {
    cart.clearCart(state);
    updateCartUI();
}


function handleCheckout() {
    if (state.cart.items.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    window.location.href = 'checkout.html';
}


function showAddFeedback(button) {
    button.textContent = '✓';
    button.classList.add('added');

    setTimeout(() => {
        button.textContent = '+';
        button.classList.remove('added');
    }, CART_ANIMATION_DURATION);
}


function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}


async function handleSearch() {
    const query = DOM.searchInput.value.trim();
    if (!query) {
        await loadProducts();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/products?query=${encodeURIComponent(query)}`);
        const results = await response.json();
        renderProducts(results);
    } catch (error) {
        console.error("Erro na busca:", error);

        const localResults = state.products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            p.category.toLowerCase().includes(query.toLowerCase())
        );
        renderProducts(localResults);
    }
}


function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.prepend(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 3000);
}


init();