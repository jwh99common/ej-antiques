import { loadGallery, renderGallery, setupFilters } from './gallery.js';
import { setupModal, openModal } from './modal.js';
import { addToCart, updateCartCount, renderCartPanel, wireCheckoutButton } from './cart.js';

document.addEventListener('DOMContentLoaded', async () => {
  const type = document.body.dataset.type || 'products';

  // ✅ Debug: confirm JS execution and hostname
  // console.log("Main.js loaded:", location.hostname);
  
  //console.log("🚀 Cache bust test at", new Date().toISOString());

  //console.log ("FFS");
  
  // document.body.insertAdjacentHTML('beforeend', `
  //  <div style="background:#f00; color:#fff; padding:0.5rem; font-size:0.8rem;">
  //    JS executed on: ${location.hostname}
  //  </div>
  //`);

  //
  //
  // Always run cart setup
  setupCart();

  // Only run gallery logic if #gallery exists
  const galleryEl = document.getElementById('gallery');
  if (galleryEl) {
    const items = await loadGallery(type);
    //console.log("Loaded gallery items:", items);
    renderGallery(items, type);
    setupFilters(items, type);
    setupModal();
    setupAddToCart(items);
    setupModalTriggers(items);
  }
});

function setupCart() {
  updateCartCount();
  renderCartPanel();
  wireCheckoutButton(); 
  
  const toggleBtn = document.getElementById('cartToggleBtn');
  const cartPanel = document.getElementById('cartPanel');

  if (toggleBtn && cartPanel) {
    toggleBtn.addEventListener('click', () => {
      cartPanel.classList.toggle('hidden');
      renderCartPanel();
    });
  }
}

function setupAddToCart(items) {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
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
