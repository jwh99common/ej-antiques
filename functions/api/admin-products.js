import { isAuthorized } from '../utils/auth.js';

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.gallery_db;
  const method = request.method;

  console.log("Method:", method);
  console.log("Cookie:", request.headers.get("Cookie"));

  if (!isAuthorized(request)) {
    console.warn("Unauthorized access attempt to admin-products API:", request.url);
    return new Response("Unauthorized", { status: 403 });
  }

  if (method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.error("Invalid JSON:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    title,
    description,
    price,
    category,
    image,
    images,
    longDescription,
    status,
    slug,
    is_published,
    is_sold,
    sold_at,
    quantity,
    background
  } = body;

  if (!title || !description || !price) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Fallback slug generation if missing or empty
  const safeSlug = (slug && slug.trim()) || title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    await db.prepare(`
      INSERT INTO ej_antiques_products (
        title, description, price, category, image, images, longDescription,
        status, slug, is_published, is_sold, sold_at, quantity, background
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      description,
      price,
      category,
      image,
      images,
      longDescription,
      status,
      safeSlug,
      is_published ? 1 : 0,
      is_sold ? 1 : 0,
      sold_at || null,
      quantity ?? 1,
      background
    ).run();

    console.log("Product inserted successfully:", safeSlug);
    return new Response("Product created", { status: 201 });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed: ej_antiques_products.slug")) {
      return new Response("Slug already exists", { status: 409 });
    }
    console.error("Database insert error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
