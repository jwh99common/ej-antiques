let rawData = null;
let charts = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/metrics-v2')
    .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
    .then(data => {
      rawData = data;
      renderDashboard();
    })
    .catch(err => {
      console.error('Error loading metrics:', err);
      document.body.innerHTML += `<p style="color: red; padding: 20px;">Error loading analytics: ${err}</p>`;
    });

  document.getElementById('dateFilter')?.addEventListener('change', renderDashboard);
  document.getElementById('countFilter')?.addEventListener('change', renderDashboard);
});

function filterByDate(data, range) {
  if (range === 'all') return data;

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dateNDaysAgo = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

  const filterFn = (dateStr) => {
    if (!dateStr) return false;
    const date = typeof dateStr === 'string' ? dateStr.slice(0, 10) : dateStr;
    switch (range) {
      case 'today': return date === todayStr;
      case 'yesterday': return date === yesterdayStr;
      case 'last7': return date >= dateNDaysAgo(6);
      case 'last30': return date >= dateNDaysAgo(29);
      default: return true;
    }
  };

  return {
    topProducts: data.topProducts?.filter(p => filterFn(p.date)) || data.topProducts || [],
    topPages: data.topPages || [],
    dailyTrends: data.dailyTrends?.filter(t => filterFn(t.date)) || data.dailyTrends || [],
    byDevice: data.byDevice || [],
    topReferrers: data.topReferrers || [],
    avgTimeOnPage: data.avgTimeOnPage || []
  };
}

function clearCharts() {
  charts.forEach(c => {
    try { c.destroy(); } catch (e) {}
  });
  charts = [];
}

function renderDashboard() {
  if (!rawData) return;

  const dateRange = document.getElementById('dateFilter').value;
  const count = document.getElementById('countFilter').value;
  const filtered = filterByDate(rawData, dateRange);
  clearCharts();

  const limit = count === 'all' ? Infinity : parseInt(count, 10);

  // Render KPIs
  renderKPIs(rawData.overview);

  // Top Pages
  const topPages = filtered.topPages.slice(0, limit);
  renderList('topPages', topPages, p => 
    `<strong>${p.url}</strong> — ${p.views} views, ${p.bounces || 0} bounces`
  );
  renderChart('pagesChart', topPages, 
    p => p.url?.split('/').pop() || '/', 
    p => p.views, 
    'Pageviews', 
    '#3498db',
    'Page'
  );

  // Top Products
  const topProducts = filtered.topProducts.slice(0, limit);
  renderList('topProducts', topProducts, p => 
    `<strong>${p.product || 'N/A'}</strong> — ${p.views} views, ${p.addToCarts} adds, ${p.conversionRate || 0}% conversion`
  );
  renderChart('productsChart', topProducts, 
    p => p.product || 'N/A', 
    p => p.views, 
    'Product Views', 
    '#59a14f',
    'Pageviews'
  );

  // Daily Trends
  const trends = filtered.dailyTrends.slice(0, limit);
  renderChart('trendsChart', trends,
    t => t.date,
    t => t.pageviews,
    'Pageviews',
    '#4e79a7',
    'Daily Pageviews'
  );

  // By Device
  const devices = filtered.byDevice.slice(0, limit);
  renderChart('deviceChart', devices,
    d => d.device,
    d => d.views,
    'Views',
    ['#3498db', '#e74c3c', '#f39c12'],
    'Device'
  );

  // Top Referrers
  const referrers = filtered.topReferrers?.slice(0, limit) || [];
  renderChart('referrersChart', referrers,
    r => r.referrer?.split('/').pop() || 'Direct',
    r => r.views,
    'Views',
    '#e67e22',
    'Referrer'
  );

  // Avg Time On Page
  const timeOnPage = filtered.avgTimeOnPage?.slice(0, limit) || [];
  renderList('avgTimeOnPage', timeOnPage, t => 
    `<strong>${t.url?.split('/').pop() || '/'}</strong> — ${t.avgSeconds}s avg, ${t.visits} visits`
  );
}

function renderKPIs(overview) {
  const kpisEl = document.getElementById('kpis');
  if (!kpisEl) return;

  const kpis = [
    { label: 'Total Pageviews', value: overview.totalPageviews.toLocaleString() },
    { label: 'Unique Sessions', value: overview.uniqueSessions.toLocaleString() },
    { label: 'Bounce Rate', value: `${overview.bounceRate || 0}%` },
    { label: 'Avg Session Duration', value: `${overview.avgSessionDuration || 0}s` },
    { label: 'Countries', value: overview.uniqueCountries || 0 }
  ];

  kpisEl.innerHTML = kpis.map(kpi => `
    <div class="kpi">
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
    </div>
  `).join('');
}

function renderList(id, items, formatter) {
  const el = document.getElementById(id);
  if (!el || !Array.isArray(items)) return;

  el.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = formatter(item);
    el.appendChild(li);
  });
}

function renderChart(id, items, labelFn, valueFn, label, color, chartLabel) {
  const el = document.getElementById(id);
  if (!el || items.length === 0) return;

  const labels = items.map(labelFn);
  const values = items.map(valueFn);
  const colors = Array.isArray(color) 
    ? color.slice(0, labels.length)
    : Array(labels.length).fill(color);

  charts.push(new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: chartLabel || label,
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c + '99'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: labels.length > 5 ? 'y' : 'x',
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  }));
}
