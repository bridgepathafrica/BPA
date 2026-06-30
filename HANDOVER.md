# Project Handover Document — Bridgepath Africa

> Prepared for client handover and global launch.  
> Last updated: June 2025

---

## 1. Project overview

**Product:** Bridgepath Africa — premium HR and talent platform  
**Stack:** React 19 + Vite 7 frontend / Express 5 + Node.js 24 backend / PostgreSQL  
**Architecture:** TypeScript pnpm monorepo — see [ARCHITECTURE.md](./ARCHITECTURE.md)  
**Live domain:** bridgepathafricahr.com  
**Support email:** support@bridgepathnetwork.com

---

## 2. What has been delivered

### Core platform features

| Feature | Status |
|---|---|
| Homepage with hero, services overview, testimonials, Pan-African reach | ✅ Complete |
| Job listings with search and filters | ✅ Complete |
| Job detail pages with apply flow | ✅ Complete |
| Job seeker dashboard (applications, profile, CV upload) | ✅ Complete |
| Employer dashboard (job management, candidate pipeline) | ✅ Complete |
| AI-assisted CV review (OpenAI gpt-4o-mini) | ✅ Complete |
| Full profile management (personal info, skills, documents, social links) | ✅ Complete |
| 9 HR service pages with enquiry flows | ✅ Complete |
| Insights / blog (4 long-form articles) | ✅ Complete |
| About page with leadership team | ✅ Complete |
| Contact page (form + database persistence) | ✅ Complete |
| Authentication: email/password, magic-link, Google OAuth | ✅ Complete |
| Demo accounts for no-signup exploration | ✅ Complete |
| Developer / API reference page | ✅ Complete |
| Dynamic Open Graph images for job and service pages | ✅ Complete |
| Cookie consent banner (GDPR) | ✅ Complete |
| Privacy Policy, Terms of Service, Cookie Policy | ✅ Complete |
| robots.txt and XML sitemap | ✅ Complete |
| 404 / error boundary pages | ✅ Complete |

### Technical foundations

| Item | Status |
|---|---|
| HMAC-signed session tokens with 90-day TTL + client-side expiry check | ✅ |
| Role-based access control (job_seeker / employer) | ✅ |
| Rate limiting on all route groups | ✅ |
| Helmet.js security headers | ✅ |
| Input validation via Zod (generated from OpenAPI spec) | ✅ |
| File upload validation (MIME + size) | ✅ |
| Structured JSON logging (Pino) | ✅ |
| OpenAPI 3.1 specification | ✅ |
| Generated TypeScript client hooks (Orval) | ✅ |
| pnpm minimum release age (supply-chain attack defence) | ✅ |
| Environment variable template (.env.example) | ✅ |
| Architecture documentation (ARCHITECTURE.md) | ✅ |
| Security policy (SECURITY.md) | ✅ |

---

## 3. Environments

### Development

```
Frontend:   http://localhost:5000
API server: http://localhost:8080
```

Start both with:
```bash
pnpm --filter @workspace/api-server run dev   # Terminal 1
pnpm --filter @workspace/bridgepath run dev   # Terminal 2
```

### Production

Recommended topology:
- **Frontend:** Netlify / Cloudflare Pages (static CDN)
- **API server:** Railway / Render / Fly.io (Node.js)
- **Database:** Supabase / Neon / Railway Postgres

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step go-live instructions.

---

## 4. Access credentials and secrets

> **Security note:** Never share secrets in plain text. Transfer all credentials using a password manager (1Password, Bitwarden) or a secrets vault.

Credentials to transfer to the client:
- [ ] `DATABASE_URL` — PostgreSQL connection string
- [ ] `TOKEN_SECRET` — HMAC signing key (64-byte hex)
- [ ] `PASSWORD_SALT` — password hashing salt
- [ ] `OPENAI_API_KEY` — OpenAI API key
- [ ] `RESEND_API_KEY` — Resend email API key
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — Google OAuth
- [ ] `STRIPE_SECRET_KEY` — Stripe (if payments are live)
- [ ] Domain registrar login
- [ ] Hosting platform dashboard access
- [ ] Database hosting dashboard access

