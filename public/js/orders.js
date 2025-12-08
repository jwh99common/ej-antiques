async function loadOrders() {
  const res = await fetch('/api/orders');
  const orders = await res.json();

  const pending = document.getElementById('pending-orders');
  const processed = document.getElementById('processed-orders');
  const closed = document.getElementById('closed-orders');

  // Clear existing content
  pending.innerHTML = '';
  processed.innerHTML = '';
  closed.innerHTML = '';

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <h3>Order #${order.id} — ${order.status}</h3>
      <p><strong>${order.name}</strong> (${order.email})</p>
      <p>Phone: ${order.phone || '—'}</p>
      <p>Address: ${order.address || '—'}</p>
      <p>Notes: ${order.notes || '—'}</p>


      <ul>
        ${JSON.parse(order.cart).map(item => `
          <li>${item.title} × ${item.quantity} — £${item.price}</li>
        `).join('')}
      </ul>
      ${order.status === 'pending' ? `<button data-id="${order.id}" data-status="processed">Mark as processed</button>` : ''}
      ${order.status === 'processed' ? `<button data-id="${order.id}" data-status="closed">Mark as closed</button>` : ''}
    `;

    if (order.status === 'pending') {
      pending.appendChild(card);
    } else if (order.status === 'processed') {
      processed.appendChild(card);
    } else if (order.status === 'closed') {
      closed.appendChild(card);
    }
  });

  // Wire up status change buttons
  document.querySelectorAll('button[data-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const status = btn.dataset.status;
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      loadOrders(); // Refresh after update
    });
  });
}

loadOrders();
