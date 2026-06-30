import { Router } from "express";
import { db, feedbackTable, applicationsTable, usersTable, jobsTable, profilesTable } from "@workspace/db";
import { eq, and } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { paramInt } from "../lib/routeParams";
import { sendEmail, feedbackEmail, applicationViewedEmail } from "../lib/email";

const router = Router();

router.post("/applications/:applicationId/view", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const applicationId = paramInt(req.params.applicationId);
    const now = new Date();

    const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId)).limit(1);
    if (!app) { res.status(404).json({ error: "Not Found" }); return; }

    if (!app.viewedAt) {
      await db.update(applicationsTable).set({ viewedAt: now }).where(eq(applicationsTable.id, applicationId));

      const [candidate] = await db.select().from(usersTable).where(eq(usersTable.id, app.applicantId)).limit(1);
      const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
      const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
      const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.userId!)).limit(1);

      if (candidate && job) {
        sendEmail(applicationViewedEmail({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: job.title,
          companyName: employerProfile?.companyName ?? employer?.name ?? "An employer",
        })).catch(() => {});
      }
    }

    res.json({ viewed: true, viewedAt: app.viewedAt ?? now });
  } catch (err) {
    req.log.error({ err }, "Error marking application viewed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/applications/:applicationId/feedback", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const applicationId = paramInt(req.params.applicationId);
    const { content, isAnonymous = false } = req.body as { content: string; isAnonymous?: boolean };
    const employerId = req.userId!;

    if (!content?.trim()) { res.status(400).json({ error: "content required" }); return; }

    const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, applicationId)).limit(1);
    if (!app) { res.status(404).json({ error: "Application not found" }); return; }

    const [entry] = await db.insert(feedbackTable).values({
      applicationId,
      employerId,
      candidateId: app.applicantId,
      content: content.trim(),
      isAnonymous,
    }).returning();

    const [candidate] = await db.select().from(usersTable).where(eq(usersTable.id, app.applicantId)).limit(1);
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
    const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, employerId)).limit(1);

    if (candidate && job && employer) {
      sendEmail(feedbackEmail({
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobTitle: job.title,
        fromName: employer.name,
        isAnonymous,
        feedback: content.trim(),
      })).catch(() => {});
    }

    res.status(201).json({
      id: entry.id,
      applicationId: entry.applicationId,
      content: entry.content,
      isAnonymous: entry.isAnonymous,
      employerName: isAnonymous ? null : (employer?.name ?? null),
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating feedback");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/candidates/:candidateId/feedback", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const candidateId = paramInt(req.params.candidateId);
    const requesterId = req.userId!;

    if (requesterId !== candidateId) {
      const [requester] = await db.select().from(usersTable).where(eq(usersTable.id, requesterId)).limit(1);
      if (!requester || requester.role !== "employer") {
        res.status(403).json({ error: "Forbidden" }); return;
      }
    }

    const rows = await db.select().from(feedbackTable).where(eq(feedbackTable.candidateId, candidateId));

    const serialized = await Promise.all(rows.map(async (f) => {
      let employerName: string | null = null;
      if (!f.isAnonymous) {
        const [emp] = await db.select().from(usersTable).where(eq(usersTable.id, f.employerId)).limit(1);
        const [empProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, f.employerId)).limit(1);
        employerName = empProfile?.companyName ?? emp?.name ?? null;
      }
      const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, f.applicationId)).limit(1);
      const [job] = app ? await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1) : [null];

      return {
        id: f.id,
        content: f.content,
        isAnonymous: f.isAnonymous,
        employerName,
        jobTitle: job?.title ?? null,
        createdAt: f.createdAt.toISOString(),
      };
    }));

    res.json(serialized.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  } catch (err) {
    req.log.error({ err }, "Error fetching feedback");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
