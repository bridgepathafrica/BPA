import {
  sqliteTable,
  text,
  integer,
  unique,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("job_seeker"),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiresAt: integer("verification_token_expires_at", { mode: "timestamp_ms" }),
  oauthProvider: text("oauth_provider"),
  oauthId: text("oauth_id"),
  passwordResetToken: text("password_reset_token"),
  passwordResetTokenExpiresAt: integer("password_reset_token_expires_at", { mode: "timestamp_ms" }),
  magicLinkToken: text("magic_link_token"),
  magicLinkTokenExpiresAt: integer("magic_link_token_expires_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const profilesTable = sqliteTable("profiles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull().unique(),
  bio: text("bio"),
  location: text("location"),
  country: text("country"),
  skills: text("skills").default("[]"),
  experience: text("experience"),
  education: text("education"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  resumeUrl: text("resume_url"),
  avatarUrl: text("avatar_url"),
  companyName: text("company_name"),
  companyWebsite: text("company_website"),
  industry: text("industry"),
  companySize: text("company_size"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;

export const jobsTable = sqliteTable("jobs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  employerId: integer("employer_id", { mode: "number" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: text("location").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull().default("full_time"),
  salaryMin: integer("salary_min", { mode: "number" }),
  salaryMax: integer("salary_max", { mode: "number" }),
  currency: text("currency").default("USD"),
  industry: text("industry"),
  skills: text("skills").default("[]"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

export const applicationsTable = sqliteTable("applications", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  jobId: integer("job_id", { mode: "number" }).notNull(),
  applicantId: integer("applicant_id", { mode: "number" }).notNull(),
  coverLetter: text("cover_letter"),
  cvUrl: text("cv_url"),
  cvFileName: text("cv_file_name"),
  status: text("status").notNull().default("pending"),
  viewedAt: integer("viewed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;

export const cvReviewsTable = sqliteTable("cv_reviews", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  cvFileName: text("cv_file_name").notNull(),
  cvText: text("cv_text"),
  status: text("status").notNull().default("pending"),
  aiReview: text("ai_review"),
  humanReview: text("human_review"),
  paymentStatus: text("payment_status").notNull().default("none"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertCvReviewSchema = createInsertSchema(cvReviewsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCvReview = z.infer<typeof insertCvReviewSchema>;
export type CvReview = typeof cvReviewsTable.$inferSelect;

export const contactSubmissionsTable = sqliteTable("contact_submissions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(),
  message: text("message"),
  emailSent: text("email_sent").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissionsTable).omit({
  id: true,
  emailSent: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;

export const feedbackTable = sqliteTable("application_feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id", { mode: "number" }).notNull(),
  employerId: integer("employer_id", { mode: "number" }).notNull(),
  candidateId: integer("candidate_id", { mode: "number" }).notNull(),
  content: text("content").notNull(),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;

export const savedJobsTable = sqliteTable("saved_jobs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  jobId: integer("job_id", { mode: "number" }).notNull(),
  savedAt: integer("saved_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  userJobUniq: unique().on(table.userId, table.jobId),
}));

export type SavedJob = typeof savedJobsTable.$inferSelect;
