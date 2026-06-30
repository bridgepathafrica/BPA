import { Router } from "express";
import path from "path";
import sharp from "sharp";
import { db, jobsTable, profilesTable } from "@workspace/db";
import { eq } from "@workspace/db";
import { escapeSvg } from "../lib/html";

const router = Router();

const OG_W = 1200;
const OG_H = 630;

const CREAM = "#FEF9F4";
const TERRACOTTA = "#C04020";
const MARIGOLD = "#F0A010";
const INK = "#1E1511";

function buildOverlay(): Buffer {
  const svg = `<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%"   stop-color="${INK}" stop-opacity="0.96"/>
        <stop offset="30%"  stop-color="${INK}" stop-opacity="0.72"/>
        <stop offset="58%"  stop-color="${INK}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${INK}" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="leftGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stop-color="${INK}" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="${INK}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Cinematic overlays -->
    <rect width="${OG_W}" height="${OG_H}" fill="url(#heroGrad)"/>
    <rect width="${OG_W}" height="${OG_H}" fill="url(#leftGrad)"/>

    <!-- ── TOP-LEFT: brand chip ── -->
    <rect x="52" y="48" rx="10" ry="10" width="190" height="44" fill="${TERRACOTTA}"/>
    <text
      x="147" y="76"
      font-family="Arial Black, Arial, Helvetica, sans-serif"
      font-size="19" font-weight="900"
      fill="${CREAM}" text-anchor="middle" letter-spacing="0.4">
      Bridgepath Africa
    </text>

    <!-- ── BOTTOM-LEFT: headline block ── -->
    <!-- Eyebrow -->
    <text
      x="52" y="${OG_H - 190}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="13" font-weight="700"
      fill="${MARIGOLD}" letter-spacing="3.5">
      AFRICA&apos;S PREMIER HR PLATFORM
    </text>

    <!-- Accent bars -->
    <rect x="52"  y="${OG_H - 172}" width="52" height="4" rx="2" fill="${TERRACOTTA}"/>
    <rect x="112" y="${OG_H - 172}" width="18" height="4" rx="2" fill="${MARIGOLD}"/>

    <!-- H1 line 1 – cream -->
    <text
      x="52" y="${OG_H - 114}"
      font-family="Arial Black, Arial, Helvetica, sans-serif"
      font-size="72" font-weight="900"
      fill="${CREAM}">
      Hire Africa.
    </text>

    <!-- H1 line 2 – terracotta -->
    <text
      x="52" y="${OG_H - 40}"
      font-family="Arial Black, Arial, Helvetica, sans-serif"
      font-size="72" font-weight="900"
      fill="${TERRACOTTA}">
      Build the Future.
    </text>

    <!-- ── BOTTOM-RIGHT: tagline + domain ── -->
    <text
      x="${OG_W - 52}" y="${OG_H - 110}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17" fill="${CREAM}" fill-opacity="0.82"
      text-anchor="end">
      Connecting African talent
    </text>
    <text
      x="${OG_W - 52}" y="${OG_H - 84}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17" fill="${CREAM}" fill-opacity="0.82"
      text-anchor="end">
      with global employers.
    </text>
    <text
      x="${OG_W - 52}" y="${OG_H - 48}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="14" fill="${MARIGOLD}" fill-opacity="0.95"
      text-anchor="end" letter-spacing="0.6">
      bridgepathnetwork.com
    </text>

    <!-- ── BOTTOM-LEFT: country pills ── -->
    <rect x="52"  y="${OG_H - 28}" width="84" height="22" rx="11" fill="${MARIGOLD}" fill-opacity="0.18"/>
    <text x="94"  y="${OG_H - 12}"
      font-family="Arial, Helvetica, sans-serif" font-size="12"
      fill="${MARIGOLD}" text-anchor="middle">Ghana Active</text>

    <rect x="144" y="${OG_H - 28}" width="112" height="22" rx="11" fill="${CREAM}" fill-opacity="0.12"/>
    <text x="200" y="${OG_H - 12}"
      font-family="Arial, Helvetica, sans-serif" font-size="12"
      fill="${CREAM}" fill-opacity="0.80" text-anchor="middle">Expanding Across Africa</text>
  </svg>`;

  return Buffer.from(svg);
}

let cachedBuffer: Buffer | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60_000;

