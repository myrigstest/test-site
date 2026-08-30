import { isAuthenticated, unauthorized } from "./_auth.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT content_key, content_value FROM site_content").all();
  return Response.json(Object.fromEntries(results.map(row => [row.content_key, row.content_value])));
}

export async function onRequestPut({ request, env }) {
  if (!(await isAuthenticated(request, env))) return unauthorized();
  const content = await request.json().catch(() => null);
  if (!content || typeof content !== "object") return Response.json({ error: "Invalid content." }, { status: 400 });
  const permitted = new Set(["hero_eyebrow", "hero_title", "hero_cta", "booking_title", "booking_text"]);
  const entries = Object.entries(content).filter(([key, value]) => permitted.has(key) && typeof value === "string" && value.length <= 500);
  if (!entries.length) return Response.json({ error: "No valid changes." }, { status: 400 });
  const statements = entries.map(([key, value]) => env.DB.prepare("INSERT INTO site_content (content_key, content_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(content_key) DO UPDATE SET content_value = excluded.content_value, updated_at = CURRENT_TIMESTAMP").bind(key, value.trim()));
  await env.DB.batch(statements);
  return Response.json({ ok: true });
}
