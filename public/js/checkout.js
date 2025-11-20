import { getCart } from './cart.js';

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cart = getCart();
  const formData = new FormData(e.target);

  const payload = {
    cart,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone')
  };

  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    alert("Thanks for your order! We'll be in touch.");
    localStorage.removeItem('ejAntiquesCart');
    window.location.href = '/products/index.html'; // optional
  } else {
    alert("Something went wrong. Please try again.");
  }
});



function renderOrderSummary() {
  const cart = getCart();
  const listEl = document.getElementById('order-items');
  const totalEl = document.getElementById('order-total');

  if (!listEl || !totalEl || !Array.isArray(cart)) return;

  listEl.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const quantity = item.quantity || 1;
    const unitPrice = item.price || 0;
    const lineTotal = unitPrice * quantity;
    total += lineTotal;

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="order-line">
        <img src="${item.image}" alt="${item.title}" class="order-thumb" />
        <span class="order-details">
          <strong>${item.title}</strong><br>
          £${unitPrice.toFixed(2)} × ${quantity} = <strong>£${lineTotal.toFixed(2)}</strong>
        </span>
      </div>
    `;
    listEl.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
  renderOrderSummary();

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cart = getCart();
      const formData = new FormData(form);

      const payload = {
        cart,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Thanks for your order! We'll be in touch.");
        localStorage.removeItem('ejAntiquesCart');
        window.location.href = '/products/index.html';
      } else {
        alert("Something went wrong. Please try again.");
      }
    });
  }
});