router.get("/", async (_req, res) => {
  try {
    const now = Date.now();

    if (!cachedBuffer || now - cacheTime > CACHE_TTL_MS) {
      const heroPath = path.resolve(
        process.cwd(),
        "../bridgepath/public/photos/modern-africa-office.webp",
      );

      cachedBuffer = await sharp(heroPath)
        .resize(OG_W, OG_H, { fit: "cover", position: "centre" })
        .composite([{ input: buildOverlay(), top: 0, left: 0 }])
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();

      cacheTime = now;
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Vary", "*");
    res.setHeader("Content-Length", cachedBuffer.length);
    res.send(cachedBuffer);
  } catch (err) {
    res.status(500).send("Failed to generate OG image");
  }
});

// ── Per-Job OG image ──────────────────────────────────────────────────────────
const jobCache = new Map<number, { buf: Buffer; ts: number }>();

function buildJobOverlay(title: string, company: string, location: string, jobType: string): Buffer {
  const truncTitle   = escapeSvg(title.length > 52 ? title.slice(0, 49) + "…" : title);
  const truncCompany = escapeSvg(company.length > 42 ? company.slice(0, 39) + "…" : company);
  const safeLocation = escapeSvg(location);
  const safeJobType  = escapeSvg(jobType.toUpperCase());
  const svg = `<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%"   stop-color="${INK}" stop-opacity="0.97"/>
        <stop offset="35%"  stop-color="${INK}" stop-opacity="0.75"/>
        <stop offset="65%"  stop-color="${INK}" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="${INK}" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stop-color="${INK}" stop-opacity="0.60"/>
        <stop offset="60%" stop-color="${INK}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${OG_W}" height="${OG_H}" fill="url(#g1)"/>
    <rect width="${OG_W}" height="${OG_H}" fill="url(#g2)"/>

    <!-- Brand chip -->
    <rect x="52" y="48" rx="10" ry="10" width="190" height="40" fill="${TERRACOTTA}"/>
    <text x="147" y="74" font-family="Arial Black,Arial,sans-serif" font-size="17" font-weight="900"
      fill="${CREAM}" text-anchor="middle" letter-spacing="0.4">Bridgepath Africa</text>

    <!-- Job type pill -->
    <rect x="52" y="${OG_H - 236}" rx="20" ry="20" width="${Math.max(100, jobType.length * 11 + 32)}" height="34" fill="${MARIGOLD}" fill-opacity="0.22"/>
    <text x="68" y="${OG_H - 214}" font-family="Arial,sans-serif" font-size="13" font-weight="700"
      fill="${MARIGOLD}" letter-spacing="2">${safeJobType}</text>

    <!-- Job title -->
    <text x="52" y="${OG_H - 164}" font-family="Arial Black,Arial,sans-serif" font-size="58" font-weight="900"
      fill="${CREAM}">${truncTitle}</text>

    <!-- Accent bars -->
    <rect x="52" y="${OG_H - 142}" width="56" height="4" rx="2" fill="${TERRACOTTA}"/>
    <rect x="116" y="${OG_H - 142}" width="20" height="4" rx="2" fill="${MARIGOLD}"/>

    <!-- Company name -->
    <text x="52" y="${OG_H - 96}" font-family="Arial Black,Arial,sans-serif" font-size="28" font-weight="900"
      fill="${CREAM}" fill-opacity="0.9">${truncCompany}</text>

    <!-- Location -->
    <text x="52" y="${OG_H - 56}" font-family="Arial,sans-serif" font-size="20"
      fill="${CREAM}" fill-opacity="0.65">${safeLocation}</text>

    <!-- Domain -->
    <text x="${OG_W - 52}" y="${OG_H - 48}" font-family="Arial,sans-serif" font-size="14"
      fill="${MARIGOLD}" fill-opacity="0.90" text-anchor="end" letter-spacing="0.6">bridgepathnetwork.com</text>
  </svg>`;
  return Buffer.from(svg);
}

router.get("/job/:id", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    if (isNaN(jobId)) { res.status(400).send("Invalid job id"); return; }

    const now = Date.now();
    const cached = jobCache.get(jobId);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=60");
      res.setHeader("Content-Length", cached.buf.length);
      res.send(cached.buf);
      return;
    }

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    const [profile] = job
      ? await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1)
      : [undefined];

    const title = job?.title ?? "Job Opening";
    const company = profile?.companyName ?? "Top Company";
    const location = job ? `${job.location} · ${job.country}` : "Africa";
    const jobType = (job?.type ?? "role").replace(/_/g, " ");

    const bgPath = path.resolve(process.cwd(), "../bridgepath/public/photos/boardroom-clean.webp");
    const buf = await sharp(bgPath)
      .resize(OG_W, OG_H, { fit: "cover", position: "centre" })
      .composite([{ input: buildJobOverlay(title, company, location, jobType), top: 0, left: 0 }])
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    jobCache.set(jobId, { buf, ts: now });

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Content-Length", buf.length);
    res.send(buf);
  } catch (err) {
    res.status(500).send("Failed to generate job OG image");
  }
});

