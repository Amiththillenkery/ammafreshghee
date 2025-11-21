// API Base URL
const API_URL = window.location.origin + '/api';

// Current orders data
let currentOrders = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  document.getElementById('end-date').valueAsDate = today;
  document.getElementById('start-date').valueAsDate = thirtyDaysAgo;
  
  // Fetch initial data
  fetchOrders();
  fetchStats();
});

// Fetch orders with filters
async function fetchOrders() {
  try {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const status = document.getElementById('status-filter').value;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status !== 'all') params.append('status', status);
    
    const response = await fetch(`${API_URL}/orders?${params.toString()}`);
    const data = await response.json();
    
    if (data.success) {
      currentOrders = data.orders;
      displayOrders(data.orders);
      updateOrdersCount(data.count);
    } else {
      showError('Failed to load orders');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    showError('Error loading orders. Please try again.');
  }
}

// Fetch statistics
async function fetchStats() {
  try {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_URL}/stats?${params.toString()}`);
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('stat-total').textContent = data.stats.total_orders;
      document.getElementById('stat-pending').textContent = data.stats.pending;
      document.getElementById('stat-confirmed').textContent = data.stats.confirmed;
      document.getElementById('stat-revenue').textContent = `₹${Math.round(data.stats.total_revenue)}`;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Display orders in table
function displayOrders(orders) {
  const container = document.getElementById('orders-container');
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <h3>No Orders Found</h3>
        <p>Try adjusting your filters or date range</p>
      </div>
    `;
    return;
  }
  
  const tableHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td><strong>${order.order_number}</strong></td>
              <td>${formatDate(order.created_at)}</td>
              <td>${order.customer_name}</td>
              <td>${order.customer_phone}</td>
              <td>${order.items.length} items</td>
              <td><strong>₹${Math.round(order.total_amount)}</strong></td>
              <td>
                <span class="status-badge status-${order.status}">
                  ${formatStatus(order.status)}
                </span>
              </td>
              <td>
                <button class="btn btn-primary" onclick="viewOrder(${order.id})">
                  View
                </button>
                <button class="btn btn-pdf" onclick="printPDF(${order.id}, '${order.order_number}')">
                  📄 PDF
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = tableHTML;
}

// View order details
async function viewOrder(orderId) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`);
    const data = await response.json();
    
    if (data.success) {
      showOrderModal(data.order);
    } else {
      alert('Failed to load order details');
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    alert('Error loading order details');
  }
}

// Show order modal
function showOrderModal(order) {
  const modal = document.getElementById('order-modal');
  const modalBody = document.getElementById('modal-body');
  
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.product_name}</td>
      <td>₹${item.price_per_unit}</td>
      <td>${item.quantity}</td>
      <td><strong>₹${Math.round(item.total_price)}</strong></td>
    </tr>
  `).join('');
  
  modalBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Order Number</div>
        <div class="detail-value">${order.order_number}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Order Date</div>
        <div class="detail-value">${formatDateTime(order.created_at)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Customer Name</div>
        <div class="detail-value">${order.customer_name}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Phone</div>
        <div class="detail-value">${order.customer_phone}</div>
      </div>
      <div class="detail-item" style="grid-column: span 2;">
        <div class="detail-label">Delivery Address</div>
        <div class="detail-value">${order.delivery_address}, ${order.city} - ${order.pincode}</div>
        ${order.landmark ? `<div style="font-size: 14px; color: #666; margin-top: 5px;">Landmark: ${order.landmark}</div>` : ''}
      </div>
    </div>
    
    <div class="items-table">
      <h4>Order Items</h4>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr style="background: #f8f9fa; font-weight: 600;">
            <td colspan="3">Delivery Charge</td>
            <td>₹${order.delivery_charge}</td>
          </tr>
          <tr style="background: #f8f9fa; font-weight: 700; font-size: 16px;">
            <td colspan="3">Total Amount</td>
            <td style="color: #d4af37;">₹${Math.round(order.total_amount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="action-section">
      <h4>Update Order Status</h4>
      <select class="status-select" id="modal-status-select">
        <option value="payment_pending" ${order.status === 'payment_pending' ? 'selected' : ''}>Payment Pending</option>
        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
      <button class="btn btn-primary" onclick="updateOrderStatus(${order.id})" style="width: 100%;">
        Update Status
      </button>
    </div>
  `;
  
  modal.classList.add('active');
}

// Update order status
async function updateOrderStatus(orderId) {
  const newStatus = document.getElementById('modal-status-select').value;
  
  if (!confirm(`Are you sure you want to update the order status to "${formatStatus(newStatus)}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Order status updated successfully!');
      closeModal();
      fetchOrders();
      fetchStats();
    } else {
      alert('Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating order:', error);
    alert('Error updating order status');
  }
}

// Close modal
function closeModal() {
  document.getElementById('order-modal').classList.remove('active');
}

// Close modal on background click
document.getElementById('order-modal').addEventListener('click', (e) => {
  if (e.target.id === 'order-modal') {
    closeModal();
  }
});

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatus(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function updateOrdersCount(count) {
  document.getElementById('orders-count').textContent = `${count} order${count !== 1 ? 's' : ''}`;
}

function showError(message) {
  const container = document.getElementById('orders-container');
  container.innerHTML = `
    <div class="error">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

// Print PDF function
function printPDF(orderId, orderNumber) {
  const pdfUrl = `${API_URL}/orders/${orderId}/pdf`;
  
  // Open in new tab
  const newWindow = window.open(pdfUrl, '_blank');
  
  if (!newWindow) {
    // If popup blocked, trigger download directly
    window.location.href = pdfUrl;
  }
  
  console.log(`Generating PDF for order ${orderNumber}`);
}

