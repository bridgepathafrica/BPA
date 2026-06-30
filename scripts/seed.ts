import { db, usersTable, profilesTable, jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const PASSWORD_SALT = process.env.PASSWORD_SALT ?? "bridgepath_salt_v1";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + PASSWORD_SALT).digest("hex");
}

async function upsertUser(data: {
  email: string;
  password: string;
  name: string;
  role: "job_seeker" | "employer";
}) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).limit(1);
  if (existing.length > 0) {
    console.log(`  ↳ User already exists: ${data.name} (${data.role})`);
    return existing[0];
  }
  const [user] = await db.insert(usersTable).values({
    email: data.email,
    passwordHash: hashPassword(data.password),
    name: data.name,
    role: data.role,
    emailVerified: true,
  }).returning();
  console.log(`  ✓ Created user: ${data.name} (id=${user.id}, role=${data.role})`);
  return user;
}

async function upsertProfile(userId: number, data: Record<string, any>) {
  const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(profilesTable).set({ ...data, updatedAt: new Date() }).where(eq(profilesTable.userId, userId));
    console.log(`  ↳ Updated profile for user ${userId}`);
    return;
  }
  await db.insert(profilesTable).values({ userId, ...data });
  console.log(`  ✓ Created profile for user ${userId}`);
}

