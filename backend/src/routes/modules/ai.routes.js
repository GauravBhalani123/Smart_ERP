import { Router } from "express";
import multer from "multer";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { askOpenRouter } from "../../services/ai.service.js";
import { latestPredictions } from "../../services/prediction.service.js";
import { getMarketSnapshot } from "../../services/market.service.js";
import { transcribeAudio } from "../../services/voice.service.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(requireAuth);

router.post("/chat", requirePermission("ai:chat"), async (req, res) => {
  const { prompt, language = "en", conversationId } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt is required" });
  const result = await askOpenRouter({ userId: req.user.id, prompt, language, conversationId });
  res.json(result);
});

router.get("/chat/history", requirePermission("ai:chat"), async (req, res) => {
  const list = await prisma.aIConversation.findMany({
    where: { userId: req.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });
  res.json(list);
});

router.get("/insights", requirePermission("reports:view"), async (_req, res) => {
  const [predictions, market, alerts] = await Promise.all([
    latestPredictions(),
    getMarketSnapshot(),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  res.json({ predictions, market, alerts });
});

router.post("/voice/transcribe", requirePermission("ai:chat"), upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Audio file is required" });
  const language = req.body.language || "en";
  const text = await transcribeAudio(req.file.buffer, req.file.originalname || "voice.webm", language);
  res.json({ text });
});

export default router;
