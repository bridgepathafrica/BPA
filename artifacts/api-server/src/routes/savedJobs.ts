import { Router } from "express";
import { db, savedJobsTable, jobsTable, usersTable, profilesTable, applicationsTable } from "@workspace/db";
import { eq, and, sql } from "@workspace/db";
import { count } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { paramInt } from "../lib/routeParams";
import { serializeJob } from "./jobs";

const router = Router();

router.get("/saved-jobs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const saved = await db.select().from(savedJobsTable)
      .where(eq(savedJobsTable.userId, userId))
      .orderBy(sql`${savedJobsTable.savedAt} DESC`);

    const serialized = await Promise.all(saved.map(async (s) => {
      const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, s.jobId)).limit(1);
      if (!job) return null;
      const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
      const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1);
      const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1);
      return {
        savedAt: s.savedAt.toISOString(),
        job: serializeJob(job, cnt, employer, employerProfile ?? null),
      };
    }));

    res.json(serialized.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "Error getting saved jobs");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/saved-jobs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { jobId } = req.body as { jobId: number };

    if (!jobId) {
      res.status(400).json({ error: "Bad Request", message: "jobId required" });
      return;
    }

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) {
      res.status(404).json({ error: "Not Found", message: "Job not found" });
      return;
    }

    const existing = await db.select().from(savedJobsTable)
      .where(and(eq(savedJobsTable.userId, userId), eq(savedJobsTable.jobId, jobId)))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Job already saved" });
      return;
    }

    const [saved] = await db.insert(savedJobsTable).values({ userId, jobId }).returning();
    res.status(201).json({ id: saved.id, jobId: saved.jobId, savedAt: saved.savedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error saving job");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/saved-jobs/:jobId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const jobId = paramInt(req.params.jobId);

    await db.delete(savedJobsTable)
      .where(and(eq(savedJobsTable.userId, userId), eq(savedJobsTable.jobId, jobId)));

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error unsaving job");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
