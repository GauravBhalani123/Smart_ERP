import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
