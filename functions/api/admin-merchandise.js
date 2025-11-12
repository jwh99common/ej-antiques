export async function onRequest(context) {
  const db = context.env.gallery_db;
  const method = context.request.method;

  if (method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await context.request.json();
  const {
    title,
    description,
    price,
    category,
    image,
    long_description
  } = body;

  if (!title || !description || !price) {
    return new Response("Missing required fields", { status: 400 });
  }

  await db
    .prepare(`
      INSERT INTO bens_bikes_merchandise (title, description, long_description, image, price, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(title, description, long_description, image, price, category)
    .run();

  return new Response("Merchandise item created", { status: 201 });
}
