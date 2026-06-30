import { Router } from "express";
import crypto from "crypto";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "@workspace/db";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";
import type { AuthenticatedRequest } from "../lib/auth";
import { requireAuth } from "../lib/auth";
import { authLimiter } from "../lib/limiters";
import {
  sendEmail,
  welcomeJobSeekerEmail,
  welcomeEmployerEmail,
  verificationEmail,
  passwordResetEmail,
  magicLinkEmail,
  emailChangeEmail,
} from "../lib/email";

const router = Router();

const DEMO_EMAILS = ["jobseeker@demo.bridgepathnetwork.com", "employer@demo.bridgepathnetwork.com"];

function getAppBaseUrl(): string {
  if (process.env.OAUTH_BASE_URL) return process.env.OAUTH_BASE_URL;
  if (process.env.APP_DEV_DOMAIN) return `https://${process.env.APP_DEV_DOMAIN}`;
  return "https://bridgepathnetwork.com";
}

function generateVerificationToken(): { token: string; expiresAt: Date } {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

function isPasswordStrong(pw: string): { ok: boolean; message?: string } {
  if (!pw || pw.length < 8) return { ok: false, message: "Password must be at least 8 characters" };
  if (pw.length > 128) return { ok: false, message: "Password must not exceed 128 characters" };
  if (!/[A-Za-z]/.test(pw)) return { ok: false, message: "Password must contain at least one letter" };
  if (!/[0-9]/.test(pw)) return { ok: false, message: "Password must contain at least one number" };
  return { ok: true };
}

async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${getAppBaseUrl()}/auth/verify-email?token=${token}`;
  const sent = await sendEmail(verificationEmail({ name, email, link }));
  if (!sent) {
    console.log(`[DEV] Verification link for ${email}: ${link}`);
  }
}

async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${getAppBaseUrl()}/auth/reset-password?token=${token}`;
  const sent = await sendEmail(passwordResetEmail({ name, email, link }));
  if (!sent) {
    console.log(`[DEV] Password reset link for ${email}: ${link}`);
  }
}

async function sendMagicLinkEmail(email: string, name: string, token: string) {
  const link = `${getAppBaseUrl()}/auth/magic-link/verify?token=${token}`;
  const sent = await sendEmail(magicLinkEmail({ name, email, link }));
  if (!sent) {
    console.log(`[DEV] Magic sign-in link for ${email}: ${link}`);
  }
}

function serializeUser(user: typeof usersTable.$inferSelect, profile: typeof profilesTable.$inferSelect | null) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    oauthProvider: user.oauthProvider ?? null,
    createdAt: user.createdAt.toISOString(),
    profile: profile ? serializeProfile(profile) : null,
  };
}

