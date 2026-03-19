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
