# Bridgepath Africa — Platform Engineering Reference

> **Connecting African professionals with global employers.**  
> Production-grade HR and talent marketplace built on a TypeScript monorepo.  
> Live in Ghana · Kenya expansion in progress.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Repository Structure](#4-repository-structure)
5. [Prerequisites](#5-prerequisites)
6. [Local Development Setup](#6-local-development-setup)
7. [Environment Variables](#7-environment-variables)
8. [Database Schema](#8-database-schema)
9. [API Reference](#9-api-reference)
10. [Authentication & Authorisation](#10-authentication--authorisation)
11. [Code Generation Pipeline](#11-code-generation-pipeline)
12. [Security Controls](#12-security-controls)
13. [Design System](#13-design-system)
14. [Deployment](#14-deployment)
15. [Contributing](#15-contributing)
16. [Glossary](#16-glossary)
17. [License](#17-license)

---

## 1. Project Overview

Bridgepath Africa is a premium, full-stack HR and talent marketplace connecting ambitious global employers with Africa's fast-growing professional workforce. The platform delivers:

| Capability | Description |
|---|---|
| **Job marketplace** | Employers post vacancies; job seekers search, filter, and apply with cover letters and CV uploads |
| **Candidate pipeline** | Kanban-style application tracking: Applied → Reviewed → Shortlisted → Interview → Offer Made → Hired |
| **AI CV Review** | GPT-powered analysis — structured score, strengths, improvement areas, and career insights |
| **Human HR Review** | Premium paid review ($15–20 via Stripe); expert delivers a written assessment |
| **Employer dashboard** | Real-time KPIs, pipeline management, candidate discovery, and broadcast email |
| **Job-seeker dashboard** | Application tracking, saved jobs, profile management, document upload |
| **Admin console** | Platform-wide analytics, user management, job moderation, segmented broadcast email |
| **Multi-channel auth** | Email/password, magic link (passwordless), Google OAuth 2.0, LinkedIn OAuth 2.0 |
| **Demo mode** | Pre-seeded accounts for instant, no-signup stakeholder exploration |
| **Transactional email** | Welcome, verification, password-reset, magic-link, and HR review notifications via Resend |
| **HR consultancy pages** | Employment of Record, Payroll & Tax, Executive Search, Staff Outsourcing service pages |
| **Insights / Blog** | CMS-backed long-form articles on African HR, compliance, and career development |
| **GDPR compliance** | Cookie consent, Privacy Policy, Terms of Service, Cookie Policy, granular consent management |

---

## 2. Architecture

### System diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Browser                             │
│  React 19 SPA · Vite 7 · TailwindCSS 4 · TanStack Query · Wouter  │
│  Radix UI primitives · shadcn/ui · Framer Motion · Recharts        │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  HTTPS
                            │  /api/*  →  API server
                            │  /*      →  SPA (production) / Vite proxy (dev)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Express 5  REST API                            │
│                                                                     │
│  Middleware chain (in order):                                       │
│    Request ID injection → CORS → Pino HTTP logger →                │
│    Cookie parser → Global rate limiter → JSON body parser →        │
│    Static file serving → Route handlers → Global error handler     │
│                                                                     │
│  Integrations:                                                      │
│    OpenAI (gpt-4o-mini)  ·  Stripe  ·  Resend  ·  Multer+Sharp   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  Drizzle ORM  ·  pg (node-postgres)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL 16                               │
│  users · profiles · jobs · applications · cv_reviews               │
│  saved_jobs · application_feedback · contact_submissions           │
└─────────────────────────────────────────────────────────────────────┘
```

### Network topology

| Environment | Frontend | Backend | Routing |
|---|---|---|---|
| **Development** | Vite dev server `0.0.0.0:5000` | Express `localhost:8080` | Vite proxies `/api/*` → `localhost:8080` |
| **Production** | Static files served by Express | Express `localhost:5000` | `/api/*` → handlers; `/*` → `index.html` |

### Code generation pipeline

```
lib/api-spec/openapi.yaml   ← SINGLE SOURCE OF TRUTH (OpenAPI 3.1)
        │
        ├── Orval ──▶ lib/api-zod/           (Zod schemas — backend validation)
        └── Orval ──▶ lib/api-client-react/  (TanStack Query hooks — frontend)
```

> **Rule:** Never edit generated files directly. All API contract changes start in `openapi.yaml`.

---

## 3. Technology Stack

### Frontend (`artifacts/bridgepath/`)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | React | 19.1.0 | Concurrent features, `use()` hook |
| Build tool | Vite | 7.x | HMR, esbuild transform, TailwindCSS plugin |
| Language | TypeScript | ~5.9 | Strict mode enforced |
| Styling | TailwindCSS | 4.x | JIT, CSS variables design tokens |
| Components | Radix UI + shadcn/ui | — | Accessible, headless primitives |
| Routing | Wouter | 3.x | ~1.5 kB, pattern-matched |
| Server state | TanStack Query | 5.x | Caching, mutation, optimistic updates |
| Forms | React Hook Form + Zod | — | Schema-validated, type-safe |
| Animation | Framer Motion | 12.x | Page transitions, micro-interactions |
| Charts | Recharts | 2.x | Admin analytics |
| Icons | Lucide React | — | Consistent SVG icon set |
| Error handling | Custom `ErrorBoundary` | — | Per-route isolation, inline retry mode |

### Backend (`artifacts/api-server/`)

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | ES modules (`"type": "module"`) |
| Framework | Express | 5.x | Async error propagation native |
| Language | TypeScript | ~5.9 | Compiled to `dist/index.mjs` via esbuild |
| ORM | Drizzle ORM | 0.45.x | Schema-first, zero magic |
| Database driver | pg (node-postgres) | 8.x | Native PostgreSQL protocol |
| Logging | Pino + pino-http | 9.x / 10.x | Structured JSON, `x-request-id` correlation |
| Password hashing | bcrypt | 6.x | Cost factor 12; auto-migration from SHA-256 |
| File processing | Multer + Sharp | — | Upload parsing + image optimisation |
| AI | OpenAI SDK | 6.x | `gpt-4o-mini` model |
| Payments | Stripe SDK | 22.x | Checkout sessions, server-side verification |
| Email | Resend SDK | 6.x | Transactional, HTML templates |
| Rate limiting | express-rate-limit | 8.x | Global (120 rq/min) + auth (20/15 min) |
| Build | esbuild | 0.28.x | Single-file bundle with source maps |

### Shared library packages (`lib/`)

| Package name | Purpose |
|---|---|
| `@workspace/db` | Drizzle instance, all table schemas, `drizzle-zod` insert/select validators |
| `@workspace/api-spec` | `openapi.yaml` — source of truth for the API contract |
| `@workspace/api-zod` | Auto-generated Zod schemas (do not edit manually) |
| `@workspace/api-client-react` | Auto-generated TanStack Query hooks + Axios client (do not edit manually) |
| `@workspace/integrations-openai` | Shared OpenAI client, `generateImageBuffer`, `batchProcess` utilities |

---

## 4. Repository Structure

```
bridgepath-africa/
│
├── artifacts/                          # Deployable applications
│   │
│   ├── api-server/                     # Express REST API
│   │   ├── src/
│   │   │   ├── app.ts                  # Express app factory + full middleware chain
│   │   │   ├── index.ts                # Server entry point (port binding, localhost)
│   │   │   ├── routes/
│   │   │   │   ├── index.ts            # Router composition
│   │   │   │   ├── health.ts           # GET /healthz — liveness probe
│   │   │   │   ├── auth.ts             # Register, login, logout, verify-email, magic-link
│   │   │   │   ├── oauth.ts            # Google & LinkedIn OAuth 2.0 callbacks
│   │   │   │   ├── jobs.ts             # CRUD job listings
│   │   │   │   ├── applications.ts     # Apply, list, pipeline status updates
│   │   │   │   ├── profiles.ts         # Get & update user profiles
│   │   │   │   ├── savedJobs.ts        # Save / unsave jobs
│   │   │   │   ├── cv-reviews.ts       # AI + human CV review workflow
│   │   │   │   ├── payments.ts         # Stripe Checkout session creation + verification
│   │   │   │   ├── stats.ts            # Dashboard statistics
│   │   │   │   ├── admin.ts            # Admin-only: user mgmt, KPIs, broadcast email
│   │   │   │   ├── feedback.ts         # Application feedback (employer → candidate)
│   │   │   │   ├── contact.ts          # Contact form submission
│   │   │   │   ├── chat.ts             # AI assistant chat endpoint
│   │   │   │   ├── uploads.ts          # File upload: avatar (5 MB), CV (10 MB)
│   │   │   │   └── og-image.ts         # Dynamic Open Graph image generation
│   │   │   └── lib/
│   │   │       ├── auth.ts             # Token generation/verification, bcrypt hashing
│   │   │       ├── limiters.ts         # Rate limiter instances
│   │   │       └── logger.ts           # Pino logger configuration
│   │   ├── build.mjs                   # esbuild bundler script (outputs dist/index.mjs)
│   │   └── tsconfig.json
│   │
│   └── bridgepath/                     # React SPA
│       ├── public/                     # Static assets: photos, logos, sitemap, robots.txt
│       ├── src/
│       │   ├── App.tsx                 # Router + providers + per-route ErrorBoundaries
│       │   ├── components/
│       │   │   ├── ErrorBoundary.tsx   # Full-page & inline error boundary (resetKey prop)
│       │   │   ├── layout/             # Navbar, Footer, DashboardLayout, NotificationBell
│       │   │   └── ui/                 # shadcn/ui components + Skeleton, Spinner, etc.
│       │   ├── pages/
│       │   │   ├── home.tsx
│       │   │   ├── auth/               # login, signup, forgot-password, reset, OAuth callback
│       │   │   ├── jobs/               # index (list/search), [id] (detail), new (post job)
│       │   │   ├── dashboard/          # jobseeker, employer, pipeline (Kanban), admin, jobs
│       │   │   ├── cv-review/          # AI review + Stripe-gated human review
│       │   │   ├── profile/            # Profile view + edit
│       │   │   ├── candidates/         # Employer: search + profile view
│       │   │   ├── applications/       # Job seeker: application history
│       │   │   ├── saved-jobs/         # Job seeker: bookmarked jobs
│       │   │   ├── blog/               # index + [slug] (post)
│       │   │   ├── services/           # index + [slug] (service detail)
│       │   │   ├── onboarding/         # jobseeker + employer onboarding flows
│       │   │   └── legal.tsx           # Privacy Policy, Terms, Cookie Policy
│       │   ├── hooks/                  # useSavedJobs and other custom hooks
│       │   └── lib/
│       │       ├── auth.tsx            # AuthProvider, useAuth, token management
│       │       └── utils.ts            # cn(), shared utilities
│       └── vite.config.ts              # Port 5000, host 0.0.0.0, allowedHosts: true, proxy
│
├── lib/                                # Shared workspace packages
│   ├── api-spec/
│   │   └── openapi.yaml                # ⚑ OpenAPI 3.1 — SINGLE SOURCE OF TRUTH (1 178 lines)
│   ├── api-zod/                        # ⚠ Generated — do not edit manually
│   ├── api-client-react/               # ⚠ Generated — do not edit manually
│   ├── db/
│   │   ├── src/schema/                 # Drizzle table definitions (one file per entity)
│   │   └── drizzle.config.ts           # drizzle-kit configuration
│   └── integrations-openai/            # Shared OpenAI client and helpers
│
├── scripts/                            # Maintenance utilities: seed, smoke tests
├── _relaunch_backup/                   # Pre-audit file snapshots
├── .env.example                        # Annotated environment variable reference
├── package.json                        # Workspace root scripts (build, typecheck)
├── pnpm-workspace.yaml                 # Workspace config, dependency catalog, security policy
└── tsconfig.json                       # Root TypeScript project references
```

---

## 5. Prerequisites

| Requirement | Minimum version | Install |
|---|---|---|
| Node.js | 20 LTS | `nvm install 20` or [nodejs.org](https://nodejs.org) |
| pnpm | 10.x | `npm install -g pnpm` |
| PostgreSQL | 15+ | Local: `brew install postgresql` / [postgresql.org](https://www.postgresql.org) |
| OpenSSL | Any | Pre-installed on macOS/Linux |

---

## 6. Local Development Setup

### 6.1 Clone and install

```bash
git clone <repository-url> bridgepath-africa
cd bridgepath-africa
pnpm install
```

> `pnpm install` is enforced. The `preinstall` script in `package.json` blocks `npm install` and `yarn` at the workspace root.

### 6.2 Provision a PostgreSQL database

```bash
# Local PostgreSQL
createdb bridgepath

# Or use a managed service (Neon, Supabase, Railway) and copy the connection string
```

### 6.3 Configure environment variables

```bash
cp .env.example .env
# Open .env and fill in all required values (see §7)
```

Generate the required cryptographic secrets:

```bash
# TOKEN_SECRET — 64-byte hex string (HMAC signing key)
openssl rand -hex 64

# PASSWORD_SALT — 32-byte hex string (legacy SHA-256 migration path)
openssl rand -hex 32
```

### 6.4 Push the database schema

```bash
pnpm --filter @workspace/db run push
```

Runs `drizzle-kit push`, which introspects the Drizzle schema definitions and applies all DDL to the target database. The command is **idempotent** — safe to re-run after schema changes.

### 6.5 Start development servers

```bash
# Terminal 1 — Express API (port 8080, binds to localhost)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Vite frontend (port 5000, binds to 0.0.0.0)
PORT=5000 pnpm --filter @workspace/bridgepath run dev
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:8080`. No CORS or cross-origin configuration is needed during development.

### 6.6 Verify the installation

```bash
# API liveness probe
curl http://localhost:8080/api/healthz
# Expected: {"status":"ok"}

# Open the frontend
open http://localhost:5000
```

### 6.7 Demo accounts

Two pre-configured demo accounts are available for immediate exploration (no email verification required):

| Role | Email | Password |
|---|---|---|
| Job Seeker | `jobseeker@demo.bridgepath.network` | `demo` |
| Employer | `employer@demo.bridgepath.network` | `demo` |

---

## 7. Environment Variables

All variables are annotated in [`.env.example`](./.env.example). The table below is the engineering reference.

### Required — the server will not start without these

| Variable | Format | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | PostgreSQL connection string |
| `TOKEN_SECRET` | 64-char hex string | HMAC-SHA256 signing key for session tokens |
| `PASSWORD_SALT` | 32-char hex string | Salt for the legacy SHA-256 password migration path |
| `OAUTH_BASE_URL` | `https://yourdomain.com` | Public base URL for OAuth redirect URIs and magic-link email links. **No trailing slash.** |

### Optional — features degrade gracefully when absent

| Variable | Default | Feature affected |
|---|---|---|
| `PORT` | `8080` | API server listen port |
| `NODE_ENV` | `development` | Set to `production` to enable rate limiting, strict CORS, and masked 5xx error messages |
| `LOG_LEVEL` | `info` | Pino log level: `trace` / `debug` / `info` / `warn` / `error` / `fatal` |
| `APP_DEV_DOMAIN` | — | Dev tunnel domain (e.g. a local tunnel URL). Overrides `VITE_APP_ORIGIN` for the frontend |
| `OPENAI_API_KEY` | — | Enables AI CV Review. Without this, `POST /api/cv-reviews` returns `503` |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Override for Azure OpenAI or proxy endpoints |
| `RESEND_API_KEY` | — | Enables all transactional emails. Without this, email steps are silently skipped |
| `GOOGLE_CLIENT_ID` | — | Google OAuth 2.0. Register redirect: `{OAUTH_BASE_URL}/api/auth/oauth/google/callback` |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth 2.0 client secret |
| `LINKEDIN_CLIENT_ID` | — | LinkedIn OAuth 2.0. Register redirect: `{OAUTH_BASE_URL}/api/auth/oauth/linkedin/callback` |
| `LINKEDIN_CLIENT_SECRET` | — | LinkedIn OAuth 2.0 client secret |
| `STRIPE_SECRET_KEY` | — | Payment processing for Human HR Review upgrade. Use `sk_test_...` in non-production. Without this, the upgrade button falls back to the contact form |
| `SUPABASE_URL` | — | Only required if using Supabase for file storage (alternative to local disk) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Supabase service role key |

---

## 8. Database Schema

All tables are defined in `lib/db/src/schema/` using Drizzle ORM with PostgreSQL dialect. `drizzle-zod` automatically derives runtime validation schemas from each table definition — these are the schemas used for API request validation.

### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | Auto-increment |
| `email` | `text` | `NOT NULL`, `UNIQUE` | Normalised to lowercase on insert |
| `password_hash` | `text` | `NOT NULL` | bcrypt (cost 12) or legacy SHA-256 |
| `name` | `text` | `NOT NULL` | Display name |
| `role` | `text` | `NOT NULL`, `DEFAULT 'job_seeker'` | `job_seeker` / `employer` / `admin` |
| `email_verified` | `boolean` | `NOT NULL`, `DEFAULT false` | Gate for post-registration access |
| `verification_token` | `text` | — | Short-lived email verification token |
| `verification_token_expires_at` | `timestamp` | — | Token TTL |
| `oauth_provider` | `text` | — | `google` / `linkedin` — null for email accounts |
| `oauth_id` | `text` | — | Provider subject identifier |
| `password_reset_token` | `text` | — | Short-lived password reset token |
| `password_reset_token_expires_at` | `timestamp` | — | Reset token TTL |
| `magic_link_token` | `text` | — | Passwordless sign-in token (30-min TTL) |
| `magic_link_token_expires_at` | `timestamp` | — | Magic link TTL |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |

### `profiles`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | |
| `user_id` | `integer` | `NOT NULL`, `UNIQUE` | FK → `users.id` |
| `bio` | `text` | — | |
| `location` | `text` | — | City / region |
| `country` | `text` | — | |
| `skills` | `text` | `DEFAULT '[]'` | JSON-serialised string array |
| `experience` | `text` | — | Rich text |
| `education` | `text` | — | Rich text |
| `linkedin_url` | `text` | — | |
| `portfolio_url` | `text` | — | |
| `resume_url` | `text` | — | File path or remote URL |
| `avatar_url` | `text` | — | File path or remote URL |
| `company_name` | `text` | — | Employer profiles only |
| `company_website` | `text` | — | Employer profiles only |
| `industry` | `text` | — | |
| `company_size` | `text` | — | Employer profiles only |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |

### `jobs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | |
| `employer_id` | `integer` | `NOT NULL` | FK → `users.id` |
| `title` | `text` | `NOT NULL` | |
| `description` | `text` | `NOT NULL` | Rich text |
| `requirements` | `text` | — | |
| `location` | `text` | `NOT NULL` | |
| `country` | `text` | `NOT NULL` | |
| `type` | `text` | `NOT NULL`, `DEFAULT 'full_time'` | `full_time` / `contract` / `part_time` / `remote` |
| `salary_min` | `integer` | — | Annual, in `currency` |
| `salary_max` | `integer` | — | Annual, in `currency` |
| `currency` | `text` | `DEFAULT 'USD'` | ISO 4217 |
| `industry` | `text` | — | |
| `skills` | `text` | `DEFAULT '[]'` | JSON-serialised string array |
| `is_active` | `boolean` | `NOT NULL`, `DEFAULT true` | Soft visibility toggle |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |

### `applications`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | |
| `job_id` | `integer` | `NOT NULL` | FK → `jobs.id` |
| `applicant_id` | `integer` | `NOT NULL` | FK → `users.id` |
| `cover_letter` | `text` | — | |
| `cv_url` | `text` | — | Uploaded file path |
| `cv_file_name` | `text` | — | Original filename |
| `status` | `text` | `NOT NULL`, `DEFAULT 'pending'` | `pending` / `reviewed` / `shortlisted` / `interview` / `offer` / `hired` / `rejected` |
| `viewed_at` | `timestamp` | — | First employer view timestamp |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |

### `cv_reviews`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | |
| `user_id` | `integer` | `NOT NULL` | FK → `users.id` |
| `cv_file_name` | `text` | `NOT NULL` | |
| `cv_text` | `text` | — | Extracted plain text for AI processing |
| `status` | `text` | `NOT NULL`, `DEFAULT 'pending'` | `pending` / `processing` / `complete` / `error` |
| `ai_review` | `text` | — | JSON-encoded AI output (score, strengths, improvements, insights) |
| `human_review` | `text` | — | Expert written review |
| `payment_status` | `text` | `NOT NULL`, `DEFAULT 'none'` | `none` / `pending` / `paid` |
| `stripe_session_id` | `text` | — | Stripe Checkout session ID for server-side verification |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |
| `updated_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |

### `saved_jobs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | |
| `user_id` | `integer` | `NOT NULL` | FK → `users.id` |
| `job_id` | `integer` | `NOT NULL` | FK → `jobs.id` |
| `saved_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |
| — | — | `UNIQUE(user_id, job_id)` | Prevents duplicate saves |

### `application_feedback`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | |
| `application_id` | `integer` | `NOT NULL` | FK → `applications.id` |
| `employer_id` | `integer` | `NOT NULL` | FK → `users.id` |
| `candidate_id` | `integer` | `NOT NULL` | FK → `users.id` |
| `content` | `text` | `NOT NULL` | Growth feedback text |
| `is_anonymous` | `boolean` | `NOT NULL`, `DEFAULT false` | Masks employer identity from candidate |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT NOW()` | |

### Schema management commands

```bash
# Apply schema to target database (idempotent, recommended)
pnpm --filter @workspace/db run push

# Force-apply (skips confirmation on destructive changes — use with caution)
pnpm --filter @workspace/db run push-force

# Seed database with sample data
pnpm --filter @workspace/db run seed
```

---

## 9. API Reference

The canonical API contract is `lib/api-spec/openapi.yaml` (OpenAPI 3.1, 1 178 lines).  
All routes are prefixed `/api`. The server listens at `http://localhost:8080` in development.

### Authentication headers

```http
Authorization: Bearer <token>
```

Or equivalently via the HTTP-only cookie set on login:

```http
Cookie: bp_token=<token>
```

### Standard error envelope

All error responses share this structure:

```json
{
  "error": {
    "message": "Human-readable description of the error",
    "requestId": "bp-a3f9c2d1b4e8"
  }
}
```

The `requestId` value matches the `x-request-id` response header and can be used to correlate log entries on the server.

### Route inventory

#### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/healthz` | — | Liveness probe. Returns `{"status":"ok"}` |

#### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create account. Returns `{needsVerification: true}` — email must be verified before login |
| `POST` | `/auth/login` | — | Authenticate. Sets `bp_token` cookie; returns token in body |
| `POST` | `/auth/logout` | — | Clears `bp_token` cookie |
| `GET` | `/auth/me` | ✓ Any | Returns current user object and profile |
| `GET` | `/auth/verify-email?token=` | — | Consumes email verification token |
| `POST` | `/auth/magic-link` | — | Sends a passwordless sign-in email (30-min token) |
| `GET` | `/auth/magic-link/verify?token=` | — | Consumes magic link token, issues session |
| `POST` | `/auth/forgot-password` | — | Sends password-reset email |
| `POST` | `/auth/reset-password` | — | Consumes reset token, sets new password |
| `GET` | `/auth/oauth/google` | — | Initiates Google OAuth 2.0 authorisation code flow |
| `GET` | `/auth/oauth/google/callback` | — | Google OAuth callback — issues session |
| `GET` | `/auth/oauth/linkedin` | — | Initiates LinkedIn OAuth 2.0 flow |
| `GET` | `/auth/oauth/linkedin/callback` | — | LinkedIn OAuth callback — issues session |

#### Profiles

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/profiles/:userId` | — | Get public profile for any user |
| `GET` | `/profiles/me` | ✓ Any | Get authenticated user's own profile |
| `PUT` | `/profiles/:userId` | ✓ Self | Update own profile (role, bio, skills, company info, etc.) |

#### Jobs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/jobs` | — | List/search jobs. Query params: `keyword`, `location`, `type`, `country`, `page`, `limit` |
| `POST` | `/jobs` | ✓ Employer | Create a job listing |
| `GET` | `/jobs/:jobId` | — | Get full job detail |
| `PUT` | `/jobs/:jobId` | ✓ Employer (owner) | Update a job listing |
| `DELETE` | `/jobs/:jobId` | ✓ Employer (owner) | Delete a job listing |

#### Applications

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/applications` | ✓ Job Seeker | Submit an application (cover letter + optional CV upload) |
| `GET` | `/applications/my` | ✓ Job Seeker | List own applications with status |
| `GET` | `/applications/employer-all` | ✓ Employer | All applications across employer's active jobs |
| `PUT` | `/applications/:id/status` | ✓ Employer | Advance pipeline stage |
| `POST` | `/applications/:applicationId/feedback` | ✓ Employer | Submit growth feedback to candidate |

#### Saved Jobs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/saved-jobs` | ✓ Job Seeker | List bookmarked jobs |
| `POST` | `/saved-jobs` | ✓ Job Seeker | Bookmark a job |
| `DELETE` | `/saved-jobs/:jobId` | ✓ Job Seeker | Remove a bookmark |

#### CV Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/cv-reviews` | ✓ Job Seeker | Submit CV text for AI analysis |
| `GET` | `/cv-reviews/my` | ✓ Job Seeker | List own CV reviews and their status |

#### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/create-checkout` | ✓ Job Seeker | Create Stripe Checkout session for Human HR Review ($15–20) |
| `GET` | `/payments/verify?sessionId=` | ✓ Job Seeker | Server-side verify payment completion, update `cv_reviews.payment_status` |

#### Statistics

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/stats/dashboard` | ✓ Any | Personal dashboard KPIs (role-scoped) |
| `GET` | `/stats/jobs/:jobId` | ✓ Employer | Per-job view count and application statistics |

#### File Uploads

| Method | Path | Auth | Max size | Accepted types |
|---|---|---|---|---|
| `POST` | `/uploads/avatar` | ✓ Any | 5 MB | JPEG, PNG (Sharp-processed before storage) |
| `POST` | `/uploads/cv` | ✓ Job Seeker | 10 MB | PDF, DOCX |

#### Contact & Chat

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/contact` | — | Submit contact form enquiry (persisted + email notification) |
| `POST` | `/chat` | ✓ Any | AI assistant chat turn |

#### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | ✓ Admin | Platform-wide KPIs, time-series (revenue, signups, applications) |
| `GET` | `/admin/users` | ✓ Admin | Paginated user list with roles |
| `PATCH` | `/admin/users/:id/role` | ✓ Admin | Change a user's role |
| `DELETE` | `/admin/users/:id` | ✓ Admin | Hard-delete a user account |
| `GET` | `/admin/jobs` | ✓ Admin | All platform jobs for moderation |
| `POST` | `/admin/broadcast` | ✓ Admin | Send segmented broadcast email (`all` / `employers` / `job_seekers` / `admins`) |

---

## 10. Authentication & Authorisation

### Session tokens

Tokens are HMAC-SHA256 signed strings with format `{userId}:{issuedAt}:{signature}`. They are issued on successful login, OAuth callback, or magic-link verification and delivered two ways:

- **HTTP-only cookie** `bp_token` — `httpOnly`, `sameSite=lax`, set server-side. Not accessible to JavaScript.
- **JSON response body** — for SPA client-side storage fallback.

Token rotation: rotating `TOKEN_SECRET` immediately invalidates all outstanding sessions.

### Password security

- New registrations: **bcrypt** at cost factor **12**.
- Legacy path (SHA-256 migration): on successful login the stored SHA-256 hash is transparently upgraded to bcrypt and the database record updated. Uses `crypto.timingSafeEqual` to prevent timing attacks.

### Role model

| Role | Access scope |
|---|---|
| `job_seeker` | Apply for jobs · manage own profile · save jobs · request CV reviews · view own applications and their status |
| `employer` | Post and manage own jobs · view candidates · manage application pipeline stages · submit growth feedback |
| `admin` | Full platform access plus: platform-wide analytics, user role management, user deletion, all-job moderation, broadcast email |

### OAuth 2.0 flows

Both Google and LinkedIn use the standard authorisation code flow. Redirect URIs to register in provider consoles:

```
Google:   {OAUTH_BASE_URL}/api/auth/oauth/google/callback
LinkedIn: {OAUTH_BASE_URL}/api/auth/oauth/linkedin/callback
```

---

## 11. Code Generation Pipeline

The OpenAPI specification at `lib/api-spec/openapi.yaml` is the **single source of truth** for the API contract. Two packages are machine-generated from it using [Orval](https://orval.dev).

### When to regenerate

Run after any change to `openapi.yaml`:

```bash
# Backend Zod validation schemas
pnpm --filter @workspace/api-zod run codegen

# Frontend TanStack Query hooks + Axios client
pnpm --filter @workspace/api-client-react run codegen
```

> ⚠️ Never manually edit files inside `lib/api-zod/` or `lib/api-client-react/`. They are overwritten on every codegen run.

### Adding a new endpoint — full workflow

```
1. Edit lib/api-spec/openapi.yaml         ← define path, method, schemas
2. pnpm --filter @workspace/api-zod run codegen
3. pnpm --filter @workspace/api-client-react run codegen
4. Implement handler in artifacts/api-server/src/routes/<resource>.ts
5. Register in artifacts/api-server/src/routes/index.ts
6. Add <Route> in artifacts/bridgepath/src/App.tsx (if new page)
7. pnpm run typecheck                     ← verify end-to-end type safety
```

---

## 12. Security Controls

| Control | Implementation | Scope |
|---|---|---|
| **Supply-chain protection** | `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` min (24 h) for all packages — packages published within 24 hours are rejected | All dependencies |
| **Vulnerability scanning** | `pnpm audit` — zero findings as of June 2026 | All dependencies |
| **Rate limiting — global** | 120 requests / 60 s per IP | Production only |
| **Rate limiting — auth routes** | 20 requests / 15 min per IP | Production only |
| **CORS policy** | Development: `origin: true`. Production: explicit allowlist (`bridgepathnetwork.com`, `www.bridgepathnetwork.com`) | All environments |
| **Password hashing** | bcrypt cost 12; `crypto.timingSafeEqual` for legacy SHA-256 comparison | Auth routes |
| **HMAC token signing** | HMAC-SHA256 with 64-byte secret configured via `TOKEN_SECRET` | All authenticated routes |
| **HTTP-only cookie** | `bp_token` is `httpOnly`, `sameSite=lax` — inaccessible to JavaScript | Browser clients |
| **Request ID tracing** | Every request gets a unique `x-request-id` header; all Pino log lines include it | All routes |
| **Global error handler** | Express 4-parameter error middleware catches all unhandled rejections; 5xx detail masked in production | All routes |
| **Granular Error Boundaries** | Per-route React class `ErrorBoundary` — a single page crash cannot unmount the whole SPA | Frontend |
| **Input validation** | All API request bodies validated against Zod schemas generated from OpenAPI | All write routes |
| **File upload limits** | Avatar: 5 MB JPEG/PNG · CV: 10 MB PDF/DOCX · Processed via Sharp before storage | Upload routes |
| **Production error masking** | 5xx error messages replaced with `"Internal server error"` in `NODE_ENV=production` | API error handler |

---

## 13. Design System

Bridgepath Africa uses a **Warm Pan-African Editorial** design language.

### Colour palette

| Token | Hex | Usage |
|---|---|---|
| Terracotta (primary) | `#C04020` | Primary buttons, active states, CTAs, error boundary accents |
| Coral (brand accent) | `#C8461A` | Hover states, icon fills |
| Marigold | `#F0A010` | Eyebrow labels, badge chips (use sparingly) |
| Deep Teal | `#1F7A78` | Trust badges and certifications only |
| Cream (surface) | `#FEF9F4` | Page backgrounds — never pure white |
| Ink (text) | `#1E1511` | Headlines and body — never pure black |
| Navy (structure) | `#0C1A33` | Navigation, dark sections, footer |
| Stone | `#7A6A5A` | Secondary / muted text |

### Design rules

- **No greens** — not olive, sage, emerald, lime, or mint anywhere in the UI
- **No pure white backgrounds** — always ivory cream (`#FEF9F4`)
- **No pure black text** — always warm ink (`#1E1511`)
- **No cool grays** — all neutrals use warm brown-tinted hues

### Typography

| Role | Font | Weights |
|---|---|---|
| Display headings | Montserrat | 600, 700, 800 |
| Body / UI labels | Inter | 400, 500, 600 |

CSS custom properties and global design tokens are declared in `artifacts/bridgepath/src/index.css`.

---

## 14. Deployment

### Production build

```bash
# Build the API bundle (outputs artifacts/api-server/dist/index.mjs)
pnpm --filter @workspace/api-server run build

# Build the React SPA (outputs artifacts/bridgepath/dist/public/)
pnpm --filter @workspace/bridgepath run build
```

### Production start

```bash
NODE_ENV=production PORT=5000 node --enable-source-maps artifacts/api-server/dist/index.mjs
```

In production mode, Express serves the compiled SPA from `artifacts/bridgepath/dist/public/` and responds with `index.html` for all non-API routes (client-side routing).

### Pre-launch checklist

- [ ] `DATABASE_URL` points to the production PostgreSQL instance
- [ ] Schema applied: `pnpm --filter @workspace/db run push`
- [ ] `TOKEN_SECRET` is a fresh 64-char random hex string (not the development default)
- [ ] `PASSWORD_SALT` set for legacy migration path
- [ ] `OAUTH_BASE_URL` matches the public production domain (no trailing slash)
- [ ] OAuth redirect URIs registered in Google Cloud Console and LinkedIn Developer Portal
- [ ] `STRIPE_SECRET_KEY` is the **live** key (`sk_live_...`)
- [ ] `NODE_ENV=production` is set
- [ ] `RESEND_API_KEY` configured for transactional email delivery
- [ ] `LOG_LEVEL=warn` or `error` recommended for production log volume
- [ ] File upload directory (`artifacts/api-server/uploads/`) is writable and backed up

### Cloudflare deployment

The API is deployed as a **Cloudflare Worker** using `wrangler.toml` in `artifacts/api-server/`.  
The frontend SPA is deployed to **Cloudflare Pages**.

```bash
# Deploy the Worker (API)
cd artifacts/api-server
npx wrangler deploy

# Deploy the frontend (Pages)
pnpm --filter @workspace/bridgepath run build
npx wrangler pages deploy artifacts/bridgepath/dist/public --project-name bridgepath
```

Apply secrets once after deploy:
```bash
wrangler secret put TOKEN_SECRET
wrangler secret put PASSWORD_SALT
wrangler secret put RESEND_API_KEY
# ... (see wrangler.toml for full list)
```

Apply database schema to D1:
```bash
pnpm --filter @workspace/db run push
```

### Alternative hosting

| Provider | Notes |
|---|---|
| **Railway** | One-click PostgreSQL + Node.js. Build: `pnpm build`. Start: `node artifacts/api-server/dist/index.mjs`. |
| **Render** | Web Service (Node) + Managed PostgreSQL. Build: `pnpm build`. Start: `node artifacts/api-server/dist/index.mjs`. |
| **Fly.io** | `fly launch` with `--no-deploy`, configure `fly.toml`, `fly postgres create`, then `fly deploy`. |

---

## 15. Contributing

### Branch strategy

```
main       — production-ready, protected, requires PR approval
develop    — integration branch
feature/*  — individual features, branched from develop
fix/*      — bug fixes, branched from develop
hotfix/*   — critical production fixes, branched from main
```

### Commit message convention

This repository follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short imperative description>
```

**Types:** `feat` · `fix` · `chore` · `docs` · `refactor` · `perf` · `test` · `ci`

**Examples:**
```
feat(jobs): add salary range filter to job search
fix(auth): handle expired magic link token gracefully
chore(deps): update drizzle-orm to 0.46.0
docs(api): document /cv-reviews endpoint in openapi.yaml
refactor(pipeline): extract Kanban card into reusable component
```

### Code conventions

| Convention | Detail |
|---|---|
| **Package manager** | Always `pnpm`. A `preinstall` hook blocks `npm install` and `yarn`. |
| **Shared versions** | Pin in `pnpm-workspace.yaml` `catalog:` section — not in individual `package.json` files. |
| **TypeScript** | Strict mode enforced. No `any` without an inline comment explaining why. |
| **New API routes** | Always document in `openapi.yaml` first, then run codegen, then implement. |
| **New DB tables** | Add to `lib/db/src/schema/`, export from `index.ts`, then `push`. |
| **Generated files** | `lib/api-zod/` and `lib/api-client-react/` — never edit manually. |
| **Error handling** | All async route handlers must use `try/catch`. Throw to the global handler for unexpected errors. |
| **Secrets** | Never hardcode secrets. Always use environment variables or secret management (e.g. `wrangler secret put`). |

### Type checking

```bash
# Check all packages (full monorepo)
pnpm run typecheck

# Check only library packages (faster during lib changes)
pnpm run typecheck:libs
```

---

## 16. Glossary

| Term | Definition |
|---|---|
| **Monorepo** | A single Git repository containing multiple related packages (`artifacts/`, `lib/`) managed via pnpm workspaces |
| **Workspace** | A package within the monorepo, identified by its `name` field (e.g. `@workspace/db`) |
| **Catalog** | The `catalog:` section of `pnpm-workspace.yaml` — defines canonical versions for shared dependencies, ensuring version consistency across all packages |
| **Drizzle ORM** | TypeScript-first ORM for schema definition, `push`-based migrations, and type-safe query building |
| **drizzle-zod** | Drizzle plugin that generates Zod validation schemas directly from Drizzle table definitions |
| **Orval** | Code generator that reads `openapi.yaml` and produces `@workspace/api-zod` and `@workspace/api-client-react` |
| **TanStack Query** | Server-state management library (formerly React Query) — handles fetching, caching, mutation, and optimistic updates |
| **Wouter** | Lightweight (~1.5 kB) React routing library; pattern-matched, no context dependency |
| **Error Boundary** | React class component that catches render errors in a subtree without unmounting the whole application. Supports `inline` mode for widget-level failures and `resetKey` for retry-without-reload |
| **Pino** | High-performance structured JSON logger for Node.js |
| **Magic Link** | Passwordless authentication: a short-lived HMAC-signed URL is emailed to the user; consuming it issues a session |
| **bp_token** | HTTP-only cookie name used to persist the session token on the client |
| **HMAC-SHA256** | Hash-based message authentication code algorithm used to sign and verify session tokens |
| **drizzle-kit push** | CLI command that introspects Drizzle schema definitions and applies DDL directly to the target database without generating migration files |
| **Kanban pipeline** | The employer-facing candidate management board with stages: Applied → Reviewed → Shortlisted → Interview → Offer Made → Hired |
| **minimumReleaseAge** | pnpm workspace security setting that blocks installation of packages published less than 1 440 minutes (24 hours) ago, defending against supply-chain attacks |

---

## 17. License

**Proprietary — © Bridgepath Africa. All rights reserved.**

Unauthorised copying, distribution, or modification of this codebase or any of its components is strictly prohibited without express written permission from Bridgepath Africa.

---

*Built for Africa. Built for the world.*  
*Bridgepath Africa Engineering — Last updated June 2026*
