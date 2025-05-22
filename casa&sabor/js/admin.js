
import { loadVLibras } from './components/vlibras-loader.js';
import { showAlert } from './admin/utils.js';
import ProductManager from './admin/product-manager.js';
import OrderManager from './admin/order-manager.js';


let productManager;
let orderManager;


document.addEventListener('DOMContentLoaded', initAdmin);

async function initAdmin() {
    console.log('Inicializando painel administrativo...');
    
    try {

        await loadVLibras();
        

        productManager = new ProductManager();
        orderManager = new OrderManager();
        

        await productManager.init();
        await orderManager.init();
        

        setupTabNavigation();
        

        const ordersTab = document.getElementById('orders-tab');
        if (ordersTab && ordersTab.classList.contains('active')) {
            await orderManager.loadOrders();
        }
        

        window.productManager = productManager;
        window.orderManager = orderManager;
        
        console.log('Painel administrativo inicializado com sucesso');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showAlert('Erro ao inicializar o painel administrativo', 'error');
    }
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(event) {
            const targetTab = event.target.getAttribute('data-bs-target');
            

            if (targetTab === '#orders') {
                orderManager.loadOrders();
            }
        });
    });
}


window.editProduct = (id) => productManager.editProduct(id);
window.deleteProduct = (id) => productManager.deleteProduct(id);
window.loadOrders = () => orderManager.loadOrders();
window.deleteOrder = (id) => orderManager.deleteOrder(id);