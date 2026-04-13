const defaultStylists = [
  { id: 'anyone', name: 'Anyone', title: 'First Available Stylist', days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], available: true },
  { id: 'emma', name: 'Emma', title: 'Hair Colouring Specialist', days: ['Monday','Thursday','Saturday','Sunday'], available: true },
  { id: 'james', name: 'James', title: "Men's Grooming Expert", days: ['Monday','Thursday','Friday','Saturday','Sunday'], available: true },
  { id: 'sophia', name: 'Sophia', title: 'Extensions & Styling', days: ['Monday','Tuesday'], available: false },
];

const defaultServices = [
  { id: 'haircut', title: 'Haircut', description: 'Classic cut & style', duration: '30 min', price: 25, category: 'Hair' },
  { id: 'color', title: 'Hair Color', description: 'Full colour service', duration: '60 min', price: 60, category: 'Hair' },
  { id: 'beard', title: 'Beard Trim', description: 'Shape & line-up', duration: '20 min', price: 20, category: 'Beard' },
  { id: 'facial', title: 'Facial', description: 'Deep cleansing facial', duration: '45 min', price: 40, category: 'Skin' },
];

const views = {
  home: document.getElementById('home-view'),
  orders: document.getElementById('orders-view'),
  stylists: document.getElementById('stylists-view'),
  services: document.getElementById('services-view'),
};
const menuButtons = document.querySelectorAll('.menu-item');
const tabButtons = document.querySelectorAll('.tab-button');
const ordersList = document.getElementById('orders-list');
const stylistsList = document.getElementById('stylists-list');
const servicesList = document.getElementById('services-list');
const addStylistButton = document.getElementById('add-stylist-button');
const serviceNameInput = document.getElementById('service-name');
const serviceDescriptionInput = document.getElementById('service-description');
const serviceDurationInput = document.getElementById('service-duration');
const servicePriceInput = document.getElementById('service-price');
const serviceCategorySelect = document.getElementById('service-category');
const addServiceButton = document.getElementById('add-service-button');
const newOrderCount = document.getElementById('new-order-count');
const metricPending = document.getElementById('metric-pending');
const metricCompleted = document.getElementById('metric-completed');
const metricCancelled = document.getElementById('metric-cancelled');
const metricToday = document.getElementById('metric-today');
const metricTomorrow = document.getElementById('metric-tomorrow');
const metricWeek = document.getElementById('metric-week');
const metricMonth = document.getElementById('metric-month');
const recentOrdersTable = document.getElementById('recent-orders-table');

let currentOrderTab = 'new';
let orders = [];
let stylists = [];
let services = [];

function initAdmin() {
  const savedOrders = JSON.parse(localStorage.getItem('bdm-orders') || '[]');
  orders = savedOrders;
  stylists = JSON.parse(localStorage.getItem('bdm-stylists') || 'null') || defaultStylists;
  services = JSON.parse(localStorage.getItem('bdm-services') || 'null') || defaultServices;
  bindAdminEvents();
  renderAdmin();
}

function bindAdminEvents() {
  menuButtons.forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  tabButtons.forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  addStylistButton.addEventListener('click', showAddStylistDialog);
  addServiceButton.addEventListener('click', addService);
}

function switchView(view) {
  menuButtons.forEach(button => button.classList.toggle('active', button.dataset.view === view));
  Object.keys(views).forEach(key => views[key].classList.toggle('hidden', key !== view));
  Object.keys(views).forEach(key => views[key].classList.toggle('active', key === view));
}

function switchTab(tab) {
  currentOrderTab = tab;
  tabButtons.forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
  renderOrders();
}

function renderAdmin() {
  renderOverview();
  renderOrders();
  renderStylists();
  renderServices();
}

function renderOverview() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  metricPending.textContent = orders.filter(o => o.status === 'Pending').length;
  metricCompleted.textContent = orders.filter(o => o.status === 'Accepted').length;
  metricCancelled.textContent = orders.filter(o => o.status === 'Cancelled').length;
  metricToday.textContent = orders.filter(o => o.appointmentDate === today).length;
  metricTomorrow.textContent = orders.filter(o => o.appointmentDate === tomorrowDate).length;
  metricWeek.textContent = orders.filter(o => isWithinWeek(o.appointmentDate)).length;
  metricMonth.textContent = orders.filter(o => isWithinMonth(o.appointmentDate)).length;
  newOrderCount.textContent = orders.filter(o => o.status === 'Pending').length;
  renderRecentOrdersTable();
}

function isWithinWeek(dateString) {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();
  const diff = Math.abs(target - now);
  return diff <= 7 * 86400000;
}

function isWithinMonth(dateString) {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();
  return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
}

function renderRecentOrdersTable() {
  const rows = orders.slice(0, 6).map(order => `
    <tr>
      <td>${order.name}</td>
      <td>${formatShortDate(order.appointmentDate)}</td>
      <td>${order.appointmentTime}</td>
      <td><span class="status-tag ${order.status.toLowerCase()}">${order.status}</span></td>
      <td><button class="button button-secondary" onclick="viewOrder('${order.id}')">View</button></td>
    </tr>`).join('');
  recentOrdersTable.innerHTML = rows ? `<table class="order-table"><thead><tr><th>Name</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>` : '<p>No recent orders yet.</p>';
}

function formatShortDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { day:'numeric', month:'short' });
}

function renderOrders() {
  const filtered = orders.filter(order => {
    if (currentOrderTab === 'new') return order.status === 'Pending';
    if (currentOrderTab === 'accepted') return order.status === 'Accepted';
    return order.status === 'Cancelled';
  });
  ordersList.innerHTML = filtered.length ? filtered.map(order => orderCardHtml(order)).join('') : '<p>No orders in this category.</p>';
}

function orderCardHtml(order) {
  return `
    <article class="order-card">
      <h3>#${order.id}</h3>
      <p><strong>Customer:</strong> ${order.name}</p>
      <p><strong>Service:</strong> ${order.service}</p>
      <p><strong>Date:</strong> ${formatDateLabel(order.appointmentDate)}</p>
      <p><strong>Time:</strong> ${order.appointmentTime}</p>
      <p><strong>Amount:</strong> ${order.amount}</p>
      <div class="order-actions">
        ${order.status === 'Pending' ? `<button class="button button-primary" onclick="updateOrderStatus('${order.id}','Accepted')">Accept</button><button class="button button-danger" onclick="updateOrderStatus('${order.id}','Cancelled')">Cancel</button>` : ''}
        <button class="button button-secondary" onclick="viewOrder('${order.id}')">View</button>
      </div>
    </article>`;
}

function formatDateLabel(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = status;
  saveOrders();
  renderAdmin();
}

function viewOrder(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return;
  alert(`Order ${order.id}\nCustomer: ${order.name}\nService: ${order.service}\nStylist: ${order.stylist}\nDate: ${formatDateLabel(order.appointmentDate)}\nTime: ${order.appointmentTime}\nLocation: ${order.location}\nStatus: ${order.status}`);
}

function renderStylists() {
  stylistsList.innerHTML = stylists.map(stylist => `
    <article class="service-card">
      <h3>${stylist.name}</h3>
      <p>${stylist.title}</p>
      <p>${stylist.days.join(' • ')}</p>
      <div class="status-pill ${stylist.available ? 'available' : 'off'}">${stylist.available ? 'Available' : 'Not Available'}</div>
      <div class="order-actions">
        <button class="button button-secondary" onclick="toggleStylistAvailability('${stylist.id}')">Toggle</button>
        <button class="button button-danger" onclick="deleteStylist('${stylist.id}')">Delete</button>
      </div>
    </article>`).join('');
}

function renderServices() {
  servicesList.innerHTML = services.map(service => `
    <article class="service-card">
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <p>${service.duration} | $${service.price}</p>
      <div class="status-pill available">${service.category}</div>
      <div class="order-actions">
        <button class="button button-secondary" onclick="deleteService('${service.id}')">Delete</button>
      </div>
    </article>`).join('');
}

function showAddStylistDialog() {
  const name = prompt('Enter stylist name:');
  if (!name) return;
  const title = prompt('Enter specialty or title:');
  const days = prompt('Enter available days separated by commas:', 'Monday,Tuesday,Wednesday');
  const available = confirm('Is this stylist available?');
  stylists.push({ id: `stylist-${Date.now()}`, name, title: title || 'Stylist', days: (days || 'Monday').split(',').map(item => item.trim()).filter(Boolean), available });
  saveStylists();
  renderStylists();
}

function addService() {
  const title = serviceNameInput.value.trim();
  const description = serviceDescriptionInput.value.trim();
  const duration = serviceDurationInput.value.trim();
  const price = Number(servicePriceInput.value.replace(/[^0-9.]/g, '').trim());
  const category = serviceCategorySelect.value;
  if (!title || !description || !duration || !price) {
    alert('Please complete the service fields before adding.');
    return;
  }
  services.push({ id: `service-${Date.now()}`, title, description, duration, price, category });
  saveServices();
  renderServices();
  serviceNameInput.value = '';
  serviceDescriptionInput.value = '';
  serviceDurationInput.value = '';
  servicePriceInput.value = '';
}

function toggleStylistAvailability(id) {
  const stylist = stylists.find(s => s.id === id);
  if (!stylist) return;
  stylist.available = !stylist.available;
  saveStylists();
  renderStylists();
}

function deleteStylist(id) {
  stylists = stylists.filter(s => s.id !== id);
  saveStylists();
  renderStylists();
}

function deleteService(id) {
  services = services.filter(service => service.id !== id);
  saveServices();
  renderServices();
}

function saveOrders() {
  localStorage.setItem('bdm-orders', JSON.stringify(orders));
}

function saveStylists() {
  localStorage.setItem('bdm-stylists', JSON.stringify(stylists));
}

function saveServices() {
  localStorage.setItem('bdm-services', JSON.stringify(services));
}

window.updateOrderStatus = updateOrderStatus;
window.viewOrder = viewOrder;
window.toggleStylistAvailability = toggleStylistAvailability;
window.deleteStylist = deleteStylist;
window.deleteService = deleteService;

window.addEventListener('DOMContentLoaded', initAdmin);
