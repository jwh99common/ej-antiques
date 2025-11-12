export function setCookie(response, name, value, options = {}) {
  const parts = [`${name}=${value}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  response.headers.append("Set-Cookie", parts.join("; "));
}
