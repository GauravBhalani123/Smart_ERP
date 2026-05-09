import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { upsertInventory } from "../../services/stock.service.js";

const router = Router();
router.use(requireAuth);

function purchaseNumber() {
  return `PUR-${Date.now()}`;
}

router.get("/", requirePermission("purchases:manage"), async (_req, res) => {
  const rows = await prisma.purchase.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { purchaseDate: "desc" },
  });
  res.json(rows);
});

router.post("/", requirePermission("purchases:manage"), async (req, res) => {
  const { supplierId, items = [], taxRate = 18, notes, status = "RECEIVED" } = req.body;
  if (!supplierId || items.length === 0) return res.status(400).json({ message: "Supplier and items are required" });

  const products = await prisma.product.findMany({ where: { id: { in: items.map((x) => x.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;

  const lineItems = items.map((item) => {
    const p = byId.get(item.productId);
    if (!p) throw new Error("Invalid product in purchase");
    const lineTotal = Number(item.quantity) * Number(item.unitCost ?? p.costPrice);
    subtotal += lineTotal;
    return {
      productId: p.id,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost ?? p.costPrice),
      lineTotal,
    };
  });
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const totalAmount = subtotal + taxAmount;

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNo: purchaseNumber(),
      supplierId,
      status,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      items: { create: lineItems },
    },
    include: { items: true, supplier: true },
  });

  if (status === "RECEIVED") {
    for (const item of lineItems) {
      await upsertInventory(item.productId, item.quantity, "PURCHASE_IN", purchase.purchaseNo, "Purchase received");
    }
  }

  await prisma.activity.create({
    data: { userId: req.user.id, action: "CREATE_PURCHASE", entityType: "Purchase", entityId: purchase.id },
  });
  res.status(201).json(purchase);
});

router.get("/report/monthly", requirePermission("reports:view"), async (_req, res) => {
  const rows = await prisma.purchase.findMany({ select: { purchaseDate: true, totalAmount: true } });
  const summary = {};
  rows.forEach((row) => {
    const key = `${row.purchaseDate.getFullYear()}-${String(row.purchaseDate.getMonth() + 1).padStart(2, "0")}`;
    summary[key] = (summary[key] || 0) + row.totalAmount;
  });
  res.json(Object.entries(summary).map(([month, total]) => ({ month, total })));
});

export default router;
