import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { getRolePermissions } from "../middleware/authorize.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const user = await prisma.user.create({
      data: { fullName, email, passwordHash: await hashPassword(password), role: "STAFF" },
      select: { id: true, fullName: true, email: true, role: true },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return res.status(201).json({ token, user });
  } catch {
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // Keep default bootstrap admin always privileged.
    if (email.toLowerCase() === "admin@erp.local" && user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    const token = signToken({ userId: user.id, role: user.role });
    return res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) =>
  res.json({ user: req.user, permissions: getRolePermissions(req.user.role) }),
);

router.patch("/profile", requireAuth, async (req, res) => {
  const { fullName, email, currentPassword, newPassword } = req.body;
  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: "currentPassword is required to set new password" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Current password is invalid" });
    updateData.passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: { id: true, fullName: true, email: true, role: true, isActive: true },
  });
  return res.json({ user: updated });
});

router.post("/logout", (_req, res) => res.json({ message: "Logged out" }));

export default router;
