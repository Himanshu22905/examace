<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const G = {
  bg:      "#030508",
  panel:   "#06090F",
  card:    "#090E18",
  cardHi:  "#0C1220",
  border:  "#0F1C2E",
  border2: "#162840",
  gold:    "#E8B84B",
  goldLo:  "#E8B84B12",
  goldMid: "#E8B84B40",
  cyan:    "#22D3EE",
  green:   "#34D399",
  red:     "#F87171",
  orange:  "#FB923C",
  purple:  "#A78BFA",
  blue:    "#60A5FA",
  text:    "#EEF2FF",
  sub:     "#7090B0",
  muted:   "#2A4060",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,600;1,500&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Outfit', sans-serif; background: #030508; color: #EEF2FF; overflow-x: hidden; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #030508; }
::-webkit-scrollbar-thumb { background: #162840; border-radius: 2px; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes barRise  { from { height:0; } to { height:var(--h); } }
@keyframes lineGrow { from { stroke-dashoffset:1000; } to { stroke-dashoffset:0; } }
@keyframes countUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
@keyframes spinSlow { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes shimmer  { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }
@keyframes dotPop   { 0%{transform:scale(0);}70%{transform:scale(1.3);}100%{transform:scale(1);} }
@keyframes glow     { 0%,100%{box-shadow:0 0 20px #E8B84B18;}50%{box-shadow:0 0 40px #E8B84B38;} }

.fade-up  { animation: fadeUp  0.5s ease forwards; }
.fade-in  { animation: fadeIn  0.35s ease forwards; }

.tab-btn {
  padding: 9px 20px; border-radius: 9px; border: none;
  font-family: 'Outfit',sans-serif; font-weight: 600; font-size: 13px;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.tab-btn.active  { background: #E8B84B; color: #030508; }
.tab-btn.inactive{ background: transparent; color: #7090B0; }
.tab-btn.inactive:hover { background: #E8B84B14; color: #E8B84B; }

.filter-chip {
  padding: 6px 16px; border-radius: 999px; border: 1px solid #162840;
  background: transparent; color: #7090B0;
  font-family: 'Outfit',sans-serif; font-weight: 600; font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}
.filter-chip.active  { background: #E8B84B14; border-color: #E8B84B44; color: #E8B84B; }
.filter-chip:hover:not(.active) { border-color: #E8B84B33; color: #EEF2FF; }

.row-item {
  display: grid; align-items: center; gap: 14px;
  padding: 13px 16px; border-radius: 11px;
  border: 1px solid #0F1C2E; background: #06090F;
  transition: all 0.18s; cursor: pointer;
}
.row-item:hover { border-color: #E8B84B33; background: #0C1220; transform: translateX(3px); }

.card-base {
  background: #090E18; border: 1px solid #0F1C2E;
  border-radius: 18px; padding: 22px 24px;
  transition: border-color 0.2s;
}
.card-base:hover { border-color: #E8B84B22; }

.mono { font-family: 'JetBrains Mono', monospace; }
`;

/* ─── SEED DATA ──────────────────────────────────────────────── */

// 30 mock test history entries
const TEST_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const types   = ["Full Mock","Sectional","Topic-wise","PYQ"];
  const subs    = ["SSC CGL","SSC CHSL","Banking","Reasoning","Quant","English"];
  const scores  = [48,55,58,60,62,65,67,68,70,71,72,74,74,75,76,77,78,78,79,80,81,82,83,84,85,85,86,88,90,94];
  const accs    = [52,56,58,61,63,65,67,69,70,71,72,73,74,75,75,76,77,78,78,79,80,81,82,83,84,85,86,88,90,92];
  const dates   = Array.from({ length: 30 }, (_, d) => {
    const dt = new Date(2025, 9, 1);
    dt.setDate(dt.getDate() + d * 3);
    return dt.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
  });
  return {
    id: i + 1,
    name: `${subs[i % subs.length]} ${types[i % types.length]} #${i + 1}`,
    date: dates[i],
    score: scores[i],
    maxScore: 100,
    accuracy: accs[i],
    timeTaken: 35 + Math.floor(Math.random() * 22),
    rank: 1800 - i * 18,
    correct: Math.round(accs[i] * 0.5),
    wrong: Math.round((100 - accs[i]) * 0.3),
    type: types[i % types.length],
  };
});

const TOPIC_DATA = [
  { name:"Algebra",              sub:"Quant",   attempts:14, acc:52, trend:-3,  color:G.red    },
  { name:"Reading Comprehension",sub:"English", attempts:10, acc:58, trend:+2,  color:G.red    },
  { name:"Trigonometry",         sub:"Quant",   attempts:8,  acc:62, trend:+4,  color:G.orange },
  { name:"Para Jumbles",         sub:"English", attempts:7,  acc:64, trend:+1,  color:G.orange },
  { name:"Current Affairs",      sub:"GK",      attempts:18, acc:66, trend:+5,  color:G.gold   },
  { name:"Data Interpretation",  sub:"Quant",   attempts:12, acc:70, trend:+3,  color:G.gold   },
  { name:"Syllogism",            sub:"Reasoning",attempts:15,acc:75, trend:+6,  color:G.cyan   },
  { name:"Blood Relations",      sub:"Reasoning",attempts:11,acc:78, trend:+2,  color:G.cyan   },
  { name:"Coding-Decoding",      sub:"Reasoning",attempts:9, acc:82, trend:+7,  color:G.green  },
  { name:"Percentage",           sub:"Quant",   attempts:13, acc:84, trend:+4,  color:G.green  },
  { name:"Sentence Correction",  sub:"English", attempts:10, acc:86, trend:+3,  color:G.green  },
  { name:"History",              sub:"GK",      attempts:14, acc:88, trend:+5,  color:G.green  },
];

const SUBJECT_DATA = [
  { name:"Quantitative Aptitude", icon:"📐", color:G.cyan,   acc:72, tests:12, avgTime:28, best:92, trend:+4  },
  { name:"General Reasoning",     icon:"🧠", color:G.purple, acc:85, tests:14, avgTime:22, best:96, trend:+6  },
  { name:"English Language",      icon:"📖", color:G.green,  acc:66, tests:10, avgTime:18, best:88, trend:+2  },
  { name:"General Awareness",     icon:"🌍", color:G.gold,   acc:64, tests:11, avgTime:15, best:84, trend:+3  },
];

const MONTHLY_SCORES = [
  { month:"Oct", avg:61, tests:6  },
  { month:"Nov", avg:67, tests:8  },
  { month:"Dec", avg:70, tests:7  },
  { month:"Jan", avg:73, tests:9  },
  { month:"Feb", avg:78, tests:11 },
  { month:"Mar", avg:82, tests:10 },
];

const TIME_DATA = [
  { section:"Quant",    allocated:20, used:24, perQ:3.0, color:G.cyan   },
  { section:"Reasoning",allocated:20, used:18, perQ:2.3, color:G.purple },
  { section:"English",  allocated:10, used:8,  perQ:2.0, color:G.green  },
  { section:"GK",       allocated:10, used:7,  perQ:1.8, color:G.gold   },
];

/* ─── SHARED MICRO COMPONENTS ────────────────────────────────── */
function Mono({ children, size = 14, color = G.gold, bold = true }) {
  return (
    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:size, color, fontWeight: bold ? 600 : 400 }}>
      {children}
    </span>
  );
}

function Chip({ children, color }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:color+"1A", color, border:`1px solid ${color}33`, letterSpacing:0.3 }}>
      {children}
    </span>
  );
}

function Bar({ pct, color, height = 7, animated = true }) {
  return (
    <div style={{ background:G.muted+"44", borderRadius:999, height, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:999, background:`linear-gradient(90deg, ${color}, ${color}99)`, width:`${pct}%`, transition: animated ? "width 1.3s cubic-bezier(.4,0,.2,1)" : "none" }} />
    </div>
  );
}

function TrendBadge({ val }) {
  const up = val >= 0;
  return (
    <span style={{ fontSize:11, fontWeight:700, color: up ? G.green : G.red, background: (up ? G.green : G.red)+"18", padding:"2px 8px", borderRadius:999 }}>
      {up ? "↑" : "↓"} {Math.abs(val)}%
    </span>
  );
}

function SectionHead({ title, sub, right }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18 }}>
      <div>
        <div style={{ fontWeight:700, fontSize:16, color:G.text }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:G.sub, marginTop:3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function AnimCount({ to, suffix = "", duration = 1200 }) {
  const [v, setV] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = null;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(e * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{v}{suffix}</>;
}

/* ─── CHARTS ─────────────────────────────────────────────────── */

// Simple SVG line chart
function LineChart({ data, color = G.gold, height = 120, showArea = true }) {
  const w = 100, h = 100;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / (max - min)) * h,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length-1].x},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 100 ${h}`} style={{ width:"100%", height, overflow:"visible" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`areaGrad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {showArea && <path d={area} fill={`url(#areaGrad-${color.replace("#","")})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray:1000, strokeDashoffset:1000, animation:"lineGrow 1.5s ease forwards" }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color}
          style={{ animation:`dotPop 0.3s ease ${0.05 * i}s both` }} />
      ))}
    </svg>
  );
}

// Bar chart for monthly data
function MonthlyBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.avg));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:130 }}>
      {data.map((d, i) => {
        const pct = (d.avg / maxVal) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <Mono size={11} color={isLast ? G.gold : G.sub}>{d.avg}%</Mono>
            <div style={{
              width:"100%", borderRadius:"6px 6px 0 0",
              height: `${pct}px`,
              background: isLast
                ? `linear-gradient(180deg, ${G.gold}, ${G.gold}88)`
                : `linear-gradient(180deg, ${G.cyan}88, ${G.cyan}33)`,
              boxShadow: isLast ? `0 0 16px ${G.gold}44` : "none",
              border: isLast ? `1px solid ${G.goldMid}` : "1px solid transparent",
              transition: "height 1s ease",
            }} />
            <div style={{ fontSize:11, color: isLast ? G.gold : G.sub, fontWeight: isLast ? 700 : 400 }}>{d.month}</div>
            <div style={{ fontSize:10, color:G.muted }}>{d.tests}t</div>
          </div>
        );
      })}
    </div>
  );
}

// Donut chart
function DonutChart({ correct, wrong, skipped, size = 120 }) {
  const total = correct + wrong + skipped || 1;
  const r = 38, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const cPct = (correct / total) * circ;
  const wPct = (wrong   / total) * circ;
  const sPct = (skipped / total) * circ;
  const segments = [
    { pct:cPct, offset:0,          color:G.green  },
    { pct:wPct, offset:cPct,       color:G.red    },
    { pct:sPct, offset:cPct+wPct,  color:G.muted  },
  ];
  return (
    <svg viewBox="0 0 100 100" style={{ width:size, height:size }} >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={G.border2} strokeWidth="10" />
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth="10"
          strokeDasharray={`${s.pct} ${circ - s.pct}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          strokeLinecap="butt"
          style={{ transition:"stroke-dasharray 1.2s ease" }} />
      ))}
      <text x={cx} y={cy-4} textAnchor="middle" fill={G.gold} fontSize="13" fontFamily="JetBrains Mono" fontWeight="600">
        {Math.round((correct/total)*100)}%
      </text>
      <text x={cx} y={cy+10} textAnchor="middle" fill={G.sub} fontSize="7" fontFamily="Outfit">
        accuracy
      </text>
    </svg>
  );
}

// Radar-like hexagonal chart (SVG)
function RadarChart({ data, size = 200 }) {
  const cx = 50, cy = 50, r = 36;
  const n = data.length;
  const angles = data.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);
  const toXY = (angle, radius) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });
  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = data.map((d, i) => toXY(angles[i], (d.acc / 100) * r));
  const shapePath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  return (
    <svg viewBox="0 0 100 100" style={{ width:size, height:size }}>
      {/* Grid rings */}
      {rings.map((ring, ri) => (
        <polygon key={ri}
          points={angles.map(a => { const p = toXY(a, r * ring); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke={G.border2} strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {angles.map((a, i) => {
        const end = toXY(a, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={G.border2} strokeWidth="0.5" />;
      })}
      {/* Data shape */}
      <path d={shapePath} fill={`${G.gold}22`} stroke={G.gold} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={G.gold} />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const lPos = toXY(angles[i], r + 10);
        return (
          <text key={i} x={lPos.x} y={lPos.y} textAnchor="middle"
            fill={G.sub} fontSize="5.5" fontFamily="Outfit" dominantBaseline="middle">
            {d.icon}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── OVERVIEW TAB ───────────────────────────────────────────── */
function OverviewTab() {
  const scores = TEST_HISTORY.map(t => t.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const totalTests = TEST_HISTORY.length;
  const totalCorrect = TEST_HISTORY.reduce((a, t) => a + t.correct, 0);
  const totalWrong   = TEST_HISTORY.reduce((a, t) => a + t.wrong, 0);
  const totalSkipped = totalTests * 50 - totalCorrect - totalWrong;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
        {[
          { label:"Tests Attempted", val:totalTests,      suffix:"",   icon:"📝", color:G.cyan,   sub:"last 3 months"     },
          { label:"Avg Score",       val:avgScore,        suffix:"%",  icon:"⭐", color:G.gold,   sub:"↑ 14% since start"  },
          { label:"Best Score",      val:bestScore,       suffix:"%",  icon:"🏆", color:G.green,  sub:"SSC CGL Mock #30"   },
          { label:"Overall Accuracy",val:Math.round((totalCorrect/(totalCorrect+totalWrong))*100), suffix:"%", icon:"🎯", color:G.purple, sub:"correct / attempted" },
          { label:"Current Rank",    val:"#1,247",        suffix:"",   icon:"🥇", color:G.orange, sub:"of 52K students", raw:true },
        ].map((k, i) => (
          <div key={i} className="card-base fade-up" style={{ animationDelay:`${i*0.07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:k.color+"18", border:`1px solid ${k.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{k.icon}</div>
              <div style={{ width:6, height:6, borderRadius:"50%", background:G.green, boxShadow:`0 0 6px ${G.green}`, marginTop:4 }} />
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:28, fontWeight:700, color:k.color, lineHeight:1 }}>
              {k.raw ? k.val : <AnimCount to={k.val} suffix={k.suffix} />}
            </div>
            <div style={{ fontSize:12, color:G.sub, marginTop:6 }}>{k.label}</div>
            <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress Over Time + Donut */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:16 }}>
        <div className="card-base fade-up">
          <SectionHead title="📈 Score Progress Over Time" sub="Last 30 tests — consistent improvement trend" />
          <LineChart data={scores} color={G.gold} height={130} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
            {["Oct 1","Oct 15","Nov 1","Nov 15","Dec 1","Dec 15","Jan 1","Jan 15","Feb 1","Mar 1"].map((l,i) => (
              <span key={i} style={{ fontSize:9, color:G.muted }}>{i%3===0 ? l : ""}</span>
            ))}
          </div>
        </div>
        <div className="card-base fade-up" style={{ width:220, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:G.text }}>Answer Breakdown</div>
          <DonutChart correct={totalCorrect} wrong={totalWrong} skipped={Math.max(0,totalSkipped)} />
          {[
            [G.green,"Correct",totalCorrect],
            [G.red,"Wrong",totalWrong],
            [G.muted,"Skipped",Math.max(0,totalSkipped)],
          ].map(([c,l,v]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 10px", background:G.panel, borderRadius:8 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:c, flexShrink:0 }} />
              <span style={{ fontSize:12, color:G.sub, flex:1 }}>{l}</span>
              <Mono size={13} color={c}>{v}</Mono>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly + Radar */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card-base fade-up">
          <SectionHead title="📅 Monthly Performance" sub="Average score per month" />
          <MonthlyBarChart data={MONTHLY_SCORES} />
        </div>
        <div className="card-base fade-up">
          <SectionHead title="🕸 Subject Radar" sub="Balanced performance overview" />
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <RadarChart data={SUBJECT_DATA} size={180} />
            <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
              {SUBJECT_DATA.map((s, i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:G.sub }}>{s.icon} {s.name.split(" ")[0]}</span>
                    <Mono size={12} color={s.color}>{s.acc}%</Mono>
                  </div>
                  <Bar pct={s.acc} color={s.color} height={5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="card-base fade-up" style={{ border:`1px solid ${G.gold}33`, background:`linear-gradient(135deg, #0C1428, #080E1A)`, animation:"glow 4s ease infinite" }}>
        <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>
          <div style={{ width:52, height:52, borderRadius:14, background:G.goldLo, border:`1.5px solid ${G.goldMid}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:G.gold, marginBottom:8 }}>AI Performance Insight — March 2026</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[
                { icon:"📈", title:"Biggest Improvement", val:"Coding-Decoding +7%", color:G.green },
                { icon:"⚠️", title:"Needs Most Work",     val:"Algebra — 52% acc",   color:G.red   },
                { icon:"⏱",  title:"Time Management",    val:"Quant 4 min over",    color:G.orange},
              ].map((ins,i) => (
                <div key={i} style={{ padding:"12px 14px", background:G.bg, borderRadius:12, border:`1px solid ${G.border2}` }}>
                  <div style={{ fontSize:18, marginBottom:6 }}>{ins.icon}</div>
                  <div style={{ fontSize:11, color:G.sub, marginBottom:3 }}>{ins.title}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:ins.color }}>{ins.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUBJECT ANALYSIS TAB ───────────────────────────────────── */
function SubjectTab() {
  const [selected, setSelected] = useState(0);
  const s = SUBJECT_DATA[selected];
  const mockScores = [55, 60, 58, 63, 67, 70, 72, 68, 74, 76, 78, s.acc];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Subject selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {SUBJECT_DATA.map((sub, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{
            padding:"18px", borderRadius:16,
            border:`1.5px solid ${selected===i ? sub.color : G.border}`,
            background: selected===i ? sub.color+"14" : G.card,
            cursor:"pointer", transition:"all 0.2s",
            boxShadow: selected===i ? `0 0 20px ${sub.color}22` : "none",
          }}>
            <div style={{ fontSize:26, marginBottom:10 }}>{sub.icon}</div>
            <div style={{ fontWeight:700, fontSize:14, color: selected===i ? sub.color : G.text, marginBottom:4 }}>{sub.name.split(" ").slice(0,2).join(" ")}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, color:sub.color }}>{sub.acc}%</div>
            <TrendBadge val={sub.trend} />
          </div>
        ))}
      </div>

      {/* Detail for selected */}
      <div className="fade-in" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        <div className="card-base">
          <SectionHead title={`📈 ${s.name} — Score Trend`} sub="Last 12 attempts" />
          <LineChart data={mockScores} color={s.color} height={140} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:16 }}>
            {[
              ["Tests",    s.tests,          G.cyan  ],
              ["Current", s.acc+"%",         s.color ],
              ["Best",    s.best+"%",         G.green ],
              ["Avg Time",s.avgTime+"min",    G.purple],
            ].map(([l,v,c]) => (
              <div key={l} style={{ background:G.panel, borderRadius:10, padding:"12px", textAlign:"center" }}>
                <Mono size={18} color={c}>{v}</Mono>
                <div style={{ fontSize:11, color:G.sub, marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base">
          <SectionHead title="Topic Breakdown" />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TOPIC_DATA.filter(t => {
              const map = { 0:"Quant", 1:"Reasoning", 2:"English", 3:"GK" };
              return t.sub.toLowerCase().includes(map[selected]?.toLowerCase()) ||
                (selected===0 && t.sub==="Quant") ||
                (selected===1 && t.sub==="Reasoning") ||
                (selected===2 && t.sub==="English") ||
                (selected===3 && t.sub==="GK");
            }).slice(0,6).map((t, i) => (
              <div key={i} style={{ padding:"10px 12px", background:G.panel, borderRadius:10, border:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{t.name}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <TrendBadge val={t.trend} />
                    <Mono size={13} color={t.color}>{t.acc}%</Mono>
                  </div>
                </div>
                <Bar pct={t.acc} color={t.color} height={5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TOPIC ANALYSIS TAB ─────────────────────────────────────── */
function TopicTab() {
  const [sort, setSort] = useState("acc");
  const sorted = [...TOPIC_DATA].sort((a, b) => sort === "acc" ? a.acc - b.acc : b.attempts - a.attempts);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Weak topics */}
        <div className="card-base">
          <SectionHead
            title="⚠️ Weak Topics (< 70%)"
            sub="Focus here for maximum score boost"
            right={<Chip color={G.red}>{TOPIC_DATA.filter(t => t.acc < 70).length} topics</Chip>}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TOPIC_DATA.filter(t => t.acc < 70).map((t, i) => (
              <div key={i} style={{ padding:"12px 14px", background:G.panel, borderRadius:12, border:`1.5px solid ${t.color}33` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:G.sub, marginTop:2 }}>{t.sub} · {t.attempts} sessions</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <Mono size={16} color={t.color}>{t.acc}%</Mono>
                    <TrendBadge val={t.trend} />
                  </div>
                </div>
                <Bar pct={t.acc} color={t.color} height={6} />
                <div style={{ marginTop:8, display:"flex", gap:6 }}>
                  <button style={{ padding:"5px 14px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:7, color:G.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    Practice →
                  </button>
                  <button style={{ padding:"5px 14px", background:G.card, border:`1px solid ${G.border2}`, borderRadius:7, color:G.sub, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    Watch Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strong topics */}
        <div className="card-base">
          <SectionHead
            title="✅ Strong Topics (≥ 70%)"
            sub="Maintain these, don't neglect"
            right={<Chip color={G.green}>{TOPIC_DATA.filter(t => t.acc >= 70).length} topics</Chip>}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TOPIC_DATA.filter(t => t.acc >= 70).map((t, i) => (
              <div key={i} style={{ padding:"12px 14px", background:G.panel, borderRadius:10, border:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:600 }}>{t.name}</span>
                    <span style={{ fontSize:11, color:G.sub, marginLeft:8 }}>{t.sub}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <TrendBadge val={t.trend} />
                    <Mono size={14} color={t.color}>{t.acc}%</Mono>
                  </div>
                </div>
                <Bar pct={t.acc} color={t.color} height={5} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full topic table */}
      <div className="card-base">
        <SectionHead
          title="📊 All Topics — Full Breakdown"
          sub={`${TOPIC_DATA.length} topics tracked across all subjects`}
          right={
            <div style={{ display:"flex", gap:6 }}>
              {[["acc","By Accuracy"],["attempts","By Attempts"]].map(([k,l]) => (
                <button key={k} onClick={() => setSort(k)} className={`filter-chip${sort===k?" active":""}`}>{l}</button>
              ))}
            </div>
          }
        />
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px 100px", gap:14, padding:"8px 14px", fontSize:11, color:G.muted, fontWeight:700, letterSpacing:1 }}>
            <span>TOPIC</span><span style={{ textAlign:"center" }}>SUBJECT</span><span style={{ textAlign:"center" }}>ACCURACY</span><span style={{ textAlign:"center" }}>SESSIONS</span><span style={{ textAlign:"center" }}>TREND</span><span style={{ textAlign:"center" }}>ACTION</span>
          </div>
          {sorted.map((t, i) => (
            <div key={i} className="row-item" style={{ gridTemplateColumns:"1fr 80px 80px 80px 80px 100px" }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{t.name}</div>
              <div style={{ textAlign:"center" }}><Chip color={t.color}>{t.sub}</Chip></div>
              <div style={{ textAlign:"center" }}>
                <Mono size={14} color={t.acc < 60 ? G.red : t.acc < 75 ? G.gold : G.green}>{t.acc}%</Mono>
              </div>
              <div style={{ textAlign:"center" }}><Mono size={13} color={G.sub}>{t.attempts}</Mono></div>
              <div style={{ textAlign:"center" }}><TrendBadge val={t.trend} /></div>
              <div style={{ textAlign:"center" }}>
                <button style={{ padding:"5px 14px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:7, color:G.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>Practice</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TIME MANAGEMENT TAB ────────────────────────────────────── */
function TimeTab() {
  const avgTotalTime = 47;
  const examTime = 60;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Avg Test Duration", val:"47 min",  icon:"⏱",  color:G.cyan,   sub:"of 60 min allotted"   },
          { label:"Time Saved",        val:"13 min",  icon:"⚡",  color:G.green,  sub:"per test on average"  },
          { label:"Slowest Section",   val:"Quant",   icon:"🐢",  color:G.orange, sub:"4 min over budget"    },
          { label:"Fastest Section",   val:"GK",      icon:"🚀",  color:G.purple, sub:"3 min under budget"   },
        ].map((k, i) => (
          <div key={i} className="card-base">
            <div style={{ fontSize:28, marginBottom:10 }}>{k.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:700, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:12, color:G.sub, marginTop:6 }}>{k.label}</div>
            <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Section time breakdown */}
      <div className="card-base">
        <SectionHead title="⏱ Section Time Breakdown" sub="Allocated vs actual time spent per section" />
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {TIME_DATA.map((t, i) => (
            <div key={i} style={{ padding:"16px 20px", background:G.panel, borderRadius:14, border:`1px solid ${G.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{t.section}</div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:12, color:G.sub }}>Budget: <Mono size={13} color={G.sub}>{t.allocated}m</Mono></span>
                  <span style={{ fontSize:12, color:G.sub }}>Used: <Mono size={13} color={t.used > t.allocated ? G.red : G.green}>{t.used}m</Mono></span>
                  <span style={{ fontSize:12, color:G.sub }}>Per Q: <Mono size={13} color={t.color}>{t.perQ}m</Mono></span>
                  {t.used > t.allocated
                    ? <Chip color={G.red}>+{t.used - t.allocated}m over</Chip>
                    : <Chip color={G.green}>−{t.allocated - t.used}m saved</Chip>
                  }
                </div>
              </div>
              {/* Stacked bar */}
              <div style={{ position:"relative", height:18, borderRadius:999, background:G.muted+"44", overflow:"hidden" }}>
                <div style={{ position:"absolute", left:0, top:0, height:"100%", background:`linear-gradient(90deg, ${t.color}, ${t.color}99)`, width:`${(t.allocated / 60) * 100}%`, borderRadius:999, transition:"width 1s ease" }} />
                <div style={{ position:"absolute", left:0, top:0, height:"100%", background:`${t.used > t.allocated ? G.red : t.color}66`, width:`${(t.used / 60) * 100}%`, borderRadius:999, border:`1px dashed ${t.used > t.allocated ? G.red : t.color}`, transition:"width 1.2s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:G.muted }}>0 min</span>
                <span style={{ fontSize:11, color:G.muted }}>60 min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time trend */}
      <div className="card-base">
        <SectionHead title="📉 Time Taken Trend" sub="Minutes used per test (last 20 tests)" />
        <LineChart data={TEST_HISTORY.slice(10).map(t => t.timeTaken)} color={G.cyan} height={120} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <span style={{ fontSize:11, color:G.sub }}>Goal: Complete in under 50 min with 90%+ accuracy</span>
          <span style={{ fontSize:11, color:G.green }}>✓ Achieved in last 4 tests</span>
        </div>
      </div>
    </div>
  );
}

/* ─── TEST HISTORY TAB ───────────────────────────────────────── */
function HistoryTab() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All","Full Mock","Sectional","Topic-wise","PYQ"];
  const filtered = TEST_HISTORY
    .filter(t => filter === "All" || t.type === filter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .reverse();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Controls */}
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, border:`1px solid ${G.border2}`, borderRadius:10, padding:"8px 14px", flex:1, maxWidth:280 }}>
          <span style={{ fontSize:14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
            style={{ background:"transparent", border:"none", outline:"none", color:G.text, fontFamily:"'Outfit',sans-serif", fontSize:13, width:"100%" }} />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-chip${filter===f?" active":""}`}>{f}</button>
          ))}
        </div>
        <Chip color={G.sub}>{filtered.length} tests</Chip>
      </div>

      {/* Table header */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 80px 80px 80px 80px 80px 80px", gap:14, padding:"10px 16px", background:G.panel, borderRadius:10, fontSize:11, color:G.muted, fontWeight:700, letterSpacing:1 }}>
        <span>#</span><span>TEST NAME</span><span style={{ textAlign:"center" }}>DATE</span><span style={{ textAlign:"center" }}>SCORE</span><span style={{ textAlign:"center" }}>ACCURACY</span><span style={{ textAlign:"center" }}>TIME</span><span style={{ textAlign:"center" }}>RANK</span><span style={{ textAlign:"center" }}>ACTION</span>
      </div>

      {/* Rows */}
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {filtered.map((t, i) => {
          const badge = t.accuracy >= 85 ? [G.green,"Excellent"] : t.accuracy >= 75 ? [G.cyan,"Good"] : t.accuracy >= 65 ? [G.gold,"Average"] : [G.red,"Needs Work"];
          return (
            <div key={t.id} className="row-item" style={{ gridTemplateColumns:"auto 1fr 80px 80px 80px 80px 80px 80px" }}>
              <Mono size={12} color={G.muted}>{String(filtered.length - i).padStart(2,"0")}</Mono>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{t.name}</div>
                <Chip color={
                  t.type==="Full Mock"?G.cyan:t.type==="Sectional"?G.purple:t.type==="PYQ"?G.gold:G.green
                }>{t.type}</Chip>
              </div>
              <div style={{ textAlign:"center", fontSize:12, color:G.sub }}>{t.date}</div>
              <div style={{ textAlign:"center" }}>
                <Mono size={14} color={G.text}>{t.score}</Mono>
                <div style={{ fontSize:10, color:G.muted }}>/{t.maxScore}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <Chip color={badge[0]}>{t.accuracy}%</Chip>
              </div>
              <div style={{ textAlign:"center" }}><Mono size={12} color={G.sub}>{t.timeTaken}m</Mono></div>
              <div style={{ textAlign:"center" }}><Mono size={12} color={G.purple}>#{t.rank}</Mono></div>
              <div style={{ textAlign:"center" }}>
                <button style={{ padding:"5px 12px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:7, color:G.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>Review</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("overview");
  const TABS = [
    { id:"overview", label:"📊 Overview"         },
    { id:"subject",  label:"📐 Subject Analysis"  },
    { id:"topic",    label:"🎯 Topic Analysis"     },
    { id:"time",     label:"⏱ Time Management"    },
    { id:"history",  label:"📋 Test History"       },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:G.bg }}>

        {/* Page Header */}
        <div style={{ background:G.panel, borderBottom:`1px solid ${G.border}`, padding:"0 32px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ padding:"22px 0 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:G.sub, letterSpacing:2.5, textTransform:"uppercase", marginBottom:6 }}>Mockies · Performance Hub</div>
                <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:600, letterSpacing:0.5 }}>
                  Analytics & <em style={{ color:G.gold }}>Results</em>
                </h1>
                <p style={{ color:G.sub, fontSize:13, marginTop:5 }}>
                  Arjun Sharma · SSC CGL 2025 · <span style={{ color:G.green }}>38 tests</span> · Last updated today
                </p>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <button style={{ padding:"9px 20px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:10, color:G.gold, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  📥 Export Report
                </button>
                <button style={{ padding:"9px 20px", background:`linear-gradient(135deg, ${G.gold}, #C89030)`, border:"none", borderRadius:10, color:"#030508", fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  🚀 Take a Test →
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:2, marginTop:16, paddingBottom:0 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab===t.id?"active":"inactive"}`}
                  style={{ borderBottom: tab===t.id ? `2px solid ${G.gold}` : "2px solid transparent", borderRadius:"8px 8px 0 0", paddingBottom:12 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 32px" }}>
          <div key={tab} className="fade-in">
            {tab === "overview" && <OverviewTab />}
            {tab === "subject"  && <SubjectTab  />}
            {tab === "topic"    && <TopicTab    />}
            {tab === "time"     && <TimeTab     />}
            {tab === "history"  && <HistoryTab  />}
          </div>
        </div>
      </div>
    </>
  );
=======
import { useState, useEffect, useRef } from "react";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const G = {
  bg:      "#030508",
  panel:   "#06090F",
  card:    "#090E18",
  cardHi:  "#0C1220",
  border:  "#0F1C2E",
  border2: "#162840",
  gold:    "#E8B84B",
  goldLo:  "#E8B84B12",
  goldMid: "#E8B84B40",
  cyan:    "#22D3EE",
  green:   "#34D399",
  red:     "#F87171",
  orange:  "#FB923C",
  purple:  "#A78BFA",
  blue:    "#60A5FA",
  text:    "#EEF2FF",
  sub:     "#7090B0",
  muted:   "#2A4060",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,600;1,500&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Outfit', sans-serif; background: #030508; color: #EEF2FF; overflow-x: hidden; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #030508; }
::-webkit-scrollbar-thumb { background: #162840; border-radius: 2px; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes barRise  { from { height:0; } to { height:var(--h); } }
@keyframes lineGrow { from { stroke-dashoffset:1000; } to { stroke-dashoffset:0; } }
@keyframes countUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
@keyframes spinSlow { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes shimmer  { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }
@keyframes dotPop   { 0%{transform:scale(0);}70%{transform:scale(1.3);}100%{transform:scale(1);} }
@keyframes glow     { 0%,100%{box-shadow:0 0 20px #E8B84B18;}50%{box-shadow:0 0 40px #E8B84B38;} }

.fade-up  { animation: fadeUp  0.5s ease forwards; }
.fade-in  { animation: fadeIn  0.35s ease forwards; }

.tab-btn {
  padding: 9px 20px; border-radius: 9px; border: none;
  font-family: 'Outfit',sans-serif; font-weight: 600; font-size: 13px;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.tab-btn.active  { background: #E8B84B; color: #030508; }
.tab-btn.inactive{ background: transparent; color: #7090B0; }
.tab-btn.inactive:hover { background: #E8B84B14; color: #E8B84B; }

.filter-chip {
  padding: 6px 16px; border-radius: 999px; border: 1px solid #162840;
  background: transparent; color: #7090B0;
  font-family: 'Outfit',sans-serif; font-weight: 600; font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}
.filter-chip.active  { background: #E8B84B14; border-color: #E8B84B44; color: #E8B84B; }
.filter-chip:hover:not(.active) { border-color: #E8B84B33; color: #EEF2FF; }

.row-item {
  display: grid; align-items: center; gap: 14px;
  padding: 13px 16px; border-radius: 11px;
  border: 1px solid #0F1C2E; background: #06090F;
  transition: all 0.18s; cursor: pointer;
}
.row-item:hover { border-color: #E8B84B33; background: #0C1220; transform: translateX(3px); }

.card-base {
  background: #090E18; border: 1px solid #0F1C2E;
  border-radius: 18px; padding: 22px 24px;
  transition: border-color 0.2s;
}
.card-base:hover { border-color: #E8B84B22; }

.mono { font-family: 'JetBrains Mono', monospace; }
`;

/* ─── SEED DATA ──────────────────────────────────────────────── */

// 30 mock test history entries
const TEST_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const types   = ["Full Mock","Sectional","Topic-wise","PYQ"];
  const subs    = ["SSC CGL","SSC CHSL","Banking","Reasoning","Quant","English"];
  const scores  = [48,55,58,60,62,65,67,68,70,71,72,74,74,75,76,77,78,78,79,80,81,82,83,84,85,85,86,88,90,94];
  const accs    = [52,56,58,61,63,65,67,69,70,71,72,73,74,75,75,76,77,78,78,79,80,81,82,83,84,85,86,88,90,92];
  const dates   = Array.from({ length: 30 }, (_, d) => {
    const dt = new Date(2025, 9, 1);
    dt.setDate(dt.getDate() + d * 3);
    return dt.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
  });
  return {
    id: i + 1,
    name: `${subs[i % subs.length]} ${types[i % types.length]} #${i + 1}`,
    date: dates[i],
    score: scores[i],
    maxScore: 100,
    accuracy: accs[i],
    timeTaken: 35 + Math.floor(Math.random() * 22),
    rank: 1800 - i * 18,
    correct: Math.round(accs[i] * 0.5),
    wrong: Math.round((100 - accs[i]) * 0.3),
    type: types[i % types.length],
  };
});

const TOPIC_DATA = [
  { name:"Algebra",              sub:"Quant",   attempts:14, acc:52, trend:-3,  color:G.red    },
  { name:"Reading Comprehension",sub:"English", attempts:10, acc:58, trend:+2,  color:G.red    },
  { name:"Trigonometry",         sub:"Quant",   attempts:8,  acc:62, trend:+4,  color:G.orange },
  { name:"Para Jumbles",         sub:"English", attempts:7,  acc:64, trend:+1,  color:G.orange },
  { name:"Current Affairs",      sub:"GK",      attempts:18, acc:66, trend:+5,  color:G.gold   },
  { name:"Data Interpretation",  sub:"Quant",   attempts:12, acc:70, trend:+3,  color:G.gold   },
  { name:"Syllogism",            sub:"Reasoning",attempts:15,acc:75, trend:+6,  color:G.cyan   },
  { name:"Blood Relations",      sub:"Reasoning",attempts:11,acc:78, trend:+2,  color:G.cyan   },
  { name:"Coding-Decoding",      sub:"Reasoning",attempts:9, acc:82, trend:+7,  color:G.green  },
  { name:"Percentage",           sub:"Quant",   attempts:13, acc:84, trend:+4,  color:G.green  },
  { name:"Sentence Correction",  sub:"English", attempts:10, acc:86, trend:+3,  color:G.green  },
  { name:"History",              sub:"GK",      attempts:14, acc:88, trend:+5,  color:G.green  },
];

const SUBJECT_DATA = [
  { name:"Quantitative Aptitude", icon:"📐", color:G.cyan,   acc:72, tests:12, avgTime:28, best:92, trend:+4  },
  { name:"General Reasoning",     icon:"🧠", color:G.purple, acc:85, tests:14, avgTime:22, best:96, trend:+6  },
  { name:"English Language",      icon:"📖", color:G.green,  acc:66, tests:10, avgTime:18, best:88, trend:+2  },
  { name:"General Awareness",     icon:"🌍", color:G.gold,   acc:64, tests:11, avgTime:15, best:84, trend:+3  },
];

const MONTHLY_SCORES = [
  { month:"Oct", avg:61, tests:6  },
  { month:"Nov", avg:67, tests:8  },
  { month:"Dec", avg:70, tests:7  },
  { month:"Jan", avg:73, tests:9  },
  { month:"Feb", avg:78, tests:11 },
  { month:"Mar", avg:82, tests:10 },
];

const TIME_DATA = [
  { section:"Quant",    allocated:20, used:24, perQ:3.0, color:G.cyan   },
  { section:"Reasoning",allocated:20, used:18, perQ:2.3, color:G.purple },
  { section:"English",  allocated:10, used:8,  perQ:2.0, color:G.green  },
  { section:"GK",       allocated:10, used:7,  perQ:1.8, color:G.gold   },
];

/* ─── SHARED MICRO COMPONENTS ────────────────────────────────── */
function Mono({ children, size = 14, color = G.gold, bold = true }) {
  return (
    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:size, color, fontWeight: bold ? 600 : 400 }}>
      {children}
    </span>
  );
}

function Chip({ children, color }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700, background:color+"1A", color, border:`1px solid ${color}33`, letterSpacing:0.3 }}>
      {children}
    </span>
  );
}

function Bar({ pct, color, height = 7, animated = true }) {
  return (
    <div style={{ background:G.muted+"44", borderRadius:999, height, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:999, background:`linear-gradient(90deg, ${color}, ${color}99)`, width:`${pct}%`, transition: animated ? "width 1.3s cubic-bezier(.4,0,.2,1)" : "none" }} />
    </div>
  );
}

function TrendBadge({ val }) {
  const up = val >= 0;
  return (
    <span style={{ fontSize:11, fontWeight:700, color: up ? G.green : G.red, background: (up ? G.green : G.red)+"18", padding:"2px 8px", borderRadius:999 }}>
      {up ? "↑" : "↓"} {Math.abs(val)}%
    </span>
  );
}

function SectionHead({ title, sub, right }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18 }}>
      <div>
        <div style={{ fontWeight:700, fontSize:16, color:G.text }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:G.sub, marginTop:3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function AnimCount({ to, suffix = "", duration = 1200 }) {
  const [v, setV] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = null;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(e * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{v}{suffix}</>;
}

/* ─── CHARTS ─────────────────────────────────────────────────── */

// Simple SVG line chart
function LineChart({ data, color = G.gold, height = 120, showArea = true }) {
  const w = 100, h = 100;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / (max - min)) * h,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length-1].x},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 100 ${h}`} style={{ width:"100%", height, overflow:"visible" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`areaGrad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {showArea && <path d={area} fill={`url(#areaGrad-${color.replace("#","")})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray:1000, strokeDashoffset:1000, animation:"lineGrow 1.5s ease forwards" }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color}
          style={{ animation:`dotPop 0.3s ease ${0.05 * i}s both` }} />
      ))}
    </svg>
  );
}

// Bar chart for monthly data
function MonthlyBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.avg));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:130 }}>
      {data.map((d, i) => {
        const pct = (d.avg / maxVal) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <Mono size={11} color={isLast ? G.gold : G.sub}>{d.avg}%</Mono>
            <div style={{
              width:"100%", borderRadius:"6px 6px 0 0",
              height: `${pct}px`,
              background: isLast
                ? `linear-gradient(180deg, ${G.gold}, ${G.gold}88)`
                : `linear-gradient(180deg, ${G.cyan}88, ${G.cyan}33)`,
              boxShadow: isLast ? `0 0 16px ${G.gold}44` : "none",
              border: isLast ? `1px solid ${G.goldMid}` : "1px solid transparent",
              transition: "height 1s ease",
            }} />
            <div style={{ fontSize:11, color: isLast ? G.gold : G.sub, fontWeight: isLast ? 700 : 400 }}>{d.month}</div>
            <div style={{ fontSize:10, color:G.muted }}>{d.tests}t</div>
          </div>
        );
      })}
    </div>
  );
}

// Donut chart
function DonutChart({ correct, wrong, skipped, size = 120 }) {
  const total = correct + wrong + skipped || 1;
  const r = 38, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const cPct = (correct / total) * circ;
  const wPct = (wrong   / total) * circ;
  const sPct = (skipped / total) * circ;
  const segments = [
    { pct:cPct, offset:0,          color:G.green  },
    { pct:wPct, offset:cPct,       color:G.red    },
    { pct:sPct, offset:cPct+wPct,  color:G.muted  },
  ];
  return (
    <svg viewBox="0 0 100 100" style={{ width:size, height:size }} >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={G.border2} strokeWidth="10" />
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth="10"
          strokeDasharray={`${s.pct} ${circ - s.pct}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          strokeLinecap="butt"
          style={{ transition:"stroke-dasharray 1.2s ease" }} />
      ))}
      <text x={cx} y={cy-4} textAnchor="middle" fill={G.gold} fontSize="13" fontFamily="JetBrains Mono" fontWeight="600">
        {Math.round((correct/total)*100)}%
      </text>
      <text x={cx} y={cy+10} textAnchor="middle" fill={G.sub} fontSize="7" fontFamily="Outfit">
        accuracy
      </text>
    </svg>
  );
}

// Radar-like hexagonal chart (SVG)
function RadarChart({ data, size = 200 }) {
  const cx = 50, cy = 50, r = 36;
  const n = data.length;
  const angles = data.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);
  const toXY = (angle, radius) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });
  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = data.map((d, i) => toXY(angles[i], (d.acc / 100) * r));
  const shapePath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  return (
    <svg viewBox="0 0 100 100" style={{ width:size, height:size }}>
      {/* Grid rings */}
      {rings.map((ring, ri) => (
        <polygon key={ri}
          points={angles.map(a => { const p = toXY(a, r * ring); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" stroke={G.border2} strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {angles.map((a, i) => {
        const end = toXY(a, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={G.border2} strokeWidth="0.5" />;
      })}
      {/* Data shape */}
      <path d={shapePath} fill={`${G.gold}22`} stroke={G.gold} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={G.gold} />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const lPos = toXY(angles[i], r + 10);
        return (
          <text key={i} x={lPos.x} y={lPos.y} textAnchor="middle"
            fill={G.sub} fontSize="5.5" fontFamily="Outfit" dominantBaseline="middle">
            {d.icon}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── OVERVIEW TAB ───────────────────────────────────────────── */
function OverviewTab() {
  const scores = TEST_HISTORY.map(t => t.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const totalTests = TEST_HISTORY.length;
  const totalCorrect = TEST_HISTORY.reduce((a, t) => a + t.correct, 0);
  const totalWrong   = TEST_HISTORY.reduce((a, t) => a + t.wrong, 0);
  const totalSkipped = totalTests * 50 - totalCorrect - totalWrong;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
        {[
          { label:"Tests Attempted", val:totalTests,      suffix:"",   icon:"📝", color:G.cyan,   sub:"last 3 months"     },
          { label:"Avg Score",       val:avgScore,        suffix:"%",  icon:"⭐", color:G.gold,   sub:"↑ 14% since start"  },
          { label:"Best Score",      val:bestScore,       suffix:"%",  icon:"🏆", color:G.green,  sub:"SSC CGL Mock #30"   },
          { label:"Overall Accuracy",val:Math.round((totalCorrect/(totalCorrect+totalWrong))*100), suffix:"%", icon:"🎯", color:G.purple, sub:"correct / attempted" },
          { label:"Current Rank",    val:"#1,247",        suffix:"",   icon:"🥇", color:G.orange, sub:"of 52K students", raw:true },
        ].map((k, i) => (
          <div key={i} className="card-base fade-up" style={{ animationDelay:`${i*0.07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:k.color+"18", border:`1px solid ${k.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{k.icon}</div>
              <div style={{ width:6, height:6, borderRadius:"50%", background:G.green, boxShadow:`0 0 6px ${G.green}`, marginTop:4 }} />
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:28, fontWeight:700, color:k.color, lineHeight:1 }}>
              {k.raw ? k.val : <AnimCount to={k.val} suffix={k.suffix} />}
            </div>
            <div style={{ fontSize:12, color:G.sub, marginTop:6 }}>{k.label}</div>
            <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress Over Time + Donut */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:16 }}>
        <div className="card-base fade-up">
          <SectionHead title="📈 Score Progress Over Time" sub="Last 30 tests — consistent improvement trend" />
          <LineChart data={scores} color={G.gold} height={130} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
            {["Oct 1","Oct 15","Nov 1","Nov 15","Dec 1","Dec 15","Jan 1","Jan 15","Feb 1","Mar 1"].map((l,i) => (
              <span key={i} style={{ fontSize:9, color:G.muted }}>{i%3===0 ? l : ""}</span>
            ))}
          </div>
        </div>
        <div className="card-base fade-up" style={{ width:220, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:G.text }}>Answer Breakdown</div>
          <DonutChart correct={totalCorrect} wrong={totalWrong} skipped={Math.max(0,totalSkipped)} />
          {[
            [G.green,"Correct",totalCorrect],
            [G.red,"Wrong",totalWrong],
            [G.muted,"Skipped",Math.max(0,totalSkipped)],
          ].map(([c,l,v]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"6px 10px", background:G.panel, borderRadius:8 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:c, flexShrink:0 }} />
              <span style={{ fontSize:12, color:G.sub, flex:1 }}>{l}</span>
              <Mono size={13} color={c}>{v}</Mono>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly + Radar */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card-base fade-up">
          <SectionHead title="📅 Monthly Performance" sub="Average score per month" />
          <MonthlyBarChart data={MONTHLY_SCORES} />
        </div>
        <div className="card-base fade-up">
          <SectionHead title="🕸 Subject Radar" sub="Balanced performance overview" />
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <RadarChart data={SUBJECT_DATA} size={180} />
            <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
              {SUBJECT_DATA.map((s, i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:G.sub }}>{s.icon} {s.name.split(" ")[0]}</span>
                    <Mono size={12} color={s.color}>{s.acc}%</Mono>
                  </div>
                  <Bar pct={s.acc} color={s.color} height={5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="card-base fade-up" style={{ border:`1px solid ${G.gold}33`, background:`linear-gradient(135deg, #0C1428, #080E1A)`, animation:"glow 4s ease infinite" }}>
        <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>
          <div style={{ width:52, height:52, borderRadius:14, background:G.goldLo, border:`1.5px solid ${G.goldMid}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:G.gold, marginBottom:8 }}>AI Performance Insight — March 2026</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[
                { icon:"📈", title:"Biggest Improvement", val:"Coding-Decoding +7%", color:G.green },
                { icon:"⚠️", title:"Needs Most Work",     val:"Algebra — 52% acc",   color:G.red   },
                { icon:"⏱",  title:"Time Management",    val:"Quant 4 min over",    color:G.orange},
              ].map((ins,i) => (
                <div key={i} style={{ padding:"12px 14px", background:G.bg, borderRadius:12, border:`1px solid ${G.border2}` }}>
                  <div style={{ fontSize:18, marginBottom:6 }}>{ins.icon}</div>
                  <div style={{ fontSize:11, color:G.sub, marginBottom:3 }}>{ins.title}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:ins.color }}>{ins.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SUBJECT ANALYSIS TAB ───────────────────────────────────── */
function SubjectTab() {
  const [selected, setSelected] = useState(0);
  const s = SUBJECT_DATA[selected];
  const mockScores = [55, 60, 58, 63, 67, 70, 72, 68, 74, 76, 78, s.acc];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Subject selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {SUBJECT_DATA.map((sub, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{
            padding:"18px", borderRadius:16,
            border:`1.5px solid ${selected===i ? sub.color : G.border}`,
            background: selected===i ? sub.color+"14" : G.card,
            cursor:"pointer", transition:"all 0.2s",
            boxShadow: selected===i ? `0 0 20px ${sub.color}22` : "none",
          }}>
            <div style={{ fontSize:26, marginBottom:10 }}>{sub.icon}</div>
            <div style={{ fontWeight:700, fontSize:14, color: selected===i ? sub.color : G.text, marginBottom:4 }}>{sub.name.split(" ").slice(0,2).join(" ")}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, color:sub.color }}>{sub.acc}%</div>
            <TrendBadge val={sub.trend} />
          </div>
        ))}
      </div>

      {/* Detail for selected */}
      <div className="fade-in" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        <div className="card-base">
          <SectionHead title={`📈 ${s.name} — Score Trend`} sub="Last 12 attempts" />
          <LineChart data={mockScores} color={s.color} height={140} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:16 }}>
            {[
              ["Tests",    s.tests,          G.cyan  ],
              ["Current", s.acc+"%",         s.color ],
              ["Best",    s.best+"%",         G.green ],
              ["Avg Time",s.avgTime+"min",    G.purple],
            ].map(([l,v,c]) => (
              <div key={l} style={{ background:G.panel, borderRadius:10, padding:"12px", textAlign:"center" }}>
                <Mono size={18} color={c}>{v}</Mono>
                <div style={{ fontSize:11, color:G.sub, marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base">
          <SectionHead title="Topic Breakdown" />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TOPIC_DATA.filter(t => {
              const map = { 0:"Quant", 1:"Reasoning", 2:"English", 3:"GK" };
              return t.sub.toLowerCase().includes(map[selected]?.toLowerCase()) ||
                (selected===0 && t.sub==="Quant") ||
                (selected===1 && t.sub==="Reasoning") ||
                (selected===2 && t.sub==="English") ||
                (selected===3 && t.sub==="GK");
            }).slice(0,6).map((t, i) => (
              <div key={i} style={{ padding:"10px 12px", background:G.panel, borderRadius:10, border:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{t.name}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <TrendBadge val={t.trend} />
                    <Mono size={13} color={t.color}>{t.acc}%</Mono>
                  </div>
                </div>
                <Bar pct={t.acc} color={t.color} height={5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TOPIC ANALYSIS TAB ─────────────────────────────────────── */
function TopicTab() {
  const [sort, setSort] = useState("acc");
  const sorted = [...TOPIC_DATA].sort((a, b) => sort === "acc" ? a.acc - b.acc : b.attempts - a.attempts);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Weak topics */}
        <div className="card-base">
          <SectionHead
            title="⚠️ Weak Topics (< 70%)"
            sub="Focus here for maximum score boost"
            right={<Chip color={G.red}>{TOPIC_DATA.filter(t => t.acc < 70).length} topics</Chip>}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TOPIC_DATA.filter(t => t.acc < 70).map((t, i) => (
              <div key={i} style={{ padding:"12px 14px", background:G.panel, borderRadius:12, border:`1.5px solid ${t.color}33` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:G.sub, marginTop:2 }}>{t.sub} · {t.attempts} sessions</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <Mono size={16} color={t.color}>{t.acc}%</Mono>
                    <TrendBadge val={t.trend} />
                  </div>
                </div>
                <Bar pct={t.acc} color={t.color} height={6} />
                <div style={{ marginTop:8, display:"flex", gap:6 }}>
                  <button style={{ padding:"5px 14px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:7, color:G.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    Practice →
                  </button>
                  <button style={{ padding:"5px 14px", background:G.card, border:`1px solid ${G.border2}`, borderRadius:7, color:G.sub, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    Watch Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strong topics */}
        <div className="card-base">
          <SectionHead
            title="✅ Strong Topics (≥ 70%)"
            sub="Maintain these, don't neglect"
            right={<Chip color={G.green}>{TOPIC_DATA.filter(t => t.acc >= 70).length} topics</Chip>}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TOPIC_DATA.filter(t => t.acc >= 70).map((t, i) => (
              <div key={i} style={{ padding:"12px 14px", background:G.panel, borderRadius:10, border:`1px solid ${G.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:600 }}>{t.name}</span>
                    <span style={{ fontSize:11, color:G.sub, marginLeft:8 }}>{t.sub}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <TrendBadge val={t.trend} />
                    <Mono size={14} color={t.color}>{t.acc}%</Mono>
                  </div>
                </div>
                <Bar pct={t.acc} color={t.color} height={5} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full topic table */}
      <div className="card-base">
        <SectionHead
          title="📊 All Topics — Full Breakdown"
          sub={`${TOPIC_DATA.length} topics tracked across all subjects`}
          right={
            <div style={{ display:"flex", gap:6 }}>
              {[["acc","By Accuracy"],["attempts","By Attempts"]].map(([k,l]) => (
                <button key={k} onClick={() => setSort(k)} className={`filter-chip${sort===k?" active":""}`}>{l}</button>
              ))}
            </div>
          }
        />
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px 100px", gap:14, padding:"8px 14px", fontSize:11, color:G.muted, fontWeight:700, letterSpacing:1 }}>
            <span>TOPIC</span><span style={{ textAlign:"center" }}>SUBJECT</span><span style={{ textAlign:"center" }}>ACCURACY</span><span style={{ textAlign:"center" }}>SESSIONS</span><span style={{ textAlign:"center" }}>TREND</span><span style={{ textAlign:"center" }}>ACTION</span>
          </div>
          {sorted.map((t, i) => (
            <div key={i} className="row-item" style={{ gridTemplateColumns:"1fr 80px 80px 80px 80px 100px" }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{t.name}</div>
              <div style={{ textAlign:"center" }}><Chip color={t.color}>{t.sub}</Chip></div>
              <div style={{ textAlign:"center" }}>
                <Mono size={14} color={t.acc < 60 ? G.red : t.acc < 75 ? G.gold : G.green}>{t.acc}%</Mono>
              </div>
              <div style={{ textAlign:"center" }}><Mono size={13} color={G.sub}>{t.attempts}</Mono></div>
              <div style={{ textAlign:"center" }}><TrendBadge val={t.trend} /></div>
              <div style={{ textAlign:"center" }}>
                <button style={{ padding:"5px 14px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:7, color:G.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>Practice</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TIME MANAGEMENT TAB ────────────────────────────────────── */
function TimeTab() {
  const avgTotalTime = 47;
  const examTime = 60;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Avg Test Duration", val:"47 min",  icon:"⏱",  color:G.cyan,   sub:"of 60 min allotted"   },
          { label:"Time Saved",        val:"13 min",  icon:"⚡",  color:G.green,  sub:"per test on average"  },
          { label:"Slowest Section",   val:"Quant",   icon:"🐢",  color:G.orange, sub:"4 min over budget"    },
          { label:"Fastest Section",   val:"GK",      icon:"🚀",  color:G.purple, sub:"3 min under budget"   },
        ].map((k, i) => (
          <div key={i} className="card-base">
            <div style={{ fontSize:28, marginBottom:10 }}>{k.icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:700, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:12, color:G.sub, marginTop:6 }}>{k.label}</div>
            <div style={{ fontSize:11, color:G.muted, marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Section time breakdown */}
      <div className="card-base">
        <SectionHead title="⏱ Section Time Breakdown" sub="Allocated vs actual time spent per section" />
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {TIME_DATA.map((t, i) => (
            <div key={i} style={{ padding:"16px 20px", background:G.panel, borderRadius:14, border:`1px solid ${G.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{t.section}</div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:12, color:G.sub }}>Budget: <Mono size={13} color={G.sub}>{t.allocated}m</Mono></span>
                  <span style={{ fontSize:12, color:G.sub }}>Used: <Mono size={13} color={t.used > t.allocated ? G.red : G.green}>{t.used}m</Mono></span>
                  <span style={{ fontSize:12, color:G.sub }}>Per Q: <Mono size={13} color={t.color}>{t.perQ}m</Mono></span>
                  {t.used > t.allocated
                    ? <Chip color={G.red}>+{t.used - t.allocated}m over</Chip>
                    : <Chip color={G.green}>−{t.allocated - t.used}m saved</Chip>
                  }
                </div>
              </div>
              {/* Stacked bar */}
              <div style={{ position:"relative", height:18, borderRadius:999, background:G.muted+"44", overflow:"hidden" }}>
                <div style={{ position:"absolute", left:0, top:0, height:"100%", background:`linear-gradient(90deg, ${t.color}, ${t.color}99)`, width:`${(t.allocated / 60) * 100}%`, borderRadius:999, transition:"width 1s ease" }} />
                <div style={{ position:"absolute", left:0, top:0, height:"100%", background:`${t.used > t.allocated ? G.red : t.color}66`, width:`${(t.used / 60) * 100}%`, borderRadius:999, border:`1px dashed ${t.used > t.allocated ? G.red : t.color}`, transition:"width 1.2s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:G.muted }}>0 min</span>
                <span style={{ fontSize:11, color:G.muted }}>60 min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time trend */}
      <div className="card-base">
        <SectionHead title="📉 Time Taken Trend" sub="Minutes used per test (last 20 tests)" />
        <LineChart data={TEST_HISTORY.slice(10).map(t => t.timeTaken)} color={G.cyan} height={120} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <span style={{ fontSize:11, color:G.sub }}>Goal: Complete in under 50 min with 90%+ accuracy</span>
          <span style={{ fontSize:11, color:G.green }}>✓ Achieved in last 4 tests</span>
        </div>
      </div>
    </div>
  );
}

/* ─── TEST HISTORY TAB ───────────────────────────────────────── */
function HistoryTab() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All","Full Mock","Sectional","Topic-wise","PYQ"];
  const filtered = TEST_HISTORY
    .filter(t => filter === "All" || t.type === filter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .reverse();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Controls */}
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, border:`1px solid ${G.border2}`, borderRadius:10, padding:"8px 14px", flex:1, maxWidth:280 }}>
          <span style={{ fontSize:14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
            style={{ background:"transparent", border:"none", outline:"none", color:G.text, fontFamily:"'Outfit',sans-serif", fontSize:13, width:"100%" }} />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-chip${filter===f?" active":""}`}>{f}</button>
          ))}
        </div>
        <Chip color={G.sub}>{filtered.length} tests</Chip>
      </div>

      {/* Table header */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 80px 80px 80px 80px 80px 80px", gap:14, padding:"10px 16px", background:G.panel, borderRadius:10, fontSize:11, color:G.muted, fontWeight:700, letterSpacing:1 }}>
        <span>#</span><span>TEST NAME</span><span style={{ textAlign:"center" }}>DATE</span><span style={{ textAlign:"center" }}>SCORE</span><span style={{ textAlign:"center" }}>ACCURACY</span><span style={{ textAlign:"center" }}>TIME</span><span style={{ textAlign:"center" }}>RANK</span><span style={{ textAlign:"center" }}>ACTION</span>
      </div>

      {/* Rows */}
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        {filtered.map((t, i) => {
          const badge = t.accuracy >= 85 ? [G.green,"Excellent"] : t.accuracy >= 75 ? [G.cyan,"Good"] : t.accuracy >= 65 ? [G.gold,"Average"] : [G.red,"Needs Work"];
          return (
            <div key={t.id} className="row-item" style={{ gridTemplateColumns:"auto 1fr 80px 80px 80px 80px 80px 80px" }}>
              <Mono size={12} color={G.muted}>{String(filtered.length - i).padStart(2,"0")}</Mono>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{t.name}</div>
                <Chip color={
                  t.type==="Full Mock"?G.cyan:t.type==="Sectional"?G.purple:t.type==="PYQ"?G.gold:G.green
                }>{t.type}</Chip>
              </div>
              <div style={{ textAlign:"center", fontSize:12, color:G.sub }}>{t.date}</div>
              <div style={{ textAlign:"center" }}>
                <Mono size={14} color={G.text}>{t.score}</Mono>
                <div style={{ fontSize:10, color:G.muted }}>/{t.maxScore}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <Chip color={badge[0]}>{t.accuracy}%</Chip>
              </div>
              <div style={{ textAlign:"center" }}><Mono size={12} color={G.sub}>{t.timeTaken}m</Mono></div>
              <div style={{ textAlign:"center" }}><Mono size={12} color={G.purple}>#{t.rank}</Mono></div>
              <div style={{ textAlign:"center" }}>
                <button style={{ padding:"5px 12px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:7, color:G.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>Review</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("overview");
  const TABS = [
    { id:"overview", label:"📊 Overview"         },
    { id:"subject",  label:"📐 Subject Analysis"  },
    { id:"topic",    label:"🎯 Topic Analysis"     },
    { id:"time",     label:"⏱ Time Management"    },
    { id:"history",  label:"📋 Test History"       },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:G.bg }}>

        {/* Page Header */}
        <div style={{ background:G.panel, borderBottom:`1px solid ${G.border}`, padding:"0 32px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ padding:"22px 0 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:G.sub, letterSpacing:2.5, textTransform:"uppercase", marginBottom:6 }}>Mockies · Performance Hub</div>
                <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:600, letterSpacing:0.5 }}>
                  Analytics & <em style={{ color:G.gold }}>Results</em>
                </h1>
                <p style={{ color:G.sub, fontSize:13, marginTop:5 }}>
                  Arjun Sharma · SSC CGL 2025 · <span style={{ color:G.green }}>38 tests</span> · Last updated today
                </p>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <button style={{ padding:"9px 20px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:10, color:G.gold, fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  📥 Export Report
                </button>
                <button style={{ padding:"9px 20px", background:`linear-gradient(135deg, ${G.gold}, #C89030)`, border:"none", borderRadius:10, color:"#030508", fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  🚀 Take a Test →
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:2, marginTop:16, paddingBottom:0 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab===t.id?"active":"inactive"}`}
                  style={{ borderBottom: tab===t.id ? `2px solid ${G.gold}` : "2px solid transparent", borderRadius:"8px 8px 0 0", paddingBottom:12 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 32px" }}>
          <div key={tab} className="fade-in">
            {tab === "overview" && <OverviewTab />}
            {tab === "subject"  && <SubjectTab  />}
            {tab === "topic"    && <TopicTab    />}
            {tab === "time"     && <TimeTab     />}
            {tab === "history"  && <HistoryTab  />}
          </div>
        </div>
      </div>
    </>
  );
>>>>>>> aa02f77221d289549a15a02154e83d756879cfa7
}