---

## 5. Pre-launch checklist

### Infrastructure

- [ ] Production PostgreSQL database provisioned and accessible
- [ ] All environment variables set in the hosting platform dashboard (reference `.env.example`)
- [ ] Production database schema applied: `DATABASE_URL=<prod> pnpm --filter @workspace/db run push`
- [ ] Domain DNS pointing to CDN/host
- [ ] TLS certificate active and auto-renewing
- [ ] HTTPS redirect enabled at edge

### Application

- [ ] `NODE_ENV=production` set on the API server
- [ ] `OAUTH_BASE_URL` set to the live domain
- [ ] Google OAuth redirect URI registered: `https://yourdomain.com/api/auth/oauth/google/callback`
- [ ] Demo accounts tested against live database
- [ ] Contact form tested end-to-end (form → database → email notification)
- [ ] CV Review tested with a real CV
- [ ] Job posting flow tested (employer create → job seeker discover → apply)
- [ ] File upload tested (CV PDF, avatar image)
- [ ] Email verification flow tested
- [ ] Magic-link login tested
- [ ] Cookie consent banner shown to new visitors
- [ ] All legal pages accessible: /privacy, /terms, /cookies
- [ ] Open Graph images rendering on share (test with LinkedIn / Twitter card validators)
- [ ] sitemap.xml domain updated to production domain

### Performance and monitoring

- [ ] Log aggregator connected (Datadog, Logtail, Papertrail, or equivalent)
- [ ] Uptime monitoring configured (UptimeRobot, Better Uptime, or equivalent)
- [ ] Error alerting configured for 5xx response spikes
- [ ] Database backup schedule confirmed with hosting provider

### Legal and compliance

- [ ] Privacy Policy reviewed by legal counsel
- [ ] Terms of Service reviewed by legal counsel
- [ ] Cookie Policy categories match actual cookies in use
- [ ] GDPR Data Protection Officer contact (dpo@bridgepathnetwork.com) is monitored
- [ ] Data Processing Agreements signed with sub-processors (OpenAI, Resend, Stripe, database host)
- [ ] If processing EU personal data: assess whether a GDPR Article 30 Record of Processing Activities (RoPA) is required

---

## 6. Demo accounts

Two pre-configured accounts allow instant platform exploration without registration. The passwords below are intended for internal demonstration only — rotate them after handover.

| Role | Email | Password |
|---|---|---|
| Job Seeker | jobseeker@demo.bridgepath.network | Demo123! |
| Employer | employer@demo.bridgepath.network | Demo123! |

Demo accounts are resolved entirely on the frontend (no server round-trip). They have access to mock job data injected by the frontend and cannot affect the production database.

---

## 7. Maintenance and ongoing development

### Updating the API

1. Edit `lib/api-spec/openapi.yaml`
2. Regenerate client hooks and validators: `pnpm --filter @workspace/api-client-react run generate`
3. Implement the new route in `artifacts/api-server/src/routes/`
4. Update frontend pages as needed

### Adding a new page

1. Create `artifacts/bridgepath/src/pages/your-page.tsx`
2. Register the route in `artifacts/bridgepath/src/App.tsx`
3. Add a `<PageSEO>` component at the top of the new page
4. Add the path to `artifacts/bridgepath/public/sitemap.xml`

### Dependency updates

```bash
pnpm update --recursive --latest   # Preview updates
pnpm audit                         # Check for security advisories
```

Update the `catalog:` section in `pnpm-workspace.yaml` for shared dependencies.

---

## 8. Key contacts

| Role | Name | Contact |
|---|---|---|
| Technical lead | — | (to be filled by client) |
| Data Protection Officer | — | dpo@bridgepathnetwork.com |
| Platform support | — | support@bridgepathnetwork.com |
| Security disclosures | — | security@bridgepathnetwork.com |

---

## 9. Further documentation

| Document | Location |
|---|---|
| System architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Security policy | [SECURITY.md](./SECURITY.md) |
| Deployment guide | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| API specification | [lib/api-spec/openapi.yaml](./lib/api-spec/openapi.yaml) |
| Environment variables | [.env.example](./.env.example) |
