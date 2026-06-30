import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

function getTokenSecret(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TOKEN_SECRET env var must be set in production.");
    }
    return "dev_only_insecure_secret_change_before_deploy";
  }
  return secret;
}

const BCRYPT_COST = 12;

/** Returns a bcrypt hash of the password (async) */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Verifies a password against a stored hash.
 * Supports both bcrypt hashes (new) and legacy SHA-256 hashes (migration path).
 * Returns { valid: boolean, needsRehash: boolean } — if needsRehash is true,
 * the caller should replace the stored hash with a fresh bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  const isBcrypt = storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$");

  if (isBcrypt) {
    const valid = await bcrypt.compare(password, storedHash);
    return { valid, needsRehash: false };
  }

  // Legacy SHA-256 path — migrate on successful login
  const salt = process.env.PASSWORD_SALT ?? "bridgepath_salt_v1";
  const sha256Hash = crypto.createHash("sha256").update(password + salt).digest("hex");
  const valid = crypto.timingSafeEqual(
    Buffer.from(sha256Hash),
    Buffer.from(storedHash),
  );
  return { valid, needsRehash: valid };
}

export function generateToken(userId: number): string {
  const issuedAt = Date.now();
  const payload = `${userId}:${issuedAt}`;
  const sig = crypto
    .createHmac("sha256", getTokenSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;

    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    const expectedSig = crypto
      .createHmac("sha256", getTokenSecret())
      .update(payload)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    const colonIdx = payload.indexOf(":");
    if (colonIdx === -1) return null;
    const userId = parseInt(payload.slice(0, colonIdx), 10);
    const issuedAt = parseInt(payload.slice(colonIdx + 1), 10);

    if (isNaN(userId) || isNaN(issuedAt)) return null;

    const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;
    if (Date.now() - issuedAt > TOKEN_TTL_MS) return null;

    return userId;
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // 1. Try Bearer token header
  const authHeader = req.headers.authorization;
  let rawToken: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    rawToken = authHeader.replace("Bearer ", "");
  }

  // 2. Fall back to httpOnly cookie (bp_token)
  if (!rawToken && req.cookies?.bp_token) {
    rawToken = req.cookies.bp_token as string;
  }

  if (!rawToken) {
    res.status(401).json({ error: "Unauthorized", message: "No token provided" });
    return;
  }

  const userId = parseToken(rawToken);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    return;
  }

  req.userId = userId;
  next();
}
