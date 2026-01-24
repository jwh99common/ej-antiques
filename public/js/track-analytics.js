import { trackEvent } from '/js/track.js';

// Track initial pageview
trackEvent('pageview');

// Track time-on-page before leaving
let pageStartTime = Date.now();

window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000); // in seconds
  if (timeOnPage > 1) { // Only track if spent >1s
    trackEvent('time_on_page', { seconds: timeOnPage, url: window.location.pathname });
  }
});

// Track product clicks
document.addEventListener('click', (e) => {
  const productCard = e.target.closest('.product-card');
  if (productCard) {
    const productId = productCard.dataset.id;
    const productTitle = productCard.dataset.title || 'Unknown';
    trackEvent('product_view', { productId, productTitle });
  }
});

// Track add-to-cart
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const productId = e.target.dataset.id;
    const productTitle = e.target.dataset.title || 'Unknown';
    const price = e.target.dataset.price || 0;
    trackEvent('add_to_cart', { productId, productTitle, price });
  }
});
