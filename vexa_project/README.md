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
