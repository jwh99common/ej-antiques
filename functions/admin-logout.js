export async function onRequest() {
  const response = new Response(null, {
    status: 302,
    headers: { Location: "/admin-login" }
  });

  response.headers.append("Set-Cookie", "admin_auth=; Path=/; Max-Age=0");
  return response;
}
