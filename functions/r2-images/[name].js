export async function onRequest(context) {
  const imageName = context.params.name.trim();
  const bucket = context.env.r2_images; // ✅ matches binding name

  console.log("r2-images/[name].js invoked");
  console.log(`Fetching image: ${imageName} from ${bucket}`);
  console.log(`📦 Fetching image: ${imageName} from R2 bucket: ${bucket?.name || '[binding: r2_images]'}`);

  if (!bucket || typeof bucket.get !== "function") {
    console.warn("R2 binding 'r2_images' not available");
    return new Response("R2 not configured", { status: 500 });
  }

  const object = await bucket.get(imageName);

  if (!object) {
    console.warn(`Image '${imageName}' not found in R2`);
    return new Response("Image not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "image/png",
      "Cache-Control": "public, max-age=3600",
      "X-R2-Served": "true"
    }
  });
}
