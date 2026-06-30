import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "crypto";
import { eq, ilike } from "drizzle-orm";
import * as schema from "./schema/index.js";

const { Pool } = pg;
const { usersTable, profilesTable, jobsTable } = schema;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set");

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT ?? "bridgepath_salt_v1";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

async function seed() {
  console.log("🌱 Seeding Bridgepath Africa database…\n");

  // ── SMOKE EMPLOYER ───────────────────────────────────────────────────────
  const employerEmail = "smoke-employer@bridgepathnetwork.com";
  let [employer] = await db.select().from(usersTable).where(eq(usersTable.email, employerEmail)).limit(1);

  if (!employer) {
    [employer] = await db.insert(usersTable).values({
      email: employerEmail,
      passwordHash: hashPassword("SmokeTest123!"),
      name: "Kofi Mensah",
      role: "employer",
      emailVerified: true,
    }).returning();
    console.log("✅ Created smoke employer account");
  } else {
    console.log("⏭  Smoke employer account already exists");
  }

  // ── SMOKE JOBSEEKER ──────────────────────────────────────────────────────
  const seekerEmail = "smoke-jobseeker@bridgepathnetwork.com";
  let [seeker] = await db.select().from(usersTable).where(eq(usersTable.email, seekerEmail)).limit(1);

  if (!seeker) {
    [seeker] = await db.insert(usersTable).values({
      email: seekerEmail,
      passwordHash: hashPassword("SmokeTest123!"),
      name: "Kwame Asante",
      role: "job_seeker",
      emailVerified: true,
    }).returning();
    console.log("✅ Created smoke job seeker account");
  } else {
    console.log("⏭  Smoke job seeker account already exists");
  }

  // ── EMPLOYER PROFILE ─────────────────────────────────────────────────────
  const [existingEmpProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, employer.id)).limit(1);
  if (!existingEmpProfile) {
    await db.insert(profilesTable).values({
      userId: employer.id,
      bio: "Bridgepath Tech Ltd is a pan-African technology and HR solutions company headquartered in Accra, Ghana.",
      location: "Accra, Ghana",
      country: "Ghana",
      skills: "[]",
      companyName: "Bridgepath Tech Ltd",
      companyWebsite: "https://bridgepathafricahr.com",
      industry: "Technology",
      companySize: "51-200",
    });
    console.log("✅ Created employer profile");
  } else {
    console.log("⏭  Employer profile already exists");
  }

  // ── JOBSEEKER PROFILE ─────────────────────────────────────────────────────
  const [existingSeekerProfile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, seeker.id)).limit(1);
  if (!existingSeekerProfile) {
    await db.insert(profilesTable).values({
      userId: seeker.id,
      bio: "Senior software engineer with 6 years of experience building scalable fintech products across West Africa.",
      location: "Accra, Ghana",
      country: "Ghana",
      skills: JSON.stringify(["TypeScript", "Node.js", "React", "PostgreSQL", "Python", "AWS"]),
      experience: "6 years",
      education: "BSc Computer Science, University of Ghana",
      linkedinUrl: "https://linkedin.com/in/kwame-asante",
    });
    console.log("✅ Created job seeker profile");
  } else {
    console.log("⏭  Job seeker profile already exists");
  }

  // ── SEED JOBS ─────────────────────────────────────────────────────────────
  const jobs = [
    {
      title: "Senior Software Engineer",
      description: `We are looking for a Senior Software Engineer to join our growing engineering team in Accra. You will design, build and maintain scalable backend services and APIs that power our pan-African HR platform.\n\nYou will work closely with product managers and designers to translate business requirements into clean, well-tested code. Our stack includes Node.js, TypeScript, PostgreSQL, and React.\n\nThis is a hybrid role based in Accra with the option to work remotely two days per week.`,
      requirements: "5+ years of software development experience\nStrong knowledge of TypeScript and Node.js\nExperience with PostgreSQL or similar relational databases\nFamiliarity with RESTful API design\nExperience with cloud platforms (AWS, GCP, or Azure)",
      location: "Accra",
      country: "Ghana",
      type: "full_time",
      salaryMin: 45000,
      salaryMax: 70000,
      currency: "USD",
      industry: "Technology",
      skills: JSON.stringify(["TypeScript", "Node.js", "React", "PostgreSQL", "AWS"]),
    },
    {
      title: "HR Business Partner",
      description: `Bridgepath Tech Ltd is seeking a strategic HR Business Partner to support our growing operations across Ghana and Kenya. You will serve as a trusted advisor to business leaders, aligning HR strategy with business objectives.\n\nKey responsibilities include workforce planning, performance management, employee relations, policy development, and supporting recruitment efforts.`,
      requirements: "5+ years of progressive HR experience\nDemonstrated experience as an HR Business Partner\nStrong knowledge of Ghanaian labor law\nExcellent interpersonal and negotiation skills\nHR certification (SHRM, CIPD, or equivalent) preferred",
      location: "Accra",
      country: "Ghana",
      type: "full_time",
      salaryMin: 35000,
      salaryMax: 52000,
      currency: "USD",
      industry: "Human Resources",
      skills: JSON.stringify(["HR Strategy", "Employee Relations", "Labor Law", "Performance Management", "Recruitment"]),
    },
    {
      title: "Product Manager – FinTech",
      description: `We are hiring an experienced Product Manager to lead the development of next-generation financial products for African markets. You will own the full product lifecycle from discovery through launch, working with engineering, design, and commercial teams.\n\nThe ideal candidate has a passion for financial inclusion and a track record of shipping high-quality digital products in emerging markets.`,
      requirements: "3+ years of product management experience\nExperience in fintech, payments, or financial services\nStrong analytical skills and comfort with data\nExperience with Agile/Scrum development workflows\nFamiliarity with the African digital payments ecosystem",
      location: "Nairobi",
      country: "Kenya",
      type: "full_time",
      salaryMin: 50000,
      salaryMax: 80000,
      currency: "USD",
      industry: "FinTech",
      skills: JSON.stringify(["Product Strategy", "Agile", "Data Analysis", "Mobile Money", "Roadmapping"]),
    },
    {
      title: "Finance & Operations Analyst",
      description: `We are looking for a Finance & Operations Analyst to support our financial reporting, budgeting, and operational efficiency initiatives. You will work directly with the CFO and COO to produce accurate financial models and monthly management accounts.\n\nThis is an excellent opportunity for a detail-oriented, analytically minded professional who wants to grow their career in a fast-paced pan-African business environment.`,
      requirements: "2+ years of finance or operations analysis experience\nProficiency in Excel and financial modeling\nExperience with accounting software (QuickBooks, Xero, or SAP)\nStrong understanding of financial statements\nACA, ACCA, CIMA qualification (or studying towards)",
      location: "Nairobi",
      country: "Kenya",
      type: "full_time",
      salaryMin: 28000,
      salaryMax: 42000,
      currency: "USD",
      industry: "Banking & Finance",
      skills: JSON.stringify(["Financial Modeling", "Excel", "Accounting", "Budgeting", "Reporting"]),
    },
    {
      title: "Operations Lead – Remote",
      description: `Bridgepath Tech Ltd is seeking a remote Operations Lead to manage day-to-day business processes, vendor relationships, and cross-functional project delivery. You will be the operational backbone of a growing team, ensuring our HR services run smoothly across multiple African markets.\n\nThe role requires exceptional organizational skills, experience managing distributed teams, and comfort working with ambiguity in a high-growth environment.`,
      requirements: "4+ years of operations management experience\nExperience managing distributed or remote teams\nStrong project management skills\nExcellent written communication\nComfort with SaaS tools: Notion, Slack, Jira, or similar\nExperience in HR, staffing, or professional services preferred",
      location: "Remote",
      country: "Ghana",
      type: "remote",
      salaryMin: 38000,
      salaryMax: 58000,
      currency: "USD",
      industry: "Operations",
      skills: JSON.stringify(["Operations Management", "Project Management", "Process Improvement", "Remote Team Leadership"]),
    },
  ];

  let jobsCreated = 0;
  for (const job of jobs) {
    const [existing] = await db.select().from(jobsTable).where(ilike(jobsTable.title, job.title)).limit(1);
    if (!existing) {
      await db.insert(jobsTable).values({ ...job, employerId: employer.id });
      jobsCreated++;
    }
  }

  if (jobsCreated > 0) {
    console.log(`✅ Created ${jobsCreated} job listing(s)`);
  } else {
    console.log("⏭  All job listings already exist");
  }

  console.log("\n🎉 Seed complete!\n");
  console.log("Smoke accounts:");
  console.log("  Employer   → smoke-employer@bridgepathnetwork.com  / SmokeTest123!");
  console.log("  Job seeker → smoke-jobseeker@bridgepathnetwork.com / SmokeTest123!\n");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
