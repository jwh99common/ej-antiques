// main.js

import { loadGallery, renderGallery, setupFilters } from './gallery.js';
import { setupModal, openModal } from './modal.js';
import { addToCart, updateCartCount, renderCartPanel, wireCheckoutButton } from './cart.js';

document.addEventListener('DOMContentLoaded', async () => {
  const type = document.body.dataset.type || 'products';

    setupCart(); // Always wire cart


  const galleryEl = document.getElementById('gallery');
  if (galleryEl) {
    const items = await loadGallery(type);
    renderGallery(items, type);
    setupFilters(items, type);
    setupModal();
    setupModalTriggers(items);
  }
  setupAddToCart(); // ✅ For static buttons (e.g. [slug], About)

});


// Core cart setup logic
function setupCart() {
  updateCartCount();
  renderCartPanel();
  wireCheckoutButton();

  const cartPanel = document.getElementById('cartPanel');
  const toggleBtn = document.getElementById('cartToggleBtn');
  const closeBtn = document.getElementById('closeCartBtn');

  if (toggleBtn && cartPanel) {
    toggleBtn.addEventListener('click', () => {
      cartPanel.classList.toggle('hidden');
      renderCartPanel();
    });
  }

  if (closeBtn && cartPanel) {
    closeBtn.addEventListener('click', () => {
      cartPanel.classList.add('hidden');
    });
  }
}

// Bind add-to-cart buttons
export function setupAddToCart() {
  const buttons = document.querySelectorAll('.add-to-cart');

  buttons.forEach(btn => {
    console.log('🛠️ Binding button:', btn.dataset.title);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('🛒 Clicked:', btn.dataset.title);
      const item = {
        id: parseInt(btn.dataset.id),
        title: btn.dataset.title,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image,
        type: btn.dataset.type
      };
      addToCart(item);
      updateCartCount();
      renderCartPanel();
    });
  });
}

// Bind modal triggers on gallery cards
function setupModalTriggers(items) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  gallery.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) return;
    const card = e.target.closest('.product-card');
    if (card && card.dataset.id) {
      const id = parseInt(card.dataset.id);
      const item = items.find(i => i.id === id);
      if (item) openModal(item);
    }
  });
}

// Re-run cart setup after nav is injected
document.addEventListener('navReady', () => {
  console.log('🧭 navReady received — re-running setupCart');
  setupCart();
});

// Fallback: if nav already injected before main.js loaded
if (document.getElementById('cartToggleBtn')) {
  console.log('🧭 nav already present — running setupCart immediately');
  setupCart();
}
