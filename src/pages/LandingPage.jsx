import { useState, useEffect, useRef } from "react";

/* ─── DESIGN SYSTEM ─────────────────────────────────────────── */
const G = {
  bg:       "#04080F",
  card:     "#080D18",
  border:   "#0F1E35",
  border2:  "#1A3050",
  gold:     "#E8B84B",
  goldDim:  "#E8B84B55",
  goldFade: "#E8B84B18",
  cyan:     "#22D3EE",
  green:    "#34D399",
  red:      "#F87171",
  purple:   "#A78BFA",
  text:     "#EEF2FF",
  muted:    "#4A6080",
  sub:      "#8BA4BF",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'DM Sans', sans-serif; background: #04080F; color: #EEF2FF; overflow-x: hidden; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #04080F; }
::-webkit-scrollbar-thumb { background: #E8B84B55; border-radius: 2px; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes float    { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
@keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes rotate   { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
@keyframes scanline { 0% { top:-10%; } 100% { top:110%; } }
@keyframes glow     { 0%,100% { box-shadow:0 0 30px #E8B84B33; } 50% { box-shadow:0 0 60px #E8B84B66, 0 0 100px #E8B84B22; } }

.fade-up   { animation: fadeUp 0.7s ease forwards; }
.fade-in   { animation: fadeIn 0.5s ease forwards; }
.float     { animation: float 4s ease-in-out infinite; }
.glow-btn  { animation: glow 3s ease-in-out infinite; }

.shimmer-text {
  background: linear-gradient(90deg, #E8B84B, #fff, #E8B84B, #fff, #E8B84B);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

.card-hover {
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.card-hover:hover {
  transform: translateY(-6px);
  border-color: #E8B84B55 !important;
  box-shadow: 0 20px 60px #E8B84B18;
}

.nav-link {
  color: #8BA4BF;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  cursor: pointer;
}
.nav-link:hover { color: #E8B84B; }

.exam-tab {
  transition: all 0.25s ease;
  cursor: pointer;
}
.exam-tab:hover { background: #E8B84B18 !important; border-color: #E8B84B55 !important; }

.counter { font-family: 'Space Mono', monospace; }

/* Grid background */
.grid-bg {
  background-image:
    linear-gradient(rgba(232,184,75,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232,184,75,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}
`;

/* ─── COMPONENTS ─────────────────────────────────────────────── */
function GoldLine() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${G.gold}, transparent)`, opacity: 0.4 }} />;
}

function Tag({ children, color = G.gold }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px",
      background: color + "18", color, border: `1px solid ${color}44`,
      borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
      textTransform: "uppercase"
    }}>{children}</span>
  );
}

function GlowButton({ children, onClick, size = "md", variant = "primary" }) {
  const pad = size === "lg" ? "16px 36px" : "12px 26px";
  const fs  = size === "lg" ? 16 : 14;
  if (variant === "ghost") return (
    <button onClick={onClick} style={{
      padding: pad, fontSize: fs, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
      border: `1px solid ${G.border2}`, borderRadius: 12, background: "transparent",
      color: G.sub, cursor: "pointer", transition: "all 0.2s",
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = G.goldDim; e.currentTarget.style.color = G.gold; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = G.border2; e.currentTarget.style.color = G.sub; }}
    >{children}</button>
  );
  return (
    <button onClick={onClick} className="glow-btn" style={{
      padding: pad, fontSize: fs, fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
      background: `linear-gradient(135deg, ${G.gold}, #C89030)`,
      border: "none", borderRadius: 12, color: "#04080F",
      cursor: "pointer", letterSpacing: 0.5, transition: "transform 0.2s",
    }}
      onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
    >{children}</button>
  );
}

/* ─── SECTIONS ───────────────────────────────────────────────── */

function Navbar({ onCTA }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(4,8,15,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${G.border}` : "1px solid transparent",
      padding: "0 48px", height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, background: `linear-gradient(135deg, ${G.gold}, #C89030)`,
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 900, color: "#04080F", fontFamily: "'Playfair Display',serif"
        }}>E</div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 15, color: G.gold, letterSpacing: 2 }}>EXAMACE</div>
          <div style={{ fontSize: 9, color: G.muted, letterSpacing: 2, marginTop: -2 }}>MOCK TEST PLATFORM</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 36 }}>
        {["Features", "Exams", "How it Works", "Testimonials"].map(l => (
          <a key={l} className="nav-link" href={`#${l.toLowerCase().replace(/ /g,"-")}`}>{l}</a>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <GlowButton variant="ghost" onClick={onCTA}>Login</GlowButton>
        <GlowButton onClick={onCTA}>Start Free →</GlowButton>
      </div>
    </nav>
  );
}

function HeroSection({ onCTA }) {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  useEffect(() => {
    const animate = (setter, target, duration) => {
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setter(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 800);
    };
    animate(setCount1, 50000, 2000);
    animate(setCount2, 1200, 2200);
    animate(setCount3, 98, 1800);
  }, []);

  return (
    <section className="grid-bg" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px 24px 80px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient blobs */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #E8B84B0A, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #22D3EE08, transparent 70%)", pointerEvents: "none" }} />

      {/* Floating decorative orb */}
      <div className="float" style={{
        position: "absolute", top: "20%", right: "12%",
        width: 220, height: 220, borderRadius: "50%",
        background: "conic-gradient(from 0deg, #E8B84B22, #22D3EE11, #E8B84B22)",
        border: `1px solid ${G.goldDim}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>🎯</div>
          <div style={{ fontSize: 11, color: G.gold, fontFamily: "'Space Mono',monospace", marginTop: 6 }}>CRACK IT</div>
        </div>
      </div>

      <div style={{ textAlign: "center", maxWidth: 820, position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ marginBottom: 20 }}>
          <Tag>India's #1 Free Mock Test Platform</Tag>
        </div>

        <h1 className="fade-up" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(44px, 7vw, 82px)",
          fontWeight: 900, lineHeight: 1.08,
          marginBottom: 24,
          animationDelay: "0.1s", opacity: 0,
        }}>
          Crack <span className="shimmer-text">SSC, UPSC,</span><br />
          JEE & Banking<br />
          <span style={{ color: G.gold }}>With Confidence</span>
        </h1>

        <p className="fade-up" style={{
          color: G.sub, fontSize: 18, lineHeight: 1.8,
          maxWidth: 560, margin: "0 auto 36px",
          animationDelay: "0.2s", opacity: 0,
        }}>
          Real exam environment. AI-powered analytics. 1200+ mock tests.<br />
          <strong style={{ color: G.text }}>Completely free.</strong> Start your journey today.
        </p>

        <div className="fade-up" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.3s", opacity: 0 }}>
          <GlowButton size="lg" onClick={onCTA}>🚀 Start Practicing Free</GlowButton>
          <GlowButton size="lg" variant="ghost" onClick={onCTA}>Watch Demo ▶</GlowButton>
        </div>

        {/* Live counters */}
        <div className="fade-up" style={{
          display: "flex", gap: 0, justifyContent: "center", marginTop: 60,
          animationDelay: "0.5s", opacity: 0,
        }}>
          {[
            [count1.toLocaleString() + "+", "Students Enrolled", G.gold],
            [count2.toLocaleString() + "+", "Mock Tests Available", G.cyan],
            [count3 + "%",                  "Students Improved",   G.green],
          ].map(([val, label, color], i) => (
            <div key={i} style={{
              padding: "20px 40px",
              borderRight: i < 2 ? `1px solid ${G.border}` : "none",
              textAlign: "center",
            }}>
              <div className="counter" style={{ fontSize: 34, fontWeight: 700, color }}>{val}</div>
              <div style={{ color: G.muted, fontSize: 13, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ color: G.muted, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>SCROLL TO EXPLORE</div>
        <div style={{ width: 1, height: 40, background: `linear-gradient(${G.gold}, transparent)`, margin: "0 auto", animation: "pulse 2s infinite" }} />
      </div>
    </section>
  );
}

function ExamsSection() {
  const [active, setActive] = useState(0);
  const exams = [
    {
      key: "SSC", icon: "🏛️", color: G.gold, full: "Staff Selection Commission",
      exams: ["SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "SSC GD"],
      tests: 320, students: "18K+",
      subjects: ["Quantitative Aptitude", "General Reasoning", "English Language", "General Awareness"],
      desc: "Comprehensive mock tests for all SSC exams. Updated with latest pattern and previous year questions.",
    },
    {
      key: "UPSC", icon: "📜", color: G.cyan, full: "Union Public Service Commission",
      exams: ["UPSC CSE Prelims", "UPSC CSE Mains", "UPSC CAPF", "UPSC NDA"],
      tests: 280, students: "12K+",
      subjects: ["General Studies I–IV", "CSAT", "Current Affairs", "Optional Subject"],
      desc: "India's toughest exam needs best preparation. Our UPSC tests are designed by ex-IAS officers.",
    },
    {
      key: "JEE", icon: "⚛️", color: G.purple, full: "Joint Entrance Examination",
      exams: ["JEE Main", "JEE Advanced", "BITSAT", "MHT CET"],
      tests: 350, students: "15K+",
      subjects: ["Physics", "Chemistry", "Mathematics", "Numerical Problems"],
      desc: "Chapter-wise and full-length JEE mocks with detailed solutions by IIT alumni.",
    },
    {
      key: "Banking", icon: "🏦", color: G.green, full: "IBPS / SBI Banking Exams",
      exams: ["IBPS PO", "IBPS Clerk", "SBI PO", "SBI Clerk", "RBI Grade B"],
      tests: 290, students: "20K+",
      subjects: ["Quantitative Aptitude", "Reasoning Ability", "English Language", "General/Financial Awareness"],
      desc: "Speed and accuracy focused tests for banking exams. Timer-based practice for Prelims & Mains.",
    },
  ];
  const e = exams[active];

  return (
    <section id="exams" style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <Tag>4 Exam Categories</Tag>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 900, marginTop: 16, marginBottom: 16 }}>
          Every Exam. <span style={{ color: G.gold }}>One Platform.</span>
        </h2>
        <p style={{ color: G.sub, fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
          From prelims to mains, we cover every stage of your exam preparation journey.
        </p>
      </div>

      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
        {exams.map((ex, i) => (
          <button key={ex.key} className="exam-tab" onClick={() => setActive(i)} style={{
            padding: "12px 28px", borderRadius: 12, border: `1px solid ${active === i ? ex.color + "66" : G.border}`,
            background: active === i ? ex.color + "18" : "transparent",
            color: active === i ? ex.color : G.sub,
            fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>{ex.icon}</span> {ex.key}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div key={active} style={{
        background: G.card, border: `1px solid ${e.color}33`,
        borderRadius: 24, padding: 40, display: "grid",
        gridTemplateColumns: "1fr 1fr", gap: 48,
        animation: "fadeIn 0.4s ease",
        boxShadow: `0 0 60px ${e.color}0A`,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 40 }}>{e.icon}</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800 }}>{e.key}</div>
              <div style={{ color: G.sub, fontSize: 13 }}>{e.full}</div>
            </div>
          </div>
          <p style={{ color: G.sub, lineHeight: 1.8, marginBottom: 24 }}>{e.desc}</p>
          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            <div style={{ textAlign: "center", background: e.color + "18", border: `1px solid ${e.color}44`, borderRadius: 12, padding: "14px 24px" }}>
              <div className="counter" style={{ fontSize: 24, fontWeight: 700, color: e.color }}>{e.tests}+</div>
              <div style={{ fontSize: 11, color: G.muted }}>Mock Tests</div>
            </div>
            <div style={{ textAlign: "center", background: e.color + "18", border: `1px solid ${e.color}44`, borderRadius: 12, padding: "14px 24px" }}>
              <div className="counter" style={{ fontSize: 24, fontWeight: 700, color: e.color }}>{e.students}</div>
              <div style={{ fontSize: 11, color: G.muted }}>Students</div>
            </div>
          </div>
          <GlowButton onClick={() => window.location.href="/login"}>Explore {e.key} Tests →</GlowButton>
        </div>
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: G.sub, fontSize: 12, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Covered Exams</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {e.exams.map(ex => (
                <span key={ex} style={{ padding: "6px 14px", background: e.color + "18", color: e.color, border: `1px solid ${e.color}33`, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{ex}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: G.sub, fontSize: 12, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Subjects Covered</div>
            {e.subjects.map((s, i) => (
              <div key={s} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", borderBottom: i < e.subjects.length - 1 ? `1px solid ${G.border}` : "none",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: G.text }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: "🖥️", title: "Real CBT Interface", desc: "Identical to actual computer-based exam UI. Timer, palette, section navigation — all included.", color: G.gold },
    { icon: "🤖", title: "AI Performance Analysis", desc: "Our AI identifies your weak topics and recommends personalized practice tests automatically.", color: G.cyan },
    { icon: "📊", title: "Deep Analytics Dashboard", desc: "Topic-wise accuracy, time management charts, progress tracking, and percentile ranking.", color: G.purple },
    { icon: "📚", title: "1200+ Mock Tests", desc: "Full-length, sectional, topic-wise, and previous year papers — all in one place.", color: G.green },
    { icon: "✅", title: "Detailed Solutions", desc: "Every question has a step-by-step explanation written by subject matter experts.", color: G.gold },
    { icon: "📱", title: "Mobile Friendly", desc: "Practice anytime, anywhere. Fully responsive design works perfectly on all devices.", color: G.cyan },
    { icon: "🏆", title: "All India Ranking", desc: "See where you stand among thousands of aspirants with live leaderboards.", color: G.purple },
    { icon: "🆓", title: "100% Free Forever", desc: "No hidden charges. No subscriptions. All features completely free for every student.", color: G.green },
  ];

  return (
    <section id="features" style={{ padding: "100px 48px", background: `linear-gradient(180deg, ${G.bg}, ${G.card})` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Tag>Why Choose ExamAce</Tag>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 900, marginTop: 16, marginBottom: 16 }}>
            Everything You Need to <span style={{ color: G.gold }}>Succeed</span>
          </h2>
          <p style={{ color: G.sub, fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
            Built by exam toppers and educators. Designed for serious aspirants.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {features.map((f, i) => (
            <div key={i} className="card-hover" style={{
              background: G.bg, border: `1px solid ${G.border}`,
              borderRadius: 20, padding: "28px 24px",
              animationDelay: `${i * 0.07}s`,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: f.color + "18", border: `1px solid ${f.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, marginBottom: 16,
              }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: G.text }}>{f.title}</div>
              <div style={{ color: G.sub, fontSize: 13, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: "01", icon: "✍️", title: "Create Free Account", desc: "Register with email or mobile. Choose your target exam. Takes under 60 seconds.", color: G.gold },
    { n: "02", icon: "🎯", title: "Take a Mock Test", desc: "Pick from 1200+ tests. Full exam simulation with real timer and question palette.", color: G.cyan },
    { n: "03", icon: "📊", title: "Analyze Your Results", desc: "Get instant score, accuracy %, subject breakdown, and time analysis after every test.", color: G.purple },
    { n: "04", icon: "🤖", title: "Follow AI Guidance", desc: "Our AI identifies your weak areas and recommends what to practice next. Improve faster.", color: G.green },
  ];
  return (
    <section id="how-it-works" style={{ padding: "100px 48px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Tag>Simple 4-Step Process</Tag>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 900, marginTop: 16 }}>
            How <span style={{ color: G.gold }}>ExamAce</span> Works
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: 36, left: "12.5%", right: "12.5%", height: 1,
            background: `linear-gradient(90deg, ${G.gold}44, ${G.cyan}44, ${G.purple}44, ${G.green}44)`,
            zIndex: 0,
          }} />
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: s.color + "18", border: `2px solid ${s.color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, margin: "0 auto 20px",
                boxShadow: `0 0 20px ${s.color}22`,
              }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: s.color, letterSpacing: 2, marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</div>
              <div style={{ color: G.sub, fontSize: 13, lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Priya Sharma", exam: "SSC CGL 2024 — Rank 247", avatar: "P", color: G.gold, text: "ExamAce was my only resource for mock tests. The AI suggestions helped me improve my Quant from 60% to 88% accuracy in just 3 months. Got selected in my first attempt!" },
    { name: "Rahul Verma", exam: "IBPS PO 2024 — Selected", avatar: "R", color: G.cyan, text: "The real exam interface is exactly like the actual IBPS portal. I was completely comfortable on exam day because I had practiced on ExamAce for weeks. 100% recommended!" },
    { name: "Ananya Singh", exam: "JEE Main 2024 — 97.4 Percentile", avatar: "A", color: G.purple, text: "Chapter-wise tests and detailed solutions are incredible. My Physics weak areas were identified by AI and I focused only on those. Score jumped 40 marks in 6 weeks." },
    { name: "Kiran Patel", exam: "UPSC Prelims 2024 — Cleared", avatar: "K", color: G.green, text: "Free platform with this much quality? Hard to believe. UPSC mocks are well researched. The current affairs section and analytics helped me clear Prelims comfortably." },
    { name: "Mohit Gupta", exam: "SBI PO 2024 — Selected", avatar: "M", color: G.gold, text: "Attempted 80+ mock tests on ExamAce. The speed I developed helped me complete the paper 12 minutes early. Analytics showed exactly where I was losing time." },
    { name: "Deepika Nair", exam: "SSC CHSL 2024 — Rank 112", avatar: "D", color: G.cyan, text: "The previous year question bank is gold. Patterns repeat and ExamAce helped me spot them. Went from failing mocks to clearing the exam. Life changing platform!" },
  ];
  return (
    <section id="testimonials" style={{ padding: "100px 48px", background: `linear-gradient(180deg, ${G.bg}, ${G.card})` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Tag>Real Success Stories</Tag>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 900, marginTop: 16, marginBottom: 16 }}>
            Students Who <span style={{ color: G.gold }}>Cracked It</span>
          </h2>
          <p style={{ color: G.sub, fontSize: 16 }}>Join 50,000+ students who turned their dreams into results</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} className="card-hover" style={{
              background: G.bg, border: `1px solid ${G.border}`,
              borderRadius: 20, padding: "28px",
            }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, s) => <span key={s} style={{ color: G.gold, fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ color: G.sub, fontSize: 14, lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 16, color: "#04080F",
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: t.color, fontSize: 12, marginTop: 2 }}>{t.exam}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onCTA }) {
  return (
    <section style={{ padding: "100px 48px" }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", textAlign: "center",
        background: G.card, border: `1px solid ${G.goldDim}`,
        borderRadius: 32, padding: "72px 48px",
        position: "relative", overflow: "hidden",
        boxShadow: `0 0 80px ${G.gold}0A`,
      }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${G.gold}0A, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${G.cyan}08, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚀</div>
          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(30px,4vw,52px)", fontWeight: 900,
            marginBottom: 16, lineHeight: 1.2,
          }}>
            Your Exam Is <span style={{ color: G.gold }}>Waiting.</span><br />
            Are You Ready?
          </h2>
          <p style={{ color: G.sub, fontSize: 17, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.8 }}>
            Join 50,000+ aspirants already using ExamAce. Start your free preparation today — no credit card, no catch.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <GlowButton size="lg" onClick={onCTA}>Create Free Account →</GlowButton>
            <GlowButton size="lg" variant="ghost" onClick={onCTA}>Browse Mock Tests</GlowButton>
          </div>
          <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["✅ 100% Free", "✅ No Credit Card", "✅ Instant Access", "✅ All Exams Covered"].map(f => (
              <span key={f} style={{ color: G.sub, fontSize: 13 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const links = {
    "Exams": ["SSC CGL", "SSC CHSL", "UPSC CSE", "IBPS PO", "SBI PO", "JEE Main"],
    "Platform": ["Mock Tests", "Analytics", "AI Guidance", "Leaderboard", "Previous Papers"],
    "Company": ["About Us", "Blog", "Careers", "Contact", "Privacy Policy"],
  };
  return (
    <footer style={{ background: G.card, borderTop: `1px solid ${G.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${G.gold}, #C89030)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#04080F", fontFamily: "'Playfair Display',serif" }}>E</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 16, color: G.gold, letterSpacing: 2 }}>EXAMACE</div>
            </div>
            <p style={{ color: G.sub, fontSize: 14, lineHeight: 1.8, maxWidth: 280, marginBottom: 24 }}>
              India's premier free mock test platform for SSC, UPSC, JEE, and Banking exams. Built for aspirants, by aspirants.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["📘", "🐦", "📷", "▶️"].map((ic, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: 10, background: G.bg, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>{ic}</div>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <div style={{ fontWeight: 700, fontSize: 13, color: G.text, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>{title}</div>
              {items.map(item => (
                <div key={item} style={{ color: G.sub, fontSize: 13, marginBottom: 12, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseOver={e => e.target.style.color = G.gold}
                  onMouseOut={e => e.target.style.color = G.sub}
                >{item}</div>
              ))}
            </div>
          ))}
        </div>
        <GoldLine />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ color: G.muted, fontSize: 13 }}>© 2025 ExamAce. All rights reserved. Made with ❤️ for India's aspirants.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Terms", "Privacy", "Sitemap"].map(l => (
              <span key={l} style={{ color: G.muted, fontSize: 13, cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function App() {
  const handleCTA = () => window.location.href = "/login";

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: G.bg, minHeight: "100vh" }}>
        <Navbar onCTA={handleCTA} />
        <HeroSection onCTA={handleCTA} />
        <GoldLine />
        <ExamsSection />
        <GoldLine />
        <FeaturesSection />
        <GoldLine />
        <HowItWorksSection />
        <GoldLine />
        <TestimonialsSection />
        <CTASection onCTA={handleCTA} />
        <Footer />
      </div>
    </>
  );
}