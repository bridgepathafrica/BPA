import { Router, type Response, type NextFunction } from "express";
import {
  db, usersTable, jobsTable,
  applicationsTable, contactSubmissionsTable, cvReviewsTable,
} from "@workspace/db";
import { eq, desc, count, sql, and, gte, lt } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { sendEmail } from "../lib/email";
import { escapeHtml } from "../lib/html";

const router = Router();
const HUMAN_REVIEW_PRICE = 15; // USD

async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const [user] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Forbidden", message: "Admin access required." });
      return;
    }
    req.userRole = "admin";
    next();
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

router.use(requireAuth);
router.use(requireAdmin);

// ── GET /admin/stats ─────────────────────────────────────────────────────────
router.get("/admin/stats", async (req: AuthenticatedRequest, res) => {
  try {
    const now = new Date();
    const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLast   = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sevenDaysAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      [{ totalUsers }], [{ totalJobs }], [{ activeJobs }],
      [{ totalApplications }], [{ totalContacts }], [{ totalCvReviews }],
      [{ paidReviewsTotal }], [{ paidReviewsThisMonth }], [{ paidReviewsLastMonth }],
      [{ recentSignups }], [{ lastMonthSignups }], [{ recentApplications }],
      usersByRoleRows, appsByStatusRows,
    ] = await Promise.all([
      db.select({ totalUsers: count() }).from(usersTable),
      db.select({ totalJobs: count() }).from(jobsTable),
      db.select({ activeJobs: count() }).from(jobsTable).where(eq(jobsTable.isActive, true)),
      db.select({ totalApplications: count() }).from(applicationsTable),
      db.select({ totalContacts: count() }).from(contactSubmissionsTable),
      db.select({ totalCvReviews: count() }).from(cvReviewsTable),
      db.select({ paidReviewsTotal: count() }).from(cvReviewsTable).where(eq(cvReviewsTable.paymentStatus, "paid")),
      db.select({ paidReviewsThisMonth: count() }).from(cvReviewsTable).where(and(eq(cvReviewsTable.paymentStatus, "paid"), gte(cvReviewsTable.createdAt, startOfMonth))),
      db.select({ paidReviewsLastMonth: count() }).from(cvReviewsTable).where(and(eq(cvReviewsTable.paymentStatus, "paid"), gte(cvReviewsTable.createdAt, startOfLast), lt(cvReviewsTable.createdAt, startOfMonth))),
      db.select({ recentSignups: count() }).from(usersTable).where(gte(usersTable.createdAt, sevenDaysAgo)),
      db.select({ lastMonthSignups: count() }).from(usersTable).where(and(gte(usersTable.createdAt, thirtyDaysAgo), lt(usersTable.createdAt, sevenDaysAgo))),
      db.select({ recentApplications: count() }).from(applicationsTable).where(gte(applicationsTable.createdAt, sevenDaysAgo)),
      db.select({ role: usersTable.role, cnt: count() }).from(usersTable).groupBy(usersTable.role),
      db.select({ status: applicationsTable.status, cnt: count() }).from(applicationsTable).groupBy(applicationsTable.status),
    ]);

    const totalRevenue   = Number(paidReviewsTotal) * HUMAN_REVIEW_PRICE;
    const mrr            = Number(paidReviewsThisMonth) * HUMAN_REVIEW_PRICE;
    const lastMonthRev   = Number(paidReviewsLastMonth) * HUMAN_REVIEW_PRICE;
    const revenueGrowth  = lastMonthRev > 0 ? Math.round(((mrr - lastMonthRev) / lastMonthRev) * 100) : null;
    const userGrowth     = Number(lastMonthSignups) > 0 ? Math.round(((Number(recentSignups) - Number(lastMonthSignups)) / Number(lastMonthSignups)) * 100) : null;

    res.json({
      totalUsers:        Number(totalUsers),
      totalJobs:         Number(totalJobs),
      activeJobs:        Number(activeJobs),
      totalApplications: Number(totalApplications),
      totalContacts:     Number(totalContacts),
      totalCvReviews:    Number(totalCvReviews),
      totalRevenue,
      mrr,
      lastMonthRevenue:  lastMonthRev,
      revenueGrowth,
      recentSignups:     Number(recentSignups),
      recentApplications: Number(recentApplications),
      userGrowth,
      usersByRole:  Object.fromEntries(usersByRoleRows.map(r => [r.role, Number(r.cnt)])),
      appsByStatus: Object.fromEntries(appsByStatusRows.map(s => [s.status, Number(s.cnt)])),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/revenue ───────────────────────────────────────────────────────
router.get("/admin/revenue", async (req: AuthenticatedRequest, res) => {
  try {
    // Monthly revenue + signups for the past 12 months
    const revenueRows = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
        DATE_TRUNC('month', created_at) AS month_date,
        COUNT(*)::int AS paid_reviews
      FROM cv_reviews
      WHERE payment_status = 'paid'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT 12
    `);

    const signupRows = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
        DATE_TRUNC('month', created_at) AS month_date,
        COUNT(*)::int AS signups
      FROM users
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT 12
    `);

    const appRows = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
        DATE_TRUNC('month', created_at) AS month_date,
        COUNT(*)::int AS applications
      FROM applications
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT 12
    `);

    // Merge into a unified chart dataset keyed by month
    const months = new Map<string, { month: string; revenue: number; signups: number; applications: number }>();

    const revArr = Array.from((revenueRows.rows ?? revenueRows) as any[]).reverse();
    const sigArr = Array.from((signupRows.rows ?? signupRows) as any[]).reverse();
    const appArr = Array.from((appRows.rows ?? appRows) as any[]).reverse();

    for (const r of revArr) {
      const k = String(r.month);
      if (!months.has(k)) months.set(k, { month: k, revenue: 0, signups: 0, applications: 0 });
      months.get(k)!.revenue = Number(r.paid_reviews) * HUMAN_REVIEW_PRICE;
    }
    for (const r of sigArr) {
      const k = String(r.month);
      if (!months.has(k)) months.set(k, { month: k, revenue: 0, signups: 0, applications: 0 });
      months.get(k)!.signups = Number(r.signups);
    }
    for (const r of appArr) {
      const k = String(r.month);
      if (!months.has(k)) months.set(k, { month: k, revenue: 0, signups: 0, applications: 0 });
      months.get(k)!.applications = Number(r.applications);
    }

    // Recent paid reviews
    const recentPaid = await db
      .select()
      .from(cvReviewsTable)
      .where(eq(cvReviewsTable.paymentStatus, "paid"))
      .orderBy(desc(cvReviewsTable.createdAt))
      .limit(20);

    const enrichedPaid = await Promise.all(recentPaid.map(async (r) => {
      const [user] = await db
        .select({ name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, r.userId))
        .limit(1);
      return {
        id: r.id,
        userName: user?.name ?? "Unknown",
        userEmail: user?.email ?? "",
        amount: HUMAN_REVIEW_PRICE,
        createdAt: r.createdAt.toISOString(),
      };
    }));

    res.json({
      chart: Array.from(months.values()),
      totalRevenue: enrichedPaid.length * HUMAN_REVIEW_PRICE,
      recentPaid: enrichedPaid,
      pricePerReview: HUMAN_REVIEW_PRICE,
    });
  } catch (err) {
    req.log.error({ err }, "Admin revenue error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/activity ──────────────────────────────────────────────────────
router.get("/admin/activity", async (req: AuthenticatedRequest, res) => {
  try {
    const [recentUsers, recentApps, recentContacts, recentReviews] = await Promise.all([
      db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, createdAt: usersTable.createdAt })
        .from(usersTable).orderBy(desc(usersTable.createdAt)).limit(8),
      db.select({ id: applicationsTable.id, status: applicationsTable.status, createdAt: applicationsTable.createdAt, jobId: applicationsTable.jobId, applicantId: applicationsTable.applicantId })
        .from(applicationsTable).orderBy(desc(applicationsTable.createdAt)).limit(8),
      db.select({ id: contactSubmissionsTable.id, name: contactSubmissionsTable.name, type: contactSubmissionsTable.type, createdAt: contactSubmissionsTable.createdAt })
        .from(contactSubmissionsTable).orderBy(desc(contactSubmissionsTable.createdAt)).limit(5),
      db.select({ id: cvReviewsTable.id, status: cvReviewsTable.status, paymentStatus: cvReviewsTable.paymentStatus, createdAt: cvReviewsTable.createdAt, userId: cvReviewsTable.userId })
        .from(cvReviewsTable).orderBy(desc(cvReviewsTable.createdAt)).limit(5),
    ]);

    const events: { type: string; label: string; sub: string; time: string }[] = [];

    for (const u of recentUsers) {
      events.push({ type: "signup", label: `${u.name} joined as ${u.role.replace("_", " ")}`, sub: u.email, time: u.createdAt.toISOString() });
    }
    for (const a of recentApps) {
      events.push({ type: "application", label: `New ${a.status} application`, sub: `Job #${a.jobId} · Applicant #${a.applicantId}`, time: a.createdAt.toISOString() });
    }
    for (const c of recentContacts) {
      events.push({ type: "contact", label: `Enquiry: ${c.type}`, sub: c.name, time: c.createdAt.toISOString() });
    }
    for (const r of recentReviews) {
      events.push({ type: "cvreview", label: `CV review ${r.status}${r.paymentStatus === "paid" ? " · $15 received" : ""}`, sub: `User #${r.userId}`, time: r.createdAt.toISOString() });
    }

    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json(events.slice(0, 20));
  } catch (err) {
    req.log.error({ err }, "Admin activity error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── POST /admin/notifications/broadcast ──────────────────────────────────────
router.post("/admin/notifications/broadcast", async (req: AuthenticatedRequest, res) => {
  try {
    const { subject, message, segment } = req.body as {
      subject?: string;
      message?: string;
      segment?: "all" | "employers" | "job_seekers" | "admins";
    };

    if (!subject?.trim() || !message?.trim()) {
      res.status(400).json({ error: "Subject and message are required." });
      return;
    }
    if (!["all", "employers", "job_seekers", "admins"].includes(segment ?? "")) {
      res.status(400).json({ error: "Invalid segment." });
      return;
    }

    // Fetch target users
    let usersQuery = db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.emailVerified, true))
      .$dynamic();

    if (segment === "employers")  usersQuery = usersQuery.where(eq(usersTable.role, "employer")) as any;
    if (segment === "job_seekers") usersQuery = usersQuery.where(eq(usersTable.role, "job_seeker")) as any;
    if (segment === "admins")     usersQuery = usersQuery.where(eq(usersTable.role, "admin")) as any;

    const targets = await usersQuery;

    let sent = 0, failed = 0;

    for (const user of targets) {
      const firstName = (user.name ?? "there").split(" ")[0];
      const html = buildBroadcastEmail({ firstName, subject: subject.trim(), message: message.trim() });
      const ok = await sendEmail({ to: user.email, subject: subject.trim(), html });
      if (ok) sent++; else failed++;
    }

    res.json({ success: true, total: targets.length, sent, failed, segment });
  } catch (err) {
    req.log.error({ err }, "Admin broadcast error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/notifications/preview-count ────────────────────────────────────
router.get("/admin/notifications/preview-count", async (req: AuthenticatedRequest, res) => {
  try {
    const segment = req.query.segment as string;
    let q = db.select({ cnt: count() }).from(usersTable).where(eq(usersTable.emailVerified, true)).$dynamic();
    if (segment === "employers")   q = q.where(eq(usersTable.role, "employer")) as any;
    if (segment === "job_seekers") q = q.where(eq(usersTable.role, "job_seeker")) as any;
    if (segment === "admins")      q = q.where(eq(usersTable.role, "admin")) as any;
    const [{ cnt }] = await q;
    res.json({ count: Number(cnt) });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/users ──────────────────────────────────────────────────────────
router.get("/admin/users", async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db.select({
      id: usersTable.id, email: usersTable.email, name: usersTable.name,
      role: usersTable.role, emailVerified: usersTable.emailVerified, createdAt: usersTable.createdAt,
    }).from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Admin users error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── PUT /admin/users/:id/role ─────────────────────────────────────────────────
router.put("/admin/users/:id/role", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    const { role } = req.body as { role: string };
    if (!["job_seeker", "employer", "admin"].includes(role)) { res.status(400).json({ error: "Invalid role" }); return; }
    if (userId === req.userId) { res.status(400).json({ error: "Cannot change your own role." }); return; }
    await db.update(usersTable).set({ role, updatedAt: new Date() } as any).where(eq(usersTable.id, userId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin role change error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
router.delete("/admin/users/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (userId === req.userId) { res.status(400).json({ error: "Cannot delete your own account." }); return; }
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete user error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/jobs ───────────────────────────────────────────────────────────
router.get("/admin/jobs", async (req: AuthenticatedRequest, res) => {
  try {
    const jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt));
    const enriched = await Promise.all(jobs.map(async (job) => {
      const [[{ cnt }], [employer]] = await Promise.all([
        db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id)),
        db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1),
      ]);
      return {
        id: job.id, title: job.title, location: job.location, country: job.country,
        type: job.type, industry: job.industry, isActive: job.isActive,
        createdAt: job.createdAt.toISOString(),
        applicationCount: Number(cnt),
        employerName: employer?.name ?? "Unknown", employerEmail: employer?.email ?? "",
      };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Admin jobs error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── PUT /admin/jobs/:id/toggle ────────────────────────────────────────────────
router.put("/admin/jobs/:id/toggle", async (req: AuthenticatedRequest, res) => {
  try {
    const jobId = parseInt(req.params.id as string, 10);
    const [job] = await db.select({ isActive: jobsTable.isActive }).from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) { res.status(404).json({ error: "Not Found" }); return; }
    await db.update(jobsTable).set({ isActive: !job.isActive, updatedAt: new Date() } as any).where(eq(jobsTable.id, jobId));
    res.json({ success: true, isActive: !job.isActive });
  } catch (err) {
    req.log.error({ err }, "Admin toggle job error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── DELETE /admin/jobs/:id ────────────────────────────────────────────────────
router.delete("/admin/jobs/:id", async (req: AuthenticatedRequest, res) => {
  try {
    await db.delete(jobsTable).where(eq(jobsTable.id, parseInt(req.params.id as string, 10)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete job error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/applications ───────────────────────────────────────────────────
router.get("/admin/applications", async (req: AuthenticatedRequest, res) => {
  try {
    const apps = await db.select().from(applicationsTable).orderBy(desc(applicationsTable.createdAt)).limit(500);
    const enriched = await Promise.all(apps.map(async (app) => {
      const [[applicant], [job]] = await Promise.all([
        db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, app.applicantId)).limit(1),
        db.select({ title: jobsTable.title, employerId: jobsTable.employerId }).from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1),
      ]);
      const [employer] = job ? await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1) : [];
      return {
        id: app.id, status: app.status, createdAt: app.createdAt.toISOString(),
        applicantName: applicant?.name ?? "Unknown", applicantEmail: applicant?.email ?? "",
        jobTitle: job?.title ?? "Unknown", employerName: employer?.name ?? "Unknown",
      };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Admin applications error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── PUT /admin/applications/:id/status ───────────────────────────────────────
router.put("/admin/applications/:id/status", async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body as { status: string };
    if (!["pending", "shortlisted", "accepted", "rejected", "withdrawn"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
    await db.update(applicationsTable).set({ status, updatedAt: new Date() } as any).where(eq(applicationsTable.id, parseInt(req.params.id as string, 10)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin application status error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/contacts ───────────────────────────────────────────────────────
router.get("/admin/contacts", async (req: AuthenticatedRequest, res) => {
  try {
    const contacts = await db.select().from(contactSubmissionsTable).orderBy(desc(contactSubmissionsTable.createdAt));
    res.json(contacts.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Admin contacts error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── DELETE /admin/contacts/:id ────────────────────────────────────────────────
router.delete("/admin/contacts/:id", async (req: AuthenticatedRequest, res) => {
  try {
    await db.delete(contactSubmissionsTable).where(eq(contactSubmissionsTable.id, parseInt(req.params.id as string, 10)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Admin delete contact error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /admin/cv-reviews ─────────────────────────────────────────────────────
router.get("/admin/cv-reviews", async (req: AuthenticatedRequest, res) => {
  try {
    const reviews = await db.select().from(cvReviewsTable).orderBy(desc(cvReviewsTable.createdAt)).limit(500);
    const enriched = await Promise.all(reviews.map(async (r) => {
      const [user] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, r.userId)).limit(1);
      return {
        id: r.id, cvFileName: r.cvFileName, status: r.status, paymentStatus: r.paymentStatus,
        createdAt: r.createdAt.toISOString(), revenue: r.paymentStatus === "paid" ? HUMAN_REVIEW_PRICE : 0,
        userName: user?.name ?? "Unknown", userEmail: user?.email ?? "",
      };
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Admin CV reviews error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── PUT /admin/cv-reviews/:id/status ─────────────────────────────────────────
router.put("/admin/cv-reviews/:id/status", async (req: AuthenticatedRequest, res) => {
  try {
    const reviewId = parseInt(req.params.id as string, 10);
    const { status } = req.body as { status: string };
    if (!["pending", "in_review", "reviewed"].includes(status)) {
      res.status(400).json({ error: "Invalid status. Use: pending, in_review, reviewed" });
      return;
    }
    const [existing] = await db.select({ id: cvReviewsTable.id }).from(cvReviewsTable).where(eq(cvReviewsTable.id, reviewId)).limit(1);
    if (!existing) { res.status(404).json({ error: "Review not found" }); return; }
    await db.update(cvReviewsTable).set({ status, updatedAt: new Date() } as any).where(eq(cvReviewsTable.id, reviewId));
    res.json({ success: true, status });
  } catch (err) {
    req.log.error({ err }, "Admin CV review status update error");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildBroadcastEmail(opts: { firstName: string; subject: string; message: string }): string {
  const TERRACOTTA = "#C04020", INK = "#1E1511", CREAM = "#FEF9F4", MUTED = "#7A6A5A", MARIGOLD = "#F0A010", BORDER = "#E0D4C4";
  const safeSubject   = escapeHtml(opts.subject);
  const safeFirstName = escapeHtml(opts.firstName);
  const bodyFormatted = escapeHtml(opts.message).replace(/\n/g, "<br/>");
  // nosemgrep: javascript.lang.security.html-in-template-string
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2EDE6;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EDE6;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,16,8,0.10);">
      <tr><td style="background:${INK};padding:28px 36px;">
        <span style="display:inline-block;background:${TERRACOTTA};color:${CREAM};font-size:15px;font-weight:900;padding:8px 16px;border-radius:8px;">Bridgepath Africa</span>
        <p style="color:rgba(254,249,244,0.50);font-size:11px;margin:8px 0 0;letter-spacing:0.06em;text-transform:uppercase;">Shaping People. Strengthening Institutions.</p>
      </td></tr>
      <tr><td style="background:${CREAM};padding:36px 36px 28px;">
        <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MARIGOLD};">Announcement</p>
        <h1 style="margin:0 0 20px;font-size:24px;font-weight:900;color:${INK};line-height:1.25;">${safeSubject}</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#2D2015;line-height:1.7;">Hi ${safeFirstName},</p>
        <p style="margin:0 0 24px;font-size:15px;color:#2D2015;line-height:1.7;">${bodyFormatted}</p>
        <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
          <tr><td style="background:${TERRACOTTA};border-radius:10px;">
            <a href="https://bridgepathnetwork.com" style="display:inline-block;color:${CREAM};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">Visit Platform →</a>
          </td></tr>
        </table>
        <hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;"/>
        <p style="margin:0;font-size:13px;color:${MUTED};">You are receiving this because you have an account on Bridgepath Africa.</p>
      </td></tr>
      <tr><td style="background:#F2EDE6;padding:20px 36px;border-top:1px solid ${BORDER};">
        <p style="margin:0;font-size:11px;color:${MUTED};text-align:center;line-height:1.7;">
          Bridgepath Africa · Across Africa ·
          <a href="https://bridgepathnetwork.com" style="color:${TERRACOTTA};text-decoration:none;">bridgepathnetwork.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

export default router;
