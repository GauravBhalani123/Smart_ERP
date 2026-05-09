import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { getMarketSnapshot } from "./market.service.js";
import { latestPredictions } from "./prediction.service.js";

function langInstruction(language) {
  if (language === "gu") return "Respond in Gujarati.";
  if (language === "hi") return "Respond in Hindi.";
  return "Respond in English.";
}

async function erpContextSummary() {
  const [inventory, sales, purchases, notifications, market, predictions] = await Promise.all([
    prisma.inventory.findMany({ include: { product: true }, take: 50 }),
    prisma.sale.findMany({ orderBy: { saleDate: "desc" }, take: 20 }),
    prisma.purchase.findMany({ orderBy: { purchaseDate: "desc" }, take: 20 }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    getMarketSnapshot(),
    latestPredictions(),
  ]);
  return JSON.stringify({
    inventoryAlerts: inventory.filter((i) => i.status !== "NORMAL").map((x) => ({ product: x.product.name, qty: x.quantity, status: x.status })),
    recentSalesTotal: sales.reduce((a, s) => a + s.totalAmount, 0),
    recentPurchaseTotal: purchases.reduce((a, p) => a + p.totalAmount, 0),
    market,
    latestPredictionTitles: predictions.slice(0, 5).map((p) => p.title),
    latestNotifications: notifications.slice(0, 5).map((n) => n.title),
  });
}

export async function askOpenRouter({ userId, prompt, language = "en", conversationId }) {
  const conversation =
    conversationId
      ? await prisma.aIConversation.findUnique({ where: { id: conversationId }, include: { messages: { orderBy: { createdAt: "asc" } } } })
      : await prisma.aIConversation.create({ data: { userId, language, title: prompt.slice(0, 60) } });

  const context = await erpContextSummary();
  const history = conversation.messages || [];
  const body = {
    model: env.openRouterModel,
    messages: [
      {
        role: "system",
        content:
          "You are an ERP business intelligence assistant. Give concise and practical recommendations for inventory, sales, purchases, pricing and invoices. Use company data context.",
      },
      {
        role: "system",
        content: `${langInstruction(language)} ERP Context: ${context}`,
      },
      ...history.map((m) => ({ role: m.role.toLowerCase(), content: m.content })),
      { role: "user", content: prompt },
    ],
  };

  let content = "AI unavailable: OPENROUTER_API_KEY is not configured.";
  if (env.openRouterApiKey) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    content = data?.choices?.[0]?.message?.content || "No response from model.";
  }

  await prisma.aIMessage.createMany({
    data: [
      { conversationId: conversation.id, role: "USER", content: prompt },
      { conversationId: conversation.id, role: "ASSISTANT", content },
    ],
  });

  await prisma.aILog.create({
    data: { userId, prompt, response: content, model: env.openRouterModel, metadata: JSON.stringify({ language }) },
  });

  return { conversationId: conversation.id, answer: content };
}
