import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { upsertInventory } from "../../services/stock.service.js";

const router = Router();
router.use(requireAuth);

function saleNumber() {
  return `SAL-${Date.now()}`;
}

router.get("/", requirePermission("sales:view"), async (_req, res) => {
  const rows = await prisma.sale.findMany({
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { saleDate: "desc" },
  });
  res.json(rows);
});

router.post("/", requirePermission("sales:manage"), async (req, res) => {
  const { customerId, items = [], taxRate = 18, notes, status = "CONFIRMED" } = req.body;
  if (!customerId || items.length === 0) return res.status(400).json({ message: "Customer and items are required" });

  const products = await prisma.product.findMany({ where: { id: { in: items.map((x) => x.productId) } }, include: { inventory: true } });
  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  let profitAmount = 0;

  const lineItems = items.map((item) => {
    const p = byId.get(item.productId);
    if (!p) throw new Error("Invalid product in sale");
    const qty = Number(item.quantity);
    const unitPrice = Number(item.unitPrice ?? p.salePrice);
    const unitCost = Number(p.costPrice);
    const lineTotal = qty * unitPrice;
    const lineProfit = qty * (unitPrice - unitCost);
    subtotal += lineTotal;
    profitAmount += lineProfit;
    return { productId: p.id, quantity: qty, unitPrice, unitCost, lineTotal, lineProfit };
  });
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const totalAmount = subtotal + taxAmount;

  const sale = await prisma.sale.create({
    data: {
      saleNo: saleNumber(),
      customerId,
      status,
      subtotal,
      taxAmount,
      totalAmount,
      profitAmount,
      notes,
      items: { create: lineItems },
    },
    include: { items: true, customer: true },
  });

  if (status === "CONFIRMED") {
    for (const item of lineItems) {
      await upsertInventory(item.productId, -item.quantity, "SALE_OUT", sale.saleNo, "Sales dispatch");
    }
  }
  await prisma.activity.create({ data: { userId: req.user.id, action: "CREATE_SALE", entityType: "Sale", entityId: sale.id } });
  res.status(201).json(sale);
});

router.get("/report/monthly", requirePermission("reports:view"), async (_req, res) => {
  const rows = await prisma.sale.findMany({ select: { saleDate: true, totalAmount: true, profitAmount: true } });
  const summary = {};
  rows.forEach((row) => {
    const key = `${row.saleDate.getFullYear()}-${String(row.saleDate.getMonth() + 1).padStart(2, "0")}`;
    summary[key] = summary[key] || { month: key, sales: 0, profit: 0 };
    summary[key].sales += row.totalAmount;
    summary[key].profit += row.profitAmount;
  });
  res.json(Object.values(summary));
});

export default router;
