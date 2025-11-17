export async function onRequestGet({ env }) {
  const db = env.gallery_db;

  const totalPageviews = await db.prepare(
    `SELECT COUNT(*) AS count FROM ej_antiques_analytics`
  ).first();

  const uniqueSessions = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) AS count FROM ej_antiques_analytics`
  ).first();

  const topPages = await db.prepare(
    `SELECT url, COUNT(*) AS views
     FROM ej_antiques_analytics
     GROUP BY url
     ORDER BY views DESC
     LIMIT 5`
  ).all();

  const topReferrers = await db.prepare(
    `SELECT referrer, COUNT(*) AS count
     FROM ej_antiques_analytics
     WHERE referrer != ''
     GROUP BY referrer
     ORDER BY count DESC
     LIMIT 5`
  ).all();

  const productViewBreakdown = await db.prepare(
  `SELECT event_type, COUNT(*) AS count
   FROM ej_antiques_analytics
   WHERE event_type IN ('productModalView', 'productPageView')
   GROUP BY event_type`
  ).all();

  const viewsByDay = await db.prepare(
  `SELECT strftime('%Y-%m-%d', timestamp) AS day, COUNT(*) AS views
   FROM ej_antiques_analytics
   WHERE timestamp >= datetime('now', '-7 days')
   GROUP BY day
   ORDER BY day ASC`
  ).all();

const modalViewsByProduct = await db.prepare(
  `SELECT json_extract(metadata, '$.title') AS title,
          COUNT(*) AS count
   FROM ej_antiques_analytics
   WHERE event_type = 'productsModalView'
   GROUP BY title
   ORDER BY count DESC
   LIMIT 10`
).all();


  return new Response(JSON.stringify({
  totalPageviews: totalPageviews?.count || 0,
  uniqueSessions: uniqueSessions?.count || 0,
  topPages: topPages?.results || [],
  topReferrers: topReferrers?.results || [],
  productViews: productViewBreakdown?.results || [],
  viewsByDay: viewsByDay?.results || [],
  modalViewsByProduct: modalViewsByProduct?.results || []

}), {
  headers: { 'Content-Type': 'application/json' }
});

}
