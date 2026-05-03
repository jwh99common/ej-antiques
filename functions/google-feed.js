export async function onRequest(context) {
  const db = context.env.gallery_db;
  const BASE_URL = "https://ej-antiques.co.uk";

  let products = [];

  try {
    const stmt = db.prepare(
      "SELECT * FROM ej_antiques_products WHERE is_published = 1 ORDER BY created_at DESC"
    );
    const { results } = await stmt.all();
    products = results;
  } catch (err) {
    console.error("D1 query failed:", err);
    return new Response("Database error", { status: 500 });
  }

  // Build Google Merchant XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
  xml += `<channel>\n`;
  xml += `  <title>EJ Antiques Product Feed</title>\n`;
  xml += `  <link>${BASE_URL}</link>\n`;
  xml += `  <description>Google Shopping Feed for EJ Antiques</description>\n`;

  for (const p of products) {
    const link = `${BASE_URL}/product-slug/${p.slug}`;
    const price = `${p.price}.00 GBP`;
    const availability = p.is_sold ? "out_of_stock" : "in_stock";
    const condition = "used"; // antiques

    // Build main image URL
    const mainImageUrl = p.image
      ? `${BASE_URL}/ej-antiques/${p.image}`
      : null;

    // Build additional images (if stored as CSV)
    let additionalImages = [];
    if (p.images) {
      additionalImages = p.images
        .split(",")
        .map(img => img.trim())
        .filter(Boolean)
        .map(img => `${BASE_URL}/ej-antiques/${img}`);
    }

    xml += `  <item>\n`;
    xml += `    <g:id>${p.id}</g:id>\n`;
    xml += `    <g:title><![CDATA[${p.title}]]></g:title>\n`;
    xml += `    <g:description><![CDATA[${p.longDescription || p.description || ""}]]></g:description>\n`;
    xml += `    <g:link>${link}</g:link>\n`;

    // Main image
    if (mainImageUrl) {
      xml += `    <g:image_link>${mainImageUrl}</g:image_link>\n`;
    }

    // Additional images
    for (const img of additionalImages) {
      xml += `    <g:additional_image_link>${img}</g:additional_image_link>\n`;
    }

    xml += `    <g:price>${price}</g:price>\n`;
    xml += `    <g:availability>${availability}</g:availability>\n`;
    xml += `    <g:condition>${condition}</g:condition>\n`;

    if (p.category) {
      xml += `    <g:product_type><![CDATA[${p.category}]]></g:product_type>\n`;
    }

    xml += `  </item>\n`;
  }

  xml += `</channel>\n`;
  xml += `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
