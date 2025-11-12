export async function isAuthorizedXYZ(env, request) {
  const url = new URL(request.url);
  const input = url.searchParams.get('pw');

  console.log ("isAuthorized called url=", url);
  console.log('Checking admin password', "input=", "<", input ,">");

  if (!env.bens_bikes || typeof env.bens_bikes.get !== 'function') {
    return false;
  }

  const stored = await env.bens_bikes.get('password');
  console.log('Stored password:', "<", stored, ">");

  return input && input === stored;
}

export function isAuthorized(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.includes("admin_auth=true");
}
