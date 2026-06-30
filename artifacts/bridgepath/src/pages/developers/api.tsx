import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight, Copy, Check, Terminal, ArrowLeft, Layers,
  Search, ChevronDown, Lock,
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

// ── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      title="Copy"
      className="absolute top-2.5 right-2.5 p-1.5 rounded-md transition-colors"
      style={{ background: "rgba(255,255,255,0.08)", color: copied ? "#4ADE80" : "rgba(255,255,255,0.5)" }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Code block ───────────────────────────────────────────────────────────────
function Code({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden text-xs" style={{ background: "#0F172A" }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Terminal className="h-3 w-3" style={{ color: CORAL }} />
        <span className="font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{lang}</span>
      </div>
      <pre className="p-3 overflow-x-auto leading-relaxed font-mono" style={{ color: "#E2E8F0" }}>
        <code>{code.trim()}</code>
      </pre>
      <CopyButton text={code.trim()} />
    </div>
  );
}

// ── Method badge ─────────────────────────────────────────────────────────────
function Badge({ method }: { method: string }) {
  const map: Record<string, [string, string]> = {
    GET:    ["#0C4A6E", "#7DD3FC"],
    POST:   ["#14532D", "#86EFAC"],
    PUT:    ["#78350F", "#FCD34D"],
    PATCH:  ["#581C87", "#D8B4FE"],
    DELETE: ["#7F1D1D", "#FCA5A5"],
  };
  const [bg, fg] = map[method] ?? map.GET;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono shrink-0" style={{ backgroundColor: bg, color: fg }}>
      {method}
    </span>
  );
}

