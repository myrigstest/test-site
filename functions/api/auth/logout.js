export function onRequestPost() {
  return new Response(null, { status: 204, headers: { "Set-Cookie": "admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0" } });
}
