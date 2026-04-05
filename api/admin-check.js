import { checkRateLimit, detectBotRisk, getAuthedUser, getIp, isAdminFromDb, isAdminUser, setSecurityHeaders, writeAuditLog } from "./_security.js";

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

  const admin = isAdminUser(user) || await isAdminFromDb(user);
  if (!admin) {
    await writeAuditLog({ userId: user.id, email: user.email, action: "admin_check", status: "denied", details: "not admin", ip: getIp(req) });
    return res.status(403).json({ error: "Admin access denied" });
  }

  await writeAuditLog({ userId: user.id, email: user.email, action: "admin_check", status: "ok", ip: getIp(req) });

  return res.status(200).json({ ok: true, email: user.email });
}
