const ipBuckets = globalThis.__mockiesIpBuckets || new Map();
globalThis.__mockiesIpBuckets = ipBuckets;

function getEnv(name, fallback) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

export function getSupabaseConfig() {
  const url = getEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const anon = getEnv("SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
  if (!url || !anon) {
    throw new Error("Server Supabase env missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }
  return { url, anon };
}

export function getServiceRoleConfig() {
  const { url } = getSupabaseConfig();
  const serviceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return { url, serviceRole };
}

export function getIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(String(email).toLowerCase());
}

export function isAdminUser(user) {
  if (!user) return false;
  const appMeta = user.app_metadata || {};
  const userMeta = user.user_metadata || {};
  const roles = [appMeta.role, userMeta.role, appMeta.roles, userMeta.roles]
    .flat()
    .filter(Boolean)
    .map((r) => String(r).toLowerCase());
  const claimAdmin = appMeta.is_admin === true || userMeta.is_admin === true || roles.includes("admin");
  return claimAdmin || isAdminEmail(user.email);
}

export async function getAdminAccess(user) {
  if (!user) return { ok: false, role: null, source: "none" };
  if (isAdminUser(user)) {
    const isSuper = String(user.email || "").toLowerCase() === String(process.env.SUPER_ADMIN_EMAIL || "").toLowerCase();
    return { ok: true, role: isSuper ? "super_admin" : "admin", source: "claims" };
  }

  const { url, serviceRole } = getServiceRoleConfig();
  if (!serviceRole) return { ok: false, role: null, source: "db" };

  try {
    const filters = [];
    if (user.id) filters.push(`user_id.eq.${user.id}`);
    if (user.email) filters.push(`email.eq.${encodeURIComponent(String(user.email).toLowerCase())}`);
    if (filters.length === 0) return { ok: false, role: null, source: "db" };

    let response = await fetch(
      `${url}/rest/v1/admin_users?select=id,role,is_active&or=(${filters.join(",")})&is_active=eq.true&limit=1`,
      {
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`
        }
      }
    );

    if (!response.ok) {
      response = await fetch(
        `${url}/rest/v1/admin_users?select=id&or=(${filters.join(",")})&limit=1`,
        {
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`
          }
        }
      );
    }
    if (!response.ok) return { ok: false, role: null, source: "db" };
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, role: null, source: "db" };

    const role = String(rows[0].role || "admin").toLowerCase();
    return { ok: true, role: role === "super_admin" ? "super_admin" : "admin", source: "db" };
  } catch {
    return { ok: false, role: null, source: "db" };
  }
}

export async function isAdminFromDb(user) {
  const access = await getAdminAccess(user);
  return access.ok;
}

export async function getAuthedUser(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return { user: null, error: "Missing auth token" };

  const { url, anon } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${token}` }
  });
  const payload = await response.json();
  if (!response.ok) {
    return { user: null, error: payload?.msg || payload?.error_description || "Invalid auth token" };
  }
  return { user: payload, error: null };
}

function memoryRateLimit(req, { maxPerMinute = 25 }) {
  const ip = getIp(req);
  const nowMinute = Math.floor(Date.now() / 60000);
  const key = `${ip}:${nowMinute}`;
  const count = (ipBuckets.get(key) || 0) + 1;
  ipBuckets.set(key, count);

  if (count > maxPerMinute) return { ok: false, error: "Rate limit exceeded. Please try again shortly." };

  if (ipBuckets.size > 2000) {
    for (const bucketKey of ipBuckets.keys()) {
      if (!bucketKey.endsWith(`:${nowMinute}`)) ipBuckets.delete(bucketKey);
    }
  }

  return { ok: true };
}

export async function checkRateLimit(req, { maxPerMinute = 25, namespace = "api" } = {}) {
  const mem = memoryRateLimit(req, { maxPerMinute });
  const { url, serviceRole } = getServiceRoleConfig();
  if (!serviceRole) return mem;

  try {
    const bucket = `${namespace}:${getIp(req)}`;
    const rpcRes = await fetch(`${url}/rest/v1/rpc/check_rate_limit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`
      },
      body: JSON.stringify({ p_key: bucket, p_limit: maxPerMinute, p_window_seconds: 60 })
    });

    if (rpcRes.ok) {
      const payload = await rpcRes.json();
      if (payload === true) return { ok: true };
      return { ok: false, error: "Rate limit exceeded. Please try again shortly." };
    }
  } catch {
    // fall back to memory limiter
  }

  return mem;
}

export async function writeAuditLog({ userId = null, email = null, action = "unknown", status = "ok", details = null, ip = null }) {
  const { url, serviceRole } = getServiceRoleConfig();
  if (!serviceRole) return;

  try {
    await fetch(`${url}/rest/v1/api_audit_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        user_id: userId,
        email,
        action,
        status,
        details,
        ip_address: ip
      })
    });
  } catch {
    // no-op
  }
}

export function detectBotRisk(req) {
  const ua = String(req.headers["user-agent"] || "").toLowerCase();
  if (!ua) return true;
  const blocked = ["curl", "wget", "python-requests", "postmanruntime", "insomnia", "httpclient"];
  return blocked.some((token) => ua.includes(token));
}

export function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}
