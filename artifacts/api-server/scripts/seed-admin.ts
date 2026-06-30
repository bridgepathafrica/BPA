import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL    = "admin@bridgepathnetwork.com";
const ADMIN_PASSWORD = "BridgePath@2026!";
const ADMIN_NAME     = "Pamela Admin";
const BCRYPT_COST    = 12;

async function main() {
  const existing = await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL))
    .limit(1);

  const hash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_COST);

  if (existing.length > 0) {
    const row = existing[0];
    await db.update(usersTable)
      .set({ passwordHash: hash, role: "admin", emailVerified: true, updatedAt: new Date() } as any)
      .where(eq(usersTable.id, row.id));
    console.log(`✅ Admin user updated (id=${row.id}, was role=${row.role}).`);
  } else {
    const [created] = await db.insert(usersTable)
      .values({
        email: ADMIN_EMAIL,
        passwordHash: hash,
        name: ADMIN_NAME,
        role: "admin",
        emailVerified: true,
      } as any)
      .returning({ id: usersTable.id });
    console.log(`✅ Admin user created (id=${created.id}).`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  BridgePath Admin Credentials");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Email   :  ${ADMIN_EMAIL}`);
  console.log(`  Password:  ${ADMIN_PASSWORD}`);
  console.log(`  URL     :  /admin`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
