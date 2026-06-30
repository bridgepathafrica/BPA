import { Router } from "express";
import { db, applicationsTable, jobsTable, cvReviewsTable, usersTable } from "@workspace/db";
import { eq, and, sql, count } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { serializeJob } from "./jobs";
import { profilesTable } from "@workspace/db";

const router = Router();

router.get("/stats/dashboard", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (user.role === "job_seeker") {
      const myApps = await db.select().from(applicationsTable)
        .where(eq(applicationsTable.applicantId, userId))
        .orderBy(sql`${applicationsTable.createdAt} DESC`);

      const pending = myApps.filter(a => a.status === "pending").length;
      const shortlisted = myApps.filter(a => a.status === "shortlisted").length;
      const accepted = myApps.filter(a => a.status === "accepted").length;

      const myReviews = await db.select({ cnt: count() }).from(cvReviewsTable).where(eq(cvReviewsTable.userId, userId));

      const recentApps = await Promise.all(myApps.slice(0, 5).map(async (app) => {
        const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId)).limit(1);
        const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, app.jobId));
        const [employer] = job ? await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1) : [null];
        const [employerProfile] = job ? await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1) : [null];
        return {
          id: app.id,
          jobId: app.jobId,
          applicantId: app.applicantId,
          coverLetter: app.coverLetter ?? null,
          status: app.status,
          job: job ? serializeJob(job, cnt, employer ?? undefined, employerProfile ?? null) : null,
          applicant: null,
          applicantProfile: null,
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
        };
      }));

      res.json({
        totalApplications: myApps.length,
        pendingApplications: pending,
        shortlistedApplications: shortlisted,
        acceptedApplications: accepted,
        totalJobs: 0,
        activeJobs: 0,
        totalApplicants: 0,
        cvReviews: Number(myReviews[0].cnt),
        recentApplications: recentApps,
      });
    } else {
      const allMyJobs = await db.select().from(jobsTable).where(eq(jobsTable.employerId, userId));
      const activeJobs = allMyJobs.filter(j => j.isActive).length;

      const allJobIds = allMyJobs.map(j => j.id);
      let totalApplicants = 0;
      let recentApps: {
        id: number;
        jobId: number;
        applicantId: number;
        coverLetter: string | null;
        status: string;
        job: null;
        applicant: null;
        applicantProfile: null;
        createdAt: string;
        updatedAt: string;
      }[] = [];

      if (allJobIds.length > 0) {
        for (const jobId of allJobIds) {
          const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
          totalApplicants += Number(cnt);
        }

        const recentAppRows = await db.select().from(applicationsTable)
          .orderBy(sql`${applicationsTable.createdAt} DESC`)
          .limit(5);

        recentApps = recentAppRows.map(app => ({
          id: app.id,
          jobId: app.jobId,
          applicantId: app.applicantId,
          coverLetter: app.coverLetter ?? null,
          status: app.status,
          job: null,
          applicant: null,
          applicantProfile: null,
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
        }));
      }

      res.json({
        totalApplications: totalApplicants,
        pendingApplications: 0,
        shortlistedApplications: 0,
        acceptedApplications: 0,
        totalJobs: allMyJobs.length,
        activeJobs,
        totalApplicants,
        cvReviews: 0,
        recentApplications: recentApps,
      });
    }
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard stats");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/stats/jobs", async (req, res) => {
  try {
    const [{ total }] = await db.select({ total: count() }).from(jobsTable).where(eq(jobsTable.isActive, true));

    const allJobs = await db.select().from(jobsTable).where(eq(jobsTable.isActive, true))
      .orderBy(sql`${jobsTable.createdAt} DESC`);

    const byType: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};

    for (const job of allJobs) {
      byType[job.type] = (byType[job.type] ?? 0) + 1;
      byCountry[job.country] = (byCountry[job.country] ?? 0) + 1;
      if (job.industry) {
        byIndustry[job.industry] = (byIndustry[job.industry] ?? 0) + 1;
      }
    }

    const recentJobs = await Promise.all(allJobs.slice(0, 6).map(async (job) => {
      const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
      const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1);
      const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1);
      return serializeJob(job, Number(cnt), employer, employerProfile ?? null);
    }));

    res.json({
      totalJobs: Number(total),
      byType,
      byCountry,
      byIndustry,
      recentJobs,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting job stats");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
