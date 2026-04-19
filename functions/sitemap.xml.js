export async function onRequest(context) {
  const db = context.env.gallery_db;
  const BASE_URL = "https://ej-antiques.co.uk";

  /* -------------------------------------------------------
     1. STATIC PAGES (manual list)
     ------------------------------------------------------- */

  const staticUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/products`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/about`,
    `${BASE_URL}/sold`
    `${BASE_URL}/services`

  ];

  /* -------------------------------------------------------
     2. DYNAMIC PRODUCT PAGES FROM D1
     ------------------------------------------------------- */

  let productUrls = [];

  try {
    const { results } = await db
      .prepare("SELECT slug, created_at FROM ej_antiques_products")
      .all();

    productUrls = results.map(row => {
      const lastmod = row.created_at
        ? new Date(row.created_at).toISOString()
        : null;

      return {
        loc: `${BASE_URL}/product-slug/${row.slug}`,
        lastmod
      };
    });
  } catch (err) {
    console.error("Error querying product slugs", err);
  }

  /* -------------------------------------------------------
     3. BUILD XML
     ------------------------------------------------------- */

  const xmlParts = [];

  xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  xmlParts.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);

  staticUrls.forEach(url => {
    xmlParts.push(`
      <url>
        <loc>${url}</loc>
      </url>
    `);
  });

  productUrls.forEach(item => {
    xmlParts.push(`
      <url>
        <loc>${item.loc}</loc>
        ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}
      </url>
    `);
  });

  xmlParts.push(`</urlset>`);

  return new Response(xmlParts.join("\n"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
