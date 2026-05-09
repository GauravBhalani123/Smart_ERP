import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@erp.local";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) return;

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.create({
    data: {
      fullName: "ERP Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
