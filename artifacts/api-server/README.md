# @workspace/api-server — Express REST API

The Bridgepath Africa backend: an Express 5 / Node.js 24 REST API serving authenticated job seekers and employers.

## Structure

```
src/
├── index.ts          Entry point — starts the HTTP server
├── app.ts            Express app setup: Helmet, CORS, rate limiting, routes
├── routes/
│   ├── auth.ts       Authentication — login, signup, magic-link, OAuth, change-password
│   ├── jobs.ts       Job CRUD — create, list, detail, close
│   ├── applications.ts  Job applications — submit, list (role-scoped), update status
│   ├── cv-reviews.ts OpenAI-powered CV analysis
│   ├── contact.ts    Contact form persistence + email notification
│   ├── profiles.ts   Profile read/write
│   ├── oauth.ts      Google OAuth callback handler
│   └── og-image.ts   Dynamic Open Graph image generation
└── lib/
    ├── auth.ts       HMAC token generation/verification, requireAuth middleware
    ├── email.ts      Resend email client
    ├── rateLimit.ts  Per-route rate limit presets
    └── openai.ts     OpenAI client wrapper
```

## Running

```bash
# Development (hot reload)
pnpm --filter @workspace/api-server run dev

# Production build
pnpm --filter @workspace/api-server run build

# Start production bundle
node dist/index.js
```

## Environment variables

See [`.env.example`](../../.env.example) at the monorepo root for the full reference.

Required: `DATABASE_URL`, `TOKEN_SECRET`, `PASSWORD_SALT`, `OAUTH_BASE_URL`

## Uploads

User-uploaded files (CVs, avatars) are stored in `uploads/`. This directory is gitignored — provision persistent storage (S3 / Supabase Storage / Cloudflare R2) in production.
