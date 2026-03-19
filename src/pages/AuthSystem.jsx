<<<<<<< HEAD
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthSystem() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) setError(error.message);
    else setMessage("✅ Account created! Please check your email to confirm.");
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://examace-app.vercel.app/reset-password"
    });
    if (error) setError(error.message);
    else setMessage("✅ Password reset link sent to your email!");
    setLoading(false);
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; }
    .auth-wrap {
      min-height: 100vh;
      display: flex;
      background: #030508;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .auth-card {
      background: #090E18;
      border: 1px solid #0F1C2E;
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
    }
    .auth-title {
      font-size: 28px;
      font-weight: 800;
      color: #EEF2FF;
      margin-bottom: 6px;
    }
    .auth-sub {
      font-size: 14px;
      color: #7090B0;
      margin-bottom: 32px;
    }
    .gold { color: #E8B84B; }
    .input-label {
      font-size: 13px;
      font-weight: 600;
      color: #7090B0;
      margin-bottom: 8px;
      display: block;
    }
    .input {
      width: 100%;
      background: #030508;
      border: 1.5px solid #0F1C2E;
      border-radius: 12px;
      padding: 13px 16px;
      color: #EEF2FF;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      outline: none;
      margin-bottom: 18px;
      transition: border-color 0.2s;
    }
    .input:focus { border-color: #E8B84B88; }
    .btn-main {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #E8B84B, #C89030);
      border: none;
      border-radius: 12px;
      color: #030508;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      margin-top: 6px;
      transition: opacity 0.2s;
    }
    .btn-main:hover { opacity: 0.9; }
    .btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
    .switch-txt {
      text-align: center;
      margin-top: 24px;
      font-size: 13px;
      color: #7090B0;
    }
    .switch-btn {
      color: #E8B84B;
      font-weight: 700;
      cursor: pointer;
      background: none;
      border: none;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
    }
    .error-box {
      background: #F8717122;
      border: 1px solid #F8717144;
      border-radius: 10px;
      padding: 12px 16px;
      color: #F87171;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .success-box {
      background: #34D39922;
      border: 1px solid #34D39944;
      border-radius: 10px;
      padding: 12px 16px;
      color: #34D399;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #E8B84B;
      margin-bottom: 28px;
      letter-spacing: 1px;
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="logo">⚡ EXAMACE</div>

          {mode === "login" && (
            <>
              <div className="auth-title">Welcome <span className="gold">Back!</span></div>
              <div className="auth-sub">Sign in to continue your preparation</div>
              {error && <div className="error-box">{error}</div>}
              {message && <div className="success-box">{message}</div>}
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="Enter password"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
              <div style={{ textAlign:"right", marginTop:"-12px", marginBottom:"18px" }}>
                <button className="switch-btn" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}>
                  Forgot password?
                </button>
              </div>
              <button className="btn-main" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
              <div className="switch-txt">
                Don't have an account?{" "}
                <button className="switch-btn" onClick={() => { setMode("register"); setError(""); setMessage(""); }}>
                  Create one free
                </button>
              </div>
            </>
          )}

          {mode === "register" && (
            <>
              <div className="auth-title">Create <span className="gold">Account</span></div>
              <div className="auth-sub">Join 50,000+ students preparing smarter</div>
              {error && <div className="error-box">{error}</div>}
              {message && <div className="success-box">{message}</div>}
              <label className="input-label">Full Name</label>
              <input className="input" type="text" placeholder="Your full name"
                value={name} onChange={e => setName(e.target.value)} />
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRegister()} />
              <button className="btn-main" onClick={handleRegister} disabled={loading}>
                {loading ? "Creating account..." : "Create Free Account →"}
              </button>
              <div className="switch-txt">
                Already have an account?{" "}
                <button className="switch-btn" onClick={() => { setMode("login"); setError(""); setMessage(""); }}>
                  Sign in
                </button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="auth-title">Reset <span className="gold">Password</span></div>
              <div className="auth-sub">Enter your email and we'll send a reset link</div>
              {error && <div className="error-box">{error}</div>}
              {message && <div className="success-box">{message}</div>}
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
              <button className="btn-main" onClick={handleForgotPassword} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
              <div className="switch-txt">
                Remember your password?{" "}
                <button className="switch-btn" onClick={() => { setMode("login"); setError(""); setMessage(""); }}>
                  Sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
=======
import { useState, useEffect, useRef } from "react";

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const G = {
  bg:       "#04080F",
  card:     "#080D18",
  cardHi:   "#0C1525",
  border:   "#0F1E35",
  border2:  "#1A3050",
  gold:     "#E8B84B",
  goldDim:  "#E8B84B55",
  goldFade: "#E8B84B12",
  cyan:     "#22D3EE",
  green:    "#34D399",
  red:      "#F87171",
  purple:   "#A78BFA",
  text:     "#EEF2FF",
  muted:    "#4A6080",
  sub:      "#8BA4BF",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:#04080F;color:#EEF2FF;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#04080F;}
::-webkit-scrollbar-thumb{background:#E8B84B44;border-radius:2px;}

@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideRight{from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);}}
@keyframes slideLeft{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
@keyframes shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-6px);}40%,80%{transform:translateX(6px);}}
@keyframes checkPop{0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
@keyframes gridMove{0%{background-position:0 0;}100%{background-position:60px 60px;}}

.fade-up{animation:fadeUp 0.5s ease forwards;}
.fade-in{animation:fadeIn 0.4s ease forwards;}
.slide-right{animation:slideRight 0.4s ease forwards;}
.slide-left{animation:slideLeft 0.4s ease forwards;}
.shake{animation:shake 0.4s ease;}
.float{animation:float 4s ease-in-out infinite;}
.spin{animation:spin 1s linear infinite;}

.shimmer-text{
  background:linear-gradient(90deg,#E8B84B,#fff,#E8B84B);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 3s linear infinite;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus{
  -webkit-box-shadow:0 0 0 1000px #080D18 inset !important;
  -webkit-text-fill-color:#EEF2FF !important;
  border-color:#1A3050 !important;
}

.input-field{
  width:100%;background:#04080F;
  border:1.5px solid #0F1E35;
  border-radius:12px;padding:14px 16px;
  color:#EEF2FF;font-family:'DM Sans',sans-serif;font-size:15px;
  outline:none;transition:border-color 0.2s, box-shadow 0.2s;
}
.input-field:focus{border-color:#E8B84B88;box-shadow:0 0 0 3px #E8B84B12;}
.input-field::placeholder{color:#4A6080;}
.input-field.error{border-color:#F87171;box-shadow:0 0 0 3px #F8717122;}
.input-field.success{border-color:#34D39988;box-shadow:0 0 0 3px #34D39912;}

.exam-option{
  padding:14px 16px;border-radius:12px;
  border:1.5px solid #0F1E35;background:#04080F;
  cursor:pointer;transition:all 0.2s;display:flex;
  align-items:center;gap:10px;
}
.exam-option:hover{border-color:#E8B84B55;background:#E8B84B08;}
.exam-option.selected{border-color:#E8B84B;background:#E8B84B12;}

.btn-primary{
  width:100%;padding:15px;border-radius:12px;border:none;
  background:linear-gradient(135deg,#E8B84B,#C89030);
  color:#04080F;font-family:'DM Sans',sans-serif;
  font-weight:700;font-size:15px;cursor:pointer;
  transition:transform 0.2s,box-shadow 0.2s;
  box-shadow:0 4px 24px #E8B84B33;letter-spacing:0.3px;
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px #E8B84B44;}
.btn-primary:active{transform:translateY(0);}
.btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none;}

.btn-ghost{
  width:100%;padding:14px;border-radius:12px;
  border:1.5px solid #1A3050;background:transparent;
  color:#8BA4BF;font-family:'DM Sans',sans-serif;
  font-weight:600;font-size:14px;cursor:pointer;
  transition:all 0.2s;
}
.btn-ghost:hover{border-color:#E8B84B55;color:#E8B84B;}

.otp-input{
  width:52px;height:60px;text-align:center;
  font-family:'Space Mono',monospace;font-size:22px;font-weight:700;
  background:#04080F;border:1.5px solid #0F1E35;
  border-radius:12px;color:#EEF2FF;outline:none;
  transition:all 0.2s;caret-color:#E8B84B;
}
.otp-input:focus{border-color:#E8B84B;box-shadow:0 0 0 3px #E8B84B18;transform:scale(1.05);}
.otp-input.filled{border-color:#34D39988;background:#34D39908;}

.progress-step{
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:700;transition:all 0.3s;
}
.tab-btn{
  flex:1;padding:11px;border:none;border-radius:10px;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  cursor:pointer;transition:all 0.2s;
}
`;

/* ─── HELPERS ────────────────────────────────────────────────── */
const validate = {
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  mobile: v => /^[6-9]\d{9}$/.test(v),
  password: v => v.length >= 8,
  name: v => v.trim().length >= 2,
};

function useTimer(initial, active) {
  const [t, setT] = useState(initial);
  useEffect(() => {
    if (!active) { setT(initial); return; }
    if (t <= 0) return;
    const id = setTimeout(() => setT(n => n - 1), 1000);
    return () => clearTimeout(id);
  }, [t, active]);
  return [t, () => setT(initial)];
}

/* ─── SUB-COMPONENTS ─────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 38, height: 38,
        background: `linear-gradient(135deg, ${G.gold}, #C89030)`,
        borderRadius: 10, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18, fontWeight: 900,
        color: "#04080F", fontFamily: "'Playfair Display',serif",
        boxShadow: `0 4px 16px ${G.gold}44`,
      }}>E</div>
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 16, color: G.gold, letterSpacing: 2 }}>EXAMACE</div>
        <div style={{ fontSize: 9, color: G.muted, letterSpacing: 2, marginTop: -2 }}>MOCK TEST PLATFORM</div>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange, error, success, icon, suffix, hint }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: G.sub, letterSpacing: 0.5 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>{icon}</span>}
        <input
          className={`input-field${error ? " error" : success ? " success" : ""}`}
          style={{ paddingLeft: icon ? 42 : 16, paddingRight: isPass ? 44 : suffix ? 80 : 16 }}
          type={isPass ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: G.muted }}>
            {show ? "🙈" : "👁️"}
          </button>
        )}
        {suffix && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: G.gold, fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={suffix.onClick}>{suffix.label}</span>}
        {success && !isPass && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: G.green }}>✓</span>}
      </div>
      {error && <span style={{ fontSize: 12, color: G.red, display: "flex", alignItems: "center", gap: 4 }}>⚠ {error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: G.muted }}>{hint}</span>}
    </div>
  );
}

