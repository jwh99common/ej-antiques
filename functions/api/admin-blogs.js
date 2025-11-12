export async function onRequest(context) {
  const db = context.env.gallery_db;
  const method = context.request.method;

  if (method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await context.request.json();
  const { title, slug, author, image, content, shortcontent, longcontent } = body;

  if (!title || !slug || !content) {
    return new Response("Missing required fields", { status: 400 });
  }

  await db
    .prepare(`
      INSERT INTO ej_antiques_blogs (title, slug, author, image, content, shortcontent, longcontent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(title, slug, author, image, content, shortcontent, longcontent)
    .run();

  return new Response("Blog created", { status: 201 });
}
