import { checkRateLimit, detectBotRisk, getAuthedUser, getIp, isAdminUser, setSecurityHeaders, writeAuditLog } from "./_security.js";

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (detectBotRisk(req)) return res.status(403).json({ error: "Blocked request" });

  const limit = await checkRateLimit(req, { maxPerMinute: 30, namespace: "ai-generate" });
  if (!limit.ok) return res.status(429).json({ error: limit.error });

  const { user, error: authError } = await getAuthedUser(req);
  if (!user) {
    await writeAuditLog({ action: "ai_generate", status: "unauthorized", details: authError || "unauthorized", ip: getIp(req) });
    return res.status(401).json({ error: authError || "Unauthorized" });
  }

  const { prompt, scope } = req.body || {};
  if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "Prompt required" });
  if (prompt.length > 6000) return res.status(400).json({ error: "Prompt too long" });

  if (scope === "admin" && !isAdminUser(user)) {
    await writeAuditLog({ userId: user.id, email: user.email, action: "ai_generate_admin_scope", status: "denied", details: "admin scope denied", ip: getIp(req) });
    return res.status(403).json({ error: "Admin access required" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server AI key missing" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    const data = await response.json();
    if (!response.ok || !data.choices) {
      await writeAuditLog({ userId: user.id, email: user.email, action: "ai_generate", status: "failed", details: "provider response invalid", ip: getIp(req) });
      return res.status(400).json({ error: "AI request failed" });
    }
    await writeAuditLog({ userId: user.id, email: user.email, action: "ai_generate", status: "ok", details: `scope=${scope || "user"}`, ip: getIp(req) });
    return res.status(200).json({ content: data.choices[0].message.content });
  } catch {
    await writeAuditLog({ userId: user.id, email: user.email, action: "ai_generate", status: "error", details: "exception", ip: getIp(req) });
    return res.status(500).json({ error: "AI service unavailable" });
  }
}
