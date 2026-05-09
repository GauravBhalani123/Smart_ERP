import app from "./app.js";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { env } from "./config/env.js";
import { initCronJobs } from "./services/cron.service.js";
import { verifyEmailTransport } from "./services/email.service.js";

initCronJobs();
app.listen(env.port, async () => {
  console.log(`Backend running on http://localhost:${env.port}`);
  
  // Auto-create admin if missing
  const prisma = new PrismaClient();
  try {
    const adminEmail = "admin@erp.local";
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const passwordHash = await bcrypt.hash("Admin@123", 10);
      await prisma.user.create({
        data: {
          fullName: "ERP Admin",
          email: adminEmail,
          passwordHash,
          role: "ADMIN",
        },
      });
      console.log("Admin user created successfully.");
    }
  } catch (err) {
    console.error("Failed to ensure admin user:", err);
  } finally {
    await prisma.$disconnect();
  }

  const smtp = await verifyEmailTransport();
  if (!smtp.ok) console.log(`SMTP not ready: ${smtp.reason}`);
});
