import { v7 as uuidv7 } from "uuid";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { db, pool } from "./data-source";
import { retreat, user, member, refreshToken } from "./schema";

// Load environment variables
dotenv.config();

async function seed() {
  console.log("Seeding database...");

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("Clearing existing data...");
    await db.delete(refreshToken);
    await db.delete(member);
    await db.delete(user);
    await db.delete(retreat);
    console.log("✓ Cleared existing data");

    // Seed a test retreat
    const retreatId = uuidv7();
    await db.insert(retreat).values({
      uuid: retreatId,
      name: "Test Retreat",
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    console.log("✓ Created test retreat");

    // Seed a test user
    const userId = uuidv7();
    const hashedPassword = await bcrypt.hash("password123", 12);
    await db.insert(user).values({
      uuid: userId,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: hashedPassword,
      verificationToken: null, // Already verified
    });
    console.log("✓ Created test user (email: test@example.com, password: password123)");

    // Seed a test member
    const memberId = uuidv7();
    await db.insert(member).values({
      uuid: memberId,
      firstName: "Test",
      lastName: "Member",
      joinDate: new Date(),
      userUuid: null, // Member without user account
    });
    console.log("✓ Created test member");

    console.log("Seeding complete ✓");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
