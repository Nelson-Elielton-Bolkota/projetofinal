document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  
  if (!orderId) {
    alert('Pedido não encontrado');
    window.location.href = 'admin.html';
    return;
  }

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (!response.ok) throw new Error('Pedido não encontrado');
    
    const order = await response.json();
    renderOrderDetails(order);
  } catch (error) {
    alert(error.message);
    window.location.href = 'admin.html';
  }
});

function renderOrderDetails(order) {

  document.getElementById('customer-info').innerHTML = `
    <p><strong>Nome:</strong> ${order.customer.name}</p>
    <p><strong>Email:</strong> ${order.customer.email}</p>
    <p><strong>Telefone:</strong> ${order.customer.phone || 'Não informado'}</p>
    <p><strong>Endereço:</strong> ${order.customer.address.street}, ${order.customer.address.number}</p>
    <p><strong>Bairro:</strong> ${order.customer.address.neighborhood}</p>
    <p><strong>Cidade/UF:</strong> ${order.customer.address.city}/${order.customer.address.state}</p>
    <p><strong>CEP:</strong> ${order.customer.address.zipCode}</p>
  `;


  const itemsTable = document.getElementById('order-items');
  itemsTable.innerHTML = order.items.map(item => `
    <tr>
      <td>
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
        ${item.name}
      </td>
      <td>${item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
      <td>${item.quantity}</td>
      <td>${(item.price * item.quantity).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
    </tr>
  `).join('');


  document.getElementById('order-total').textContent = 
    order.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}