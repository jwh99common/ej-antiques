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

  return new Response(JSON.stringify({
    totalPageviews: totalPageviews.count,
    uniqueSessions: uniqueSessions.count,
    topPages: topPages.results,
    topReferrers: topReferrers.results
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