export function serializeProfile(profile: typeof profilesTable.$inferSelect) {
  return {
    id: profile.id,
    userId: profile.userId,
    bio: profile.bio ?? null,
    location: profile.location ?? null,
    country: profile.country ?? null,
    skills: JSON.parse(profile.skills ?? "[]") as string[],
    experience: profile.experience ?? null,
    education: profile.education ?? null,
    linkedinUrl: profile.linkedinUrl ?? null,
    portfolioUrl: profile.portfolioUrl ?? null,
    resumeUrl: profile.resumeUrl ?? null,
    avatarUrl: (profile as any).avatarUrl ?? null,
    companyName: profile.companyName ?? null,
    companyWebsite: profile.companyWebsite ?? null,
    industry: profile.industry ?? null,
    companySize: profile.companySize ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

async function ensureProfile(userId: number, linkedinUrl?: string) {
  const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (existing.length > 0) {
    if (linkedinUrl) {
      await db.update(profilesTable).set({ linkedinUrl, updatedAt: new Date() }).where(eq(profilesTable.userId, userId));
      return { ...existing[0], linkedinUrl };
    }
    return existing[0];
  }
  const [profile] = await db.insert(profilesTable).values({ userId, skills: "[]", linkedinUrl: linkedinUrl ?? null }).returning();
  return profile;
}

// ── REGISTER ────────────────────────────────────────────────────────
router.post("/auth/register", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password, name, role, linkedinUrl } = req.body as {
      email: string; password?: string; name: string; role: string; linkedinUrl?: string;
    };

    if (!email || !name || !role) {
      res.status(400).json({ error: "Bad Request", message: "Email, name, and role are required" });
      return;
    }
    const validRoles = ["job_seeker", "employer"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid role" });
      return;
    }

    if (password) {
      const pwCheck = isPasswordStrong(password);
      if (!pwCheck.ok) {
        res.status(400).json({ error: "WeakPassword", message: pwCheck.message });
        return;
      }
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "EmailExists", message: "An account with this email already exists. Please sign in." });
      return;
    }

    const passwordHash = password ? await hashPassword(password) : await hashPassword(crypto.randomBytes(16).toString("hex"));
    const isDemo = DEMO_EMAILS.includes(email.toLowerCase());
    const { token: vToken, expiresAt: vExpires } = generateVerificationToken();

    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      emailVerified: isDemo,
      verificationToken: isDemo ? null : vToken,
      verificationTokenExpiresAt: isDemo ? null : vExpires,
    }).returning();

    await ensureProfile(user.id, linkedinUrl);

    if (!isDemo) {
      try { await sendVerificationEmail(user.email, user.name, vToken); } catch {}
      const devExtra = process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY
        ? { devVerificationLink: `${getAppBaseUrl()}/auth/verify-email?token=${vToken}` }
        : {};
      res.status(201).json({ needsVerification: true, email: user.email, ...devExtra });
      return;
    }

    const profile = await ensureProfile(user.id);
    const authToken = generateToken(user.id);
    res.status(201).json({ user: serializeUser(user, profile), token: authToken, isNew: true });
  } catch (err) {
    req.log.error({ err }, "Error registering user");
    res.status(500).json({ error: "Internal Server Error", message: "Registration failed" });
  }
});

// ── LOGIN ────────────────────────────────────────────────────────────
router.post("/auth/login", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password } = req.body as { email: string; password?: string };
    if (!email) {
      res.status(400).json({ error: "Bad Request", message: "Email is required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (!user) {
      res.status(401).json({ error: "InvalidCredentials", message: "No account found with that email. Please sign up." });
      return;
    }

    if (password) {
      const isDemo = DEMO_EMAILS.includes(user.email);
      if (!isDemo) {
        const { valid, needsRehash } = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          res.status(401).json({ error: "InvalidCredentials", message: "Incorrect password." });
          return;
        }
        if (needsRehash) {
          const newHash = await hashPassword(password);
          await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, user.id));
        }
      }
    }

    const needsVerification = !user.emailVerified && !!user.verificationToken && !user.oauthProvider;
    if (needsVerification) {
      res.status(403).json({
        error: "EmailNotVerified",
        message: "Please verify your email before signing in. Check your inbox for a confirmation link.",
      });
      return;
    }

    const profile = await ensureProfile(user.id);
    const token = generateToken(user.id);

    const wantsCookie = req.query.cookie === "1" || (req.headers.accept ?? "").includes("text/html");
    if (wantsCookie) {
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("bp_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    res.json({ user: serializeUser(user, profile), token });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "Internal Server Error", message: "Login failed" });
  }
});

