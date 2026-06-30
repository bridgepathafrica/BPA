import { Router } from "express";
import { db, cvReviewsTable, usersTable } from "@workspace/db";
import { eq, sql } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { paramInt } from "../lib/routeParams";
import OpenAI from "openai";
import { sendEmail } from "../lib/email";
import { escapeHtml } from "../lib/html";

const router = Router();

function getOpenAI() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

function serializeCvReview(review: typeof cvReviewsTable.$inferSelect) {
  return {
    id: review.id,
    userId: review.userId,
    cvFileName: review.cvFileName,
    cvText: review.cvText ?? null,
    status: review.status,
    aiReview: review.aiReview ? JSON.parse(review.aiReview) : null,
    humanReview: review.humanReview ? JSON.parse(review.humanReview) : null,
    paymentStatus: review.paymentStatus,
    stripeSessionId: review.stripeSessionId ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

async function analyzeCV(cvText: string) {
  const prompt = `You are an expert HR consultant and career advisor. Analyze the following CV/resume and provide a comprehensive, detailed review.

CV Content:
${cvText}

Provide your analysis as a JSON object with exactly this structure:
{
  "overallScore": <number 0-100>,
  "jobReadinessScore": <number 0-100>,
  "formattingScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "industryAlignmentScore": <number 0-100>,
  "summary": "<2-3 sentence executive summary of the CV>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>"],
  "skillsBreakdown": [
    {"skill": "<skill name>", "level": "<beginner|intermediate|advanced|expert>", "yearsExperience": <number>}
  ],
  "careerInsights": "<2-3 sentences of career trajectory insights and opportunities>",
  "recommendedRoles": ["<role 1>", "<role 2>", "<role 3>"]
}

Be honest and specific. Provide actionable improvements. Extract real skills from the CV text. Return ONLY the JSON object, no other text.`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

router.post("/cv-reviews", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { cvFileName, cvText } = req.body as { cvFileName: string; cvText: string };

    if (!cvFileName || !cvText) {
      res.status(400).json({ error: "Bad Request", message: "cvFileName and cvText are required" });
      return;
    }

    const [review] = await db.insert(cvReviewsTable).values({
      userId,
      cvFileName,
      cvText,
      status: "ai_processing",
      paymentStatus: "none",
    }).returning();

    res.status(201).json(serializeCvReview(review));

    (async () => {
      try {
        const aiReview = await analyzeCV(cvText);
        await db.update(cvReviewsTable)
          .set({
            status: "ai_complete",
            aiReview: JSON.stringify(aiReview),
            updatedAt: new Date(),
          })
          .where(eq(cvReviewsTable.id, review.id));
      } catch (err) {
        console.error("[cv-review] AI analysis failed for review", review.id, ":", err instanceof Error ? err.message : String(err));
        await db.update(cvReviewsTable)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(cvReviewsTable.id, review.id));
      }
    })();
  } catch (err) {
    req.log.error({ err }, "Error creating CV review");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/cv-reviews/my", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const reviews = await db.select().from(cvReviewsTable)
      .where(eq(cvReviewsTable.userId, userId))
      .orderBy(sql`${cvReviewsTable.createdAt} DESC`);

    res.json(reviews.map(serializeCvReview));
  } catch (err) {
    req.log.error({ err }, "Error getting CV reviews");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/cv-reviews/:reviewId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const reviewId = paramInt(req.params.reviewId);
    const userId = req.userId!;

    const [review] = await db.select().from(cvReviewsTable)
      .where(eq(cvReviewsTable.id, reviewId))
      .limit(1);

    if (!review || review.userId !== userId) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    res.json(serializeCvReview(review));
  } catch (err) {
    req.log.error({ err }, "Error getting CV review");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/cv-reviews/:reviewId/human-review", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const reviewId = paramInt(req.params.reviewId);
    const userId = req.userId!;
    const { stripeSessionId } = req.body as { stripeSessionId: string };

    const [review] = await db.select().from(cvReviewsTable)
      .where(eq(cvReviewsTable.id, reviewId))
      .limit(1);

    if (!review || review.userId !== userId) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    if (review.paymentStatus !== "paid") {
      res.status(403).json({ error: "Forbidden", message: "Payment required for human review" });
      return;
    }

    await db.update(cvReviewsTable)
      .set({ status: "human_pending", updatedAt: new Date() })
      .where(eq(cvReviewsTable.id, reviewId));

    const [updated] = await db.select().from(cvReviewsTable)
      .where(eq(cvReviewsTable.id, reviewId))
      .limit(1);

    const [requester] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (requester) {
      sendEmail({
        to: "support@bridgepathnetwork.com",
        subject: `Human CV Review Requested — ${requester.name}`,
        // nosemgrep: javascript.lang.security.html-in-template-string, javascript.express.security.injection.raw-html-format
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="background:#1C1917;padding:20px 24px;border-radius:6px 6px 0 0;margin:-24px -24px 24px;">
            <h1 style="color:#fff;font-size:18px;margin:0;">Human CV Review Requested</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:130px;">Candidate</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${escapeHtml(requester.name)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${escapeHtml(requester.email)}" style="color:#C8461A;">${escapeHtml(requester.email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">CV File</td><td style="padding:8px 0;font-size:14px;">${escapeHtml(review.cvFileName ?? "")}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Review ID</td><td style="padding:8px 0;font-size:14px;">#${reviewId}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Requested</td><td style="padding:8px 0;font-size:14px;">${new Date().toUTCString()}</td></tr>
          </table>
          <p style="margin-top:20px;font-size:13px;color:#9ca3af;">Log in to the admin panel to review and respond to this request.</p>
        </div>`,
      }).catch(() => {});
    }

    res.json(serializeCvReview(updated));
  } catch (err) {
    req.log.error({ err }, "Error requesting human review");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
