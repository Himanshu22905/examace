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
  .input,.select{width:100%;background:#020408;border:1.5px solid #0E1A2C;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
  .input:focus,.select:focus{border-color:#38BDF888;box-shadow:0 0 0 3px #38BDF810;}
  .input::placeholder{color:#253A52;}
  .select option{background:#050810;}
  .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.4px;}
  .modal-overlay{position:fixed;inset:0;background:rgba(2,4,8,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}
  .modal{background:#080C18;border:1px solid #152236;border-radius:20px;padding:32px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;animation:fadeUp 0.3s ease;}
  .toast{position:fixed;bottom:28px;right:28px;z-index:500;background:#080C18;border:1.5px solid #34D39944;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .spinner{display:inline-block;width:20px;height:20px;border:2px solid #152236;border-top-color:#38BDF8;border-radius:50%;animation:spin 0.8s linear infinite;}
`;

const SUBJECTS = {
  SSC:     ["Quantitative Aptitude","Reasoning","English","General Awareness"],
  UPSC:    ["History","Geography","Polity","Economics","General Science","Current Affairs"],
  JEE:     ["Physics","Chemistry","Mathematics"],
  Banking: ["Quantitative Aptitude","Reasoning","English","General Awareness","Computer Knowledge"],
  RRB:     ["Quantitative Aptitude","Reasoning","General Science","General Awareness"],
};
const EXAMS = Object.keys(SUBJECTS);

function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const color = type === "success" ? "#34D399" : type === "error" ? "#F87171" : "#38BDF8";
  const icon  = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  return (
    <div className="toast" style={{ borderColor: color + "44" }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{message}</span>
    </div>
  );
}

function Tag({ children, color }) {
  return <span className="tag" style={{ background: color + "1A", color, border: `1px solid ${color}30` }}>{children}</span>;
}

function Mono({ children, color = "#38BDF8", size = 13 }) {
  return <span style={{ fontFamily: "'Fira Code',monospace", fontSize: size, color, fontWeight: 500 }}>{children}</span>;
}

// ── ADD / EDIT QUESTION MODAL ─────────────────────────────────────────────────
function QuestionModal({ question, onClose, onSaved }) {
  const editing = !!question;
  const [form, setForm] = useState(question || {
    exam: "SSC", subject: "Quantitative Aptitude", topic: "",
    difficulty: "Medium", question_text: "",
    options: ["", "", "", ""], correct_answer: 0,
    explanation: "", status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const upd    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updOpt = (i, v) => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? v : o) }));

  const validate = () => {
    if (!form.topic.trim())         return "Please enter a topic";
    if (!form.question_text.trim()) return "Please enter the question";
    if (form.options.some(o => !o.trim())) return "Please fill all 4 options";
    if (!form.explanation.trim())   return "Please enter an explanation";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    const payload = {
      exam: form.exam, subject: form.subject, topic: form.topic,
      difficulty: form.difficulty, question_text: form.question_text,
      options: form.options, correct_answer: form.correct_answer,
      explanation: form.explanation, status: form.status
    };
    let result;
    if (editing) {
      result = await supabase.from("questions").update(payload).eq("id", question.id);
    } else {
      result = await supabase.from("questions").insert(payload);
    }
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    onSaved(editing ? "Question updated!" : "Question added successfully!");
    onClose();
    setLoading(false);
  };

  const L = { fontSize: 12, fontWeight: 700, color: "#6A8CAC", display: "block", marginBottom: 7, letterSpacing: 0.5 };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{editing ? "✏️ Edit" : "➕ Add New"} Question</div>
            <div style={{ fontSize: 12, color: "#6A8CAC", marginTop: 3 }}>Fill all fields carefully before saving</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#6A8CAC", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {error && <div style={{ background: "#F8717122", border: "1px solid #F8717144", borderRadius: 10, padding: "10px 14px", color: "#F87171", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={L}>EXAM *</label>
            <select className="select" value={form.exam} onChange={e => { upd("exam", e.target.value); upd("subject", SUBJECTS[e.target.value][0]); }}>
              {EXAMS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>SUBJECT *</label>
            <select className="select" value={form.subject} onChange={e => upd("subject", e.target.value)}>
              {SUBJECTS[form.exam].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={L}>TOPIC *</label>
            <input className="input" placeholder="e.g. Algebra, Syllogism..." value={form.topic} onChange={e => upd("topic", e.target.value)} />
          </div>
          <div>
            <label style={L}>DIFFICULTY *</label>
            <select className="select" value={form.difficulty} onChange={e => upd("difficulty", e.target.value)}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={L}>QUESTION TEXT *</label>
          <textarea className="input" rows={3} placeholder="Enter the full question here..." value={form.question_text} onChange={e => upd("question_text", e.target.value)} style={{ resize: "vertical" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={L}>OPTIONS * <span style={{ color: "#6A8CAC", fontWeight: 400 }}>(click circle to mark correct answer ✓)</span></label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => upd("correct_answer", i)} style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${form.correct_answer === i ? "#34D399" : "#152236"}`, background: form.correct_answer === i ? "#34D399" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {form.correct_answer === i && <span style={{ fontSize: 11, color: "#020408", fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ background: "#38BDF814", border: "1px solid #38BDF833", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#38BDF8", flexShrink: 0, width: 28, textAlign: "center" }}>{["A","B","C","D"][i]}</div>
                <input className="input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt} onChange={e => updOpt(i, e.target.value)} style={{ borderColor: form.correct_answer === i ? "#34D39966" : undefined }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={L}>EXPLANATION *</label>
          <textarea className="input" rows={2} placeholder="Why is this the correct answer?" value={form.explanation} onChange={e => upd("explanation", e.target.value)} style={{ resize: "vertical" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={L}>STATUS</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["active", "draft", "inactive"].map(s => (
              <button key={s} onClick={() => upd("status", s)} style={{ padding: "7px 18px", borderRadius: 8, border: `1.5px solid ${form.status === s ? "#38BDF8" : "#152236"}`, background: form.status === s ? "#38BDF814" : "transparent", color: form.status === s ? "#38BDF8" : "#6A8CAC", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid #0E1A2C" }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-success" style={{ flex: 2 }} onClick={handleSave} disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;Saving...</> : `✅ ${editing ? "Update" : "Save"} Question`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QUESTIONS PAGE ────────────────────────────────────────────────────────────
function QuestionsPage() {
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterExam, setFilterExam] = useState("All");
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editQ, setEditQ]           = useState(null);
  const [toast, setToast]           = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("questions").select("*").order("id", { ascending: false });
    if (!error) setQuestions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) { setToast({ msg: "Error deleting: " + error.message, type: "error" }); return; }
    setToast({ msg: "Question deleted", type: "success" });
    fetchQuestions();
  };

  const toggleStatus = async (q) => {
    const newStatus = q.status === "active" ? "inactive" : "active";
    await supabase.from("questions").update({ status: newStatus }).eq("id", q.id);
    setToast({ msg: `Question set to ${newStatus}`, type: "success" });
    fetchQuestions();
  };

  const filtered = questions
    .filter(q => filterExam === "All" || q.exam === filterExam)
    .filter(q => q.question_text?.toLowerCase().includes(search.toLowerCase()) || q.topic?.toLowerCase().includes(search.toLowerCase()));

  const examColor = { SSC: "#E8B84B", UPSC: "#38BDF8", JEE: "#A78BFA", Banking: "#34D399", RRB: "#FB923C" };
  const diffColor = { Easy: "#34D399", Medium: "#E8B84B", Hard: "#F87171" };

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {(showModal || editQ) && (
        <QuestionModal
          question={editQ}
          onClose={() => { setShowModal(false); setEditQ(null); }}
          onSaved={(msg) => { setToast({ msg, type: "success" }); fetchQuestions(); }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>Question Bank</h2>
          <p style={{ color: "#6A8CAC", fontSize: 13, marginTop: 3 }}>{questions.length} total questions · Add as many as you want</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditQ(null); setShowModal(true); }}>+ Add Question</button>
      </div>

      {/* Exam stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 22 }}>
        {EXAMS.map(e => (
          <div key={e} className="card" style={{ cursor: "pointer", borderColor: filterExam === e ? examColor[e] + "55" : undefined, background: filterExam === e ? examColor[e] + "08" : undefined }} onClick={() => setFilterExam(filterExam === e ? "All" : e)}>
            <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 26, fontWeight: 700, color: examColor[e] }}>
              {questions.filter(q => q.exam === e).length}
            </div>
            <div style={{ fontSize: 12, color: "#6A8CAC", marginTop: 4 }}>{e}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#080C18", border: "1px solid #152236", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 300 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions or topics..." style={{ background: "transparent", border: "none", outline: "none", color: "#EEF2FF", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, width: "100%" }} />
        </div>
        {["All", ...EXAMS].map(e => (
          <button key={e} onClick={() => setFilterExam(e)} style={{ padding: "7px 16px", borderRadius: 999, border: `1px solid ${filterExam === e ? "#38BDF8" : "#152236"}`, background: filterExam === e ? "#38BDF814" : "transparent", color: filterExam === e ? "#38BDF8" : "#6A8CAC", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{e}</button>
        ))}
        <Tag color="#6A8CAC">{filtered.length} results</Tag>
      </div>

      {/* Questions list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#6A8CAC" }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 16px" }} />
          <div>Loading questions from database...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "#6A8CAC" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❓</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "#EEF2FF" }}>No questions yet</div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>Click "+ Add Question" to add your first question to the database</div>
          <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15 }} onClick={() => setShowModal(true)}>+ Add First Question</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 70px 110px 80px 70px 70px 120px", gap: 12, padding: "8px 16px", fontSize: 10, color: "#253A52", fontWeight: 700, letterSpacing: 1.2 }}>
            <span>#</span><span>QUESTION</span><span>EXAM</span><span>SUBJECT</span><span>TOPIC</span><span>DIFF</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {filtered.map((q, i) => (
            <div key={q.id} className="tbl-row" style={{ gridTemplateColumns: "40px 1fr 70px 110px 80px 70px 70px 120px" }}>
              <Mono size={12} color="#253A52">{String(i + 1).padStart(2, "0")}</Mono>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.4 }}>
                  {q.question_text?.length > 75 ? q.question_text.slice(0, 75) + "..." : q.question_text}
                </div>
                <div style={{ fontSize: 11, color: "#6A8CAC", marginTop: 2 }}>{q.subject}</div>
              </div>
              <Tag color={examColor[q.exam] || "#38BDF8"}>{q.exam}</Tag>
              <div style={{ fontSize: 12, color: "#6A8CAC" }}>{q.subject?.split(" ").slice(0, 2).join(" ")}</div>
              <Tag color="#6A8CAC">{q.topic}</Tag>
              <Tag color={diffColor[q.difficulty] || "#E8B84B"}>{q.difficulty}</Tag>
              <Tag color={q.status === "active" ? "#34D399" : q.status === "draft" ? "#FCD34D" : "#6A8CAC"}>{q.status}</Tag>
              <div style={{ display: "flex", gap: 5 }}>
                <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => { setEditQ(q); setShowModal(true); }}>✏️</button>
                <button className="btn" style={{ padding: "5px 10px", fontSize: 11, background: q.status === "active" ? "#FB923C22" : "#34D39922", color: q.status === "active" ? "#FB923C" : "#34D399", border: `1px solid ${q.status === "active" ? "#FB923C33" : "#34D39933"}` }} onClick={() => toggleStatus(q)}>
                  {q.status === "active" ? "⏸" : "▶"}
                </button>
                <button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => deleteQuestion(q.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── USERS PAGE ────────────────────────────────────────────────────────────────
function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.exam_preparing?.toLowerCase().includes(search.toLowerCase())
  );

  const examColor = { SSC: "#E8B84B", UPSC: "#38BDF8", JEE: "#A78BFA", Banking: "#34D399" };

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>Registered Users</h2>
          <p style={{ color: "#6A8CAC", fontSize: 13, marginTop: 3 }}>{users.length} students registered on your platform</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          ["👥", "Total Users", users.length, "#38BDF8"],
          ["📚", "SSC", users.filter(u => u.exam_preparing?.includes("SSC")).length, "#E8B84B"],
          ["🏦", "Banking", users.filter(u => u.exam_preparing?.includes("Banking")).length, "#34D399"],
          ["🎓", "UPSC/JEE", users.filter(u => u.exam_preparing?.includes("UPSC") || u.exam_preparing?.includes("JEE")).length, "#A78BFA"],
        ].map(([icon, l, v, c]) => (
          <div key={l} className="card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: "#6A8CAC", marginTop: 5 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#080C18", border: "1px solid #152236", borderRadius: 10, padding: "8px 14px", maxWidth: 320, marginBottom: 16 }}>
        <span>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or exam..." style={{ background: "transparent", border: "none", outline: "none", color: "#EEF2FF", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, width: "100%" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80, color: "#6A8CAC" }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 16px" }} />
          <div>Loading users...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "#6A8CAC" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#EEF2FF", marginBottom: 8 }}>No users yet</div>
          <div style={{ fontSize: 14 }}>Users will appear here after they register on your platform</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 180px", gap: 12, padding: "8px 16px", fontSize: 10, color: "#253A52", fontWeight: 700, letterSpacing: 1.2 }}>
            <span>USER</span><span>EXAM</span><span>JOINED</span><span>USER ID</span>
          </div>
          {filtered.map((u) => (
            <div key={u.id} className="tbl-row" style={{ gridTemplateColumns: "1fr 140px 120px 180px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#38BDF8,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#020408", flexShrink: 0 }}>
                  {(u.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.full_name || "Unknown User"}</div>
                  <div style={{ fontSize: 11, color: "#6A8CAC" }}>Registered student</div>
                </div>
              </div>
              <Tag color={examColor[u.exam_preparing?.split(" ")[0]] || "#38BDF8"}>{u.exam_preparing || "Not set"}</Tag>
              <div style={{ fontSize: 12, color: "#6A8CAC" }}>
                {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </div>
              <Mono size={11} color="#253A52">{u.id?.slice(0, 18)}...</Mono>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const [stats, setStats] = useState({ questions: 0, users: 0, tests: 0, attempts: 0 });

  useEffect(() => {
    const load = async () => {
      const [q, u, t, a] = await Promise.all([
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id",  { count: "exact", head: true }),
        supabase.from("tests").select("id",     { count: "exact", head: true }),
        supabase.from("test_attempts").select("id", { count: "exact", head: true }),
      ]);
      setStats({ questions: q.count || 0, users: u.count || 0, tests: t.count || 0, attempts: a.count || 0 });
    };
    load();
  }, []);

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Admin Dashboard</h2>
      <p style={{ color: "#6A8CAC", fontSize: 13, marginBottom: 28 }}>Live overview of your ExamAce platform</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
        {[
          ["❓", "Questions in Bank", stats.questions, "#E8B84B"],
          ["👥", "Registered Users",  stats.users,     "#38BDF8"],
          ["📋", "Tests Created",     stats.tests,     "#A78BFA"],
          ["📝", "Test Attempts",     stats.attempts,  "#34D399"],
        ].map(([icon, label, val, color]) => (
          <div key={label} className="card fade-up">
            <div style={{ fontSize: 30, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 12, color: "#6A8CAC", marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { icon: "❓", title: "Add Questions",    sub: "Manually add MCQ questions to your question bank",  btn: "Open Question Bank →", color: "#E8B84B", page: "questions" },
          { icon: "👥", title: "View All Users",   sub: "See all students registered on your platform",      btn: "View Users →",         color: "#38BDF8", page: "users"     },
          { icon: "🤖", title: "AI Generator",     sub: "Auto-generate questions using Google Gemini AI",    btn: "Open AI Generator →",  color: "#A78BFA", page: "ai"        },
          { icon: "📋", title: "Create Tests",     sub: "Build and publish mock tests for students",         btn: "Coming Soon →",        color: "#34D399", page: null        },
        ].map((item, i) => (
          <div key={i} className="card" style={{ cursor: item.page ? "pointer" : "default" }} onClick={() => item.page && setPage(item.page)}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#6A8CAC", marginBottom: 16, lineHeight: 1.5 }}>{item.sub}</div>
            <button className="btn" style={{ background: item.color + "18", color: item.color, border: `1px solid ${item.color}33`, opacity: item.page ? 1 : 0.4, pointerEvents: "none" }}>
              {item.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");

  const nav = [
    { id: "dashboard", icon: "⊞",  label: "Dashboard"     },
    { id: "questions", icon: "❓",  label: "Question Bank" },
    { id: "users",     icon: "👥",  label: "Users"         },
    { id: "ai",        icon: "🤖",  label: "AI Generator"  },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#020408" }}>

        {/* Sidebar */}
        <aside style={{ width: 220, background: "#050810", borderRight: "1px solid #0E1A2C", display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
          <div style={{ padding: "4px 6px 22px" }}>
            <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 14, fontWeight: 600, color: "#38BDF8", letterSpacing: 2.5 }}>EXAMACE</div>
            <div style={{ fontSize: 9, color: "#253A52", letterSpacing: 2, marginTop: 2 }}>ADMIN PANEL</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#34D39912", border: "1px solid #34D39930", borderRadius: 9, padding: "8px 12px", marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", animation: "pulse 2s infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#34D399", fontWeight: 700 }}>PLATFORM LIVE</span>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {nav.map(n => (
              <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
                <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div style={{ borderTop: "1px solid #0E1A2C", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }} onClick={() => window.location.href = "/"}>
              🏠 Back to Site
            </button>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }} onClick={() => window.location.href = "/ai-generator"}>
              🤖 AI Generator
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto" }} key={page} className="fade-in">
          {page === "dashboard" && <DashboardPage setPage={setPage} />}
          {page === "questions" && <QuestionsPage />}
          {page === "users"     && <UsersPage />}
          {page === "ai"        && (
            <div style={{ padding: 28 }}>
              <button className="btn btn-ghost" onClick={() => setPage("dashboard")} style={{ marginBottom: 20 }}>← Back to Dashboard</button>
              <div style={{ background: "#080C18", border: "1px solid #0E1A2C", borderRadius: 16, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>AI Question Generator</div>
                <div style={{ color: "#6A8CAC", fontSize: 14, marginBottom: 20 }}>Generate questions automatically using Google Gemini AI</div>
                <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15 }} onClick={() => window.location.href = "/ai-generator"}>
                  Open AI Generator →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}