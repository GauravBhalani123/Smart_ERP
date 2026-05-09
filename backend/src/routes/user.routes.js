import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

router.patch("/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["ADMIN", "MANAGER", "STAFF"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, fullName: true, email: true, role: true, isActive: true },
  });
  return res.json(user);
});

export default router;
