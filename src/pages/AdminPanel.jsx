import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#020408;color:#EEF2FF;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#020408;} ::-webkit-scrollbar-thumb{background:#152236;border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes toastIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .fade-up{animation:fadeUp 0.4s ease forwards;}
  .fade-in{animation:fadeIn 0.3s ease forwards;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;transition:all 0.2s;color:#6A8CAC;font-size:13px;font-weight:600;border:1px solid transparent;}
  .nav-item:hover{background:#38BDF808;color:#38BDF8;border-color:#38BDF81A;}
  .nav-item.active{background:#38BDF814;color:#38BDF8;border-color:#38BDF833;font-weight:700;}
  .card{background:#080C18;border:1px solid #0E1A2C;border-radius:16px;padding:20px 22px;transition:border-color 0.2s;}
  .card:hover{border-color:#38BDF822;}
  .tbl-row{display:grid;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;border:1px solid #0E1A2C;background:#050810;transition:all 0.18s;font-size:13px;}
  .tbl-row:hover{border-color:#38BDF833;background:#080C18;}
  .btn{padding:8px 18px;border-radius:8px;border:none;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all 0.15s;display:inline-flex;align-items:center;gap:6px;}
  .btn:hover{transform:translateY(-1px);}
  .btn-primary{background:linear-gradient(135deg,#38BDF8,#0EA5E9);color:#020408;}
  .btn-success{background:linear-gradient(135deg,#34D399,#059669);color:#020408;}
  .btn-danger{background:#F8717122;color:#F87171;border:1px solid #F8717133;}
  .btn-ghost{background:transparent;color:#6A8CAC;border:1px solid #152236;}
  .btn-ghost:hover{border-color:#38BDF840;color:#38BDF8;}
  .btn-gold{background:linear-gradient(135deg,#E8B84B,#C89030);color:#020408;}
  .input,.select{width:100%;background:#020408;border:1.5px solid #0E1A2C;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
  .input:focus,.select:focus{border-color:#38BDF888;}
  .input::placeholder{color:#253A52;}
  .select option{background:#050810;}
  .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
  .modal-overlay{position:fixed;inset:0;background:rgba(2,4,8,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}
  .modal{background:#080C18;border:1px solid #152236;border-radius:20px;padding:32px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;animation:fadeUp 0.3s ease;}
  .toast{position:fixed;bottom:28px;right:28px;z-index:500;background:#080C18;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .spinner{display:inline-block;width:20px;height:20px;border:2px solid #152236;border-top-color:#38BDF8;border-radius:50%;animation:spin 0.8s linear infinite;}
  .create-test-form{display:flex;flex-direction:column;gap:16px;}
`;

const SUBJECTS = {
  SSC:["Quantitative Aptitude","Reasoning","English","General Awareness"],
  UPSC:["History","Geography","Polity","Economics","General Science","Current Affairs"],
  JEE:["Physics","Chemistry","Mathematics"],
  Banking:["Quantitative Aptitude","Reasoning","English","General Awareness","Computer Knowledge"],
  RRB:["Quantitative Aptitude","Reasoning","General Science","General Awareness"],
};
const EXAMS = Object.keys(SUBJECTS);

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const color = type === "success" ? "#34D399" : type === "error" ? "#F87171" : "#38BDF8";
  return (
    <div className="toast" style={{ border:`1.5px solid ${color}44` }}>
      <span style={{ fontSize:20 }}>{type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span>
      <span style={{ fontSize:14, fontWeight:600 }}>{message}</span>
    </div>
  );
}
function Tag({ children, color }) {
  return <span className="tag" style={{ background:color+"1A", color, border:`1px solid ${color}30` }}>{children}</span>;
}
function Mono({ children, color="#38BDF8", size=13 }) {
  return <span style={{ fontFamily:"'Fira Code',monospace", fontSize:size, color, fontWeight:500 }}>{children}</span>;
}
function Spinner() {
  return <div style={{ textAlign:"center", padding:60 }}><div className="spinner" style={{ width:36, height:36, margin:"0 auto 16px" }} /><div style={{ color:"#6A8CAC", fontSize:14 }}>Loading...</div></div>;
}
const L = { fontSize:12, fontWeight:700, color:"#6A8CAC", display:"block", marginBottom:7, letterSpacing:0.5 };

// ── QUESTION MODAL ────────────────────────────────────────────────────────────
function QuestionModal({ question, onClose, onSaved }) {
  const editing = !!question;
  const [form, setForm] = useState(question || {
    exam:"SSC", subject:"Quantitative Aptitude", topic:"",
    difficulty:"Medium", question_text:"",
    options:["","","",""], correct_answer:0, explanation:"", status:"active"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const updOpt = (i,v) => setForm(f=>({...f,options:f.options.map((o,j)=>j===i?v:o)}));

  const handleSave = async () => {
    if (!form.topic.trim()) { setError("Please enter a topic"); return; }
    if (!form.question_text.trim()) { setError("Please enter the question"); return; }
    if (form.options.some(o=>!o.trim())) { setError("Please fill all 4 options"); return; }
    if (!form.explanation.trim()) { setError("Please enter an explanation"); return; }
    setLoading(true); setError("");
    const payload = {
      exam:form.exam, subject:form.subject, topic:form.topic,
      difficulty:form.difficulty, question_text:form.question_text,
      options:form.options, correct_answer:form.correct_answer,
      explanation:form.explanation, status:form.status
    };
    const result = editing
      ? await supabase.from("questions").update(payload).eq("id",question.id)
      : await supabase.from("questions").insert(payload);
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    onSaved(editing ? "Question updated!" : "Question added!");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ fontWeight:800, fontSize:20 }}>{editing?"✏️ Edit":"➕ Add"} Question</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#6A8CAC", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        {error && <div style={{ background:"#F8717122", border:"1px solid #F8717144", borderRadius:10, padding:"10px 14px", color:"#F87171", fontSize:13, marginBottom:16 }}>{error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div>
            <label style={L}>EXAM *</label>
            <select className="select" value={form.exam} onChange={e=>{upd("exam",e.target.value);upd("subject",SUBJECTS[e.target.value][0]);}}>
              {EXAMS.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>SUBJECT *</label>
            <select className="select" value={form.subject} onChange={e=>upd("subject",e.target.value)}>
              {SUBJECTS[form.exam].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div>
            <label style={L}>TOPIC *</label>
            <input className="input" placeholder="e.g. Algebra, Syllogism..." value={form.topic} onChange={e=>upd("topic",e.target.value)} />
          </div>
          <div>
            <label style={L}>DIFFICULTY *</label>
            <select className="select" value={form.difficulty} onChange={e=>upd("difficulty",e.target.value)}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={L}>QUESTION TEXT *</label>
          <textarea className="input" rows={3} placeholder="Enter the full question here..." value={form.question_text} onChange={e=>upd("question_text",e.target.value)} style={{ resize:"vertical" }} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={L}>OPTIONS * <span style={{ color:"#6A8CAC", fontWeight:400 }}>(click circle = correct answer)</span></label>
          {form.options.map((opt,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div onClick={()=>upd("correct_answer",i)} style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${form.correct_answer===i?"#34D399":"#152236"}`, background:form.correct_answer===i?"#34D399":"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                {form.correct_answer===i && <span style={{ fontSize:11, color:"#020408", fontWeight:900 }}>✓</span>}
              </div>
              <div style={{ background:"#38BDF814", border:"1px solid #38BDF833", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, color:"#38BDF8", flexShrink:0, width:28, textAlign:"center" }}>{["A","B","C","D"][i]}</div>
              <input className="input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt} onChange={e=>updOpt(i,e.target.value)} style={{ borderColor:form.correct_answer===i?"#34D39966":undefined }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={L}>EXPLANATION *</label>
          <textarea className="input" rows={2} placeholder="Why is this the correct answer?" value={form.explanation} onChange={e=>upd("explanation",e.target.value)} style={{ resize:"vertical" }} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={L}>STATUS</label>
          <div style={{ display:"flex", gap:8 }}>
            {["active","draft","inactive"].map(s=>(
              <button key={s} onClick={()=>upd("status",s)} style={{ padding:"7px 18px", borderRadius:8, border:`1.5px solid ${form.status===s?"#38BDF8":"#152236"}`, background:form.status===s?"#38BDF814":"transparent", color:form.status===s?"#38BDF8":"#6A8CAC", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", textTransform:"capitalize" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:"1px solid #0E1A2C" }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-success" style={{ flex:2 }} onClick={handleSave} disabled={loading}>
            {loading?<><span className="spinner"/>&nbsp;Saving...</>:`✅ ${editing?"Update":"Save"} Question`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CREATE TEST MODAL ─────────────────────────────────────────────────────────
function CreateTestModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name:"", exam:"SSC", type:"Full Length", time_limit:60 });
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const loadQuestions = async (exam) => {
    setFetching(true);
    const { data } = await supabase.from("questions").select("id,question_text,subject,topic,difficulty").eq("exam",exam).eq("status","active");
    setQuestions(data||[]);
    setSelected([]);
    setFetching(false);
  };

  useEffect(() => { loadQuestions(form.exam); }, [form.exam]);

  const toggleQ = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const handleCreate = async () => {
    if (!form.name.trim()) { setError("Please enter a test name"); return; }
    if (selected.length < 1) { setError("Please select at least 1 question"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.from("tests").insert({
      name: form.name,
      exam: form.exam,
      type: form.type,
      time_limit: form.time_limit,
      question_ids: selected,
      status: "published"
    });
    if (error) { setError(error.message); setLoading(false); return; }
    onSaved("Test created and published!");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:700 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ fontWeight:800, fontSize:20 }}>📋 Create New Test</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#6A8CAC", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        {error && <div style={{ background:"#F8717122", border:"1px solid #F8717144", borderRadius:10, padding:"10px 14px", color:"#F87171", fontSize:13, marginBottom:16 }}>{error}</div>}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={L}>TEST NAME *</label>
            <input className="input" placeholder="e.g. SSC CGL Full Mock Test #2" value={form.name} onChange={e=>upd("name",e.target.value)} />
          </div>
          <div>
            <label style={L}>EXAM</label>
            <select className="select" value={form.exam} onChange={e=>upd("exam",e.target.value)}>
              {EXAMS.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>TEST TYPE</label>
            <select className="select" value={form.type} onChange={e=>upd("type",e.target.value)}>
              {["Full Length","Sectional","Topic-wise","PYQ"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>TIME LIMIT (minutes)</label>
            <input className="input" type="number" min={5} max={180} value={form.time_limit} onChange={e=>upd("time_limit",+e.target.value)} />
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <div style={{ padding:"11px 14px", background:"#38BDF814", border:"1px solid #38BDF833", borderRadius:10, color:"#38BDF8", fontWeight:700, fontSize:14, width:"100%", textAlign:"center" }}>
              {selected.length} questions selected
            </div>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={L}>SELECT QUESTIONS (click to add/remove)</label>
          {fetching ? <Spinner /> : (
            <div style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
              {questions.length === 0 ? (
                <div style={{ textAlign:"center", padding:30, color:"#6A8CAC", fontSize:13 }}>No active questions for {form.exam}. Add questions first!</div>
              ) : questions.map(q=>(
                <div key={q.id} onClick={()=>toggleQ(q.id)} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${selected.includes(q.id)?"#38BDF8":"#0E1A2C"}`, background:selected.includes(q.id)?"#38BDF814":"#050810", cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:13, fontWeight:selected.includes(q.id)?700:400, flex:1, paddingRight:10 }}>
                      {q.question_text?.slice(0,70)}...
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <Tag color="#6A8CAC">{q.topic}</Tag>
                      <Tag color={q.difficulty==="Easy"?"#34D399":q.difficulty==="Hard"?"#F87171":"#E8B84B"}>{q.difficulty}</Tag>
                      {selected.includes(q.id) && <span style={{ color:"#38BDF8", fontWeight:700 }}>✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:"1px solid #0E1A2C" }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" style={{ flex:2 }} onClick={handleCreate} disabled={loading}>
            {loading?<><span className="spinner"/>&nbsp;Creating...</>:`🚀 Create & Publish Test (${selected.length} Qs)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const [stats, setStats] = useState({ questions:0, users:0, tests:0, attempts:0 });
  useEffect(() => {
    Promise.all([
      supabase.from("questions").select("id",{count:"exact",head:true}),
      supabase.from("profiles").select("id",{count:"exact",head:true}),
      supabase.from("tests").select("id",{count:"exact",head:true}),
      supabase.from("test_attempts").select("id",{count:"exact",head:true}),
    ]).then(([q,u,t,a]) => setStats({ questions:q.count||0, users:u.count||0, tests:t.count||0, attempts:a.count||0 }));
  }, []);
  return (
    <div style={{ padding:28, maxWidth:1100 }}>
      <h2 style={{ fontWeight:800, fontSize:24, marginBottom:6 }}>Admin Dashboard</h2>
      <p style={{ color:"#6A8CAC", fontSize:13, marginBottom:28 }}>Live platform overview</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:32 }}>
        {[["❓","Questions",stats.questions,"#E8B84B"],["👥","Users",stats.users,"#38BDF8"],["📋","Tests",stats.tests,"#A78BFA"],["📝","Attempts",stats.attempts,"#34D399"]].map(([icon,label,val,color])=>(
          <div key={label} className="card fade-up">
            <div style={{ fontSize:30, marginBottom:12 }}>{icon}</div>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:36, fontWeight:700, color, lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:12, color:"#6A8CAC", marginTop:8 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[
          {icon:"❓",title:"Question Bank",sub:"Add and manage MCQ questions",btn:"Manage Questions →",color:"#E8B84B",page:"questions"},
          {icon:"📋",title:"Create Test",sub:"Build and publish mock tests for students",btn:"Create Test →",color:"#38BDF8",page:"tests"},
          {icon:"👥",title:"View Users",sub:"See all registered students",btn:"View Users →",color:"#34D399",page:"users"},
          {icon:"📊",title:"Test Attempts",sub:"See how students are performing",btn:"View Attempts →",color:"#A78BFA",page:"attempts"},
        ].map((item,i)=>(
          <div key={i} className="card" style={{ cursor:"pointer" }} onClick={()=>setPage(item.page)}>
            <div style={{ fontSize:32, marginBottom:10 }}>{item.icon}</div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>{item.title}</div>
            <div style={{ fontSize:13, color:"#6A8CAC", marginBottom:14 }}>{item.sub}</div>
            <span style={{ background:item.color+"18", color:item.color, border:`1px solid ${item.color}33`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:700 }}>{item.btn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QUESTIONS PAGE ────────────────────────────────────────────────────────────
function QuestionsPage() {
  const [questions,setQuestions] = useState([]);
  const [loading,setLoading]     = useState(true);
  const [filterExam,setFilter]   = useState("All");
  const [search,setSearch]       = useState("");
  const [modal,setModal]         = useState(false);
  const [editQ,setEditQ]         = useState(null);
  const [toast,setToast]         = useState(null);

  const fetch = async () => {
    setLoading(true);
    const {data} = await supabase.from("questions").select("*").order("id",{ascending:false});
    setQuestions(data||[]);
    setLoading(false);
  };
  useEffect(()=>{fetch();},[]);

  const deleteQ = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await supabase.from("questions").delete().eq("id",id);
    setToast({msg:"Question deleted",type:"success"});
    fetch();
  };
  const toggleStatus = async (q) => {
    const s = q.status==="active"?"inactive":"active";
    await supabase.from("questions").update({status:s}).eq("id",q.id);
    setToast({msg:`Question ${s}`,type:"success"});
    fetch();
  };

  const filtered = questions
    .filter(q=>filterExam==="All"||q.exam===filterExam)
    .filter(q=>q.question_text?.toLowerCase().includes(search.toLowerCase())||q.topic?.toLowerCase().includes(search.toLowerCase()));

  const ec={SSC:"#E8B84B",UPSC:"#38BDF8",JEE:"#A78BFA",Banking:"#34D399",RRB:"#FB923C"};
  const dc={Easy:"#34D399",Medium:"#E8B84B",Hard:"#F87171"};

  return (
    <div style={{ padding:28, maxWidth:1200 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      {(modal||editQ) && <QuestionModal question={editQ} onClose={()=>{setModal(false);setEditQ(null);}} onSaved={(msg)=>{setToast({msg,type:"success"});fetch();}} />}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:24 }}>Question Bank</h2>
          <p style={{ color:"#6A8CAC", fontSize:13, marginTop:3 }}>{questions.length} questions total</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{setEditQ(null);setModal(true);}}>+ Add Question</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:22 }}>
        {EXAMS.map(e=>(
          <div key={e} className="card" style={{ cursor:"pointer", borderColor:filterExam===e?ec[e]+"55":undefined }} onClick={()=>setFilter(filterExam===e?"All":e)}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:24, fontWeight:700, color:ec[e] }}>{questions.filter(q=>q.exam===e).length}</div>
            <div style={{ fontSize:12, color:"#6A8CAC", marginTop:4 }}>{e}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"#080C18", border:"1px solid #152236", borderRadius:10, padding:"8px 14px", flex:1, maxWidth:300 }}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions or topics..." style={{ background:"transparent", border:"none", outline:"none", color:"#EEF2FF", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, width:"100%" }} />
        </div>
        {["All",...EXAMS].map(e=>(
          <button key={e} onClick={()=>setFilter(e)} style={{ padding:"7px 16px", borderRadius:999, border:`1px solid ${filterExam===e?"#38BDF8":"#152236"}`, background:filterExam===e?"#38BDF814":"transparent", color:filterExam===e?"#38BDF8":"#6A8CAC", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>{e}</button>
        ))}
      </div>
      {loading ? <Spinner /> : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>❓</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF", marginBottom:8 }}>No questions yet</div>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>setModal(true)}>+ Add First Question</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 70px 100px 80px 70px 70px 120px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>#</span><span>QUESTION</span><span>EXAM</span><span>SUBJECT</span><span>TOPIC</span><span>DIFF</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {filtered.map((q,i)=>(
            <div key={q.id} className="tbl-row" style={{ gridTemplateColumns:"40px 1fr 70px 100px 80px 70px 70px 120px" }}>
              <Mono size={12} color="#253A52">{String(i+1).padStart(2,"0")}</Mono>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{q.question_text?.slice(0,75)}...</div>
                <div style={{ fontSize:11, color:"#6A8CAC", marginTop:2 }}>{q.subject}</div>
              </div>
              <Tag color={ec[q.exam]||"#38BDF8"}>{q.exam}</Tag>
              <div style={{ fontSize:12, color:"#6A8CAC" }}>{q.subject?.split(" ").slice(0,2).join(" ")}</div>
              <Tag color="#6A8CAC">{q.topic}</Tag>
              <Tag color={dc[q.difficulty]||"#E8B84B"}>{q.difficulty}</Tag>
              <Tag color={q.status==="active"?"#34D399":q.status==="draft"?"#FCD34D":"#6A8CAC"}>{q.status}</Tag>
              <div style={{ display:"flex", gap:5 }}>
                <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>{setEditQ(q);setModal(true);}}>✏️</button>
                <button className="btn" style={{ padding:"5px 10px", fontSize:11, background:q.status==="active"?"#FB923C22":"#34D39922", color:q.status==="active"?"#FB923C":"#34D399", border:`1px solid ${q.status==="active"?"#FB923C33":"#34D39933"}` }} onClick={()=>toggleStatus(q)}>
                  {q.status==="active"?"⏸":"▶"}
                </button>
                <button className="btn btn-danger" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>deleteQ(q.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TESTS PAGE ────────────────────────────────────────────────────────────────
function TestsPage() {
  const [tests,setTests]     = useState([]);
  const [loading,setLoading] = useState(true);
  const [modal,setModal]     = useState(false);
  const [toast,setToast]     = useState(null);

  const fetch = async () => {
    setLoading(true);
    const {data} = await supabase.from("tests").select("*").order("id",{ascending:false});
    setTests(data||[]);
    setLoading(false);
  };
  useEffect(()=>{fetch();},[]);

  const deleteTest = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    await supabase.from("tests").delete().eq("id",id);
    setToast({msg:"Test deleted",type:"success"});
    fetch();
  };
  const toggleTest = async (t) => {
    const s = t.status==="published"?"inactive":"published";
    await supabase.from("tests").update({status:s}).eq("id",t.id);
    setToast({msg:`Test ${s}`,type:"success"});
    fetch();
  };

  return (
    <div style={{ padding:28, maxWidth:1100 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      {modal && <CreateTestModal onClose={()=>setModal(false)} onSaved={(msg)=>{setToast({msg,type:"success"});fetch();}} />}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:24 }}>Mock Tests</h2>
          <p style={{ color:"#6A8CAC", fontSize:13, marginTop:3 }}>{tests.filter(t=>t.status==="published").length} published · {tests.filter(t=>t.status!=="published").length} inactive</p>
        </div>
        <button className="btn btn-gold" onClick={()=>setModal(true)}>+ Create Test</button>
      </div>
      {loading ? <Spinner /> : tests.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF", marginBottom:8 }}>No tests yet</div>
          <button className="btn btn-gold" style={{ marginTop:16 }} onClick={()=>setModal(true)}>+ Create First Test</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 90px 60px 80px 80px 120px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>TEST NAME</span><span>EXAM</span><span>TYPE</span><span>QS</span><span>TIME</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {tests.map(t=>{
            const qCount = Array.isArray(t.question_ids) ? t.question_ids.length : (JSON.parse(t.question_ids||"[]")).length;
            return (
              <div key={t.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 80px 90px 60px 80px 80px 120px" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                  <div style={{ fontSize:11, color:"#6A8CAC" }}>Created {new Date(t.created_at).toLocaleDateString("en-IN")}</div>
                </div>
                <Tag color="#E8B84B">{t.exam}</Tag>
                <Tag color="#38BDF8">{t.type}</Tag>
                <Mono size={13} color="#EEF2FF">{qCount}</Mono>
                <Mono size={12} color="#6A8CAC">{t.time_limit}m</Mono>
                <Tag color={t.status==="published"?"#34D399":"#6A8CAC"}>{t.status}</Tag>
                <div style={{ display:"flex", gap:5 }}>
                  <button className="btn" style={{ padding:"5px 10px", fontSize:11, background:t.status==="published"?"#FB923C22":"#34D39922", color:t.status==="published"?"#FB923C":"#34D399", border:`1px solid ${t.status==="published"?"#FB923C33":"#34D39933"}` }} onClick={()=>toggleTest(t)}>
                    {t.status==="published"?"⏸ Hide":"▶ Show"}
                  </button>
                  <button className="btn btn-danger" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>deleteTest(t.id)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── USERS PAGE ────────────────────────────────────────────────────────────────
function UsersPage() {
  const [users,setUsers]     = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch]   = useState("");

  useEffect(()=>{
    supabase.from("profiles").select("*").order("created_at",{ascending:false})
      .then(({data})=>{setUsers(data||[]);setLoading(false);});
  },[]);

  const filtered = users.filter(u=>
    u.full_name?.toLowerCase().includes(search.toLowerCase())||
    u.exam_preparing?.toLowerCase().includes(search.toLowerCase())||
    u.mobile?.includes(search)
  );

  const ec={SSC:"#E8B84B",Banking:"#34D399",UPSC:"#38BDF8",JEE:"#A78BFA"};

  return (
    <div style={{ padding:28, maxWidth:1100 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:24 }}>Registered Users</h2>
          <p style={{ color:"#6A8CAC", fontSize:13, marginTop:3 }}>{users.length} students registered</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[["👥","Total",users.length,"#38BDF8"],["📚","SSC",users.filter(u=>u.exam_preparing?.includes("SSC")).length,"#E8B84B"],["🏦","Banking",users.filter(u=>u.exam_preparing?.includes("Banking")||u.exam_preparing?.includes("IBPS")||u.exam_preparing?.includes("SBI")).length,"#34D399"],["🎓","UPSC/JEE",users.filter(u=>u.exam_preparing?.includes("UPSC")||u.exam_preparing?.includes("JEE")).length,"#A78BFA"]].map(([icon,l,v,c])=>(
          <div key={l} className="card">
            <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:28, fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:12, color:"#6A8CAC", marginTop:5 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#080C18", border:"1px solid #152236", borderRadius:10, padding:"8px 14px", maxWidth:340, marginBottom:16 }}>
        <span>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, exam or mobile..." style={{ background:"transparent", border:"none", outline:"none", color:"#EEF2FF", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, width:"100%" }} />
      </div>
      {loading ? <Spinner /> : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF" }}>No users yet</div>
          <div style={{ fontSize:14, marginTop:8 }}>Users appear here after registering</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 130px 120px 140px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>USER</span><span>EXAM</span><span>MOBILE</span><span>JOINED</span>
          </div>
          {filtered.map(u=>(
            <div key={u.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 130px 120px 140px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#38BDF8,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#020408", flexShrink:0 }}>
                  {(u.full_name||"U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{u.full_name||"Unknown"}</div>
                  <div style={{ fontSize:11, color:"#6A8CAC" }}>ID: {u.id?.slice(0,12)}...</div>
                </div>
              </div>
              <Tag color={Object.entries(ec).find(([k])=>u.exam_preparing?.includes(k))?.[1]||"#38BDF8"}>{u.exam_preparing||"Not set"}</Tag>
              <Mono size={12} color="#6A8CAC">{u.mobile||"—"}</Mono>
              <div style={{ fontSize:12, color:"#6A8CAC" }}>{u.created_at?new Date(u.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ATTEMPTS PAGE ─────────────────────────────────────────────────────────────
function AttemptsPage() {
  const [attempts,setAttempts] = useState([]);
  const [loading,setLoading]   = useState(true);

  useEffect(()=>{
    supabase.from("test_attempts").select("*,profiles(full_name),tests(name,exam)").order("completed_at",{ascending:false})
      .then(({data})=>{setAttempts(data||[]);setLoading(false);});
  },[]);

  return (
    <div style={{ padding:28, maxWidth:1100 }}>
      <h2 style={{ fontWeight:800, fontSize:24, marginBottom:6 }}>Test Attempts</h2>
      <p style={{ color:"#6A8CAC", fontSize:13, marginBottom:24 }}>{attempts.length} total attempts across all tests</p>
      {loading ? <Spinner /> : attempts.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF" }}>No attempts yet</div>
          <div style={{ fontSize:14, marginTop:8 }}>Student attempts will appear here</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px 80px 80px 120px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>STUDENT</span><span>TEST</span><span>SCORE</span><span>ACCURACY</span><span>TIME</span><span>DATE</span>
          </div>
          {attempts.map(a=>(
            <div key={a.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 1fr 80px 80px 80px 120px" }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{a.profiles?.full_name||"Unknown Student"}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{a.tests?.name||"Unknown Test"}</div>
                <Tag color="#E8B84B">{a.tests?.exam||"—"}</Tag>
              </div>
              <Mono size={14} color="#EEF2FF">{a.score}</Mono>
              <Tag color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"}>{a.accuracy}%</Tag>
              <Mono size={12} color="#6A8CAC">{a.time_taken?Math.floor(a.time_taken/60)+"m":"—"}</Mono>
              <div style={{ fontSize:12, color:"#6A8CAC" }}>{new Date(a.completed_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [page,setPage] = useState("dashboard");
  const nav = [
    {id:"dashboard",icon:"⊞", label:"Dashboard"},
    {id:"questions",icon:"❓", label:"Questions"},
    {id:"tests",    icon:"📋", label:"Tests"},
    {id:"users",    icon:"👥", label:"Users"},
    {id:"attempts", icon:"📊", label:"Attempts"},
  ];
  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:"#020408" }}>
        <aside style={{ width:220, background:"#050810", borderRight:"1px solid #0E1A2C", display:"flex", flexDirection:"column", padding:"20px 12px", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
          <div style={{ padding:"4px 6px 22px" }}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:14, fontWeight:600, color:"#38BDF8", letterSpacing:2.5 }}>EXAMACE</div>
            <div style={{ fontSize:9, color:"#253A52", letterSpacing:2, marginTop:2 }}>ADMIN PANEL</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#34D39912", border:"1px solid #34D39930", borderRadius:9, padding:"8px 12px", marginBottom:18 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#34D399", animation:"pulse 2s infinite", flexShrink:0 }} />
            <span style={{ fontSize:11, color:"#34D399", fontWeight:700 }}>PLATFORM LIVE</span>
          </div>
          <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
            {nav.map(n=>(
              <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
                <span style={{ fontSize:16, width:22, textAlign:"center" }}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div style={{ borderTop:"1px solid #0E1A2C", paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
            <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", fontSize:12 }} onClick={()=>window.location.href="/"}>🏠 View Site</button>
            <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", fontSize:12 }} onClick={()=>window.location.href="/ai-generator"}>🤖 AI Generator</button>
          </div>
        </aside>
        <div style={{ flex:1, overflowY:"auto" }} key={page} className="fade-in">
          {page==="dashboard" && <DashboardPage setPage={setPage} />}
          {page==="questions" && <QuestionsPage />}
          {page==="tests"     && <TestsPage />}
          {page==="users"     && <UsersPage />}
          {page==="attempts"  && <AttemptsPage />}
        </div>
      </div>
    </>
  );
}