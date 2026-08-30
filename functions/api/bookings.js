import { isAuthenticated, unauthorized } from "./_auth.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  const { name, email: address, date, message } = await request.json().catch(() => ({}));
  if (![name, address, date, message].every(value => typeof value === "string" && value.trim()) || !emailPattern.test(address) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Kontrollige palun sisestatud andmeid." }, { status: 400 });
  }
  await env.DB.prepare("INSERT INTO bookings (name, email, event_date, message) VALUES (?, ?, ?, ?)").bind(name.trim(), address.trim(), date, message.trim()).run();
  return Response.json({ ok: true }, { status: 201 });
}

export async function onRequestGet({ request, env }) {
  if (!(await isAuthenticated(request, env))) return unauthorized();
  const { results } = await env.DB.prepare("SELECT id, name, email, event_date, message, created_at FROM bookings ORDER BY event_date, created_at DESC").all();
  return Response.json(results);
}