function ProgressBar({ step, total }) {
  const labels = ["Account", "Verify", "Profile", "Done"];
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : "none" }}>
            <div className="progress-step" style={{
              background: i < step ? G.green : i === step ? G.gold : G.border2,
              color: i < step ? "#04080F" : i === step ? "#04080F" : G.muted,
              boxShadow: i === step ? `0 0 16px ${G.gold}55` : "none",
              fontSize: i < step ? 14 : 13,
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < total - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? G.green : G.border, margin: "0 4px", transition: "background 0.4s" }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: 10, color: i === step ? G.gold : i < step ? G.green : G.muted, fontWeight: i === step ? 700 : 400, letterSpacing: 0.5 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function OTPInput({ value, onChange, error }) {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const d = [...digits];
    d[i] = v.slice(-1);
    onChange(d.join(""));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) { onChange(paste.padEnd(6, "").slice(0, 6)); refs.current[Math.min(paste.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            className={`otp-input${d ? " filled" : ""}${error ? " error" : ""}`}
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
          />
        ))}
      </div>
      {error && <p style={{ textAlign: "center", color: G.red, fontSize: 13, marginTop: 10 }}>⚠ {error}</p>}
    </div>
  );
}

const EXAMS = [
  { id: "ssc", icon: "🏛️", label: "SSC", sub: "CGL, CHSL, MTS, CPO", color: G.gold },
  { id: "upsc", icon: "📜", label: "UPSC", sub: "CSE, CAPF, NDA", color: G.cyan },
  { id: "jee", icon: "⚛️", label: "JEE", sub: "Main & Advanced", color: G.purple },
  { id: "banking", icon: "🏦", label: "Banking", sub: "IBPS, SBI, RBI", color: G.green },
  { id: "rrb", icon: "🚂", label: "RRB", sub: "NTPC, Group D, ALP", color: "#FB923C" },
  { id: "state", icon: "🗺️", label: "State PSC", sub: "UPPSC, BPSC, etc.", color: "#F472B6" },
];

