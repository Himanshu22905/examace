import { useState, useEffect, useRef } from "react";

/* ─── TOKENS ─────────────────────────────────────────────────── */
const G = {
  bg:      "#020408",
  panel:   "#050810",
  card:    "#080C18",
  cardHi:  "#0B1020",
  border:  "#0E1A2C",
  border2: "#152236",
  // Admin accent — cool blue-white (different from student gold)
  accent:  "#38BDF8",
  accentLo:"#38BDF812",
  accentMd:"#38BDF840",
  green:   "#34D399",
  red:     "#F87171",
  orange:  "#FB923C",
  purple:  "#A78BFA",
  gold:    "#E8B84B",
  yellow:  "#FCD34D",
  text:    "#EEF2FF",
  sub:     "#6A8CAC",
  muted:   "#253A52",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&family=Fraunces:ital,wght@0,700;1,600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#020408;color:#EEF2FF;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:#020408;}
::-webkit-scrollbar-thumb{background:#152236;border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:#38BDF840;}

@keyframes fadeUp  {from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn  {from{opacity:0;}to{opacity:1;}}
@keyframes slideIn {from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse   {0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes spin    {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes toastIn {from{opacity:0;transform:translateY(20px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes toastOut{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(10px);}}
@keyframes glow    {0%,100%{box-shadow:0 0 20px #38BDF818;}50%{box-shadow:0 0 40px #38BDF832;}}
@keyframes lineGrow{from{stroke-dashoffset:800;}to{stroke-dashoffset:0;}}
@keyframes dotPop  {0%{transform:scale(0);}70%{transform:scale(1.3);}100%{transform:scale(1);}}

.fade-up {animation:fadeUp 0.45s ease forwards;}
.fade-in {animation:fadeIn 0.3s ease forwards;}
.slide-in{animation:slideIn 0.35s ease forwards;}

.nav-item{
  display:flex;align-items:center;gap:10px;padding:9px 12px;
  border-radius:9px;cursor:pointer;transition:all 0.2s;
  color:#6A8CAC;font-size:13px;font-weight:600;border:1px solid transparent;
}
.nav-item:hover{background:#38BDF808;color:#38BDF8;border-color:#38BDF81A;}
.nav-item.active{background:#38BDF814;color:#38BDF8;border-color:#38BDF833;font-weight:700;}

.card{background:#080C18;border:1px solid #0E1A2C;border-radius:16px;padding:20px 22px;transition:border-color 0.2s;}
.card:hover{border-color:#38BDF822;}

.tbl-row{
  display:grid;align-items:center;gap:12px;
  padding:12px 16px;border-radius:10px;
  border:1px solid #0E1A2C;background:#050810;
  transition:all 0.18s;cursor:pointer;font-size:13px;
}
.tbl-row:hover{border-color:#38BDF833;background:#080C18;transform:translateX(2px);}

.btn{
  padding:8px 18px;border-radius:8px;border:none;
  font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;
  font-size:13px;cursor:pointer;transition:all 0.15s;
  display:inline-flex;align-items:center;gap:6px;
}
.btn:hover{transform:translateY(-1px);}
.btn:active{transform:translateY(0);}
.btn-primary{background:linear-gradient(135deg,#38BDF8,#0EA5E9);color:#020408;}
.btn-success{background:linear-gradient(135deg,#34D399,#059669);color:#020408;}
.btn-danger {background:#F8717122;color:#F87171;border:1px solid #F8717133;}
.btn-ghost  {background:transparent;color:#6A8CAC;border:1px solid #152236;}
.btn-ghost:hover{border-color:#38BDF840;color:#38BDF8;}
.btn-gold   {background:linear-gradient(135deg,#E8B84B,#C89030);color:#020408;}

.input{
  width:100%;background:#020408;border:1.5px solid #0E1A2C;
  border-radius:10px;padding:11px 14px;color:#EEF2FF;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;
  outline:none;transition:border-color 0.2s,box-shadow 0.2s;
}
.input:focus{border-color:#38BDF888;box-shadow:0 0 0 3px #38BDF810;}
.input::placeholder{color:#253A52;}

select.input option{background:#050810;}

.tag{
  display:inline-flex;align-items:center;padding:3px 10px;
  border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.4px;
}

.modal-overlay{
  position:fixed;inset:0;background:rgba(2,4,8,0.82);
  backdrop-filter:blur(8px);display:flex;align-items:center;
  justify-content:center;z-index:200;padding:20px;
}
.modal{
  background:#080C18;border:1px solid #152236;
  border-radius:20px;padding:32px;width:100%;max-width:600px;
  max-height:90vh;overflow-y:auto;
  animation:fadeUp 0.3s ease;
}
`;

/* ─── SEED DATA ──────────────────────────────────────────────── */
const initQuestions = [
  { id:1,  exam:"SSC",     subject:"Quantitative Aptitude", topic:"Algebra",         diff:"Medium", q:"If 2x+3y=12 and x−y=1, find x.", status:"Active",   attempts:8420  },
  { id:2,  exam:"SSC",     subject:"Reasoning",             topic:"Syllogism",        diff:"Easy",   q:"All cats are animals. Conclusion valid?", status:"Active",   attempts:6230  },
  { id:3,  exam:"UPSC",    subject:"General Studies",       topic:"Current Affairs",  diff:"Hard",   q:"Which body publishes HDI annually?", status:"Active",   attempts:4100  },
  { id:4,  exam:"JEE",     subject:"Physics",               topic:"Mechanics",        diff:"Hard",   q:"A body of mass 5kg travels at 10m/s. KE = ?", status:"Active",   attempts:5620  },
  { id:5,  exam:"Banking", subject:"Quantitative Aptitude", topic:"Percentage",       diff:"Easy",   q:"40% markup, 20% discount. Net profit?", status:"Active",   attempts:9840  },
  { id:6,  exam:"SSC",     subject:"English",               topic:"Vocabulary",       diff:"Medium", q:"Synonym of EPHEMERAL?",               status:"Draft",    attempts:0     },
  { id:7,  exam:"Banking", subject:"Reasoning",             topic:"Blood Relations",  diff:"Medium", q:"A is B's sister. D is C's father. A:D?", status:"Active",   attempts:7320  },
  { id:8,  exam:"JEE",     subject:"Chemistry",             topic:"Organic Chemistry",diff:"Hard",   q:"IUPAC name of CH3-CH2-OH?",           status:"Inactive", attempts:3210  },
  { id:9,  exam:"UPSC",    subject:"History",               topic:"Modern India",     diff:"Medium", q:"Battle of Plassey was fought in?",    status:"Active",   attempts:5540  },
  { id:10, exam:"SSC",     subject:"General Awareness",     topic:"Geography",        diff:"Easy",   q:"Longest river in India?",             status:"Active",   attempts:11200 },
];

const initTests = [
  { id:1,  name:"SSC CGL Full Mock #13",    exam:"SSC",     type:"Full Length", qs:100, time:60, status:"Live",     attempts:12430, avgScore:67 },
  { id:2,  name:"IBPS PO Prelims Mock #7",  exam:"Banking", type:"Full Length", qs:100, time:60, status:"Live",     attempts:8920,  avgScore:72 },
  { id:3,  name:"Quant Sectional Test #10", exam:"SSC",     type:"Sectional",   qs:50,  time:30, status:"Live",     attempts:21000, avgScore:74 },
  { id:4,  name:"JEE Main Full Mock #5",    exam:"JEE",     type:"Full Length", qs:90,  time:180,status:"Draft",    attempts:0,     avgScore:0  },
  { id:5,  name:"UPSC Prelims 2024 PYQ",    exam:"UPSC",    type:"PYQ",         qs:100, time:120,status:"Live",     attempts:67000, avgScore:58 },
  { id:6,  name:"Reasoning Topic Test #4",  exam:"SSC",     type:"Topic-wise",  qs:20,  time:25, status:"Inactive", attempts:4200,  avgScore:81 },
];

const initUsers = [
  { id:1,  name:"Arjun Sharma",   email:"arjun@email.com",   exam:"SSC CGL",  joined:"Jan 12, 2025", tests:38, score:74, status:"Active"   },
  { id:2,  name:"Priya Sharma",   email:"priya@email.com",   exam:"SSC CGL",  joined:"Feb 3, 2025",  tests:52, score:88, status:"Active"   },
  { id:3,  name:"Rahul Verma",    email:"rahul@email.com",   exam:"Banking",  joined:"Dec 20, 2024", tests:41, score:79, status:"Active"   },
  { id:4,  name:"Ananya Singh",   email:"ananya@email.com",  exam:"JEE",      joined:"Mar 1, 2025",  tests:28, score:91, status:"Active"   },
  { id:5,  name:"Kiran Patel",    email:"kiran@email.com",   exam:"UPSC",     joined:"Nov 15, 2024", tests:63, score:65, status:"Active"   },
  { id:6,  name:"Mohit Gupta",    email:"mohit@email.com",   exam:"Banking",  joined:"Jan 28, 2025", tests:33, score:77, status:"Suspended"},
  { id:7,  name:"Deepika Nair",   email:"deepika@email.com", exam:"SSC CHSL", joined:"Feb 18, 2025", tests:44, score:82, status:"Active"   },
  { id:8,  name:"Vikram Rao",     email:"vikram@email.com",  exam:"UPSC",     joined:"Mar 5, 2025",  tests:19, score:61, status:"Active"   },
];

const PLATFORM_STATS = {
  totalUsers: 52480, activeToday: 3241, testsToday: 8924,
  questionsBank: 12480, totalTests: 1247, serverLoad: 42,
};

const DAILY_USERS  = [2100,2400,2200,2800,3100,2900,3241];
const DAILY_TESTS  = [6200,7100,6800,8200,8900,8400,8924];
const WEEK_DAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ─── MICRO COMPONENTS ───────────────────────────────────────── */
function Mono({ children, size=13, color=G.accent }) {
  return <span style={{ fontFamily:"'Fira Code',monospace", fontSize:size, color, fontWeight:500 }}>{children}</span>;
}
function Tag({ children, color }) {
  return <span className="tag" style={{ background:color+"1A", color, border:`1px solid ${color}30` }}>{children}</span>;
}
function Bar({ pct, color=G.accent, h=6 }) {
  return (
    <div style={{ background:G.muted+"44", borderRadius:999, height:h, overflow:"hidden" }}>
      <div style={{ height:"100%", background:`linear-gradient(90deg,${color},${color}99)`, width:`${pct}%`, borderRadius:999, transition:"width 1.2s ease" }} />
    </div>
  );
}
function SHead({ title, sub, right }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
      <div>
        <div style={{ fontWeight:700, fontSize:15, color:G.text }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:G.sub, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
function AnimCount({ to, suffix="", duration=1200 }) {
  const [v,setV] = useState(0);
  const done = useRef(false);
  useEffect(()=>{ if(done.current) return; done.current=true; let s=null; const t=ts=>{ if(!s)s=ts; const p=Math.min((ts-s)/duration,1); setV(Math.floor((1-Math.pow(1-p,3))*to)); if(p<1) requestAnimationFrame(t); }; requestAnimationFrame(t); },[to]);
  return <>{v.toLocaleString()}{suffix}</>;
}
function LineChart({ data, color, h=80 }) {
  const mn=Math.min(...data)-5, mx=Math.max(...data)+5;
  const pts=data.map((v,i)=>({ x:(i/(data.length-1))*100, y:100-((v-mn)/(mx-mn))*100 }));
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area=`${line} L100,100 L0,100 Z`;
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%",height:h,overflow:"visible" }} preserveAspectRatio="none">
      <defs><linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
        <stop offset="100%" stopColor={color} stopOpacity="0.01"/>
      </linearGradient></defs>
      <path d={area} fill={`url(#g${color.slice(1)})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray:800, strokeDashoffset:800, animation:"lineGrow 1.4s ease forwards" }}/>
      {pts.map((p,i)=>( <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} style={{ animation:`dotPop 0.3s ease ${i*0.06}s both` }}/> ))}
    </svg>
  );
}
function Toast({ message, type, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2600); return()=>clearTimeout(t); },[]);
  const c = type==="success"?G.green:type==="error"?G.red:G.accent;
  const ic = type==="success"?"✅":type==="error"?"❌":"ℹ️";
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:500, background:G.card, border:`1.5px solid ${c}44`, borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, animation:"toastIn 0.3s ease", boxShadow:`0 8px 32px rgba(0,0,0,0.5)` }}>
      <span style={{ fontSize:20 }}>{ic}</span>
      <span style={{ fontSize:14, fontWeight:600, color:G.text }}>{message}</span>
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────── */
function Sidebar({ page, setPage }) {
  const nav = [
    { id:"dashboard",  icon:"⊞",  label:"Dashboard"       },
    { id:"questions",  icon:"❓",  label:"Question Bank",  badge:12480 },
    { id:"tests",      icon:"📋",  label:"Mock Tests",     badge:1247  },
    { id:"users",      icon:"👥",  label:"Users",          badge:PLATFORM_STATS.totalUsers },
    { id:"create",     icon:"✏️",  label:"Create Test"     },
    { id:"addq",       icon:"➕",  label:"Add Question"    },
    { id:"settings",   icon:"⚙️",  label:"Settings"        },
  ];
  return (
    <aside style={{ width:220, background:G.panel, borderRight:`1px solid ${G.border}`, display:"flex", flexDirection:"column", padding:"20px 12px", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
      <div style={{ padding:"4px 6px 22px" }}>
        <div style={{ fontFamily:"'Fira Code',monospace", fontSize:13, fontWeight:600, color:G.accent, letterSpacing:2.5 }}>EXAMACE</div>
        <div style={{ fontSize:9, color:G.muted, letterSpacing:2, marginTop:1 }}>ADMIN CONTROL PANEL</div>
      </div>
      {/* Live indicator */}
      <div style={{ display:"flex", alignItems:"center", gap:8, background:G.green+"12", border:`1px solid ${G.green}30`, borderRadius:9, padding:"8px 12px", marginBottom:18 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:G.green, animation:"pulse 2s infinite" }} />
        <span style={{ fontSize:11, color:G.green, fontWeight:700 }}>PLATFORM LIVE</span>
        <span style={{ marginLeft:"auto", fontFamily:"'Fira Code',monospace", fontSize:10, color:G.green }}>{PLATFORM_STATS.serverLoad}%</span>
      </div>
      <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
        {nav.map(n=>(
          <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
            <span style={{ fontSize:15, width:20, textAlign:"center" }}>{n.icon}</span>
            <span style={{ flex:1 }}>{n.label}</span>
            {n.badge && <span style={{ background:G.accent+"18", color:G.accent, fontSize:9, padding:"1px 6px", borderRadius:999, fontFamily:"'Fira Code',monospace", fontWeight:600 }}>{n.badge >= 1000 ? (n.badge/1000).toFixed(0)+"k" : n.badge}</span>}
          </div>
        ))}
      </nav>
      <div style={{ borderTop:`1px solid ${G.border}`, paddingTop:14, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg, ${G.accent}, #0EA5E9)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#020408" }}>A</div>
        <div><div style={{ fontSize:12, fontWeight:700 }}>Super Admin</div><div style={{ fontSize:10, color:G.sub }}>admin@examace.in</div></div>
      </div>
    </aside>
  );
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────── */
function DashboardPage() {
  const kpis = [
    { label:"Total Users",     val:PLATFORM_STATS.totalUsers,  suffix:"",  icon:"👥", color:G.accent, sub:"↑ 1,240 this week"  },
    { label:"Tests Today",     val:PLATFORM_STATS.testsToday,  suffix:"",  icon:"📝", color:G.green,  sub:"Peak: 11AM–2PM"     },
    { label:"Active Now",      val:PLATFORM_STATS.activeToday, suffix:"",  icon:"🟢", color:G.yellow, sub:"Live users online"   },
    { label:"Question Bank",   val:PLATFORM_STATS.questionsBank,suffix:"", icon:"❓", color:G.purple, sub:"4 exams covered"     },
    { label:"Total Tests",     val:PLATFORM_STATS.totalTests,  suffix:"",  icon:"🎯", color:G.orange, sub:"1,247 published"     },
    { label:"Server Load",     val:PLATFORM_STATS.serverLoad,  suffix:"%", icon:"⚡", color:G.green,  sub:"Healthy — 99.9% SLA" },
  ];
  const examDist = [
    { name:"SSC",     pct:38, color:G.gold,   users:19920 },
    { name:"Banking", pct:28, color:G.green,  users:14694 },
    { name:"JEE",     pct:20, color:G.purple, users:10496 },
    { name:"UPSC",    pct:14, color:G.cyan,   users:7347  },
  ];
  const recentActivity = [
    { type:"user",  msg:"New user registered: Suresh Kumar (IBPS PO)",        time:"2 min ago",  icon:"👤", color:G.green  },
    { type:"test",  msg:"SSC CGL Mock #13 attempted 842 times today",           time:"5 min ago",  icon:"📝", color:G.accent },
    { type:"report",msg:"Suspicious activity flagged: User ID #4821",           time:"12 min ago", icon:"⚠️", color:G.orange },
    { type:"system",msg:"Question bank backup completed successfully",           time:"1 hr ago",   icon:"✅", color:G.green  },
    { type:"test",  msg:"New test draft created: JEE Main Full Mock #6",        time:"2 hr ago",   icon:"✏️", color:G.purple },
    { type:"user",  msg:"User Mohit Gupta account suspended (spam reports)",    time:"3 hr ago",   icon:"🚫", color:G.red    },
  ];
  const G2 = { cyan: "#22D3EE" };
  return (
    <div style={{ padding:"28px", display:"flex", flexDirection:"column", gap:22, maxWidth:1200 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700 }}>Admin <em style={{ color:G.accent }}>Dashboard</em></h1>
          <p style={{ color:G.sub, fontSize:13, marginTop:4 }}>Thursday, 12 March 2026 · All systems operational</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost">📥 Export Data</button>
          <button className="btn btn-primary">+ Add Content</button>
        </div>
      </div>
      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }}>
        {kpis.map((k,i)=>(
          <div key={i} className="card fade-up" style={{ animationDelay:`${i*0.06}s`, cursor:"default" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:22 }}>{k.icon}</span>
              <span style={{ width:6, height:6, borderRadius:"50%", background:G.green, marginTop:3, animation:"pulse 2s infinite" }} />
            </div>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:24, fontWeight:700, color:k.color, lineHeight:1 }}>
              <AnimCount to={k.val} suffix={k.suffix} />
            </div>
            <div style={{ fontSize:11, color:G.sub, marginTop:5 }}>{k.label}</div>
            <div style={{ fontSize:10, color:G.muted, marginTop:2 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 300px", gap:16 }}>
        <div className="card">
          <SHead title="📈 Daily Active Users" sub="Last 7 days" />
          <LineChart data={DAILY_USERS} color={G.accent} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            {WEEK_DAYS.map(d=><span key={d} style={{ fontSize:10, color:G.muted }}>{d}</span>)}
          </div>
        </div>
        <div className="card">
          <SHead title="📊 Tests Attempted Daily" sub="Last 7 days" />
          <LineChart data={DAILY_TESTS} color={G.green} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            {WEEK_DAYS.map(d=><span key={d} style={{ fontSize:10, color:G.muted }}>{d}</span>)}
          </div>
        </div>
        <div className="card">
          <SHead title="🎯 Exam Distribution" />
          {examDist.map((e,i)=>(
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{e.name}</span>
                <div style={{ display:"flex", gap:8 }}>
                  <Mono size={11} color={G.sub}>{e.users.toLocaleString()}</Mono>
                  <Mono size={12} color={e.color}>{e.pct}%</Mono>
                </div>
              </div>
              <Bar pct={e.pct} color={e.color} h={7} />
            </div>
          ))}
        </div>
      </div>
      {/* Activity Feed */}
      <div className="card">
        <SHead title="⚡ Live Activity Feed" sub="Real-time platform events" right={<Tag color={G.green}>Live</Tag>} />
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {recentActivity.map((a,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 14px", background:G.panel, borderRadius:10, border:`1px solid ${G.border}` }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{a.icon}</span>
              <span style={{ fontSize:13, color:G.sub, flex:1, lineHeight:1.5 }}>{a.msg}</span>
              <span style={{ fontSize:11, color:G.muted, whiteSpace:"nowrap" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── QUESTION BANK PAGE ─────────────────────────────────────── */
function QuestionBankPage({ setPage, setEditQ }) {
  const [questions, setQuestions] = useState(initQuestions);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const exams = ["All","SSC","UPSC","JEE","Banking"];
  const filtered = questions
    .filter(q => filter==="All" || q.exam===filter)
    .filter(q => q.q.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()));

  const deleteQ = (id) => {
    setQuestions(qs=>qs.filter(q=>q.id!==id));
    setToast({ msg:"Question deleted successfully", type:"success" });
  };
  const toggleStatus = (id) => {
    setQuestions(qs=>qs.map(q=>q.id===id?{ ...q, status:q.status==="Active"?"Inactive":"Active" }:q));
    setToast({ msg:"Status updated", type:"success" });
  };

  return (
    <div style={{ padding:"28px", maxWidth:1200 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700 }}>Question Bank</h2>
          <p style={{ color:G.sub, fontSize:13, marginTop:3 }}>{questions.length} questions across 4 exams</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost">📤 Bulk Upload</button>
          <button className="btn btn-primary" onClick={()=>setPage("addq")}>+ Add Question</button>
        </div>
      </div>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[["SSC",G.gold,4],["UPSC",G.accent,2],["JEE",G.purple,2],["Banking",G.green,2]].map(([e,c,n])=>(
          <div key={e} className="card" style={{ cursor:"pointer" }} onClick={()=>setFilter(e)}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:28, fontWeight:700, color:c }}>{n}</div>
            <div style={{ fontSize:12, color:G.sub, marginTop:4 }}>{e} Questions</div>
            <Bar pct={(n/questions.length)*100} color={c} h={4} />
          </div>
        ))}
      </div>
      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, border:`1px solid ${G.border2}`, borderRadius:10, padding:"8px 14px", flex:1, maxWidth:280 }}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions or topics..." className="input" style={{ background:"transparent", border:"none", padding:0, outline:"none", fontSize:13 }} />
        </div>
        {exams.map(e=>(
          <button key={e} onClick={()=>setFilter(e)} style={{ padding:"7px 16px", borderRadius:999, border:`1px solid ${filter===e?G.accent:G.border2}`, background:filter===e?G.accentLo:"transparent", color:filter===e?G.accent:G.sub, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>{e}</button>
        ))}
        <Tag color={G.sub}>{filtered.length} results</Tag>
      </div>
      {/* Table */}
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 80px 80px 80px 70px 80px 120px", gap:12, padding:"8px 16px", fontSize:10, color:G.muted, fontWeight:700, letterSpacing:1.2 }}>
          <span>ID</span><span>QUESTION</span><span>EXAM</span><span>SUBJECT</span><span>TOPIC</span><span>DIFF</span><span>STATUS</span><span>ACTIONS</span>
        </div>
        {filtered.map((q,i)=>(
          <div key={q.id} className="tbl-row" style={{ gridTemplateColumns:"40px 1fr 80px 80px 80px 70px 80px 120px" }}>
            <Mono size={12} color={G.muted}>#{q.id}</Mono>
            <div>
              <div style={{ fontWeight:600, fontSize:13, lineHeight:1.4, marginBottom:3 }}>{q.q.length>70?q.q.slice(0,70)+"...":q.q}</div>
              <div style={{ fontSize:11, color:G.sub }}>{q.attempts.toLocaleString()} attempts</div>
            </div>
            <Tag color={q.exam==="SSC"?G.gold:q.exam==="JEE"?G.purple:q.exam==="UPSC"?G.accent:G.green}>{q.exam}</Tag>
            <div style={{ fontSize:12, color:G.sub, lineHeight:1.3 }}>{q.subject}</div>
            <Tag color={G.sub}>{q.topic}</Tag>
            <Tag color={q.diff==="Easy"?G.green:q.diff==="Medium"?G.gold:G.red}>{q.diff}</Tag>
            <Tag color={q.status==="Active"?G.green:q.status==="Draft"?G.yellow:G.muted}>{q.status}</Tag>
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>{ setEditQ(q); setPage("addq"); }}>✏️</button>
              <button className="btn" style={{ padding:"5px 10px", fontSize:11, background:q.status==="Active"?G.orange+"18":"transparent", color:q.status==="Active"?G.orange:G.green, border:`1px solid ${q.status==="Active"?G.orange:G.green}33` }} onClick={()=>toggleStatus(q.id)}>
                {q.status==="Active"?"⏸":"▶"}
              </button>
              <button className="btn btn-danger" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>deleteQ(q.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TESTS PAGE ─────────────────────────────────────────────── */
function TestsPage({ setPage }) {
  const [tests, setTests] = useState(initTests);
  const [toast, setToast] = useState(null);
  const toggleTest = (id) => {
    setTests(ts=>ts.map(t=>t.id===id?{ ...t, status:t.status==="Live"?"Inactive":t.status==="Draft"?"Live":"Live" }:t));
    setToast({ msg:"Test status updated", type:"success" });
  };
  const deleteTest = (id) => {
    setTests(ts=>ts.filter(t=>t.id!==id));
    setToast({ msg:"Test deleted", type:"success" });
  };
  return (
    <div style={{ padding:"28px", maxWidth:1200 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700 }}>Mock Tests</h2>
          <p style={{ color:G.sub, fontSize:13, marginTop:3 }}>{tests.filter(t=>t.status==="Live").length} live tests · {tests.filter(t=>t.status==="Draft").length} drafts</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setPage("create")}>+ Create Test</button>
      </div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[
          [tests.filter(t=>t.status==="Live").length,    "Live Tests",    G.green ],
          [tests.filter(t=>t.status==="Draft").length,   "Drafts",        G.yellow],
          [tests.reduce((a,t)=>a+t.attempts,0).toLocaleString(), "Total Attempts", G.accent],
          [Math.round(tests.filter(t=>t.avgScore>0).reduce((a,t)=>a+t.avgScore,0)/tests.filter(t=>t.avgScore>0).length)+"%", "Platform Avg", G.purple],
        ].map(([v,l,c])=>(
          <div key={l} className="card">
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:28, fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:12, color:G.sub, marginTop:5 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 70px 80px 80px 80px 130px", gap:12, padding:"8px 16px", fontSize:10, color:G.muted, fontWeight:700, letterSpacing:1.2 }}>
          <span>TEST NAME</span><span>EXAM</span><span>TYPE</span><span>QS</span><span>STATUS</span><span>ATTEMPTS</span><span>AVG SCORE</span><span>ACTIONS</span>
        </div>
        {tests.map((t,i)=>(
          <div key={t.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 80px 80px 70px 80px 80px 80px 130px" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
              <div style={{ fontSize:11, color:G.sub }}>⏱ {t.time} min</div>
            </div>
            <Tag color={t.exam==="SSC"?G.gold:t.exam==="JEE"?G.purple:t.exam==="UPSC"?G.accent:G.green}>{t.exam}</Tag>
            <Tag color={G.sub}>{t.type}</Tag>
            <Mono size={13} color={G.text}>{t.qs}</Mono>
            <Tag color={t.status==="Live"?G.green:t.status==="Draft"?G.yellow:G.muted}>{t.status}</Tag>
            <Mono size={13} color={G.accent}>{t.attempts.toLocaleString()}</Mono>
            <Mono size={13} color={t.avgScore>0?G.green:G.muted}>{t.avgScore>0?t.avgScore+"%":"—"}</Mono>
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:11 }}>✏️</button>
              <button className="btn" style={{ padding:"5px 10px", fontSize:11, background:t.status==="Live"?G.orange+"18":G.green+"18", color:t.status==="Live"?G.orange:G.green, border:`1px solid ${t.status==="Live"?G.orange:G.green}33` }} onClick={()=>toggleTest(t.id)}>
                {t.status==="Live"?"⏸":"▶"}
              </button>
              <button className="btn btn-danger" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>deleteTest(t.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── USERS PAGE ─────────────────────────────────────────────── */
function UsersPage() {
  const [users, setUsers] = useState(initUsers);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));
  const toggleUser = (id) => {
    setUsers(us=>us.map(u=>u.id===id?{ ...u, status:u.status==="Active"?"Suspended":"Active" }:u));
    setToast({ msg:"User status updated", type:"success" });
  };
  return (
    <div style={{ padding:"28px", maxWidth:1200 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700 }}>User Management</h2>
          <p style={{ color:G.sub, fontSize:13, marginTop:3 }}>{users.filter(u=>u.status==="Active").length} active · {users.filter(u=>u.status==="Suspended").length} suspended</p>
        </div>
        <button className="btn btn-primary">📤 Export CSV</button>
      </div>
      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[
          [PLATFORM_STATS.totalUsers.toLocaleString(), "Total Registered", G.accent],
          [PLATFORM_STATS.activeToday.toLocaleString(),"Active Today",     G.green ],
          [users.filter(u=>u.status==="Suspended").length, "Suspended",    G.red   ],
          ["74%", "Avg Completion Rate",                                    G.purple],
        ].map(([v,l,c])=>(
          <div key={l} className="card">
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:26, fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:12, color:G.sub, marginTop:5 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:G.card, border:`1px solid ${G.border2}`, borderRadius:10, padding:"8px 14px", flex:1, maxWidth:320 }}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="input" style={{ background:"transparent", border:"none", padding:0, outline:"none", fontSize:13 }} />
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 160px 100px 60px 60px 80px 100px", gap:12, padding:"8px 16px", fontSize:10, color:G.muted, fontWeight:700, letterSpacing:1.2 }}>
          <span>USER</span><span>EMAIL</span><span>EXAM</span><span>TESTS</span><span>AVG</span><span>STATUS</span><span>ACTION</span>
        </div>
        {filtered.map((u,i)=>(
          <div key={u.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 160px 100px 60px 60px 80px 100px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg, ${G.accent}, #0EA5E9)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#020408", flexShrink:0 }}>
                {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{u.name}</div>
                <div style={{ fontSize:11, color:G.sub }}>{u.joined}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:G.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
            <Tag color={u.exam.includes("SSC")?G.gold:u.exam==="Banking"?G.green:u.exam==="JEE"?G.purple:G.accent}>{u.exam}</Tag>
            <Mono size={13} color={G.text}>{u.tests}</Mono>
            <Mono size={13} color={u.score>=80?G.green:u.score>=65?G.gold:G.red}>{u.score}%</Mono>
            <Tag color={u.status==="Active"?G.green:G.red}>{u.status}</Tag>
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:11 }}>👁</button>
              <button className="btn" style={{ padding:"5px 10px", fontSize:11, background:u.status==="Active"?G.red+"18":G.green+"18", color:u.status==="Active"?G.red:G.green, border:`1px solid ${u.status==="Active"?G.red:G.green}33` }} onClick={()=>toggleUser(u.id)}>
                {u.status==="Active"?"🚫":"✅"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CREATE TEST PAGE ───────────────────────────────────────── */
function CreateTestPage({ setPage }) {
  const [form, setForm] = useState({ name:"", exam:"SSC", type:"Full Length", qs:100, time:60, negMark:true, sections:["Quant","Reasoning","English","GK"] });
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState(null);
  const upd = (k,v) => setForm(f=>({ ...f, [k]:v }));

  const handlePublish = () => {
    setToast({ msg:"Test published successfully! 🎉", type:"success" });
    setTimeout(()=>setPage("tests"), 2000);
  };

  return (
    <div style={{ padding:"28px", maxWidth:760 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button onClick={()=>setPage("tests")} className="btn btn-ghost" style={{ padding:"8px 14px" }}>← Back</button>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700 }}>Create New Test</h2>
          <p style={{ color:G.sub, fontSize:13 }}>Step {step+1} of 3</p>
        </div>
      </div>
      {/* Progress */}
      <div style={{ display:"flex", gap:0, marginBottom:32 }}>
        {["Basic Info","Configure","Review & Publish"].map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", flex:i<2?1:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:i<=step?G.accent:G.border2, color:i<=step?"#020408":G.sub, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, transition:"all 0.3s" }}>{i<step?"✓":i+1}</div>
              <span style={{ fontSize:12, fontWeight:600, color:i<=step?G.accent:G.sub }}>{s}</span>
            </div>
            {i<2 && <div style={{ flex:1, height:1, background:i<step?G.accent:G.border, margin:"0 10px", transition:"background 0.3s" }} />}
          </div>
        ))}
      </div>

      {step===0 && (
        <div className="card fade-in" style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Basic Information</div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:G.sub, display:"block", marginBottom:7 }}>Test Name *</label>
            <input className="input" placeholder="e.g. SSC CGL Full Mock Test #14" value={form.name} onChange={e=>upd("name",e.target.value)} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:G.sub, display:"block", marginBottom:7 }}>Target Exam *</label>
              <select className="input" value={form.exam} onChange={e=>upd("exam",e.target.value)}>
                {["SSC","UPSC","JEE","Banking","RRB"].map(e=><option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:G.sub, display:"block", marginBottom:7 }}>Test Type *</label>
              <select className="input" value={form.type} onChange={e=>upd("type",e.target.value)}>
                {["Full Length","Sectional","Topic-wise","PYQ"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:G.sub, display:"block", marginBottom:7 }}>No. of Questions</label>
              <input type="number" className="input" value={form.qs} onChange={e=>upd("qs",+e.target.value)} min={5} max={200} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:G.sub, display:"block", marginBottom:7 }}>Time Limit (minutes)</label>
              <input type="number" className="input" value={form.time} onChange={e=>upd("time",+e.target.value)} min={5} max={300} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ alignSelf:"flex-end", padding:"11px 28px" }} onClick={()=>form.name&&setStep(1)}>
            Next: Configure →
          </button>
        </div>
      )}

      {step===1 && (
        <div className="card fade-in" style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Test Configuration</div>
          {/* Sections */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:G.sub, display:"block", marginBottom:10 }}>Sections to Include</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {["Quant","Reasoning","English","GK","Science","Computer"].map(s=>{
                const on = form.sections.includes(s);
                return (
                  <div key={s} onClick={()=>upd("sections",on?form.sections.filter(x=>x!==s):[...form.sections,s])} style={{ padding:"12px 16px", border:`1.5px solid ${on?G.accent:G.border2}`, borderRadius:10, cursor:"pointer", background:on?G.accentLo:G.panel, display:"flex", alignItems:"center", gap:10, transition:"all 0.2s" }}>
                    <div style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${on?G.accent:G.border2}`, background:on?G.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#020408", fontWeight:900 }}>
                      {on && "✓"}
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, color:on?G.accent:G.sub }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Options */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              ["Negative Marking (−0.25)","negMark"],
              ["Shuffle Questions","shuffle"],
              ["Show Timer","showTimer"],
              ["Allow Review","allowReview"],
            ].map(([label,key])=>{
              const on = form[key];
              return (
                <div key={key} onClick={()=>upd(key,!on)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:G.panel, border:`1px solid ${G.border}`, borderRadius:10, cursor:"pointer" }}>
                  <div style={{ width:42, height:22, borderRadius:999, background:on?G.accent:G.muted, position:"relative", transition:"background 0.2s" }}>
                    <div style={{ position:"absolute", top:2, left:on?22:2, width:18, height:18, borderRadius:"50%", background:"#EEF2FF", transition:"left 0.2s" }} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:G.sub }}>{label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
            <button className="btn btn-ghost" onClick={()=>setStep(0)}>← Back</button>
            <button className="btn btn-primary" style={{ padding:"11px 28px" }} onClick={()=>setStep(2)}>Next: Review →</button>
          </div>
        </div>
      )}

      {step===2 && (
        <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card" style={{ border:`1px solid ${G.accent}33`, background:`linear-gradient(135deg, #0C1420, #080C18)` }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:16, color:G.accent }}>📋 Test Summary</div>
            {[
              ["Test Name",  form.name||"(Untitled)"],
              ["Exam",       form.exam],
              ["Type",       form.type],
              ["Questions",  form.qs],
              ["Duration",   form.time+" minutes"],
              ["Sections",   form.sections.join(", ")],
              ["Neg. Marking",form.negMark?"Yes (−0.25)":"No"],
            ].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${G.border}`, fontSize:14 }}>
                <span style={{ color:G.sub }}>{l}</span>
                <span style={{ fontWeight:700, color:G.text }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-ghost" style={{ flex:1 }}>💾 Save as Draft</button>
            <button className="btn btn-success" style={{ flex:2 }} onClick={handlePublish}>🚀 Publish Test</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ADD QUESTION PAGE ──────────────────────────────────────── */
function AddQuestionPage({ editQ, setEditQ, setPage }) {
  const [form, setForm] = useState(editQ || { exam:"SSC", subject:"Quantitative Aptitude", topic:"", diff:"Medium", q:"", opts:["","","",""], ans:0, exp:"", status:"Active" });
  const [toast, setToast] = useState(null);
  const upd = (k,v) => setForm(f=>({ ...f, [k]:v }));
  const updOpt = (i,v) => setForm(f=>({ ...f, opts:f.opts.map((o,j)=>j===i?v:o) }));
  const handleSave = () => {
    setToast({ msg:`Question ${editQ?"updated":"added"} successfully!`, type:"success" });
    setTimeout(()=>{ setEditQ(null); setPage("questions"); }, 1800);
  };
  return (
    <div style={{ padding:"28px", maxWidth:720 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button onClick={()=>{ setEditQ(null); setPage("questions"); }} className="btn btn-ghost" style={{ padding:"8px 14px" }}>← Back</button>
        <div>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700 }}>{editQ?"Edit":"Add New"} Question</h2>
          <p style={{ color:G.sub, fontSize:13 }}>Fill all fields carefully before saving</p>
        </div>
      </div>
      <div className="card" style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          {[
            ["Exam","exam",["SSC","UPSC","JEE","Banking","RRB"]],
            ["Subject","subject",["Quantitative Aptitude","Reasoning","English","General Awareness","Physics","Chemistry","Mathematics","General Studies"]],
            ["Difficulty","diff",["Easy","Medium","Hard"]],
          ].map(([label,key,opts])=>(
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:700, color:G.sub, display:"block", marginBottom:7, letterSpacing:0.5 }}>{label} *</label>
              <select className="input" value={form[key]} onChange={e=>upd(key,e.target.value)}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:G.sub, display:"block", marginBottom:7 }}>Topic / Tag *</label>
          <input className="input" placeholder="e.g. Algebra, Syllogism, Reading Comprehension..." value={form.topic} onChange={e=>upd("topic",e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:G.sub, display:"block", marginBottom:7 }}>Question Text *</label>
          <textarea className="input" rows={3} placeholder="Enter the complete question here..." value={form.q} onChange={e=>upd("q",e.target.value)} style={{ resize:"vertical" }} />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:G.sub, display:"block", marginBottom:10 }}>Answer Options * <span style={{ color:G.sub, fontWeight:400 }}>(click radio to mark correct)</span></label>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {form.opts.map((opt,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div onClick={()=>upd("ans",i)} style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${form.ans===i?G.green:G.border2}`, background:form.ans===i?G.green:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                  {form.ans===i && <span style={{ fontSize:11, color:"#020408", fontWeight:900 }}>✓</span>}
                </div>
                <div style={{ background:G.accentLo+"80", border:`1px solid ${G.border2}`, borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, color:G.accent, flexShrink:0, width:28, textAlign:"center" }}>{["A","B","C","D"][i]}</div>
                <input className="input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt} onChange={e=>updOpt(i,e.target.value)} style={{ borderColor:form.ans===i?G.green+"66":undefined }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:G.sub, display:"block", marginBottom:7 }}>Explanation / Solution *</label>
          <textarea className="input" rows={3} placeholder="Provide a step-by-step explanation for the correct answer..." value={form.exp} onChange={e=>upd("exp",e.target.value)} style={{ resize:"vertical" }} />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:G.sub, display:"block", marginBottom:8 }}>Status</label>
          <div style={{ display:"flex", gap:8 }}>
            {["Active","Draft","Inactive"].map(s=>(
              <button key={s} onClick={()=>upd("status",s)} style={{ padding:"8px 20px", borderRadius:8, border:`1.5px solid ${form.status===s?G.accent:G.border2}`, background:form.status===s?G.accentLo:"transparent", color:form.status===s?G.accent:G.sub, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, paddingTop:8, borderTop:`1px solid ${G.border}` }}>
          <button className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
          <button className="btn btn-ghost" style={{ flex:1 }}>💾 Save Draft</button>
          <button className="btn btn-success" style={{ flex:2 }} onClick={handleSave}>✅ {editQ?"Update":"Publish"} Question</button>
        </div>
      </div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage]   = useState("dashboard");
  const [editQ, setEditQ] = useState(null);

  const content = () => {
    switch(page) {
      case "dashboard": return <DashboardPage />;
      case "questions": return <QuestionBankPage setPage={setPage} setEditQ={setEditQ} />;
      case "tests":     return <TestsPage setPage={setPage} />;
      case "users":     return <UsersPage />;
      case "create":    return <CreateTestPage setPage={setPage} />;
      case "addq":      return <AddQuestionPage editQ={editQ} setEditQ={setEditQ} setPage={setPage} />;
      default:          return <DashboardPage />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:G.bg }}>
        <Sidebar page={page} setPage={setPage} />
        <div style={{ flex:1, overflowY:"auto" }} className="fade-in">
          {content()}
        </div>
      </div>
    </>
  );
}