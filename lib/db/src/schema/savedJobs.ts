import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const savedJobsTable = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobId: integer("job_id").notNull(),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
}, (table) => ({
  userJobUniq: unique().on(table.userId, table.jobId),
}));

export type SavedJob = typeof savedJobsTable.$inferSelect;
