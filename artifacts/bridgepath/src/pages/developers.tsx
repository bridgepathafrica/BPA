import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Code2, Key, Zap, Globe, ShieldCheck, BookOpen, Terminal,
  ChevronRight, Copy, Check, Layers, Webhook, Clock, ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";

const CORAL  = "#C04020";
const NAVY   = "#0D1E38";
const CREAM  = "#FEF9F4";
const MUTED  = "#7A6A5A";
const BORDER = "#E0D4C4";
const CARD   = "#FFFCF9";

// ── Tiny copy-to-clipboard button ───────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="absolute top-3 right-3 p-1.5 rounded-md transition-colors"
      style={{ background: "rgba(255,255,255,0.08)", color: copied ? "#4ADE80" : "rgba(255,255,255,0.55)" }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Code block ──────────────────────────────────────────────────────────────
function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden text-sm" style={{ background: "#0F172A" }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <Terminal className="h-3.5 w-3.5" style={{ color: CORAL }} />
        <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono" style={{ color: "#E2E8F0" }}>
        <code>{code.trim()}</code>
      </pre>
      <CopyButton text={code.trim()} />
    </div>
  );
}

// ── Method badge ─────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" }) {
  const colors: Record<string, { bg: string; text: string }> = {
    GET:    { bg: "#0C4A6E", text: "#7DD3FC" },
    POST:   { bg: "#14532D", text: "#86EFAC" },
    PUT:    { bg: "#78350F", text: "#FCD34D" },
    PATCH:  { bg: "#581C87", text: "#D8B4FE" },
    DELETE: { bg: "#7F1D1D", text: "#FCA5A5" },
  };
  const c = colors[method] ?? colors.GET;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono" style={{ backgroundColor: c.bg, color: c.text }}>
      {method}
    </span>
  );
}

// ── Sidebar sections ──────────────────────────────────────────────────────────
const sections = [
  { id: "overview",       label: "Overview",          icon: BookOpen },
  { id: "authentication", label: "Authentication",     icon: Key },
  { id: "quickstart",    label: "Quick Start",        icon: Zap },
  { id: "endpoints",     label: "API Endpoints",      icon: Layers },
  { id: "webhooks",      label: "Webhooks",           icon: Webhook },
  { id: "rate-limits",   label: "Rate Limits",        icon: Clock },
  { id: "errors",        label: "Error Codes",        icon: ShieldCheck },
  { id: "changelog",     label: "Changelog",          icon: Code2 },
];

