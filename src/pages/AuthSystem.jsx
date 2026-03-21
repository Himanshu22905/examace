import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthSystem() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [exam, setExam] = useState("SSC CGL");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const exams = ["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","UPSC CSE","JEE Main","RRB NTPC","State PSC"];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Outfit',sans-serif;background:#030508;color:#EEF2FF;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    .fade-up{animation:fadeUp 0.4s ease forwards;}
    .wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
    @media(max-width:768px){.wrap{grid-template-columns:1fr;} .left-panel{display:none!important;}}
    .left-panel{background:linear-gradient(160deg,#0C1828,#030508);border-right:1px solid #0F1C2E;display:flex;flex-direction:column;justify-content:center;padding:60px 48px;position:relative;overflow:hidden;}
    .right-panel{display:flex;align-items:center;justify-content:center;padding:40px 20px;overflow-y:auto;}
    .card{width:100%;max-width:420px;}
    .logo{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#E8B84B;letter-spacing:3px;margin-bottom:32px;}
    .title{font-size:26px;font-weight:800;margin-bottom:6px;}
    .gold{color:#E8B84B;}
    .subtitle{font-size:14px;color:#7090B0;margin-bottom:28px;}
    .label{font-size:12px;font-weight:700;color:#7090B0;display:block;margin-bottom:7px;letter-spacing:0.5px;}
    .input{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:12px;padding:13px 16px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;margin-bottom:16px;}
    .input:focus{border-color:#E8B84B88;}
    .input::placeholder{color:#2A4060;}
    .select{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:12px;padding:13px 16px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;margin-bottom:16px;}
    .select option{background:#090E18;}
    .btn-main{width:100%;padding:14px;background:linear-gradient(135deg,#E8B84B,#C89030);border:none;border-radius:12px;color:#030508;font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:opacity 0.2s;margin-top:4px;}
    .btn-main:hover{opacity:0.9;}
    .btn-main:disabled{opacity:0.5;cursor:not-allowed;}
    .btn-ghost{width:100%;padding:13px;background:transparent;border:1.5px solid #0F1C2E;border-radius:12px;color:#7090B0;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:8px;}
    .btn-ghost:hover{border-color:#E8B84B44;color:#E8B84B;}
    .switch-txt{text-align:center;margin-top:20px;font-size:13px;color:#7090B0;}
    .switch-btn{color:#E8B84B;font-weight:700;cursor:pointer;background:none;border:none;font-family:'Outfit',sans-serif;font-size:13px;}
    .error{background:#F8717122;border:1px solid #F8717144;border-radius:10px;padding:12px 16px;color:#F87171;font-size:13px;margin-bottom:16px;line-height:1.5;}
    .success{background:#34D39922;border:1px solid #34D39944;border-radius:10px;padding:12px 16px;color:#34D399;font-size:13px;margin-bottom:16px;line-height:1.5;}
    .pass-wrap{position:relative;margin-bottom:16px;}
    .pass-wrap .input{margin-bottom:0;padding-right:48px;}
    .pass-eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:#7090B0;cursor:pointer;font-size:16px;}
    .exam-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
    .exam-chip{padding:10px 12px;border-radius:10px;border:1.5px solid #0F1C2E;background:transparent;color:#7090B0;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s;text-align:center;}
    .exam-chip.selected{border-color:#E8B84B;background:#E8B84B14;color:#E8B84B;}
    .step-bar{display:flex;gap:6px;margin-bottom:28px;}
    .step-dot{height:4px;border-radius:999px;flex:1;transition:background 0.3s;}
    .spinner{display:inline-block;width:16px;height:16px;border:2px solid #03050888;border-top-color:#030508;border-radius:50%;animation:spin 0.7s linear infinite;margin-right:8px;vertical-align:middle;}
    .feat-item{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;}
    .feat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
  `;

  const goLogin  = () => { setMode("login");  setError(""); setMessage(""); setStep(1); };
  const goReg    = () => { setMode("register"); setError(""); setMessage(""); setStep(1); };
  const goForgot = () => { setMode("forgot");  setError(""); setMessage(""); };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    window.location.href = "/dashboard";
  };

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!name || !email || !password || !mobile) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (mobile.length < 10) { setError("Please enter a valid mobile number"); return; }
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, mobile, exam_preparing: exam } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    // Insert profile manually as backup
    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name,
        mobile,
        exam_preparing: exam,
      });
    }
    setMessage("✅ Account created! Please check your email to verify, then login.");
    setLoading(false);
    setTimeout(() => goLogin(), 3000);
  };

  // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
  const handleForgot = async () => {
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login"
    });
    if (error) setError(error.message);
    else setMessage("✅ Password reset link sent! Check your email.");
    setLoading(false);
  };

  // ── LEFT PANEL ─────────────────────────────────────────────────────────────
  const LeftPanel = () => (
    <div className="left-panel">
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(ellipse at 20% 50%, #E8B84B08 0%, transparent 60%)", pointerEvents:"none" }} />
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, color:"#E8B84B", letterSpacing:3, marginBottom:40 }}>⚡ EXAMACE</div>
      <div style={{ fontSize:32, fontWeight:800, lineHeight:1.2, marginBottom:16 }}>
        India's #1 Free<br /><span style={{ color:"#E8B84B" }}>Mock Test Platform</span>
      </div>
      <div style={{ color:"#7090B0", fontSize:15, marginBottom:40, lineHeight:1.7 }}>
        Join 50,000+ students preparing smarter for SSC, UPSC, JEE & Banking exams.
      </div>
      {[
        ["🎯","Real CBT Experience","Exactly like the actual exam interface"],
        ["📊","AI-Powered Analytics","Know your weak areas instantly"],
        ["🏆","All India Rankings","See where you stand among lakhs of students"],
        ["💯","100% Free Forever","No hidden charges, no credit card needed"],
      ].map(([icon, title, sub]) => (
        <div className="feat-item" key={title}>
          <div className="feat-icon" style={{ background:"#E8B84B14", border:"1px solid #E8B84B33" }}>{icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{title}</div>
            <div style={{ fontSize:12, color:"#7090B0" }}>{sub}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:40, padding:"16px 20px", background:"#E8B84B0A", border:"1px solid #E8B84B22", borderRadius:14 }}>
        <div style={{ fontSize:13, color:"#7090B0", fontStyle:"italic", marginBottom:8 }}>
          "Scored 89% in SSC CGL using ExamAce mock tests. Best free platform!"
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:"#E8B84B" }}>— Priya S., SSC CGL 2024 Qualifier</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <LeftPanel />
        <div className="right-panel">
          <div className="card fade-up">
            <div className="logo">⚡ EXAMACE</div>

            {/* ── LOGIN ── */}
            {mode === "login" && (
              <>
                <div className="title">Welcome <span className="gold">Back!</span></div>
                <div className="subtitle">Sign in to continue your preparation journey</div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                <label className="label">EMAIL ADDRESS</label>
                <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <label className="label">PASSWORD</label>
                <div className="pass-wrap">
                  <input className="input" type={showPass ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button className="pass-eye" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
                </div>
                <div style={{ textAlign:"right", marginBottom:20 }}>
                  <button className="switch-btn" onClick={goForgot}>Forgot password?</button>
                </div>
                <button className="btn-main" onClick={handleLogin} disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
                <div className="switch-txt">
                  Don't have an account?{" "}
                  <button className="switch-btn" onClick={goReg}>Create one free</button>
                </div>
              </>
            )}

            {/* ── REGISTER ── */}
            {mode === "register" && (
              <>
                <div className="step-bar">
                  {[1,2].map(s => (
                    <div key={s} className="step-dot" style={{ background: step >= s ? "#E8B84B" : "#0F1C2E" }} />
                  ))}
                </div>
                <div className="title">Create <span className="gold">Account</span></div>
                <div className="subtitle">
                  {step === 1 ? "Step 1 — Your basic details" : "Step 2 — Choose your target exam"}
                </div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}

                {step === 1 && (
                  <>
                    <label className="label">FULL NAME</label>
                    <input className="input" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                    <label className="label">MOBILE NUMBER</label>
                    <input className="input" type="tel" placeholder="10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value)} maxLength={10} />
                    <label className="label">EMAIL ADDRESS</label>
                    <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <label className="label">PASSWORD</label>
                    <div className="pass-wrap">
                      <input className="input" type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                      <button className="pass-eye" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
                    </div>
                    <button className="btn-main" onClick={() => {
                      if (!name || !email || !password || !mobile) { setError("Please fill in all fields"); return; }
                      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
                      setError(""); setStep(2);
                    }}>
                      Next →
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <label className="label">SELECT YOUR TARGET EXAM</label>
                    <div className="exam-grid">
                      {exams.map(e => (
                        <button key={e} className={`exam-chip${exam === e ? " selected" : ""}`} onClick={() => setExam(e)}>{e}</button>
                      ))}
                    </div>
                    <button className="btn-main" onClick={handleRegister} disabled={loading}>
                      {loading && <span className="spinner" />}
                      {loading ? "Creating account..." : "Create Free Account →"}
                    </button>
                    <button className="btn-ghost" onClick={() => { setStep(1); setError(""); }}>← Back</button>
                  </>
                )}

                <div className="switch-txt">
                  Already have an account?{" "}
                  <button className="switch-btn" onClick={goLogin}>Sign in</button>
                </div>
              </>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === "forgot" && (
              <>
                <div className="title">Reset <span className="gold">Password</span></div>
                <div className="subtitle">Enter your email — we'll send a reset link instantly</div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                <label className="label">EMAIL ADDRESS</label>
                <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleForgot()} />
                <button className="btn-main" onClick={handleForgot} disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Sending..." : "Send Reset Link →"}
                </button>
                <button className="btn-ghost" onClick={goLogin}>← Back to Login</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}