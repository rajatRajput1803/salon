const services = [
  { id: 'haircut', title: 'Haircut', description: 'Classic cut & style', duration: '30 min', price: 25, category: 'Hair' },
  { id: 'color', title: 'Hair Color', description: 'Full colour service', duration: '60 min', price: 60, category: 'Hair' },
  { id: 'beard', title: 'Beard Trim', description: 'Shape & line-up', duration: '20 min', price: 20, category: 'Beard' },
  { id: 'facial', title: 'Facial', description: 'Deep cleansing facial', duration: '45 min', price: 40, category: 'Skin' },
  { id: 'manicure', title: 'Manicure', description: 'Clean & polish nails', duration: '30 min', price: 22, category: 'Nails' },
  { id: 'pedicure', title: 'Pedicure', description: 'Spa pedicure treatment', duration: '40 min', price: 28, category: 'Nails' },
  { id: 'makeup', title: 'Make-up', description: 'Event/party glam look', duration: '60 min', price: 55, category: 'Makeup' },
  { id: 'blowdry', title: 'Blow-dry', description: 'Quick styling session', duration: '25 min', price: 18, category: 'Hair' },
  { id: 'hairspa', title: 'Hair Spa', description: 'Nourishing mask therapy', duration: '50 min', price: 50, category: 'Hair' },
  { id: 'nailart', title: 'Nail Art', description: 'Creative nail designs', duration: '45 min', price: 30, category: 'Nails' },
  { id: 'eyebrow', title: 'Eyebrow Wax', description: 'Precision shaping', duration: '15 min', price: 12, category: 'Brows' },
  { id: 'eyelash', title: 'Eyelash Extension', description: 'Natural look', duration: '60 min', price: 70, category: 'Lashes' },
  { id: 'eyebrow-tint', title: 'Eyebrow Tint', description: 'Enhance your brows', duration: '20 min', price: 15, category: 'Brows' },
  { id: 'eyelash-tint', title: 'Eyelash Tint', description: 'Enhance your lashes', duration: '20 min', price: 15, category: 'Lashes' },
];

const stylists = [
  { id: 'anyone', name: 'Anyone', title: 'First Available Stylist', days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], available: true },
  { id: 'emma', name: 'Emma', title: 'Hair Colouring Specialist', days: ['Monday','Thursday','Saturday','Sunday'], available: true },
  { id: 'james', name: 'James', title: "Men's Grooming Expert", days: ['Monday','Thursday','Friday','Saturday','Sunday'], available: true },
  { id: 'sophia', name: 'Sophia', title: 'Extensions & Styling', days: ['Monday','Tuesday'], available: false },
];

const state = {
  step: 1,
  selectedServiceId: null,
  selectedStylistId: null,
  appointmentDate: null,
  appointmentTime: '03:00 PM',
  location: 'BDM Salon, Main Street',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
};

const serviceCards = document.getElementById('service-cards');
const stylistCards = document.getElementById('stylist-cards');
const featuredServices = document.getElementById('featured-services');
const categoryFilter = document.getElementById('category-filter');
const wizardTitle = document.getElementById('wizard-title');
const backButton = document.getElementById('back-button');
const nextButton = document.getElementById('next-button');
const confirmButton = document.getElementById('confirm-button');
const messageBox = document.getElementById('confirmation-message');
const summaryService = document.getElementById('summary-service');
const summaryStylist = document.getElementById('summary-stylist');
const summaryAppointment = document.getElementById('summary-appointment');
const summaryContact = document.getElementById('summary-contact');
const appointmentDate = document.getElementById('appointment-date');
const appointmentTime = document.getElementById('appointment-time');
const locationSelect = document.getElementById('location-select');
const customerName = document.getElementById('customer-name');
const customerPhone = document.getElementById('customer-phone');
const customerEmail = document.getElementById('customer-email');

let serviceElements = [];
let stylistElements = [];

function init() {
  renderCategoryOptions();
  renderServices();
  renderStylists();
  renderFeaturedServices();
  appointmentDate.value = new Date().toISOString().slice(0, 10);
  state.appointmentDate = appointmentDate.value;
  bindEvents();
}

function bindEvents() {
  categoryFilter.addEventListener('change', () => renderServices(categoryFilter.value));
  backButton.addEventListener('click', previousStep);
  nextButton.addEventListener('click', nextStep);
  confirmButton.addEventListener('click', confirmBooking);
  appointmentDate.addEventListener('change', () => state.appointmentDate = appointmentDate.value);
  appointmentTime.addEventListener('change', () => state.appointmentTime = appointmentTime.value);
  locationSelect.addEventListener('change', () => state.location = locationSelect.value);
  customerName.addEventListener('input', () => state.customerName = customerName.value.trim());
  customerPhone.addEventListener('input', () => state.customerPhone = customerPhone.value.trim());
  customerEmail.addEventListener('input', () => state.customerEmail = customerEmail.value.trim());
}

function renderCategoryOptions() {
  const categories = ['all', ...new Set(services.map(s => s.category))];
  categoryFilter.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join('');
}

