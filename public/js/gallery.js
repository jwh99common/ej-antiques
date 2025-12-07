// gallery.js

import {
  formatProduct,
  formatSoldProduct,
  formatService,
  formatMerchandise,
  formatBlog,
  formatGallery
} from './formatters.js';

let currentCategory = 'all';

const formatterMap = {
  products: formatProduct,
  soldproducts: formatSoldProduct,
  services: formatService,
  merchandise: formatMerchandise,
  blogs: formatBlog,
  gallery: formatGallery
};

export async function loadGallery(type = 'products') {
  try {
    const response = await fetch(`/api/products`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Failed to load products`);
    const items = await response.json();
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.error(`❌ Error loading products:`, err);
    return [];
  }
}


export function renderGallery(items, type = 'products') {
  const gallery = document.getElementById('gallery');
  const format = formatterMap[type] || formatProduct;

  const filtered = items
    .filter(item => {
      if (type === 'products') {
        return item.is_published && !item.is_sold;
      }
      if (type === 'soldproducts') {
        return item.is_published && item.is_sold;
      }
      return true;
    })
    .filter(item => currentCategory === 'all' || item.category === currentCategory);

  gallery.innerHTML = filtered.map(item => `
    <div class="product-card"
        data-id="${item.id}"
        data-type="${type}"
        data-slug="${item.slug}">
      ${format(item)}
    </div>
  `).join('');
}

document.getElementById('gallery').addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  const isButton = e.target.closest('button');

  if (card && !isButton) {
    const slug = card.dataset.slug;
    if (slug) {
      window.location.href = `/product-slug/${slug}`;
    }
  }
});



export function setupFilters(items, type) {
  const filterBar = document.getElementById('categoryFilters');
  if (!filterBar) return;

  const categories = [...new Set(items.map(i => i.category))];
  filterBar.innerHTML = `<button class="filter-btn active" data-category="all">All</button>` +
    categories.map(cat => `<button class="filter-btn" data-category="${cat}">${cat}</button>`).join('');

  filterBar.addEventListener('click', e => {
    if (!e.target.classList.contains('filter-btn')) return;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderGallery(items, type);
  });
}
