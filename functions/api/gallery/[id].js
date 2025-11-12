export async function onRequest(context) {
  const db = context.env.gallery_db;
  const id = context.params.id;
  const method = context.request.method;

  console.log("EJ's Antiques: api/gallery", method, id);

  if (!id) {
    return new Response("Missing gallery ID", { status: 400 });
  }

  if (method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM ej_antiques_gallery WHERE id = ?")
      .bind(id)
      .all();

    if (results.length === 0) {
      return new Response("Gallery item not found", { status: 404 });
    }

    return Response.json(results[0]);
  }

  if (method === "PUT" || method === "POST") {
    const body = await context.request.json();
    const { title, description, price, category, image, long_description } = body;

    if (!title || !description || !price) {
      return new Response("Missing required fields", { status: 400 });
    }

    await db
      .prepare(`
        UPDATE ej_antiques_gallery
        SET title = ?, description = ?, long_description = ?, image = ?, price = ?, category = ?
        WHERE id = ?
      `)
      .bind(title, description, long_description, image, price, category, id)
      .run();

    return new Response("Gallery item updated", { status: 200 });
  }

  if (method === "DELETE") {
    await db
      .prepare("DELETE FROM ej_antiques_gallery WHERE id = ?")
      .bind(id)
      .run();

    return new Response("Gallery item deleted", { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
