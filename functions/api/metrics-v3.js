export async function onRequestGet({ env, request }) {
  const db = env.gallery_db;
  const url = new URL(request.url);
  const range = url.searchParams.get('range') || 'all';

  // build time filters
  let timeWherePrefix = '';
  let timeAnd = '';
  // Use DATE() comparisons for day ranges, datetime for multi-day windows
  switch(range) {
    case 'today':
      timeWherePrefix = "WHERE DATE(timestamp) = DATE('now')";
      timeAnd = "AND DATE(timestamp) = DATE('now')";
      break;
    case 'yesterday':
      timeWherePrefix = "WHERE DATE(timestamp) = DATE('now', '-1 day')";
      timeAnd = "AND DATE(timestamp) = DATE('now', '-1 day')";
      break;
    case 'last7':
      timeWherePrefix = "WHERE timestamp >= datetime('now', '-6 days')";
      timeAnd = "AND timestamp >= datetime('now', '-6 days')";
      break;
    case 'last30':
      timeWherePrefix = "WHERE timestamp >= datetime('now', '-29 days')";
      timeAnd = "AND timestamp >= datetime('now', '-29 days')";
      break;
    default:
      timeWherePrefix = '';
      timeAnd = '';
  }

  // Overview
  const totalPageviews = await db.prepare(
    `SELECT COUNT(*) AS count FROM ej_antiques_analytics WHERE event_type = 'pageview' ${timeAnd}`
  ).first();

  // Quick recent counts so admin UIs always have accurate recent totals
  const pageviewsToday = await db.prepare(`SELECT COUNT(*) AS count FROM ej_antiques_analytics WHERE event_type = 'pageview' AND DATE(timestamp)=DATE('now')`).first();
  const pageviewsYesterday = await db.prepare(`SELECT COUNT(*) AS count FROM ej_antiques_analytics WHERE event_type = 'pageview' AND DATE(timestamp)=DATE('now','-1 day')`).first();
  const pageviewsLast7 = await db.prepare(`SELECT COUNT(*) AS count FROM ej_antiques_analytics WHERE event_type = 'pageview' AND timestamp >= datetime('now','-6 days')`).first();
  const pageviewsLast30 = await db.prepare(`SELECT COUNT(*) AS count FROM ej_antiques_analytics WHERE event_type = 'pageview' AND timestamp >= datetime('now','-29 days')`).first();

  const uniqueSessions = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) AS count FROM ej_antiques_analytics ${timeWherePrefix}`
  ).first();

  const uniqueCountries = await db.prepare(
    `SELECT COUNT(DISTINCT country) AS count FROM ej_antiques_analytics WHERE country IS NOT NULL ${timeAnd}`
  ).first();

  // Bounce rate
  const bounceMetrics = await db.prepare(`
    SELECT 
      COUNT(*) AS total_sessions,
      COUNT(CASE WHEN event_type = 'session_end' AND json_extract(metadata, '$.isBounce') = 1 THEN 1 END) AS bounces
    FROM ej_antiques_analytics
    ${timeWherePrefix}
  `).first();
  const bounceRate = bounceMetrics ? Math.round((bounceMetrics.bounces / bounceMetrics.total_sessions) * 100) : 0;

  // Avg session duration
  const avgSessionDuration = await db.prepare(`
    SELECT 
      ROUND(AVG(CAST(json_extract(metadata, '$.sessionDuration') AS FLOAT)), 1) AS avgSeconds
    FROM ej_antiques_analytics
    WHERE event_type = 'session_end' AND json_extract(metadata, '$.sessionDuration') IS NOT NULL ${timeAnd}
  `).first();

  // Visitor types
  const visitorTypes = await db.prepare(`
    SELECT 
      CASE WHEN json_extract(metadata, '$.isNewVisitor') = 1 THEN 'New' ELSE 'Returning' END AS type,
      COUNT(DISTINCT session_id) AS sessions
    FROM ej_antiques_analytics
    WHERE event_type = 'pageview' ${timeAnd}
    GROUP BY type
  `).all();

  // Top pages
  const topPages = await db.prepare(`
    SELECT 
      url,
      COUNT(*) AS views,
      COUNT(CASE WHEN event_type = 'session_end' AND json_extract(metadata, '$.isBounce') = 1 THEN 1 END) AS bounces,
      COUNT(DISTINCT session_id) AS sessions
    FROM ej_antiques_analytics
    WHERE url IS NOT NULL ${timeAnd}
    GROUP BY url
    ORDER BY views DESC
    LIMIT 10
  `).all();

  // Top CTAs
  const topCTAs = await db.prepare(`
    SELECT 
      json_extract(metadata, '$.ctaName') AS cta,
      json_extract(metadata, '$.ctaText') AS ctaText,
      COUNT(*) AS clicks
    FROM ej_antiques_analytics
    WHERE event_type = 'cta_click' ${timeAnd}
    GROUP BY json_extract(metadata, '$.ctaName')
    ORDER BY clicks DESC
    LIMIT 10
  `).all();

  // Form submissions
  const formSubmissions = await db.prepare(`
    SELECT 
      json_extract(metadata, '$.formName') AS form,
      COUNT(*) AS submissions
    FROM ej_antiques_analytics
    WHERE event_type = 'form_submit' ${timeAnd}
    GROUP BY json_extract(metadata, '$.formName')
    ORDER BY submissions DESC
    LIMIT 10
  `).all();

  // Average scroll depth
  const avgScrollDepth = await db.prepare(`
    SELECT 
      url,
      ROUND(AVG(CAST(json_extract(metadata, '$.maxDepth') AS FLOAT)), 1) AS avgDepth,
      COUNT(*) AS pageviews
    FROM ej_antiques_analytics
    WHERE event_type = 'scroll_depth' AND url IS NOT NULL ${timeAnd}
    GROUP BY url
    ORDER BY pageviews DESC
    LIMIT 10
  `).all();

  // Top products
  const topProducts = await db.prepare(`
    SELECT 
      json_extract(metadata, '$.productTitle') AS product,
      json_extract(metadata, '$.slug') AS slug,
      COUNT(CASE WHEN event_type = 'product_view' THEN 1 END) AS views,
      COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) AS addToCarts,
      ROUND(COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) * 100.0 / 
            NULLIF(COUNT(CASE WHEN event_type = 'product_view' THEN 1 END), 0), 1) AS conversionRate
    FROM ej_antiques_analytics
    WHERE event_type IN ('product_view', 'add_to_cart') AND json_extract(metadata, '$.slug') IS NOT NULL ${timeAnd}
    GROUP BY json_extract(metadata, '$.slug')
    ORDER BY views DESC
    LIMIT 10
  `).all();

  // Funnel metrics (session-based)
  const funnelRaw = await db.prepare(`
    WITH per_session AS (
      SELECT
        session_id,
        MAX(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS has_pv,
        MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS has_atc,
        MAX(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END) AS has_checkout
      FROM ej_antiques_analytics
      ${timeWherePrefix}
      GROUP BY session_id
    )
    SELECT
      COUNT(*) AS totalSessions,
      SUM(has_pv) AS pvSessions,
      SUM(has_atc) AS atcSessions,
      SUM(has_checkout) AS checkoutSessions
    FROM per_session
  `).first();

  const funnel = {
    totalSessions: funnelRaw?.totalSessions || 0,
    productViewSessions: funnelRaw?.pvSessions || 0,
    addToCartSessions: funnelRaw?.atcSessions || 0,
    checkoutSessions: funnelRaw?.checkoutSessions || 0,
    pvToAtcRate: funnelRaw && funnelRaw.pvSessions ? Math.round((funnelRaw.atcSessions / funnelRaw.pvSessions) * 1000) / 10 : 0,
    atcToCheckoutRate: funnelRaw && funnelRaw.atcSessions ? Math.round((funnelRaw.checkoutSessions / funnelRaw.atcSessions) * 1000) / 10 : 0,
    pvToCheckoutRate: funnelRaw && funnelRaw.pvSessions ? Math.round((funnelRaw.checkoutSessions / funnelRaw.pvSessions) * 1000) / 10 : 0
  };

  // Daily trends (30d)
  const dailyTrends = await db.prepare(`
    SELECT 
      strftime('%Y-%m-%d', timestamp) AS date,
      COUNT(CASE WHEN event_type = 'pageview' THEN 1 END) AS pageviews,
      COUNT(DISTINCT session_id) AS sessions,
      COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) AS addToCarts,
      COUNT(CASE WHEN event_type = 'product_view' THEN 1 END) AS productViews,
      COUNT(CASE WHEN event_type = 'cta_click' THEN 1 END) AS ctaClicks,
      COUNT(CASE WHEN event_type = 'form_submit' THEN 1 END) AS formSubmits
    FROM ej_antiques_analytics
    ${timeWherePrefix || "WHERE timestamp >= datetime('now', '-30 days')"}
    GROUP BY date
    ORDER BY date DESC
  `).all();

  // By country
  const byCountry = await db.prepare(`
    SELECT 
      country,
      COUNT(*) AS views,
      COUNT(DISTINCT session_id) AS sessions,
      COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) AS addToCarts
    FROM ej_antiques_analytics
    WHERE country IS NOT NULL AND country != '' ${timeAnd}
    GROUP BY country
    ORDER BY views DESC
    LIMIT 15
  `).all();

  // By device
  const byDevice = await db.prepare(`
    SELECT 
      CASE 
        WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' THEN 'Mobile'
        WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'Tablet'
        ELSE 'Desktop'
      END AS device,
      COUNT(*) AS views,
      COUNT(DISTINCT session_id) AS sessions,
      COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) AS addToCarts
    FROM ej_antiques_analytics
    ${timeWherePrefix}
    GROUP BY device
    ORDER BY views DESC
  `).all();

  // Avg time on page
  const avgTimeOnPage = await db.prepare(`
    SELECT 
      url,
      COUNT(*) AS visits,
      ROUND(AVG(CAST(json_extract(metadata, '$.seconds') AS FLOAT)), 1) AS avgSeconds
    FROM ej_antiques_analytics
    WHERE event_type = 'time_on_page' AND url IS NOT NULL ${timeAnd}
    GROUP BY url
    ORDER BY visits DESC
    LIMIT 10
  `).all();

  // Simple retention: looks for visitorId in metadata and computes 30-day retention for new visitors
  const retention = await db.prepare(`
    WITH visitors AS (
      SELECT
        json_extract(metadata, '$.visitorId') AS vid,
        COUNT(DISTINCT session_id) AS sessions,
        DATE(MIN(timestamp)) AS first_seen
      FROM ej_antiques_analytics
      WHERE json_extract(metadata, '$.visitorId') IS NOT NULL
      GROUP BY vid
    ), cohorts AS (
      SELECT * FROM visitors WHERE first_seen >= DATE('now','-30 days')
    )
    SELECT
      COUNT(*) AS newVisitors,
      SUM(CASE WHEN sessions > 1 THEN 1 ELSE 0 END) AS retained,
      ROUND(SUM(CASE WHEN sessions > 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*),0), 1) AS retentionRate
    FROM cohorts
  `).first();

  // Top referrers
  const topReferrers = await db.prepare(`
    SELECT 
      CASE 
        WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
        ELSE referrer
      END AS referrer,
      COUNT(*) AS views,
      COUNT(DISTINCT session_id) AS sessions,
      COUNT(CASE WHEN event_type = 'add_to_cart' THEN 1 END) AS addToCarts
    FROM ej_antiques_analytics
    WHERE referrer NOT LIKE '%ej-antiques%' OR referrer IS NULL OR referrer = '' ${timeAnd}
    GROUP BY 
      CASE 
        WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
        ELSE referrer
      END
    ORDER BY views DESC
    LIMIT 15
  `).all();

  // Recent raw events (last 30 days) for client-side filtering and diagnostics
  const rawEvents = await db.prepare(`
    SELECT timestamp, event_type, url, session_id, metadata
    FROM ej_antiques_analytics
    ${timeWherePrefix || "WHERE timestamp >= datetime('now','-29 days')"}
    ORDER BY timestamp DESC
    LIMIT 10000
  `).all();

  return new Response(JSON.stringify({
    overview: {
      totalPageviews: totalPageviews?.count || 0,
      uniqueSessions: uniqueSessions?.count || 0,
      uniqueCountries: uniqueCountries?.count || 0,
      bounceRate,
      avgSessionDuration: avgSessionDuration?.avgSeconds || 0,
      visitorTypes: visitorTypes?.results || [],
      pageviewsToday: pageviewsToday?.count || 0,
      pageviewsYesterday: pageviewsYesterday?.count || 0,
      pageviewsLast7: pageviewsLast7?.count || 0,
      pageviewsLast30: pageviewsLast30?.count || 0
    },
    topPages: topPages?.results || [],
    topCTAs: topCTAs?.results || [],
    formSubmissions: formSubmissions?.results || [],
    scrollDepth: avgScrollDepth?.results || [],
    topProducts: topProducts?.results || [],
    dailyTrends: dailyTrends?.results || [],
    byCountry: byCountry?.results || [],
    byDevice: byDevice?.results || [],
    avgTimeOnPage: avgTimeOnPage?.results || [],
    topReferrers: topReferrers?.results || []
    ,
    funnel,
    retention: retention || { newVisitors: 0, retained: 0, retentionRate: 0 },
    rawEvents: rawEvents?.results || []
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
