fetch('/api/metrics')
  .then(res => res.json())
  .then(data => {
    // Update text stats
    document.getElementById('pageviews').textContent = data.totalPageviews;
    document.getElementById('sessions').textContent = data.uniqueSessions;

    // Render top pages list
    const topPages = document.getElementById('topPages');
    data.topPages.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.url} — ${p.views} views`;
      topPages.appendChild(li);
    });

    // Render top referrers list
    const topReferrers = document.getElementById('topReferrers');
    data.topReferrers.forEach(r => {
      const li = document.createElement('li');
      li.textContent = `${r.referrer} — ${r.count} hits`;
      topReferrers.appendChild(li);
    });

    // ✅ Add your Chart.js code here

    // Top Pages Chart
    const pageLabels = data.topPages.map(p => p.url);
    const pageViews = data.topPages.map(p => p.views);

    new Chart(document.getElementById('pagesChart'), {
      type: 'bar',
      data: {
        labels: pageLabels,
        datasets: [{
          label: 'Pageviews',
          data: pageViews,
          backgroundColor: '#4e79a7'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        }
      }
    });

    // Top Referrers Chart
    const refLabels = data.topReferrers.map(r => r.referrer);
    const refCounts = data.topReferrers.map(r => r.count);

    new Chart(document.getElementById('referrersChart'), {
      type: 'bar',
      data: {
        labels: refLabels,
        datasets: [{
          label: 'Referrals',
          data: refCounts,
          backgroundColor: '#f28e2b'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        }
      }
    });
  });
