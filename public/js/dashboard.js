fetch('/api/metrics')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('Loaded metrics:', data);

    // === Overview Metrics ===
    const pageviewsEl = document.getElementById('pageviews');
    const sessionsEl = document.getElementById('sessions');
    if (pageviewsEl) pageviewsEl.textContent = data.totalPageviews || 0;
    if (sessionsEl) sessionsEl.textContent = data.uniqueSessions || 0;

    // === Top Pages List ===
    const topPages = document.getElementById('topPages');
    if (topPages && Array.isArray(data.topPages)) {
      topPages.innerHTML = '';
      data.topPages.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.url} — ${p.views} views`;
        topPages.appendChild(li);
      });
    }

    // === Top Referrers List ===
    const topReferrers = document.getElementById('topReferrers');
    if (topReferrers && Array.isArray(data.topReferrers)) {
      topReferrers.innerHTML = '';
      data.topReferrers.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${r.referrer} — ${r.count} hits`;
        topReferrers.appendChild(li);
      });
    }

    // === Top Pages Chart ===
    const pagesChartEl = document.getElementById('pagesChart');
    if (pagesChartEl && Array.isArray(data.topPages) && data.topPages.length > 0) {
      const labels = data.topPages.map(p => p.url);
      const values = data.topPages.map(p => p.views);

      new Chart(pagesChartEl, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Pageviews',
            data: values,
            backgroundColor: '#4e79a7'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, title: { display: false } }
        }
      });
    }

    // === Top Referrers Chart ===
    const referrersChartEl = document.getElementById('referrersChart');
    if (referrersChartEl && Array.isArray(data.topReferrers) && data.topReferrers.length > 0) {
      const labels = data.topReferrers.map(r => r.referrer);
      const values = data.topReferrers.map(r => r.count);

      new Chart(referrersChartEl, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Referrals',
            data: values,
            backgroundColor: '#f28e2b'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, title: { display: false } }
        }
      });
    }

    // === Product Views: Modal vs Page Chart ===
    const productViewsChartEl = document.getElementById('productViewsChart');
    if (productViewsChartEl && Array.isArray(data.productViews) && data.productViews.length > 0) {
      const labels = data.productViews.map(v =>
        v.event_type === 'productModalView' ? 'Modal Views' : 'Page Views'
      );
      const values = data.productViews.map(v => v.count);

      new Chart(productViewsChartEl, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Views',
            data: values,
            backgroundColor: ['#59a14f', '#edc948']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, title: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // === Modal Views by Product Chart ===
    const modalViewsChartEl = document.getElementById('modalViewsChart');
    if (modalViewsChartEl && Array.isArray(data.modalViewsByProduct) && data.modalViewsByProduct.length > 0) {
      const labels = data.modalViewsByProduct.map(p => p.title.trim());
      const values = data.modalViewsByProduct.map(p => p.count);

      new Chart(modalViewsChartEl, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Modal Views by Product',
            data: values,
            backgroundColor: '#76b7b2'
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, title: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  })
  .catch(err => {
    console.error('Error loading dashboard metrics:', err);
  });