// ── Param row ────────────────────────────────────────────────────────────────
function ParamRow({ name, type, required, description }: { name: string; type: string; required?: boolean; description: string }) {
  return (
    <tr className="border-b text-xs" style={{ borderColor: BORDER }}>
      <td className="py-2.5 pr-3 font-mono font-semibold align-top" style={{ color: NAVY }}>
        {name}
        {required && <span className="ml-1 text-[10px] font-bold" style={{ color: CORAL }}>*</span>}
      </td>
      <td className="py-2.5 pr-3 font-mono align-top" style={{ color: "#9333EA" }}>{type}</td>
      <td className="py-2.5 leading-relaxed align-top" style={{ color: MUTED }}>{description}</td>
    </tr>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
type Param = { name: string; type: string; required?: boolean; description: string };
type Endpoint = {
  method: string; path: string; group: string;
  summary: string; description: string;
  queryParams?: Param[]; bodyParams?: Param[];
  responseShape: string; curlExample: string;
  authRequired: boolean;
};

const endpoints: Endpoint[] = [
  // ── AUTH ──────────────────────────────────────────────────────────────────
  {
    group: "Auth",
    method: "POST", path: "/api/auth/register",
    summary: "Register",
    description: "Create a new user account. Returns a 201 with needsVerification: true for non-demo emails — the user must click the link in the verification email before they can sign in.",
    authRequired: false,
    bodyParams: [
      { name: "email",       type: "string",  required: true,  description: "User's email address. Must be unique." },
      { name: "password",    type: "string",  required: false, description: "Min 8 chars, at least one letter and one digit. Omit for magic-link-only accounts." },
      { name: "name",        type: "string",  required: true,  description: "Display name." },
      { name: "role",        type: "string",  required: true,  description: '"job_seeker" or "employer".' },
      { name: "linkedinUrl", type: "string",  required: false, description: "LinkedIn profile URL — stored on the profile." },
    ],
    responseShape: `{
  "needsVerification": true,
  "email": "talent@example.com"
}
// OR — for demo accounts:
{
  "user": { "id": 42, "email": "...", "name": "...", "role": "job_seeker" },
  "token": "<YOUR_TOKEN>",
  "isNew": true
}`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "kwame@example.com",
    "password": "SecurePass1",
    "name": "Kwame Asante",
    "role": "job_seeker"
  }'`,
  },
  {
    group: "Auth",
    method: "POST", path: "/api/auth/login",
    summary: "Login",
    description: "Authenticate and receive a Bearer token. Add ?cookie=1 to also receive an httpOnly Set-Cookie (bp_token) for browser-based sessions.",
    authRequired: false,
    queryParams: [
      { name: "cookie", type: "\"1\"", required: false, description: "Pass cookie=1 to also set an httpOnly bp_token cookie alongside the JSON token." },
    ],
    bodyParams: [
      { name: "email",    type: "string", required: true,  description: "Registered email address." },
      { name: "password", type: "string", required: false, description: "Password. Omit to use magic-link flow instead." },
    ],
    responseShape: `{
  "user": {
    "id": 42,
    "email": "kwame@example.com",
    "name": "Kwame Asante",
    "role": "job_seeker",
    "emailVerified": true,
    "profile": { "location": "Accra, Ghana", "skills": ["Python", "SQL"] }
  },
  "token": "<YOUR_TOKEN>"
}`,
    curlExample: `# Standard Bearer token login
curl -X POST "https://bridgepathnetwork.com/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"kwame@example.com","password":"SecurePass1"}'

# With httpOnly cookie (browser sessions)
curl -X POST "https://bridgepathnetwork.com/api/auth/login?cookie=1" \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{"email":"kwame@example.com","password":"SecurePass1"}'`,
  },
  {
    group: "Auth",
    method: "GET", path: "/api/auth/me",
    summary: "Get current user",
    description: "Returns the full profile of the currently authenticated user. Accepts both Bearer header and bp_token httpOnly cookie.",
    authRequired: true,
    responseShape: `{
  "id": 42,
  "email": "kwame@example.com",
  "name": "Kwame Asante",
  "role": "job_seeker",
  "emailVerified": true,
  "oauthProvider": null,
  "createdAt": "2026-01-15T09:00:00Z",
  "profile": {
    "id": 7,
    "userId": 42,
    "bio": "Data analyst with 5 years...",
    "location": "Accra, Ghana",
    "country": "GH",
    "skills": ["Python", "SQL", "Tableau"],
    "experience": "5 years",
    "resumeUrl": null,
    "avatarUrl": null
  }
}`,
    curlExample: `curl https://bridgepathnetwork.com/api/auth/me \\
  -H "Authorization: Bearer $TOKEN"`,
  },
  {
    group: "Auth",
    method: "POST", path: "/api/auth/forgot-password",
    summary: "Request password reset",
    description: "Sends a password reset link to the email. Always returns 200 to prevent email enumeration.",
    authRequired: false,
    bodyParams: [
      { name: "email", type: "string", required: true, description: "The registered email address." },
    ],
    responseShape: `{ "message": "If that email is registered, a reset link has been sent." }`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/auth/forgot-password \\
  -H "Content-Type: application/json" \\
  -d '{"email":"kwame@example.com"}'`,
  },
  {
    group: "Auth",
    method: "POST", path: "/api/auth/reset-password",
    summary: "Reset password",
    description: "Validates the reset token and sets a new bcrypt-hashed password. Returns a valid auth token on success.",
    authRequired: false,
    bodyParams: [
      { name: "token",    type: "string", required: true, description: "Token from the reset email link." },
      { name: "password", type: "string", required: true, description: "New password (min 8 chars, must include letter + digit)." },
    ],
    responseShape: `{
  "user": { "id": 42, ... },
  "token": "<YOUR_TOKEN>"
}`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/auth/reset-password \\
  -H "Content-Type: application/json" \\
  -d '{"token":"abc123...","password":"NewSecure1"}'`,
  },
  {
    group: "Auth",
    method: "POST", path: "/api/auth/magic-link",
    summary: "Request magic link",
    description: "Sends a one-time sign-in link valid for 30 minutes. No password required.",
    authRequired: false,
    bodyParams: [
      { name: "email", type: "string", required: true, description: "Must belong to an existing account." },
    ],
    responseShape: `{ "message": "Magic link sent! Check your inbox." }`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/auth/magic-link \\
  -H "Content-Type: application/json" \\
  -d '{"email":"kwame@example.com"}'`,
  },
  {
    group: "Auth",
    method: "POST", path: "/api/auth/change-password",
    summary: "Change password",
    description: "Change the authenticated user's password. Validates the current password first.",
    authRequired: true,
    bodyParams: [
      { name: "currentPassword", type: "string", required: true, description: "Current account password." },
      { name: "newPassword",     type: "string", required: true, description: "New password (min 8 chars, letter + digit)." },
    ],
    responseShape: `{ "success": true, "message": "Password changed successfully" }`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/auth/change-password \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"currentPassword":"OldPass1","newPassword":"NewPass2"}'`,
  },

  // ── JOBS ──────────────────────────────────────────────────────────────────
  {
    group: "Jobs",
    method: "GET", path: "/api/jobs",
    summary: "List jobs",
    description: "Returns a paginated list of active job listings. Supports full-text search and filtering.",
    authRequired: false,
    queryParams: [
      { name: "q",        type: "string",  description: "Full-text search query (title, company, description)." },
      { name: "location", type: "string",  description: "Filter by location string (partial match)." },
      { name: "type",     type: "string",  description: '"Full-time" | "Part-time" | "Contract" | "Remote".' },
      { name: "page",     type: "number",  description: "Page number, 1-indexed. Default: 1." },
      { name: "limit",    type: "number",  description: "Results per page. Default: 20, max: 50." },
    ],
    responseShape: `{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Data Analyst",
      "company": "Acme Corp",
      "location": "Accra, Ghana",
      "type": "Full-time",
      "salary": "$55,000 – $70,000",
      "description": "We are looking for...",
      "requirements": ["3+ years SQL", "Python"],
      "postedAt": "2026-05-28T10:00:00Z",
      "closesAt": "2026-06-30T00:00:00Z"
    }
  ],
  "total": 48,
  "page": 1,
  "pages": 5
}`,
    curlExample: `# All jobs
curl "https://bridgepathnetwork.com/api/jobs"

# Search + filter
curl "https://bridgepathnetwork.com/api/jobs?q=data+analyst&location=Accra&type=Full-time&page=1"`,
  },
  {
    group: "Jobs",
    method: "GET", path: "/api/jobs/:id",
    summary: "Get job",
    description: "Fetch full details for a single job listing by ID.",
    authRequired: false,
    responseShape: `{
  "id": 1,
  "title": "Senior Data Analyst",
  "company": "Acme Corp",
  "location": "Accra, Ghana",
  "type": "Full-time",
  "salary": "$55,000 – $70,000",
  "description": "Full job description...",
  "requirements": ["3+ years SQL", "Python proficiency"],
  "postedAt": "2026-05-28T10:00:00Z"
}`,
    curlExample: `curl https://bridgepathnetwork.com/api/jobs/1`,
  },
  {
    group: "Jobs",
    method: "POST", path: "/api/jobs",
    summary: "Post a job",
    description: "Create a new job listing. Requires an employer account.",
    authRequired: true,
    bodyParams: [
      { name: "title",        type: "string",   required: true,  description: "Job title." },
      { name: "location",     type: "string",   required: true,  description: "Office location or \"Remote\"." },
      { name: "type",         type: "string",   required: true,  description: '"Full-time" | "Part-time" | "Contract" | "Remote".' },
      { name: "description",  type: "string",   required: true,  description: "Full job description (markdown supported)." },
      { name: "salary",       type: "string",   required: false, description: "Salary range string, e.g. \"$40,000–$60,000\"." },
      { name: "requirements", type: "string[]", required: false, description: "Array of requirement strings." },
      { name: "closesAt",     type: "string",   required: false, description: "ISO 8601 closing date." },
    ],
    responseShape: `{
  "id": 99,
  "title": "Senior Data Analyst",
  "status": "active",
  "createdAt": "2026-06-04T08:30:00Z"
}`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/jobs \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Senior Data Analyst",
    "location": "Accra, Ghana",
    "type": "Full-time",
    "description": "We are hiring...",
    "salary": "$55,000–$70,000",
    "requirements": ["3+ years SQL", "Python"]
  }'`,
  },
  {
    group: "Jobs",
    method: "PATCH", path: "/api/jobs/:id",
    summary: "Update a job",
    description: "Update any field on a job listing you own. Send only the fields you want to change.",
    authRequired: true,
    bodyParams: [
      { name: "title",       type: "string",  description: "Updated job title." },
      { name: "description", type: "string",  description: "Updated description." },
      { name: "status",      type: "string",  description: '"active" | "closed" | "draft".' },
      { name: "salary",      type: "string",  description: "Updated salary range." },
    ],
    responseShape: `{ "id": 99, "title": "...", "status": "active", "updatedAt": "..." }`,
    curlExample: `curl -X PATCH https://bridgepathnetwork.com/api/jobs/99 \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"closed"}'`,
  },

  // ── APPLICATIONS ──────────────────────────────────────────────────────────
  {
    group: "Applications",
    method: "POST", path: "/api/jobs/:id/apply",
    summary: "Apply for a job",
    description: "Submit an application for a job. Requires a job_seeker account.",
    authRequired: true,
    bodyParams: [
      { name: "coverLetter", type: "string",  required: false, description: "Optional cover letter text." },
      { name: "resumeUrl",   type: "string",  required: false, description: "URL to a hosted CV/resume." },
    ],
    responseShape: `{
  "id": 201,
  "jobId": 1,
  "userId": 42,
  "status": "pending",
  "appliedAt": "2026-06-04T09:15:00Z"
}`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/jobs/1/apply \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"coverLetter":"I am excited to apply..."}'`,
  },
  {
    group: "Applications",
    method: "GET", path: "/api/applications",
    summary: "List applications",
    description: "Job seekers: returns their own applications. Employers: returns applications for their job listings.",
    authRequired: true,
    queryParams: [
      { name: "jobId",  type: "number",  description: "Filter applications by job ID (employer use)." },
      { name: "status", type: "string",  description: '"pending" | "reviewed" | "shortlisted" | "rejected".' },
    ],
    responseShape: `{
  "applications": [
    {
      "id": 201,
      "jobId": 1,
      "jobTitle": "Senior Data Analyst",
      "applicantName": "Kwame Asante",
      "status": "pending",
      "appliedAt": "2026-06-04T09:15:00Z"
    }
  ],
  "total": 3
}`,
    curlExample: `curl https://bridgepathnetwork.com/api/applications \\
  -H "Authorization: Bearer $TOKEN"`,
  },

  // ── AI CV REVIEW ──────────────────────────────────────────────────────────
  {
    group: "AI CV Review",
    method: "POST", path: "/api/cv-review",
    summary: "Analyse a CV",
    description: "Submit CV text for AI-powered analysis. Returns a structured review with a 0–100 score, strengths, improvement areas, and role recommendations. Powered by GPT. Rate limited to 10 requests/hour per user.",
    authRequired: true,
    bodyParams: [
      { name: "cvText", type: "string", required: true, description: "Plain text content of the CV. Max ~8,000 tokens." },
    ],
    responseShape: `{
  "score": 82,
  "summary": "Strong analytical background with clear career progression.",
  "strengths": [
    "Quantified achievements",
    "Relevant certifications (AWS, Google Data)"
  ],
  "improvements": [
    "Add a concise professional summary at the top",
    "Tailor keywords to target role descriptions"
  ],
  "roleRecommendations": [
    "Senior Data Analyst",
    "Business Intelligence Lead",
    "Product Analyst"
  ]
}`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/cv-review \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"cvText":"Kwame Asante\\nSenior Data Analyst\\n..."}'`,
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  {
    group: "Contact",
    method: "POST", path: "/api/contact",
    summary: "Submit enquiry",
    description: "Submit a general contact or hiring enquiry. Saved to the database and triggers a team notification.",
    authRequired: false,
    bodyParams: [
      { name: "name",    type: "string", required: true,  description: "Full name of the enquirer." },
      { name: "company", type: "string", required: false, description: "Organisation name." },
      { name: "email",   type: "string", required: true,  description: "Contact email address." },
      { name: "phone",   type: "string", required: false, description: "Phone number." },
      { name: "type",    type: "string", required: false, description: '"Hiring talent" | "Finding a job" | "HR consulting" | "Partnership" | "Other".' },
      { name: "message", type: "string", required: false, description: "Enquiry message body." },
    ],
    responseShape: `{ "success": true }`,
    curlExample: `curl -X POST https://bridgepathnetwork.com/api/contact \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Sarah Osei",
    "company": "TechVentures Ltd",
    "email": "sarah@techventures.com",
    "type": "Hiring talent",
    "message": "We are expanding our engineering team in Nairobi..."
  }'`,
  },
];

