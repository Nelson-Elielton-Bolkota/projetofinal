export class UIService {
  static showLoading(buttonId, show) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (show) {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
      button.disabled = true;
    } else {
      button.innerHTML = 'Finalizar Compra <i class="fas fa-arrow-right"></i>';
      button.disabled = false;
    }
  }

  static showFeedback(title, message, type = 'success') {
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;
    
    const icon = modal.querySelector('#modal-icon');
    const modalTitle = modal.querySelector('#modal-title');
    const modalMessage = modal.querySelector('#modal-message');
    
    icon.innerHTML = type === 'success' 
      ? '<i class="fas fa-check-circle success"></i>' 
      : '<i class="fas fa-exclamation-circle error"></i>';
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    modal.style.display = 'block';
    
    modal.querySelector('#modal-button').onclick = () => {
      modal.style.display = 'none';
    };
    
    modal.querySelector('.close-modal').onclick = () => {
      modal.style.display = 'none';
    };
  }

  static renderCartItems(items, subtotal, total) {
    const orderItems = document.getElementById('order-items');
    const subtotalEl = document.getElementById('subtotal');
    const orderTotal = document.getElementById('order-total');
    
    if (!orderItems || !subtotalEl || !orderTotal) return;
    
    orderItems.innerHTML = items.map(item => {
      const itemTotal = item.price * item.quantity;
      
      return `
        <div class="order-item">
          <div class="order-item-info">
            <img src="${item.image}" alt="${item.name}" class="order-item-img" 
                 onerror="this.src='https://via.placeholder.com/60'">
            <div class="order-item-details">
              <h4 class="order-item-name">${item.name}</h4>
              <span class="order-item-qty">${item.quantity}x ${this.formatCurrency(item.price)}</span>
            </div>
          </div>
          <span class="order-item-price">${this.formatCurrency(itemTotal)}</span>
        </div>
      `;
    }).join('');
    
    subtotalEl.textContent = this.formatCurrency(subtotal);
    orderTotal.textContent = this.formatCurrency(total);
  }

  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}