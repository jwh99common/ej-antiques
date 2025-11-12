document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('serviceForm');
  const status = document.getElementById('status');
  const addNewBtn = document.getElementById('addNewBtn');
  const tableBody = document.querySelector('#servicesTable tbody');

  loadServices();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = getFormData(form);
    const method = payload.id ? 'PUT' : 'POST';
    const endpoint = payload.id ? `/api/services/${payload.id}` : '/api/admin-services';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      status.textContent = `✅ Service ${payload.id ? 'updated' : 'posted'}: ${payload.title}`;
      form.reset();
      form.id.value = '';
      loadServices();
    } else {
      status.textContent = `❌ Failed to ${payload.id ? 'update' : 'post'} service.`;
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

  async function loadServices() {
    const res = await fetch('/api/services');
    const services = await res.json();
    tableBody.innerHTML = '';

    services.forEach(service => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${service.title}</td>
        <td>£${(service.price / 100).toFixed(2)}</td>
        <td>${service.category}</td>
        <td>${service.image}</td>
        <td>${service.description}</td>
        <td>
          <button onclick="editService(${service.id})">✏️</button>
          <button onclick="deleteService(${service.id})">🗑️</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  window.editService = async function(id) {
    const res = await fetch(`/api/services/${id}`);
    const service = await res.json();
    form.id.value = service.id;
    form.title.value = service.title;
    form.price.value = service.price;
    form.category.value = service.category;
    form.image.value = service.image;
    form.description.value = service.description;
    form.long_description.value = service.long_description;
    status.textContent = `✏️ Editing service: ${service.title}`;
  };

  window.deleteService = async function(id) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (res.ok) {
      status.textContent = `🗑️ Service deleted`;
      loadServices();
    } else {
      status.textContent = `❌ Failed to delete service.`;
    }
  };
});