const EDU = ["10th Pass", "12th Pass", "Graduate (Pursuing)", "Graduate (Completed)", "Post Graduate"];
const YEARS = ["2025", "2026", "2027", "2028"];

/* ─── AUTH SCREENS ───────────────────────────────────────────── */

// SCREEN 1 — Login
function LoginScreen({ goRegister, goForgot, onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const e = {};
    if (!validate.email(email)) e.email = "Enter a valid email address";
    if (!pass) e.pass = "Password is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1800);
  };

  return (
    <div className="slide-right" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          Welcome Back 👋
        </h2>
        <p style={{ color: G.sub, fontSize: 14 }}>Login to continue your exam preparation</p>
      </div>

      {/* Social Login */}
      <div style={{ display: "flex", gap: 10 }}>
        {[["🔵", "Google"], ["⬛", "Apple"]].map(([ic, name]) => (
          <button key={name} className="btn-ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px" }}>
            <span style={{ fontSize: 16 }}>{ic}</span>
            <span>Continue with {name}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: G.border }} />
        <span style={{ color: G.muted, fontSize: 12 }}>OR LOGIN WITH EMAIL</span>
        <div style={{ flex: 1, height: 1, background: G.border }} />
      </div>

      <InputField label="Email Address" type="email" icon="✉️" placeholder="yourname@email.com"
        value={email} onChange={setEmail} error={errors.email}
        success={email && validate.email(email) && !errors.email} />

      <InputField label="Password" type="password" icon="🔒" placeholder="Enter your password"
        value={pass} onChange={setPass} error={errors.pass} />

      <div style={{ textAlign: "right", marginTop: -10 }}>
        <span onClick={goForgot} style={{ color: G.gold, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Forgot Password?</span>
      </div>

      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="spin" style={{ width: 18, height: 18, border: "2px solid #04080F", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} /> Logging in...</span> : "Login to ExamAce →"}
      </button>

      <p style={{ textAlign: "center", color: G.sub, fontSize: 14 }}>
        Don't have an account?{" "}
        <span onClick={goRegister} style={{ color: G.gold, fontWeight: 700, cursor: "pointer" }}>Register Free</span>
      </p>

      <div style={{ padding: "14px", background: G.goldFade, border: `1px solid ${G.goldDim}`, borderRadius: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <p style={{ fontSize: 12, color: G.sub, lineHeight: 1.6 }}>
          <strong style={{ color: G.gold }}>Demo:</strong> Use any email & password to explore the platform. No real account needed for this preview.
        </p>
      </div>
    </div>
  );
}

// SCREEN 2 — Register Step 1: Account Details
function RegisterStep1({ data, setData, onNext, goLogin }) {
  const [errors, setErrors] = useState({});

  const next = () => {
    const e = {};
    if (!validate.name(data.name)) e.name = "Enter your full name (min 2 characters)";
    if (!validate.email(data.email)) e.email = "Enter a valid email address";
    if (!validate.mobile(data.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!validate.password(data.pass)) e.pass = "Password must be at least 8 characters";
    if (data.pass !== data.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    if (!Object.keys(e).length) onNext();
  };

  return (
    <div className="slide-right" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Create Your Account</h2>
        <p style={{ color: G.sub, fontSize: 14 }}>Join 50,000+ students preparing on ExamAce</p>
      </div>

      <InputField label="Full Name" icon="👤" placeholder="Arjun Sharma"
        value={data.name} onChange={v => setData(d => ({ ...d, name: v }))}
        error={errors.name} success={data.name && validate.name(data.name) && !errors.name} />

      <InputField label="Email Address" type="email" icon="✉️" placeholder="arjun@email.com"
        value={data.email} onChange={v => setData(d => ({ ...d, email: v }))}
        error={errors.email} success={data.email && validate.email(data.email) && !errors.email} />

      <InputField label="Mobile Number" icon="📱" placeholder="9876543210"
        value={data.mobile} onChange={v => setData(d => ({ ...d, mobile: v.replace(/\D/g, "").slice(0, 10) }))}
        error={errors.mobile} success={data.mobile && validate.mobile(data.mobile) && !errors.mobile}
        hint="We'll send an OTP to verify your number" />

      <InputField label="Password" type="password" icon="🔒" placeholder="Min. 8 characters"
        value={data.pass} onChange={v => setData(d => ({ ...d, pass: v }))}
        error={errors.pass} />

      {/* Password strength */}
      {data.pass && (
        <div style={{ marginTop: -10 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {[
              data.pass.length >= 8,
              /[A-Z]/.test(data.pass),
              /[0-9]/.test(data.pass),
              /[^A-Za-z0-9]/.test(data.pass),
            ].map((ok, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: ok ? G.green : G.border2, transition: "background 0.3s" }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: G.muted }}>
            {data.pass.length < 8 ? "Too short" : /[A-Z]/.test(data.pass) && /[0-9]/.test(data.pass) && /[^A-Za-z0-9]/.test(data.pass) ? "💪 Strong password!" : "Add uppercase, numbers & symbols"}
          </span>
        </div>
      )}

      <InputField label="Confirm Password" type="password" icon="🔐" placeholder="Re-enter password"
        value={data.confirm} onChange={v => setData(d => ({ ...d, confirm: v }))}
        error={errors.confirm} success={data.confirm && data.confirm === data.pass && !errors.confirm} />

      <button className="btn-primary" onClick={next}>Continue to Verification →</button>

      <p style={{ textAlign: "center", color: G.sub, fontSize: 13 }}>
        Already have an account? <span onClick={goLogin} style={{ color: G.gold, fontWeight: 700, cursor: "pointer" }}>Login</span>
      </p>
    </div>
  );
}

// SCREEN 3 — OTP Verification
function RegisterStep2({ data, onNext, onBack }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(true);
  const [timer, resetTimer] = useTimer(30, sent);

  const verify = () => {
    if (otp.length < 6) { setError("Enter the complete 6-digit OTP"); return; }
    setError("");
    setLoading(true);
    // Simulate: any 6-digit code works
    setTimeout(() => { setLoading(false); onNext(); }, 1500);
  };

  const resend = () => {
    setOtp(""); setError(""); setSent(true); resetTimer();
  };

  return (
    <div className="slide-right" style={{ display: "flex", flexDirection: "column", gap: 24, textAlign: "center" }}>
      <div>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📲</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Verify Your Mobile</h2>
        <p style={{ color: G.sub, fontSize: 14, lineHeight: 1.7 }}>
          We've sent a 6-digit OTP to<br />
          <strong style={{ color: G.text }}>+91 {data.mobile}</strong>
          <span onClick={onBack} style={{ color: G.gold, marginLeft: 8, cursor: "pointer", fontSize: 12 }}>✏️ Edit</span>
        </p>
      </div>

      <OTPInput value={otp} onChange={setOtp} error={error} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn-primary" onClick={verify} disabled={loading || otp.length < 6}>
          {loading
            ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span className="spin" style={{ width: 18, height: 18, border: "2px solid #04080F", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
                Verifying OTP...
              </span>
            : "Verify & Continue →"}
        </button>

        <div style={{ color: G.sub, fontSize: 13 }}>
          {timer > 0
            ? <>Resend OTP in <span style={{ color: G.gold, fontFamily: "'Space Mono',monospace" }}>{timer}s</span></>
            : <span onClick={resend} style={{ color: G.gold, cursor: "pointer", fontWeight: 700 }}>Resend OTP 🔄</span>}
        </div>
      </div>

      <div style={{ padding: "12px 16px", background: G.goldFade, border: `1px solid ${G.goldDim}`, borderRadius: 10, textAlign: "left" }}>
        <p style={{ fontSize: 12, color: G.sub, lineHeight: 1.6 }}>
          💡 <strong style={{ color: G.gold }}>Demo tip:</strong> Enter any 6 digits to continue. No real SMS sent in preview mode.
        </p>
      </div>

      <button className="btn-ghost" onClick={onBack}>← Back</button>
    </div>
  );
}

// SCREEN 4 — Profile Setup
function RegisterStep3({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const next = () => {
    const e = {};
    if (!data.exams.length) e.exams = "Select at least one exam";
    if (!data.edu) e.edu = "Select your education level";
    if (!data.year) e.year = "Select your target year";
    setErrors(e);
    if (!Object.keys(e).length) onNext();
  };

  const toggleExam = (id) => {
    setData(d => ({
      ...d,
      exams: d.exams.includes(id) ? d.exams.filter(x => x !== id) : [...d.exams, id]
    }));
  };

  return (
    <div className="slide-right" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Your Exam Profile</h2>
        <p style={{ color: G.sub, fontSize: 14 }}>Help us personalise your experience</p>
      </div>

      {/* Exam Selection */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: G.sub, letterSpacing: 0.5, display: "block", marginBottom: 10 }}>
          Which exams are you preparing for? <span style={{ color: G.red }}>*</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {EXAMS.map(ex => (
            <div key={ex.id} className={`exam-option${data.exams.includes(ex.id) ? " selected" : ""}`}
              onClick={() => toggleExam(ex.id)}
              style={{ borderColor: data.exams.includes(ex.id) ? ex.color : undefined }}>
              <span style={{ fontSize: 20 }}>{ex.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: data.exams.includes(ex.id) ? ex.color : G.text }}>{ex.label}</div>
                <div style={{ fontSize: 11, color: G.muted }}>{ex.sub}</div>
              </div>
              {data.exams.includes(ex.id) && <span style={{ color: ex.color, fontSize: 16 }}>✓</span>}
            </div>
          ))}
        </div>
        {errors.exams && <p style={{ color: G.red, fontSize: 12, marginTop: 6 }}>⚠ {errors.exams}</p>}
      </div>

      {/* Education */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: G.sub, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
          Education Level <span style={{ color: G.red }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EDU.map(e => (
            <button key={e} onClick={() => setData(d => ({ ...d, edu: e }))} style={{
              padding: "8px 14px", borderRadius: 999,
              border: `1.5px solid ${data.edu === e ? G.gold : G.border2}`,
              background: data.edu === e ? G.goldFade : "transparent",
              color: data.edu === e ? G.gold : G.sub,
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}>{e}</button>
          ))}
        </div>
        {errors.edu && <p style={{ color: G.red, fontSize: 12, marginTop: 6 }}>⚠ {errors.edu}</p>}
      </div>

      {/* Target Year */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: G.sub, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
          Target Exam Year <span style={{ color: G.red }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          {YEARS.map(y => (
            <button key={y} onClick={() => setData(d => ({ ...d, year: y }))} style={{
              flex: 1, padding: "10px", borderRadius: 10,
              border: `1.5px solid ${data.year === y ? G.gold : G.border2}`,
              background: data.year === y ? G.goldFade : "transparent",
              color: data.year === y ? G.gold : G.sub,
              fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 14,
              cursor: "pointer", transition: "all 0.2s",
            }}>{y}</button>
          ))}
        </div>
        {errors.year && <p style={{ color: G.red, fontSize: 12, marginTop: 6 }}>⚠ {errors.year}</p>}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-ghost" style={{ width: "auto", padding: "14px 24px" }} onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={next}>Create My Account →</button>
      </div>
    </div>
  );
}

// SCREEN 5 — Success
function RegisterSuccess({ data, onDashboard }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: `linear-gradient(135deg, ${G.green}, #059669)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 42, boxShadow: `0 0 40px ${G.green}44`,
        animation: show ? "checkPop 0.5s ease forwards" : "none",
      }}>✓</div>

      <div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          You're All Set! 🎉
        </h2>
        <p style={{ color: G.sub, fontSize: 15, lineHeight: 1.7 }}>
          Welcome to ExamAce, <strong style={{ color: G.text }}>{data.name}</strong>!<br />
          Your free account is ready.
        </p>
      </div>

      <div style={{
        background: G.cardHi, border: `1px solid ${G.border2}`,
        borderRadius: 16, padding: "20px 24px", width: "100%", textAlign: "left",
      }}>
        <div style={{ fontSize: 12, color: G.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Your Profile Summary</div>
        {[
          ["👤 Name", data.name],
          ["✉️ Email", data.email],
          ["📱 Mobile", `+91 ${data.mobile}`],
          ["🎯 Exams", data.exams.map(id => EXAMS.find(e => e.id === id)?.label).join(", ")],
          ["🎓 Education", data.edu],
          ["📅 Target Year", data.year],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${G.border}`, fontSize: 13 }}>
            <span style={{ color: G.muted }}>{label}</span>
            <span style={{ color: G.text, fontWeight: 600, maxWidth: "55%", textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onDashboard} style={{ width: "100%" }}>
        🚀 Go to My Dashboard →
      </button>

      <p style={{ color: G.muted, fontSize: 12 }}>
        Check your email <strong style={{ color: G.sub }}>{data.email}</strong> for a welcome message
      </p>
    </div>
  );
}

// SCREEN 6 — Forgot Password
function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=newpass, 3=done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submitEmail = () => {
    if (!validate.email(email)) { setErrors({ email: "Enter a valid email address" }); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => { setLoading(false); setStep(1); }, 1200);
  };

  const submitOtp = () => {
    if (otp.length < 6) { setErrors({ otp: "Enter complete OTP" }); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1200);
  };

  const submitPass = () => {
    const e = {};
    if (!validate.password(pass)) e.pass = "Min 8 characters required";
    if (pass !== confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1200);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {step < 3 && (
        <button onClick={onBack} style={{ background: "none", border: "none", color: G.sub, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6, padding: 0, width: "fit-content" }}>← Back to Login</button>
      )}

      {step === 0 && (
        <>
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Reset Password</h2>
            <p style={{ color: G.sub, fontSize: 14 }}>Enter your registered email to receive a reset OTP</p>
          </div>
          <InputField label="Registered Email" type="email" icon="✉️" placeholder="yourname@email.com"
            value={email} onChange={setEmail} error={errors.email} />
          <button className="btn-primary" onClick={submitEmail} disabled={loading}>
            {loading ? "Sending OTP..." : "Send Reset OTP →"}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Check Your Email</h2>
            <p style={{ color: G.sub, fontSize: 14 }}>OTP sent to <strong style={{ color: G.text }}>{email}</strong></p>
          </div>
          <OTPInput value={otp} onChange={setOtp} error={errors.otp} />
          <button className="btn-primary" onClick={submitOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP →"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Set New Password</h2>
            <p style={{ color: G.sub, fontSize: 14 }}>Choose a strong password for your account</p>
          </div>
          <InputField label="New Password" type="password" icon="🔒" placeholder="Min. 8 characters"
            value={pass} onChange={setPass} error={errors.pass} />
          <InputField label="Confirm Password" type="password" icon="🔐" placeholder="Re-enter new password"
            value={confirm} onChange={setConfirm} error={errors.confirm} />
          <button className="btn-primary" onClick={submitPass} disabled={loading}>
            {loading ? "Updating..." : "Update Password →"}
          </button>
        </>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${G.green}, #059669)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 0 40px ${G.green}44`, animation: "checkPop 0.5s ease" }}>✓</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800 }}>Password Updated!</h2>
          <p style={{ color: G.sub }}>Your password has been successfully reset.</p>
          <button className="btn-primary" onClick={onBack}>Back to Login →</button>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN AUTH PAGE ─────────────────────────────────────────── */
export default function AuthPage() {
  const [screen, setScreen] = useState("login"); // login | register | forgot | success
  const [regStep, setRegStep] = useState(0);
  const [done, setDone] = useState(false);
  const [regData, setRegData] = useState({
    name: "", email: "", mobile: "", pass: "", confirm: "",
    exams: [], edu: "", year: "",
  });

  if (done) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#0A0E1A", border: `1px solid ${G.border2}`, borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 480, textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Dashboard Coming in Step 3!</h2>
            <p style={{ color: G.sub, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              The Auth System (Step 2) is complete ✅<br />
              Next we'll build your personalised <strong style={{ color: G.gold }}>Student Dashboard</strong>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["✅", "Landing Page", "Done"],["✅", "Auth System", "Done"],["⏳", "Dashboard", "Up Next"],["⏳", "Exam Interface", "Pending"],["⏳", "Analytics", "Pending"]].map(([ic, label, status]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: G.card, borderRadius: 10, border: `1px solid ${G.border}` }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}><span>{ic}</span><span style={{ color: G.text }}>{label}</span></span>
                  <span style={{ fontSize: 12, color: status === "Done" ? G.green : status === "Up Next" ? G.gold : G.muted, fontWeight: 600 }}>{status}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => { setDone(false); setScreen("login"); setRegStep(0); setRegData({ name:"",email:"",mobile:"",pass:"",confirm:"",exams:[],edu:"",year:"" }); }}>
              ← Try Auth Again
            </button>
          </div>
        </div>
      </>
    );
  }

  const isRegister = screen === "register";
  const totalSteps = 4;

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", background: G.bg,
        display: "flex", alignItems: "stretch",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* LEFT PANEL */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "60px 64px",
          background: `linear-gradient(160deg, #04080F 40%, #080D18)`,
          borderRight: `1px solid ${G.border}`,
          position: "relative", overflow: "hidden",
        }}
          className="grid-bg"
        >
          {/* Glow orb */}
          <div style={{ position: "absolute", bottom: -150, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${G.gold}0A, transparent 70%)`, pointerEvents: "none" }} />

          <div className="fade-up">
            <Logo />
            <h1 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 900,
              lineHeight: 1.1, marginTop: 40, marginBottom: 16,
            }}>
              Your Exam<br />
              <span className="shimmer-text">Success</span><br />
              Starts Here.
            </h1>
            <p style={{ color: G.sub, fontSize: 15, lineHeight: 1.8, maxWidth: 340, marginBottom: 48 }}>
              Free mock tests, real exam simulation, and AI-powered guidance for SSC, UPSC, JEE & Banking.
            </p>

            {/* Features list */}
            {[
              [G.gold, "🎯", "Real CBT exam environment"],
              [G.cyan, "🤖", "AI weakness detection & guidance"],
              [G.green, "📊", "Deep performance analytics"],
              [G.purple, "🏆", "All India ranking & leaderboard"],
            ].map(([color, icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                <span style={{ color: G.sub, fontSize: 14 }}>{text}</span>
              </div>
            ))}

            {/* Testimonial */}
            <div style={{ marginTop: 48, padding: "20px 24px", background: G.card, border: `1px solid ${G.border2}`, borderRadius: 16, borderLeft: `3px solid ${G.gold}` }}>
              <p style={{ color: G.sub, fontSize: 13, lineHeight: 1.7, fontStyle: "italic", marginBottom: 12 }}>
                "ExamAce's AI suggestions helped me improve my Quant accuracy from 60% to 88% in 3 months. Cracked SSC CGL in first attempt!"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${G.gold}, #C89030)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#04080F" }}>P</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>Priya Sharma</div>
                  <div style={{ fontSize: 11, color: G.gold }}>SSC CGL 2024 — Rank 247</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          width: 520, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "48px 48px",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: 420, margin: "0 auto", width: "100%" }}>

            {/* Register progress */}
            {isRegister && regStep < 3 && <ProgressBar step={regStep} total={totalSteps} />}

            {/* Login/Register Tab (only on first view) */}
            {(screen === "login" || (isRegister && regStep === 0)) && (
              <div style={{ display: "flex", background: "#080D18", borderRadius: 14, padding: 4, marginBottom: 28, border: `1px solid ${G.border}` }}>
                <button className="tab-btn" onClick={() => { setScreen("login"); setRegStep(0); }}
                  style={{ background: screen === "login" ? G.gold : "transparent", color: screen === "login" ? "#04080F" : G.muted }}>
                  Login
                </button>
                <button className="tab-btn" onClick={() => setScreen("register")}
                  style={{ background: isRegister ? G.gold : "transparent", color: isRegister ? "#04080F" : G.muted }}>
                  Register Free
                </button>
              </div>
            )}

            {/* Screens */}
            {screen === "login" && (
              <LoginScreen
                goRegister={() => setScreen("register")}
                goForgot={() => setScreen("forgot")}
                onSuccess={() => setDone(true)}
              />
            )}
            {isRegister && regStep === 0 && (
              <RegisterStep1 data={regData} setData={setRegData}
                onNext={() => setRegStep(1)} goLogin={() => setScreen("login")} />
            )}
            {isRegister && regStep === 1 && (
              <RegisterStep2 data={regData}
                onNext={() => setRegStep(2)} onBack={() => setRegStep(0)} />
            )}
            {isRegister && regStep === 2 && (
              <RegisterStep3 data={regData} setData={setRegData}
                onNext={() => setRegStep(3)} onBack={() => setRegStep(1)} />
            )}
            {isRegister && regStep === 3 && (
              <RegisterSuccess data={regData} onDashboard={() => setDone(true)} />
            )}
            {screen === "forgot" && (
              <ForgotPassword onBack={() => setScreen("login")} />
            )}

            {/* Terms */}
            {(screen === "login" || (isRegister && regStep === 0)) && (
              <p style={{ textAlign: "center", color: G.muted, fontSize: 11, marginTop: 20, lineHeight: 1.6 }}>
                By continuing, you agree to ExamAce's{" "}
                <span style={{ color: G.gold, cursor: "pointer" }}>Terms of Service</span> and{" "}
                <span style={{ color: G.gold, cursor: "pointer" }}>Privacy Policy</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
>>>>>>> aa02f77221d289549a15a02154e83d756879cfa7
