import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { getMarketSnapshot, ingestMarketPrices } from "../../services/market.service.js";
import { generatePredictions, latestPredictions } from "../../services/prediction.service.js";
import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "../../services/email.service.js";

const router = Router();
router.use(requireAuth);

router.get("/prices", requirePermission("reports:view"), async (_req, res) => {
  const data = await getMarketSnapshot();
  res.json(data);
});

router.post("/prices/fetch", requirePermission("reports:view"), async (_req, res) => {
  const data = await ingestMarketPrices();
  const alerts = data.filter((x) => Math.abs(x.changePct) >= 2);
  for (const row of alerts) {
    await prisma.notification.create({
      data: {
        type: "MARKET_ALERT",
        title: `Market ${row.trend}: ${row.material}`,
        message: `${row.material} changed ${row.changePct}% to ${row.price} ${row.unit}.`,
      },
    });
  }
  res.json({ fetched: data.length, alerts: alerts.length, data });
});

router.get("/predictions", requirePermission("reports:view"), async (_req, res) => {
  const data = await latestPredictions();
  res.json(data);
});

router.post("/predictions/run", requirePermission("reports:view"), async (_req, res) => {
  const data = await generatePredictions();
  res.json(data);
});

router.post("/alerts/email", requirePermission("reports:view"), async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: "Recipient email required" });
  const market = await getMarketSnapshot();
  const text = market.map((m) => `${m.material}: ${m.price} ${m.unit} (${m.changePct}%)`).join("\n");
  const emailStatus = await sendEmail({ to, subject: "Market trend alerts", text });
  res.json({ emailStatus });
});

export default router;
