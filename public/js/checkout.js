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
    localStorage.removeItem('bensBikesCart');
    window.location.href = '/thank-you.html'; // optional
  } else {
    alert("Something went wrong. Please try again.");
  }
});
