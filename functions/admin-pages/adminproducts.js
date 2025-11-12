import { isAuthorized } from '../utils/auth.js';

export async function onRequest({ request, env }) {

  console.log("adminproducts.js invoked:", new Date().toISOString());

  if (!isAuthorized(request)) {
    //return Response.redirect("/admin-login", 302);
    return Response.redirect(new URL("/admin-login", request.url), 302);

  }

  const rewritten = new Request(`${new URL(request.url).origin}/admin-pages/admin-products.html`, request);
  return env.ASSETS.fetch(rewritten);
}
