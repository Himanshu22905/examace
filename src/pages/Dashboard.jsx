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
  @keyframes toastIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
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
  .btn-success{background:linear-gradient(135deg,#34D399,#059669);color:#030508;}
  .btn-danger{background:#F8717118;color:#F87171;border:1px solid #F8717133;}
  .tbl-row{display:grid;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid #0F1C2E;background:#06090F;transition:all 0.18s;font-size:13px;}
  .tbl-row:hover{border-color:#E8B84B33;background:#0C1220;}
  .input{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
  .input:focus{border-color:#E8B84B88;}
  .input::placeholder{color:#2A4060;}
  .select{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;}
  .select option{background:#090E18;}
  .toast{position:fixed;bottom:28px;right:28px;z-index:500;background:#090E18;border:1.5px solid #34D39944;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .label{font-size:12px;font-weight:700;color:#7090B0;display:block;margin-bottom:7px;letter-spacing:0.5px;}
`;

function Mono({ children, color="#E8B84B", size=13 }) {
  return <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:size, color, fontWeight:600 }}>{children}</span>;
}
function Tag({ children, color }) {
  return <span style={{ background:color+"1A", color, border:`1px solid ${color}30`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{children}</span>;
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
  const color = type==="success"?"#34D399":"#F87171";
  return (
    <div className="toast" style={{ borderColor:color+"44" }}>
      <span style={{ fontSize:20 }}>{type==="success"?"✅":"❌"}</span>
      <span style={{ fontSize:14, fontWeight:600 }}>{message}</span>
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
  const [toast, setToast]       = useState(null);

  // Profile edit state
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const exams = ["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","SBI Clerk","UPSC CSE","JEE Main","JEE Advanced","RRB NTPC","State PSC"];
  const years = ["2025","2026","2027","2028"];
  const genders = ["Male","Female","Other","Prefer not to say"];
  const states = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Other"];

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);
      setProfileForm(prof || {});
      const { data: att } = await supabase.from("test_attempts").select("*,tests(name,exam,type,time_limit)").eq("user_id",user.id).order("completed_at",{ascending:false});
      setAttempts(att||[]);
      const { data: t } = await supabase.from("tests").select("*").eq("status","published");
      setTests(t||[]);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name:    profileForm.full_name || "",
      mobile:       profileForm.mobile || "",
      gender:       profileForm.gender || "",
      date_of_birth:profileForm.date_of_birth || "",
      exam_preparing:profileForm.exam_preparing || "",
      target_year:  profileForm.target_year || "",
      state:        profileForm.state || "",
      city:         profileForm.city || "",
      bio:          profileForm.bio || "",
    });
    if (error) { setToast({ msg:"Error saving profile", type:"error" }); }
    else {
      setProfile({ ...profile, ...profileForm });
      setEditing(false);
      setToast({ msg:"Profile updated successfully!", type:"success" });
    }
    setSaving(false);
  };

  const upd = (k,v) => setProfileForm(f => ({ ...f, [k]:v }));

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#030508", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div className="spinner" />
        <div style={{ color:"#7090B0", fontSize:14 }}>Loading your dashboard...</div>
      </div>
    </>
  );

  const totalTests  = attempts.length;
  const avgScore    = totalTests>0 ? Math.round(attempts.reduce((a,t)=>a+(t.score||0),0)/totalTests) : 0;
  const avgAccuracy = totalTests>0 ? Math.round(attempts.reduce((a,t)=>a+(t.accuracy||0),0)/totalTests) : 0;
  const bestScore   = totalTests>0 ? Math.max(...attempts.map(t=>t.score||0)) : 0;
  const firstName   = (profile?.full_name||user?.email||"Student").split(" ")[0];

  const nav = [
    { id:"home",    icon:"⊞", label:"Dashboard"  },
    { id:"tests",   icon:"📋", label:"Take a Test" },
    { id:"history", icon:"📊", label:"My Results"  },
    { id:"profile", icon:"👤", label:"My Profile"  },
  ];

  const Sidebar = () => (
    <aside style={{ width:220, background:"#06090F", borderRight:"1px solid #0F1C2E", display:"flex", flexDirection:"column", padding:"20px 12px", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
      <div style={{ padding:"4px 6px 20px" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:"#E8B84B", letterSpacing:2 }}>EXAMACE</div>
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
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  const HomePage = () => (
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
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7090B0", marginBottom:6 }}>
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
        <div style={{ marginTop:16, background:"linear-gradient(135deg,#0C1420,#080E18)", border:"1px solid #E8B84B33", borderRadius:18, padding:"24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>🚀 Ready to start?</div>
            <div style={{ color:"#7090B0", fontSize:14 }}>Take your first mock test and see where you stand!</div>
          </div>
          <button className="btn btn-gold" style={{ fontSize:15, padding:"12px 28px", flexShrink:0 }} onClick={() => window.location.href="/test"}>Take First Test →</button>
        </div>
      )}
    </div>
  );

  // ── HISTORY ───────────────────────────────────────────────────────────────
  const HistoryPage = () => (
    <div style={{ padding:28, maxWidth:900 }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:6 }}>My Test Results</h2>
      <p style={{ color:"#7090B0", fontSize:13, marginBottom:24 }}>{attempts.length} tests completed</p>
      {attempts.length===0 ? (
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

  // ── TESTS ─────────────────────────────────────────────────────────────────
  const TestsPage = () => (
    <div style={{ padding:28, maxWidth:800 }}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:6 }}>Available Tests</h2>
      <p style={{ color:"#7090B0", fontSize:13, marginBottom:24 }}>{tests.length} tests available</p>
      {tests.length===0 ? (
        <div style={{ textAlign:"center", padding:80, background:"#090E18", borderRadius:20, border:"1px solid #0F1C2E" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
          <div style={{ fontWeight:700, fontSize:18 }}>No tests available yet</div>
          <div style={{ color:"#7090B0", fontSize:14, marginTop:8 }}>Check back soon!</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {tests.map((t,i) => (
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
              <button className="btn btn-gold" style={{ flexShrink:0, marginLeft:20, padding:"11px 24px", fontSize:14 }} onClick={() => window.location.href="/test"}>Start →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── PROFILE ───────────────────────────────────────────────────────────────
  const ProfilePage = () => (
    <div style={{ padding:28, maxWidth:700 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>My Profile</h2>
          <p style={{ color:"#7090B0", fontSize:13 }}>Manage your personal information</p>
        </div>
        {!editing ? (
          <button className="btn btn-gold" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" onClick={() => { setEditing(false); setProfileForm(profile||{}); }}>Cancel</button>
            <button className="btn btn-success" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "✅ Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Avatar + basic info */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24 }}>
          <div style={{ position:"relative" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#E8B84B,#C89030)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:800, color:"#030508" }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            {editing && (
              <div style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:"#E8B84B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, cursor:"pointer", border:"2px solid #030508" }}>📷</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:22 }}>{profile?.full_name||"Student"}</div>
            <div style={{ color:"#7090B0", fontSize:13, marginTop:2 }}>{user?.email||profile?.mobile}</div>
            {profile?.exam_preparing && <Tag color="#E8B84B">{profile.exam_preparing}</Tag>}
          </div>
        </div>

        {/* Stats row */}
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

      {/* Editable fields */}
      <div className="card">
        <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Personal Information</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          <div>
            <label className="label">FULL NAME</label>
            {editing ? (
              <input className="input" value={profileForm.full_name||""} onChange={e => upd("full_name",e.target.value)} placeholder="Your full name" />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.full_name?"#EEF2FF":"#2A4060" }}>{profile?.full_name||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">GENDER</label>
            {editing ? (
              <select className="select" value={profileForm.gender||""} onChange={e => upd("gender",e.target.value)}>
                <option value="">Select gender</option>
                {genders.map(g => <option key={g}>{g}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.gender?"#EEF2FF":"#2A4060" }}>{profile?.gender||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">DATE OF BIRTH</label>
            {editing ? (
              <input className="input" type="date" value={profileForm.date_of_birth||""} onChange={e => upd("date_of_birth",e.target.value)} />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.date_of_birth?"#EEF2FF":"#2A4060" }}>{profile?.date_of_birth||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">MOBILE NUMBER</label>
            {editing ? (
              <input className="input" type="tel" value={profileForm.mobile||""} onChange={e => upd("mobile",e.target.value)} placeholder="10-digit number" maxLength={10} />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.mobile?"#EEF2FF":"#2A4060" }}>{profile?.mobile||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">TARGET EXAM</label>
            {editing ? (
              <select className="select" value={profileForm.exam_preparing||""} onChange={e => upd("exam_preparing",e.target.value)}>
                <option value="">Select exam</option>
                {exams.map(e => <option key={e}>{e}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.exam_preparing?"#EEF2FF":"#2A4060" }}>{profile?.exam_preparing||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">TARGET YEAR</label>
            {editing ? (
              <select className="select" value={profileForm.target_year||""} onChange={e => upd("target_year",e.target.value)}>
                <option value="">Select year</option>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.target_year?"#EEF2FF":"#2A4060" }}>{profile?.target_year||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">STATE</label>
            {editing ? (
              <select className="select" value={profileForm.state||""} onChange={e => upd("state",e.target.value)}>
                <option value="">Select state</option>
                {states.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.state?"#EEF2FF":"#2A4060" }}>{profile?.state||"Not set"}</div>
            )}
          </div>

          <div>
            <label className="label">CITY</label>
            {editing ? (
              <input className="input" value={profileForm.city||""} onChange={e => upd("city",e.target.value)} placeholder="Your city" />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.city?"#EEF2FF":"#2A4060" }}>{profile?.city||"Not set"}</div>
            )}
          </div>

          <div style={{ gridColumn:"1/-1" }}>
            <label className="label">BIO / ABOUT ME</label>
            {editing ? (
              <textarea className="input" rows={3} value={profileForm.bio||""} onChange={e => upd("bio",e.target.value)} placeholder="Tell us about yourself, your preparation strategy..." style={{ resize:"vertical" }} />
            ) : (
              <div style={{ padding:"11px 0", fontSize:14, color:profile?.bio?"#EEF2FF":"#2A4060", lineHeight:1.6 }}>{profile?.bio||"Not set"}</div>
            )}
          </div>

        </div>

        {editing && (
          <div style={{ display:"flex", gap:10, marginTop:20, paddingTop:16, borderTop:"1px solid #0F1C2E" }}>
            <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => { setEditing(false); setProfileForm(profile||{}); }}>Cancel</button>
            <button className="btn btn-success" style={{ flex:2 }} onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "✅ Save Profile Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Account section */}
      <div className="card" style={{ marginTop:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Account</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #0F1C2E" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Email Address</div>
            <div style={{ fontSize:12, color:"#7090B0", marginTop:2 }}>{user?.email||"Not linked"}</div>
          </div>
          <Tag color="#34D399">Verified</Tag>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #0F1C2E" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>Mobile Number</div>
            <div style={{ fontSize:12, color:"#7090B0", marginTop:2 }}>{profile?.mobile?"+91 "+profile.mobile:"Not linked"}</div>
          </div>
          <Tag color={profile?.mobile?"#34D399":"#7090B0"}>{profile?.mobile?"Linked":"Not linked"}</Tag>
        </div>
        <div style={{ paddingTop:16 }}>
          <button className="btn btn-danger" style={{ width:"100%", justifyContent:"center", padding:12 }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <div style={{ display:"flex", minHeight:"100vh", background:"#030508" }}>
        <Sidebar />
        <div style={{ flex:1, overflowY:"auto" }} key={page} className="fade-in">
          {page==="home"    && <HomePage />}
          {page==="tests"   && <TestsPage />}
          {page==="history" && <HistoryPage />}
          {page==="profile" && <ProfilePage />}
        </div>
      </div>
    </>
  );
}