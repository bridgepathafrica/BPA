import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import pg from "pg";
import * as schemaPg from "./schema";
import * as schemaD1 from "./schema-d1";

const { Pool } = pg;

type AnyDb = ReturnType<typeof drizzlePg<typeof schemaPg>> | ReturnType<typeof drizzleD1<typeof schemaD1>>;

let _pool: InstanceType<typeof Pool> | null = null;
let _db: AnyDb | null = null;
let _useD1 = false;

export function initD1(d1: unknown): void {
  _useD1 = true;
  _db = drizzleD1(d1 as Parameters<typeof drizzleD1>[0], { schema: schemaD1 });
}

function getDb(): AnyDb {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  if (!_pool) {
    const isProd = process.env.NODE_ENV === "production";
    _pool = new Pool({
      connectionString,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    });
  }
  _db = drizzlePg(_pool, { schema: schemaPg });
  return _db;
}

export const pool = new Proxy({} as InstanceType<typeof Pool>, {
  get(_target, prop) {
    if (_pool) return (_pool as Record<string | symbol, unknown>)[prop];
    return undefined;
  },
});

export const db = new Proxy({} as AnyDb, {
  get(_target, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});

function makeTableProxy<P extends object, D extends object>(pgTbl: P, d1Tbl: D): P & D {
  // Use pgTbl as the Proxy TARGET (not `{}`). A Proxy transparently forwards
  // [[GetPrototypeOf]] to its target, so `proxy instanceof Table` checks the
  // target's prototype chain. With pgTbl as the target, drizzle's `is(proxy,
  // Table)` returns true and SQL builds correctly (no extra parentheses around
  // table name, no infinite recursion through the isSQLWrapper branch).
  return new Proxy(pgTbl as P & D, {
    get(_t, prop) {
      const tbl = _useD1 ? d1Tbl : pgTbl;
      const val = (tbl as Record<string | symbol, unknown>)[prop];
      // Bind methods to the real table so that drizzle's getSQL() returns
      // `new SQL([realTable])` — not `new SQL([proxy])` — preventing
      // the infinite recursion in buildQueryFromSourceParams.
      if (typeof val === "function") {
        return (val as (...args: unknown[]) => unknown).bind(tbl);
      }
      return val;
    },
  });
}

export const usersTable = makeTableProxy(schemaPg.usersTable, schemaD1.usersTable);
export const profilesTable = makeTableProxy(schemaPg.profilesTable, schemaD1.profilesTable);
export const jobsTable = makeTableProxy(schemaPg.jobsTable, schemaD1.jobsTable);
export const applicationsTable = makeTableProxy(schemaPg.applicationsTable, schemaD1.applicationsTable);
export const cvReviewsTable = makeTableProxy(schemaPg.cvReviewsTable, schemaD1.cvReviewsTable);
export const contactSubmissionsTable = makeTableProxy(schemaPg.contactSubmissionsTable, schemaD1.contactSubmissionsTable);
export const feedbackTable = makeTableProxy(schemaPg.feedbackTable, schemaD1.feedbackTable);
export const savedJobsTable = makeTableProxy(schemaPg.savedJobsTable, schemaD1.savedJobsTable);

export type { User, InsertUser } from "./schema";
export type { Profile, InsertProfile } from "./schema";
export type { Job, InsertJob } from "./schema";
export type { Application, InsertApplication } from "./schema";
export type { CvReview, InsertCvReview } from "./schema";
export type { ContactSubmission, InsertContactSubmission } from "./schema";
export type { Feedback, InsertFeedback } from "./schema";
export type { SavedJob } from "./schema";
export { insertUserSchema } from "./schema";
export { insertProfileSchema } from "./schema";
export { insertJobSchema } from "./schema";
export { insertApplicationSchema } from "./schema";
export { insertCvReviewSchema } from "./schema";
export { insertContactSubmissionSchema } from "./schema";
export { insertFeedbackSchema } from "./schema";

export {
  eq, ne, gt, gte, lt, lte,
  and, or, not,
  isNull, isNotNull,
  inArray, notInArray,
  exists, notExists,
  between, notBetween,
  like, ilike, notIlike,
  asc, desc,
  sql,
  count, sum, avg, min, max,
} from "drizzle-orm";
