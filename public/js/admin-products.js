document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('productForm');
  const status = document.getElementById('status');
  const addNewBtn = document.getElementById('addNewBtn');
  const tableBody = document.querySelector('#productsTable tbody');

  loadProducts();

  // Then add this:
  const titleInput = form.title;
  const slugInput = form.slug;

  titleInput.addEventListener('input', () => {
    const slug = titleInput.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    slugInput.value = slug;
  });
  
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // ✅ Ensure slug is set before collecting form data
  if (!form.slug.value.trim()) {
    const slug = form.title.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    form.slug.value = slug;
  }

  const payload = getFormData(form);
  const method = payload.id ? 'PUT' : 'POST';
  const endpoint = payload.id ? `/api/products/${payload.id}` : '/api/admin-products';

  const res = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    status.textContent = `✅ Product ${payload.id ? 'updated' : 'posted'}: ${payload.title}`;
    form.reset();
    form.id.value = '';
    loadProducts();
  } else {
    status.textContent = `❌ Failed to ${payload.id ? 'update' : 'post'} product.`;
  }
});


  addNewBtn.addEventListener('click', () => {
    form.reset();
    form.id.value = '';
    status.textContent = '';
  });

function getFormData(form) {
  const title = form.title.value.trim();
  const rawSlug = form.slug.value.trim();


  const slug = rawSlug || title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    id: form.id.value || null,
    title,
    price: parseInt(form.price.value, 10),
    category: form.category.value.trim(),
    image: form.image.value.trim(),
    images: form.images.value.trim(),
    description: form.description.value.trim(),
    longDescription: form.longDescription.value.trim(),
    status: form.status.value,
    slug, // ✅ now guaranteed to be generated if blank
    quantity: parseInt(form.quantity.value, 10),
    is_published: form.is_published.value === 'true',
    is_sold: form.is_sold.value === 'true',
    sold_at: form.sold_at.value || null,
    background: form.background.value.trim(),
  };
}




async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  tableBody.innerHTML = '';

  products.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.title}</td>
      <td>${product.slug}</td> <!-- ✅ New slug column -->
      <td>£${(product.price).toFixed(2)}</td>
      <td>${product.category}</td>
      <td>${product.image}</td>
      <td>${product.description}</td>
      <td>${product.status || ''}</td>
      <td>${product.is_published ? '✅' : '❌'}</td>
      <td>${product.is_sold ? '✅' : '❌'}</td>
      <td>${product.quantity ?? 1}</td>
      <td>${product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}</td>
      <td>
        <button onclick="editProduct(${product.id})">✏️</button>
        <button onclick="deleteProduct(${product.id})">🗑️</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

window.editProduct = async function(id) {
  const res = await fetch(`/api/products/${id}`);
  const product = await res.json();

  form.id.value = product.id;
  form.title.value = product.title;
  form.price.value = product.price;
  form.category.value = product.category;
  form.image.value = product.image;
  form.images.value = product.images;
  form.description.value = product.description;
  form.longDescription.value = product.longDescription;
  form.background.value = product.background;

  // ✅ New fields
  form.status.value = product.status || 'active';
  form.slug.value = product.slug || '';
  form.quantity.value = product.quantity ?? 1;
  form.is_published.value = product.is_published ? 'true' : 'false';
  form.is_sold.value = product.is_sold ? 'true' : 'false';

  // Format sold_at for datetime-local input
  form.sold_at.value = product.sold_at
    ? new Date(product.sold_at).toISOString().slice(0, 16)
    : '';

  // Read-only created_at
  form.created_at.value = product.created_at || '';

  status.textContent = `✏️ Editing product: ${product.title}`;
};

  window.deleteProduct = async function(id) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      status.textContent = `🗑️ Product deleted`;
      loadProducts();
    } else {
      status.textContent = `❌ Failed to delete product.`;
    }
  };
});