// ── Per-Service OG image ───────────────────────────────────────────────────────
const serviceNames: Record<string, { label: string; tagline: string }> = {
  "employment-of-record":    { label: "Employment of Record", tagline: "Hire in Africa without a local entity" },
  "hr-consultancy":          { label: "HR Consultancy", tagline: "Expert HR advice for African markets" },
  "recruitment-services":    { label: "Recruitment Services", tagline: "Pre-screened African talent, fast" },
  "payroll-tax":             { label: "Payroll & Tax", tagline: "Compliant payroll across Across Africa" },
  "psychometric-assessments":{ label: "Psychometric Assessments", tagline: "Data-driven hiring decisions" },
  "staff-outsourcing":       { label: "Staff Outsourcing", tagline: "Flexible workforce solutions" },
  "secondment-services":     { label: "Secondment Services", tagline: "Expert talent on short-term placements" },
  "expatriate-services":     { label: "Expatriate Services", tagline: "Relocate & onboard global talent" },
  "interim-management":      { label: "Interim Management", tagline: "Leadership cover when you need it" },
};

const serviceCache = new Map<string, { buf: Buffer; ts: number }>();

function buildServiceOverlay(label: string, tagline: string): Buffer {
  const truncLabel = label.length > 40 ? label.slice(0, 37) + "…" : label;
  const svg = `<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%"   stop-color="${INK}" stop-opacity="0.97"/>
        <stop offset="38%"  stop-color="${INK}" stop-opacity="0.72"/>
        <stop offset="68%"  stop-color="${INK}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${INK}" stop-opacity="0.06"/>
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stop-color="${INK}" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="${INK}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${OG_W}" height="${OG_H}" fill="url(#g1)"/>
    <rect width="${OG_W}" height="${OG_H}" fill="url(#g2)"/>

    <!-- Brand chip -->
    <rect x="52" y="48" rx="10" ry="10" width="190" height="40" fill="${TERRACOTTA}"/>
    <text x="147" y="74" font-family="Arial Black,Arial,sans-serif" font-size="17" font-weight="900"
      fill="${CREAM}" text-anchor="middle" letter-spacing="0.4">Bridgepath Africa</text>

    <!-- Eyebrow -->
    <text x="52" y="${OG_H - 218}" font-family="Arial,sans-serif" font-size="13" font-weight="700"
      fill="${MARIGOLD}" letter-spacing="3.5">HR SERVICES · AFRICA</text>

    <!-- Accent bars -->
    <rect x="52" y="${OG_H - 200}" width="52" height="4" rx="2" fill="${TERRACOTTA}"/>
    <rect x="112" y="${OG_H - 200}" width="18" height="4" rx="2" fill="${MARIGOLD}"/>

    <!-- Service name -->
    <text x="52" y="${OG_H - 130}" font-family="Arial Black,Arial,sans-serif" font-size="66" font-weight="900"
      fill="${CREAM}">${truncLabel}</text>

    <!-- Tagline -->
    <text x="52" y="${OG_H - 70}" font-family="Arial,sans-serif" font-size="22"
      fill="${CREAM}" fill-opacity="0.78">${tagline}</text>

    <!-- Domain -->
    <text x="${OG_W - 52}" y="${OG_H - 48}" font-family="Arial,sans-serif" font-size="14"
      fill="${MARIGOLD}" fill-opacity="0.90" text-anchor="end" letter-spacing="0.6">bridgepathnetwork.com</text>
  </svg>`;
  return Buffer.from(svg);
}

router.get("/service/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const svc = serviceNames[slug];
    if (!svc) { res.status(404).send("Unknown service slug"); return; }

    const now = Date.now();
    const cached = serviceCache.get(slug);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=60");
      res.setHeader("Content-Length", cached.buf.length);
      res.send(cached.buf);
      return;
    }

    const bgPath = path.resolve(process.cwd(), "../bridgepath/public/photos/hr-professional.webp");
    const buf = await sharp(bgPath)
      .resize(OG_W, OG_H, { fit: "cover", position: "top" })
      .composite([{ input: buildServiceOverlay(svc.label, svc.tagline), top: 0, left: 0 }])
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    serviceCache.set(slug, { buf, ts: now });

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Content-Length", buf.length);
    res.send(buf);
  } catch (err) {
    res.status(500).send("Failed to generate service OG image");
  }
});

export default router;
