const encoder = new TextEncoder();

function encodeBase64(bytes) {
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join("")).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return encodeBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function constantTimeEquals(left, right) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  return difference === 0;
}

export async function passwordMatches(password, env) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: decodeBase64(env.ADMIN_PASSWORD_SALT), iterations: 310000, hash: "SHA-256" }, key, 256);
  const actual = encodeBase64(new Uint8Array(bits));
  const expected = env.ADMIN_PASSWORD_HASH;
  return constantTimeEquals(actual, expected);
}

export async function createSession(env) {
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const value = `admin.${expires}`;
  return `${value}.${await sign(value, env.ADMIN_SESSION_SECRET)}`;
}

export async function isAuthenticated(request, env) {
  const token = request.headers.get("Cookie")?.match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1];
  if (!token) return false;
  const [name, expires, signature] = token.split(".");
  const value = `${name}.${expires}`;
  return name === "admin" && Number(expires) > Date.now() && constantTimeEquals(signature, await sign(value, env.ADMIN_SESSION_SECRET));
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
