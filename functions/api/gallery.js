export async function onRequest(context) {
  const db = context.env.gallery_db;
  
  //console.log("🔍 EJ's Antiques: D1 query triggered from /functions/api/gallery.js");
  
  const { results } = await db.prepare("SELECT * FROM ej_antiques_gallery").all();
  
  const products = results.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.image,
    long_description: p.long_description
  }));

  
  //console.log("📦 D1 returned gallery:");
  //products.forEach((product, i) => {
  // console.log(`🔹 Product ${i + 1}: ${product.title} ${product.image}`);
  //});

  return Response.json(products);
}
