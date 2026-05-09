import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { sendEmail } from "../../services/email.service.js";

const router = Router();
router.use(requireAuth);

router.get("/", requirePermission("dashboard:view"), async (_req, res) => {
  const rows = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const unreadCount = rows.filter((n) => !n.isRead).length;
  res.json({ unreadCount, rows });
});

router.patch("/:id/read", requirePermission("dashboard:view"), async (req, res) => {
  const row = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  res.json(row);
});

router.post("/email/low-stock", requirePermission("inventory:manage"), async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: "Recipient email required" });
  const inventory = await prisma.inventory.findMany({
    where: { status: { in: ["LOW", "CRITICAL", "OUT"] } },
    include: { product: true },
  });
  const lines = inventory.map((i) => `${i.product.name} (${i.product.sku}) - qty ${i.quantity} [${i.status}]`).join("\n");
  const emailStatus = await sendEmail({
    to,
    subject: "Low stock alerts",
    text: lines || "No low stock items.",
  });
  res.json({ totalAlerts: inventory.length, emailStatus });
});

export default router;
