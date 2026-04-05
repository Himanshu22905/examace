import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Outfit',sans-serif;background:#030508;color:#EEF2FF;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#030508;} ::-webkit-scrollbar-thumb{background:#162840;border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes toastIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
  .fade-up{animation:fadeUp 0.45s ease forwards;}
  .fade-in{animation:fadeIn 0.3s ease forwards;}
  .spin-anim{animation:spin 0.9s linear infinite;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;cursor:pointer;transition:all 0.2s;color:#6A8CAC;font-size:14px;font-weight:600;border:1px solid transparent;}
  .nav-item:hover{background:#E8B84B08;color:#E8B84B;}
  .nav-item.active{background:#E8B84B14;color:#E8B84B;border-color:#E8B84B33;font-weight:700;}
  .card{background:#090E18;border:1px solid #0F1C2E;border-radius:16px;padding:20px;transition:border-color 0.2s;}
  .card:hover{border-color:#E8B84B22;}
  .btn{padding:9px 20px;border-radius:9px;border:none;font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.15s;}
  .btn-gold{background:linear-gradient(135deg,#E8B84B,#C89030);color:#030508;}
  .btn-ghost{background:transparent;border:1px solid #162840;color:#7090B0;}
  .btn-ghost:hover{border-color:#E8B84B44;color:#E8B84B;}
  .btn-success{background:linear-gradient(135deg,#34D399,#059669);color:#030508;}
  .btn-danger{background:#F8717118;color:#F87171;border:1px solid #F8717133;}
  .field-input{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
  .field-input:focus{border-color:#E8B84B88;}
  .field-input::placeholder{color:#2A4060;}
  .field-select{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;}
  .field-select option{background:#090E18;}
  .toast{position:fixed;bottom:28px;right:16px;left:16px;z-index:500;background:#090E18;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .lbl{font-size:12px;font-weight:700;color:#7090B0;display:block;margin-bottom:7px;letter-spacing:0.5px;}
  .tbl-row{padding:14px 16px;border-radius:10px;border:1px solid #0F1C2E;background:#06090F;transition:all 0.18s;font-size:13px;margin-bottom:8px;}
  .tbl-row:hover{border-color:#E8B84B33;}

  /* Mobile bottom nav */
  .bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:#06090F;border-top:1px solid #0F1C2E;padding:8px 0 calc(8px + env(safe-area-inset-bottom));z-index:100;}
  .bottom-nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 12px;cursor:pointer;flex:1;border:none;background:transparent;color:#6A8CAC;font-family:'Outfit',sans-serif;font-size:10px;font-weight:600;transition:color 0.2s;}
  .bottom-nav-item.active{color:#E8B84B;}
  .bottom-nav-item span.icon{font-size:20px;}

  /* Desktop sidebar */
  .sidebar{width:220px;background:#06090F;border-right:1px solid #0F1C2E;display:flex;flex-direction:column;padding:20px 12px;position:sticky;top:0;height:100vh;flex-shrink:0;}

  /* Responsive */
  @media(max-width:768px){
    .sidebar{display:none!important;}
    .bottom-nav{display:flex!important;}
    .main-content{padding-bottom:80px!important;}
    .grid-4{grid-template-columns:1fr 1fr!important;}
    .grid-2{grid-template-columns:1fr!important;}
    .hide-mobile{display:none!important;}
    .test-card{flex-direction:column!important;align-items:flex-start!important;gap:12px!important;}
    .profile-grid{grid-template-columns:1fr!important;}
    .history-row{grid-template-columns:1fr 60px 70px!important;}
  }
  @media(max-width:480px){
    .grid-4{grid-template-columns:1fr 1fr!important;}
    .kpi-num{font-size:22px!important;}
  }
`;

const EXAMS = ["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","SBI Clerk","UPSC CSE","JEE Main","JEE Advanced","RRB NTPC","State PSC"];
const YEARS = ["2025","2026","2027","2028"];
const GENDERS = ["Male","Female","Other","Prefer not to say"];
const STATES = ["Andhra Pradesh","Bihar","Delhi","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other"];

function Tag({ children, color }) {
  return <span style={{ background:color+"1A", color, border:`1px solid ${color}30`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700, display:"inline-flex" }}>{children}</span>;
}
function Mono({ children, color="#E8B84B", size=13 }) {
  return <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:size, color, fontWeight:600 }}>{children}</span>;
}
function Bar({ pct, color="#E8B84B", h=6 }) {
  return (
    <div style={{ background:"#162840", borderRadius:999, height:h, overflow:"hidden" }}>
      <div style={{ height:"100%", background:`linear-gradient(90deg,${color},${color}99)`, width:`${Math.min(pct||0,100)}%`, borderRadius:999, transition:"width 1.2s ease" }} />
    </div>
  );
}
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone,3000); return () => clearTimeout(t); },[]);
  const color = type==="success" ? "#34D399" : "#F87171";
  return (
    <div className="toast" style={{ border:`1.5px solid ${color}44` }}>
      <span style={{ fontSize:20 }}>{type==="success"?"✅":"❌"}</span>
      <span style={{ fontSize:14, fontWeight:600 }}>{message}</span>
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilePage({ user, profile, attempts, onLogout, onProfileSaved }) {
  const totalTests  = attempts.length;
  const avgScore    = totalTests>0 ? Math.round(attempts.reduce((a,t)=>a+(t.score||0),0)/totalTests) : 0;
  const avgAccuracy = totalTests>0 ? Math.round(attempts.reduce((a,t)=>a+(t.accuracy||0),0)/totalTests) : 0;
  const bestScore   = totalTests>0 ? Math.max(...attempts.map(t=>t.score||0)) : 0;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [fullName, setFullName]     = useState(profile?.full_name||"");
  const [gender, setGender]         = useState(profile?.gender||"");
  const [dob, setDob]               = useState(profile?.date_of_birth||"");
  const [mobile, setMobile]         = useState(profile?.mobile||"");
  const [examPrep, setExamPrep]     = useState(profile?.exam_preparing||"");
  const [targetYear, setTargetYear] = useState(profile?.target_year||"");
  const [state, setState]           = useState(profile?.state||"");
  const [city, setCity]             = useState(profile?.city||"");
  const [bio, setBio]               = useState(profile?.bio||"");

  const startEdit = () => {
    setFullName(profile?.full_name||""); setGender(profile?.gender||"");
    setDob(profile?.date_of_birth||""); setMobile(profile?.mobile||"");
    setExamPrep(profile?.exam_preparing||""); setTargetYear(profile?.target_year||"");
    setState(profile?.state||""); setCity(profile?.city||""); setBio(profile?.bio||"");
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id:user.id, full_name:fullName, gender, date_of_birth:dob, mobile,
      exam_preparing:examPrep, target_year:targetYear, state, city, bio,
    });
    if (error) { setToast({msg:"Error: "+error.message,type:"error"}); }
    else { setEditing(false); setToast({msg:"Profile saved!",type:"success"}); onProfileSaved({full_name:fullName,gender,date_of_birth:dob,mobile,exam_preparing:examPrep,target_year:targetYear,state,city,bio}); }
    setSaving(false);
  };

  const firstName = (fullName||user?.email||"Student").split(" ")[0];

  return (
    <div style={{ padding:"20px 16px", maxWidth:700 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:20 }}>My Profile</h2>
          <p style={{ color:"#7090B0", fontSize:13 }}>Manage your personal information</p>
        </div>
        {!editing ? (
          <button className="btn btn-gold" onClick={startEdit}>✏️ Edit</button>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" onClick={()=>setEditing(false)}>Cancel</button>
            <button className="btn btn-success" onClick={saveProfile} disabled={saving}>{saving?"Saving...":"✅ Save"}</button>
          </div>
        )}
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#E8B84B,#C89030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:800, color:"#030508", flexShrink:0 }}>
            {(fullName||user?.email||"S").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:18 }}>{fullName||"Student"}</div>
            <div style={{ color:"#7090B0", fontSize:12, marginTop:2 }}>{user?.email}</div>
            {examPrep && <Tag color="#E8B84B">{examPrep}</Tag>}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }} className="grid-4">
          {[["📝","Tests",totalTests,"#38BDF8"],["⭐","Avg",avgScore,"#E8B84B"],["🎯","Acc",avgAccuracy+"%","#34D399"],["🏆","Best",bestScore,"#A78BFA"]].map(([icon,l,v,c])=>(
            <div key={l} style={{ background:"#06090F", borderRadius:10, padding:"10px 8px", textAlign:"center", border:"1px solid #0F1C2E" }}>
              <div style={{ fontSize:16, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:700, color:c }}>{v}</div>
              <div style={{ fontSize:10, color:"#7090B0", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Personal Information</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="profile-grid">
          {[
            ["FULL NAME", fullName, setFullName, "text", "Your full name"],
            ["MOBILE NUMBER", mobile, setMobile, "tel", "10-digit number"],
            ["DATE OF BIRTH", dob, setDob, "date", ""],
            ["CITY", city, setCity, "text", "Your city"],
          ].map(([label, val, setter, type, placeholder])=>(
            <div key={label}>
              <label className="lbl">{label}</label>
              {editing ? (
                <input className="field-input" type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={placeholder} maxLength={type==="tel"?10:undefined}/>
              ) : (
                <div style={{ padding:"8px 0", fontSize:14, color:val?"#EEF2FF":"#2A4060" }}>{val||(label==="MOBILE NUMBER"&&val?"+91 "+val:val)||"Not set"}</div>
              )}
            </div>
          ))}
          {[
            ["GENDER", gender, setGender, GENDERS, "Select gender"],
            ["TARGET EXAM", examPrep, setExamPrep, EXAMS, "Select exam"],
            ["TARGET YEAR", targetYear, setTargetYear, YEARS, "Select year"],
            ["STATE", state, setState, STATES, "Select state"],
          ].map(([label, val, setter, options, placeholder])=>(
            <div key={label}>
              <label className="lbl">{label}</label>
              {editing ? (
                <select className="field-select" value={val} onChange={e=>setter(e.target.value)}>
                  <option value="">{placeholder}</option>
                  {options.map(o=><option key={o}>{o}</option>)}
                </select>
              ) : (
                <div style={{ padding:"8px 0", fontSize:14, color:val?"#EEF2FF":"#2A4060" }}>{val||"Not set"}</div>
              )}
            </div>
          ))}
          <div style={{ gridColumn:"1/-1" }}>
            <label className="lbl">BIO / ABOUT ME</label>
            {editing ? (
              <textarea className="field-input" rows={3} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell us about yourself..." style={{ resize:"vertical" }}/>
            ) : (
              <div style={{ padding:"8px 0", fontSize:14, color:bio?"#EEF2FF":"#2A4060", lineHeight:1.6 }}>{bio||"Not set"}</div>
            )}
          </div>
        </div>
        {editing && (
          <div style={{ display:"flex", gap:10, marginTop:16, paddingTop:14, borderTop:"1px solid #0F1C2E" }}>
            <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setEditing(false)}>Cancel</button>
            <button className="btn btn-success" style={{ flex:2 }} onClick={saveProfile} disabled={saving}>{saving?"Saving...":"✅ Save Profile"}</button>
          </div>
        )}
      </div>
      <div className="card">
        <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Account</div>
        <div style={{ padding:"10px 0", borderBottom:"1px solid #0F1C2E", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div><div style={{ fontSize:14, fontWeight:600 }}>Email</div><div style={{ fontSize:12, color:"#7090B0" }}>{user?.email}</div></div>
          <Tag color="#34D399">Verified</Tag>
        </div>
        <div style={{ paddingTop:14 }}>
          <button className="btn btn-danger" style={{ width:"100%", justifyContent:"center", padding:12 }} onClick={onLogout}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY PAGE ──────────────────────────────────────────────────────────────
function HistoryPage({ attempts }) {
  return (
    <div style={{ padding:"20px 16px", maxWidth:900 }}>
      <h2 style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>My Results</h2>
      <p style={{ color:"#7090B0", fontSize:13, marginBottom:20 }}>{attempts.length} tests completed</p>
      {attempts.length===0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", background:"#090E18", borderRadius:20, border:"1px solid #0F1C2E" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>📊</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>No results yet</div>
          <div style={{ color:"#7090B0", fontSize:13, marginBottom:20 }}>Take a test to see your results</div>
          <button className="btn btn-gold" style={{ padding:"12px 24px" }} onClick={()=>window.location.href="/test"}>Take a Test →</button>
        </div>
      ) : attempts.map(a=>(
        <div key={a.id} className="tbl-row">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ flex:1, paddingRight:10 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{a.tests?.name||"Test"}</div>
              <div style={{ fontSize:11, color:"#7090B0", marginTop:2 }}>{a.tests?.type} · {new Date(a.completed_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:"#EEF2FF" }}>{a.score}</div>
              <Tag color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"}>{a.accuracy}%</Tag>
            </div>
          </div>
          <Bar pct={a.accuracy} color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"} h={5}/>
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <Tag color="#E8B84B">{a.tests?.exam||"—"}</Tag>
            <span style={{ fontSize:11, color:"#7090B0" }}>⏱ {a.time_taken?Math.floor(a.time_taken/60)+"m":"—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TESTS PAGE ────────────────────────────────────────────────────────────────
const TEST_CATEGORY_META = {
  SSC: {
    logo: "https://www.google.com/s2/favicons?domain=ssc.nic.in&sz=128",
    color: "#E8B84B",
    subtitle: "Staff Selection Commission"
  },
  Banking: {
    logo: "https://www.google.com/s2/favicons?domain=ibps.in&sz=128",
    color: "#34D399",
    subtitle: "Bank PO and Clerk Exams"
  },
  UPSC: {
    logo: "https://www.google.com/s2/favicons?domain=upsc.gov.in&sz=128",
    color: "#38BDF8",
    subtitle: "Civil Services and Government Exams"
  },
  JEE: {
    logo: "https://www.google.com/s2/favicons?domain=nta.ac.in&sz=128",
    color: "#A78BFA",
    subtitle: "Engineering Entrance Exams"
  },
  RRB: {
    logo: "https://www.google.com/s2/favicons?domain=rrbcdg.gov.in&sz=128",
    color: "#FB923C",
    subtitle: "Railway Recruitment Exams"
  },
  Other: {
    logo: "https://www.google.com/s2/favicons?domain=mockies.in&sz=128",
    color: "#7090B0",
    subtitle: "Other Competitive Exams"
  }
};

const CATEGORY_ORDER = ["SSC", "Banking", "UPSC", "JEE", "RRB", "Other"];

function getTestCategory(examValue = "") {
  const exam = String(examValue).toUpperCase();
  if (exam.includes("SSC")) return "SSC";
  if (exam.includes("BANK") || exam.includes("IBPS") || exam.includes("SBI")) return "Banking";
  if (exam.includes("UPSC") || exam.includes("PSC")) return "UPSC";
  if (exam.includes("JEE")) return "JEE";
  if (exam.includes("RRB") || exam.includes("RAIL")) return "RRB";
  return "Other";
}

function getQuestionCount(questionIds) {
  if (Array.isArray(questionIds)) return questionIds.length;
  if (!questionIds) return 0;
  try {
    const parsed = JSON.parse(questionIds);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function TestsPage({ tests, selectedCategory, setSelectedCategory }) {
  const grouped = tests.reduce((acc, test) => {
    const category = getTestCategory(test.exam);
    if (!acc[category]) acc[category] = [];
    acc[category].push(test);
    return acc;
  }, {});

  const visibleCategories = CATEGORY_ORDER.filter((category) => (grouped[category] || []).length > 0);
  const displayCategories = selectedCategory === "All"
    ? visibleCategories
    : visibleCategories.filter((category) => category === selectedCategory);

  return (
    <div style={{ padding:"20px 16px", maxWidth:980 }}>
      <h2 style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>Available Tests</h2>
      <p style={{ color:"#7090B0", fontSize:13, marginBottom:14 }}>{tests.length} tests available across {visibleCategories.length || 0} categories</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
        {["All", ...visibleCategories].map((category) => {
          const active = selectedCategory === category;
          const meta = TEST_CATEGORY_META[category] || {};
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                border: active ? `1px solid ${(meta.color || "#38BDF8")}66` : "1px solid #0F1C2E",
                background: active ? `${(meta.color || "#38BDF8")}1A` : "#06090F",
                color: active ? (meta.color || "#EEF2FF") : "#7090B0",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              {category !== "All" && <img src={meta.logo} alt={category} style={{ width: 14, height: 14, borderRadius: "50%" }} />}
              {category}
            </button>
          );
        })}
      </div>
      {tests.length===0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", background:"#090E18", borderRadius:20, border:"1px solid #0F1C2E" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>TESTS</div>
          <div style={{ fontWeight:700, fontSize:16 }}>No tests yet</div>
          <div style={{ color:"#7090B0", fontSize:13, marginTop:8 }}>Check back soon!</div>
        </div>
      ) : (
        displayCategories.map((category, categoryIndex) => {
          const categoryTests = grouped[category] || [];
          const meta = TEST_CATEGORY_META[category] || TEST_CATEGORY_META.Other;

          return (
            <div key={category} className="card fade-up" style={{ animationDelay:`${categoryIndex*0.06}s`, marginBottom:14, padding:"16px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:meta.color+"1A", border:`1px solid ${meta.color}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <img
                      src={meta.logo}
                      alt={category + " logo"}
                      style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:meta.color }}>{category}</div>
                    <div style={{ color:"#7090B0", fontSize:12 }}>{meta.subtitle}</div>
                  </div>
                </div>
                <Tag color={meta.color}>{categoryTests.length} test{categoryTests.length>1?"s":""}</Tag>
              </div>

              {categoryTests.map((t, i) => (
                <div key={t.id} className="test-card" style={{ background:"#06090F", border:"1px solid #0F1C2E", borderRadius:12, padding:"14px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:i===categoryTests.length-1?0:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:14, marginBottom:8 }}>{t.name}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <Tag color={meta.color}>{t.exam || category}</Tag>
                      <Tag color="#38BDF8">{t.type}</Tag>
                      <Tag color="#7090B0">Time {t.time_limit}m</Tag>
                      <Tag color="#7090B0">Questions {getQuestionCount(t.question_ids)}</Tag>
                    </div>
                  </div>
                  <button className="btn btn-gold" style={{ flexShrink:0, marginLeft:16, padding:"10px 20px" }} onClick={()=>window.location.href="/test"}>Start</button>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

function AIAnalysisPage({ user, profile, attempts }) {
  const [loading, setLoading] = useState(true);
  const [analysisText, setAnalysisText] = useState("");
  const [error, setError] = useState("");

  const examPerformance = useMemo(() => (
    Object.entries(
      attempts.reduce((acc, attempt) => {
        const exam = attempt.tests?.exam || "Other";
        if (!acc[exam]) acc[exam] = { total: 0, score: 0, accuracy: 0 };
        acc[exam].total += 1;
        acc[exam].score += Number(attempt.score || 0);
        acc[exam].accuracy += Number(attempt.accuracy || 0);
        return acc;
      }, {})
    ).map(([exam, stats]) => ({
      exam,
      tests: stats.total,
      avgScore: Math.round(stats.score / stats.total),
      avgAccuracy: Math.round(stats.accuracy / stats.total)
    })).sort((a, b) => a.avgAccuracy - b.avgAccuracy)
  ), [attempts]);

  const weakAreas = useMemo(() => examPerformance.slice(0, 3), [examPerformance]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const profileExam = profile?.exam_preparing || "General";

      const suggestionReq = supabase
        .from("admin_suggestions")
        .select("*")
        .eq("active", true)
        .or(`exam.eq.${profileExam},exam.eq.All`)
        .order("priority", { ascending: false })
        .limit(8);

      try {
        const { data: suggestions } = await suggestionReq;
        const presetSuggestions = (suggestions || []).map((s) => (
          `- ${s.title}: ${s.message}${s.affiliate_url ? ` (Link: ${s.affiliate_url})` : ""}`
        )).join("\n");

        const prompt = `You are a competitive exam mentor for Indian students.
Student: ${profile?.full_name || user?.email || "Student"}
Target Exam: ${profileExam}
Total Attempts: ${attempts.length}
Weak Areas: ${weakAreas.map((w) => `${w.exam} (${w.avgAccuracy}%)`).join(", ") || "No attempts yet"}
Use these admin preset recommendations only when relevant:
${presetSuggestions || "- No admin preset suggestion available"}
Return plain text with sections:
1) Performance Summary
2) Weak Areas and Why
3) 14-Day Roadmap
4) Book Suggestions (performance-based and admin presets where relevant)
5) Practical Preparation Tips`;

        const aiResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        const aiData = await aiResponse.json();
        if (!aiResponse.ok) throw new Error(aiData.error || "Unable to generate AI analysis");
        setAnalysisText(aiData.content || "");
      } catch (e) {
        const fallback = `1) Performance Summary
You have attempted ${attempts.length} test(s) for ${profileExam}.

2) Weak Areas and Why
${weakAreas.length ? weakAreas.map((w, i) => `${i + 1}. ${w.exam} - ${w.avgAccuracy}% accuracy`).join("\n") : "No weak areas yet. Attempt more tests for personalized analysis."}

3) 14-Day Roadmap
- Day 1-4: Focus on weakest topic and solve 30-40 mixed questions daily.
- Day 5-8: Add timed sectional tests and revise mistakes.
- Day 9-12: Attempt full-length mocks and track accuracy.
- Day 13-14: Rapid revision and previous-year questions.

4) Book Suggestions
- Pick one standard concept book for your target exam.
- Add one objective practice book for weak topics.

5) Practical Preparation Tips
- Maintain an error notebook.
- Analyze each test after submission.
- Prioritize accuracy first, then speed.`;
        setAnalysisText(fallback);
        setError("AI analysis is temporarily unavailable. Showing performance summary.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [attempts, profile?.exam_preparing, profile?.full_name, user?.email, weakAreas]);

  return (
    <div style={{ padding: "20px 16px", maxWidth: 980 }}>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>AI Analysis</h2>
      <p style={{ color: "#7090B0", fontSize: 13, marginBottom: 18 }}>
        Personalized performance review, roadmap, and actionable suggestions.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }} className="grid-4">
        {[["Attempts", attempts.length, "#38BDF8"], ["Weak Areas", weakAreas.length, "#F87171"], ["Target Exam", profile?.exam_preparing || "NA", "#E8B84B"]].map(([label, value, color]) => (
          <div key={label} className="card" style={{ padding: "16px 14px" }}>
            <div style={{ color: "#7090B0", fontSize: 11 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 22, color, fontWeight: 800 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Weak Area Breakdown</div>
        {weakAreas.length === 0 ? (
          <div style={{ color: "#7090B0", fontSize: 13 }}>No attempts yet. Take 2-3 tests to unlock accurate analysis.</div>
        ) : weakAreas.map((area) => (
          <div key={area.exam} style={{ padding: "10px 0", borderTop: "1px solid #0F1C2E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>{area.exam}</span>
              <span style={{ color: "#F87171", fontWeight: 700 }}>{area.avgAccuracy}%</span>
            </div>
            <Bar pct={area.avgAccuracy} color={area.avgAccuracy >= 70 ? "#34D399" : area.avgAccuracy >= 50 ? "#E8B84B" : "#F87171"} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>AI Performance Report</div>
        {loading ? (
          <div style={{ color: "#7090B0", fontSize: 13 }}>Generating analysis...</div>
        ) : (
          <>
            {error && <div style={{ color: "#E8B84B", fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Outfit, sans-serif", lineHeight: 1.7, color: "#CFE2FF", fontSize: 14 }}>{analysisText}</pre>
          </>
        )}
      </div>
    </div>
  );
}
function HomePage({ profile, attempts, tests, firstName, setPage }) {
  const totalTests = attempts.length;
  const avgScore = totalTests > 0 ? Math.round(attempts.reduce((a, t) => a + (t.score || 0), 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round(attempts.reduce((a, t) => a + (t.accuracy || 0), 0) / totalTests) : 0;
  const bestScore = totalTests > 0 ? Math.max(...attempts.map((t) => t.score || 0)) : 0;

  return (
    <div style={{ padding: "20px 16px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 20, background: "radial-gradient(circle at top right,#1A2A44 0%,#090E18 48%,#06090F 100%)", border: "1px solid #1E3554", borderRadius: 18, padding: "18px 16px" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#7090B0", letterSpacing: 2, marginBottom: 6 }}>WELCOME BACK</div>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Hello, <span style={{ color: "#E8B84B" }}>{firstName}!</span></h1>
        <p style={{ color: "#7090B0", fontSize: 13, marginTop: 4 }}>{totalTests === 0 ? "Take your first mock test to get started!" : `You've taken ${totalTests} test${totalTests > 1 ? "s" : ""}. Keep going!`}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }} className="grid-4">
        {[["TS", "Tests", totalTests, "#38BDF8"], ["AV", "Avg Score", avgScore, "#E8B84B"], ["AC", "Accuracy", avgAccuracy + "%", "#34D399"], ["BS", "Best", bestScore, "#A78BFA"]].map(([icon, label, val, color], i) => (
          <div key={label} className="card fade-up" style={{ animationDelay: `${i * 0.07}s`, padding: "16px 12px" }}>
            <div style={{ fontSize: 12, marginBottom: 8, color: "#7090B0", fontFamily: "'JetBrains Mono',monospace" }}>{icon}</div>
            <div className="kpi-num" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11, color: "#7090B0", marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }} className="grid-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Results</div>
            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setPage("history")}>View all</button>
          </div>
          {attempts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#7090B0" }}><div style={{ fontSize: 12 }}>No tests yet</div></div>
          ) : attempts.slice(0, 3).map((a) => (
            <div key={a.id} style={{ padding: "10px 12px", background: "#06090F", borderRadius: 10, border: "1px solid #0F1C2E", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 6 }}>{a.tests?.name || "Test"}</div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: a.accuracy >= 70 ? "#34D399" : a.accuracy >= 50 ? "#E8B84B" : "#F87171", flexShrink: 0 }}>{a.score}</span>
              </div>
              <Bar pct={a.accuracy} color={a.accuracy >= 70 ? "#34D399" : a.accuracy >= 50 ? "#E8B84B" : "#F87171"} h={4} />
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Available Tests</div>
            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setPage("tests")}>View all</button>
          </div>
          {tests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#7090B0" }}><div style={{ fontSize: 12 }}>No tests yet</div></div>
          ) : tests.slice(0, 3).map((t) => (
            <div key={t.id} style={{ padding: "10px 12px", background: "#06090F", borderRadius: 10, border: "1px solid #0F1C2E", marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>{t.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Tag color="#E8B84B">{t.exam}</Tag>
                <button className="btn btn-gold" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => window.location.href = "/test"}>Start</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalTests === 0 && (
        <div style={{ background: "linear-gradient(135deg,#0C1420,#080E18)", border: "1px solid #E8B84B33", borderRadius: 16, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Ready to start?</div>
            <div style={{ color: "#7090B0", fontSize: 13 }}>Take your first mock test!</div>
          </div>
          <button className="btn btn-gold" style={{ padding: "11px 24px" }} onClick={() => window.location.href = "/test"}>Take First Test</button>
        </div>
      )}
    </div>
  );
}
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);

      const { data: att } = await supabase
        .from("test_attempts")
        .select("*,tests(name,exam,type,time_limit)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      setAttempts(att || []);

      const { data: t } = await supabase.from("tests").select("*").eq("status", "published");
      setTests(t || []);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const handleProfileSaved = (data) => setProfile((prev) => ({ ...prev, ...data }));

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: "100vh", background: "#030508", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #162840", borderTopColor: "#E8B84B", borderRadius: "50%" }} className="spin-anim" />
          <div style={{ color: "#7090B0", fontSize: 14 }}>Loading...</div>
        </div>
      </>
    );
  }

  const firstName = (profile?.full_name || user?.email || "Student").split(" ")[0];
  const availableCategories = CATEGORY_ORDER.filter((category) => tests.some((test) => getTestCategory(test.exam) === category));

  const nav = [
    { id: "home", icon: "DB", label: "Dashboard" },
    { id: "tests", icon: "TS", label: "Tests" },
    { id: "analysis", icon: "AI", label: "AI Analysis" },
    { id: "history", icon: "RS", label: "Results" },
    { id: "profile", icon: "PF", label: "Profile" }
  ];

  const content = () => {
    switch (page) {
      case "home":
        return <HomePage profile={profile} attempts={attempts} tests={tests} firstName={firstName} setPage={setPage} />;
      case "tests":
        return <TestsPage tests={tests} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
      case "analysis":
        return <AIAnalysisPage user={user} profile={profile} attempts={attempts} />;
      case "history":
        return <HistoryPage attempts={attempts} />;
      case "profile":
        return <ProfilePage user={user} profile={profile} attempts={attempts} onLogout={handleLogout} onProfileSaved={handleProfileSaved} />;
      default:
        return <HomePage profile={profile} attempts={attempts} tests={tests} firstName={firstName} setPage={setPage} />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#030508" }}>
        <aside className="sidebar">
          <div style={{ padding: "4px 6px 20px" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: "#E8B84B", letterSpacing: 2 }}>MOCKIES</div>
            <div style={{ fontSize: 9, color: "#2A4060", letterSpacing: 2, marginTop: 2 }}>STUDENT PORTAL</div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {nav.map((n) => (
              <div key={n.id}>
                <div className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
                  <span style={{ fontSize: 11, width: 22, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>{n.icon}</span>
                  <span>{n.label}</span>
                </div>
                {n.id === "tests" && page === "tests" && availableCategories.length > 0 && (
                  <div style={{ marginLeft: 30, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                    {["All", ...availableCategories].map((category) => {
                      const active = selectedCategory === category;
                      const meta = TEST_CATEGORY_META[category] || {};
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          style={{
                            background: active ? "#0E1724" : "transparent",
                            border: active ? "1px solid #1B2A42" : "1px solid transparent",
                            color: active ? "#EEF2FF" : "#7090B0",
                            borderRadius: 8,
                            fontSize: 11,
                            padding: "5px 8px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          {category !== "All" && <img src={meta.logo} alt={category} style={{ width: 12, height: 12, borderRadius: "50%" }} />}
                          {category}
                        </button>
                      );
                    })}
                  </div>
                )}
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

        <div style={{ flex: 1, overflowY: "auto" }} className="main-content">
          <div style={{ display: "none", padding: "14px 16px", background: "#06090F", borderBottom: "1px solid #0F1C2E", alignItems: "center", justifyContent: "space-between" }} className="mobile-topbar" id="mobileTopbar">
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: "#E8B84B" }}>MOCKIES</div>
            <div style={{ fontSize: 13, color: "#7090B0" }}>Hi, {firstName}!</div>
          </div>
          <style>{`@media(max-width:768px){#mobileTopbar{display:flex!important;}}`}</style>
          {content()}
        </div>

        <nav className="bottom-nav">
          {nav.map((n) => (
            <button key={n.id} className={`bottom-nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="icon" style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
