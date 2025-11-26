export async function onRequest(context) {
  const db = context.env.gallery_db;

  const { results } = await db.prepare("SELECT * FROM ej_antiques_products").all();

  const products = results.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.image,
    images: p.images ? JSON.parse(p.images) : [],
    longDescription: p.longDescription,
    status: p.status,
    slug: p.slug,
    is_published: p.is_published,
    is_sold: p.is_sold,
    sold_at: p.sold_at,
    quantity: p.quantity,
    created_at: p.created_at
  }));

  return Response.json(products);
}
