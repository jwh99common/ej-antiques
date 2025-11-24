export async function onRequest(context) {
  const db = context.env.gallery_db;
  
  //console.log("🔍 D1 query triggered from /products");
  
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
    slug: p.slug
  }));

  
  //console.log("📦 D1 returned products:");
  //products.forEach((product, i) => {
  //  console.log(`🔹 Product ${i + 1}: ${product.title}`);
  //});

  return Response.json(products);
}
