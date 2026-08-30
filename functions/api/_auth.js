const encoder = new TextEncoder();

function encodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return encodeBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

export async function passwordMatches(password, env) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: decodeBase64(env.ADMIN_PASSWORD_SALT), iterations: 310000, hash: "SHA-256" }, key, 256);
  const actual = encodeBase64(new Uint8Array(bits));
  const expected = env.ADMIN_PASSWORD_HASH;
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
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
  return name === "admin" && Number(expires) > Date.now() && signature === await sign(value, env.ADMIN_SESSION_SECRET);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