function renderServices(filter = 'all') {
  const list = filter === 'all' ? services : services.filter(s => s.category === filter);
  serviceCards.innerHTML = list.map(service => {
    const active = state.selectedServiceId === service.id ? 'active' : '';
    return `
      <article class="service-card ${active}" data-id="${service.id}">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        <p>${service.duration}</p>
        <div class="price-tag">$${service.price}</div>
      </article>`;
  }).join('');
  serviceElements = [...serviceCards.querySelectorAll('.service-card')];
  serviceElements.forEach(card => card.addEventListener('click', () => chooseService(card.dataset.id)));
}

function renderStylists() {
  stylistCards.innerHTML = stylists.map(stylist => {
    const active = state.selectedStylistId === stylist.id ? 'active' : '';
    return `
      <article class="stylist-card ${active}" data-id="${stylist.id}">
        <h3>${stylist.name}</h3>
        <p>${stylist.title}</p>
        <div class="status-pill ${stylist.available ? 'available' : 'off'}">
          ${stylist.available ? 'Available' : 'Not Available'}
        </div>
        <div class="price-tag">${stylist.days.join(' • ')}</div>
      </article>`;
  }).join('');
  stylistElements = [...stylistCards.querySelectorAll('.stylist-card')];
  stylistElements.forEach(card => card.addEventListener('click', () => chooseStylist(card.dataset.id)));
}

function renderFeaturedServices() {
  featuredServices.innerHTML = services.slice(0, 6).map(service => `
    <article class="service-card">
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <p>${service.duration}</p>
      <div class="price-tag">$${service.price}</div>
    </article>
  `).join('');
}

function chooseService(serviceId) {
  state.selectedServiceId = serviceId;
  renderServices(categoryFilter.value);
}

function chooseStylist(stylistId) {
  state.selectedStylistId = stylistId;
  renderStylists();
}

function showStep(step) {
  state.step = step;
  document.querySelectorAll('.wizard-step').forEach((el, index) => {
    el.classList.toggle('hidden', index !== step - 1);
  });
  backButton.disabled = step === 1;
  nextButton.textContent = step < 5 ? 'Next' : 'Review';
  wizardTitle.textContent = `Step ${step}: ${['Choose Service','Pick Stylist','Select Date & Time','Add Details','Confirm Your Booking'][step - 1]}`;
  messageBox.classList.add('hidden');
  if (step === 5) renderSummary();
}

function previousStep() {
  if (state.step > 1) showStep(state.step - 1);
}

function nextStep() {
  if (state.step === 1 && !state.selectedServiceId) {
    alert('Please select a service to continue.');
    return;
  }
  if (state.step === 2 && !state.selectedStylistId) {
    alert('Please choose a stylist to continue.');
    return;
  }
  if (state.step === 4) {
    if (!state.customerName || !state.customerPhone || !state.customerEmail) {
      alert('Please fill in all contact details.');
      return;
    }
  }
  if (state.step < 5) showStep(state.step + 1);
}

function renderSummary() {
  const service = services.find(s => s.id === state.selectedServiceId);
  const stylist = stylists.find(s => s.id === state.selectedStylistId);
  summaryService.innerHTML = service ? `<p><strong>${service.title}</strong><br>${service.description}<br>${service.duration} · $${service.price}</p>` : '<p>No service selected.</p>';
  summaryStylist.innerHTML = stylist ? `<p><strong>${stylist.name}</strong><br>${stylist.title}</p>` : '<p>No stylist selected.</p>';
  summaryAppointment.innerHTML = `<p><strong>Date:</strong> ${formatDate(state.appointmentDate)}<br><strong>Time:</strong> ${state.appointmentTime}<br><strong>Location:</strong> ${state.location}</p>`;
  summaryContact.innerHTML = `<p><strong>Name:</strong> ${state.customerName}<br><strong>Phone:</strong> ${state.customerPhone}<br><strong>Email:</strong> ${state.customerEmail}</p>`;
}

function formatDate(value) {
  if (!value) return 'n/a';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
}

function confirmBooking() {
  renderSummary();
  const existing = JSON.parse(localStorage.getItem('bdm-orders') || '[]');
  const service = services.find(s => s.id === state.selectedServiceId);
  const stylist = stylists.find(s => s.id === state.selectedStylistId);
  const order = {
    id: `ORD-${Date.now()}`,
    name: state.customerName,
    phone: state.customerPhone,
    email: state.customerEmail,
    service: service.title,
    stylist: stylist.name,
    appointmentDate: appointmentDate.value,
    appointmentTime: state.appointmentTime,
    location: state.location,
    status: 'Pending',
    amount: `$${service.price}`,
    createdAt: new Date().toISOString(),
  };
  existing.unshift(order);
  localStorage.setItem('bdm-orders', JSON.stringify(existing));
  messageBox.classList.remove('hidden');
  nextButton.disabled = true;
  backButton.disabled = true;
  confirmButton.disabled = true;
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior:'smooth' });
}

window.addEventListener('DOMContentLoaded', init);
