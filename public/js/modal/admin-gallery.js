document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('galleryForm');
  const status = document.getElementById('status');
  const addNewBtn = document.getElementById('addNewBtn');
  const tableBody = document.querySelector('#galleryTable tbody');

  loadGallery();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = getFormData(form);
    const method = payload.id ? 'PUT' : 'POST';
    const endpoint = payload.id ? `/api/gallery/${payload.id}` : '/api/admin-gallery';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      status.textContent = `✅ Image ${payload.id ? 'updated' : 'posted'}: ${payload.title}`;
      form.reset();
      form.id.value = '';
      loadGallery();
    } else {
      status.textContent = `❌ Failed to ${payload.id ? 'update' : 'post'} image.`;
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
      description: form.description.value.trim(),
      long_description: form.long_description.value.trim()
    };
  }

  async function loadGallery() {
    const res = await fetch('/api/gallery');
    const items = await res.json();
    tableBody.innerHTML = '';

    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>£${(item.price / 100).toFixed(2)}</td>
        <td>${item.category}</td>
        <td>${item.image}</td>
        <td>${item.description}</td>
        <td></td>
      `;

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', () => editGalleryItem(item.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.addEventListener('click', () => deleteGalleryItem(item.id));

      tr.lastElementChild.appendChild(editBtn);
      tr.lastElementChild.appendChild(deleteBtn);
      tableBody.appendChild(tr);
    });
  }

  window.editGalleryItem = async function(id) {
    const res = await fetch(`/api/gallery/${id}`);
    const item = await res.json();
    form.id.value = item.id;
    form.title.value = item.title;
    form.price.value = item.price;
    form.category.value = item.category;
    form.image.value = item.image;
    form.description.value = item.description;
    form.long_description.value = item.long_description;
    status.textContent = `✏️ Editing image: ${item.title}`;
  };

  window.deleteGalleryItem = async function(id) {
    if (!confirm("Delete this image?")) return;
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      status.textContent = `🗑️ Image deleted`;
      loadGallery();
    } else {
      status.textContent = `❌ Failed to delete image.`;
    }
  };
});
