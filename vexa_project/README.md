# Vexa Development — Full-Stack Base

```
frontend/   React + Vite + Tailwind CSS
backend/    Express API (cors, helmet, express.json)
render.yaml Render blueprint (single web service)
```

## Local development

```
npm install --prefix backend
npm install --prefix frontend
npm run dev:backend     # API on http://localhost:5000
npm run dev:frontend    # Vite dev server, /api is proxied to the backend
```

API: `GET /api/status`, `GET /api/services`.

## Links and sections

All external URLs, in-page anchors and the statistics live in `frontend/src/config/siteConfig.js`.

## Deploy on Render

Push this folder to a Git repository, then in Render choose **New → Blueprint** and select the repo
(`render.yaml` is picked up automatically). Or create a **Web Service** manually:

| Setting | Value |
| --- | --- |
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/status` |

The build installs the frontend (including dev dependencies needed by Vite), builds `frontend/dist`,
and installs the backend. In production Express serves `frontend/dist` and falls back to `index.html`
for client-side routes, so the frontend and API share one origin and no CORS setup is needed.

## Environment variables

- `PORT` — set by Render automatically (defaults to 5000 locally).
- `CORS_ORIGIN` — optional, comma-separated allowed origins. Open to all when unset.
