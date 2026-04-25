import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function LandingPage() {
  const go = (path) => { window.location.href = path }
  const [socialLinks, setSocialLinks] = useState([]);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{font-family:'Outfit',sans-serif;background:#030508;color:#EEF2FF;overflow-x:hidden;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#E8B84B55;border-radius:2px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
    @keyframes glow{0%,100%{box-shadow:0 0 30px #E8B84B33;}50%{box-shadow:0 0 60px #E8B84B66;}}
    @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
    .fade-up{animation:fadeUp 0.8s ease forwards;}
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:18px 48px;background:rgba(3,5,8,0.88);backdrop-filter:blur(12px);border-bottom:1px solid #0F1C2E;}
    .nav-logo{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:#E8B84B;letter-spacing:2px;cursor:pointer;}
    .nav-links{display:flex;gap:32px;}
    .nav-link{color:#7090B0;font-size:14px;font-weight:600;text-decoration:none;transition:color 0.2s;}
    .nav-link:hover{color:#EEF2FF;}
    .nav-btns{display:flex;gap:12px;}
    .btn-ghost-sm{padding:9px 22px;border:1.5px solid #162840;border-radius:10px;background:transparent;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;}
    .btn-ghost-sm:hover{border-color:#E8B84B;color:#E8B84B;}
    .btn-gold-sm{padding:9px 22px;border:none;border-radius:10px;background:linear-gradient(135deg,#E8B84B,#C89030);color:#030508;font-family:'Outfit',sans-serif;font-size:14px;font-weight:800;cursor:pointer;animation:glow 3s ease-in-out infinite;}
    .btn-gold-lg{padding:16px 36px;border:none;border-radius:14px;background:linear-gradient(135deg,#E8B84B,#C89030);color:#030508;font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;cursor:pointer;transition:all 0.2s;}
    .btn-gold-lg:hover{transform:translateY(-2px);}
    .btn-outline-lg{padding:15px 36px;border:2px solid #162840;border-radius:14px;background:transparent;color:#EEF2FF;font-family:'Outfit',sans-serif;font-size:17px;font-weight:700;cursor:pointer;transition:all 0.2s;}
    .btn-outline-lg:hover{border-color:#E8B84B;color:#E8B84B;}
    .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 20px 80px;position:relative;}
    .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#E8B84B0A 0%,transparent 60%);}
    .hero-title{font-size:clamp(36px,7vw,80px);font-weight:900;line-height:1.05;margin-bottom:24px;}
    .gold-text{background:linear-gradient(90deg,#E8B84B,#FCD34D,#E8B84B);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}
    .hero-sub{font-size:18px;color:#7090B0;max-width:600px;margin:0 auto 40px;line-height:1.7;}
    .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:60px;}
    .stats-row{display:flex;gap:48px;justify-content:center;flex-wrap:wrap;}
    .stat-num{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:#E8B84B;}
    .stat-label{font-size:13px;color:#7090B0;margin-top:4px;}
    .section{padding:100px 48px;}
    .section-title{font-size:clamp(28px,4vw,44px);font-weight:800;text-align:center;margin-bottom:16px;}
    .section-sub{font-size:16px;color:#7090B0;text-align:center;margin-bottom:60px;}
    .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1100px;margin:0 auto;}
    .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1100px;margin:0 auto;}
    .grid4s{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1100px;margin:0 auto;}
    .exam-card{background:#090E18;border:1px solid #0F1C2E;border-radius:20px;padding:28px;cursor:pointer;transition:all 0.25s;}
    .exam-card:hover{border-color:#E8B84B44;transform:translateY(-4px);}
    .feat-card{background:#090E18;border:1px solid #0F1C2E;border-radius:18px;padding:28px;transition:all 0.2s;}
    .feat-card:hover{border-color:#E8B84B33;transform:translateY(-3px);}
    .step-card{background:#090E18;border:1px solid #0F1C2E;border-radius:18px;padding:28px;text-align:center;}
    .step-num{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#E8B84B,#C89030);color:#030508;font-weight:900;font-size:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
    .review-card{background:#090E18;border:1px solid #0F1C2E;border-radius:18px;padding:28px;}
    .tag{display:inline-flex;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;}
    .cta-box{background:linear-gradient(135deg,#0C1420,#080E18);border:1px solid #E8B84B22;border-radius:28px;padding:80px 48px;text-align:center;max-width:900px;margin:0 auto;}
    .footer{padding:48px;border-top:1px solid #0F1C2E;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
    @media(max-width:900px){.grid4,.grid3,.grid4s{grid-template-columns:1fr 1fr;} .nav-links{display:none;} .section{padding:60px 20px;} .footer{flex-direction:column;text-align:center;}}
    @media(max-width:500px){.grid4,.grid3,.grid4s{grid-template-columns:1fr;} .stats-row{gap:24px;} .nav{padding:14px 20px;}}
  `

  const exams = [
    { icon:"📋", name:"SSC", color:"#E8B84B", desc:"CGL, CHSL, MTS, CPO — All SSC exams covered", tag:"Most Popular" },
    { icon:"🏛️", name:"UPSC", color:"#38BDF8", desc:"Civil Services Prelims & Mains preparation", tag:"IAS/IPS/IFS" },
    { icon:"⚗️", name:"JEE", color:"#A78BFA", desc:"JEE Main & Advanced engineering entrance", tag:"IIT/NIT" },
    { icon:"🏦", name:"Banking", color:"#34D399", desc:"IBPS PO, SBI PO, RBI — All banking exams", tag:"IBPS/SBI" },
  ]

  const features = [
    { icon:"💻", title:"Real CBT Interface", desc:"Exactly like the actual exam — same layout, same timer, same feel." },
    { icon:"📊", title:"Detailed Analytics", desc:"Know your weak topics, track your improvement over time." },
    { icon:"🤖", title:"AI-Powered Insights", desc:"Get personalised study recommendations based on your performance." },
    { icon:"🏆", title:"All India Rankings", desc:"See where you stand among lakhs of students across India." },
    { icon:"📚", title:"Huge Question Bank", desc:"10,000+ quality questions across all subjects and difficulty levels." },
    { icon:"💯", title:"100% Free Forever", desc:"No hidden charges. No credit card. Everything free for students." },
  ]

  const steps = [
    { num:"1", title:"Create Free Account", desc:"Register in 30 seconds with just your email." },
    { num:"2", title:"Choose Your Exam", desc:"Select from SSC, UPSC, JEE, Banking and more." },
    { num:"3", title:"Take Mock Tests", desc:"Attempt tests in a real exam-like environment." },
    { num:"4", title:"Analyse & Improve", desc:"Review solutions, track weak areas, improve score." },
  ]

  const reviews = [
    { name:"Priya Sharma", exam:"SSC CGL 2024", score:"89%", text:"Mockies mock tests are exactly like the real exam. Cleared SSC CGL in my first attempt!" },
    { name:"Rahul Verma", exam:"IBPS PO 2024", score:"92%", text:"The analytics showed me my weak areas. Improved my score by 25% in just 2 months!" },
    { name:"Ananya Singh", exam:"JEE Main 2024", score:"94%", text:"Best free platform for JEE. Question quality is excellent and interface matches real exam." },
  ]

  const faqs = [
    { q: "Is Mockies completely free?", a: "Yes. Mockies is free for students. Some future premium tools may be optional, but core mock tests remain free." },
    { q: "Are these tests like real exams?", a: "Yes. Interface, timer, navigation, and analytics are designed to match real CBT exam flow." },
    { q: "Can I use Mockies in Hindi?", a: "Yes. Hindi and Unicode-supported questions can be uploaded and displayed on platform." },
    { q: "How often are tests updated?", a: "Our team publishes and updates tests daily from the internal control panel." }
  ];

  useEffect(() => {
    const loadSocials = async () => {
      const { data } = await supabase
        .from("site_social_links")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setSocialLinks(data || []);
    };
    loadSocials();
  }, []);

  return (
    <>
      <style>{CSS}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => go("/")}>⚡ MOCKIES</div>
        <div className="nav-links">
          <a href="#exams" className="nav-link">Exams</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How It Works</a>
        </div>
        <div className="nav-btns">
          <button className="btn-ghost-sm" onClick={() => go("/login")}>Login</button>
          <button className="btn-gold-sm" onClick={() => go("/login")}>Start Free →</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#E8B84B14", border:"1px solid #E8B84B33", borderRadius:999, padding:"6px 18px", marginBottom:24, fontSize:13, fontWeight:700, color:"#E8B84B" }}>
            ⚡ India's #1 Free Mock Test Platform
          </div>
          <h1 className="hero-title fade-up">
            Crack Your Dream<br />
            <span className="gold-text">Exam in 2025</span>
          </h1>
          <p className="hero-sub">
            Practice with real exam-pattern mock tests for SSC, UPSC, JEE and Banking.
            Join 50,000+ students preparing smarter — completely free.
          </p>
          <div className="hero-btns">
            <button className="btn-gold-lg" onClick={() => go("/login")}>🚀 Start Practicing Free</button>
            <button className="btn-outline-lg" onClick={() => go("/login")}>Browse Mock Tests →</button>
          </div>
          <div className="stats-row">
            {[["50K+","Students"],["1200+","Mock Tests"],["10K+","Questions"],["98%","Success Rate"]].map(([n,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div className="stat-num">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="exams" className="section" style={{ background:"#030508" }}>
        <h2 className="section-title">Exams We <span className="gold-text">Cover</span></h2>
        <p className="section-sub">Comprehensive mock tests for all major competitive exams in India</p>
        <div className="grid4">
          {exams.map(e => (
            <div className="exam-card" key={e.name} onClick={() => go("/login")}>
              <div style={{ fontSize:40, marginBottom:16 }}>{e.icon}</div>
              <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>{e.name}</div>
              <div style={{ fontSize:13, color:"#7090B0", marginBottom:16, lineHeight:1.6 }}>{e.desc}</div>
              <span className="tag" style={{ background:e.color+"18", color:e.color, border:`1px solid ${e.color}33` }}>{e.tag}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section" style={{ background:"#06090F" }}>
        <h2 className="section-title">Why Choose <span className="gold-text">Mockies?</span></h2>
        <p className="section-sub">Everything you need to crack your exam — all in one free platform</p>
        <div className="grid3">
          {features.map(f => (
            <div className="feat-card" key={f.title}>
              <div style={{ fontSize:36, marginBottom:16 }}>{f.icon}</div>
              <div style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:14, color:"#7090B0", lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section" style={{ background:"#030508" }}>
        <h2 className="section-title">How It <span className="gold-text">Works</span></h2>
        <p className="section-sub">Get started in minutes — no complicated setup needed</p>
        <div className="grid4s">
          {steps.map(s => (
            <div className="step-card" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{s.title}</div>
              <div style={{ fontSize:13, color:"#7090B0", lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background:"#06090F" }}>
        <h2 className="section-title">Student <span className="gold-text">Success Stories</span></h2>
        <p className="section-sub">Real students, real results from Mockies</p>
        <div className="grid3">
          {reviews.map(r => (
            <div className="review-card" key={r.name}>
              <div style={{ fontSize:32, marginBottom:12, color:"#E8B84B" }}>❝</div>
              <div style={{ fontSize:14, color:"#7090B0", lineHeight:1.7, marginBottom:20 }}>{r.text}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{r.name}</div>
                  <div style={{ fontSize:12, color:"#7090B0" }}>{r.exam}</div>
                </div>
                <div style={{ background:"#E8B84B18", border:"1px solid #E8B84B33", borderRadius:999, padding:"4px 12px", fontSize:13, fontWeight:800, color:"#E8B84B" }}>{r.score}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background:"#030508" }}>
        <div className="cta-box">
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, marginBottom:16 }}>
            Ready to <span className="gold-text">Crack Your Exam?</span>
          </h2>
          <p style={{ fontSize:16, color:"#7090B0", marginBottom:36, maxWidth:500, margin:"0 auto 36px" }}>
            Join 50,000+ students already preparing smarter on Mockies. It's completely free — forever.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-gold-lg" onClick={() => go("/login")}>Create Free Account →</button>
            <button className="btn-outline-lg" onClick={() => go("/login")}>Take a Free Test</button>
          </div>
        </div>
      </section>

      <section className="section" style={{ background:"#06090F" }}>
        <h2 className="section-title">Frequently Asked <span className="gold-text">Questions</span></h2>
        <p className="section-sub">Everything students ask before starting.</p>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 12 }}>
          {faqs.map((item) => (
            <div key={item.q} className="feat-card">
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{item.q}</div>
              <div style={{ fontSize: 14, color: "#7090B0", lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, fontWeight:700, color:"#E8B84B" }}>⚡ MOCKIES</div>
        <div style={{ display:"flex", gap:24 }}>
          {[["Exams","#exams"],["Features","#features"],["Login","/login"],["Privacy","/privacy-policy"],["Terms","/terms-and-conditions"],["Disclaimer","/disclaimer"]].map(([l,h]) => (
            <a key={l} href={h} style={{ color:"#7090B0", fontSize:13, textDecoration:"none" }}>{l}</a>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          {socialLinks.map((item) => (
            <a key={item.id || item.platform} href={item.url} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, border:"1px solid #1C2E49", borderRadius:999, padding:"5px 10px", color:"#9CB3CF", textDecoration:"none", fontSize:12 }}>
              <span>{item.icon_text || "🔗"}</span>
              <span>{item.platform || "Social"}</span>
            </a>
          ))}
          <div style={{ color:"#7090B0", fontSize:13 }}>© 2026 Mockies. Free forever for students.</div>
        </div>
      </footer>
    </>
  )
}
