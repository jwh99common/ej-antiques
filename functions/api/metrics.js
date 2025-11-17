export async function onRequestGet({ env }) {
  const db = env.gallery_db;

  // Total pageviews and unique sessions (pre-aggregated)
  const totalPageviews = await db.prepare(
    `SELECT COUNT(*) AS count FROM ej_antiques_analytics`
  ).first();

  const uniqueSessions = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) AS count FROM ej_antiques_analytics`
  ).first();

  // Top pages with timestamps
  const topPages = await db.prepare(
    `SELECT url, timestamp
     FROM ej_antiques_analytics
     WHERE url IS NOT NULL`
  ).all();

  // Top referrers with timestamps
  const topReferrers = await db.prepare(
    `SELECT referrer, timestamp
     FROM ej_antiques_analytics
     WHERE referrer != ''`
  ).all();

  // Product views with timestamps
  const productViews = await db.prepare(
    `SELECT event_type, session_id, timestamp
     FROM ej_antiques_analytics
     WHERE event_type IN ('productsModalView', 'productPageView')`
  ).all();

  // Modal views by product with timestamps
  const modalViewsByProduct = await db.prepare(
    `SELECT json_extract(metadata, '$.title') AS title, timestamp
     FROM ej_antiques_analytics
     WHERE event_type = 'productsModalView'`
  ).all();

  // Views by day (keep this one aggregated)
  const viewsByDay = await db.prepare(
    `SELECT strftime('%Y-%m-%d', timestamp) AS day, COUNT(*) AS views
     FROM ej_antiques_analytics
     WHERE timestamp >= datetime('now', '-7 days')
     GROUP BY day
     ORDER BY day ASC`
  ).all();

  return new Response(JSON.stringify({
    totalPageviews: totalPageviews?.count || 0,
    uniqueSessions: uniqueSessions?.count || 0,
    topPages: topPages?.results || [],
    topReferrers: topReferrers?.results || [],
    productViews: productViews?.results || [],
    modalViewsByProduct: modalViewsByProduct?.results || [],
    viewsByDay: viewsByDay?.results || []
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
