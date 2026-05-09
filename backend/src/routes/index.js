import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import catalogRoutes from "./modules/catalog.routes.js";
import partiesRoutes from "./modules/parties.routes.js";
import purchasesRoutes from "./modules/purchases.routes.js";
import salesRoutes from "./modules/sales.routes.js";
import invoiceRoutes from "./modules/invoice.routes.js";
import notificationsRoutes from "./modules/notifications.routes.js";
import aiRoutes from "./modules/ai.routes.js";
import marketRoutes from "./modules/market.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/catalog", catalogRoutes);
router.use("/parties", partiesRoutes);
router.use("/purchases", purchasesRoutes);
router.use("/sales", salesRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/ai", aiRoutes);
router.use("/market", marketRoutes);

export default router;
