const API_URL = 'https://casaesabor.onrender.com/api/products';

export default class Products {
    constructor() {
        this.state = { products: [] };
        this.dom = {
            productGrids: {
                hortifruti: document.getElementById('hortifruti-grid'),
                caseiros: document.getElementById('caseiros-grid')
            }
        };
        
        this.verifyDOM();
        this.loadProducts();
    }

    verifyDOM() {
        Object.keys(this.dom.productGrids).forEach(key => {
            if (!this.dom.productGrids[key]) {
                console.error(`Elemento não encontrado: ${key}-grid`);
            }
        });
    }

    async loadProducts() {
        try {
            console.log('Iniciando carregamento de produtos...');
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            this.state.products = await response.json();
            console.log('Produtos carregados:', this.state.products);
            this.renderProducts();
            return this.state.products; // Retorna os produtos para uso externo
        } catch (error) {
            console.error('Falha ao carregar produtos:', error);
            this.state.products = [];
            return [];
        }
    }

    renderProducts() {
    if (!this.dom.productGrids) {
        console.error('Erro: DOM não inicializado');
        return;
    }


    const categoriasNosProdutos = [...new Set(this.state.products.map(p => p.category))];
    console.log('Categorias nos produtos:', categoriasNosProdutos);

    Object.keys(this.dom.productGrids).forEach(category => {
        const gridElement = this.dom.productGrids[category];
        if (!gridElement) return;


        const filteredProducts = this.state.products.filter(p => 
            p.category.toLowerCase() === category.toLowerCase()
        );

        console.log(`Produtos para ${category}:`, filteredProducts);
        
        if (filteredProducts.length === 0) {
            console.warn(`Nenhum produto encontrado para categoria: ${category}`);
            gridElement.innerHTML = '<p>Nenhum produto disponível</p>';
            return;
        }

        gridElement.innerHTML = filteredProducts.map(product => `
            <article class="product-card" data-id="${product._id}">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-price">${this.formatCurrency(product.price)}</span>
                <img src="${product.image}" class="product-image" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/150'">
                <button class="cart-button" data-id="${product._id}">+</button>
            </article>
        `).join('');
    });
}

    getProductById(id) {
        return this.state.products.find(p => p._id.toString() === id.toString());
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}