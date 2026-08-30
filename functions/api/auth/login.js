import { createSession, passwordMatches } from "../_auth.js";

export async function onRequestPost({ request, env }) {
  const { username, password } = await request.json().catch(() => ({}));
  if (username !== env.ADMIN_USERNAME || typeof password !== "string" || !(await passwordMatches(password, env))) {
    return Response.json({ error: "Vale kasutajanimi või parool." }, { status: 401 });
  }
  const session = await createSession(env);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": `admin_session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800` }
  });
}
