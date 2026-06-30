import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too Many Requests", message: "Too many login attempts — try again in 15 minutes." },
  skip: () => !isProd,
});

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too Many Requests", message: "Slow down — try again shortly." },
  skip: () => !isProd,
});
