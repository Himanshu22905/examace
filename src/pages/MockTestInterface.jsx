import { useState, useEffect, useRef, useCallback } from "react";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const G = {
  bg:      "#02050B",
  panel:   "#060A14",
  card:    "#080D1A",
  border:  "#0D1B2E",
  border2: "#142338",
  gold:    "#E8B84B",
  goldLo:  "#E8B84B14",
  goldMid: "#E8B84B44",
  cyan:    "#22D3EE",
  green:   "#34D399",
  red:     "#F87171",
  orange:  "#FB923C",
  purple:  "#A78BFA",
  text:    "#EEF2FF",
  sub:     "#7A9ABF",
  muted:   "#2E4A68",

  // Question palette status colors
  answered:  "#34D399",
  notAns:    "#F87171",
  marked:    "#A78BFA",
  markedAns: "#22D3EE",
  notVisited:"#1A3050",
  current:   "#E8B84B",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;}
body{font-family:'IBM Plex Sans',sans-serif;background:#02050B;color:#EEF2FF;}

::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:#02050B;}
::-webkit-scrollbar-thumb{background:#142338;border-radius:2px;}

@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideLeft{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
@keyframes slideRight{from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
@keyframes urgentPulse{0%,100%{background:#F8717122;border-color:#F87171;}50%{background:#F8717144;border-color:#F87171aa;}}
@keyframes checkIn{0%{transform:scale(0) rotate(-10deg);}70%{transform:scale(1.1) rotate(2deg);}100%{transform:scale(1) rotate(0);}}
@keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1;}100%{transform:translateY(-80px) rotate(360deg);opacity:0;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes timerWarn{0%,100%{box-shadow:0 0 0 0 #F8717133;}50%{box-shadow:0 0 0 8px #F8717100;}}
@keyframes optionSelect{0%{transform:scale(1);}50%{transform:scale(1.01);}100%{transform:scale(1);}}

.fade-in{animation:fadeIn 0.3s ease;}
.fade-up{animation:fadeUp 0.4s ease;}
.slide-left{animation:slideLeft 0.25s ease;}
.slide-right{animation:slideRight 0.25s ease;}

.option-btn{
  width:100%;padding:16px 20px;
  border-radius:12px;border:1.5px solid #0D1B2E;
  background:#060A14;color:#EEF2FF;
  font-family:'IBM Plex Sans',sans-serif;font-size:15px;
  cursor:pointer;text-align:left;display:flex;align-items:flex-start;gap:14px;
  transition:all 0.15s ease;line-height:1.6;
}
.option-btn:hover:not(.selected):not(.correct):not(.wrong){
  border-color:#E8B84B44;background:#E8B84B08;
}
.option-btn.selected{
  border-color:#E8B84B;background:#E8B84B12;
  animation:optionSelect 0.2s ease;
}
.option-btn.correct{border-color:#34D399;background:#34D39918;}
.option-btn.wrong{border-color:#F87171;background:#F8717118;}
.option-btn.reveal-correct{border-color:#34D39966;background:#34D39908;}

.palette-btn{
  width:36px;height:36px;border-radius:8px;border:none;
  font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;
  cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;
}
.palette-btn:hover{transform:scale(1.1);}
.palette-btn.active{transform:scale(1.1);box-shadow:0 0 12px currentColor;}

.section-tab{
  padding:10px 20px;border:none;border-bottom:2px solid transparent;
  background:transparent;color:#7A9ABF;font-family:'IBM Plex Sans',sans-serif;
  font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;
}
.section-tab.active{color:#E8B84B;border-bottom-color:#E8B84B;}
.section-tab:hover:not(.active){color:#EEF2FF;border-bottom-color:#142338;}

.ctrl-btn{
  padding:9px 20px;border-radius:9px;
  font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;transition:all 0.15s;border:none;
}
.ctrl-btn:hover{opacity:0.85;transform:translateY(-1px);}
.ctrl-btn:active{transform:translateY(0);}
.ctrl-btn:disabled{opacity:0.35;cursor:not-allowed;transform:none;}
`;

/* ─── QUESTIONS ──────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "quant", name: "Quantitative Aptitude", short: "Quant",
    color: G.cyan, icon: "📐", negMark: 0.25,
    questions: [
      { id:0,  topic:"Algebra",       diff:"Medium", q:"If 2x + 3y = 12 and x − y = 1, then x = ?",                                                                    opts:["3","4","5","2"],            ans:0, exp:"From x−y=1 → x=y+1. Sub: 2(y+1)+3y=12 → 5y=10 → y=2, x=3." },
      { id:1,  topic:"Percentage",    diff:"Easy",   q:"A shopkeeper marks up 40% and gives 20% discount. Net profit % is?",                                             opts:["8%","10%","12%","15%"],     ans:2, exp:"CP=100, MP=140, SP=140×0.8=112. Profit = 12%." },
      { id:2,  topic:"Time & Work",   diff:"Hard",   q:"A finishes in 12 days, B in 18 days. Working together for 4 days, what fraction remains?",                       opts:["4/9","5/9","1/3","2/3"],    ans:0, exp:"Combined: 1/12+1/18=5/36/day. 4 days=20/36=5/9 done. Remaining=4/9." },
      { id:3,  topic:"Ratio",         diff:"Easy",   q:"A:B = 3:4, B:C = 5:6. Then A:B:C = ?",                                                                          opts:["15:20:24","3:4:6","5:6:7","10:15:18"], ans:0, exp:"A:B=3:4, B:C=5:6. LCM of B=20. A:B:C = 15:20:24." },
      { id:4,  topic:"Trigonometry",  diff:"Hard",   q:"sin²θ + cos²θ = 1. If sinθ = 3/5, then cosθ = ?",                                                               opts:["4/5","3/4","2/5","1/5"],    ans:0, exp:"cos²θ = 1 − (9/25) = 16/25. cosθ = 4/5." },
      { id:5,  topic:"Mensuration",   diff:"Medium", q:"Area of a circle with radius 7 cm is? (π=22/7)",                                                                 opts:["154 cm²","144 cm²","132 cm²","176 cm²"], ans:0, exp:"Area = πr² = (22/7)×7² = 154 cm²." },
      { id:6,  topic:"Speed",         diff:"Medium", q:"A train 150m long crosses a pole in 15 sec. Its speed in km/h?",                                                 opts:["36 km/h","40 km/h","54 km/h","45 km/h"], ans:0, exp:"Speed = 150/15 = 10 m/s = 36 km/h." },
      { id:7,  topic:"Algebra",       diff:"Easy",   q:"If x + 1/x = 5, then x² + 1/x² = ?",                                                                           opts:["23","25","27","21"],         ans:0, exp:"(x+1/x)² = x²+2+1/x² = 25. So x²+1/x² = 23." },
    ],
  },
  {
    id: "reasoning", name: "General Reasoning", short: "Reasoning",
    color: G.purple, icon: "🧠", negMark: 0.25,
    questions: [
      { id:8,  topic:"Syllogism",      diff:"Easy",   q:"All cats are animals. All animals are living beings. Which conclusion is correct?",                              opts:["All living beings are cats","All cats are living beings","Some animals are cats","Both B and C"], ans:3, exp:"Both 'All cats are living beings' and 'Some animals are cats' follow." },
      { id:9,  topic:"Coding",         diff:"Easy",   q:"If BOARD is coded as CNBSE, how is LIGHT coded?",                                                               opts:["MJHIU","KJFGS","MJHIV","NKIJV"], ans:0, exp:"Each letter +1. L→M, I→J, G→H, H→I, T→U = MJHIU." },
      { id:10, topic:"Blood Relations",diff:"Medium", q:"A is B's sister. C is B's mother. D is C's father. How is A related to D?",                                     opts:["Granddaughter","Daughter","Great Granddaughter","Niece"], ans:0, exp:"A→B→C→D chain. A is C's child, C is D's daughter. A = D's granddaughter." },
      { id:11, topic:"Series",         diff:"Medium", q:"Find the missing: 2, 6, 12, 20, 30, ?",                                                                        opts:["42","40","44","38"],         ans:0, exp:"Differences: 4,6,8,10,12. Next = 30+12 = 42." },
      { id:12, topic:"Directions",     diff:"Hard",   q:"Ram walks 5km North, turns right 3km, then turns right 5km. How far is he from the start?",                    opts:["3 km","5 km","8 km","2 km"],ans:0, exp:"Net displacement = 3km East. Distance = 3km." },
      { id:13, topic:"Analogy",        diff:"Easy",   q:"Doctor : Hospital :: Teacher : ?",                                                                              opts:["School","University","College","All of these"], ans:3, exp:"A doctor works in a hospital, a teacher works in school/university/college." },
      { id:14, topic:"Odd One Out",    diff:"Medium", q:"Choose the odd one: Rose, Lotus, Jasmine, Mango",                                                               opts:["Rose","Lotus","Jasmine","Mango"], ans:3, exp:"Rose, Lotus, Jasmine are flowers. Mango is a fruit." },
      { id:15, topic:"Matrix",         diff:"Hard",   q:"In a certain code, 'PENCIL' = 'RGPEKN'. What is 'ERASER' in the same code?",                                   opts:["GTCUGT","GTCUET","GTCUGR","GSCUGT"], ans:0, exp:"Each letter shifted by +2. E→G, R→T, A→C, S→U, E→G, R→T = GTCUGT." },
    ],
  },
  {
    id: "english", name: "English Language", short: "English",
    color: G.green, icon: "📖", negMark: 0.25,
    questions: [
      { id:16, topic:"Vocabulary",     diff:"Medium", q:"Choose the word CLOSEST in meaning to 'EPHEMERAL':",                                                            opts:["Eternal","Transient","Robust","Ancient"], ans:1, exp:"Ephemeral = lasting a very short time. Transient is the closest synonym." },
      { id:17, topic:"Grammar",        diff:"Easy",   q:"Select the grammatically CORRECT sentence:",                                                                   opts:["He don't know","She doesn't knows","They doesn't know","He doesn't know"], ans:3, exp:"With 3rd person singular (He), use 'doesn't' + base verb." },
      { id:18, topic:"Error Spotting", diff:"Hard",   q:"Spot the error: 'She (A) is one of (B) those girls who (C) works hard (D)'",                                   opts:["A","B","C","D"],              ans:3, exp:"Should be 'work hard' not 'works hard' — 'who' refers to 'girls' (plural)." },
      { id:19, topic:"Fill in Blanks", diff:"Easy",   q:"The government has decided to ______ the old law.",                                                             opts:["repeal","repeat","replete","repeal"], ans:0, exp:"'Repeal' means to officially revoke or annul a law." },
    ],
  },
  {
    id: "gk", name: "General Awareness", short: "Gen. Awareness",
    color: G.gold, icon: "🌍", negMark: 0.25,
    questions: [
      { id:20, topic:"Current Affairs", diff:"Easy",  q:"Which organisation publishes the Human Development Index (HDI)?",                                               opts:["World Bank","IMF","UNDP","WHO"], ans:2, exp:"HDI is published annually by the United Nations Development Programme (UNDP)." },
      { id:21, topic:"Geography",       diff:"Easy",  q:"Which is the longest river in India?",                                                                          opts:["Yamuna","Godavari","Ganga","Krishna"], ans:2, exp:"The Ganga is the longest river in India (~2,525 km)." },
      { id:22, topic:"History",         diff:"Medium",q:"The Battle of Plassey was fought in which year?",                                                               opts:["1757","1857","1764","1707"],  ans:0, exp:"Battle of Plassey was fought on 23 June 1757 between the British East India Company and Nawab Siraj ud-Daulah." },
      { id:23, topic:"Science",         diff:"Medium",q:"Which gas is responsible for the greenhouse effect the most?",                                                  opts:["Oxygen","Carbon Dioxide","Nitrogen","Methane"], ans:1, exp:"CO₂ is the primary greenhouse gas responsible for climate change." },
    ],
  },
];

const ALL_QUESTIONS = SECTIONS.flatMap(s => s.questions.map(q => ({ ...q, sectionId: s.id, sectionColor: s.color })));
const TOTAL_Q = ALL_QUESTIONS.length;
const EXAM_DURATION = 60 * 60; // 60 minutes

/* ─── HELPERS ────────────────────────────────────────────────── */
const fmtTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
    : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};

const getStatus = (idx, answers, marked, current) => {
  const ans = answers[idx] !== undefined;
  const mrk = marked[idx];
  if (idx === current) return "current";
  if (ans && mrk)  return "markedAns";
  if (ans)         return "answered";
  if (mrk)         return "marked";
  return "notVisited";
};

const statusStyle = {
  current:   { bg: G.current,   color: "#02050B", border: G.current   },
  answered:  { bg: G.answered,  color: "#02050B", border: G.answered  },
  notVisited:{ bg: G.notVisited,color: G.sub,     border: G.muted     },
  marked:    { bg: G.marked,    color: "#02050B", border: G.marked    },
  markedAns: { bg: G.markedAns, color: "#02050B", border: G.markedAns },
  notAns:    { bg: G.notAns,    color: "#02050B", border: G.notAns    },
};

/* ─── PRE-EXAM SCREEN ────────────────────────────────────────── */
function PreExam({ onStart }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:G.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="fade-up" style={{ maxWidth:680, width:"100%", background:G.panel, border:`1px solid ${G.border2}`, borderRadius:24, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg, #0A1428, #060A14)`, borderBottom:`1px solid ${G.border}`, padding:"28px 36px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:10, color:G.sub, letterSpacing:2.5, textTransform:"uppercase", marginBottom:8 }}>SSC CGL 2025 · Tier I</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, lineHeight:1.2 }}>Full Mock Test #13</h1>
            <p style={{ color:G.sub, fontSize:13, marginTop:6 }}>Based on latest SSC CGL 2024 pattern</p>
          </div>
          <div style={{ textAlign:"center", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:14, padding:"14px 20px" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:30, fontWeight:600, color:G.gold }}>60</div>
            <div style={{ fontSize:11, color:G.sub }}>Minutes</div>
          </div>
        </div>

        <div style={{ padding:"28px 36px" }}>
          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
            {[
              [TOTAL_Q, "Questions", "📋"],
              ["4", "Sections", "📂"],
              ["+2 / −0.25", "Marking", "📊"],
              ["60 min", "Duration", "⏱"],
            ].map(([v,l,ic]) => (
              <div key={l} style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:12, padding:"14px", textAlign:"center" }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{ic}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:600, color:G.gold }}>{v}</div>
                <div style={{ fontSize:11, color:G.sub, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Sections */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, color:G.sub, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>Sections</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {SECTIONS.map(s => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:G.card, border:`1px solid ${G.border}`, borderRadius:10 }}>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:600 }}>{s.name}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:s.color }}>{s.questions.length} Qs</span>
                  <div style={{ width:1, height:16, background:G.border }} />
                  <span style={{ fontSize:12, color:G.sub }}>−{s.negMark}/wrong</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background:`${G.orange}0A`, border:`1px solid ${G.orange}33`, borderRadius:12, padding:"14px 18px", marginBottom:24 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.orange, marginBottom:8 }}>⚠️ Important Instructions</div>
            <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:5 }}>
              {[
                "Do NOT refresh or close the browser during the test",
                "Timer will auto-submit when time runs out",
                "You can mark questions for review and revisit them",
                "Negative marking of 0.25 marks applies for wrong answers",
                "Use the question palette to jump between questions",
              ].map((ins,i) => (
                <li key={i} style={{ color:G.sub, fontSize:13, lineHeight:1.6 }}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Agree */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, cursor:"pointer" }} onClick={() => setAgreed(a => !a)}>
            <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${agreed ? G.green : G.border2}`, background:agreed ? G.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}>
              {agreed && <span style={{ color:"#02050B", fontSize:12, fontWeight:900, animation:"checkIn 0.3s ease" }}>✓</span>}
            </div>
            <span style={{ fontSize:13, color:G.sub }}>I have read all instructions and I am ready to start the exam</span>
          </div>

          <button onClick={agreed ? onStart : undefined} style={{
            width:"100%", padding:"16px", borderRadius:13,
            background: agreed ? `linear-gradient(135deg, ${G.gold}, #C89030)` : G.muted,
            border:"none", color: agreed ? "#02050B" : G.sub,
            fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, fontSize:16,
            cursor: agreed ? "pointer" : "not-allowed",
            transition:"all 0.3s",
            boxShadow: agreed ? `0 4px 24px ${G.gold}44` : "none",
          }}>
            🚀 Start Exam Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── EXAM INTERFACE ─────────────────────────────────────────── */
function ExamInterface({ onSubmit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers]  = useState({});
  const [marked, setMarked]    = useState({});
  const [visited, setVisited]  = useState({ 0: true });
  const [time, setTime]        = useState(EXAM_DURATION);
  const [activeSection, setActiveSection] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [animDir, setAnimDir]  = useState("left");
  const [qKey, setQKey]        = useState(0);
  const timerRef = useRef(null);
  const warningPlayed = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); onSubmit(answers, marked, visited, 0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = useCallback((idx, dir = "left") => {
    setAnimDir(dir);
    setQKey(k => k + 1);
    setCurrent(idx);
    setVisited(v => ({ ...v, [idx]: true }));
    // Update active section
    const secIdx = SECTIONS.findIndex(s => s.questions.some(q => q.id === ALL_QUESTIONS[idx].id));
    if (secIdx >= 0) setActiveSection(secIdx);
  }, []);

  const goNext = () => { if (current < TOTAL_Q - 1) goTo(current + 1, "left"); };
  const goPrev = () => { if (current > 0) goTo(current - 1, "right"); };

  const selectAnswer = (optIdx) => {
    setAnswers(a => ({ ...a, [current]: optIdx }));
  };

  const toggleMark = () => {
    setMarked(m => ({ ...m, [current]: !m[current] }));
  };

  const clearAnswer = () => {
    setAnswers(a => { const n = { ...a }; delete n[current]; return n; });
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    onSubmit(answers, marked, visited, EXAM_DURATION - time);
  };

  const q = ALL_QUESTIONS[current];
  const sec = SECTIONS.find(s => s.questions.some(qq => qq.id === q.id));

  // Counts
  const answeredCount  = Object.keys(answers).length;
  const markedCount    = Object.values(marked).filter(Boolean).length;
  const notVisitedCount= TOTAL_Q - Object.keys(visited).length;

  // Timer urgency
  const isUrgent   = time <= 300;  // 5 min
  const isCritical = time <= 60;   // 1 min

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:G.bg, overflow:"hidden" }}>

      {/* ── TOP BAR ── */}
      <header style={{
        height:56, background:G.panel, borderBottom:`1px solid ${G.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px", flexShrink:0, zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:600, color:G.gold, letterSpacing:2 }}>EXAMACE</div>
          <div style={{ width:1, height:20, background:G.border }} />
          <div style={{ fontSize:13, color:G.sub }}>SSC CGL Full Mock Test #13</div>
        </div>

        {/* Timer */}
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"8px 20px", borderRadius:10,
          background: isCritical ? "#F8717122" : isUrgent ? "#FB923C18" : G.card,
          border: `1.5px solid ${isCritical ? G.red : isUrgent ? G.orange : G.border2}`,
          animation: isCritical ? "urgentPulse 1s infinite" : isUrgent ? "timerWarn 2s infinite" : "none",
          transition:"all 0.5s",
        }}>
          <span style={{ fontSize:16 }}>{isCritical ? "🚨" : isUrgent ? "⚠️" : "⏱"}</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:600, color: isCritical ? G.red : isUrgent ? G.orange : G.green, letterSpacing:2 }}>
            {fmtTime(time)}
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:12, color:G.sub }}>
            <span style={{ color:G.green, fontWeight:700 }}>{answeredCount}</span> answered ·{" "}
            <span style={{ color:G.red, fontWeight:700 }}>{TOTAL_Q - answeredCount}</span> remaining
          </div>
          <button onClick={() => setConfirmSubmit(true)} style={{ padding:"9px 20px", background:`linear-gradient(135deg, ${G.red}, #DC2626)`, border:"none", borderRadius:9, color:"#fff", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:`0 2px 12px ${G.red}44` }}>
            Submit Test
          </button>
        </div>
      </header>

      {/* ── SECTION TABS ── */}
      <div style={{ background:G.panel, borderBottom:`1px solid ${G.border}`, padding:"0 20px", display:"flex", alignItems:"center", gap:4, flexShrink:0, overflowX:"auto" }}>
        {SECTIONS.map((s, i) => {
          const sAnswered = s.questions.filter(q => answers[ALL_QUESTIONS.findIndex(aq => aq.id === q.id)] !== undefined).length;
          return (
            <button key={s.id} className={`section-tab${activeSection === i ? " active" : ""}`}
              onClick={() => { setActiveSection(i); goTo(SECTIONS.slice(0,i).reduce((a,ss) => a + ss.questions.length, 0)); }}
              style={{ borderBottomColor: activeSection === i ? s.color : undefined, color: activeSection === i ? s.color : undefined }}>
              {s.icon} {s.short}
              <span style={{ marginLeft:6, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color: activeSection === i ? s.color : G.muted }}>
                {sAnswered}/{s.questions.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Question Area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto", padding:"24px 28px" }}>

          {/* Q Header */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, background:G.card, border:`1px solid ${G.border2}`, borderRadius:8, padding:"4px 12px", color:G.gold }}>
              Q {current + 1} / {TOTAL_Q}
            </div>
            <div style={{ background:sec.color + "18", border:`1px solid ${sec.color}44`, borderRadius:8, padding:"4px 12px", fontSize:12, color:sec.color, fontWeight:600 }}>
              {sec.icon} {sec.short}
            </div>
            <div style={{ background: q.diff === "Easy" ? G.green+"18" : q.diff === "Medium" ? G.gold+"18" : G.red+"18", border:`1px solid ${q.diff === "Easy" ? G.green : q.diff === "Medium" ? G.gold : G.red}44`, borderRadius:8, padding:"4px 12px", fontSize:12, color: q.diff === "Easy" ? G.green : q.diff === "Medium" ? G.gold : G.red, fontWeight:600 }}>
              {q.diff}
            </div>
            <div style={{ fontSize:12, color:G.sub }}>{q.topic}</div>
            {marked[current] && (
              <div style={{ marginLeft:"auto", background:G.purple+"18", border:`1px solid ${G.purple}44`, borderRadius:8, padding:"4px 12px", fontSize:12, color:G.purple, fontWeight:600 }}>
                🔖 Marked for Review
              </div>
            )}
          </div>

          {/* Question Text */}
          <div key={qKey} className={animDir === "left" ? "slide-left" : "slide-right"} style={{ fontSize:17, fontWeight:500, lineHeight:1.8, color:G.text, marginBottom:28, padding:"20px 24px", background:G.card, border:`1px solid ${G.border}`, borderRadius:14 }}>
            {q.q}
          </div>

          {/* Options */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {q.opts.map((opt, i) => {
              const isSelected = answers[current] === i;
              return (
                <button key={i} className={`option-btn${isSelected ? " selected" : ""}`}
                  onClick={() => selectAnswer(i)}>
                  <div style={{
                    width:32, height:32, borderRadius:8, flexShrink:0,
                    background: isSelected ? G.gold : G.border2,
                    color: isSelected ? "#02050B" : G.sub,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace",
                    transition:"all 0.15s",
                  }}>
                    {["A","B","C","D"][i]}
                  </div>
                  <span style={{ color: isSelected ? G.gold : G.text }}>{opt}</span>
                  {isSelected && <span style={{ marginLeft:"auto", color:G.gold, fontSize:18 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Bottom Controls */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28, paddingTop:20, borderTop:`1px solid ${G.border}` }}>
            <div style={{ display:"flex", gap:8 }}>
              <button className="ctrl-btn" onClick={clearAnswer} style={{ background:G.card, border:`1px solid ${G.border2}`, color:G.sub }}>
                🗑 Clear
              </button>
              <button className="ctrl-btn" onClick={toggleMark} style={{ background: marked[current] ? G.purple+"22" : G.card, border:`1.5px solid ${marked[current] ? G.purple : G.border2}`, color: marked[current] ? G.purple : G.sub }}>
                {marked[current] ? "🔖 Marked" : "🔖 Mark for Review"}
              </button>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="ctrl-btn" disabled={current === 0} onClick={goPrev} style={{ background:G.card, border:`1px solid ${G.border2}`, color: current === 0 ? G.muted : G.text }}>
                ← Previous
              </button>
              {answers[current] !== undefined && (
                <button className="ctrl-btn" onClick={goNext} style={{ background:G.green+"22", border:`1px solid ${G.green}44`, color:G.green }}>
                  Save & Next →
                </button>
              )}
              <button className="ctrl-btn" disabled={current === TOTAL_Q - 1} onClick={goNext} style={{ background:`linear-gradient(135deg, ${G.gold}, #C89030)`, color:"#02050B" }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ── PALETTE SIDEBAR ── */}
        <aside style={{ width:240, background:G.panel, borderLeft:`1px solid ${G.border}`, display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
          <div style={{ padding:"16px 16px 10px", borderBottom:`1px solid ${G.border}`, fontSize:12, fontWeight:700, color:G.sub, letterSpacing:1 }}>
            QUESTION PALETTE
          </div>

          {/* Section filter */}
          <div style={{ padding:"10px 12px", borderBottom:`1px solid ${G.border}`, display:"flex", flexDirection:"column", gap:6 }}>
            {SECTIONS.map((s, i) => {
              const start = SECTIONS.slice(0,i).reduce((a,ss) => a + ss.questions.length, 0);
              const sAns = s.questions.filter((_,qi) => answers[start + qi] !== undefined).length;
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:7, background: activeSection === i ? s.color+"14" : "transparent", cursor:"pointer" }}
                  onClick={() => { setActiveSection(i); goTo(start); }}>
                  <span style={{ fontSize:14 }}>{s.icon}</span>
                  <span style={{ fontSize:12, color: activeSection === i ? s.color : G.sub, flex:1 }}>{s.short}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color: activeSection === i ? s.color : G.muted }}>{sAns}/{s.questions.length}</span>
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div style={{ flex:1, overflowY:"auto", padding:12 }}>
            {SECTIONS.map((s, si) => {
              const start = SECTIONS.slice(0,si).reduce((a,ss) => a + ss.questions.length, 0);
              return (
                <div key={s.id} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, color:s.color, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>{s.short}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {s.questions.map((_, qi) => {
                      const globalIdx = start + qi;
                      const status = getStatus(globalIdx, answers, marked, current);
                      const st = statusStyle[status];
                      return (
                        <button key={qi} className={`palette-btn${status === "current" ? " active" : ""}`}
                          onClick={() => goTo(globalIdx)}
                          style={{ background: st.bg, color: st.color, border:`1.5px solid ${st.border}` }}>
                          {globalIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${G.border}` }}>
            {[
              [G.answered,  "Answered"],
              [G.notVisited,"Not Visited"],
              [G.marked,    "Marked Review"],
              [G.markedAns, "Marked + Answered"],
            ].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                <div style={{ width:14, height:14, borderRadius:3, background:c }} />
                <span style={{ fontSize:10, color:G.sub }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${G.border}`, background:G.card }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                [answeredCount, "Answered",  G.green ],
                [TOTAL_Q - answeredCount, "Not Ans.", G.red  ],
                [markedCount,  "Marked",    G.purple],
                [notVisitedCount,"Not Visited",G.muted],
              ].map(([v,l,c]) => (
                <div key={l} style={{ background:G.panel, borderRadius:7, padding:"7px 8px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:17, fontWeight:600, color:c }}>{v}</div>
                  <div style={{ fontSize:9, color:G.muted, marginTop:1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── CONFIRM SUBMIT MODAL ── */}
      {confirmSubmit && (
        <div className="fade-in" style={{ position:"fixed", inset:0, background:"rgba(2,5,11,0.85)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div className="fade-up" style={{ background:G.panel, border:`1px solid ${G.border2}`, borderRadius:20, padding:"32px 36px", maxWidth:440, width:"90%", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📤</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:10 }}>Submit the Test?</h3>
            <p style={{ color:G.sub, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
              You have answered <strong style={{ color:G.green }}>{answeredCount}</strong> out of <strong style={{ color:G.text }}>{TOTAL_Q}</strong> questions.{" "}
              {TOTAL_Q - answeredCount > 0 && <span style={{ color:G.red }}>({TOTAL_Q - answeredCount} unanswered)</span>}
              {" "}Are you sure you want to submit?
            </p>
            {/* Mini summary */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
              {[[answeredCount,"Answered",G.green],[TOTAL_Q - answeredCount,"Unanswered",G.red],[markedCount,"Marked",G.purple]].map(([v,l,c]) => (
                <div key={l} style={{ background:G.card, borderRadius:10, padding:"12px 8px" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, color:c, fontWeight:600 }}>{v}</div>
                  <div style={{ fontSize:11, color:G.sub, marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setConfirmSubmit(false)} style={{ flex:1, padding:"12px", borderRadius:10, border:`1px solid ${G.border2}`, background:"transparent", color:G.sub, fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                Continue Exam
              </button>
              <button onClick={handleSubmit} style={{ flex:1, padding:"12px", borderRadius:10, background:`linear-gradient(135deg, ${G.gold}, #C89030)`, border:"none", color:"#02050B", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:800, fontSize:14, cursor:"pointer" }}>
                Submit Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── RESULTS SCREEN ─────────────────────────────────────────── */
function Results({ answers, timeTaken, onRetry, onDashboard }) {
  const [tab, setTab] = useState("overview");
  const [expandedQ, setExpandedQ] = useState(null);

  let correct = 0, wrong = 0, skipped = 0;
  ALL_QUESTIONS.forEach((q, i) => {
    if (answers[i] === undefined) skipped++;
    else if (answers[i] === q.ans) correct++;
    else wrong++;
  });
  const score     = correct * 2 - wrong * 0.25;
  const maxScore  = TOTAL_Q * 2;
  const accuracy  = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  const pct       = Math.round((score / maxScore) * 100);
  const mins      = Math.floor(timeTaken / 60);
  const secs      = timeTaken % 60;

  const grade = pct >= 80 ? ["🏆","Excellent","#34D399"] : pct >= 65 ? ["🎯","Good","#E8B84B"] : pct >= 50 ? ["📈","Average","#FB923C"] : ["📚","Needs Work","#F87171"];

  const subResults = SECTIONS.map(s => {
    const start = SECTIONS.slice(0, SECTIONS.indexOf(s)).reduce((a,ss) => a + ss.questions.length, 0);
    let sc = 0, sw = 0, ss2 = 0;
    s.questions.forEach((q, qi) => {
      const gi = start + qi;
      if (answers[gi] === undefined) ss2++;
      else if (answers[gi] === q.ans) sc++;
      else sw++;
    });
    return { ...s, correct:sc, wrong:sw, skipped:ss2, score:sc*2 - sw*0.25, maxScore:s.questions.length*2 };
  });

  return (
    <div style={{ minHeight:"100vh", background:G.bg, overflowY:"auto" }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(160deg, #06101E, #02050B)`, borderBottom:`1px solid ${G.border}`, padding:"36px 40px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
            <div>
              <div style={{ fontSize:11, color:G.sub, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Test Completed · SSC CGL Full Mock #13</div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700 }}>Your Result</h1>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onDashboard} style={{ padding:"10px 20px", border:`1px solid ${G.border2}`, borderRadius:10, background:"transparent", color:G.sub, fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>← Dashboard</button>
              <button onClick={onRetry} style={{ padding:"10px 20px", background:`linear-gradient(135deg, ${G.gold}, #C89030)`, border:"none", borderRadius:10, color:"#02050B", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Reattempt →</button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:32, alignItems:"center" }}>
            {/* Score Circle */}
            <div style={{ textAlign:"center" }}>
              <div style={{ width:160, height:160, borderRadius:"50%", background:`conic-gradient(${grade[2]} ${pct * 3.6}deg, ${G.border2} 0deg)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 40px ${grade[2]}33` }}>
                <div style={{ width:134, height:134, borderRadius:"50%", background:G.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:34, fontWeight:600, color:grade[2], lineHeight:1 }}>{score.toFixed(1)}</div>
                  <div style={{ fontSize:12, color:G.sub, marginTop:3 }}>/ {maxScore}</div>
                </div>
              </div>
              <div style={{ marginTop:12, fontSize:20 }}>{grade[0]}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, color:grade[2], fontWeight:600 }}>{grade[1]}</div>
            </div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
              {[
                [correct, "Correct", G.green, "+2 marks each"],
                [wrong, "Wrong", G.red, "−0.25 each"],
                [skipped, "Skipped", G.muted, "0 marks"],
                [accuracy+"%", "Accuracy", G.cyan, "correct / attempted"],
                [mins+"m "+secs+"s", "Time Taken", G.purple, `of 60 min`],
                [pct+"%", "Score %", grade[2], "percentile ~"+Math.min(99,pct+5)+"th"],
              ].map(([v,l,c,sub]) => (
                <div key={l} style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:12, padding:"14px 18px" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:600, color:c }}>{v}</div>
                  <div style={{ fontSize:13, color:G.sub, marginTop:2 }}>{l}</div>
                  <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 40px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:G.panel, borderRadius:12, padding:4, marginBottom:24, border:`1px solid ${G.border}` }}>
          {[["overview","📊 Overview"],["solutions","📝 Solutions"],["analysis","🤖 AI Analysis"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"10px", borderRadius:9, border:"none",
              background: tab===id ? G.gold : "transparent",
              color: tab===id ? "#02050B" : G.sub,
              fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer",
              transition:"all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="fade-in">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
              {subResults.map((s,i) => (
                <div key={i} style={{ background:G.card, border:`1px solid ${G.border}`, borderRadius:16, padding:"20px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <span style={{ fontSize:22 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{s.name}</div>
                      <div style={{ fontSize:12, color:G.sub }}>Score: <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:s.color }}>{s.score.toFixed(1)}/{s.maxScore}</span></div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                    {[[s.correct,"✓",G.green],[s.wrong,"✗",G.red],[s.skipped,"—",G.muted]].map(([v,ic,c]) => (
                      <div key={ic} style={{ flex:1, textAlign:"center", background:c+"18", border:`1px solid ${c}33`, borderRadius:8, padding:"8px 4px" }}>
                        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, color:c, fontWeight:600 }}>{v}</div>
                        <div style={{ fontSize:10, color:G.sub }}>{ic}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:4, display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:G.sub }}>Accuracy</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:s.color }}>{s.correct+s.wrong > 0 ? Math.round(s.correct/(s.correct+s.wrong)*100) : 0}%</span>
                  </div>
                  <div style={{ background:G.border2, borderRadius:999, height:6, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:`linear-gradient(90deg, ${s.color}, ${s.color}bb)`, width:`${s.correct+s.wrong>0?Math.round(s.correct/(s.correct+s.wrong)*100):0}%`, transition:"width 1.2s ease", borderRadius:999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solutions Tab */}
        {tab === "solutions" && (
          <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {ALL_QUESTIONS.map((q,i) => {
              const ua = answers[i];
              const isCorrect = ua === q.ans;
              const isSkipped = ua === undefined;
              const isOpen    = expandedQ === i;
              return (
                <div key={i} style={{ background:G.card, border:`1.5px solid ${isSkipped ? G.border : isCorrect ? G.green+"44" : G.red+"44"}`, borderRadius:14, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", cursor:"pointer" }} onClick={() => setExpandedQ(isOpen ? null : i)}>
                    <div style={{ width:32, height:32, borderRadius:8, background: isSkipped ? G.muted+"22" : isCorrect ? G.green+"22" : G.red+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                      {isSkipped ? "⬜" : isCorrect ? "✅" : "❌"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:G.text, lineHeight:1.5 }}>Q{i+1}. {q.q.length > 80 ? q.q.slice(0,80)+"..." : q.q}</div>
                      <div style={{ fontSize:11, color:G.sub, marginTop:2 }}>{q.topic} · {q.diff}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, color: isSkipped ? G.muted : isCorrect ? G.green : G.red, fontWeight:600 }}>
                        {isSkipped ? "0" : isCorrect ? "+2.00" : "−0.25"}
                      </div>
                      <div style={{ fontSize:10, color:G.muted }}>marks</div>
                    </div>
                    <span style={{ color:G.muted, fontSize:16, transition:"transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
                  </div>
                  {isOpen && (
                    <div className="fade-in" style={{ padding:"0 18px 18px", borderTop:`1px solid ${G.border}` }}>
                      <div style={{ paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                        {q.opts.map((opt,oi) => (
                          <div key={oi} style={{
                            padding:"10px 14px", borderRadius:9,
                            border:`1.5px solid ${oi===q.ans ? G.green+"66" : ua===oi && !isCorrect ? G.red+"66" : G.border}`,
                            background: oi===q.ans ? G.green+"0A" : ua===oi && !isCorrect ? G.red+"0A" : "transparent",
                            display:"flex", alignItems:"center", gap:10, fontSize:13,
                          }}>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:600, color: oi===q.ans ? G.green : ua===oi ? G.red : G.muted, width:20 }}>
                              {["A","B","C","D"][oi]}
                            </span>
                            <span style={{ flex:1, color: oi===q.ans ? G.green : ua===oi ? G.red : G.sub }}>{opt}</span>
                            {oi===q.ans && <span style={{ color:G.green, fontSize:12, fontWeight:700 }}>✓ CORRECT</span>}
                            {ua===oi && !isCorrect && <span style={{ color:G.red, fontSize:12, fontWeight:700 }}>✗ YOUR ANS</span>}
                          </div>
                        ))}
                        <div style={{ marginTop:8, padding:"12px 16px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:10 }}>
                          <div style={{ fontSize:12, color:G.gold, fontWeight:700, marginBottom:4 }}>💡 Explanation</div>
                          <div style={{ fontSize:13, color:G.sub, lineHeight:1.7 }}>{q.exp}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* AI Analysis Tab */}
        {tab === "analysis" && (
          <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:`linear-gradient(135deg, #0A1428, #060E1E)`, border:`1px solid ${G.gold}33`, borderRadius:18, padding:"24px 28px" }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:32 }}>🤖</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, color:G.gold, marginBottom:8 }}>AI Performance Summary</div>
                  <p style={{ fontSize:14, color:G.sub, lineHeight:1.8 }}>
                    You scored <strong style={{ color:grade[2] }}>{score.toFixed(1)}/{maxScore}</strong> with <strong style={{ color:G.cyan }}>{accuracy}% accuracy</strong>.{" "}
                    {pct >= 70
                      ? `Great performance! You're in the safe zone. Focus on consistency.`
                      : `You need to improve by ${Math.ceil(70 - pct)}% to reach a safe score. Focus on weak areas.`
                    }
                  </p>
                </div>
              </div>
            </div>
            {subResults.map((s,i) => {
              const acc = s.correct+s.wrong>0 ? Math.round(s.correct/(s.correct+s.wrong)*100) : 0;
              const isWeak = acc < 65;
              return (
                <div key={i} style={{ background:G.card, border:`1px solid ${isWeak ? G.red+"33" : G.border}`, borderRadius:16, padding:"20px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:22 }}>{s.icon}</span>
                      <span style={{ fontWeight:700, fontSize:15 }}>{s.name}</span>
                      {isWeak && <span style={{ background:G.red+"18", color:G.red, border:`1px solid ${G.red}44`, borderRadius:999, padding:"2px 10px", fontSize:11, fontWeight:700 }}>⚠ Weak Area</span>}
                    </div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, color: acc>=80?G.green:acc>=60?G.gold:G.red, fontWeight:600 }}>{acc}%</span>
                  </div>
                  <p style={{ fontSize:13, color:G.sub, lineHeight:1.7, marginBottom:12 }}>
                    {acc >= 80
                      ? `Excellent! Your ${s.name} is your strongest section. Maintain this performance.`
                      : acc >= 60
                      ? `Good performance but there's room for improvement. Target 80%+ accuracy.`
                      : `This is a critical weak area. Revise basics and practice topic-wise tests immediately.`
                    }
                  </p>
                  <button style={{ padding:"8px 18px", background:G.goldLo, border:`1px solid ${G.goldMid}`, borderRadius:8, color:G.gold, fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                    📚 Practice {s.short} →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────── */
export default function App() {
  const [phase, setPhase]     = useState("pre");   // pre | exam | result
  const [examData, setExamData] = useState(null);

  const handleSubmit = (answers, marked, visited, timeTaken) => {
    setExamData({ answers, marked, visited, timeTaken });
    setPhase("result");
  };

  return (
    <>
      <style>{CSS}</style>
      {phase === "pre"    && <PreExam onStart={() => setPhase("exam")} />}
      {phase === "exam"   && <ExamInterface onSubmit={handleSubmit} />}
      {phase === "result" && examData && (
        <Results
          answers={examData.answers}
          timeTaken={examData.timeTaken}
          onRetry={() => { setExamData(null); setPhase("pre"); }}
          onDashboard={() => { setExamData(null); setPhase("pre"); }}
        />
      )}
    </>
  );
}