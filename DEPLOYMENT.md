# Deployment Guide — Bridgepath Africa

> Production deployment instructions for the monorepo.

---

## Overview

The application has two deployable artefacts:

| Artefact | Type | Build output |
|---|---|---|
| Frontend | Static SPA | `artifacts/bridgepath/dist/` |
| API server | Node.js process | `artifacts/api-server/dist/index.js` |

Both can be deployed to the same host, or split across a CDN (frontend) and a Node.js host (API).

---

## Prerequisites

- Node.js ≥ 20 on the build/host machine
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL ≥ 14 (managed service recommended)
- All environment variables from `.env.example` populated

---

## Step 1 — Set environment variables

Set all required variables in your hosting platform dashboard. Do not commit `.env` to version control.

```bash
DATABASE_URL=postgresql://user:password@host:5432/bridgepath
TOKEN_SECRET=<64-char random hex>
PASSWORD_SALT=<32-char random hex>
OAUTH_BASE_URL=https://yourdomain.com
NODE_ENV=production
# + optional variables as needed (OPENAI, RESEND, GOOGLE, STRIPE)
```

Generate secrets:
```bash
openssl rand -hex 64   # TOKEN_SECRET
openssl rand -hex 32   # PASSWORD_SALT
```

---

## Step 2 — Apply the database schema

Run once against the production database:

```bash
DATABASE_URL=postgresql://prod-conn-string pnpm --filter @workspace/db run push
```

For subsequent schema changes, generate a migration file instead of using `push` in production:

```bash
DATABASE_URL=postgresql://prod-conn-string pnpm --filter @workspace/db run generate
# Review the generated SQL, then apply:
DATABASE_URL=postgresql://prod-conn-string pnpm --filter @workspace/db run migrate
```

---

## Step 3 — Build

```bash
pnpm install --frozen-lockfile   # CI-safe install
pnpm build                       # TypeScript check + build both artefacts
```

Output:
- `artifacts/bridgepath/dist/` — static frontend
- `artifacts/api-server/dist/index.js` — bundled API server

---

## Step 4 — Deploy

### Option A: Split deployment (recommended)

**Frontend → CDN (Netlify / Cloudflare Pages)**

A `netlify.toml` is included at the project root:

```toml
[build]
  command   = "pnpm --filter @workspace/bridgepath run build"
  publish   = "artifacts/bridgepath/dist"

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

Connect the repository to Netlify and set the above build settings. All `/*` paths are rewritten to `index.html` for SPA routing.

**API server → Node.js host (Railway / Render / Fly.io)**

Start command:
```bash
node artifacts/api-server/dist/index.js
```

Set `PORT` to the port your host expects. The server binds to `0.0.0.0:${PORT}`.

**CORS** — set `OAUTH_BASE_URL` to the frontend domain. The API server reads this to configure CORS for the production domain.

---

### Option B: Single-host deployment

Serve both the frontend static files and the API from one Node.js server using a reverse proxy (nginx / Caddy):

```nginx
server {
  listen 443 ssl;
  server_name yourdomain.com;

  # API
  location /api/ {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Frontend SPA
  location / {
    root /srv/bridgepath/dist;
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Step 5 — Register OAuth redirect URIs

For Google OAuth, add to the Google Cloud Console:

```
https://yourdomain.com/api/auth/oauth/google/callback
```

---

## Step 6 — Update sitemap

Edit `artifacts/bridgepath/public/sitemap.xml` and replace all occurrences of the placeholder domain with `https://yourdomain.com`. Redeploy the frontend.

---

## Rollback

To roll back to a previous release:

1. Restore the previous build artefacts (or re-deploy the previous Git tag).
2. If the schema was migrated, run the down migration or restore from a database snapshot.
3. Check that environment variables have not changed.

---

## Health check

The API server exposes a health endpoint:

```
GET /api/health
→ 200 { "status": "ok", "uptime": <seconds> }
```

Configure your uptime monitor and load balancer to poll this endpoint.

---

## Monitoring checklist

- [ ] Uptime monitor on `https://yourdomain.com` and `https://yourdomain.com/api/health`
- [ ] Log aggregator receiving Pino JSON logs from the API server
- [ ] Alert on sustained 5xx error rate > 1%
- [ ] Alert on p95 API response time > 2 s
- [ ] Database connection pool saturation alerts (if using PgBouncer / Supabase)
- [ ] Automated daily database backups confirmed