// ── VERIFY EMAIL ─────────────────────────────────────────────────────
router.get("/auth/verify-email", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      res.status(400).json({ success: false, message: "Verification token is required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.verificationToken, token)).limit(1);

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or already-used verification link." });
      return;
    }
    if (user.emailVerified) {
      res.json({ success: true, alreadyVerified: true });
      return;
    }
    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      res.status(400).json({ success: false, message: "This verification link has expired. Please request a new one." });
      return;
    }

    await db.update(usersTable).set({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    if (user.role === "employer") {
      sendEmail(welcomeEmployerEmail({ name: user.name, companyName: user.name, email: user.email })).catch(() => {});
    } else {
      sendEmail(welcomeJobSeekerEmail({ name: user.name, email: user.email })).catch(() => {});
    }

    // Return a session token so the frontend can auto-sign-in without a second round-trip
    const profile = await ensureProfile(user.id);
    const authToken = generateToken(user.id);
    res.json({ success: true, token: authToken, user: serializeUser({ ...user, emailVerified: true }, profile) });
  } catch (err) {
    req.log.error({ err }, "Error verifying email");
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

// ── RESEND VERIFICATION ───────────────────────────────────────────────
router.post("/auth/resend-verification", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ error: "Bad Request", message: "Email required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) { res.json({ message: "If that email is registered, a new verification link has been sent." }); return; }
    if (user.emailVerified) { res.json({ message: "Email already verified." }); return; }

    const { token: vToken, expiresAt: vExpires } = generateVerificationToken();
    await db.update(usersTable).set({ verificationToken: vToken, verificationTokenExpiresAt: vExpires, updatedAt: new Date() }).where(eq(usersTable.id, user.id));

    try { await sendVerificationEmail(user.email, user.name, vToken); } catch {}
    res.json({ message: "A new verification email has been sent." });
  } catch (err) {
    req.log.error({ err }, "Error resending verification");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────────
router.post("/auth/forgot-password", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ error: "Bad Request", message: "Email is required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) {
      res.json({ message: "If that email is registered, a reset link has been sent." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(usersTable).set({
      passwordResetToken: resetToken,
      passwordResetTokenExpiresAt: resetExpires,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    try { await sendPasswordResetEmail(user.email, user.name, resetToken); } catch {}
    const devHint = process.env.NODE_ENV !== "production"
      ? { devLink: `${getAppBaseUrl()}/auth/reset-password?token=${resetToken}` }
      : {};
    res.json({ message: "If that email is registered, a reset link has been sent.", ...devHint });
  } catch (err) {
    req.log.error({ err }, "Error in forgot-password");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── RESET PASSWORD ────────────────────────────────────────────────────
router.post("/auth/reset-password", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { token, password } = req.body as { token: string; password: string };
    if (!token || !password) {
      res.status(400).json({ error: "Bad Request", message: "Token and new password are required" });
      return;
    }
    const pwCheck = isPasswordStrong(password);
    if (!pwCheck.ok) { res.status(400).json({ error: "WeakPassword", message: pwCheck.message }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.passwordResetToken, token)).limit(1);
    if (!user) {
      res.status(400).json({ error: "InvalidToken", message: "This reset link is invalid or has already been used." });
      return;
    }
    if (user.passwordResetTokenExpiresAt && user.passwordResetTokenExpiresAt < new Date()) {
      res.status(400).json({ error: "TokenExpired", message: "This reset link has expired. Please request a new one." });
      return;
    }

    await db.update(usersTable).set({
      passwordHash: await hashPassword(password),
      emailVerified: true,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    const profile = await ensureProfile(updated.id);
    const authToken = generateToken(updated.id);
    res.json({ user: serializeUser(updated, profile), token: authToken });
  } catch (err) {
    req.log.error({ err }, "Error in reset-password");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── REQUEST MAGIC LINK ────────────────────────────────────────────────
router.post("/auth/magic-link", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ error: "Bad Request", message: "Email is required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) {
      // Return a generic response to avoid leaking whether the email is registered
      res.json({ message: "If that email is registered, a magic sign-in link has been sent." });
      return;
    }

    const mlToken = crypto.randomBytes(32).toString("hex");
    const mlExpires = new Date(Date.now() + 30 * 60 * 1000);

    await db.update(usersTable).set({
      magicLinkToken: mlToken,
      magicLinkTokenExpiresAt: mlExpires,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    try { await sendMagicLinkEmail(user.email, user.name, mlToken); } catch {}
    const devHint = process.env.NODE_ENV !== "production"
      ? { devLink: `${getAppBaseUrl()}/auth/magic-link/verify?token=${mlToken}` }
      : {};
    res.json({ message: "Magic link sent! Check your inbox.", ...devHint });
  } catch (err) {
    req.log.error({ err }, "Error requesting magic link");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── VERIFY MAGIC LINK ─────────────────────────────────────────────────
router.get("/auth/magic-link/verify", authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) { res.status(400).json({ error: "Bad Request", message: "Token is required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.magicLinkToken, token)).limit(1);
    if (!user) {
      res.status(400).json({ error: "InvalidToken", message: "This magic link is invalid or has already been used." });
      return;
    }
    if (user.magicLinkTokenExpiresAt && user.magicLinkTokenExpiresAt < new Date()) {
      res.status(400).json({ error: "TokenExpired", message: "This magic link has expired. Please request a new one." });
      return;
    }

    await db.update(usersTable).set({
      emailVerified: true,
      magicLinkToken: null,
      magicLinkTokenExpiresAt: null,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    const profile = await ensureProfile(user.id);
    const authToken = generateToken(user.id);
    res.json({ user: serializeUser(user, profile), token: authToken });
  } catch (err) {
    req.log.error({ err }, "Error verifying magic link");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── REQUEST EMAIL CHANGE ──────────────────────────────────────────────
router.post("/auth/change-email", requireAuth, authLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { newEmail, currentPassword } = req.body as { newEmail: string; currentPassword: string };

    if (!newEmail || !currentPassword) {
      res.status(400).json({ error: "Bad Request", message: "New email and current password are required" });
      return;
    }
    const normalizedEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: "InvalidEmail", message: "Please provide a valid email address" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    if (user.email === normalizedEmail) {
      res.status(400).json({ error: "SameEmail", message: "That is already your current email address" });
      return;
    }

    // Verify the user knows their password before changing sensitive account info
    const { valid: passwordValid } = await verifyPassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ error: "WrongPassword", message: "Current password is incorrect" });
      return;
    }

    // Check the new email isn't already taken
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.email, normalizedEmail)).limit(1);
    if (existing) {
      res.status(409).json({ error: "EmailTaken", message: "That email address is already in use" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.update(usersTable).set({
      pendingEmail: normalizedEmail,
      pendingEmailToken: token,
      pendingEmailTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    const link = `${getAppBaseUrl()}/auth/verify-email-change?token=${token}`;
    const sent = await sendEmail(emailChangeEmail({ name: user.name, newEmail: normalizedEmail, link }));
    if (!sent) {
      console.log(`[DEV] Email change link for ${normalizedEmail}: ${link}`);
    }

    const devExtra = process.env.NODE_ENV !== "production" ? { devLink: link } : {};
    res.json({ message: "Confirmation email sent to your new address. Click the link to complete the change.", ...devExtra });
  } catch (err) {
    req.log.error({ err }, "Error in change-email");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── VERIFY EMAIL CHANGE ───────────────────────────────────────────────
router.get("/auth/verify-email-change", async (req: AuthenticatedRequest, res) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      res.status(400).json({ success: false, message: "Token is required" });
      return;
    }

    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.pendingEmailToken, token)).limit(1);
    if (!user || !user.pendingEmail) {
      res.status(400).json({ success: false, message: "This link is invalid or has already been used." });
      return;
    }
    if (user.pendingEmailTokenExpiresAt && user.pendingEmailTokenExpiresAt < new Date()) {
      res.status(400).json({ success: false, message: "This link has expired. Please request a new one from your profile settings." });
      return;
    }

    // One last check — make sure nobody grabbed the new email in the interim
    const [conflict] = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.email, user.pendingEmail)).limit(1);
    if (conflict) {
      res.status(409).json({ success: false, message: "That email address is no longer available." });
      return;
    }

    await db.update(usersTable).set({
      email: user.pendingEmail,
      pendingEmail: null,
      pendingEmailToken: null,
      pendingEmailTokenExpiresAt: null,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    // Issue a fresh session token so the user is immediately signed in with the new email
    const profile = await ensureProfile(user.id);
    const authToken = generateToken(user.id);
    res.json({ success: true, newEmail: user.pendingEmail, token: authToken, user: serializeUser({ ...user, email: user.pendingEmail }, profile) });
  } catch (err) {
    req.log.error({ err }, "Error in verify-email-change");
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

// ── GET PROVIDERS ─────────────────────────────────────────────────────
router.get("/auth/providers", (_req, res) => {
  const providers: string[] = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) providers.push("google");
  res.json({ providers });
});

// ── GET ME ────────────────────────────────────────────────────────────
router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "User not found" });
      return;
    }
    const profile = await ensureProfile(user.id);
    res.json({ user: serializeUser(user, profile) });
  } catch (err) {
    req.log.error({ err }, "Error fetching current user");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
