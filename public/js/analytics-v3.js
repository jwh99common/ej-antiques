// analytics-v3.js
// Consolidated analytics dashboard JS — resilient, modular, small footprint.
let RAW = null;
let CHARTS = [];

const DEFAULT_ENDPOINT = '/api/metrics-v3';

document.addEventListener('DOMContentLoaded', () => {
  initControls();
  fetch(DEFAULT_ENDPOINT)
    .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
    .then(data => { RAW = data; renderAll(); })
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
  document.getElementById('dateFilter')?.addEventListener('change', renderAll);
  document.getElementById('countFilter')?.addEventListener('change', renderAll);
  document.getElementById('sourceFilter')?.addEventListener('change', renderAll);
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
  out.topPages = (RAW.topPages || RAW.top_pages || []).filter(p => { const ts = p.date || p.timestamp; return ts ? isInRange(ts) : true; });
  out.topProducts = (RAW.topProducts || RAW.top_products || RAW.productPageViews || []).filter(p => { const ts = p.date || p.timestamp; return ts ? isInRange(ts) : true; });
  out.dailyTrends = (RAW.dailyTrends || RAW.viewsByDay || []).filter(t => { const ts = t.date || t.timestamp; return ts ? isInRange(ts) : true; });
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

  // If we have rawEvents, compute aggregates client-side for the selected range
  let computed = {};
  if (RAW && Array.isArray(RAW.rawEvents) && RAW.rawEvents.length > 0) {
    computed = computeAggregatesFromRaw(RAW.rawEvents, range);
  }

  const overview = computed.overview || safeGet(()=>RAW.overview, {});
  renderKPIs(overview, range);

  // Funnel & retention (prefer computed when available)
  renderFunnel(computed.funnel || safeGet(()=>RAW.funnel, {}));
  renderRetention(computed.retention || safeGet(()=>RAW.retention, {}));

  const pagesSource = computed.topPages || (data.topPages||[]);
  renderList('topPages', (pagesSource||[]).slice(0,count), p => `<strong>${p.url||p.path||p.label||'/'}</strong> — ${p.views||p.count||1} views`);
  renderBar('pagesChart', (pagesSource||[]).slice(0,count), i=>i.url||i.path||i.label, i=>i.views||i.count||0, 'Pageviews', '#3498db');

  const productsSource = computed.topProducts || (data.topProducts||[]);
  renderList('topProducts', (productsSource||[]).slice(0,count), p => `<strong>${p.product||p.slug||p.label||'N/A'}</strong> — ${p.views||p.count||0} views`);
  renderBar('productsChart', (productsSource||[]).slice(0,count), i=>i.product||i.slug||i.label, i=>i.views||i.count||0, 'Product Views', '#59a14f');

  renderBar('referrersChart', (computed.topReferrers||data.topReferrers||[]).slice(0,count), i=>i.referrer||i.label||'Direct', i=>i.views||i.count||0, 'Referrers', '#e67e22');

  const trendsSource = computed.dailyTrends || (data.dailyTrends||[]);
  renderBar('trendsChart', (trendsSource||[]).slice(0,100), d=>d.date||d.day, d=>d.pageviews||d.views||0, 'Daily', '#4e79a7');

  renderBar('deviceChart', (computed.byDevice||data.byDevice||[]), d=>d.device||d.label||'Unknown', d=>d.views||d.count||0, 'Devices', ['#3498db','#e74c3c','#f39c12']);

  renderList('avgTimeOnPage', (computed.avgTimeOnPage||data.avgTimeOnPage||[]).slice(0,count), t => `<strong>${t.url||t.path||t.label||'/'}</strong> — ${t.avgSeconds||t.avg||0}s avg, ${t.visits||t.count||0} visits`);
}

function renderKPIs(overview, range) {
  const el = document.getElementById('kpis'); if (!el) return;
  let pageviews = overview.totalPageviews || overview.pageviews || 0;
  if (range === 'today' && typeof overview.pageviewsToday !== 'undefined') pageviews = overview.pageviewsToday;
  else if (range === 'yesterday' && typeof overview.pageviewsYesterday !== 'undefined') pageviews = overview.pageviewsYesterday;
  else if (range === 'last7' && typeof overview.pageviewsLast7 !== 'undefined') pageviews = overview.pageviewsLast7;
  else if (range === 'last30' && typeof overview.pageviewsLast30 !== 'undefined') pageviews = overview.pageviewsLast30;

  const k = [
    {label:'Pageviews', value: pageviews},
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

function computeAggregatesFromRaw(events, range) {
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

  const filtered = events.filter(e => isInRange(e.timestamp));

  const pages = new Map();
  const products = new Map();
  const daily = new Map();
  const sessions = new Set();
  const referrers = new Map();
  const timeOnPage = new Map();
  const perSession = {};

  filtered.forEach(ev => {
    const d = ev.timestamp ? ev.timestamp.slice(0,10) : 'unknown';
    // daily
    const day = daily.get(d) || { date: d, pageviews:0, sessions: new Set() };
    if (ev.event_type === 'pageview') day.pageviews++;
    if (ev.session_id) day.sessions.add(ev.session_id);
    daily.set(d, day);

    // pages
    if (ev.event_type === 'pageview') {
      const key = ev.url || '/';
      pages.set(key, (pages.get(key)||0)+1);
    }

    // products
    if (ev.event_type === 'product_view' || ev.event_type === 'add_to_cart') {
      let meta = {};
      try { meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata||'{}') : ev.metadata||{} } catch(e){}
      const key = meta.slug || meta.productTitle || meta.title || 'unknown';
      const entry = products.get(key) || { product: key, views:0, addToCarts:0 };
      if (ev.event_type === 'product_view') entry.views++;
      if (ev.event_type === 'add_to_cart') entry.addToCarts++;
      products.set(key, entry);
    }

    // referrers
    try { const meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata||'{}') : ev.metadata||{}; if (meta.referrer) referrers.set(meta.referrer, (referrers.get(meta.referrer)||0)+1); } catch(e){}

    // time on page
    if (ev.event_type === 'time_on_page') {
      try {
        const met = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata||'{}') : ev.metadata||{};
        const url = ev.url || met.url || '/';
        const entry = timeOnPage.get(url) || { url, visits:0, total:0 };
        const secs = parseFloat(met.seconds) || 0;
        entry.visits++;
        entry.total += secs;
        timeOnPage.set(url, entry);
      } catch(e){}
    }

    // sessions
    if (ev.session_id) sessions.add(ev.session_id);

    // per-session funnel
    if (ev.session_id) {
      const s = perSession[ev.session_id] || { pv:0, atc:0, checkout:0 };
      if (ev.event_type === 'product_view') s.pv = 1;
      if (ev.event_type === 'add_to_cart') s.atc = 1;
      if (ev.event_type === 'form_submit') s.checkout = 1;
      perSession[ev.session_id] = s;
    }
  });

  const topPages = Array.from(pages.entries()).map(([url,views])=>({ url, views })).sort((a,b)=>b.views-a.views);
  const topProducts = Array.from(products.values()).sort((a,b)=> (b.views||0)-(a.views||0));
  const dailyTrends = Array.from(daily.values()).map(d=>({ date:d.date, pageviews:d.pageviews, sessions: d.sessions.size })).sort((a,b)=> a.date.localeCompare(b.date));
  const topReferrers = Array.from(referrers.entries()).map(([ref,views])=>({ referrer: ref, views })).sort((a,b)=>b.views-a.views);
  const avgTimeOnPage = Array.from(timeOnPage.values()).map(t=>({ url:t.url, visits:t.visits, avgSeconds: Math.round((t.total/t.visits)*10)/10 }));

  // funnel
  const sessCount = Object.keys(perSession).length;
  const pvSessions = Object.values(perSession).filter(s=>s.pv).length;
  const atcSessions = Object.values(perSession).filter(s=>s.atc).length;
  const checkoutSessions = Object.values(perSession).filter(s=>s.checkout).length;

  return {
    topPages, topProducts, dailyTrends, byDevice: [], topReferrers, avgTimeOnPage,
    overview: { totalPageviews: pages.size ? Array.from(pages.values()).reduce((a,b)=>a+b,0) : 0, uniqueSessions: sessions.size },
    funnel: {
      totalSessions: sessCount,
      productViewSessions: pvSessions,
      addToCartSessions: atcSessions,
      checkoutSessions: checkoutSessions,
      pvToAtcRate: pvSessions? Math.round((atcSessions/pvSessions)*1000)/10 : 0,
      atcToCheckoutRate: atcSessions? Math.round((checkoutSessions/atcSessions)*1000)/10 : 0,
      pvToCheckoutRate: pvSessions? Math.round((checkoutSessions/pvSessions)*1000)/10 : 0
    },
    retention: { newVisitors: 0, retained: 0, retentionRate: 0 }
  };
}

export default {};
