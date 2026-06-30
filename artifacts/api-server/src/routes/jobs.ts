import { Router } from "express";
import { db, jobsTable, usersTable, profilesTable, applicationsTable } from "@workspace/db";
import { eq, ilike, and, or, sql, count } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { paramInt } from "../lib/routeParams";
import { serializeProfile } from "./auth";

const router = Router();

function serializeJob(
  job: typeof jobsTable.$inferSelect,
  applicantCount: number,
  employer?: typeof usersTable.$inferSelect | null,
  employerProfile?: typeof profilesTable.$inferSelect | null
) {
  return {
    id: job.id,
    employerId: job.employerId,
    title: job.title,
    description: job.description,
    requirements: job.requirements ?? null,
    location: job.location,
    country: job.country,
    type: job.type,
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    currency: job.currency ?? null,
    industry: job.industry ?? null,
    skills: JSON.parse(job.skills ?? "[]") as string[],
    isActive: job.isActive,
    applicantCount,
    employer: employer ? {
      id: employer.id,
      email: employer.email,
      name: employer.name,
      role: employer.role,
      createdAt: employer.createdAt.toISOString(),
    } : null,
    employerProfile: employerProfile ? serializeProfile(employerProfile) : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

router.get("/jobs", async (req, res) => {
  try {
    const { search, location, type, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(jobsTable.isActive, true)];

    if (search) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${search}%`),
          ilike(jobsTable.description, `%${search}%`),
          ilike(jobsTable.industry, `%${search}%`)
        )!
      );
    }

    if (location) {
      conditions.push(
        or(
          ilike(jobsTable.location, `%${location}%`),
          ilike(jobsTable.country, `%${location}%`)
        )!
      );
    }

    if (type) {
      conditions.push(eq(jobsTable.type, type));
    }

    const whereClause = and(...conditions);

    const [{ total }] = await db
      .select({ total: count() })
      .from(jobsTable)
      .where(whereClause);

    const jobs = await db.select().from(jobsTable).where(whereClause)
      .orderBy(sql`${jobsTable.createdAt} DESC`)
      .limit(limitNum)
      .offset(offset);

    const jobsWithData = await Promise.all(jobs.map(async (job) => {
      const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
      const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1);
      const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1);
      return serializeJob(job, cnt, employer, employerProfile ?? null);
    }));

    res.json({
      jobs: jobsWithData,
      total: Number(total),
      page: pageNum,
      totalPages: Math.ceil(Number(total) / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing jobs");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/jobs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || user.role !== "employer") {
      res.status(403).json({ error: "Forbidden", message: "Only employers can post jobs" });
      return;
    }

    const { title, description, requirements, location, country, type, salaryMin, salaryMax, currency, industry, skills, isActive } = req.body as {
      title: string;
      description: string;
      requirements?: string;
      location: string;
      country: string;
      type: string;
      salaryMin?: number;
      salaryMax?: number;
      currency?: string;
      industry?: string;
      skills?: string[];
      isActive?: boolean;
    };

    if (!title || !description || !location || !country || !type) {
      res.status(400).json({ error: "Bad Request", message: "Required fields missing" });
      return;
    }

    const [job] = await db.insert(jobsTable).values({
      employerId: userId,
      title,
      description,
      requirements: requirements ?? null,
      location,
      country,
      type,
      salaryMin: salaryMin ?? null,
      salaryMax: salaryMax ?? null,
      currency: currency ?? "USD",
      industry: industry ?? null,
      skills: JSON.stringify(skills ?? []),
      isActive: isActive ?? true,
    }).returning();

    const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);

    res.status(201).json(serializeJob(job, 0, employer, employerProfile ?? null));
  } catch (err) {
    req.log.error({ err }, "Error creating job");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/jobs/:jobId", async (req, res) => {
  try {
    const jobId = paramInt(req.params.jobId);
    if (isNaN(jobId)) {
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) {
      res.status(404).json({ error: "Not Found", message: "Job not found" });
      return;
    }

    const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
    const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, job.employerId)).limit(1);
    const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, job.employerId)).limit(1);

    res.json(serializeJob(job, cnt, employer, employerProfile ?? null));
  } catch (err) {
    req.log.error({ err }, "Error getting job");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/jobs/:jobId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const jobId = paramInt(req.params.jobId);
    const userId = req.userId!;

    const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Not Found", message: "Job not found" });
      return;
    }
    if (existing.employerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { title, description, requirements, location, country, type, salaryMin, salaryMax, currency, industry, skills, isActive } = req.body as {
      title?: string;
      description?: string;
      requirements?: string;
      location?: string;
      country?: string;
      type?: string;
      salaryMin?: number;
      salaryMax?: number;
      currency?: string;
      industry?: string;
      skills?: string[];
      isActive?: boolean;
    };

    const updateData: Partial<typeof jobsTable.$inferInsert> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (location !== undefined) updateData.location = location;
    if (country !== undefined) updateData.country = country;
    if (type !== undefined) updateData.type = type;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax;
    if (currency !== undefined) updateData.currency = currency;
    if (industry !== undefined) updateData.industry = industry;
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db.update(jobsTable).set(updateData).where(eq(jobsTable.id, jobId)).returning();
    const [{ cnt }] = await db.select({ cnt: count() }).from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
    const [employer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [employerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);

    res.json(serializeJob(updated, cnt, employer, employerProfile ?? null));
  } catch (err) {
    req.log.error({ err }, "Error updating job");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/jobs/:jobId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const jobId = paramInt(req.params.jobId);
    const userId = req.userId!;

    const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!existing || existing.employerId !== userId) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    await db.delete(jobsTable).where(eq(jobsTable.id, jobId));
    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting job");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { serializeJob };
export default router;
