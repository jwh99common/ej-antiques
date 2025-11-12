import { setCookie } from './utils/cookies.js';

export async function onRequest({ request, env }) {
  const formData = await request.formData();
  const input = formData.get('pw');
  const stored = await env.ej_admin.get('password');

  //
  //if (input !== stored) {
  //  return new Response("Unauthorized", { status: 403 });
  // }

  // Create headers and set cookie BEFORE creating the response
  const headers = new Headers({ Location: "/admin-pages/admindashboard" });
  setCookie({ headers }, "admin_auth", "true", {
    httpOnly: true,
    path: "/",
    maxAge: 3600
  });

  console.log("Admin login successful:", new Date().toISOString());

  return new Response(null, {
    status: 302,
    headers
  });
}
