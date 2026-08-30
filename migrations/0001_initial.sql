CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  event_date TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS bookings_event_date ON bookings(event_date);

CREATE TABLE IF NOT EXISTS site_content (
  content_key TEXT PRIMARY KEY,
  content_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_content (content_key, content_value) VALUES
  ('hero_eyebrow', 'Pulmafotograafia Eestis ja mujal'),
  ('hero_title', 'Hetked, mis jäävad teie omaks.'),
  ('hero_cta', 'Räägime teie päevast'),
  ('booking_title', 'Kas see on teie päev?'),
  ('booking_text', 'Kirjutage mõni sõna oma plaanidest. Vastan teile kahe tööpäeva jooksul.');
