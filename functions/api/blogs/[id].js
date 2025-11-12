export async function onRequest(context) {
  const db = context.env.gallery_db;
  const id = context.params.id;
  const method = context.request.method;

  console.log ("api/blogs", method, id);
  
  if (!id) {
    return new Response("Missing blog ID", { status: 400 });
  }

  if (method === "GET") {
    const { results } = await db
      .prepare("SELECT * FROM ej_antiques_blogs WHERE id = ?")
      .bind(id)
      .all();

    if (results.length === 0) {
      return new Response("Blog not found", { status: 404 });
    }

    return Response.json(results[0]);
  }

  if (method === "DELETE") {
    await db.prepare("DELETE FROM ej_antiques_blogs WHERE id = ?").bind(id).run();
    return new Response("Blog deleted", { status: 200 });
  }

  if (method === "PUT" || method === "POST") {
    const body = await context.request.json();
    const { title, slug, author, image, content, shortcontent, longcontent } = body;

    if (!title || !slug || !content) {
      return new Response("Missing required fields", { status: 400 });
    }

    await db
      .prepare(`
        UPDATE ej_antiques_blogs
        SET title = ?, slug = ?, author = ?, image = ?, content = ?, shortcontent = ?, longcontent = ?
        WHERE id = ?
      `)
      .bind(title, slug, author, image, content, shortcontent, longcontent, id)
      .run();

    return new Response("Blog updated", { status: 200 });
  }

  return new Response("Method not allowed", { status: 405 });
}
