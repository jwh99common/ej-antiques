export async function onRequest(context) {
  let products = [];

  try {
    const stmt = context.env.gallery_db.prepare(
      "SELECT * FROM ej_antiques_products ORDER BY created_at DESC"
    );

    const { results } = await stmt.all();
    products = results;

  } catch (err) {
    console.error("D1 query failed:", err);
    return new Response(
      JSON.stringify({ error: "Database error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(products), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
