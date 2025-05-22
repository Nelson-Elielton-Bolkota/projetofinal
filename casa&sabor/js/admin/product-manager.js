
import { showAlert, showLoader, hideLoader, formatCurrency, formatCategory, escapeHtml } from './utils.js';

const API_URL = 'http://localhost:5000/api/products';

class ProductManager {
    constructor() {
        this.products = [];
        this.editingProductId = null;
    }

    async init() {
        console.log('Inicializando gerenciador de produtos...');
        await this.loadProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        try {
            showLoader();
            console.log('Carregando produtos...');
            
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.products = await response.json();
            console.log(`${this.products.length} produtos carregados`);
            
            this.renderProducts();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            showAlert('Erro ao carregar produtos: ' + error.message, 'error');
            
            const productList = document.getElementById('productList');
            if (productList) {
                productList.innerHTML = '<p class="text-center text-muted">Erro ao carregar produtos</p>';
            }
        } finally {
            hideLoader();
        }
    }

    renderProducts() {
        const productList = document.getElementById('productList');
        
        if (!productList) {
            console.warn('Elemento productList não encontrado');
            return;
        }

        if (!this.products || this.products.length === 0) {
            productList.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhum produto cadastrado</p>
                </div>
            `;
            return;
        }

        productList.innerHTML = this.products.map(product => `
            <div class="product-card" data-id="${product._id}">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/200x150?text=Sem+Imagem'"
                     loading="lazy">
                <div class="product-info">
                    <h4>${escapeHtml(product.name)}</h4>
                    <p class="price">${formatCurrency(product.price)}</p>
                    <p class="category">
                        <small><i class="fas fa-tag"></i> ${formatCategory(product.category)}</small>
                    </p>
                </div>
                <div class="product-actions">
                    <button class="edit-btn btn btn-primary btn-sm" onclick="productManager.editProduct('${product._id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-btn btn btn-danger btn-sm" onclick="productManager.deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetProductForm());
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name')?.trim(),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            image: formData.get('image')?.trim()
        };

        if (!productData.name || !productData.price || !productData.category || !productData.image) {
            showAlert('Preencha todos os campos obrigatórios', 'warning');
            return;
        }

        if (productData.price <= 0) {
            showAlert('O preço deve ser maior que zero', 'warning');
            return;
        }

        try {
            showLoader();
            const isEditing = !!this.editingProductId;
            const url = isEditing ? `${API_URL}/${this.editingProductId}` : API_URL;
            const method = isEditing ? 'PUT' : 'POST';

            console.log(`${isEditing ? 'Atualizando' : 'Criando'} produto:`, productData);

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            showAlert(
                isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!', 
                'success'
            );

            this.resetProductForm();
            await this.loadProducts();
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            showAlert(`Erro ao ${this.editingProductId ? 'atualizar' : 'cadastrar'} produto: ${error.message}`, 'error');
        } finally {
            hideLoader();
        }
    }

    editProduct(id) {
        const product = this.products.find(p => p._id === id);
        if (!product) {
            showAlert('Produto não encontrado', 'error');
            return;
        }

        this.editingProductId = id;
        const form = document.getElementById('productForm');
        
        if (!form) return;

        const fields = {
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image
        };

        Object.keys(fields).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.value = fields[fieldName];
            }
        });

        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelEdit');

        if (submitBtn) {
            submitBtn.textContent = 'Atualizar Produto';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Produto';
        }
        
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }

        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showAlert('Produto carregado para edição', 'info');
    }

    async deleteProduct(id) {
        const product = this.products.find(p => p._id === id);
        if (!product) {
            showAlert('Produto não encontrado', 'error');
            return;
        }

        const confirmDelete = confirm(
            `Tem certeza que deseja excluir o produto "${product.name}"?\n\nEsta ação não pode ser desfeita.`
        );
        
        if (!confirmDelete) return;

        try {
            showLoader();
            console.log('Excluindo produto:', id);

            const response = await fetch(`${API_URL}/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            showAlert('Produto excluído com sucesso!', 'success');
            await this.loadProducts();
            
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            showAlert('Erro ao excluir produto: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    resetProductForm() {
        const form = document.getElementById('productForm');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelEdit');
        
        if (form) form.reset();
        
        this.editingProductId = null;
        
        if (submitBtn) {
            submitBtn.textContent = 'Cadastrar Produto';
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Cadastrar Produto';
        }
        
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
    }
}

export default ProductManager;