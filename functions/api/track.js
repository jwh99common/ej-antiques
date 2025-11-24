export async function onRequest(context) {
  const { request, env } = context;
  const data = await request.json();

  const ip = request.headers.get('CF-Connecting-IP');
  const country = request.headers.get('CF-IPCountry') || null;
  const city = request.headers.get('CF-IPCity') || null;

  //console.log('Inserting event:', {
  // eventType: data.eventType,
  //  metadata: data.metadata,
  //  sessionId: data.sessionId,
  //  url: data.url
  //});

  await env.gallery_db.prepare(`
    INSERT INTO ej_antiques_analytics (
      session_id, timestamp, url, referrer, user_agent, ip, country, city, event_type, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.sessionId,
    new Date().toISOString(),
    data.url,
    data.referrer || null,
    data.userAgent || null,
    ip,
    country,
    city,
    data.eventType || 'pageview',
    JSON.stringify(data.metadata || {})
  ).run();

  return new Response('OK', { status: 200 });
}
