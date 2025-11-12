export async function onRequest(context) {
  const db = context.env.gallery_db;
  const id = context.params.id;
  const method = context.request.method;

  console.log ("api/products", method, id);

  if (!id) {
    return new Response("Missing product ID", { status: 400 });
  }

  if (method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM ej_antiques_products WHERE id = ?")
      .bind(id)
      .all();

    if (results.length === 0) {
      return new Response("Product not found", { status: 404 });
    }

    return Response.json(results[0]);
  }

  if (method === "PUT" || method === "POST") {
    const body = await context.request.json();
    const { title, description, price, category, image, images, longDescription } = body;

    if (!title || !description || !price) {
      return new Response("Missing required fields", { status: 400 });
    }

    await db
      .prepare(`
        UPDATE ej_antiques_products
        SET title = ?, description = ?, price = ?, category = ?, image = ?, images = ?, longDescription = ?
        WHERE id = ?
      `)
      .bind(title, description, price, category, image, images, longDescription, id)
      .run();

    return new Response("Product updated", { status: 200 });
  }

  if (method === "DELETE") {
    await db.prepare("DELETE FROM ej_antiques_products WHERE id = ?").bind(id).run();
    return new Response("Product deleted", { status: 200 });
  }

  return new Response("Method not allowed", { status: 405 });
}
