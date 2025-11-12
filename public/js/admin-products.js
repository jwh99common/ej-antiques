document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('productForm');
  const status = document.getElementById('status');
  const addNewBtn = document.getElementById('addNewBtn');
  const tableBody = document.querySelector('#productsTable tbody');

  loadProducts();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

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
    return {
      id: form.id.value || null,
      title: form.title.value.trim(),
      price: parseInt(form.price.value, 10),
      category: form.category.value.trim(),
      image: form.image.value.trim(),
      images: form.images.value.trim(),
      description: form.description.value.trim(),
      longDescription: form.longDescription.value.trim()
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
        <td>£${(product.price / 100).toFixed(2)}</td>
        <td>${product.category}</td>
        <td>${product.image}</td>
        <td>${product.description}</td>
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
