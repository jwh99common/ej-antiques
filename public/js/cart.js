const CART_KEY = 'ejAntiquesCart';


export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(c => c.id === item.id && c.type === item.type);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  saveCart(cart);
  updateCartUI();
}

export function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const cart = getCart();
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export function updateCartUI() {
  const cart = getCart();
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;

  cartItems.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-thumb" />
        <div class="cart-details">
          <strong>${item.title}</strong><br>
          £${item.price} × ${item.quantity} = <strong>£${item.price * item.quantity}</strong><br>
          <em>${item.type}</em><br>
          <button class="remove-btn" data-id="${item.id}" data-type="${item.type}">Remove</button>
        </div>
      </div>
    `;
    cartItems.appendChild(li);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiv = document.createElement('div');
  totalDiv.className = 'cart-total';
  totalDiv.innerHTML = `<strong>Total:</strong> £${total.toFixed(2)}`;
  cartItems.appendChild(totalDiv);

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const type = btn.dataset.type;
      const index = cart.findIndex(i => i.id === id && i.type === type);
      if (index !== -1) {
        cart.splice(index, 1);
        saveCart(cart);
        updateCartUI();
        updateCartCount();
      }
    });
  });
}

export function renderCartPanel() {
  updateCartUI();
  updateCartCount();
}

export function wireCheckoutButton() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.location.href = '/checkout/';
    });
  }
}
