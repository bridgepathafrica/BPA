# Security Policy — Bridgepath Africa

---

## Reporting a vulnerability

If you believe you have found a security vulnerability in the Bridgepath Africa platform, **please do not open a public GitHub issue**.

Report vulnerabilities privately by emailing:

**security@bridgepathnetwork.com**

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce (proof of concept if available)
- The URL, endpoint, or component affected
- Your name and contact details (optional, for acknowledgement)

We aim to acknowledge all reports within **48 hours** and to issue a fix or mitigation within **14 days** for critical issues. We will keep you informed of progress and, with your consent, credit you in the release notes.

We do not currently operate a bug bounty programme, but we genuinely appreciate responsible disclosure.

---

## Security practices

### Authentication

- Session tokens are `base64url(userId:issuedAt:HMAC-SHA256)`, signed with `TOKEN_SECRET` (a 64-byte random secret set at deployment).
- Tokens carry a **90-day TTL**. Expiry is validated both client-side (on every page load) and server-side (on every authenticated request).
- Passwords are hashed with **PBKDF2** using a server-side salt (`PASSWORD_SALT`). Raw passwords are never logged or stored.
- Magic-link tokens are single-use, time-limited (15 minutes), and invalidated server-side after first use.

### Transport

- All production traffic is served over **TLS 1.2+**. HTTP is redirected to HTTPS at the edge.
- API responses include **HSTS** headers (`max-age=31536000; includeSubDomains`).

### HTTP security headers

Implemented via [Helmet.js](https://helmetjs.github.io/) on every API response:

| Header | Value |
|---|---|
| `Content-Security-Policy` | Restrictive policy; scripts only from self |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, microphone, and geolocation disabled |

### API protection

- **Rate limiting** — three tiers enforced on every route group:
  - Auth routes: 10 requests / 15 minutes per IP
  - Mutations: 60 requests / minute per IP
  - Reads: 300 requests / minute per IP
- **Role-based access control** — `requireAuth` middleware validates the token HMAC; role checks (`requireRole("employer")`) enforce resource boundaries.
- **Input validation** — all request bodies are validated against Zod schemas generated from the OpenAPI specification before reaching business logic.

### File uploads

- File type is validated server-side by inspecting MIME type and magic bytes (not just the extension).
- Maximum file size: 10 MB.
- Uploaded files are stored in an isolated `uploads/` directory, never executed, and served with `Content-Disposition: attachment`.

### Dependency security

- `pnpm-workspace.yaml` enforces a **1,440-minute minimum release age** for all npm packages — a critical defence against supply-chain attacks that exploit the window between a malicious publish and its removal.
- Dependencies are kept up to date; run `pnpm audit` regularly and address high/critical advisories before deployment.

### Logging and monitoring

- Pino structured JSON logging is enabled in production. Logs are never written to disk on the application server; stream to your log aggregator (e.g. Datadog, Logtail, Papertrail).
- **No secrets, passwords, or tokens are logged** at any log level.
- Log level is configurable via `LOG_LEVEL` (default: `info` in production).

---

## Known limitations and mitigations

| Area | Limitation | Mitigation |
|---|---|---|
| File storage | Files are stored on the local filesystem | Use a managed object store (S3, Supabase Storage, Cloudflare R2) in production and configure `uploads/` accordingly |
| Email verification | Skipped when `RESEND_API_KEY` is not set | Set the key in all non-demo environments |
| Magic-link state | Stored in-memory; lost on server restart | Acceptable for stateless deployments; use Redis for multi-instance setups |
| OAuth PKCE | Not implemented for the current Google OAuth flow | Schedule for next major release |

---

## Supported versions

Only the latest version on the `main` branch receives security fixes. Pinned forks or past releases are not supported.

---

## Security contacts

| Role | Email |
|---|---|
| Security disclosures | security@bridgepathnetwork.com |
| Data Protection Officer | dpo@bridgepathnetwork.com |
| General support | support@bridgepathnetwork.com |
