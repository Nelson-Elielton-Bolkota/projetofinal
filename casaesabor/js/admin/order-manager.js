
import { showAlert, showLoader, hideLoader, formatCurrency, escapeHtml } from './utils.js';

const ORDERS_API_URL = 'https://casaesabor.onrender.com/api/admin/orders';

class OrderManager {
    constructor() {
        this.orders = [];
    }

    async init() {
        console.log('Inicializando gerenciador de pedidos...');
        this.setupEventListeners();
    }

    async loadOrders() {
        try {
            showLoader();
            console.log('Carregando pedidos...');

            const response = await fetch(ORDERS_API_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.orders = await response.json();
            console.log(`${this.orders.length} pedidos carregados`);
            
            this.renderOrders(this.orders);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            showAlert('Erro ao carregar pedidos: ' + error.message, 'error');
            
            const tableBody = document.getElementById('orders-table');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4 text-danger">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Erro ao carregar pedidos
                        </td>
                    </tr>
                `;
            }
        } finally {
            hideLoader();
        }
    }

    renderOrders(orders) {
        const tableBody = document.getElementById('orders-table');
        
        if (!tableBody) {
            console.error('Elemento #orders-table não encontrado no DOM');
            return;
        }

        if (!orders?.length) {
            return this.renderEmptyOrdersTable(tableBody);
        }

        tableBody.innerHTML = orders.map(order => this.renderOrderRow(order)).join('');
        this.setupOrderEventListeners();
    }

    renderEmptyOrdersTable(tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fas fa-inbox"></i><br>
                    Nenhum pedido encontrado
                </td>
            </tr>
        `;
    }

    renderOrderRow(order) {
        const {
            id: shortId,
            date,
            customerName,
            customerEmail,
            customerPhone,
            total,
            status,
            paymentStatus
        } = this.extractOrderData(order);

        return `
            <tr>
                <td><code>${shortId}</code></td>
                <td>${date}</td>
                <td>
                    <strong>${escapeHtml(customerName)}</strong><br>
                    <small class="text-muted">${escapeHtml(customerEmail)}</small><br>
                    <small class="text-muted">${escapeHtml(customerPhone)}</small>
                </td>
                <td><strong>${total}</strong></td>
                <td>
                    ${this.renderStatusBadge(status)}
                    <br>
                    <small class="text-muted">Pagamento: ${this.getPaymentStatusLabel(paymentStatus)}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-info view-order-btn" 
                            data-order-id="${order._id}"
                            title="Ver detalhes">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </td>
            </tr>
        `;
    }

    extractOrderData(order) {
        return {
            id: order._id ? order._id.substring(18, 24) : 'N/A',
            date: order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : 'N/A',
            customerName: order.customer?.name || 'Nome não informado',
            customerEmail: order.customer?.email || 'Email não informado',
            customerPhone: order.customer?.phone || 'Telefone não informado',
            total: order.total ? formatCurrency(order.total) : 'R$ 0,00',
            status: order.status || 'pending',
            paymentStatus: order.paymentStatus || 'pending'
        };
    }

    renderStatusBadge(status) {
        const badgeColor = this.getStatusBadgeColor(status);
        const statusLabel = this.getStatusLabel(status);
        
        return `
            <span class="badge bg-${badgeColor} mb-1">
                ${statusLabel}
            </span>
        `;
    }

    getPaymentStatusLabel(status) {
        const statusLabels = {
            'approved': 'Aprovado',
            'pending': 'Pendente',
            'in_process': 'Em Processamento',
            'rejected': 'Recusado',
            'refunded': 'Estornado',
            'cancelled': 'Cancelado'
        };
        return statusLabels[status] || status;
    }

    getStatusBadgeColor(status) {
        const colors = {
            'pending': 'warning',
            'approved': 'success',
            'in_process': 'info', 
            'rejected': 'danger',
            'refunded': 'secondary',
            'cancelled': 'dark'
        };
        return colors[status] || 'secondary';
    }

    getStatusLabel(status) {
        const statusLabels = {
            'pending': 'Pendente',
            'approved': 'Aprovado',
            'in_process': 'Em Processamento',
            'rejected': 'Rejeitado',
            'refunded': 'Reembolsado',
            'cancelled': 'Cancelado'
        };
        return statusLabels[status] || status;
    }

    setupEventListeners() {
        const refreshOrdersBtn = document.querySelector('[onclick="loadOrders()"]');
        if (refreshOrdersBtn) {
            refreshOrdersBtn.onclick = () => this.loadOrders();
        }
    }

    setupOrderEventListeners() {
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => this.handleStatusChange(e));
        });

        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewOrderDetails(e));
        });
    }

    async handleViewOrderDetails(e) {
        const orderId = e.target.closest('button').dataset.orderId;
        
        if (!orderId) {
            showAlert('ID do pedido não encontrado', 'error');
            return;
        }

        try {
            showLoader();
            console.log('Carregando detalhes do pedido:', orderId);
            
            const response = await fetch(`${ORDERS_API_URL}/${orderId}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const order = await response.json();
            this.showOrderDetailsModal(order);
            
        } catch (error) {
            console.error('Erro ao carregar detalhes do pedido:', error);
            showAlert('Erro ao carregar detalhes do pedido: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async handleStatusChange(e) {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;
        const originalStatus = e.target.dataset.originalStatus;

        if (newStatus === originalStatus) return;

        const confirmChange = confirm(
            `Confirma a alteração do status do pedido ${orderId.substring(0, 6)} para "${this.getStatusLabel(newStatus)}"?`
        );

        if (!confirmChange) {
            e.target.value = originalStatus;
            return;
        }

        try {
            showLoader();
            console.log(`Atualizando status do pedido ${orderId} para ${newStatus}`);

            const response = await fetch(`${ORDERS_API_URL}/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    updatedAt: new Date().toISOString() 
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status} ao atualizar status`);
            }

            const updatedOrder = await response.json();
            
            e.target.dataset.originalStatus = newStatus;
            e.target.className = `form-select form-select-sm status-select status-${newStatus}`;
            
            await this.loadOrders();
            
            showAlert(`Status do pedido #${orderId.substring(0, 6)} atualizado para ${this.getStatusLabel(newStatus)}`, 'success');
            
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showAlert(`Falha ao atualizar status: ${error.message}`, 'error');
            
            e.target.value = originalStatus;
        } finally {
            hideLoader();
        }
    }

    showOrderDetailsModal(order) {
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        const modalContent = document.getElementById('orderDetailsContent');
        
        const itemsHtml = order.items.map(item => `
            <div class="d-flex align-items-center mb-3">
                <img src="${item.image}" alt="${item.name}" 
                     class="me-3" style="width: 60px; height: 60px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/60'">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${escapeHtml(item.name)}</h6>
                    <small class="text-muted">
                        ${item.quantity}x ${formatCurrency(item.price)} = 
                        <strong>${formatCurrency(item.price * item.quantity)}</strong>
                    </small>
                </div>
            </div>
        `).join('');
        
        modalContent.innerHTML = `
            <div class="mb-4">
                <h4>Pedido #${order._id.substring(18, 24)}</h4>
                <p class="text-muted">${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                <span class="badge bg-${this.getStatusBadgeColor(order.status)}">
                    ${this.getStatusLabel(order.status)}
                </span>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <h5><i class="fas fa-user me-2"></i>Cliente</h5>
                    <hr>
                    <p><strong>Nome:</strong> ${escapeHtml(order.customer.name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p>
                    <p><strong>Telefone:</strong> ${order.customer.phone || 'Não informado'}</p>
                </div>
                
                <div class="col-md-6 mb-4">
                    <h5><i class="fas fa-map-marker-alt me-2"></i>Endereço</h5>
                    <hr>
                    <p>${escapeHtml(order.customer.address.street)}, ${escapeHtml(order.customer.address.number)}</p>
                    <p>${escapeHtml(order.customer.address.neighborhood)}</p>
                    <p>${escapeHtml(order.customer.address.city)}/${escapeHtml(order.customer.address.state)}</p>
                    <p>CEP: ${escapeHtml(order.customer.address.zipCode)}</p>
                </div>
            </div>
            
            <div class="mb-4">
                <h5><i class="fas fa-boxes me-2"></i>Itens</h5>
                <hr>
                ${itemsHtml}
            </div>
            
            <div class="text-end">
                <h4>Total: ${formatCurrency(order.total)}</h4>
            </div>
            
            <div class="d-flex justify-content-between mt-4">
                <button class="btn btn-danger" onclick="orderManager.deleteOrder('${order._id}')">
                    <i class="fas fa-trash"></i> Excluir Pedido
                </button>
                <button class="btn btn-secondary" data-bs-dismiss="modal">
                    Fechar
                </button>
            </div>
        `;
        
        modal.show();
    }

    async deleteOrder(orderId) {
        if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            showLoader();
            const response = await fetch(`${ORDERS_API_URL}/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir pedido');
            }

            showAlert('Pedido excluído com sucesso!', 'success');
            
            bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal')).hide();
            await this.loadOrders();
            
        } catch (error) {
            console.error('Erro ao excluir pedido:', error);
            showAlert('Erro ao excluir pedido: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }
}

export default OrderManager;