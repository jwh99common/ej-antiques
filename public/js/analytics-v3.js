// analytics-v3.js
// Consolidated analytics dashboard JS — resilient, modular, small footprint.
let RAW = null;
let CHARTS = [];

const DEFAULT_ENDPOINT = '/api/metrics-v3';

document.addEventListener('DOMContentLoaded', () => {
  const endpoint = DEFAULT_ENDPOINT;
  fetch(endpoint)
    .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
    .then(data => { RAW = data; initControls(); renderAll(); })
    .catch(err => {
      console.error('Analytics v3 load error:', err);
      const p = document.createElement('p');
      p.style.color = 'crimson';
      p.style.padding = '12px';
      p.textContent = `Error loading analytics: ${err}`;
      document.querySelector('.dashboard-wrapper')?.appendChild(p);
    });
});

function initControls() {
  ['dateFilter','countFilter','sourceFilter'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderAll);
  });
}

function safeGet(fn, fallback) {
  try { return fn(); } catch (e) { return fallback; }
}

function filterData(range) {
  if (!RAW) return {};
  if (range === 'all') return RAW;
  const dateN = n => new Date(Date.now() - n*86400000).toISOString().slice(0,10);
  const isInRange = ts => {
    if (!ts) return false;
    const d = (typeof ts === 'string') ? ts.slice(0,10) : String(ts).slice(0,10);
    switch(range) {
      case 'today': return d === new Date().toISOString().slice(0,10);
      case 'yesterday': return d === dateN(1);
      case 'last7': return d >= dateN(6);
      case 'last30': return d >= dateN(29);
      default: return true;
    }
  };

  // Attempt to map common shapes between v1/v2
  const out = Object.assign({}, RAW);
  out.topPages = (RAW.topPages || RAW.top_pages || []).filter(p => isInRange(p.date || p.timestamp));
  out.topProducts = (RAW.topProducts || RAW.top_products || RAW.productPageViews || []).filter(p => isInRange(p.date || p.timestamp));
  out.dailyTrends = (RAW.dailyTrends || RAW.viewsByDay || []).filter(t => isInRange(t.date || t.timestamp));
  out.byDevice = RAW.byDevice || RAW.devices || [];
  out.topReferrers = RAW.topReferrers || RAW.top_referrers || [];
  out.avgTimeOnPage = RAW.avgTimeOnPage || RAW.avg_time || [];
  return out;
}

function clearCharts() {
  CHARTS.forEach(c => { try { c.destroy(); } catch(e) {} }); CHARTS = [];
}

function renderAll() {
  clearCharts();
  if (!RAW) return;
  const range = document.getElementById('dateFilter')?.value || 'all';
  const countRaw = document.getElementById('countFilter')?.value || '5';
  const count = countRaw === 'all' ? Infinity : parseInt(countRaw,10);
  const data = filterData(range);

  renderKPIs(safeGet(()=>RAW.overview, {}));

  // Funnel & retention
  renderFunnel(safeGet(()=>RAW.funnel, {}));
  renderRetention(safeGet(()=>RAW.retention, {}));

  renderList('topPages', (data.topPages||[]).slice(0,count), p => `<strong>${p.url||p.path||p.label||'/'}</strong> — ${p.views||p.count||1} views`);
  renderBar('pagesChart', (data.topPages||[]).slice(0,count), i=>i.url||i.path||i.label, i=>i.views||i.count||0, 'Pageviews', '#3498db');

  renderList('topProducts', (data.topProducts||[]).slice(0,count), p => `<strong>${p.product||p.slug||p.label||'N/A'}</strong> — ${p.views||p.count||0} views`);
  renderBar('productsChart', (data.topProducts||[]).slice(0,count), i=>i.product||i.slug||i.label, i=>i.views||i.count||0, 'Product Views', '#59a14f');

  renderBar('referrersChart', (data.topReferrers||[]).slice(0,count), i=>i.referrer||i.label||'Direct', i=>i.views||i.count||0, 'Referrers', '#e67e22');

  renderBar('trendsChart', (data.dailyTrends||[]).slice(0,100), d=>d.date||d.day, d=>d.pageviews||d.views||0, 'Daily', '#4e79a7');

  renderBar('deviceChart', (data.byDevice||[]), d=>d.device||d.label||'Unknown', d=>d.views||d.count||0, 'Devices', ['#3498db','#e74c3c','#f39c12']);

  renderList('avgTimeOnPage', (data.avgTimeOnPage||[]).slice(0,count), t => `<strong>${t.url||t.path||t.label||'/'}</strong> — ${t.avgSeconds||t.avg||0}s avg, ${t.visits||t.count||0} visits`);
}

function renderKPIs(overview) {
  const el = document.getElementById('kpis'); if (!el) return;
  const k = [
    {label:'Pageviews', value: overview.totalPageviews || overview.pageviews || 0},
    {label:'Sessions', value: overview.uniqueSessions || overview.sessions || 0},
    {label:'Bounce Rate', value: overview.bounceRate ? overview.bounceRate + '%' : 'N/A'},
    {label:'Avg Session', value: overview.avgSessionDuration ? overview.avgSessionDuration + 's' : 'N/A'}
  ];
  el.innerHTML = k.map(item => `<div class="kpi"><div class="kpi-label">${item.label}</div><div class="kpi-value">${item.value}</div></div>`).join('');
}

function renderList(id, items, fmt) {
  const el = document.getElementById(id); if (!el) return; el.innerHTML = '';
  items.forEach(it => { const li = document.createElement('li'); li.innerHTML = fmt(it); el.appendChild(li); });
}

function renderFunnel(f) {
  const el = document.getElementById('funnelSummary'); if (!el) return;
  const total = f.totalSessions || 0;
  const pv = f.productViewSessions || 0;
  const atc = f.addToCartSessions || 0;
  const co = f.checkoutSessions || 0;
  el.innerHTML = `
    <div class="funnel-kpis">
      <div><strong>Total sessions:</strong> ${total}</div>
      <div><strong>Product views:</strong> ${pv}</div>
      <div><strong>Add to cart:</strong> ${atc} (${f.pvToAtcRate || 0}%)</div>
      <div><strong>Checkouts:</strong> ${co} (${f.atcToCheckoutRate || 0}% of ATC, ${f.pvToCheckoutRate || 0}% of PV)</div>
    </div>
  `;
}

function renderRetention(r) {
  const el = document.getElementById('retentionSummary'); if (!el) return;
  const list = document.getElementById('retentionList'); if (list) list.innerHTML = '';
  const newVis = r.newVisitors || 0;
  const retained = r.retained || 0;
  const rate = (typeof r.retentionRate !== 'undefined') ? r.retentionRate : (newVis ? Math.round(retained*1000/newVis)/10 : 0);
  el.innerHTML = `<div><strong>New visitors (30d):</strong> ${newVis}</div><div><strong>Retained (any repeat session):</strong> ${retained} (${rate}%)</div>`;
}

function renderBar(id, items, labelFn, valueFn, label, color) {
  const el = document.getElementById(id); if (!el) return; if (!items || items.length === 0) return;
  const labels = items.map(labelFn);
  const values = items.map(valueFn);
  const colors = Array.isArray(color) ? color : Array(labels.length).fill(color);
  CHARTS.push(new Chart(el, { type:'bar', data:{ labels, datasets:[{ label, data: values, backgroundColor: colors }] }, options:{ indexAxis: labels.length>6 ? 'y' : 'x', responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true } } } }));
}

export default {};
