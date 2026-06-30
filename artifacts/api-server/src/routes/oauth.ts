import { Router } from "express";
import crypto from "crypto";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq, and } from "@workspace/db";
import { generateToken, hashPassword, requireAuth } from "../lib/auth";
import type { AuthenticatedRequest } from "../lib/auth";
import { sendEmail, welcomeJobSeekerEmail, welcomeEmployerEmail } from "../lib/email";

const router = Router();

function getAppBaseUrl(): string {
  if (process.env.OAUTH_BASE_URL) return process.env.OAUTH_BASE_URL;
  if (process.env.APP_DEV_DOMAIN) return `https://${process.env.APP_DEV_DOMAIN}`;
  return "https://bridgepathnetwork.com";
}

function getStateSecret(): string {
  return process.env.TOKEN_SECRET ?? "dev_only_insecure_state_secret";
}

// ── Stateless HMAC-signed state ──────────────────────────────────────────────

interface StatePayload {
  role?: string;
  action?: string;
  userId?: number;
  exp: number;
}

function makeState(options: { role?: string; action?: string; userId?: number } = {}): string {
  const data: StatePayload = {
    role: options.role ?? "job_seeker",
    exp: Date.now() + 10 * 60 * 1000,
  };
  if (options.action) data.action = options.action;
  if (options.userId !== undefined) data.userId = options.userId;

  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

function consumeState(state: string): StatePayload | null {
  try {
    const dot = state.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = state.slice(0, dot);
    const sig = state.slice(dot + 1);

    const expectedSig = crypto
      .createHmac("sha256", getStateSecret())
      .update(payload)
      .digest("base64url");

    if (
      sig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
    )
      return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as StatePayload;
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

async function ensureProfile(userId: number) {
  const existing = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .limit(1);
  if (existing.length > 0) return;
  await db.insert(profilesTable).values({ userId, skills: "[]" });
}

async function findOrCreateOAuthUser(params: {
  email: string;
  name: string;
  oauthProvider: string;
  oauthId: string;
  role?: string;
}): Promise<{ user: typeof usersTable.$inferSelect; isNew: boolean }> {
  const { email, name, oauthProvider, oauthId, role = "job_seeker" } = params;

  const byOAuth = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.oauthProvider, oauthProvider), eq(usersTable.oauthId, oauthId)))
    .limit(1);

  if (byOAuth.length > 0) {
    await ensureProfile(byOAuth[0].id);
    return { user: byOAuth[0], isNew: false };
  }

  const byEmail = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (byEmail.length > 0) {
    await db
      .update(usersTable)
      .set({ oauthProvider, oauthId, emailVerified: true, updatedAt: new Date() })
      .where(eq(usersTable.id, byEmail[0].id));
    await ensureProfile(byEmail[0].id);
    return { user: byEmail[0], isNew: false };
  }

  const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash,
      name,
      role,
      emailVerified: true,
      oauthProvider,
      oauthId,
    })
    .returning();
  await ensureProfile(user.id);
  return { user, isNew: true };
}

function oauthErrorRedirect(res: any, msg: string) {
  return res.redirect(`/auth/login?error=${encodeURIComponent(msg)}`);
}

// ──────────────────────────────────────
// GOOGLE OAuth 2.0 — Sign In / Sign Up
// ──────────────────────────────────────

