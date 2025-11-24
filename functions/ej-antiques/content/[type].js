export async function onRequest(context) {
  const fileName = context.params.type?.trim(); // e.g., "about.txt"
  const bucket = context.env.ej_antiques;

  console.log(`📄 Request for content file: ${fileName}`);
  console.log("🔍 Full request URL:", context.request.url);
  console.log("📦 R2 key being fetched:", `content/${fileName}`);

  if (!fileName || !bucket || typeof bucket.get !== "function") {
    console.warn("Missing file name or R2 binding");
    return new Response("Invalid request", { status: 400 });
  }

  const object = await bucket.get(`content/${fileName}`);

  if (!object) {
    console.warn(`Content file '${fileName}' not found in R2`);
    return new Response(
      `<div class="fallback-message">No content available for <strong>${fileName}</strong>.</div>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-R2-Served": "false"
        }
      }
    );
  }

  const content = await object.text();
  const isEmpty = !content.trim();

  return new Response(
    isEmpty
      ? `<div class="fallback-message">This section is currently empty. Please check back soon.</div>`
      : content,
    {
      status: 200,
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-R2-Served": isEmpty ? "false" : "true"
      }
    }
  );
}
