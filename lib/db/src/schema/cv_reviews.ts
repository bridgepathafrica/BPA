import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cvReviewsTable = pgTable("cv_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cvFileName: text("cv_file_name").notNull(),
  cvText: text("cv_text"),
  status: text("status").notNull().default("pending"),
  aiReview: text("ai_review"),
  humanReview: text("human_review"),
  paymentStatus: text("payment_status").notNull().default("none"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCvReviewSchema = createInsertSchema(cvReviewsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCvReview = z.infer<typeof insertCvReviewSchema>;
export type CvReview = typeof cvReviewsTable.$inferSelect;