router.get("/auth/google", (req: AuthenticatedRequest, res) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
  if (!clientId) {
    res.status(503).json({ error: "Google OAuth not configured" });
    return;
  }

  const role = (req.query.role as string) || "job_seeker";
  const state = makeState({ role });
  const redirectUri = `${getAppBaseUrl()}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ──────────────────────────────────────
// GOOGLE OAuth 2.0 — Account Linking
// ──────────────────────────────────────
// The frontend passes the session token as a query param so the browser can
// navigate directly to this URL without needing a custom Authorization header.
// The token is only exposed during the redirect and is never stored by the client.

router.get("/auth/google/link", (req: AuthenticatedRequest, res) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
  if (!clientId) {
    res.status(503).json({ error: "Google OAuth not configured" });
    return;
  }

  // Accept token from query string (browser navigation) or Authorization header
  let rawToken: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) rawToken = authHeader.slice(7);
  if (!rawToken) rawToken = (req.query.token as string) ?? null;

  if (!rawToken) {
    res.redirect("/auth/login?error=Sign+in+first+to+link+an+account");
    return;
  }

  // Validate token manually (same logic as requireAuth middleware)
  const { parseToken } = require("../lib/auth");
  const userId = parseToken(rawToken);
  if (!userId) {
    res.redirect("/auth/login?error=Session+expired.+Please+sign+in+again.");
    return;
  }

  const state = makeState({ action: "link", userId });
  const redirectUri = `${getAppBaseUrl()}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ──────────────────────────────────────
// GOOGLE OAuth 2.0 — Callback (shared)
// ──────────────────────────────────────

router.get("/auth/google/callback", async (req: AuthenticatedRequest, res) => {
  let stage = "init";
  try {
    const { code, state, error } = req.query as Record<string, string>;

    if (error) return oauthErrorRedirect(res, "Google sign-in was cancelled.");
    if (!code || !state) return oauthErrorRedirect(res, "Invalid OAuth response.");

    stage = "state_verify";
    const stateData = consumeState(state);
    if (!stateData) return oauthErrorRedirect(res, "OAuth state expired — please try again.");

    const clientId = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();
    const redirectUri = `${getAppBaseUrl()}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return oauthErrorRedirect(res, "Google OAuth is not configured on the server.");
    }

    stage = "token_exchange";
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };
    if (!tokenData.access_token) {
      const detail = tokenData.error_description ?? tokenData.error ?? "unknown";
      req.log.error({ detail, redirectUri, clientId: clientId.slice(0, 20) + "..." }, "Google token exchange failed");
      return oauthErrorRedirect(res, `Google token error: ${detail}`);
    }

    stage = "userinfo";
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = (await userRes.json()) as {
      id: string;
      email: string;
      name: string;
    };

    if (!googleUser.email) return oauthErrorRedirect(res, "Could not get email from Google.");

    // ── Account-link flow ─────────────────────────────────────────────────────
    if (stateData.action === "link" && stateData.userId) {
      stage = "link_account";

      const [current] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, stateData.userId))
        .limit(1);
      if (!current) return oauthErrorRedirect(res, "Session expired. Please sign in and try again.");

      // Make sure this Google account isn't already linked to a DIFFERENT user
      const [alreadyLinked] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(and(eq(usersTable.oauthProvider, "google"), eq(usersTable.oauthId, googleUser.id)))
        .limit(1);
      if (alreadyLinked && alreadyLinked.id !== stateData.userId) {
        return res.redirect(
          "/profile?link_error=" +
            encodeURIComponent("That Google account is already connected to a different Bridgepath account."),
        );
      }

      await db
        .update(usersTable)
        .set({ oauthProvider: "google", oauthId: googleUser.id, emailVerified: true, updatedAt: new Date() })
        .where(eq(usersTable.id, stateData.userId));

      return res.redirect("/profile?linked=google");
    }

    // ── Standard sign-in / sign-up flow ──────────────────────────────────────
    stage = "db_upsert";
    const { user, isNew } = await findOrCreateOAuthUser({
      email: googleUser.email.toLowerCase(),
      name: googleUser.name || googleUser.email.split("@")[0],
      oauthProvider: "google",
      oauthId: googleUser.id,
      role: stateData.role ?? "job_seeker",
    });

    if (isNew) {
      if (user.role === "employer") {
        sendEmail(welcomeEmployerEmail({ name: user.name, companyName: user.name, email: user.email })).catch(() => {});
      } else {
        sendEmail(welcomeJobSeekerEmail({ name: user.name, email: user.email })).catch(() => {});
      }
    }

    stage = "token_gen";
    const token = generateToken(user.id);
    res.redirect(
      `/auth/oauth/callback?token=${encodeURIComponent(token)}&role=${encodeURIComponent(user.role)}`,
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    req.log.error({ err, stage }, "Google OAuth callback error");
    return oauthErrorRedirect(res, `Sign-in failed at [${stage}]: ${errMsg}`);
  }
});

// ──────────────────────────────────────
// Disconnect Google from account
// ──────────────────────────────────────

router.delete("/auth/google/link", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    await db
      .update(usersTable)
      .set({ oauthProvider: null, oauthId: null, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error disconnecting Google account");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ──────────────────────────────────────
// GET /api/auth/linked-accounts
// Returns which OAuth providers are connected for the current user
// ──────────────────────────────────────

router.get("/auth/linked-accounts", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const [user] = await db
      .select({ oauthProvider: usersTable.oauthProvider })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
    res.json({ google: user.oauthProvider === "google" });
  } catch (err) {
    req.log.error({ err }, "Error fetching linked accounts");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
