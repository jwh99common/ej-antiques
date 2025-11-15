import { updateCartCount } from './cart.js';

fetch('/partials/ej-nav.html')
  .then(res => res.text())
  .then(html => {
    document.querySelector('#nav-placeholder').innerHTML = html;

    // ✅ Dispatch navReady so main.js can wire up the cart toggle
    document.dispatchEvent(new Event('navReady'));

    // ✅ Update cart count after nav is injected
    updateCartCount();
  });
