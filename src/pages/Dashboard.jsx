import { useState, useEffect, useRef } from "react";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const G = {
  bg:      "#03060D",
  panel:   "#070C17",
  card:    "#0A1020",
  border:  "#0E1C30",
  border2: "#162840",
  gold:    "#E8B84B",
  goldLo:  "#E8B84B18",
  goldMid: "#E8B84B44",
  cyan:    "#22D3EE",
  green:   "#34D399",
  red:     "#F87171",
  purple:  "#A78BFA",
  orange:  "#FB923C",
  text:    "#EEF2FF",
  sub:     "#8BA4BF",
  muted:   "#3A5070",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,600;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Bricolage Grotesque',sans-serif;background:#03060D;color:#EEF2FF;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#03060D;}
::-webkit-scrollbar-thumb{background:#162840;border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:#E8B84B44;}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes countUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes barGrow{from{width:0;}to{width:var(--w);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes ping{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(1.8);opacity:0;}}
@keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
@keyframes slideIn{from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);}}
@keyframes glow{0%,100%{box-shadow:0 0 20px #E8B84B22;}50%{box-shadow:0 0 40px #E8B84B44;}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

.fade-up{animation:fadeUp 0.5s ease forwards;}
.fade-in{animation:fadeIn 0.4s ease forwards;}
.slide-in{animation:slideIn 0.4s ease forwards;}

.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:10px 14px;border-radius:10px;
  cursor:pointer;transition:all 0.2s;
  color:#8BA4BF;font-size:14px;font-weight:500;
  border:1px solid transparent;
  text-decoration:none;
}
.nav-item:hover{background:#E8B84B0A;color:#E8B84B;border-color:#E8B84B1A;}
.nav-item.active{background:#E8B84B14;color:#E8B84B;border-color:#E8B84B33;font-weight:700;}

.stat-card{
  background:#0A1020;border:1px solid #0E1C30;
  border-radius:16px;padding:22px;
  transition:all 0.25s;cursor:default;
}
.stat-card:hover{border-color:#E8B84B33;transform:translateY(-3px);box-shadow:0 12px 40px #00000066;}

.test-row{
  display:grid;grid-template-columns:1fr auto auto auto;
  align-items:center;gap:16px;
  padding:14px 18px;border-radius:12px;
  background:#070C17;border:1px solid #0E1C30;
  transition:all 0.2s;cursor:pointer;
}
.test-row:hover{border-color:#E8B84B33;background:#0A1020;}

.rec-card{
  background:#070C17;border:1px solid #0E1C30;
  border-radius:14px;padding:16px;
  transition:all 0.2s;cursor:pointer;
  display:flex;gap:14px;align-items:center;
}
.rec-card:hover{border-color:#E8B84B44;transform:translateX(4px);}

.chip{
  display:inline-flex;align-items:center;
  padding:3px 10px;border-radius:999px;
  font-size:11px;font-weight:700;letter-spacing:0.5px;
}

.mini-btn{
  padding:7px 16px;border-radius:8px;font-size:12px;
  font-weight:700;cursor:pointer;transition:all 0.2s;
  font-family:'Bricolage Grotesque',sans-serif;
  border:none;
}

.tooltip-wrap{position:relative;}
.tooltip-wrap:hover .tooltip{display:block;}
.tooltip{
  display:none;position:absolute;bottom:calc(100% + 6px);left:50%;
  transform:translateX(-50%);background:#162840;color:#EEF2FF;
  font-size:11px;padding:5px 10px;border-radius:6px;white-space:nowrap;
  pointer-events:none;z-index:10;
}
`;

/* ─── DATA ───────────────────────────────────────────────────── */
const USER = {
  name: "Arjun Sharma", initials: "AS",
  exam: "SSC CGL 2025", daysLeft: 47,
  streak: 12, rank: 1247, totalRanked: 52000,
};

const STATS = [
  { label: "Tests Attempted",  value: 38,    suffix: "",   icon: "📝", color: G.cyan,   sub: "+3 this week",      trend: +3  },
  { label: "Average Score",    value: 74,    suffix: "%",  icon: "⭐", color: G.gold,   sub: "↑ 2% vs last week", trend: +2  },
  { label: "Best Accuracy",    value: 94,    suffix: "%",  icon: "🎯", color: G.green,  sub: "Reasoning section",  trend: +5  },
  { label: "Study Streak",     value: 12,    suffix: "d",  icon: "🔥", color: G.orange, sub: "Keep it going!",     trend: +1  },
];

const RECENT_TESTS = [
  { name: "SSC CGL Full Mock #12",       date: "Today, 9:42 AM",    score: 148, max: 200, acc: 74, time: "48 min", badge: "Good",      badgeColor: G.cyan   },
  { name: "Reasoning Sectional #8",      date: "Yesterday",         score: 45,  max: 50,  acc: 90, time: "22 min", badge: "Excellent",  badgeColor: G.green  },
  { name: "Quant Aptitude Topic #7",     date: "2 days ago",        score: 32,  max: 50,  acc: 64, time: "31 min", badge: "Average",    badgeColor: G.gold   },
  { name: "SSC CGL Full Mock #11",       date: "4 days ago",        score: 138, max: 200, acc: 69, time: "55 min", badge: "Good",       badgeColor: G.cyan   },
  { name: "English Sectional #5",        date: "5 days ago",        score: 38,  max: 50,  acc: 76, time: "19 min", badge: "Good",       badgeColor: G.cyan   },
];

const WEAK_TOPICS = [
  { name: "Algebra",                subject: "Quant",    acc: 52, sessions: 8,  color: G.red    },
  { name: "Reading Comprehension",  subject: "English",  acc: 58, sessions: 6,  color: G.red    },
  { name: "Trigonometry",           subject: "Quant",    acc: 61, sessions: 5,  color: G.orange },
  { name: "Para Jumbles",           subject: "English",  acc: 63, sessions: 4,  color: G.orange },
  { name: "Current Affairs",        subject: "GA",       acc: 65, sessions: 12, color: G.gold   },
];

const RECOMMENDED = [
  { name: "Algebra Basics Test",         icon: "📐", qs: 20, mins: 25, diff: "Easy",   diffColor: G.green,  tag: "Weak Area"  },
  { name: "Reading Comprehension #4",    icon: "📖", qs: 15, mins: 20, diff: "Medium", diffColor: G.gold,   tag: "Weak Area"  },
  { name: "SSC CGL Full Mock #13",       icon: "🎯", qs: 100,mins: 60, diff: "Hard",   diffColor: G.red,    tag: "New"        },
  { name: "Current Affairs May 2025",    icon: "📰", qs: 30, mins: 20, diff: "Easy",   diffColor: G.green,  tag: "Trending"   },
];

const WEEKLY_SCORES = [68, 72, 69, 75, 78, 74, 81];
const WEEK_DAYS     = ["M", "T", "W", "T", "F", "S", "S"];

const SUBJECT_PERF = [
  { name: "Quant Aptitude", score: 74, color: G.cyan,   icon: "📐" },
  { name: "Reasoning",      score: 88, color: G.green,  icon: "🧠" },
  { name: "English",        score: 66, color: G.gold,   icon: "📖" },
  { name: "Gen. Awareness", score: 65, color: G.purple, icon: "🌍" },
];

/* ─── MICRO COMPONENTS ───────────────────────────────────────── */
function Mono({ children, size = 14, color = G.gold }) {
  return <span style={{ fontFamily: "'DM Mono',monospace", fontSize: size, color, fontWeight: 500 }}>{children}</span>;
}

function Chip({ children, color }) {
  return (
    <span className="chip" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>
      {children}
    </span>
  );
}

function ProgressBar({ pct, color = G.gold, height = 6, animated = true }) {
  return (
    <div style={{ background: G.border2, borderRadius: 999, height, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 999,
        background: `linear-gradient(90deg, ${color}, ${color}bb)`,
        width: `${pct}%`,
        transition: animated ? "width 1.2s cubic-bezier(0.4,0,0.2,1)" : "none",
      }} />
    </div>
  );
}

function AnimatedCounter({ target, suffix = "", duration = 1400 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{val}{suffix}</>;
}

function LiveDot({ color = G.green }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.5s ease infinite", opacity: 0.6 }} />
      <span style={{ position: "relative", width: 10, height: 10, borderRadius: "50%", background: color }} />
    </span>
  );
}

function SectionHeader({ title, sub, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: G.text }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: G.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      {action && (
        <span onClick={onAction} style={{ fontSize: 12, color: G.gold, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          {action} →
        </span>
      )}
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────── */
function Sidebar({ active, setActive }) {
  const nav = [
    { id: "dashboard", icon: "⊞",  label: "Dashboard"   },
    { id: "tests",     icon: "📝",  label: "Mock Tests"  },
    { id: "analytics", icon: "📊",  label: "Analytics"   },
    { id: "weakareas", icon: "🎯",  label: "Weak Areas"  },
    { id: "bookmarks", icon: "🔖",  label: "Bookmarks"   },
    { id: "ranking",   icon: "🏆",  label: "Leaderboard" },
    { id: "profile",   icon: "👤",  label: "Profile"     },
  ];

  return (
    <aside style={{
      width: 228, background: G.panel,
      borderRight: `1px solid ${G.border}`,
      display: "flex", flexDirection: "column",
      padding: "24px 14px",
      position: "sticky", top: 0, height: "100vh",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "4px 6px 24px" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 17, fontWeight: 500, color: G.gold, letterSpacing: 3 }}>EXAMACE</div>
        <div style={{ fontSize: 9, color: G.muted, letterSpacing: 2.5, marginTop: 1 }}>MOCK TEST PLATFORM</div>
      </div>

      {/* Exam Countdown */}
      <div style={{
        background: G.goldLo, border: `1px solid ${G.goldMid}`,
        borderRadius: 12, padding: "12px 14px", marginBottom: 20,
        animation: "glow 4s ease infinite",
      }}>
        <div style={{ fontSize: 10, color: G.sub, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Your Exam</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: G.text, marginBottom: 6 }}>{USER.exam}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <Mono size={28} color={G.gold}>{USER.daysLeft}</Mono>
          <span style={{ fontSize: 12, color: G.sub }}>days remaining</span>
        </div>
        <ProgressBar pct={Math.round(((180 - USER.daysLeft) / 180) * 100)} height={4} />
        <div style={{ fontSize: 10, color: G.sub, marginTop: 4 }}>74% of prep time used</div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {nav.map(n => (
          <div key={n.id} className={`nav-item${active === n.id ? " active" : ""}`}
            onClick={() => setActive(n.id)}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
            <span>{n.label}</span>
            {n.id === "weakareas" && (
              <span style={{ marginLeft: "auto", background: G.red + "22", color: G.red, fontSize: 10, padding: "1px 7px", borderRadius: 999, fontWeight: 700 }}>5</span>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom User */}
      <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `linear-gradient(135deg, ${G.gold}, #C89030)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#03060D", flexShrink: 0,
        }}>{USER.initials}</div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{USER.name}</div>
          <div style={{ fontSize: 11, color: G.sub }}>Free Account</div>
        </div>
        <span style={{ marginLeft: "auto", cursor: "pointer", fontSize: 14, color: G.muted }}>⚙</span>
      </div>
    </aside>
  );
}

/* ─── TOP BAR ────────────────────────────────────────────────── */
function Topbar({ page }) {
  const titles = { dashboard: "Dashboard", tests: "Mock Tests", analytics: "Analytics", weakareas: "Weak Areas", bookmarks: "Bookmarks", ranking: "Leaderboard", profile: "Profile" };
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(3,6,13,0.88)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${G.border}`,
      padding: "0 28px", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: G.muted }}>ExamAce</span>
        <span style={{ color: G.border2 }}>›</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: G.text }}>{titles[page]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "7px 14px" }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <span style={{ fontSize: 13, color: G.muted }}>Search tests...</span>
        </div>
        {/* Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "7px 14px" }}>
          <span>🔥</span>
          <Mono size={13} color={G.orange}>{USER.streak} day streak</Mono>
        </div>
        {/* Notification */}
        <div style={{ position: "relative", width: 36, height: 36, background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span>🔔</span>
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: G.red, borderRadius: "50%", border: `1.5px solid ${G.bg}` }} />
        </div>
      </div>
    </header>
  );
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────── */
function DashboardPage({ setPage }) {
  const maxScore = Math.max(...WEEKLY_SCORES);

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 26, maxWidth: 1140 }}>

      {/* Welcome */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: G.sub, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            <LiveDot /> <span style={{ marginLeft: 6 }}>Thursday, 12 March 2026</span>
          </div>
          <h1 style={{ fontFamily: "'Lora',serif", fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>
            Good morning, <span style={{ color: G.gold, fontStyle: "italic" }}>Arjun</span> 👋
          </h1>
          <p style={{ color: G.sub, fontSize: 14, marginTop: 5 }}>
            You have <strong style={{ color: G.text }}>3 recommended tests</strong> waiting. Let's go!
          </p>
        </div>
        <button onClick={() => setPage("tests")} style={{
          padding: "12px 24px", background: `linear-gradient(135deg, ${G.gold}, #C89030)`,
          border: "none", borderRadius: 12, color: "#03060D",
          fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
          fontSize: 14, cursor: "pointer", boxShadow: `0 4px 20px ${G.gold}44`,
          animation: "glow 3s ease infinite",
        }}>🚀 Start a Test →</button>
      </div>

      {/* Stat Cards */}
      <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: s.color + "18", border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: s.trend > 0 ? G.green + "18" : G.red + "18", padding: "3px 8px", borderRadius: 999 }}>
                <span style={{ fontSize: 10, color: s.trend > 0 ? G.green : G.red, fontWeight: 700 }}>{s.trend > 0 ? "↑" : "↓"} {Math.abs(s.trend)}</span>
              </div>
            </div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 32, fontWeight: 500, color: s.color, lineHeight: 1 }}>
              <AnimatedCounter target={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: 12, color: G.sub, marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* AI Insight Banner */}
      <div className="fade-up" style={{
        background: `linear-gradient(135deg, #0A1020, #0C1428)`,
        border: `1px solid ${G.gold}33`,
        borderRadius: 18, padding: "22px 28px",
        display: "flex", alignItems: "center", gap: 20,
        boxShadow: `0 0 40px ${G.gold}08`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${G.gold}0A, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${G.gold}22, ${G.gold}08)`,
          border: `1.5px solid ${G.gold}44`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: G.gold }}>AI Performance Insight</span>
            <LiveDot color={G.gold} />
          </div>
          <p style={{ fontSize: 14, color: G.sub, lineHeight: 1.7 }}>
            You're weak in{" "}
            <span style={{ color: G.red, fontWeight: 700 }}>Algebra (52%)</span> and{" "}
            <span style={{ color: G.red, fontWeight: 700 }}>Reading Comprehension (58%)</span>.
            {" "}Focus on these today — a 1-hour session could improve your score by{" "}
            <span style={{ color: G.green, fontWeight: 700 }}>8–12 marks</span> in the next mock.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setPage("tests")} style={{ padding: "9px 18px", background: G.gold, border: "none", borderRadius: 9, color: "#03060D", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            Practice Now →
          </button>
          <button onClick={() => setPage("weakareas")} style={{ padding: "9px 18px", background: "transparent", border: `1px solid ${G.goldMid}`, borderRadius: 9, color: G.gold, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            See All Weak Areas
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

        {/* LEFT — Recent Tests + Weekly Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Weekly Score Chart */}
          <div className="fade-up" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 24 }}>
            <SectionHeader title="This Week's Performance" sub="Daily mock test scores" action="Full Analytics" onAction={() => setPage("analytics")} />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
              {WEEKLY_SCORES.map((v, i) => {
                const isToday = i === 6;
                const pct = (v / maxScore) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div className="tooltip-wrap" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: isToday ? G.gold : G.muted, marginBottom: 3 }}>{v}%</div>
                      <div style={{
                        width: "100%", borderRadius: "6px 6px 0 0",
                        height: `${pct}px`,
                        background: isToday
                          ? `linear-gradient(180deg, ${G.gold}, #C89030)`
                          : `linear-gradient(180deg, ${G.cyan}66, ${G.cyan}33)`,
                        transition: "height 1s ease",
                        boxShadow: isToday ? `0 0 14px ${G.gold}44` : "none",
                        border: isToday ? `1px solid ${G.goldMid}` : "1px solid transparent",
                      }} />
                      <div className="tooltip">{WEEK_DAYS[i]}: {v}%</div>
                    </div>
                    <div style={{ fontSize: 11, color: isToday ? G.gold : G.muted, fontWeight: isToday ? 700 : 400 }}>{WEEK_DAYS[i]}</div>
                  </div>
                );
              })}
            </div>
            {/* Subject bars */}
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {SUBJECT_PERF.map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: G.sub }}>{s.icon} {s.name}</span>
                    <Mono size={12} color={s.color}>{s.score}%</Mono>
                  </div>
                  <ProgressBar pct={s.score} color={s.color} height={5} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tests */}
          <div className="fade-up" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 24 }}>
            <SectionHeader title="Recent Tests" sub={`${RECENT_TESTS.length} tests this week`} action="View All" onAction={() => setPage("tests")} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECENT_TESTS.map((t, i) => (
                <div key={i} className="test-row">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{t.date} · ⏱ {t.time}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Mono size={15} color={G.text}>{t.score}<span style={{ color: G.muted, fontSize: 11 }}>/{t.max}</span></Mono>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Mono size={12} color={t.acc >= 80 ? G.green : t.acc >= 70 ? G.cyan : G.gold}>{t.acc}%</Mono>
                    <div style={{ fontSize: 10, color: G.muted }}>accuracy</div>
                  </div>
                  <Chip color={t.badgeColor}>{t.badge}</Chip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Recommended + Weak Areas + Rank */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Rank Card */}
          <div className="fade-up" style={{
            background: `linear-gradient(135deg, #0A1020, #0C1828)`,
            border: `1px solid ${G.purple}33`,
            borderRadius: 18, padding: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: G.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>All India Rank</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 36, color: G.purple }}>#{USER.rank.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 12, color: G.sub, marginTop: 2 }}>out of {(USER.totalRanked / 1000).toFixed(0)}K students</div>
              </div>
              <div style={{ fontSize: 36 }}>🏆</div>
            </div>
            <ProgressBar pct={Math.round(((USER.totalRanked - USER.rank) / USER.totalRanked) * 100)} color={G.purple} height={6} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: G.muted }}>Top {Math.round((USER.rank / USER.totalRanked) * 100)}%</span>
              <span style={{ fontSize: 11, color: G.purple }}>↑ 124 ranks this week</span>
            </div>
          </div>

          {/* Weak Topics */}
          <div className="fade-up" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 20 }}>
            <SectionHeader title="⚠️ Weak Areas" sub="Topics needing attention" action="Improve" onAction={() => setPage("weakareas")} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {WEAK_TOPICS.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: G.panel, borderRadius: 10, border: `1px solid ${G.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{t.subject} · {t.sessions} sessions</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Mono size={14} color={t.color}>{t.acc}%</Mono>
                    <div style={{ fontSize: 10, color: G.muted }}>accuracy</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="fade-up" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 20 }}>
            <SectionHeader title="🤖 AI Recommended" sub="Personalised for you" action="Browse All" onAction={() => setPage("tests")} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECOMMENDED.map((r, i) => (
                <div key={i} className="rec-card">
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{r.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: G.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: G.muted }}>📋 {r.qs} Qs</span>
                      <span style={{ fontSize: 10, color: G.muted }}>⏱ {r.mins}m</span>
                      <Chip color={r.diffColor}>{r.diff}</Chip>
                      <Chip color={r.tag === "Weak Area" ? G.red : r.tag === "New" ? G.cyan : G.gold}>{r.tag}</Chip>
                    </div>
                  </div>
                  <span style={{ color: G.gold, fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Study Calendar */}
      <div className="fade-up" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 24 }}>
        <SectionHeader title="📅 Activity Calendar" sub="Your test-taking activity this month" />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Array.from({ length: 31 }, (_, i) => {
            const activity = [0,2,1,3,2,0,1,2,3,2,1,0,2,3,2,1,2,0,3,2,1,2,1,0,2,3,1,2,0,1,2][i];
            const colors = ["#0E1C30", G.gold + "44", G.gold + "88", G.gold];
            return (
              <div key={i} className="tooltip-wrap" style={{ width: 22, height: 22, borderRadius: 4, background: colors[activity], cursor: "pointer" }}>
                <div className="tooltip">{`Mar ${i + 1}: ${activity} test${activity !== 1 ? "s" : ""}`}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: G.muted }}>Less</span>
          {["#0E1C30", G.gold + "44", G.gold + "88", G.gold].map(c => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
          ))}
          <span style={{ fontSize: 11, color: G.muted }}>More</span>
          <span style={{ fontSize: 11, color: G.sub, marginLeft: 8 }}>38 tests this month</span>
        </div>
      </div>

    </div>
  );
}

/* ─── MOCK TESTS PAGE ────────────────────────────────────────── */
function TestsPage() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Full Length", "Sectional", "Topic-wise", "PYQ", "Bookmarked"];
  const tests = [
    { name:"SSC CGL Full Mock #13", type:"Full Length", qs:100, time:"60 min", diff:"Hard",   rating:4.8, attempts:"12.4K", new:true  },
    { name:"SSC CGL Full Mock #14", type:"Full Length", qs:100, time:"60 min", diff:"Hard",   rating:4.7, attempts:"8.9K",  new:false },
    { name:"Quant Sectional #10",   type:"Sectional",  qs:50,  time:"30 min", diff:"Medium", rating:4.9, attempts:"21K",   new:false },
    { name:"Reasoning Sectional #9",type:"Sectional",  qs:50,  time:"30 min", diff:"Medium", rating:4.6, attempts:"18K",   new:false },
    { name:"Algebra Topic Test",    type:"Topic-wise", qs:20,  time:"25 min", diff:"Easy",   rating:4.5, attempts:"35K",   new:false },
    { name:"Previous Year 2024",    type:"PYQ",        qs:100, time:"60 min", diff:"Hard",   rating:4.9, attempts:"67K",   new:false },
  ];
  const typeColor = { "Full Length": G.cyan, "Sectional": G.purple, "Topic-wise": G.green, "PYQ": G.gold };
  const diffColor = { "Easy": G.green, "Medium": G.gold, "Hard": G.red };
  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Lora',serif", fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Mock Tests</h2>
        <p style={{ color: G.sub, fontSize: 13 }}>1,200+ tests for SSC, UPSC, JEE & Banking</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 18px", borderRadius: 999,
            border: `1px solid ${filter === f ? G.gold : G.border2}`,
            background: filter === f ? G.goldLo : "transparent",
            color: filter === f ? G.gold : G.sub,
            fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>{f}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {tests.map((t, i) => (
          <div key={i} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = G.goldMid; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Chip color={typeColor[t.type] || G.gold}>{t.type}</Chip>
              <div style={{ display: "flex", gap: 6 }}>
                {t.new && <Chip color={G.cyan}>New</Chip>}
                <Mono size={12} color={G.gold}>★ {t.rating}</Mono>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: G.text }}>{t.name}</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: G.muted }}>📋 {t.qs} Qs</span>
              <span style={{ fontSize: 12, color: G.muted }}>⏱ {t.time}</span>
              <span style={{ fontSize: 12, color: G.muted }}>👥 {t.attempts}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Chip color={diffColor[t.diff]}>{t.diff}</Chip>
              <button style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${G.gold}, #C89030)`, border: "none", borderRadius: 9, color: "#03060D", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                Start →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── WEAK AREAS PAGE ────────────────────────────────────────── */
function WeakAreasPage() {
  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Lora',serif", fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Weak Areas</h2>
        <p style={{ color: G.sub, fontSize: 13 }}>AI-identified topics where focused practice will boost your score the most</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {WEAK_TOPICS.map((t, i) => (
          <div key={i} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</span>
                <Chip color={t.color}>{t.subject}</Chip>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: G.sub }}>Accuracy</span>
                  <Mono size={12} color={t.color}>{t.acc}%</Mono>
                </div>
                <ProgressBar pct={t.acc} color={t.color} height={8} />
              </div>
              <p style={{ fontSize: 13, color: G.sub, lineHeight: 1.6 }}>
                You've attempted <strong style={{ color: G.text }}>{t.sessions} sessions</strong> in this topic.
                {t.acc < 60 ? " Needs urgent attention — practice fundamentals first." : " Getting better — focus on speed and accuracy."}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ padding: "10px 20px", background: `linear-gradient(135deg, ${G.gold}, #C89030)`, border: "none", borderRadius: 10, color: "#03060D", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                Practice Now →
              </button>
              <button style={{ padding: "9px 20px", background: "transparent", border: `1px solid ${G.border2}`, borderRadius: 10, color: G.sub, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                View Solutions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PLACEHOLDER PAGES ──────────────────────────────────────── */
function ComingSoonPage({ title, icon, next }) {
  return (
    <div style={{ padding: 28, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "float 3s ease infinite" }}>{icon}</div>
        <h2 style={{ fontFamily: "'Lora',serif", fontSize: 26, fontWeight: 600, marginBottom: 10 }}>{title}</h2>
        <p style={{ color: G.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          This section will be built in the next step of our roadmap. The dashboard and navigation are fully wired up and ready!
        </p>
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 18, textAlign: "left" }}>
          <div style={{ fontSize: 12, color: G.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Up Next in Roadmap</div>
          {[["✅","Landing Page","Done"],["✅","Auth System","Done"],["✅","Dashboard","Done"],["⏳","Mock Test Interface","Step 4"],["⏳","Results & Analytics","Step 5"],["⏳","Admin Panel","Step 6"]].map(([ic,l,s])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${G.border}`, fontSize:13 }}>
              <span style={{ display:"flex", gap:8 }}><span>{ic}</span><span style={{ color: G.text }}>{l}</span></span>
              <span style={{ color: s==="Done" ? G.green : s.includes("4") ? G.gold : G.muted, fontSize:12, fontWeight:600 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("dashboard");

  const content = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "tests":     return <TestsPage />;
      case "weakareas": return <WeakAreasPage />;
      case "analytics": return <ComingSoonPage title="Performance Analytics" icon="📊" />;
      case "bookmarks": return <ComingSoonPage title="Bookmarked Tests" icon="🔖" />;
      case "ranking":   return <ComingSoonPage title="All India Leaderboard" icon="🏆" />;
      case "profile":   return <ComingSoonPage title="My Profile" icon="👤" />;
      default:          return <DashboardPage setPage={setPage} />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: G.bg }}>
        <Sidebar active={page} setActive={setPage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar page={page} />
          <main style={{ flex: 1, overflowY: "auto" }} className="fade-in">
            {content()}
          </main>
        </div>
      </div>
    </>
  );
}