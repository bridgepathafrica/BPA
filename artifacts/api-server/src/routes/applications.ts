import { Router } from "express";
import { db, applicationsTable, jobsTable, usersTable, profilesTable } from "@workspace/db";
import { eq, and, sql, inArray } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { paramInt } from "../lib/routeParams";
import { serializeProfile } from "./auth";
import { serializeJob } from "./jobs";
import { count } from "@workspace/db";
import { sendEmail, newApplicationEmail } from "../lib/email";

const router = Router();

async function serializeApplication(app: typeof applicationsTable.$inferSelect) {
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
  const [applicant] = await db.select().from(usersTable).where(eq(usersTable.id, app.applicantId)).limit(1);
  const [applicantProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, app.applicantId)).limit(1);

  let serializedJob = null;
  if (job) {
    const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
    const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1);
    const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1);
    serializedJob = serializeJob(job, cnt, employer, employerProfile ?? null);
  }

  return {
    id: app.id,
    jobId: app.jobId,
    applicantId: app.applicantId,
    coverLetter: app.coverLetter ?? null,
    cvUrl: (app as any).cvUrl ?? null,
    cvFileName: (app as any).cvFileName ?? null,
    status: app.status,
    viewedAt: app.viewedAt?.toISOString() ?? null,
    job: serializedJob,
    applicant: applicant ? {
      id: applicant.id,
      email: applicant.email,
      name: applicant.name,
      role: applicant.role,
      createdAt: applicant.createdAt.toISOString(),
    } : null,
    applicantProfile: applicantProfile ? serializeProfile(applicantProfile) : null,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

router.post("/applications", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { jobId, coverLetter, cvUrl, cvFileName } = req.body as { jobId: number; coverLetter?: string; cvUrl?: string; cvFileName?: string };

    if (!jobId) {
      res.status(400).json({ error: "Bad Request", message: "jobId required" });
      return;
    }

    const existing = await db.select().from(applicationsTable)
      .where(and(eq(applicationsTable.jobId, jobId), eq(applicationsTable.applicantId, userId)))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Already applied for this job" });
      return;
    }

    const [application] = await db.insert(applicationsTable).values({
      jobId,
      applicantId: userId,
      coverLetter: coverLetter ?? null,
      cvUrl: cvUrl ?? null,
      cvFileName: cvFileName ?? null,
      status: "pending",
    } as any).returning();

    const serialized = await serializeApplication(application);

    const job = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1).then(r => r[0]);
    if (job) {
      const employer = await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1).then(r => r[0]);
      const candidate = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1).then(r => r[0]);
      if (employer && candidate) {
        sendEmail(newApplicationEmail({
          employerName: employer.name,
          employerEmail: employer.email,
          candidateName: candidate.name,
          jobTitle: job.title,
        })).catch(() => {});
      }
    }

    res.status(201).json(serialized);
  } catch (err) {
    req.log.error({ err }, "Error creating application");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/applications/my", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const apps = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.applicantId, userId))
      .orderBy(sql`${applicationsTable.createdAt} DESC`);

    const serialized = await Promise.all(apps.map(serializeApplication));
    res.json(serialized);
  } catch (err) {
    req.log.error({ err }, "Error getting applications");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/jobs/:jobId/applications", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const jobId = paramInt(req.params.jobId);
    const requesterId = req.userId!;

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) { res.status(404).json({ error: "Not Found" }); return; }
    if (job.employerId !== requesterId) {
      res.status(403).json({ error: "Forbidden", message: "Only the job owner can view applicants" });
      return;
    }

    const apps = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.jobId, jobId))
      .orderBy(sql`${applicationsTable.createdAt} DESC`);

    const serialized = await Promise.all(apps.map(serializeApplication));
    res.json(serialized);
  } catch (err) {
    req.log.error({ err }, "Error getting job applications");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/applications/employer-all", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const employerJobs = await db.select({ id: jobsTable.id })
      .from(jobsTable)
      .where(eq(jobsTable.employerId, userId));

    if (employerJobs.length === 0) {
      res.json([]);
      return;
    }

    const jobIds = employerJobs.map((j) => j.id);
    const apps = await db.select().from(applicationsTable)
      .where(inArray(applicationsTable.jobId, jobIds))
      .orderBy(sql`${applicationsTable.createdAt} DESC`);

    const serialized = await Promise.all(apps.map(serializeApplication));
    res.json(serialized);
  } catch (err) {
    req.log.error({ err }, "Error getting employer applications");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/applications/:applicationId/status", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const applicationId = paramInt(req.params.applicationId);
    const requesterId = req.userId!;
    const { status } = req.body as { status: string };

    const validStatuses = ["pending", "reviewed", "shortlisted", "interview", "offer", "hired", "accepted", "rejected", "withdrawn"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "Bad Request", message: `Status must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const [app] = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!app) { res.status(404).json({ error: "Not Found" }); return; }

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
    const isEmployerOfJob = job?.employerId === requesterId;
    const isOwnApplication = app.applicantId === requesterId;

    if (!isEmployerOfJob && !isOwnApplication) {
      res.status(403).json({ error: "Forbidden", message: "Not authorized to update this application" });
      return;
    }

    if (isOwnApplication && !isEmployerOfJob && status !== "withdrawn") {
      res.status(403).json({ error: "Forbidden", message: "Applicants can only withdraw their own applications" });
      return;
    }

    const [updated] = await db.update(applicationsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(applicationsTable.id, applicationId))
      .returning();

    res.json(await serializeApplication(updated));
  } catch (err) {
    req.log.error({ err }, "Error updating application status");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
