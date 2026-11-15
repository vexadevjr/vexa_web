# Vexstar Development: Full-Stack Platform

```
frontend/   React 18 + Vite + Tailwind CSS + react-router-dom
backend/    Express + MongoDB (mongoose), JWT auth, helmet, rate limiting, input sanitising
render.yaml Render blueprint (single web service: Express serves the API and the built frontend)
```

## What is new in this version

| Feature | Where |
| --- | --- |
| Admin panel at `/admin` (visitor IP table + day/week/month/year charts, products & prices, categories, site content, FAQ, support inbox with replies, orders, review moderation, customers) | `frontend/src/pages/admin/*`, `backend/routes/admin.js` |
| Real customer reviews (login required, one per customer, moderated). Satisfaction % = total stars / (5 x review count) over published reviews | `backend/routes/reviews.js`, `frontend/src/components/Reviews.jsx` |
| Support replies visible to the customer (Customer Panel, or ticket number + e-mail lookup on the Contact page) | `backend/routes/contact.js`, `TicketThread.jsx`, `TicketLookup.jsx` |
| Google and Discord login next to e-mail login | `backend/routes/auth.js`, `AuthModal.jsx` |
| Account area: avatar menu (Google/Discord photo or initial) -> Siparişlerim (progress tracker), Destek Taleplerim (inbox + replies), Ayarlar (name, change/add password, delete account) | `frontend/src/pages/Account.jsx`, `UserMenu.jsx` |
| Vexstar logo + favicon set | `frontend/src/assets`, `frontend/public` |

### Admin panel setup

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters) in the Render dashboard / `backend/.env`. The admin account exists **only** in environment variables.
2. Recommended: set `ADMIN_TOTP_SECRET` (base32) and add it to Google Authenticator / Authy as a manual key. The login form then asks for the 6-digit code.
3. Open `https://your-site/admin`. The first time you open "Ürünler & Fiyatlar" the built-in catalog is copied into MongoDB so it can be edited.

Admin security: credentials only in env vars (bcrypt-hashed in memory, constant-time checks), optional TOTP with replay protection,
5-attempt lockout + strict rate limit, separate JWT signing key and audience, 2-hour `HttpOnly` + `SameSite=Strict` + `Secure` cookie scoped to
`/api/admin`, CSRF header required on every write, `no-store` + `noindex` headers, strict CSP, whitelist validation on every write,
only `https://` links accepted in editable content (blocks `javascript:` URLs), admin code is a lazily loaded chunk that normal visitors never download.

### Google / Discord login setup

Redirect URLs to register: `<PUBLIC_URL>/api/auth/google/callback` and `<PUBLIC_URL>/api/auth/discord/callback`.
Put the client IDs/secrets in `GOOGLE_CLIENT_ID/SECRET` and `DISCORD_CLIENT_ID/SECRET`. Only verified e-mail addresses are accepted.

### Visitor data

Each page view stores IP, path and browser string and is deleted automatically after 400 days. IP addresses are personal data (KVKK/GDPR):
mention this in your privacy policy.

## Single sources of truth

| What | Where |
| --- | --- |
| Links, brand colours, contact info, prices, FAQ, portfolio, reviews, product catalog | `frontend/src/config/siteConfig.js` |
| Secrets and server settings (`MONGODB_URI`, `PORT`, `JWT_SECRET`, `CORS_ORIGIN`) | `backend/config/appConfig.js` reading `backend/.env` (see `backend/.env.example`) |

`siteConfig.catalog` is also what `backend/seed.js` writes to MongoDB. After changing prices or products, run
`npm run seed` to update the database. Orders always use the price stored on the server.

Everything marked PLACEHOLDER or `sample: true` in `siteConfig.js` (prices, contact details, guarantees,
portfolio entries) is example content (most of it can be changed from `/admin`). Replace it with real information before going live.

## Local development

```
npm install --prefix backend
npm install --prefix frontend
cp backend/.env.example backend/.env      # then fill in MONGODB_URI and JWT_SECRET
npm run seed                              # optional: load products into MongoDB
npm run dev:backend                       # API on http://localhost:5000
npm run dev:frontend                      # http://localhost:5173 (proxies /api to the backend)
```

Without `MONGODB_URI` the site still runs: products come from `siteConfig.js`; orders, contact and login
return a "temporarily unavailable" message.

