import { updateCartCount } from '/js/cart.js';

fetch('/partials/ej-nav.html')
  .then(res => res.text())
  .then(html => {
    // Inject the nav HTML
    document.querySelector('#nav-placeholder').innerHTML = html;

    // Dispatch custom event so other scripts can hook in
    document.dispatchEvent(new Event('navReady'));

    // Update cart count after nav is injected
    updateCartCount();

    // ✅ Hamburger toggle logic (must be inside this block)
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');

    if (hamburger && nav) {
      hamburger.addEventListener('click', () => {
        nav.classList.toggle('show');
        const expanded = nav.classList.contains('show');
        hamburger.setAttribute('aria-expanded', expanded);
      });
    }
  });
