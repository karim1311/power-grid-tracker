import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: passwordHash,
      name: "Demo User",
      timezone: "America/New_York",
    },
  });

  console.log("Seeded user:", user.email);

  const start1 = new Date("2025-01-15T14:00:00");
  const end1 = new Date("2025-01-15T14:45:00");

  const outage1 = await prisma.outage.create({
    data: {
      userId: user.id,
      startTime: start1,
      endTime: end1,
      duration: 2700,
      status: "COMPLETED",
      note: "Brief outage",
    },
  });
  console.log("Created outage:", outage1.id);

  const start2 = new Date("2025-01-15T22:00:00");
  const end2 = new Date("2025-01-16T01:30:00");

  const outage2 = await prisma.outage.create({
    data: {
      userId: user.id,
      startTime: start2,
      endTime: end2,
      duration: 12600,
      status: "COMPLETED",
      note: "Overnight outage crossing midnight",
    },
  });
  console.log("Created outage:", outage2.id);

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