async function seed() {
  console.log("\n🌱 Seeding Bridgepath Africa database…\n");

  // ── Employers ──────────────────────────────────────────────────────
  console.log("👔 Seeding employers…");

  const employer1 = await upsertUser({
    email: "hiring@andela.com",
    password: "Andela123!",
    name: "James Okafor",
    role: "employer",
  });
  await upsertProfile(employer1.id, {
    companyName: "Andela",
    industry: "Technology",
    country: "Kenya",
    location: "Nairobi",
    bio: "Andela is a global talent network that connects companies with vetted, remote engineers across Africa and beyond.",
    companyWebsite: "https://andela.com",
    companySize: "1000+",
    skills: "[]",
  });

  const employer2 = await upsertUser({
    email: "talent@equitybank.co.ke",
    password: "Equity123!",
    name: "Amina Wanjiru",
    role: "employer",
  });
  await upsertProfile(employer2.id, {
    companyName: "Equity Bank",
    industry: "Banking & Finance",
    country: "Kenya",
    location: "Nairobi",
    bio: "Equity Bank is a leading pan-African bank headquartered in Nairobi, serving over 15 million customers across Africa.",
    companyWebsite: "https://equitybankgroup.com",
    companySize: "1000+",
    skills: "[]",
  });

  const employer3 = await upsertUser({
    email: "hr@techbridgeafrica.com",
    password: "TechBridge123!",
    name: "Kofi Asante",
    role: "employer",
  });
  await upsertProfile(employer3.id, {
    companyName: "TechBridge Africa",
    industry: "Technology",
    country: "Ghana",
    location: "Accra",
    bio: "TechBridge Africa builds software solutions that power businesses across West Africa, from fintech to logistics.",
    companyWebsite: "https://techbridgeafrica.com",
    companySize: "51–200",
    skills: "[]",
  });

  const employer4 = await upsertUser({
    email: "people@flutterwave.com",
    password: "Flutter123!",
    name: "Ngozi Obi",
    role: "employer",
  });
  await upsertProfile(employer4.id, {
    companyName: "Flutterwave",
    industry: "FinTech",
    country: "Nigeria",
    location: "Lagos",
    bio: "Flutterwave is Africa's leading payments technology company, enabling businesses to make and accept payments across the continent.",
    companyWebsite: "https://flutterwave.com",
    companySize: "501–1000",
    skills: "[]",
  });

  // ── Job Seekers ────────────────────────────────────────────────────
  console.log("\n👤 Seeding job seekers…");

  const seeker1 = await upsertUser({
    email: "ama.boateng@gmail.com",
    password: "Ama12345!",
    name: "Ama Boateng",
    role: "job_seeker",
  });
  await upsertProfile(seeker1.id, {
    bio: "Passionate full-stack engineer with 5 years of experience building scalable products across Ghana and remotely for global clients. I thrive at the intersection of clean code and great user experience.",
    location: "Accra",
    country: "Ghana",
    skills: JSON.stringify(["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"]),
    experience: "5 years as a full-stack developer. Previously at Hubtel (Ghana) building payment integrations, then at Andela working with US-based startups. Strong background in React frontends and Node.js APIs.",
    education: "BSc Computer Science, University of Ghana, 2019",
    linkedinUrl: "https://linkedin.com/in/amaboateng",
  });

  const seeker2 = await upsertUser({
    email: "kwame.mensah@gmail.com",
    password: "Kwame123!",
    name: "Kwame Mensah",
    role: "job_seeker",
  });
  await upsertProfile(seeker2.id, {
    bio: "Finance professional with CPA qualification and 6 years of experience in financial analysis and reporting within West African banking and microfinance sectors.",
    location: "Accra",
    country: "Ghana",
    skills: JSON.stringify(["Financial Analysis", "IFRS", "Excel", "Budgeting", "SAP", "Power BI"]),
    experience: "6 years in finance. 4 years at GCB Bank as Senior Financial Analyst, followed by 2 years at Fidelity Bank Ghana managing quarterly reporting and forecasting cycles.",
    education: "BSc Accounting, KNUST, 2018. CPA (ICAG), 2020.",
    linkedinUrl: "https://linkedin.com/in/kwamemensah",
  });

  const seeker3 = await upsertUser({
    email: "aisha.kamau@gmail.com",
    password: "Aisha123!",
    name: "Aisha Kamau",
    role: "job_seeker",
  });
  await upsertProfile(seeker3.id, {
    bio: "Strategic HR Business Partner with 7 years of experience in talent management, OD, and culture across East Africa's tech and telecom sectors. CIPD qualified.",
    location: "Nairobi",
    country: "Kenya",
    skills: JSON.stringify(["HR Strategy", "Talent Acquisition", "Employee Relations", "HRIS", "Change Management", "L&D"]),
    experience: "7 years in HR. Started at Safaricom as HR Generalist, promoted to HRBP within 2 years. Joined Cellulant as Senior HRBP, partnering with Engineering and Product teams across 18 African markets.",
    education: "BA Human Resource Management, University of Nairobi, 2017. CIPD Level 5, 2020.",
    linkedinUrl: "https://linkedin.com/in/aishakamau",
  });

  const seeker4 = await upsertUser({
    email: "emeka.okonkwo@gmail.com",
    password: "Emeka123!",
    name: "Emeka Okonkwo",
    role: "job_seeker",
  });
  await upsertProfile(seeker4.id, {
    bio: "Mobile-first product manager and Android developer hybrid. 4 years building consumer fintech apps across Nigeria, with a strong bias for data-driven decisions and user research.",
    location: "Lagos",
    country: "Nigeria",
    skills: JSON.stringify(["Product Management", "Android", "Kotlin", "User Research", "Agile", "Mixpanel"]),
    experience: "4 years at Kuda Bank as Product Manager for savings features (0→500k users). Previously Android Engineer at Paystack before the Stripe acquisition.",
    education: "BEng Electrical Engineering, University of Lagos, 2020.",
    linkedinUrl: "https://linkedin.com/in/emekaokonkwo",
  });

  const seeker5 = await upsertUser({
    email: "fatima.diallo@gmail.com",
    password: "Fatima123!",
    name: "Fatima Diallo",
    role: "job_seeker",
  });
  await upsertProfile(seeker5.id, {
    bio: "UX designer with 4 years of experience creating human-centred digital products for African users. Fluent in French and English, I've worked with NGOs, banks, and startups across Francophone Africa.",
    location: "Dakar",
    country: "Senegal",
    skills: JSON.stringify(["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"]),
    experience: "4 years as UX Designer. 2 years at Orange Senegal on their mobile money app redesign. 2 years freelancing for clients including BCEAO and UNICEF Dakar.",
    education: "BFA Graphic Design, Université Cheikh Anta Diop, 2020.",
    linkedinUrl: "https://linkedin.com/in/fatimadiallo",
  });

  // ── Jobs ───────────────────────────────────────────────────────────
  console.log("\n💼 Seeding job listings…");

  async function upsertJob(data: {
    employerId: number;
    title: string;
    description: string;
    requirements: string;
    location: string;
    country: string;
    type: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    industry?: string;
    skills?: string[];
  }) {
    const existing = await db.select().from(jobsTable)
      .where(eq(jobsTable.title, data.title))
      .limit(1);
    if (existing.length > 0 && existing[0].employerId === data.employerId) {
      console.log(`  ↳ Job already exists: ${data.title}`);
      return existing[0];
    }
    const [job] = await db.insert(jobsTable).values({
      ...data,
      skills: JSON.stringify(data.skills ?? []),
      currency: data.currency ?? "USD",
      isActive: true,
    }).returning();
    console.log(`  ✓ Created job: ${data.title} (id=${job.id})`);
    return job;
  }

  await upsertJob({
    employerId: employer1.id,
    title: "Senior Full-Stack Engineer",
    description: "Join Andela's world-class engineering network and work with leading global technology companies. You will design and build scalable full-stack applications, mentor junior developers, and contribute to our engineering culture of excellence.\n\nYou'll be embedded with a US or European client team, working across the full stack — from React frontends to Node.js APIs and PostgreSQL databases — in a fully remote, async-friendly environment.",
    requirements: "5+ years of full-stack development experience.\nStrong proficiency in React and TypeScript.\nSolid backend skills in Node.js or Python.\nExperience with cloud platforms (AWS, GCP, or Azure).\nExcellent communication in English.\nAbility to work across time zones.",
    location: "Remote",
    country: "Kenya",
    type: "remote",
    salaryMin: 70000,
    salaryMax: 110000,
    currency: "USD",
    industry: "Technology",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
  });

  await upsertJob({
    employerId: employer1.id,
    title: "DevOps Engineer",
    description: "Andela is looking for a DevOps Engineer to build and maintain CI/CD pipelines, infrastructure-as-code, and cloud environments for our growing portfolio of client engagements.\n\nYou will work closely with engineering teams to ensure reliable, scalable deployments and champion engineering best practices around observability, security, and performance.",
    requirements: "4+ years of DevOps or platform engineering experience.\nStrong Kubernetes and Docker skills.\nExperience with Terraform or Pulumi.\nProficient with AWS or GCP.\nGood scripting skills (Bash, Python).",
    location: "Remote",
    country: "Kenya",
    type: "remote",
    salaryMin: 65000,
    salaryMax: 100000,
    currency: "USD",
    industry: "Technology",
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Python"],
  });

  await upsertJob({
    employerId: employer2.id,
    title: "Finance Manager – East Africa",
    description: "Equity Bank is seeking an experienced Finance Manager to lead financial planning, reporting, and analysis across our East Africa operations. You will oversee a team of 5 analysts, manage the monthly close cycle, and provide strategic financial insight to the CFO and regional leadership.\n\nThis role is based at our Nairobi headquarters with occasional travel across Uganda, Rwanda, and Tanzania.",
    requirements: "Degree in Finance, Accounting, or related field (Master's preferred).\nCPA or ACCA qualified.\n5+ years of financial management experience in banking or financial services.\nStrong knowledge of IFRS and CBK regulatory requirements.\nAdvanced Excel; experience with Oracle or SAP.",
    location: "Nairobi",
    country: "Kenya",
    type: "full_time",
    salaryMin: 55000,
    salaryMax: 80000,
    currency: "USD",
    industry: "Banking & Finance",
    skills: ["Financial Analysis", "IFRS", "Excel", "Budgeting", "Oracle", "SAP"],
  });

  await upsertJob({
    employerId: employer3.id,
    title: "Product Designer (UX/UI)",
    description: "TechBridge Africa is looking for a talented Product Designer to shape the user experience of our suite of B2B SaaS products serving West African businesses.\n\nYou'll own the design process end-to-end — from user research and journey mapping through to polished, production-ready Figma specs handed off to our engineering team.",
    requirements: "3+ years of product or UX design experience.\nStrong Figma skills and a solid portfolio of shipped products.\nExperience conducting user research in African markets a strong plus.\nFluent in English; French a bonus.",
    location: "Accra",
    country: "Ghana",
    type: "full_time",
    salaryMin: 35000,
    salaryMax: 55000,
    currency: "USD",
    industry: "Technology",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "UI/UX"],
  });

  await upsertJob({
    employerId: employer3.id,
    title: "Backend Engineer (Node.js)",
    description: "We're growing our engineering team at TechBridge Africa. As a Backend Engineer, you will build the APIs, integrations, and data pipelines that power our logistics and fintech products across Ghana and Nigeria.\n\nYou'll work in a fast-moving team with strong code review culture, weekly demos, and regular architecture discussions.",
    requirements: "3+ years of Node.js backend experience.\nStrong REST API design skills.\nExperience with PostgreSQL or MySQL.\nFamiliarity with message queues (RabbitMQ, SQS, or Kafka).\nTDD mindset and good testing practices.",
    location: "Accra",
    country: "Ghana",
    type: "full_time",
    salaryMin: 40000,
    salaryMax: 65000,
    currency: "USD",
    industry: "Technology",
    skills: ["Node.js", "PostgreSQL", "REST APIs", "Docker", "Redis"],
  });

  await upsertJob({
    employerId: employer4.id,
    title: "Senior Backend Engineer (Python)",
    description: "Help power Africa's payments infrastructure at Flutterwave. You'll design and build the high-throughput, resilient backend systems that process billions of dollars in annual transaction volume across 34 African countries.\n\nThis is a fully remote role open to candidates across Africa. You'll work within our Platform Engineering team, collaborating with payments, compliance, and product teams.",
    requirements: "5+ years of Python backend engineering.\nExpertise in Django or FastAPI.\nStrong PostgreSQL and Redis knowledge.\nExperience designing systems for high availability and horizontal scale.\nFamiliarity with PCI-DSS compliance a plus.",
    location: "Remote",
    country: "Multiple",
    type: "remote",
    salaryMin: 70000,
    salaryMax: 110000,
    currency: "USD",
    industry: "FinTech",
    skills: ["Python", "Django", "PostgreSQL", "AWS", "Redis", "Celery"],
  });

  await upsertJob({
    employerId: employer4.id,
    title: "HR Business Partner",
    description: "Flutterwave is scaling fast — and we need an experienced HRBP to help our teams grow sustainably. Partnering with Engineering and Product leaders, you'll drive talent strategy, run performance cycles, lead culture initiatives, and support our teams through rapid change.\n\nThis is a high-impact, high-visibility role reporting directly to the VP of People.",
    requirements: "5+ years as an HRBP or Senior HR Generalist.\nProven experience in a fast-growing tech or fintech company.\nHR certification (CIPD, SHRM, or CIPM) preferred.\nStrong stakeholder management and influencing skills.\nComfortable with ambiguity and rapid organisational change.",
    location: "Lagos",
    country: "Nigeria",
    type: "full_time",
    salaryMin: 50000,
    salaryMax: 75000,
    currency: "USD",
    industry: "FinTech",
    skills: ["HR Strategy", "Talent Management", "Performance Management", "Change Management", "HRIS"],
  });

  console.log("\n✅ Seed complete!\n");
  console.log("Test credentials are defined in scripts/seed.ts");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
