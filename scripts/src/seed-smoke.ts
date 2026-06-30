import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const PASSWORD = "SmokeTest123!";

async function upsert(email: string, name: string, role: "employer" | "job_seeker") {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.email, email));
    console.log(`  ↳ Verified: ${email}`);
    return existing;
  }
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, name, role, emailVerified: true }).returning();
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, user.id)).limit(1);
  if (!profile) await db.insert(profilesTable).values({ userId: user.id, skills: "[]" });
  console.log(`  ✓ Created: ${email} (${role})`);
  return user;
}

async function main() {
  await upsert("smoke-employer@bridgepathnetwork.com", "Kofi Mensah", "employer");
  await upsert("smoke-jobseeker@bridgepathnetwork.com", "Ama Boateng", "job_seeker");
  await upsert("jobseeker@demo.bridgepathnetwork.com", "Demo Job Seeker", "job_seeker");
  await upsert("employer@demo.bridgepathnetwork.com", "Demo Employer", "employer");
  console.log("✅ Done");
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
