import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthSystem() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [exam, setExam] = useState("SSC CGL");
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const exams = ["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","SBI Clerk","UPSC CSE","JEE Main","JEE Advanced","RRB NTPC","State PSC"];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Outfit',sans-serif;background:#030508;color:#EEF2FF;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    .fade-up{animation:fadeUp 0.4s ease forwards;}
    .wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
    @media(max-width:768px){.wrap{grid-template-columns:1fr;}.left-panel{display:none!important;}}
    .left-panel{background:linear-gradient(160deg,#0C1828,#030508);border-right:1px solid #0F1C2E;display:flex;flex-direction:column;justify-content:center;padding:60px 48px;}
    .right-panel{display:flex;align-items:center;justify-content:center;padding:40px 20px;overflow-y:auto;}
    .card{width:100%;max-width:440px;}
    .logo{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:#E8B84B;letter-spacing:3px;margin-bottom:32px;cursor:pointer;}
    .title{font-size:26px;font-weight:800;margin-bottom:6px;}
    .gold{color:#E8B84B;}
    .subtitle{font-size:14px;color:#7090B0;margin-bottom:24px;}
    .label{font-size:12px;font-weight:700;color:#7090B0;display:block;margin-bottom:7px;letter-spacing:0.5px;}
    .input{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:12px;padding:13px 16px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;margin-bottom:16px;}
    .input:focus{border-color:#E8B84B88;}
    .input::placeholder{color:#2A4060;}
    .select{width:100%;background:#030508;border:1.5px solid #0F1C2E;border-radius:12px;padding:13px 16px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;outline:none;margin-bottom:16px;}
    .select option{background:#090E18;}
    .btn-main{width:100%;padding:14px;background:linear-gradient(135deg,#E8B84B,#C89030);border:none;border-radius:12px;color:#030508;font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;cursor:pointer;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;}
    .btn-main:disabled{opacity:0.5;cursor:not-allowed;}
    .btn-ghost{width:100%;padding:13px;background:transparent;border:1.5px solid #0F1C2E;border-radius:12px;color:#7090B0;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;}
    .btn-ghost:hover{border-color:#E8B84B44;color:#E8B84B;}
    .btn-method{flex:1;padding:12px;border-radius:10px;border:1.5px solid #0F1C2E;background:transparent;color:#7090B0;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;}
    .btn-method.active{border-color:#E8B84B;background:#E8B84B14;color:#E8B84B;}
    .switch-txt{text-align:center;margin-top:20px;font-size:13px;color:#7090B0;}
    .switch-btn{color:#E8B84B;font-weight:700;cursor:pointer;background:none;border:none;font-family:'Outfit',sans-serif;font-size:13px;}
    .error{background:#F8717122;border:1px solid #F8717144;border-radius:10px;padding:12px 16px;color:#F87171;font-size:13px;margin-bottom:16px;}
    .success{background:#34D39922;border:1px solid #34D39944;border-radius:10px;padding:12px 16px;color:#34D399;font-size:13px;margin-bottom:16px;}
    .pass-wrap{position:relative;margin-bottom:16px;}
    .pass-wrap .input{margin-bottom:0;padding-right:48px;}
    .pass-eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:#7090B0;cursor:pointer;font-size:16px;}
    .exam-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
    .exam-chip{padding:10px 12px;border-radius:10px;border:1.5px solid #0F1C2E;background:transparent;color:#7090B0;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s;text-align:center;}
    .exam-chip.selected{border-color:#E8B84B;background:#E8B84B14;color:#E8B84B;}
    .step-bar{display:flex;gap:6px;margin-bottom:28px;}
    .step-dot{height:4px;border-radius:999px;flex:1;transition:background 0.3s;}
    .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(3,5,8,0.3);border-top-color:#030508;border-radius:50%;animation:spin 0.7s linear infinite;}
    .otp-wrap{display:flex;gap:8px;margin-bottom:20px;}
    .otp-input{flex:1;text-align:center;background:#030508;border:1.5px solid #0F1C2E;border-radius:12px;padding:16px 0;color:#EEF2FF;font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;outline:none;transition:border-color 0.2s;}
    .otp-input:focus{border-color:#E8B84B;}
    .phone-row{display:flex;gap:8px;margin-bottom:16px;}
    .cc-select{background:#030508;border:1.5px solid #0F1C2E;border-radius:12px;padding:13px 10px;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:13px;outline:none;width:88px;flex-shrink:0;}
  `;

  const reset = () => { setError(""); setMessage(""); setOtp(["","","","","",""]); };
  const goLogin = () => { setMode("login"); setStep(1); setLoginMethod("email"); reset(); };
  const goReg   = () => { setMode("register"); setStep(1); reset(); };

  const handleEmailLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    window.location.href = "/dashboard";
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) { setError("Enter a valid 10-digit mobile number"); return; }
    setLoading(true); setError("");
    const fullPhone = "+91" + phone.replace(/\D/g,"");
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) { setError(error.message); setLoading(false); return; }
    setMessage("OTP sent to +91 " + phone);
    setMode("phone-verify");
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit OTP"); return; }
    setLoading(true); setError("");
    const fullPhone = "+91" + phone.replace(/\D/g,"");
    const { data, error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: "sms" });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data?.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, mobile: phone });
    }
    window.location.href = "/dashboard";
  };

  const handleRegister = async () => {
    if (!name||!email||!password||!mobile) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (mobile.length < 10) { setError("Enter a valid 10-digit mobile number"); return; }
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, mobile, exam_preparing: exam } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data?.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, full_name: name, mobile, exam_preparing: exam });
    }
    setMessage("Account created! You can now login.");
    setLoading(false);
    setTimeout(() => goLogin(), 2500);
  };

  const handleForgot = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
    if (error) setError(error.message);
    else setMessage("Reset link sent! Check your email.");
    setLoading(false);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n);
    if (val && i < 5) document.getElementById("otp-"+( i+1))?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key==="Backspace" && !otp[i] && i>0) document.getElementById("otp-"+(i-1))?.focus();
  };

  const LeftPanel = () => (
    <div className="left-panel">
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:22, fontWeight:700, color:"#E8B84B", letterSpacing:3, marginBottom:40 }}>⚡ MOCKIES</div>
      <div style={{ fontSize:30, fontWeight:800, lineHeight:1.2, marginBottom:16 }}>
        India's #1 Free<br /><span style={{ color:"#E8B84B" }}>Mock Test Platform</span>
      </div>
      <div style={{ color:"#7090B0", fontSize:14, marginBottom:40, lineHeight:1.7 }}>Join 50,000+ students preparing smarter — completely free.</div>
      {[
        ["🎯","Real CBT Experience","Exactly like the actual exam"],
        ["📊","Detailed Analytics","Track weak areas and improvement"],
        ["🏆","All India Rankings","See where you stand nationally"],
        ["📱","Mobile OTP Login","Quick login — no password needed"],
        ["💯","100% Free Forever","No hidden charges ever"],
      ].map(([icon,title,sub]) => (
        <div key={title} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:38, height:38, borderRadius:9, background:"#E8B84B14", border:"1px solid #E8B84B33", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{title}</div>
            <div style={{ fontSize:12, color:"#7090B0" }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <LeftPanel />
        <div className="right-panel">
          <div className="card fade-up">
            <div className="logo" onClick={() => window.location.href="/"}>⚡ MOCKIES</div>

            {/* LOGIN */}
            {mode==="login" && (
              <>
                <div className="title">Welcome <span className="gold">Back!</span></div>
                <div className="subtitle">Choose how you want to sign in</div>
                <div style={{ display:"flex", gap:8, marginBottom:24 }}>
                  <button className={`btn-method${loginMethod==="email"?" active":""}`} onClick={() => { setLoginMethod("email"); reset(); }}>✉️ Email</button>
                  <button className={`btn-method${loginMethod==="phone"?" active":""}`} onClick={() => { setLoginMethod("phone"); reset(); }}>📱 Mobile OTP</button>
                  {/* Google Login */}
<div style={{ margin:"16px 0" }}>
  <button onClick={async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://mockies.in/dashboard" }
    });
  }} style={{ width:"100%", padding:"13px", background:"#ffffff", border:"1.5px solid #e0e0e0", borderRadius:"12px", color:"#1f1f1f", fontFamily:"'Outfit',sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", transition:"all 0.2s" }}>
    <img src="https://www.google.com/favicon.ico" width="20" height="20" alt="G"/>
    Continue with Google
  </button>
</div>

<div className="divider">
  <div className="divider-line"/>
  <span className="divider-text">OR</span>
  <div className="divider-line"/>
</div>
                </div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                {loginMethod==="email" && (
                  <>
                    <label className="label">EMAIL ADDRESS</label>
                    <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleEmailLogin()} />
                    <label className="label">PASSWORD</label>
                    <div className="pass-wrap">
                      <input className="input" type={showPass?"text":"password"} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleEmailLogin()} />
                      <button className="pass-eye" onClick={() => setShowPass(!showPass)}>{showPass?"🙈":"👁"}</button>
                    </div>
                    <div style={{ textAlign:"right", marginBottom:20 }}>
                      <button className="switch-btn" onClick={() => { setMode("forgot"); reset(); }}>Forgot password?</button>
                    </div>
                    <button className="btn-main" onClick={handleEmailLogin} disabled={loading}>
                      {loading && <span className="spinner"/>}{loading?"Signing in...":"Sign In →"}
                    </button>
                  </>
                )}
                {loginMethod==="phone" && (
                  <>
                    <label className="label">MOBILE NUMBER</label>
                    <div className="phone-row">
                      <select className="cc-select"><option>🇮🇳 +91</option></select>
                      <input className="input" style={{ marginBottom:0 }} type="tel" placeholder="10-digit number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,""))} maxLength={10} />
                    </div>
                    <button className="btn-main" style={{ marginTop:8 }} onClick={handleSendOTP} disabled={loading}>
                      {loading && <span className="spinner"/>}{loading?"Sending OTP...":"Send OTP →"}
                    </button>
                  </>
                )}
                <div className="switch-txt">
                  Don't have an account?{" "}<button className="switch-btn" onClick={goReg}>Create one free</button>
                </div>
              </>
            )}

            {/* OTP VERIFY */}
            {mode==="phone-verify" && (
              <>
                <div className="title">Enter <span className="gold">OTP</span></div>
                <div className="subtitle">6-digit OTP sent to +91 {phone}</div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                <label className="label">ENTER 6-DIGIT OTP</label>
                <div className="otp-wrap">
                  {otp.map((d,i) => (
                    <input key={i} id={"otp-"+i} className="otp-input" type="tel" maxLength={1} value={d}
                      onChange={e => handleOtpChange(i,e.target.value)} onKeyDown={e => handleOtpKey(i,e)} />
                  ))}
                </div>
                <button className="btn-main" onClick={handleVerifyOTP} disabled={loading}>
                  {loading && <span className="spinner"/>}{loading?"Verifying...":"Verify & Login →"}
                </button>
                <button className="btn-ghost" onClick={() => { setMode("login"); setLoginMethod("phone"); reset(); }}>← Change Number</button>
                <div style={{ textAlign:"center", marginTop:14, fontSize:13, color:"#7090B0" }}>
                  Didn't receive?{" "}<button className="switch-btn" onClick={handleSendOTP}>Resend OTP</button>
                </div>
              </>
            )}

            {/* REGISTER */}
            {mode==="register" && (
              <>
                <div className="step-bar">
                  {[1,2].map(s => <div key={s} className="step-dot" style={{ background:step>=s?"#E8B84B":"#0F1C2E" }} />)}
                </div>
                <div className="title">Create <span className="gold">Account</span></div>
                <div className="subtitle">{step===1?"Step 1 — Your basic details":"Step 2 — Your target exam"}</div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                {step===1 && (
                  <>
                    <label className="label">FULL NAME</label>
                    <input className="input" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                    <label className="label">MOBILE NUMBER</label>
                    <div className="phone-row">
                      <select className="cc-select"><option>🇮🇳 +91</option></select>
                      <input className="input" style={{ marginBottom:0 }} type="tel" placeholder="10-digit number" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,""))} maxLength={10} />
                    </div>
                    <div style={{ marginBottom:16 }} />
                    <label className="label">EMAIL ADDRESS</label>
                    <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <label className="label">PASSWORD</label>
                    <div className="pass-wrap">
                      <input className="input" type={showPass?"text":"password"} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                      <button className="pass-eye" onClick={() => setShowPass(!showPass)}>{showPass?"🙈":"👁"}</button>
                    </div>
                    <button className="btn-main" style={{ marginTop:8 }} onClick={() => {
                      if (!name||!email||!password||!mobile){setError("Please fill all fields");return;}
                      if (password.length<6){setError("Password min 6 characters");return;}
                      if (mobile.length<10){setError("Enter valid 10-digit number");return;}
                      setError("");setStep(2);
                    }}>Next →</button>
                  </>
                )}
                {step===2 && (
                  <>
                    <label className="label">SELECT YOUR TARGET EXAM</label>
                    <div className="exam-grid">
                      {exams.map(e => (
                        <button key={e} className={`exam-chip${exam===e?" selected":""}`} onClick={() => setExam(e)}>{e}</button>
                      ))}
                    </div>
                    <button className="btn-main" onClick={handleRegister} disabled={loading}>
                      {loading && <span className="spinner"/>}{loading?"Creating...":"Create Free Account →"}
                    </button>
                    <button className="btn-ghost" onClick={() => {setStep(1);setError("");}}>← Back</button>
                  </>
                )}
                <div className="switch-txt">
                  Already have an account?{" "}<button className="switch-btn" onClick={goLogin}>Sign in</button>
                </div>
              </>
            )}

            {/* FORGOT */}
            {mode==="forgot" && (
              <>
                <div className="title">Reset <span className="gold">Password</span></div>
                <div className="subtitle">We'll send a reset link to your email</div>
                {error   && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                <label className="label">EMAIL ADDRESS</label>
                <input className="input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleForgot()} />
                <button className="btn-main" onClick={handleForgot} disabled={loading}>
                  {loading && <span className="spinner"/>}{loading?"Sending...":"Send Reset Link →"}
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