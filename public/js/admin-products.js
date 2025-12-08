document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('productForm');
  const status = document.getElementById('status');
  const addNewBtn = document.getElementById('addNewBtn');
  const tableBody = document.querySelector('#productsTable tbody');

  const titleInput = form.title;
  const slugInput = form.slug;
  const imageInput = form.image;
  const imagesInput = form.images;

  // Auto-generate slug from title
  titleInput.addEventListener('input', () => {
    slugInput.value = generateSlug(titleInput.value);
  });

  // Auto-generate images array from image path
  imageInput.addEventListener('input', () => {
    const base = imageInput.value.trim();
    const match = base.match(/^(.*\/image-)(\d+)(\.\w{3,4})$/i);
    if (match) {
      const [, prefix, , ext] = match;
      const images = Array.from({ length: 4 }, (_, i) => `${prefix}${i + 1}${ext}`);
      imagesInput.value = JSON.stringify(images);
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ensure slug is set
    if (!form.slug.value.trim()) {
      form.slug.value = generateSlug(form.title.value);
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

  // Reset form for new product
  addNewBtn.addEventListener('click', () => {
    form.reset();
    form.id.value = '';
    status.textContent = '';
  });

  // Load products into table
  async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
    tableBody.innerHTML = '';

    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${product.title}</td>
        <td>${product.slug}</td>
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

  // Populate form for editing
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
    form.status.value = product.status || 'active';
    form.slug.value = product.slug || '';
    form.quantity.value = product.quantity ?? 1;
    form.is_published.value = product.is_published ? 'true' : 'false';
    form.is_sold.value = product.is_sold ? 'true' : 'false';
    form.sold_at.value = product.sold_at
      ? new Date(product.sold_at).toISOString().slice(0, 16)
      : '';
    form.created_at.value = product.created_at || '';

    status.textContent = `✏️ Editing product: ${product.title}`;
  };

  // Delete product
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

  // Helpers
  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function getFormData(form) {
    const title = form.title.value.trim();
    const rawSlug = form.slug.value.trim();
    const slug = rawSlug || generateSlug(title);

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
      slug,
      quantity: parseInt(form.quantity.value, 10),
      is_published: form.is_published.value === 'true',
      is_sold: form.is_sold.value === 'true',
      sold_at: form.sold_at.value || null,
      background: form.background.value.trim(),
    };
  }

  // Initial load
  loadProducts();
});