const endpoints = [
  {
    method: "POST" as const,
    path: "/api/auth/register",
    description: "Create a new user account (job seeker or employer).",
    body: `{
  "email": "talent@example.com",
  "password": "SecurePass1",
  "name": "Kwame Asante",
  "role": "job_seeker"
}`,
    response: `{
  "needsVerification": true,
  "email": "talent@example.com"
}`,
  },
  {
    method: "POST" as const,
    path: "/api/auth/login",
    description: "Authenticate and receive a Bearer token.",
    body: `{
  "email": "talent@example.com",
  "password": "SecurePass1"
}`,
    response: `{
  "user": { "id": 42, "name": "Kwame Asante", "role": "job_seeker" },
  "token": "<YOUR_TOKEN>"
}`,
  },
  {
    method: "GET" as const,
    path: "/api/auth/me",
    description: "Return the currently authenticated user's profile. Requires Bearer token.",
    body: null,
    response: `{
  "id": 42,
  "email": "talent@example.com",
  "name": "Kwame Asante",
  "role": "job_seeker",
  "emailVerified": true,
  "profile": { "location": "Accra, Ghana", "skills": ["Python", "SQL"] }
}`,
  },
  {
    method: "GET" as const,
    path: "/api/jobs",
    description: "List all active job postings. Supports query params: `q`, `location`, `type`, `page`.",
    body: null,
    response: `{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Data Analyst",
      "company": "Acme Corp",
      "location": "Accra, Ghana",
      "type": "Full-time",
      "salary": "$55,000 – $70,000",
      "postedAt": "2026-05-28T10:00:00Z"
    }
  ],
  "total": 48,
  "page": 1,
  "pages": 5
}`,
  },
  {
    method: "POST" as const,
    path: "/api/jobs",
    description: "Post a new job listing. Requires employer Bearer token.",
    body: `{
  "title": "Senior Data Analyst",
  "location": "Accra, Ghana",
  "type": "Full-time",
  "description": "We are looking for...",
  "salary": "$55,000 – $70,000",
  "requirements": ["3+ years SQL", "Python proficiency"]
}`,
    response: `{
  "id": 99,
  "title": "Senior Data Analyst",
  "status": "active",
  "createdAt": "2026-06-04T08:30:00Z"
}`,
  },
  {
    method: "POST" as const,
    path: "/api/cv-review",
    description: "Submit a CV text for AI-powered analysis. Returns a structured review with score, strengths, and recommendations.",
    body: `{
  "cvText": "Kwame Asante\\nSenior Data Analyst\\n5 years experience..."
}`,
    response: `{
  "score": 82,
  "summary": "Strong analytical background with clear career progression.",
  "strengths": ["Quantified achievements", "Relevant certifications"],
  "improvements": ["Add a professional summary", "Tailor keywords per role"],
  "roleRecommendations": ["Data Analyst", "Business Intelligence Lead"]
}`,
  },
  {
    method: "POST" as const,
    path: "/api/contact",
    description: "Submit a general contact or hiring enquiry. Stored in the database and triggers an email notification.",
    body: `{
  "name": "Sarah Osei",
  "company": "TechVentures Ltd",
  "email": "sarah@techventures.com",
  "type": "Hiring talent",
  "message": "We are expanding our engineering team in Nairobi..."
}`,
    response: `{ "success": true }`,
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function DevelopersPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [openEndpoint, setOpenEndpoint] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM }}>
      <PageSEO
        title="Developer API | Bridgepath Africa"
        description="Integrate Bridgepath Africa's hiring platform into your product. REST API reference, authentication guide, and code examples."
        path="/developers"
      />
      <Navbar />

      {/* ── Hero band ── */}
      <section className="relative overflow-hidden py-16 md:py-24" style={{ background: NAVY }}>
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ backgroundColor: `${CORAL}25`, color: CORAL, border: `1px solid ${CORAL}40` }}>
              <Code2 className="h-3.5 w-3.5" /> Developer API
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight" style={{ fontFamily: "var(--app-font-display)" }}>
              Build on Bridgepath Africa
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed">
              A clean REST API to integrate African talent acquisition, job listings, and HR services directly into your product. JSON everywhere, Bearer token auth, predictable error codes.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => scrollTo("quickstart")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: CORAL }}>
                Quick Start <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/developers/api">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.25)", color: "white" }}>
                  Full API Reference <Layers className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y" style={{ borderColor: BORDER, backgroundColor: CARD }}>
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: BORDER }}>
            {[
              { label: "Endpoints",    value: "18+" },
              { label: "Avg response", value: "<120ms" },
              { label: "Uptime SLA",   value: "99.9%" },
              { label: "Auth method",  value: "Bearer" },
            ].map((s) => (
              <div key={s.label} className="py-5 px-6 text-center">
                <div className="text-2xl font-extrabold" style={{ color: CORAL, fontFamily: "var(--app-font-display)" }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: MUTED }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content area with sidebar ── */}
      <div className="flex-1 container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl py-12 md:py-16">
        <div className="flex gap-10 md:gap-14">

          {/* Sidebar nav */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-6 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-3" style={{ color: MUTED }}>Docs</p>
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-all"
                  style={{
                    backgroundColor: activeSection === id ? `${CORAL}12` : "transparent",
                    color: activeSection === id ? CORAL : "#4A3A2A",
                    fontWeight: activeSection === id ? 700 : 500,
                    borderLeft: activeSection === id ? `2px solid ${CORAL}` : "2px solid transparent",
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
              <div className="mt-6 pt-6 border-t px-3" style={{ borderColor: BORDER }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Base URL</p>
                <code className="text-xs break-all" style={{ color: CORAL, fontFamily: "var(--app-font-mono)" }}>
                  https://bridgepathnetwork.com
                </code>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-16">

            {/* Overview */}
            <section id="overview">
              <SectionHeading icon={BookOpen} title="Overview" />
              <p className="text-[#4A3A2A] leading-relaxed mb-6">
                The Bridgepath Africa API is a RESTful HTTP API. All requests and responses use <strong>JSON</strong>. Endpoints are versioned implicitly — breaking changes will be announced in the <a href="#changelog" className="underline" style={{ color: CORAL }}>changelog</a>.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Globe, title: "REST + JSON", body: "Standard HTTP verbs, JSON request & response bodies, ISO 8601 timestamps." },
                  { icon: Key, title: "Bearer Auth", body: "All authenticated endpoints require an Authorization: Bearer <token> header." },
                  { icon: ShieldCheck, title: "TLS Only", body: "All production traffic is encrypted in transit. HTTP requests are rejected." },
                ].map((c) => (
                  <div key={c.title} className="rounded-xl p-5 border" style={{ borderColor: BORDER, backgroundColor: CARD }}>
                    <c.icon className="h-5 w-5 mb-3" style={{ color: CORAL }} />
                    <p className="font-bold text-sm mb-1" style={{ color: NAVY }}>{c.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{c.body}</p>
                  </div>
                ))}
              </div>
              <CodeBlock language="http" code={`Base URL
https://bridgepathnetwork.com

Content-Type: application/json
Accept:       application/json`} />
            </section>

            {/* Authentication */}
            <section id="authentication">
              <SectionHeading icon={Key} title="Authentication" />
              <p className="text-[#4A3A2A] leading-relaxed mb-5">
                Obtain a token by calling <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>/api/auth/login</code>, then include it in every subsequent request as a Bearer token.
              </p>
              <CodeBlock language="bash" code={`# 1. Obtain a token
curl -X POST https://bridgepathnetwork.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"YourPassword1"}'

# Response
# { "token": "<YOUR_TOKEN>", "user": { ... } }

# 2. Use the token
curl https://bridgepathnetwork.com/api/auth/me \\
  -H "Authorization: Bearer <YOUR_TOKEN>"`} />
              <div className="mt-5 rounded-xl p-4 border-l-4 text-sm" style={{ backgroundColor: `${CORAL}08`, borderColor: CORAL, color: "#4A3A2A" }}>
                <strong>Token TTL:</strong> Tokens expire after 90 days. Re-authenticate to obtain a fresh token. There is no refresh endpoint — simply call <code className="text-xs">/api/auth/login</code> again.
              </div>
            </section>

            {/* Quick Start */}
            <section id="quickstart">
              <SectionHeading icon={Zap} title="Quick Start" />
              <p className="text-[#4A3A2A] leading-relaxed mb-5">
                Get from zero to your first API response in under 2 minutes.
              </p>
              <ol className="space-y-5">
                {[
                  {
                    step: "1",
                    title: "Register an account",
                    code: `curl -X POST https://bridgepathnetwork.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "dev@yourcompany.com",
    "password": "SecurePass1",
    "name": "Dev User",
    "role": "employer"
  }'`,
                  },
                  {
                    step: "2",
                    title: "Sign in and store your token",
                    code: `TOKEN=$(curl -s -X POST https://bridgepathnetwork.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"dev@yourcompany.com","password":"SecurePass1"}' \\
  | jq -r '.token')
echo "Token: $TOKEN"`,
                  },
                  {
                    step: "3",
                    title: "Browse live job listings",
                    code: `curl "https://bridgepathnetwork.com/api/jobs?page=1" \\
  -H "Authorization: Bearer $TOKEN"`,
                  },
                ].map(({ step, title, code }) => (
                  <li key={step} className="flex gap-4">
                    <span className="mt-0.5 flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: CORAL }}>
                      {step}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-sm mb-2.5" style={{ color: NAVY }}>{title}</p>
                      <CodeBlock language="bash" code={code} />
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Endpoints */}
            <section id="endpoints">
              <SectionHeading icon={Layers} title="API Endpoints" />
              <p className="text-[#4A3A2A] leading-relaxed mb-6">
                Click any endpoint to expand the full request/response schema and a runnable curl example.
              </p>
              <div className="space-y-2">
                {endpoints.map((ep, i) => (
                  <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: openEndpoint === i ? `${CORAL}50` : BORDER, backgroundColor: CARD }}>
                    <button
                      onClick={() => setOpenEndpoint(openEndpoint === i ? null : i)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-orange-50/40 transition-colors"
                    >
                      <MethodBadge method={ep.method} />
                      <code className="text-sm font-mono flex-1" style={{ color: NAVY }}>{ep.path}</code>
                      <span className="text-xs hidden sm:block" style={{ color: MUTED }}>{ep.description}</span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 transition-transform"
                        style={{ color: MUTED, transform: openEndpoint === i ? "rotate(90deg)" : "rotate(0deg)" }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openEndpoint === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: BORDER }}>
                            <p className="text-sm mt-4" style={{ color: "#4A3A2A" }}>{ep.description}</p>
                            {ep.body && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Request body</p>
                                <CodeBlock language="json" code={ep.body} />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Response (200)</p>
                              <CodeBlock language="json" code={ep.response} />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: MUTED }}>curl</p>
                              <CodeBlock language="bash" code={buildCurl(ep)} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

            {/* Webhooks */}
            <section id="webhooks">
              <SectionHeading icon={Webhook} title="Webhooks" />
              <div className="rounded-xl p-5 border" style={{ borderColor: BORDER, backgroundColor: CARD }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${CORAL}15` }}>
                    <Clock className="h-4 w-4" style={{ color: CORAL }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: NAVY }}>Coming soon — Q3 2026</p>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: MUTED }}>
                      Webhook support is in active development. You'll be able to subscribe to events including
                      <code className="mx-1 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>application.created</code>,
                      <code className="mx-1 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>job.published</code>, and
                      <code className="mx-1 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>cv_review.completed</code>.
                    </p>
                  </div>
                </div>
                <Link href="/contact">
                  <button className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: CORAL }}>
                    Notify me when available <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits">
              <SectionHeading icon={Clock} title="Rate Limits" />
              <p className="text-[#4A3A2A] leading-relaxed mb-5">
                Rate limits are enforced per IP address. Exceeding the limit returns a <code className="text-xs px-1 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>429 Too Many Requests</code> response.
              </p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: `${NAVY}08` }}>
                      {["Endpoint group", "Limit", "Window"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { group: "Auth (login, register)", limit: "20 requests", window: "15 minutes" },
                      { group: "Job listings (read)",    limit: "200 requests", window: "1 minute" },
                      { group: "Job postings (write)",   limit: "30 requests", window: "1 minute" },
                      { group: "AI CV Review",           limit: "10 requests", window: "1 hour" },
                      { group: "All other endpoints",    limit: "120 requests", window: "1 minute" },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td className="px-4 py-3"><code className="text-xs" style={{ color: NAVY }}>{r.group}</code></td>
                        <td className="px-4 py-3 font-semibold" style={{ color: CORAL }}>{r.limit}</td>
                        <td className="px-4 py-3" style={{ color: MUTED }}>{r.window}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Errors */}
            <section id="errors">
              <SectionHeading icon={ShieldCheck} title="Error Codes" />
              <p className="text-[#4A3A2A] leading-relaxed mb-5">
                All errors return JSON with an <code className="text-xs px-1 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>error</code> and <code className="text-xs px-1 rounded" style={{ backgroundColor: `${CORAL}12`, color: CORAL }}>message</code> field.
              </p>
              <CodeBlock language="json" code={`{
  "error": "InvalidCredentials",
  "message": "Incorrect password."
}`} />
              <div className="mt-5 rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: `${NAVY}08` }}>
                      {["HTTP status", "error code", "Meaning"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { status: "400", code: "Bad Request",         meaning: "Missing or invalid fields in the request body." },
                      { status: "400", code: "WeakPassword",        meaning: "Password does not meet the strength requirements." },
                      { status: "401", code: "Unauthorized",        meaning: "Missing or invalid Bearer token." },
                      { status: "401", code: "InvalidCredentials",  meaning: "Email or password is incorrect." },
                      { status: "403", code: "Forbidden",           meaning: "Authenticated but not allowed to perform this action." },
                      { status: "403", code: "EmailNotVerified",    meaning: "Email address not yet confirmed." },
                      { status: "404", code: "Not Found",           meaning: "Resource does not exist." },
                      { status: "409", code: "EmailExists",         meaning: "An account with that email is already registered." },
                      { status: "429", code: "TooManyRequests",     meaning: "Rate limit exceeded. Back off and retry." },
                      { status: "500", code: "Internal Server Error", meaning: "Something went wrong on our end." },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td className="px-4 py-3 font-bold font-mono text-xs" style={{ color: parseInt(r.status) >= 500 ? "#EF4444" : parseInt(r.status) >= 400 ? "#F59E0B" : CORAL }}>{r.status}</td>
                        <td className="px-4 py-3"><code className="text-xs" style={{ color: NAVY }}>{r.code}</code></td>
                        <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{r.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Changelog */}
            <section id="changelog">
              <SectionHeading icon={Code2} title="Changelog" />
              <div className="space-y-5">
                {[
                  {
                    version: "v1.4.0",
                    date: "June 2026",
                    changes: [
                      "Password hashing upgraded to bcrypt (cost 12) with automatic SHA-256 migration on next login",
                      "CSP headers enabled across all API responses",
                      "Request ID propagation via x-request-id header",
                      "AI CV Review endpoint now returns structured role recommendations",
                    ],
                  },
                  {
                    version: "v1.3.0",
                    date: "April 2026",
                    changes: [
                      "Added magic-link sign-in flow (/api/auth/magic-link)",
                      "OG image generation endpoints for social sharing",
                      "Employer job management: edit and close listings",
                    ],
                  },
                  {
                    version: "v1.2.0",
                    date: "February 2026",
                    changes: [
                      "Email verification flow added to registration",
                      "Password reset via email token",
                      "CV Upload endpoint for file-based review",
                    ],
                  },
                  {
                    version: "v1.0.0",
                    date: "January 2026",
                    changes: [
                      "Initial public API release",
                      "Job listings (CRUD), user auth, contact form",
                    ],
                  },
                ].map((entry) => (
                  <div key={entry.version} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: CORAL }} />
                      <div className="w-px flex-1 mt-1" style={{ backgroundColor: BORDER }} />
                    </div>
                    <div className="pb-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold font-mono" style={{ color: NAVY }}>{entry.version}</span>
                        <span className="text-xs" style={{ color: MUTED }}>{entry.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {entry.changes.map((c) => (
                          <li key={c} className="text-sm flex items-start gap-2" style={{ color: "#4A3A2A" }}>
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CORAL }} />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b" style={{ borderColor: BORDER }}>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${CORAL}15` }}>
        <Icon className="h-4 w-4" style={{ color: CORAL }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "var(--app-font-display)" }}>{title}</h2>
    </div>
  );
}

function buildCurl(ep: typeof endpoints[0]): string {
  const base = `curl -X ${ep.method} https://bridgepathnetwork.com${ep.path} \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json"`;
  if (!ep.body) return base;
  return `${base} \\
  -d '${ep.body.replace(/\n/g, "\n       ")}'`;
}
