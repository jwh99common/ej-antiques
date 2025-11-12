export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  console.log("📥 Incoming request to admin-r2");

  if (method !== "POST") {
    console.warn("⚠️ Method not allowed:", method);
    return new Response("Method Not Allowed", { status: 405 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    console.warn("⚠️ Invalid content type:", contentType);
    return new Response("Expected multipart form data", { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const rawPath = formData.get("path");

  console.log ("admin-r2: file=", file, " path=", rawPath);
  
  if (!file || !rawPath) {
    console.warn("⚠️ Missing file or path");
    return new Response("Missing file or path", { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || "application/octet-stream";

  // ✅ Use the full user-supplied path as the R2 key
  const key = rawPath.trim();

  console.log("📤 Uploading to R2 key:", key);
  console.log("🧾 MIME type:", mimeType);
  try {
    await env.r2_images.put(key, arrayBuffer, {
      httpMetadata: { contentType: mimeType }
    });
    console.log("✅ Upload successful");
  } catch (err) {
    console.error("❌ Upload failed:", err);
    return new Response("Upload failed", { status: 500 });
  }

  // ✅ Return the same path as the public URL
  const publicUrl = key;
  console.log("🔗 Public URL:", publicUrl);

  return Response.json({ url: publicUrl });
}
