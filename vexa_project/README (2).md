# Vexa Development: Full-Stack Platform

```
frontend/   React 18 + Vite + Tailwind CSS + react-router-dom
backend/    Express + MongoDB (mongoose), JWT auth, helmet, rate limiting, input sanitising
render.yaml Render blueprint (single web service: Express serves the API and the built frontend)
```

## Single sources of truth

| What | Where |
| --- | --- |
| Links, brand colours, contact info, prices, FAQ, portfolio, reviews, product catalog | `frontend/src/config/siteConfig.js` |
| Secrets and server settings (`MONGODB_URI`, `PORT`, `JWT_SECRET`, `CORS_ORIGIN`) | `backend/config/appConfig.js` reading `backend/.env` (see `backend/.env.example`) |

`siteConfig.catalog` is also what `backend/seed.js` writes to MongoDB. After changing prices or products, run
`npm run seed` to update the database. Orders always use the price stored on the server.

Everything marked PLACEHOLDER or `sample: true` in `siteConfig.js` (prices, contact details, guarantees,
portfolio entries, reviews) is example content. Replace it with real information before going live.

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
