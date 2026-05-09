import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/authorize.js";

const router = Router();

router.get("/summary", requireAuth, requirePermission("dashboard:view"), async (_req, res) => {
  const [usersCount, sales, purchases, inventory, notifications, activities] = await Promise.all([
    prisma.user.count(),
    prisma.sale.findMany({ select: { totalAmount: true, profitAmount: true, saleDate: true } }),
    prisma.purchase.findMany({ select: { totalAmount: true, purchaseDate: true } }),
    prisma.inventory.findMany({ include: { product: true } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const salesTotal = sales.reduce((a, s) => a + s.totalAmount, 0);
  const purchaseTotal = purchases.reduce((a, p) => a + p.totalAmount, 0);
  const profitTotal = sales.reduce((a, s) => a + s.profitAmount, 0);
  const inventoryValue = inventory.reduce((a, i) => a + i.quantity * i.product.costPrice, 0);

  const byMonth = {};
  for (let i = 0; i < 6; i += 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = { month: key, sales: 0, purchases: 0, profit: 0 };
  }
  sales.forEach((s) => {
    const key = `${s.saleDate.getFullYear()}-${String(s.saleDate.getMonth() + 1).padStart(2, "0")}`;
    if (byMonth[key]) {
      byMonth[key].sales += s.totalAmount;
      byMonth[key].profit += s.profitAmount;
    }
  });
  purchases.forEach((p) => {
    const key = `${p.purchaseDate.getFullYear()}-${String(p.purchaseDate.getMonth() + 1).padStart(2, "0")}`;
    if (byMonth[key]) byMonth[key].purchases += p.totalAmount;
  });
  const stockPie = [
    { name: "Normal", value: inventory.filter((x) => x.status === "NORMAL").length },
    { name: "Low", value: inventory.filter((x) => x.status === "LOW").length },
    { name: "Critical", value: inventory.filter((x) => x.status === "CRITICAL").length },
    { name: "Out", value: inventory.filter((x) => x.status === "OUT").length },
  ];
  const [market, predictions] = await Promise.all([
    prisma.marketPrice.findMany({ orderBy: { capturedAt: "desc" }, distinct: ["material"] }),
    prisma.prediction.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  res.json({
    kpis: {
      sales: { value: Number(salesTotal.toFixed(2)), trend: 0 },
      purchases: { value: Number(purchaseTotal.toFixed(2)), trend: 0 },
      inventoryValue: { value: Number(inventoryValue.toFixed(2)), trend: 0 },
      profit: { value: Number(profitTotal.toFixed(2)), trend: 0 },
      activeUsers: { value: usersCount, trend: 0 },
    },
    activity: activities,
    notifications,
    charts: {
      salesPurchase: Object.values(byMonth).reverse(),
      stockPie,
    },
    ai: {
      market,
      predictions,
    },
  });
});

export default router;
