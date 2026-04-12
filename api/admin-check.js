import { checkRateLimit, detectBotRisk, getAdminAccess, getAuthedUser, getIp, setSecurityHeaders, writeAuditLog } from "./_security.js";

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (detectBotRisk(req)) return res.status(403).json({ error: "Blocked request" });

  const limit = await checkRateLimit(req, { maxPerMinute: 60, namespace: "admin-check" });
  if (!limit.ok) return res.status(429).json({ error: limit.error });

  const { user, error } = await getAuthedUser(req);
  if (!user) {
    await writeAuditLog({ action: "admin_check", status: "unauthorized", details: error || "unauthorized", ip: getIp(req) });
    return res.status(401).json({ error: error || "Unauthorized" });
  }

  const access = await getAdminAccess(user);
  if (!access.ok) {
    await writeAuditLog({ userId: user.id, email: user.email, action: "admin_check", status: "denied", details: "not admin", ip: getIp(req) });
    return res.status(403).json({ error: "Admin access denied" });
  }

  await writeAuditLog({ userId: user.id, email: user.email, action: "admin_check", status: "ok", details: access.role, ip: getIp(req) });

  return res.status(200).json({ ok: true, email: user.email, role: access.role, isSuperAdmin: access.role === "super_admin" });
}