## API

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/api/status` | health check |
| GET | `/api/products` | `?category=discord-bot&sub=Müzik&q=...` |
| GET | `/api/products/:slug` | |
| POST | `/api/orders` | guests or logged-in users, price taken from the catalog |
| GET | `/api/orders/mine` | JWT required |
| POST | `/api/contact` | support ticket / quote request |
| POST | `/api/auth/register`, `/api/auth/login` | bcrypt + JWT |
| GET | `/api/auth/me` | JWT required |
| GET | `/api/auth/google`, `/api/auth/discord` | start social login |
| GET/POST | `/api/reviews` | public list + stats / logged-in customers post a review |
| GET | `/api/stats` | live figures (delivered orders, customers, satisfaction) |
| GET | `/api/content` | admin-edited site content |
| POST | `/api/track` | page-view beacon |
| GET/POST | `/api/contact/mine`, `/lookup`, `/reply` | customer view of support tickets |
| * | `/api/admin/*` | admin only (cookie session) |

## Security

helmet headers, `express-rate-limit` (global, login and form limits), `express-mongo-sanitize`, CORS limited to
`CORS_ORIGIN`, bcrypt password hashing (12 rounds), JWT (HS256), body size limit, and server-side validation that
rejects non-string fields and strips control characters and angle brackets.

## Deploy on Render

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. Push this folder to a Git repository and choose **New, Blueprint** in Render (`render.yaml` is detected).
3. Paste `MONGODB_URI` when prompted. `JWT_SECRET` is generated automatically.
4. After the first deploy run `npm run seed` once (Render shell, or locally with the same `MONGODB_URI`).

The build installs the frontend (including dev dependencies for Vite), builds `frontend/dist`, and installs the
backend. In production Express serves `frontend/dist` with a fallback to `index.html` for client-side routes.

### Cookies & loading

A cookie banner (accept all / only necessary / manage) stores the choice in the first-party cookie `vx_consent` (180 days). Visit analytics (`/api/track`) only run with the *analytics* choice; the *functional* choice lets the browser cache site content and products so reloads open instantly. The signed-in user is restored from the session before the first paint, and the page waits for real content instead of flashing defaults. Visitors can reopen the choices from "Çerez Tercihleri" in the sidebar.

### SEO & link previews

* The server renders per-page `<title>`, description, canonical, hreflang, Open Graph / Twitter tags (1200x630 `og-image.jpg`), JSON-LD (Organization, WebSite, WebPage, Product + Offer from your real prices, FAQPage, BreadcrumbList) and a crawlable text snapshot (`backend/seo/render.js`). Titles, descriptions and H1s live in `siteConfig.seo` in `frontend/src/config/siteConfig.js`.
* `/sitemap.xml` and `/robots.txt` are generated dynamically; `www.` -> non-`www`, http -> https and trailing slashes are 301-redirected; unknown URLs return a real 404; account pages are `noindex`.
* Gzip compression, long-lived caching for hashed assets and a code-split admin bundle keep pages fast.
* After deploying: set `SITE_URL`, verify the domain in Google Search Console and Bing Webmaster Tools (add the verification values to the env vars), submit `https://vexstar.com.tr/sitemap.xml`, and use "Request indexing" for the home page. Rankings for competitive keywords also depend on backlinks (Discord server, GitHub, YouTube, directories), real reviews and fresh content: no code can guarantee position #1.
* Test previews with the Facebook Sharing Debugger, X Card Validator and Discord (paste the link in any channel).

### Legal pages

`/gizlilik-politikasi` (KVKK aydınlatma), `/kullanim-sartlari` and `/cerez-politikasi` are generic templates written for this site's real data flows (accounts, orders, tickets, reviews, visit logs, Google/Discord login). Have a lawyer review them and fill in your company details (trade name, address, tax number) before going live. They are linked from the footer, the cookie bar and the sign-in window.

### Portfolio, product photos, discounts

* **Admin -> Portföy**: add your past bots/sites with photos (auto-resized, stored in MongoDB and served from `/api/media/<id>`), description, tags and an optional project link. Visitors swipe or use the arrows to browse the photos; click opens a full-size viewer.
* **Admin -> Ürünler & Fiyatlar**: the short name (slug) is editable, products can carry up to 6 sample photos, delivery time is free text ("5-7 iş günü"), and filling **Eski fiyat** turns a product into a discounted one (old price struck through, big sale price, "%N İNDİRİM" badge). The "Başlangıç" tag is a separate chip above the price so all price blocks line up.
