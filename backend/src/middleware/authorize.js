const permissionsByRole = {
  ADMIN: ["*"],
  MANAGER: [
    "dashboard:view",
    "sales:view",
    "sales:manage",
    "purchases:manage",
    "inventory:view",
    "inventory:manage",
    "reports:view",
    "ai:chat",
  ],
  // Keep STAFF usable out-of-the-box so new registrations can create and save core data.
  STAFF: [
    "dashboard:view",
    "sales:view",
    "sales:manage",
    "purchases:manage",
    "inventory:view",
    "inventory:manage",
    "reports:view",
  ],
};

export function can(role, permission) {
  const perms = permissionsByRole[role] || [];
  return perms.includes("*") || perms.includes(permission);
}

export function getRolePermissions(role) {
  return permissionsByRole[role] || [];
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!can(req.user.role, permission)) return res.status(403).json({ message: "Insufficient permission" });
    next();
  };
}
