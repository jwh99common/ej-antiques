let rawData = null;
let charts = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/metrics')
    .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
    .then(data => {
      rawData = data;
      const dateRange = document.getElementById('dateFilter').value;
      const count = document.getElementById('countFilter').value;
      renderDashboard(dateRange, count);
    })
    .catch(err => console.error('Error loading metrics:', err));

  document.getElementById('dateFilter')?.addEventListener('change', () => {
    const dateRange = document.getElementById('dateFilter').value;
    const count = document.getElementById('countFilter').value;
    renderDashboard(dateRange, count);
  });

  document.getElementById('countFilter')?.addEventListener('change', () => {
    const dateRange = document.getElementById('dateFilter').value;
    const count = document.getElementById('countFilter').value;
    renderDashboard(dateRange, count);
  });
});

function filterByDate(data, range) {
  if (range === 'all') return data;

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dateNDaysAgo = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

  const filterFn = (ts) => {
    if (!ts) return false;
    const date = ts.slice(0, 10);
    switch (range) {
      case 'today': return date === todayStr;
      case 'yesterday': return date === yesterdayStr;
      case 'last7': return date >= dateNDaysAgo(6);
      case 'last30': return date >= dateNDaysAgo(29);
      default: return true;
    }
  };

  return {
    topPages: data.topPages?.filter(p => filterFn(p.timestamp)) || [],
    topReferrers: data.topReferrers?.filter(r => filterFn(r.timestamp)) || [],
    productViews: data.productViews?.filter(v => filterFn(v.timestamp)) || [],
    modalViewsByProduct: data.modalViewsByProduct?.filter(m => filterFn(m.timestamp)) || [],
    viewsByDay: data.viewsByDay || []
  };
}

function clearCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function renderDashboard(dateRange = 'all', count = 5) {
  const filtered = filterByDate(rawData, dateRange);
  clearCharts();

  const limit = count === 'all' ? Infinity : parseInt(count, 10);

  // Top Pages
  const topPagesMap = {};
  filtered.topPages.forEach(p => {
    if (!p.url) return;
    topPagesMap[p.url] = (topPagesMap[p.url] || 0) + 1;
  });
  const topPages = Object.entries(topPagesMap)
    .map(([url, views]) => ({ url, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  // Top Referrers
  const refMap = {};
  filtered.topReferrers.forEach(r => {
    if (!r.referrer) return;
    refMap[r.referrer] = (refMap[r.referrer] || 0) + 1;
  });
  const topReferrers = Object.entries(refMap)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // Modal Views by Product
  const modalMap = {};
  filtered.modalViewsByProduct.forEach(m => {
    const title = m.title?.trim();
    if (!title) return;
    modalMap[title] = (modalMap[title] || 0) + 1;
  });
  const modalViewsByProduct = Object.entries(modalMap)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // Product Views
  const viewCounts = {};
  filtered.productViews.forEach(v => {
    viewCounts[v.event_type] = (viewCounts[v.event_type] || 0) + 1;
  });
  const productViews = Object.entries(viewCounts).map(([event_type, count]) => ({ event_type, count }));

  // Render
  renderOverview({ topPages, productViews: filtered.productViews });
  renderList('topPages', topPages, p => `${p.url} — ${p.views} views`);
  renderList('topReferrers', topReferrers, r => `${r.referrer} — ${r.count} hits`);
  renderChart('pagesChart', topPages, p => p.url, p => p.views, 'Pageviews', '#4e79a7');
  renderChart('referrersChart', topReferrers, r => r.referrer, r => r.count, 'Referrals', '#f28e2b');
  renderChart('productsViewsChart', productViews, v => v.event_type === 'productModalView' ? 'Modal Views' : 'Page Views', v => v.count, 'Views', ['#59a14f', '#edc948']);
  renderChart('modalViewsChart', modalViewsByProduct, p => p.title, p => p.count, 'Modal Views by Product', '#76b7b2');
}


function renderOverview(data) {
  const pageviews = data.topPages.reduce((sum, p) => sum + (p.views || 0), 0);
  const sessions = new Set(data.productViews.map(v => v.session_id)).size;

  const pageviewsEl = document.getElementById('pageviews');
  const sessionsEl = document.getElementById('sessions');
  if (pageviewsEl) pageviewsEl.textContent = pageviews;
  if (sessionsEl) sessionsEl.textContent = sessions;
}

function renderList(id, items, formatter) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(items)) return;

  el.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = formatter(item);
    el.appendChild(li);
  });
}

function renderChart(id, items, labelFn, valueFn, label, color) {
  const el = document.getElementById(id);
  if (!el || items.length === 0) return;

  const labels = items.map(labelFn);
  const values = items.map(valueFn);

  charts.push(new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: Array.isArray(color) ? color : Array(labels.length).fill(color)
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, title: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  }));
}
