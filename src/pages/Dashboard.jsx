import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Outfit',sans-serif;background:#030508;color:#EEF2FF;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#030508;} ::-webkit-scrollbar-thumb{background:#162840;border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  @keyframes countUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .fade-up{animation:fadeUp 0.45s ease forwards;}
  .fade-in{animation:fadeIn 0.3s ease forwards;}
  .spinner{display:inline-block;width:36px;height:36px;border:3px solid #162840;border-top-color:#E8B84B;border-radius:50%;animation:spin 0.9s linear infinite;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;transition:all 0.2s;color:#6A8CAC;font-size:13px;font-weight:600;border:1px solid transparent;}
  .nav-item:hover{background:#E8B84B08;color:#E8B84B;border-color:#E8B84B1A;}
  .nav-item.active{background:#E8B84B14;color:#E8B84B;border-color:#E8B84B33;font-weight:700;}
  .card{background:#090E18;border:1px solid #0F1C2E;border-radius:16px;padding:20px 22px;transition:border-color 0.2s;}
  .card:hover{border-color:#E8B84B22;}
  .btn{padding:9px 20px;border-radius:9px;border:none;font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.15s;}
  .btn:hover{transform:translateY(-1px);}
  .btn-gold{background:linear-gradient(135deg,#E8B84B,#C89030);color:#030508;}
  .btn-ghost{background:transparent;border:1px solid #162840;color:#7090B0;}
  .btn-ghost:hover{border-color:#E8B84B44;color:#E8B84B;}
  .tbl-row{display:grid;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid #0F1C2E;background:#06090F;transition:all 0.18s;font-size:13px;}
  .tbl-row:hover{border-color:#E8B84B33;background:#0C1220;}
`;

function Mono({ children, color = "#E8B84B", size = 13 }) {
  return <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: size, color, fontWeight: 600 }}>{children}</span>;
}
function Tag({ children, color }) {
  return <span style={{ background: color + "1A", color, border: `1px solid ${color}30`, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{children}</span>;
}
function Bar({ pct, color = "#E8B84B", h = 6 }) {
  return (
    <div style={{ background: "#162840", borderRadius: 999, height: h, overflow: "hidden" }}>
      <div style={{ height: "100%", background: `linear-gradient(90deg,${color},${color}99)`, width: `${Math.min(pct, 100)}%`, borderRadius: 999, transition: "width 1.2s ease" }} />
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState("home");

  useEffect(() => {
    const init = async () => {
      // Check login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      // Load profile
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);

      // Load test attempts with test details
      const { data: att } = await supabase
        .from("test_attempts")
        .select("*, tests(name, exam, type, time_limit)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      setAttempts(att || []);

      // Load available tests
      const { data: t } = await supabase.from("tests").select("*").eq("status", "published");
      setTests(t || []);

      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#030508", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div className="spinner" />
        <div style={{ color: "#7090B0", fontSize: 14 }}>Loading your dashboard...</div>
      </div>
    </>
  );

  // ── STATS ──────────────────────────────────────────────────────────────────
  const totalTests  = attempts.length;
  const avgScore    = totalTests > 0 ? Math.round(attempts.reduce((a, t) => a + (t.score || 0), 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round(attempts.reduce((a, t) => a + (t.accuracy || 0), 0) / totalTests) : 0;
  const bestScore   = totalTests > 0 ? Math.max(...attempts.map(t => t.score || 0)) : 0;
  const firstName   = (profile?.full_name || user?.email || "Student").split(" ")[0];

  const nav = [
    { id: "home",     icon: "⊞",  label: "Dashboard"   },
    { id: "tests",    icon: "📋",  label: "Take a Test"  },
    { id: "history",  icon: "📊",  label: "My Results"   },
    { id: "profile",  icon: "👤",  label: "Profile"      },
  ];

  // ── SIDEBAR ────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside style={{ width: 220, background: "#06090F", borderRight: "1px solid #0F1C2E", display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
      <div style={{ padding: "4px 6px 20px" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: "#E8B84B", letterSpacing: 2 }}>EXAMACE</div>
        <div style={{ fontSize: 9, color: "#2A4060", letterSpacing: 2, marginTop: 2 }}>STUDENT PORTAL</div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {nav.map(n => (
          <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ borderTop: "1px solid #0F1C2E", paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#E8B84B,#C89030)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#030508", flexShrink: 0 }}>
          {firstName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#7090B0", fontSize: 11, cursor: "pointer", padding: 0, fontFamily: "'Outfit',sans-serif" }}>Sign out</button>
        </div>
      </div>
    </aside>
  );

  // ── HOME PAGE ──────────────────────────────────────────────────────────────
  const HomePage = () => (
    <div style={{ padding: 28, maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#7090B0", letterSpacing: 2, marginBottom: 6 }}>WELCOME BACK</div>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hello, <span style={{ color: "#E8B84B" }}>{firstName}!</span> 👋</h1>
        <p style={{ color: "#7090B0", fontSize: 14, marginTop: 4 }}>
          {totalTests === 0 ? "Take your first mock test to get started!" : `You have taken ${totalTests} test${totalTests > 1 ? "s" : ""}. Keep going!`}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          ["📝", "Tests Taken",   totalTests,          "#38BDF8"],
          ["⭐", "Avg Score",     avgScore,             "#E8B84B"],
          ["🎯", "Avg Accuracy",  avgAccuracy + "%",    "#34D399"],
          ["🏆", "Best Score",    bestScore,            "#A78BFA"],
        ].map(([icon, label, val, color], i) => (
          <div key={label} className="card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 12, color: "#7090B0", marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent attempts + Available tests */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent results */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Results</div>
            <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 11 }} onClick={() => setPage("history")}>View all</button>
          </div>
          {attempts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#7090B0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
              <div style={{ fontSize: 13 }}>No tests taken yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attempts.slice(0, 4).map((a, i) => (
                <div key={a.id} style={{ padding: "10px 12px", background: "#06090F", borderRadius: 10, border: "1px solid #0F1C2E" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                      {a.tests?.name || "Test"}
                    </div>
                    <Mono size={14} color={a.accuracy >= 70 ? "#34D399" : a.accuracy >= 50 ? "#E8B84B" : "#F87171"}>{a.score}</Mono>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7090B0" }}>
                    <span>Accuracy: {a.accuracy}%</span>
                    <span>{new Date(a.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <Bar pct={a.accuracy} color={a.accuracy >= 70 ? "#34D399" : a.accuracy >= 50 ? "#E8B84B" : "#F87171"} h={4} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available tests */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Available Tests</div>
            <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 11 }} onClick={() => setPage("tests")}>View all</button>
          </div>
          {tests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#7090B0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 13 }}>No tests published yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tests.slice(0, 4).map((t, i) => (
                <div key={t.id} style={{ padding: "12px 14px", background: "#06090F", borderRadius: 10, border: "1px solid #0F1C2E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Tag color="#E8B84B">{t.exam}</Tag>
                      <Tag color="#7090B0">⏱ {t.time_limit}m</Tag>
                    </div>
                  </div>
                  <button className="btn btn-gold" style={{ padding: "6px 14px", fontSize: 12, flexShrink: 0, marginLeft: 10 }} onClick={() => window.location.href = "/test"}>
                    Start →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick action */}
      {totalTests === 0 && (
        <div style={{ marginTop: 16, background: "linear-gradient(135deg, #0C1420, #080E18)", border: "1px solid #E8B84B33", borderRadius: 18, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>🚀 Ready to start?</div>
            <div style={{ color: "#7090B0", fontSize: 14 }}>Take your first mock test and see where you stand!</div>
          </div>
          <button className="btn btn-gold" style={{ fontSize: 15, padding: "12px 28px", flexShrink: 0 }} onClick={() => window.location.href = "/test"}>
            Take First Test →
          </button>
        </div>
      )}
    </div>
  );

  // ── HISTORY PAGE ───────────────────────────────────────────────────────────
  const HistoryPage = () => (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>My Test Results</h2>
      <p style={{ color: "#7090B0", fontSize: 13, marginBottom: 24 }}>{attempts.length} tests completed</p>

      {attempts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#090E18", borderRadius: 20, border: "1px solid #0F1C2E" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No results yet</div>
          <div style={{ color: "#7090B0", fontSize: 14, marginBottom: 24 }}>Take a test to see your results here</div>
          <button className="btn btn-gold" style={{ padding: "12px 28px" }} onClick={() => window.location.href = "/test"}>Take a Test →</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px 80px", gap: 12, padding: "8px 16px", fontSize: 10, color: "#2A4060", fontWeight: 700, letterSpacing: 1.2 }}>
            <span>TEST</span><span style={{ textAlign:"center" }}>EXAM</span><span style={{ textAlign:"center" }}>SCORE</span><span style={{ textAlign:"center" }}>ACCURACY</span><span style={{ textAlign:"center" }}>TIME</span><span style={{ textAlign:"center" }}>DATE</span>
          </div>
          {attempts.map((a, i) => (
            <div key={a.id} className="tbl-row" style={{ gridTemplateColumns: "1fr 80px 80px 80px 80px 80px" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.tests?.name || "Test"}</div>
                <div style={{ fontSize: 11, color: "#7090B0", marginTop: 2 }}>{a.tests?.type || "Mock Test"}</div>
              </div>
              <div style={{ textAlign: "center" }}><Tag color="#E8B84B">{a.tests?.exam || "—"}</Tag></div>
              <div style={{ textAlign: "center" }}><Mono size={15} color="#EEF2FF">{a.score}</Mono></div>
              <div style={{ textAlign: "center" }}>
                <Tag color={a.accuracy >= 70 ? "#34D399" : a.accuracy >= 50 ? "#E8B84B" : "#F87171"}>{a.accuracy}%</Tag>
              </div>
              <div style={{ textAlign: "center" }}><Mono size={12} color="#7090B0">{a.time_taken ? Math.floor(a.time_taken / 60) + "m" : "—"}</Mono></div>
              <div style={{ textAlign: "center", fontSize: 12, color: "#7090B0" }}>
                {new Date(a.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── TESTS PAGE ─────────────────────────────────────────────────────────────
  const TestsPage = () => (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Available Tests</h2>
      <p style={{ color: "#7090B0", fontSize: 13, marginBottom: 24 }}>{tests.length} tests available for you</p>
      {tests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#090E18", borderRadius: 20, border: "1px solid #0F1C2E" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>No tests published yet</div>
          <div style={{ color: "#7090B0", fontSize: 14, marginTop: 8 }}>Check back soon!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tests.map((t, i) => (
            <div key={t.id} className="card fade-up" style={{ animationDelay: `${i * 0.07}s`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{t.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Tag color="#E8B84B">{t.exam}</Tag>
                  <Tag color="#38BDF8">{t.type}</Tag>
                  <Tag color="#7090B0">⏱ {t.time_limit} min</Tag>
                  <Tag color="#7090B0">📝 {Array.isArray(t.question_ids) ? t.question_ids.length : JSON.parse(t.question_ids || "[]").length} Questions</Tag>
                </div>
              </div>
              <button className="btn btn-gold" style={{ flexShrink: 0, marginLeft: 20, padding: "11px 24px", fontSize: 14 }} onClick={() => window.location.href = "/test"}>
                Start →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── PROFILE PAGE ───────────────────────────────────────────────────────────
  const ProfilePage = () => (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24 }}>My Profile</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#E8B84B,#C89030)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#030508" }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{profile?.full_name || "Student"}</div>
            <div style={{ color: "#7090B0", fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["📚", "Exam Preparing", profile?.exam_preparing || "Not set"],
            ["📝", "Tests Taken",    totalTests],
            ["⭐", "Average Score",  avgScore],
            ["🎯", "Best Accuracy",  avgAccuracy + "%"],
          ].map(([icon, l, v]) => (
            <div key={l} style={{ background: "#06090F", borderRadius: 12, padding: "14px 16px", border: "1px solid #0F1C2E" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: "#E8B84B" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#7090B0", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <button className="btn" style={{ width: "100%", background: "#F8717118", color: "#F87171", border: "1px solid #F8717133", justifyContent: "center" }} onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#030508" }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: "auto" }} key={page} className="fade-in">
          {page === "home"    && <HomePage />}
          {page === "tests"   && <TestsPage />}
          {page === "history" && <HistoryPage />}
          {page === "profile" && <ProfilePage />}
        </div>
      </div>
    </>
  );
}