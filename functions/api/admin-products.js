import { isAuthorized } from '../utils/auth.js';

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.gallery_db;
  const method = request.method;

  // Debug: log method and cookie
  console.log("Method:", method);
  console.log("Cookie:", request.headers.get("Cookie"));

  // Auth check
  if (!isAuthorized(request)) {
    console.warn("Unauthorized access attempt to admin-products API:", request.url);
    return new Response("Unauthorized", { status: 403 });
  }

  // Method check
  if (method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Parse and validate body
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
    longDescription
  } = body;

  console.log("Received product data:", { title, description, price });

  if (!title || !description || !price) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Insert into DB
  await db
    .prepare(`
      INSERT INTO ej_antiques_products (title, description, price, category, image, images, longDescription)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(title, description, price, category, image, images, longDescription)
    .run();

  console.log("Product inserted successfully:", title);

  return new Response("Product created", { status: 201 });
}
