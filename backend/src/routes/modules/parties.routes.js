import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";

const router = Router();
router.use(requireAuth);

router.get("/suppliers", requirePermission("purchases:manage"), async (_req, res) => {
  const data = await prisma.supplier.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

router.post("/suppliers", requirePermission("purchases:manage"), async (req, res) => {
  const row = await prisma.supplier.create({ data: req.body });
  res.status(201).json(row);
});

router.put("/suppliers/:id", requirePermission("purchases:manage"), async (req, res) => {
  const row = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
  res.json(row);
});

router.delete("/suppliers/:id", requirePermission("purchases:manage"), async (req, res) => {
  await prisma.supplier.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

router.get("/suppliers/:id/analytics", requirePermission("purchases:manage"), async (req, res) => {
  const purchases = await prisma.purchase.findMany({ where: { supplierId: req.params.id } });
  const total = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  res.json({ totalPurchases: purchases.length, totalSpend: total });
});

router.get("/customers", requirePermission("sales:view"), async (_req, res) => {
  const data = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  res.json(data);
});

router.post("/customers", requirePermission("sales:manage"), async (req, res) => {
  const row = await prisma.customer.create({ data: req.body });
  res.status(201).json(row);
});

router.put("/customers/:id", requirePermission("sales:manage"), async (req, res) => {
  const row = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
  res.json(row);
});

router.delete("/customers/:id", requirePermission("sales:manage"), async (req, res) => {
  await prisma.customer.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

router.get("/customers/:id/analytics", requirePermission("sales:view"), async (req, res) => {
  const sales = await prisma.sale.findMany({ where: { customerId: req.params.id } });
  const total = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  res.json({ totalSales: sales.length, lifetimeValue: total });
});

export default router;
