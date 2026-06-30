import { Router } from "express";
import OpenAI from "openai";
import type { AuthenticatedRequest } from "../lib/auth";

const router = Router();

const SYSTEM_PROMPT = `You are the official AI support assistant for Bridgepath Africa — Africa's premium HR and talent platform.

## About Bridgepath Africa
- Premium HR hiring platform connecting African talent (Across Africa) with global employers
- Founded on 20+ years of HR expertise across the African continent  
- Expanding across the African continent
- Services: Employment of Record (EOR), Payroll & Tax Administration, HR Consultancy, Recruitment Services, Staff Outsourcing, Psychometric Assessments

## For Job Seekers
- Create a free account at bridgepathnetwork.com
- Browse jobs from top African and global employers
- Get an AI-powered CV review — paste your CV text and receive an instant score, strengths, weaknesses, and role recommendations
- Track all your job applications in one dashboard
- Human HR Review upgrade: pay for a detailed review from a certified HR expert

## For Employers
- Post jobs that reach verified African professionals in Across Africa
- Browse our pre-screened candidate database
- Manage the full hiring pipeline: Applied → Reviewed → Shortlisted → Interview → Offer → Hired
- Full HR outsourcing: EOR, payroll, compliance, and more
- Contact us for custom pricing

## Pricing
- Free for job seekers (browse, apply, AI CV review)
- Employer and HR service pricing is customised — contact us for a quote
- Human HR Review: a paid upgrade for job seekers who want expert CV feedback

## Contact & Support
- Email: support@bridgepathnetwork.com
- Response time: within a few hours on business days (Ghana time, GMT+0)
- Contact form at: bridgepathnetwork.com/#contact

## Tone & Style
- Warm, professional, encouraging
- Be concise but thorough
- Always offer to connect users to a human if the question is complex
- Never make up information — say you'll check and follow up if unsure
- If you don't know a specific answer, suggest they email support@bridgepathnetwork.com
- Keep responses under 150 words unless the question requires more detail`;

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

router.post("/chat", async (req: AuthenticatedRequest, res) => {
  try {
    const { message, history = [] } = req.body as {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Bad Request", message: "message is required" });
      return;
    }

    if (message.trim().length > 1000) {
      res.status(400).json({ error: "Bad Request", message: "Message too long (max 1000 chars)" });
      return;
    }

    const openai = getOpenAI();
    if (!openai) {
      res.json({
        reply: "I'm currently offline. Please email us directly at support@bridgepathnetwork.com and we'll get back to you within a few hours.",
      });
      return;
    }

    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-6)
      .filter((m) => m.role && m.content && typeof m.content === "string")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 800) }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: "user", content: message.trim() },
      ],
      max_tokens: 300,
      temperature: 0.6,
    });

    const reply = completion.choices[0]?.message?.content?.trim()
      ?? "I couldn't generate a response. Please email us at support@bridgepathnetwork.com.";

    res.json({ reply });
  } catch (err) {
    req.log?.error({ err }, "Chat endpoint error");
    res.json({
      reply: "Something went wrong on my end. Please email us at support@bridgepathnetwork.com and our team will help you.",
    });
  }
});

export default router;
