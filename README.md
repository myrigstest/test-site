# Meie Päev

Responsive one-page starter site for a wedding photographer, built with HTML5, Tailwind CSS (CDN), and vanilla JavaScript.

## Local preview

Open `index.html` in a browser, or serve the repository with any static-file server.

## Cloudflare Pages

Connect this repository to Cloudflare Pages. Set the build command to empty and the output directory to `/`. In **Settings → Functions**, bind a D1 database as `DB`, then run `migrations/0001_initial.sql` against it.

Set these encrypted credential/session secrets in **Settings → Environment variables** (for both Preview and Production):

- `ADMIN_USERNAME` — administrator username (use `admin` initially).
- `ADMIN_PASSWORD_SALT` — random Base64URL salt.
- `ADMIN_PASSWORD_HASH` — PBKDF2-SHA-256 hash, 310,000 iterations, encoded as Base64URL.
- `ADMIN_SESSION_SECRET` — a long random secret used to sign the session cookie.

The admin dashboard is available at `/admin`. It shows reservations in the calendar and enables editing public landing-page text. Password data is intentionally not stored in `pass.xml`: any repository file deployed by Pages is public, so credentials must be protected as Cloudflare environment secrets.