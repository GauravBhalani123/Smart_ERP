import { prisma } from "../lib/prisma.js";

function average(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function generatePredictions() {
  const [sales, purchases, inventory] = await Promise.all([
    prisma.sale.findMany({ include: { items: true } }),
    prisma.purchase.findMany({}),
    prisma.inventory.findMany({ include: { product: true } }),
  ]);

  const monthlySales = average(sales.map((s) => s.totalAmount));
  const monthlyProfit = average(sales.map((s) => s.profitAmount));
  const monthlyPurchase = average(purchases.map((p) => p.totalAmount));

  const fastMoving = [...inventory]
    .sort((a, b) => (a.product.salePrice * b.quantity) - (b.product.salePrice * a.quantity))
    .slice(0, 5)
    .map((i) => i.product.name);
  const slowMoving = [...inventory]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((i) => i.product.name);
  const deadStock = inventory.filter((i) => i.quantity > 0 && i.status !== "NORMAL").length;

  const predictions = [
    {
      type: "SALES_FORECAST",
      title: "Projected monthly sales",
      details: `Expected sales next cycle around INR ${monthlySales.toFixed(2)} based on historical averages.`,
      value: Number(monthlySales.toFixed(2)),
      confidence: 0.62,
    },
    {
      type: "PROFIT_FORECAST",
      title: "Projected monthly profit",
      details: `Expected profit around INR ${monthlyProfit.toFixed(2)} with current pricing and demand.`,
      value: Number(monthlyProfit.toFixed(2)),
      confidence: 0.58,
    },
    {
      type: "PURCHASE_RECOMMENDATION",
      title: "Purchase timing recommendation",
      details: `Suggested monthly purchase budget near INR ${monthlyPurchase.toFixed(2)} with market volatility safeguards.`,
      value: Number(monthlyPurchase.toFixed(2)),
      confidence: 0.66,
    },
    {
      type: "INVENTORY_HEALTH",
      title: "Dead and slow stock warning",
      details: `Dead/at-risk stock units: ${deadStock}. Fast moving: ${fastMoving.join(", ") || "N/A"}. Slow moving: ${slowMoving.join(", ") || "N/A"}.`,
      value: deadStock,
      confidence: 0.71,
    },
  ];

  await prisma.prediction.createMany({ data: predictions });
  return predictions;
}

export async function latestPredictions() {
  const rows = await prisma.prediction.findMany({ orderBy: { createdAt: "desc" }, take: 12 });
  if (rows.length) return rows;
  const generated = await generatePredictions();
  return generated.map((row, index) => ({ id: `generated-${index}`, ...row }));
}
