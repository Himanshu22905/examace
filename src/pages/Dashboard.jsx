import { useState, useEffect, useCallback } from "react";
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
  .fade-up{animation:fadeUp 0.45s ease forwards;}
  .fade-in{animation:fadeIn 0.3s ease forwards;}
  .spin{animation:spin 0.9s linear infinite;}
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
  .btn-success{background:linear-gradient(135deg,#34D399,#059669);color:#030508;}
  .btn-danger{background:#F8717118;color:#F87171;border:1px solid #F8717133;}
  .tbl-row{display:grid;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid #0F1C2E;background:#06090F;transition:all 0.18s;font-size:13px;}
  .tbl-row:hover{border-color:#E8B84B33;background:#0C1220;}
  .field-input{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
  .field-input:focus{border-color:#E8B84B88;}
  .field-input::placeholder{color:#2A4060;}
  .field-select{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;}
  .field-select option{background:#090E18;}
  .toast{position:fixed;bottom:28px;right:28px;z-index:500;background:#090E18;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .lbl{font-size:12px;font-weight:700;color:#7090B0;display:block;margin-bottom:7px;letter-spacing:0.5px;}
`;

const EXAMS = ["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","SBI Clerk","UPSC CSE","JEE Main","JEE Advanced","RRB NTPC","State PSC"];
const YEARS = ["2025","2026","2027","2028"];
const GENDERS = ["Male","Female","Other","Prefer not to say"];
const STATES = ["Andhra Pradesh","Bihar","Delhi","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other"];

function Tag({ children, color }) {
  return <span style={{ background:color+"1A", color, border:`1px solid ${color}30`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{children}</span>;
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
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const color = type==="success" ? "#34D399" : "#F87171";
  return (
    <div className="toast" style={{ border:`1.5px solid ${color}44` }}>
      <span style={{ fontSize:20 }}>{type==="success" ? "✅" : "❌"}</span>
      <span style={{ fontSize:14, fontWeight:600 }}>{message}</span>
    </div>
  );
}

// ── PROFILE PAGE (standalone component outside Dashboard) ─────────────────────
function ProfilePage({ user, profile, attempts, onLogout, onProfileSaved }) {
  const totalTests  = attempts.length;
  const avgScore    = totalTests > 0 ? Math.round(attempts.reduce((a,t) => a+(t.score||0), 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round(attempts.reduce((a,t) => a+(t.accuracy||0), 0) / totalTests) : 0;
  const bestScore   = totalTests > 0 ? Math.max(...attempts.map(t => t.score||0)) : 0;

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  // Local form state — completely independent
  const [fullName, setFullName]   = useState(profile?.full_name || "");
  const [gender, setGender]       = useState(profile?.gender || "");
  const [dob, setDob]             = useState(profile?.date_of_birth || "");
  const [mobile, setMobile]       = useState(profile?.mobile || "");
  const [examPrep, setExamPrep]   = useState(profile?.exam_preparing || "");
  const [targetYear, setTargetYear] = useState(profile?.target_year || "");
  const [state, setState]         = useState(profile?.state || "");
  const [city, setCity]           = useState(profile?.city || "");
  const [bio, setBio]             = useState(profile?.bio || "");

  const startEdit = () => {
    // Reset form to current profile values
    setFullName(profile?.full_name || "");
    setGender(profile?.gender || "");
    setDob(profile?.date_of_birth || "");
    setMobile(profile?.mobile || "");
    setExamPrep(profile?.exam_preparing || "");
    setTargetYear(profile?.target_year || "");
    setState(profile?.state || "");
    setCity(profile?.city || "");
    setBio(profile?.bio || "");
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      gender, date_of_birth: dob, mobile,
      exam_preparing: examPrep, target_year: targetYear,
      state, city, bio,
    });
    if (error) {
      setToast({ msg: "Error saving: " + error.message, type: "error" });
    } else {
      setEditing(false);
      setToast({ msg: "Profile saved successfully!", type: "success" });
      onProfileSaved({ full_name:fullName, gender, date_of_birth:dob, mobile, exam_preparing:examPrep, target_year:targetYear, state, city, bio });
    }
    setSaving(false);
  };

  const firstName = (fullName || user?.email || "Student").split(" ")[0];

  return (
    <div style={{ padding:28, maxWidth:700 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>My Profile</h2>
          <p style={{ color:"#7090B0", fontSize:13 }}>Manage your personal information</p>
        </div>
        {!editing ? (
          <button className="btn btn-gold" onClick={startEdit}>✏️ Edit Profile</button>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-success" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "✅ Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Avatar + info */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#E8B84B,#C89030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#030508", flexShrink:0 }}>
            {(fullName||user?.email||"S").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:20 }}>{fullName || "Student"}</div>
            <div style={{ color:"#7090B0", fontSize:13, marginTop:2 }}>{user?.email}</div>
            {examPrep && <Tag color="#E8B84B">{examPrep}</Tag>}
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[["📝","Tests",totalTests,"#38BDF8"],["⭐","Avg Score",avgScore,"#E8B84B"],["🎯","Accuracy",avgAccuracy+"%","#34D399"],["🏆","Best",bestScore,"#A78BFA"]].map(([icon,l,v,c]) => (
            <div key={l} style={{ background:"#06090F", borderRadius:10, padding:"12px", textAlign:"center", border:"1px solid #0F1C2E" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:c }}>{v}</div>
              <div style={{ fontSize:11, color:"#7090B0", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Personal Information</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          <div>
            <label className="lbl">FULL NAME</label>
            {editing ? (
              <input className="field-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:fullName?"#EEF2FF":"#2A4060" }}>{fullName||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">GENDER</label>
            {editing ? (
              <select className="field-select" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:gender?"#EEF2FF":"#2A4060" }}>{gender||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">DATE OF BIRTH</label>
            {editing ? (
              <input className="field-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:dob?"#EEF2FF":"#2A4060" }}>{dob||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">MOBILE NUMBER</label>
            {editing ? (
              <input className="field-input" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit number" maxLength={10} />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:mobile?"#EEF2FF":"#2A4060" }}>{mobile?"+91 "+mobile:"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">TARGET EXAM</label>
            {editing ? (
              <select className="field-select" value={examPrep} onChange={e => setExamPrep(e.target.value)}>
                <option value="">Select exam</option>
                {EXAMS.map(e => <option key={e}>{e}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:examPrep?"#EEF2FF":"#2A4060" }}>{examPrep||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">TARGET YEAR</label>
            {editing ? (
              <select className="field-select" value={targetYear} onChange={e => setTargetYear(e.target.value)}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:targetYear?"#EEF2FF":"#2A4060" }}>{targetYear||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">STATE</label>
            {editing ? (
              <select className="field-select" value={state} onChange={e => setState(e.target.value)}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:state?"#EEF2FF":"#2A4060" }}>{state||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="lbl">CITY</label>
            {editing ? (
              <input className="field-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Your city" />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:city?"#EEF2FF":"#2A4060" }}>{city||"Not set"}</div>
            )}
          </div>

          <div style={{ gridColumn:"1/-1" }}>
            <label className="lbl">BIO / ABOUT ME</label>
            {editing ? (
              <textarea className="field-input" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself, your preparation strategy..." style={{ resize:"vertical" }} />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:bio?"#EEF2FF":"#2A4060", lineHeight:1.6 }}>{bio||"Not set"}</div>
            )}
          </div>

        </div>

        {editing && (
          <div style={{ display:"flex", gap:10, marginTop:20, paddingTop:16, borderTop:"1px solid #0F1C2E" }}>
            <button className="btn btn-ghost" style={{ flex:1 }} onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-success" style={{ flex:2 }} onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "✅ Save Profile Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="card">
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Account</div>
        <div style={{ padding:"12px 0", borderBottom:"1px solid #0F1C2E", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Email Address</div>
            <div style={{ fontSize:12, color:"#7090B0", marginTop:2 }}>{user?.email}</div>
          </div>
          <Tag color="#34D399">Verified</Tag>
        </div>
        <div style={{ padding:"12px 0", borderBottom:"1px solid #0F1C2E", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Mobile Number</div>
            <div style={{ fontSize:12, color:"#7090B0", marginTop:2 }}>{mobile ? "+91 "+mobile : "Not linked"}</div>
          </div>
          <Tag color={mobile?"#34D399":"#7090B0"}>{mobile?"Linked":"Not linked"}</Tag>
        </div>
        <div style={{ paddingTop:16 }}>
          <button className="btn btn-danger" style={{ width:"100%", justifyContent:"center", padding:12 }} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY PAGE (standalone) ─────────────────────────────────────────────────
function HistoryPage({ attempts }) {
  return (
    <div style={{ padding:28, maxWidth:900 }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:6 }}>My Test Results</h2>
      <p style={{ color:"#7090B0", fontSize:13, marginBottom:24 }}>{attempts.length} tests completed</p>
      {attempts.length === 0 ? (
        <div style={{ textAlign:"center", padding:80, background:"#090E18", borderRadius:20, border:"1px solid #0F1C2E" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📊</div>
          <div style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>No results yet</div>
          <div style={{ color:"#7090B0", fontSize:14, marginBottom:24 }}>Take a test to see your results here</div>
          <button className="btn btn-gold" style={{ padding:"12px 28px" }} onClick={() => window.location.href="/test"}>Take a Test →</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px 80px 80px", gap:12, padding:"8px 16px", fontSize:10, color:"#2A4060", fontWeight:700, letterSpacing:1.2 }}>
            <span>TEST</span><span style={{ textAlign:"center" }}>EXAM</span><span style={{ textAlign:"center" }}>SCORE</span><span style={{ textAlign:"center" }}>ACCURACY</span><span style={{ textAlign:"center" }}>TIME</span><span style={{ textAlign:"center" }}>DATE</span>
          </div>
          {attempts.map(a => (
            <div key={a.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 80px 80px 80px 80px 80px" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{a.tests?.name||"Test"}</div>
                <div style={{ fontSize:11, color:"#7090B0", marginTop:2 }}>{a.tests?.type||"Mock Test"}</div>
              </div>
              <div style={{ textAlign:"center" }}><Tag color="#E8B84B">{a.tests?.exam||"—"}</Tag></div>
              <div style={{ textAlign:"center" }}><Mono size={15} color="#EEF2FF">{a.score}</Mono></div>
              <div style={{ textAlign:"center" }}><Tag color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"}>{a.accuracy}%</Tag></div>
              <div style={{ textAlign:"center" }}><Mono size={12} color="#7090B0">{a.time_taken?Math.floor(a.time_taken/60)+"m":"—"}</Mono></div>
              <div style={{ textAlign:"center", fontSize:12, color:"#7090B0" }}>{new Date(a.completed_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TESTS PAGE (standalone) ───────────────────────────────────────────────────
function TestsPage({ tests }) {
  return (
    <div style={{ padding:28, maxWidth:800 }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:6 }}>Available Tests</h2>
      <p style={{ color:"#7090B0", fontSize:13, marginBottom:24 }}>{tests.length} tests available</p>
      {tests.length === 0 ? (
        <div style={{ textAlign:"center", padding:80, background:"#090E18", borderRadius:20, border:"1px solid #0F1C2E" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
          <div style={{ fontWeight:700, fontSize:18 }}>No tests available yet</div>
          <div style={{ color:"#7090B0", fontSize:14, marginTop:8 }}>Check back soon!</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {tests.map((t, i) => (
            <div key={t.id} className="card fade-up" style={{ animationDelay:`${i*0.07}s`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>{t.name}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <Tag color="#E8B84B">{t.exam}</Tag>
                  <Tag color="#38BDF8">{t.type}</Tag>
                  <Tag color="#7090B0">⏱ {t.time_limit} min</Tag>
                  <Tag color="#7090B0">📝 {Array.isArray(t.question_ids)?t.question_ids.length:(JSON.parse(t.question_ids||"[]")).length} Qs</Tag>
                </div>
              </div>
              <button className="btn btn-gold" style={{ flexShrink:0, marginLeft:20, padding:"11px 24px", fontSize:14 }} onClick={() => window.location.href="/test"}>
                Start →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── HOME PAGE (standalone) ────────────────────────────────────────────────────
function HomePage({ profile, attempts, tests, firstName, setPage }) {
  const totalTests  = attempts.length;
  const avgScore    = totalTests>0 ? Math.round(attempts.reduce((a,t)=>a+(t.score||0),0)/totalTests) : 0;
  const avgAccuracy = totalTests>0 ? Math.round(attempts.reduce((a,t)=>a+(t.accuracy||0),0)/totalTests) : 0;
  const bestScore   = totalTests>0 ? Math.max(...attempts.map(t=>t.score||0)) : 0;

  return (
    <div style={{ padding:28, maxWidth:1000 }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#7090B0", letterSpacing:2, marginBottom:6 }}>WELCOME BACK</div>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Hello, <span style={{ color:"#E8B84B" }}>{firstName}!</span> 👋</h1>
        <p style={{ color:"#7090B0", fontSize:14, marginTop:4 }}>
          {totalTests===0 ? "Take your first mock test to get started!" : `You've taken ${totalTests} test${totalTests>1?"s":""}. Keep going!`}
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[["📝","Tests Taken",totalTests,"#38BDF8"],["⭐","Avg Score",avgScore,"#E8B84B"],["🎯","Avg Accuracy",avgAccuracy+"%","#34D399"],["🏆","Best Score",bestScore,"#A78BFA"]].map(([icon,label,val,color],i) => (
          <div key={label} className="card fade-up" style={{ animationDelay:`${i*0.07}s` }}>
            <div style={{ fontSize:26, marginBottom:10 }}>{icon}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:30, fontWeight:700, color, lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:12, color:"#7090B0", marginTop:6 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>Recent Results</div>
            <button className="btn btn-ghost" style={{ padding:"5px 12px", fontSize:11 }} onClick={() => setPage("history")}>View all</button>
          </div>
          {attempts.length===0 ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:"#7090B0" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📊</div>
              <div style={{ fontSize:13 }}>No tests taken yet</div>
            </div>
          ) : attempts.slice(0,4).map(a => (
            <div key={a.id} style={{ padding:"10px 12px", background:"#06090F", borderRadius:10, border:"1px solid #0F1C2E", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <div style={{ fontSize:13, fontWeight:600, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", paddingRight:8 }}>{a.tests?.name||"Test"}</div>
                <Mono size={14} color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"}>{a.score}</Mono>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7090B0", marginBottom:5 }}>
                <span>Accuracy: {a.accuracy}%</span>
                <span>{new Date(a.completed_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
              </div>
              <Bar pct={a.accuracy} color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"} h={4} />
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>Available Tests</div>
            <button className="btn btn-ghost" style={{ padding:"5px 12px", fontSize:11 }} onClick={() => setPage("tests")}>View all</button>
          </div>
          {tests.length===0 ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:"#7090B0" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
              <div style={{ fontSize:13 }}>No tests published yet</div>
            </div>
          ) : tests.slice(0,4).map(t => (
            <div key={t.id} style={{ padding:"12px 14px", background:"#06090F", borderRadius:10, border:"1px solid #0F1C2E", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{t.name}</div>
                <div style={{ display:"flex", gap:6 }}>
                  <Tag color="#E8B84B">{t.exam}</Tag>
                  <Tag color="#7090B0">⏱ {t.time_limit}m</Tag>
                </div>
              </div>
              <button className="btn btn-gold" style={{ padding:"6px 14px", fontSize:12, flexShrink:0, marginLeft:10 }} onClick={() => window.location.href="/test"}>Start →</button>
            </div>
          ))}
        </div>
      </div>

      {totalTests===0 && (
        <div style={{ marginTop:16, background:"linear-gradient(135deg,#0C1420,#080E18)", border:"1px solid #E8B84B33", borderRadius:18, padding:"24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>🚀 Ready to start?</div>
            <div style={{ color:"#7090B0", fontSize:14 }}>Take your first mock test and see where you stand!</div>
          </div>
          <button className="btn btn-gold" style={{ fontSize:15, padding:"12px 28px", flexShrink:0 }} onClick={() => window.location.href="/test"}>
            Take First Test →
          </button>
        </div>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState("home");

  useEffect(() => {
    const init = async () => {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data:prof } = await supabase.from("profiles").select("*").eq("id",user.id).single();
      setProfile(prof);
      const { data:att } = await supabase.from("test_attempts").select("*,tests(name,exam,type,time_limit)").eq("user_id",user.id).order("completed_at",{ascending:false});
      setAttempts(att||[]);
      const { data:t } = await supabase.from("tests").select("*").eq("status","published");
      setTests(t||[]);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleProfileSaved = (updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#030508", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ width:36, height:36, border:"3px solid #162840", borderTopColor:"#E8B84B", borderRadius:"50%" }} className="spin" />
        <div style={{ color:"#7090B0", fontSize:14 }}>Loading your dashboard...</div>
      </div>
    </>
  );

  const firstName = (profile?.full_name || user?.email || "Student").split(" ")[0];

  const nav = [
    { id:"home",    icon:"⊞", label:"Dashboard"  },
    { id:"tests",   icon:"📋", label:"Take a Test" },
    { id:"history", icon:"📊", label:"My Results"  },
    { id:"profile", icon:"👤", label:"My Profile"  },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:"#030508" }}>
        {/* Sidebar */}
        <aside style={{ width:220, background:"#06090F", borderRight:"1px solid #0F1C2E", display:"flex", flexDirection:"column", padding:"20px 12px", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
          <div style={{ padding:"4px 6px 20px" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:"#E8B84B", letterSpacing:2 }}>MOCKIES</div>
            <div style={{ fontSize:9, color:"#2A4060", letterSpacing:2, marginTop:2 }}>STUDENT PORTAL</div>
          </div>
          <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
            {nav.map(n => (
              <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={() => setPage(n.id)}>
                <span style={{ fontSize:15, width:20, textAlign:"center" }}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div style={{ borderTop:"1px solid #0F1C2E", paddingTop:14, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#E8B84B,#C89030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#030508", flexShrink:0 }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{firstName}</div>
              <button onClick={handleLogout} style={{ background:"none", border:"none", color:"#7090B0", fontSize:11, cursor:"pointer", padding:0, fontFamily:"'Outfit',sans-serif" }}>Sign out</button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {page==="home"    && <HomePage profile={profile} attempts={attempts} tests={tests} firstName={firstName} setPage={setPage} />}
          {page==="tests"   && <TestsPage tests={tests} />}
          {page==="history" && <HistoryPage attempts={attempts} />}
          {page==="profile" && <ProfilePage user={user} profile={profile} attempts={attempts} onLogout={handleLogout} onProfileSaved={handleProfileSaved} />}
        </div>
      </div>
    </>
  );
}