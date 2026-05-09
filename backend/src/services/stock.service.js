import { prisma } from "../lib/prisma.js";

export function getStockStatus(quantity, reorderLevel, criticalLevel) {
  if (quantity <= 0) return "OUT";
  if (quantity <= criticalLevel) return "CRITICAL";
  if (quantity <= reorderLevel) return "LOW";
  return "NORMAL";
}

export async function upsertInventory(productId, delta, type, reference, notes) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const existing = await prisma.inventory.findUnique({ where: { productId } });
  const currentQty = existing?.quantity ?? 0;
  const nextQty = currentQty + delta;
  if (nextQty < 0) throw new Error(`Insufficient stock for ${product.name}`);

  const status = getStockStatus(nextQty, product.reorderLevel, product.criticalLevel);
  const inventory = await prisma.inventory.upsert({
    where: { productId },
    update: { quantity: nextQty, status },
    create: { productId, quantity: nextQty, status },
  });

  await prisma.stockMovement.create({
    data: { productId, type, quantity: delta, reference, notes },
  });

  if (status !== "NORMAL") {
    await prisma.notification.create({
      data: {
        type: "STOCK_ALERT",
        title: `Stock ${status.toLowerCase()}: ${product.name}`,
        message: `${product.name} (${product.sku}) stock is now ${nextQty}.`,
      },
    });
  }

  return inventory;
}
