import { Router } from "express";
import { db, profilesTable, usersTable } from "@workspace/db";
import { eq } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { paramInt } from "../lib/routeParams";
import { serializeProfile } from "./auth";

const router = Router();

router.get("/profiles/:userId", async (req, res) => {
  try {
    const userId = paramInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid user ID" });
      return;
    }

    const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);

    if (!profile) {
      res.status(404).json({ error: "Not Found", message: "Profile not found" });
      return;
    }

    res.json(serializeProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Error getting profile");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/profiles/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = paramInt(req.params.userId);
    if (isNaN(userId) || req.userId !== userId) {
      res.status(403).json({ error: "Forbidden", message: "Cannot update another user's profile" });
      return;
    }

    const {
      bio, location, country, skills, experience, education,
      linkedinUrl, portfolioUrl, resumeUrl, companyName, companyWebsite,
      industry, companySize
    } = req.body as Record<string, string | string[] | undefined>;

    const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);

    const updateData: Partial<typeof profilesTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (bio !== undefined) updateData.bio = bio as string;
    if (location !== undefined) updateData.location = location as string;
    if (country !== undefined) updateData.country = country as string;
    if (skills !== undefined) updateData.skills = JSON.stringify(Array.isArray(skills) ? skills : []);
    if (experience !== undefined) updateData.experience = experience as string;
    if (education !== undefined) updateData.education = education as string;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl as string;
    if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl as string;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl as string;
    if ((req.body as any).avatarUrl !== undefined) (updateData as any).avatarUrl = (req.body as any).avatarUrl as string;
    if (companyName !== undefined) updateData.companyName = companyName as string;
    if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite as string;
    if (industry !== undefined) updateData.industry = industry as string;
    if (companySize !== undefined) updateData.companySize = companySize as string;

    let profile: typeof profilesTable.$inferSelect;

    if (existing.length === 0) {
      const [created] = await db.insert(profilesTable).values({
        userId,
        ...updateData,
        skills: updateData.skills ?? "[]",
      }).returning();
      profile = created;
    } else {
      const [updated] = await db.update(profilesTable)
        .set(updateData)
        .where(eq(profilesTable.userId, userId))
        .returning();
      profile = updated;
    }

    res.json(serializeProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Error updating profile");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