const groups = [...new Set(endpoints.map((e) => e.group))];

// ── Main component ────────────────────────────────────────────────────────────
export default function ApiReferencePage() {
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = endpoints.filter((ep) => {
    const matchGroup = activeGroup === "all" || ep.group === activeGroup;
    const q = search.toLowerCase();
    const matchSearch = !q || ep.path.toLowerCase().includes(q) || ep.summary.toLowerCase().includes(q) || ep.group.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM }}>
      <PageSEO
        title="API Reference | Bridgepath Africa Developers"
        description="Complete REST API reference for the Bridgepath Africa platform — authentication, job listings, applications, AI CV review, and more."
        path="/developers/api"
      />
      <Navbar />

      {/* ── Header band ── */}
      <div style={{ background: NAVY }} className="py-10 md:py-14">
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl">
          <Link href="/developers">
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold mb-5 hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.55)" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Developers
            </button>
          </Link>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "var(--app-font-display)" }}>
                API Reference
              </h1>
              <p className="text-slate-300 text-sm sm:text-base">
                {endpoints.length} endpoints · REST · JSON · Bearer auth
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ backgroundColor: `${CORAL}30`, color: CORAL, border: `1px solid ${CORAL}50` }}>
                Base: bridgepathnetwork.com
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full font-bold" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                v1.4
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-20 border-b" style={{ backgroundColor: CARD, borderColor: BORDER, boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl">
          <div className="flex items-center gap-3 py-3 overflow-x-auto">
            {/* Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: MUTED }} />
              <input
                type="text"
                placeholder="Search endpoints…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none focus:ring-1"
                style={{ borderColor: BORDER, backgroundColor: CREAM, color: NAVY, width: "180px" }}
              />
            </div>
            <div className="h-4 w-px shrink-0" style={{ backgroundColor: BORDER }} />
            {/* Group filters */}
            {["all", ...groups].map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  backgroundColor: activeGroup === g ? CORAL : "transparent",
                  color: activeGroup === g ? "#fff" : MUTED,
                }}
              >
                {g === "all" ? "All" : g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Endpoint list ── */}
      <main className="flex-1 container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl py-8">
        {filtered.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: MUTED }}>No endpoints match your search.</p>
        )}

        {groups.filter((g) => activeGroup === "all" || activeGroup === g).map((group) => {
          const groupEps = filtered.filter((e) => e.group === group);
          if (groupEps.length === 0) return null;
          return (
            <section key={group} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="h-4 w-4 shrink-0" style={{ color: CORAL }} />
                <h2 className="text-base font-bold" style={{ color: NAVY, fontFamily: "var(--app-font-display)" }}>{group}</h2>
                <div className="flex-1 h-px" style={{ backgroundColor: BORDER }} />
                <span className="text-xs" style={{ color: MUTED }}>{groupEps.length} endpoint{groupEps.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="space-y-2">
                {groupEps.map((ep) => {
                  const idx = endpoints.indexOf(ep);
                  const isOpen = openIdx === idx;
                  return (
                    <motion.div
                      key={idx}
                      className="rounded-xl border overflow-hidden"
                      style={{ borderColor: isOpen ? `${CORAL}45` : BORDER, backgroundColor: CARD }}
                    >
                      {/* Row */}
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : idx)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-orange-50/30 transition-colors"
                      >
                        <Badge method={ep.method} />
                        <code className="text-sm font-mono flex-1" style={{ color: NAVY }}>{ep.path}</code>
                        <span className="hidden sm:block text-xs" style={{ color: MUTED }}>{ep.summary}</span>
                        {ep.authRequired && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${NAVY}10`, color: NAVY }}>
                            <Lock className="h-3 w-3" /> Auth
                          </span>
                        )}
                        <ChevronDown
                          className="h-4 w-4 shrink-0 transition-transform"
                          style={{ color: MUTED, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      {/* Expanded detail */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="border-t px-4 py-5 space-y-5" style={{ borderColor: BORDER }}>
                              {/* Description */}
                              <p className="text-sm leading-relaxed" style={{ color: "#3A2A1A" }}>{ep.description}</p>

                              {/* Auth badge */}
                              {ep.authRequired && (
                                <p className="text-xs font-semibold inline-flex items-center gap-1.5" style={{ color: CORAL }}>
                                  <Lock className="h-3.5 w-3.5 shrink-0" /> Requires <code className="font-mono">Authorization: Bearer &lt;token&gt;</code> header
                                </p>
                              )}

                              {/* Query params */}
                              {ep.queryParams && ep.queryParams.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>Query parameters</p>
                                  <div className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER }}>
                                    <table className="w-full text-sm">
                                      <thead><tr style={{ backgroundColor: `${NAVY}06` }}>
                                        {["Name", "Type", "Description"].map(h => (
                                          <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b" style={{ color: MUTED, borderColor: BORDER }}>{h}</th>
                                        ))}
                                      </tr></thead>
                                      <tbody>{ep.queryParams.map(p => <ParamRow key={p.name} {...p} />)}</tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Body params */}
                              {ep.bodyParams && ep.bodyParams.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>Request body <span className="normal-case font-normal">(application/json)</span></p>
                                  <div className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER }}>
                                    <table className="w-full text-sm">
                                      <thead><tr style={{ backgroundColor: `${NAVY}06` }}>
                                        {["Name", "Type", "Description"].map(h => (
                                          <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b" style={{ color: MUTED, borderColor: BORDER }}>{h}</th>
                                        ))}
                                      </tr></thead>
                                      <tbody>{ep.bodyParams.map(p => <ParamRow key={p.name} {...p} />)}</tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Response */}
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>Response (200 OK)</p>
                                <Code code={ep.responseShape} lang="json" />
                              </div>

                              {/* curl */}
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: MUTED }}>curl example</p>
                                <Code code={ep.curlExample} lang="bash" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
