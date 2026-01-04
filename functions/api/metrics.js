export async function onRequestGet({ env }) {
  const db = env.gallery_db;

  // Total pageviews and unique sessions
  const totalPageviews = await db.prepare(
    `SELECT COUNT(*) AS count FROM ej_antiques_analytics`
  ).first();

  const uniqueSessions = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) AS count FROM ej_antiques_analytics`
  ).first();

  // All pageviews with timestamps
  const topPages = await db.prepare(
    `SELECT url, timestamp
     FROM ej_antiques_analytics
     WHERE url IS NOT NULL`
  ).all();

  // Top referrers
  const topReferrers = await db.prepare(
    `SELECT referrer, timestamp
     FROM ej_antiques_analytics
     WHERE referrer != ''`
  ).all();

  // Product pageviews (derived from URL)
  const productPageViews = await db.prepare(
    `SELECT url, timestamp
     FROM ej_antiques_analytics
     WHERE url LIKE '/product-slug/%'`
  ).all();

  // Views by day
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
    productPageViews: productPageViews?.results || [],
    viewsByDay: viewsByDay?.results || []
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
