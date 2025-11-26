export async function onRequest(context) {
  const db = context.env.gallery_db;
  const id = context.params.id;
  const method = context.request.method;

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
    const {
      title,
      description,
      price,
      category,
      image,
      images,
      longDescription,
      status,
      slug: customSlug,
      is_published,
      is_sold,
      sold_at,
      quantity
    } = body;

    if (!title || !description || !price) {
      return new Response("Missing required fields", { status: 400 });
    }

    const slug = customSlug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await db.prepare(`
      UPDATE ej_antiques_products SET
        title = ?, description = ?, price = ?, category = ?, image = ?, images = ?, longDescription = ?,
        status = ?, slug = ?, is_published = ?, is_sold = ?, sold_at = ?, quantity = ?
      WHERE id = ?
    `).bind(
      title,
      description,
      price,
      category,
      image,
      images,
      longDescription,
      status,
      slug,
      is_published ? 1 : 0,
      is_sold ? 1 : 0,
      sold_at || null,
      quantity ?? 1,
      id
    ).run();

    return new Response("Product updated", { status: 200 });
  }

  if (method === "DELETE") {
    await db.prepare("DELETE FROM ej_antiques_products WHERE id = ?").bind(id).run();
    return new Response("Product deleted", { status: 200 });
  }

  return new Response("Method not allowed", { status: 405 });
}
