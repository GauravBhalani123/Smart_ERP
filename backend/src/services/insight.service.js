import { prisma } from "../lib/prisma.js";
import { getMarketSnapshot } from "./market.service.js";
import { latestPredictions } from "./prediction.service.js";
import { sendEmail } from "./email.service.js";

export async function generateBusinessInsights() {
  const [market, predictions, lowStock] = await Promise.all([
    getMarketSnapshot(),
    latestPredictions(),
    prisma.inventory.findMany({
      where: { status: { in: ["LOW", "CRITICAL", "OUT"] } },
      include: { product: true },
      take: 20,
    }),
  ]);

  const insights = [];
  for (const m of market) {
    if (m.changePct >= 2) {
      insights.push(`Purchase caution: ${m.material} increased by ${m.changePct}%`);
    }
    if (m.changePct <= -2) {
      insights.push(`Purchase opportunity: ${m.material} dropped by ${Math.abs(m.changePct)}%`);
    }
  }
  if (lowStock.length > 0) {
    insights.push(`Low stock alert on ${lowStock.length} products. Prioritize replenishment.`);
  }
  predictions.slice(0, 3).forEach((p) => insights.push(p.title));

  for (const text of insights.slice(0, 8)) {
    await prisma.notification.create({
      data: { type: "AI_INSIGHT", title: "AI Business Insight", message: text },
    });
  }
  return insights;
}

export async function sendDailyInsightEmail(recipient) {
  if (!recipient) return { skipped: true, reason: "No recipient configured" };
  const insights = await generateBusinessInsights();
  return sendEmail({
    to: recipient,
    subject: "Daily ERP AI Insight Report",
    text: insights.length ? insights.map((x, i) => `${i + 1}. ${x}`).join("\n") : "No major insights today.",
  });
}
