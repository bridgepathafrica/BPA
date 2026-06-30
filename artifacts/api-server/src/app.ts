import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import router from "./routes";
import ogImageRouter from "./routes/og-image";
import { logger } from "./lib/logger";
import { globalLimiter } from "./lib/limiters";

const app: Express = express();

const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = isProd
  ? [
      "https://bridgepathnetwork.com",
      "https://www.bridgepathnetwork.com",
    ]
  : true;

// ── Request ID — injected before any other middleware ───────────────────────
app.use((req, res, next) => {
  const id = (req.headers["x-request-id"] as string) || `bp-${crypto.randomBytes(8).toString("hex")}`;
  res.setHeader("x-request-id", id);
  (req as typeof req & { requestId: string }).requestId = id;
  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    exposedHeaders: ["x-request-id"],
  }),
);

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => (req as typeof req & { requestId?: string }).requestId ?? crypto.randomBytes(8).toString("hex"),
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cookieParser());
app.use(globalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

try {
  const UPLOAD_DIR = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  app.use("/api/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));
} catch {
  // Filesystem unavailable (e.g. Cloudflare Workers environment)
}

app.use("/og-image", ogImageRouter);
app.use("/api", router);

// ── Global error handler — must have 4 parameters so Express recognises it ──
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as { status?: number; statusCode?: number })?.status
    ?? (err as { status?: number; statusCode?: number })?.statusCode
    ?? 500;
  const message =
    err instanceof Error ? err.message : "Internal server error";

  logger.error({ err, req: { method: req.method, url: req.url } }, "Unhandled error");

  if (res.headersSent) return;

  res.status(status).json({
    error: {
      message: isProd && status >= 500 ? "Internal server error" : message,
      requestId: res.getHeader("x-request-id"),
    },
  });
});

try {
  if (isProd) {
    const staticDir = path.join(process.cwd(), "artifacts/bridgepath/dist/public");
    if (fs.existsSync(staticDir)) {
      app.use(express.static(staticDir, { maxAge: "1d" }));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(staticDir, "index.html"));
      });
    }
  }
} catch {
  // Filesystem unavailable (e.g. Cloudflare Workers environment)
}

export default app;
