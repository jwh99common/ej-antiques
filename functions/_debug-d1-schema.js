// Temporary debug endpoint to expose D1 schema for `ej_antiques_products`.
// Add this file, then run `wrangler dev` and visit /_debug-d1-schema to view the schema.
export async function onRequest({ env }) {
  try {
    const { results: pragma } = await env.gallery_db.prepare("PRAGMA table_info('ej_antiques_products')").all();
    const { results: createRow } = await env.gallery_db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='ej_antiques_products'").all();
    const createSql = (createRow && createRow.length && createRow[0].sql) ? createRow[0].sql : null;
    return new Response(JSON.stringify({ pragma, createSql }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
