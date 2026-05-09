import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { upsertInventory } from "../../services/stock.service.js";

const router = Router();
router.use(requireAuth);

router.get("/categories", requirePermission("inventory:view"), async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
});

router.post("/categories", requirePermission("inventory:manage"), async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json(category);
});

router.put("/categories/:id", requirePermission("inventory:manage"), async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
  res.json(category);
});

router.delete("/categories/:id", requirePermission("inventory:manage"), async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

router.get("/products", requirePermission("inventory:view"), async (req, res) => {
  const { q, categoryId, status } = req.query;
  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {},
        categoryId ? { categoryId } : {},
        status ? { inventory: { status } } : {},
      ],
    },
    include: { category: true, inventory: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

router.post("/products", requirePermission("inventory:manage"), async (req, res) => {
  const { initialStock = 0, ...payload } = req.body;
  const product = await prisma.product.create({ data: payload, include: { inventory: true, category: true } });
  if (initialStock > 0) {
    await upsertInventory(product.id, Number(initialStock), "INITIAL_STOCK", "PRODUCT_CREATE", "Initial stock");
  }
  const fullProduct = await prisma.product.findUnique({ where: { id: product.id }, include: { inventory: true, category: true } });
  res.status(201).json(fullProduct);
});

router.put("/products/:id", requirePermission("inventory:manage"), async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
    include: { category: true, inventory: true },
  });
  res.json(product);
});

router.delete("/products/:id", requirePermission("inventory:manage"), async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
});

router.get("/inventory", requirePermission("inventory:view"), async (_req, res) => {
  const rows = await prisma.inventory.findMany({
    include: { product: { include: { category: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const cards = {
    totalProducts: rows.length,
    outOfStock: rows.filter((r) => r.status === "OUT").length,
    critical: rows.filter((r) => r.status === "CRITICAL").length,
    low: rows.filter((r) => r.status === "LOW").length,
  };
  res.json({ cards, rows });
});

router.post("/inventory/movement", requirePermission("inventory:manage"), async (req, res) => {
  const { productId, quantity, type = "MANUAL", reference, notes } = req.body;
  const inventory = await upsertInventory(productId, Number(quantity), type, reference, notes);
  res.status(201).json(inventory);
});

router.get("/inventory/movements", requirePermission("inventory:view"), async (_req, res) => {
  const movements = await prisma.stockMovement.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json(movements);
});

router.post("/production/convert", requirePermission("inventory:manage"), async (req, res) => {
  const { outputProductId, outputQuantity, inputs = [], notes } = req.body;
  const qtyOut = Number(outputQuantity || 0);
  if (!outputProductId || qtyOut <= 0 || !Array.isArray(inputs) || inputs.length === 0) {
    return res.status(400).json({ message: "outputProductId, outputQuantity and inputs are required" });
  }

  const outputProduct = await prisma.product.findUnique({ where: { id: outputProductId }, include: { category: true } });
  if (!outputProduct) return res.status(404).json({ message: "Output product not found" });
  const outCategory = (outputProduct.category?.name || "").toLowerCase();
  if (!outCategory.includes("finished")) {
    return res.status(400).json({ message: "Output product must belong to Finished category" });
  }

  // Consume raw + packing inputs
  for (const item of inputs) {
    const p = await prisma.product.findUnique({ where: { id: item.productId }, include: { category: true } });
    if (!p) return res.status(404).json({ message: "Input product not found" });
    const cName = (p.category?.name || "").toLowerCase();
    const isAllowedInput = cName.includes("raw") || cName.includes("packing");
    if (!isAllowedInput) {
      return res.status(400).json({ message: `${p.name} is not raw/packing category` });
    }
    const consumeQty = Number(item.quantity || 0);
    if (consumeQty <= 0) return res.status(400).json({ message: "Input quantity must be > 0" });
    await upsertInventory(p.id, -consumeQty, "PRODUCTION_CONSUME", outputProduct.sku, notes || "Production batch consume");
  }

  // Add finished output
  const result = await upsertInventory(
    outputProductId,
    qtyOut,
    "PRODUCTION_OUTPUT",
    outputProduct.sku,
    notes || "Production finished goods",
  );

  await prisma.activity.create({
    data: {
      userId: req.user.id,
      action: "PRODUCTION_CONVERT",
      entityType: "Product",
      entityId: outputProductId,
      details: `Produced ${qtyOut} of ${outputProduct.name}`,
    },
  });

  res.json({ message: "Production conversion completed", inventory: result });
});

export default router;
