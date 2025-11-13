export async function onRequest(context) {
  const { request, env } = context;
  const db = env.gallery_db;

  if (request.method === 'GET') {
    const { results } = await db.prepare("SELECT * FROM ej_antiques_orders ORDER BY createdAt DESC").all();
    return Response.json(results);
  }

  if (request.method === 'POST') {
    const { id, status } = await request.json();
    await db.prepare("UPDATE ej_antiquescd_orders SET status = ? WHERE id = ?").bind(status, id).run();
    return new Response("Order updated", { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
