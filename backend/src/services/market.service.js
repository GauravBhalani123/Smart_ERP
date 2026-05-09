import { prisma } from "../lib/prisma.js";

const DEFAULT_MATERIALS = [
  { material: "PVC", base: 102, source: "globalCommodityFeed" },
  { material: "Plastic Raw Material", base: 118, source: "globalCommodityFeed" },
  { material: "Steel", base: 64, source: "globalCommodityFeed" },
];

function randomWalk(base) {
  const change = (Math.random() * 6 - 3) / 100;
  const price = Number((base * (1 + change)).toFixed(2));
  return { price, changePct: Number((change * 100).toFixed(2)) };
}

function trendFromChange(changePct) {
  if (changePct > 1) return "UP";
  if (changePct < -1) return "DOWN";
  return "STABLE";
}

export async function ingestMarketPrices() {
  const latest = await prisma.marketPrice.findMany({
    orderBy: { capturedAt: "desc" },
    distinct: ["material"],
  });
  const latestByMaterial = new Map(latest.map((x) => [x.material, x]));
  const entries = [];
  for (const row of DEFAULT_MATERIALS) {
    const previous = latestByMaterial.get(row.material);
    const base = previous?.price || row.base;
    const next = randomWalk(base);
    entries.push({
      material: row.material,
      source: row.source,
      unit: "INR/kg",
      price: next.price,
      changePct: next.changePct,
      trend: trendFromChange(next.changePct),
    });
  }
  await prisma.marketPrice.createMany({ data: entries });
  return entries;
}

export async function getMarketSnapshot() {
  let latestRows = await prisma.marketPrice.findMany({
    orderBy: { capturedAt: "desc" },
    distinct: ["material"],
  });
  if (!latestRows.length) {
    await ingestMarketPrices();
    latestRows = await prisma.marketPrice.findMany({
      orderBy: { capturedAt: "desc" },
      distinct: ["material"],
    });
  }
  return latestRows.sort((a, b) => a.material.localeCompare(b.material));
}
