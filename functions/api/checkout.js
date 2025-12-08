export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const db = env.gallery_db;
  const { cart, name, email, phone, address } = await request.json();

  const stmt = db.prepare(`
    INSERT INTO ej_antiques_orders (cart, name, email, phone, address)
    VALUES (?, ?, ?, ?, ?)
  `);
  await stmt.bind(JSON.stringify(cart), name, email, phone, address).run();

  return new Response("Order saved", { status: 200 });
}
