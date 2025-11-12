import { isAuthorized } from '../utils/auth.js';

export async function onRequest({ request, env }) {
  if (!isAuthorized(request)) {
    return Response.redirect("/admin-login", 302);
  }

  const rewritten = new Request(`${new URL(request.url).origin}/admin-pages/admin-dashboard.html`, request);
  console.log ("admin Dashboard:", rewritten.url);
  console.log("Cookie header:", request.headers.get("Cookie"));

  return env.ASSETS.fetch(rewritten);
}
