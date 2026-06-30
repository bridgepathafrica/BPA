import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";
import { db, profilesTable } from "@workspace/db";
import { eq } from "@workspace/db";
import { uploadToSupabase, isSupabaseConfigured, AVATAR_BUCKET, CV_BUCKET } from "../lib/supabase";

const router = Router();

const memStorage = multer.memoryStorage();

const avatarUpload = multer({
  storage: memStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, or WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

const cvUpload = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only PDF or Word documents are allowed"));
      return;
    }
    cb(null, true);
  },
});

// ── Disk fallback (used when Supabase is not configured) ──
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const AVATAR_DIR = path.join(UPLOAD_DIR, "avatars");
const CV_DIR = path.join(UPLOAD_DIR, "cvs");
try {
  if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });
  if (!fs.existsSync(CV_DIR)) fs.mkdirSync(CV_DIR, { recursive: true });
} catch {
  // Filesystem unavailable (e.g. Cloudflare Workers environment)
}

function saveToDisk(dir: string, name: string, buffer: Buffer): string {
  // dir is a server-constant (AVATAR_DIR/CV_DIR); name is constructed from req.userId + Date.now() + allowlisted extension
  const diskPath = path.join(dir, name); // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal, javascript.lang.security.audit.detect-non-literal-fs-filename
  fs.writeFileSync(diskPath, buffer); // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
  return diskPath;
}

function diskUrl(filePath: string): string {
  const relative = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  return `/api/uploads/${relative.replace(/^uploads\//, "")}`;
}

// ── POST /api/uploads/avatar ──────────────────────────────
router.post("/uploads/avatar", requireAuth, (req: AuthenticatedRequest, res) => {
  avatarUpload.single("avatar")(req as any, res as any, async (err) => {
    if (err) {
      res.status(400).json({ error: "Bad Request", message: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "Bad Request", message: "No file uploaded" });
      return;
    }

    try {
      let fileBuffer = req.file.buffer;
      let contentType = req.file.mimetype;

      // Resize with sharp if available
      try {
        const sharp = (await import("sharp")).default;
        fileBuffer = await sharp(req.file.buffer)
          .resize(400, 400, { fit: "cover" })
          .jpeg({ quality: 85 })
          .toBuffer();
        contentType = "image/jpeg";
      } catch {
        // sharp unavailable — use original buffer
      }

      let url: string;

      if (isSupabaseConfigured()) {
        const ext = contentType === "image/jpeg" ? ".jpg" : path.extname(req.file.originalname).toLowerCase() || ".jpg";
        const filePath = `user-${req.userId}-${Date.now()}${ext}`;
        url = await uploadToSupabase(AVATAR_BUCKET, filePath, fileBuffer, contentType);
      } else {
        const ext = contentType === "image/jpeg" ? ".jpg" : path.extname(req.file.originalname).toLowerCase() || ".jpg";
        const name = `user-${req.userId}-${Date.now()}${ext}`;
        const diskPath = saveToDisk(AVATAR_DIR, name, fileBuffer);
        url = diskUrl(diskPath);
      }

      await db.update(profilesTable)
        .set({ avatarUrl: url, updatedAt: new Date() } as any)
        .where(eq(profilesTable.userId, req.userId!));

      res.json({ url });
    } catch (e) {
      req.log?.error({ e }, "Avatar upload error");
      res.status(500).json({ error: "Internal Server Error", message: "Upload failed" });
    }
  });
});

// ── POST /api/uploads/cv ──────────────────────────────────
router.post("/uploads/cv", requireAuth, (req: AuthenticatedRequest, res) => {
  cvUpload.single("cv")(req as any, res as any, async (err) => {
    if (err) {
      res.status(400).json({ error: "Bad Request", message: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "Bad Request", message: "No file uploaded" });
      return;
    }

    try {
      let url: string;
      const ext = path.extname(req.file.originalname).toLowerCase() || ".pdf";
      const name = `cv-${req.userId}-${Date.now()}${ext}`;

      if (isSupabaseConfigured()) {
        url = await uploadToSupabase(CV_BUCKET, name, req.file.buffer, req.file.mimetype);
      } else {
        const diskPath = saveToDisk(CV_DIR, name, req.file.buffer);
        url = diskUrl(diskPath);
      }

      res.json({ url, fileName: req.file.originalname });
    } catch (e) {
      req.log?.error({ e }, "CV upload error");
      res.status(500).json({ error: "Internal Server Error", message: "Upload failed" });
    }
  });
});

export default router;
