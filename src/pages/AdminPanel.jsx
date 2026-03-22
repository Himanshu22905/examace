import { useState, useEffect, useRef } from "react";
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
  .btn-warning{background:#FB923C22;color:#FB923C;border:1px solid #FB923C33;}
  .input,.select{width:100%;background:#020408;border:1.5px solid #0E1A2C;border-radius:10px;padding:11px 14px;color:#EEF2FF;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;}
  .input:focus,.select:focus{border-color:#38BDF888;}
  .input::placeholder{color:#253A52;}
  .select option{background:#050810;}
  .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
  .modal-overlay{position:fixed;inset:0;background:rgba(2,4,8,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}
  .modal{background:#080C18;border:1px solid #152236;border-radius:20px;padding:32px;width:100%;max-width:640px;max-height:92vh;overflow-y:auto;animation:fadeUp 0.3s ease;}
  .toast{position:fixed;bottom:28px;right:28px;z-index:500;background:#080C18;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .spinner{display:inline-block;border:2px solid #152236;border-top-color:#38BDF8;border-radius:50%;animation:spin 0.8s linear infinite;}
  .drop-zone{border:2px dashed #152236;border-radius:14px;padding:40px;text-align:center;cursor:pointer;transition:all 0.2s;}
  .drop-zone:hover,.drop-zone.drag-over{border-color:#38BDF8;background:#38BDF808;}
  .label{font-size:12px;font-weight:700;color:#6A8CAC;display:block;margin-bottom:7px;letter-spacing:0.5px;}
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
  useEffect(() => { const t = setTimeout(onDone,3000); return () => clearTimeout(t); },[]);
  const color = type==="success"?"#34D399":type==="error"?"#F87171":"#38BDF8";
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
function Spinner({ size=20 }) {
  return <div className="spinner" style={{ width:size, height:size }} />;
}
function Loading() {
  return <div style={{ textAlign:"center", padding:60 }}><Spinner size={36} /><div style={{ color:"#6A8CAC", fontSize:14, marginTop:16 }}>Loading...</div></div>;
}
const L = { fontSize:12, fontWeight:700, color:"#6A8CAC", display:"block", marginBottom:7, letterSpacing:0.5 };

// ── QUESTION MODAL ────────────────────────────────────────────────────────────
function QuestionModal({ question, onClose, onSaved }) {
  const editing = !!question;
  const [form, setForm] = useState(question || { exam:"SSC", subject:"Quantitative Aptitude", topic:"", difficulty:"Medium", question_text:"", options:["","","",""], correct_answer:0, explanation:"", status:"active" });
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
    const payload = { exam:form.exam, subject:form.subject, topic:form.topic, difficulty:form.difficulty, question_text:form.question_text, options:form.options, correct_answer:form.correct_answer, explanation:form.explanation, status:form.status };
    const result = editing ? await supabase.from("questions").update(payload).eq("id",question.id) : await supabase.from("questions").insert(payload);
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    onSaved(editing?"Question updated!":"Question added!");
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
          <div><label style={L}>EXAM *</label><select className="select" value={form.exam} onChange={e=>{upd("exam",e.target.value);upd("subject",SUBJECTS[e.target.value][0]);}}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
          <div><label style={L}>SUBJECT *</label><select className="select" value={form.subject} onChange={e=>upd("subject",e.target.value)}>{SUBJECTS[form.exam].map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div><label style={L}>TOPIC *</label><input className="input" placeholder="e.g. Algebra, Syllogism..." value={form.topic} onChange={e=>upd("topic",e.target.value)} /></div>
          <div><label style={L}>DIFFICULTY *</label><select className="select" value={form.difficulty} onChange={e=>upd("difficulty",e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
        </div>
        <div style={{ marginBottom:14 }}><label style={L}>QUESTION TEXT *</label><textarea className="input" rows={3} placeholder="Enter the full question here..." value={form.question_text} onChange={e=>upd("question_text",e.target.value)} style={{ resize:"vertical" }} /></div>
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
        <div style={{ marginBottom:14 }}><label style={L}>EXPLANATION *</label><textarea className="input" rows={2} placeholder="Why is this the correct answer?" value={form.explanation} onChange={e=>upd("explanation",e.target.value)} style={{ resize:"vertical" }} /></div>
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
            {loading?<><Spinner size={14}/>&nbsp;Saving...</>:`✅ ${editing?"Update":"Save"} Question`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BULK UPLOAD MODAL ─────────────────────────────────────────────────────────
function BulkUploadModal({ onClose, onSaved }) {
  const [step, setStep] = useState(1); // 1=instructions, 2=paste/upload, 3=preview, 4=done
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [exam, setExam] = useState("SSC");
  const [subject, setSubject] = useState("Quantitative Aptitude");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const sampleCSV = `question_text,option_a,option_b,option_c,option_d,correct_answer,topic,difficulty,explanation
What is 25% of 200?,25,50,75,100,B,Percentage,Easy,25% of 200 = (25/100) x 200 = 50
All dogs are animals. All animals have life. Do all dogs have life?,Yes,No,Maybe,Cannot say,A,Syllogism,Medium,Since all dogs are animals and all animals have life it follows that all dogs have life`;

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "examace_questions_sample.csv"; a.click();
  };

  const parseCSV = (text) => {
    setError("");
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) { setError("File must have a header row and at least 1 question"); return; }
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const required = ["question_text","option_a","option_b","option_c","option_d","correct_answer","topic","difficulty","explanation"];
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length > 0) { setError("Missing columns: " + missing.join(", ")); return; }
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",");
      if (vals.length < 9) continue;
      const row = {};
      headers.forEach((h, idx) => row[h] = vals[idx]?.trim() || "");
      const ansMap = { A:0, B:1, C:2, D:3, "0":0, "1":1, "2":2, "3":3 };
      const correctIdx = ansMap[row.correct_answer?.toUpperCase()];
      if (correctIdx === undefined) continue;
      rows.push({
        exam, subject,
        question_text: row.question_text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        correct_answer: correctIdx,
        topic: row.topic,
        difficulty: row.difficulty || "Medium",
        explanation: row.explanation,
        status: "active"
      });
    }
    if (rows.length === 0) { setError("No valid questions found. Check your CSV format."); return; }
    setParsed(rows);
    setStep(3);
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { setRawText(e.target.result); parseCSV(e.target.result); };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    const { error } = await supabase.from("questions").insert(parsed);
    if (error) { setError(error.message); setUploading(false); return; }
    setStep(4);
    setUploading(false);
    onSaved(`${parsed.length} questions uploaded successfully!`);
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:680 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ fontWeight:800, fontSize:20 }}>📤 Bulk Upload Questions</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#6A8CAC", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          {["Format","Upload","Preview","Done"].map((s,i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:step>i+1?"#34D399":step===i+1?"#38BDF8":"#152236", color:step>=i+1?"#020408":"#6A8CAC", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>
                {step>i+1?"✓":i+1}
              </div>
              <span style={{ fontSize:11, color:step===i+1?"#38BDF8":step>i+1?"#34D399":"#6A8CAC", fontWeight:600 }}>{s}</span>
              {i<3 && <div style={{ flex:1, height:1, background:step>i+1?"#34D39944":"#152236" }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ background:"#F8717122", border:"1px solid #F8717144", borderRadius:10, padding:"10px 14px", color:"#F87171", fontSize:13, marginBottom:16 }}>{error}</div>}

        {/* Step 1 — Format info */}
        {step===1 && (
          <>
            <div style={{ background:"#050810", border:"1px solid #0E1A2C", borderRadius:14, padding:20, marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>📋 Required CSV Format</div>
              <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:"#38BDF8", background:"#020408", borderRadius:8, padding:"12px 14px", overflowX:"auto", lineHeight:1.8 }}>
                question_text, option_a, option_b, option_c, option_d,<br/>
                correct_answer, topic, difficulty, explanation
              </div>
              <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  ["correct_answer","Use A, B, C, or D (not numbers)"],
                  ["difficulty","Easy, Medium, or Hard"],
                  ["topic","e.g. Algebra, Syllogism, History"],
                  ["All fields","Required — don't leave blank"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", gap:8, fontSize:13 }}>
                    <span style={{ color:"#E8B84B", fontWeight:700, flexShrink:0 }}>{k}:</span>
                    <span style={{ color:"#6A8CAC" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div><label style={L}>EXAM FOR ALL QUESTIONS</label><select className="select" value={exam} onChange={e=>{setExam(e.target.value);setSubject(SUBJECTS[e.target.value][0]);}}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
              <div><label style={L}>SUBJECT FOR ALL QUESTIONS</label><select className="select" value={subject} onChange={e=>setSubject(e.target.value)}>{SUBJECTS[exam].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={downloadSample}>📥 Download Sample CSV</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={()=>setStep(2)}>Next: Upload File →</button>
            </div>
          </>
        )}

        {/* Step 2 — Upload */}
        {step===2 && (
          <>
            <div
              className={`drop-zone${dragOver?" drag-over":""}`}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
              onClick={()=>fileRef.current.click()}
              style={{ marginBottom:20 }}
            >
              <div style={{ fontSize:48, marginBottom:12 }}>📂</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Drop your CSV file here</div>
              <div style={{ color:"#6A8CAC", fontSize:14 }}>or click to browse files</div>
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
            </div>
            <div style={{ textAlign:"center", color:"#6A8CAC", fontSize:13, marginBottom:16 }}>— OR paste CSV content below —</div>
            <textarea className="input" rows={6} placeholder="Paste your CSV content here..." value={rawText} onChange={e=>setRawText(e.target.value)} style={{ resize:"vertical", marginBottom:16, fontFamily:"'Fira Code',monospace", fontSize:12 }} />
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={()=>parseCSV(rawText)}>Parse & Preview →</button>
            </div>
          </>
        )}

        {/* Step 3 — Preview */}
        {step===3 && (
          <>
            <div style={{ background:"#34D39914", border:"1px solid #34D39933", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>✅</span>
              <span style={{ fontSize:14, fontWeight:600, color:"#34D399" }}>{parsed.length} questions parsed successfully! Review before saving.</span>
            </div>
            <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {parsed.map((q,i) => (
                <div key={i} style={{ background:"#050810", border:"1px solid #0E1A2C", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:"#6A8CAC" }}>Q{i+1}</span>
                    <div style={{ display:"flex", gap:6 }}>
                      <Tag color="#6A8CAC">{q.topic}</Tag>
                      <Tag color={q.difficulty==="Easy"?"#34D399":q.difficulty==="Hard"?"#F87171":"#E8B84B"}>{q.difficulty}</Tag>
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>{q.question_text?.slice(0,80)}{q.question_text?.length>80?"...":""}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                    {q.options.map((opt,j) => (
                      <div key={j} style={{ fontSize:11, padding:"4px 8px", borderRadius:6, background:j===q.correct_answer?"#34D39918":"#020408", color:j===q.correct_answer?"#34D399":"#6A8CAC", border:`1px solid ${j===q.correct_answer?"#34D39933":"#0E1A2C"}` }}>
                        <strong>{["A","B","C","D"][j]}.</strong> {opt} {j===q.correct_answer&&"✓"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={()=>setStep(2)}>← Back</button>
              <button className="btn btn-success" style={{ flex:2 }} onClick={handleUpload} disabled={uploading}>
                {uploading?<><Spinner size={14}/>&nbsp;Uploading...</>:`💾 Save All ${parsed.length} Questions`}
              </button>
            </div>
          </>
        )}

        {/* Step 4 — Done */}
        {step===4 && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
            <div style={{ fontWeight:800, fontSize:22, marginBottom:8, color:"#34D399" }}>Upload Complete!</div>
            <div style={{ color:"#6A8CAC", fontSize:14, marginBottom:28 }}>{parsed.length} questions added to your question bank</div>
            <button className="btn btn-primary" style={{ padding:"12px 32px", fontSize:15 }} onClick={onClose}>Done →</button>
          </div>
        )}
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
  const [search, setSearch] = useState("");
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      const { data } = await supabase.from("questions").select("id,question_text,subject,topic,difficulty").eq("exam",form.exam).eq("status","active").order("id",{ascending:false});
      setQuestions(data||[]); setSelected([]); setFetching(false);
    };
    load();
  }, [form.exam]);

  const toggleQ = (id) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const selectAll = () => setSelected(filtered.map(q=>q.id));
  const clearAll  = () => setSelected([]);

  const filtered = questions.filter(q =>
    q.question_text?.toLowerCase().includes(search.toLowerCase()) ||
    q.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name.trim()) { setError("Please enter a test name"); return; }
    if (selected.length < 1) { setError("Please select at least 1 question"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.from("tests").insert({ ...form, question_ids:selected, status:"published" });
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
          <div style={{ gridColumn:"1/-1" }}><label style={L}>TEST NAME *</label><input className="input" placeholder="e.g. SSC CGL Full Mock Test #2" value={form.name} onChange={e=>upd("name",e.target.value)} /></div>
          <div><label style={L}>EXAM</label><select className="select" value={form.exam} onChange={e=>upd("exam",e.target.value)}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
          <div><label style={L}>TYPE</label><select className="select" value={form.type} onChange={e=>upd("type",e.target.value)}>{["Full Length","Sectional","Topic-wise","PYQ"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={L}>TIME LIMIT (minutes)</label><input className="input" type="number" min={5} max={180} value={form.time_limit} onChange={e=>upd("time_limit",+e.target.value)} /></div>
          <div style={{ display:"flex", alignItems:"flex-end" }}><div style={{ padding:"11px 14px", background:"#38BDF814", border:"1px solid #38BDF833", borderRadius:10, color:"#38BDF8", fontWeight:700, fontSize:14, width:"100%", textAlign:"center" }}>{selected.length} questions selected</div></div>
        </div>
        <div style={{ marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <label style={{ ...L, marginBottom:0 }}>SELECT QUESTIONS</label>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" style={{ padding:"4px 12px", fontSize:11 }} onClick={selectAll}>Select All</button>
            <button className="btn btn-ghost" style={{ padding:"4px 12px", fontSize:11 }} onClick={clearAll}>Clear</button>
          </div>
        </div>
        <input className="input" placeholder="Search questions..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:10 }} />
        {fetching ? <div style={{ textAlign:"center", padding:20 }}><Spinner size={24} /></div> : (
          <div style={{ maxHeight:260, overflowY:"auto", display:"flex", flexDirection:"column", gap:5, marginBottom:16 }}>
            {filtered.length===0 ? (
              <div style={{ textAlign:"center", padding:24, color:"#6A8CAC", fontSize:13 }}>No active questions for {form.exam}. Add questions first!</div>
            ) : filtered.map(q=>(
              <div key={q.id} onClick={()=>toggleQ(q.id)} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${selected.includes(q.id)?"#38BDF8":"#0E1A2C"}`, background:selected.includes(q.id)?"#38BDF814":"#050810", cursor:"pointer", transition:"all 0.15s", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:13, fontWeight:selected.includes(q.id)?700:400, flex:1 }}>{q.question_text?.slice(0,65)}...</div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <Tag color="#6A8CAC">{q.topic}</Tag>
                  <Tag color={q.difficulty==="Easy"?"#34D399":q.difficulty==="Hard"?"#F87171":"#E8B84B"}>{q.difficulty}</Tag>
                  {selected.includes(q.id) && <span style={{ color:"#38BDF8", fontWeight:700, fontSize:14 }}>✓</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:10, paddingTop:16, borderTop:"1px solid #0E1A2C" }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" style={{ flex:2 }} onClick={handleCreate} disabled={loading}>
            {loading?<><Spinner size={14}/>&nbsp;Creating...</>:`🚀 Create & Publish (${selected.length} Qs)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADD USER MODAL ────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ full_name:"", email:"", password:"", mobile:"", exam_preparing:"SSC CGL" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const exams = ["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","UPSC CSE","JEE Main","RRB NTPC"];

  const handleCreate = async () => {
    if (!form.full_name||!form.email||!form.password) { setError("Name, email and password are required"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.admin ? 
      await supabase.auth.signUp({ email:form.email, password:form.password, options:{ data:{ full_name:form.full_name, mobile:form.mobile, exam_preparing:form.exam_preparing } } }) :
      await supabase.auth.signUp({ email:form.email, password:form.password, options:{ data:{ full_name:form.full_name, mobile:form.mobile, exam_preparing:form.exam_preparing } } });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data?.user) {
      await supabase.from("profiles").upsert({ id:data.user.id, full_name:form.full_name, email:form.email, mobile:form.mobile, exam_preparing:form.exam_preparing });
    }
    onSaved("User created successfully!");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ fontWeight:800, fontSize:20 }}>➕ Add New User</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#6A8CAC", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        {error && <div style={{ background:"#F8717122", border:"1px solid #F8717144", borderRadius:10, padding:"10px 14px", color:"#F87171", fontSize:13, marginBottom:16 }}>{error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={{ gridColumn:"1/-1" }}><label style={L}>FULL NAME *</label><input className="input" placeholder="Student full name" value={form.full_name} onChange={e=>upd("full_name",e.target.value)} /></div>
          <div><label style={L}>EMAIL *</label><input className="input" type="email" placeholder="student@email.com" value={form.email} onChange={e=>upd("email",e.target.value)} /></div>
          <div><label style={L}>PASSWORD *</label><input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>upd("password",e.target.value)} /></div>
          <div><label style={L}>MOBILE</label><input className="input" type="tel" placeholder="10-digit number" value={form.mobile} onChange={e=>upd("mobile",e.target.value)} maxLength={10} /></div>
          <div><label style={L}>TARGET EXAM</label><select className="select" value={form.exam_preparing} onChange={e=>upd("exam_preparing",e.target.value)}>{exams.map(e=><option key={e}>{e}</option>)}</select></div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20, paddingTop:16, borderTop:"1px solid #0E1A2C" }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-success" style={{ flex:2 }} onClick={handleCreate} disabled={loading}>
            {loading?<><Spinner size={14}/>&nbsp;Creating...</>:"✅ Create User"}
          </button>
        </div>
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
  const [bulkModal,setBulkModal] = useState(false);
  const [editQ,setEditQ]         = useState(null);
  const [toast,setToast]         = useState(null);
  const [selected,setSelected]   = useState([]);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("questions").select("*").order("id",{ascending:false});
    setQuestions(data||[]); setLoading(false);
  };
  useEffect(()=>{fetch();},[]);

  const deleteQ = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await supabase.from("questions").delete().eq("id",id);
    setToast({msg:"Question deleted",type:"success"}); fetch();
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selected.length} selected questions?`)) return;
    await supabase.from("questions").delete().in("id",selected);
    setSelected([]); setToast({msg:`${selected.length} questions deleted`,type:"success"}); fetch();
  };

  const toggleStatus = async (q) => {
    const s = q.status==="active"?"inactive":"active";
    await supabase.from("questions").update({status:s}).eq("id",q.id);
    setToast({msg:`Question ${s}`,type:"success"}); fetch();
  };

  const toggleSelect = (id) => setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const filtered = questions
    .filter(q=>filterExam==="All"||q.exam===filterExam)
    .filter(q=>q.question_text?.toLowerCase().includes(search.toLowerCase())||q.topic?.toLowerCase().includes(search.toLowerCase()));

  const ec={SSC:"#E8B84B",UPSC:"#38BDF8",JEE:"#A78BFA",Banking:"#34D399",RRB:"#FB923C"};
  const dc={Easy:"#34D399",Medium:"#E8B84B",Hard:"#F87171"};

  return (
    <div style={{ padding:28, maxWidth:1200 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      {(modal||editQ) && <QuestionModal question={editQ} onClose={()=>{setModal(false);setEditQ(null);}} onSaved={(msg)=>{setToast({msg,type:"success"});fetch();}} />}
      {bulkModal && <BulkUploadModal onClose={()=>setBulkModal(false)} onSaved={(msg)=>{setToast({msg,type:"success"});fetch();}} />}

      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:24 }}>Question Bank</h2>
          <p style={{ color:"#6A8CAC", fontSize:13, marginTop:3 }}>{questions.length} questions · {questions.filter(q=>q.status==="active").length} active</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {selected.length>0 && <button className="btn btn-danger" onClick={deleteSelected}>🗑 Delete {selected.length} Selected</button>}
          <button className="btn btn-ghost" onClick={()=>setBulkModal(true)}>📤 Bulk Upload CSV</button>
          <button className="btn btn-primary" onClick={()=>{setEditQ(null);setModal(true);}}>+ Add Question</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:22 }}>
        {EXAMS.map(e=>(
          <div key={e} className="card" style={{ cursor:"pointer", borderColor:filterExam===e?ec[e]+"55":undefined, background:filterExam===e?ec[e]+"08":undefined }} onClick={()=>setFilter(filterExam===e?"All":e)}>
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
        <Tag color="#6A8CAC">{filtered.length} results</Tag>
      </div>

      {loading ? <Loading /> : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>❓</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF", marginBottom:8 }}>No questions yet</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:16 }}>
            <button className="btn btn-ghost" onClick={()=>setBulkModal(true)}>📤 Bulk Upload</button>
            <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Add Question</button>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <div style={{ display:"grid", gridTemplateColumns:"30px 40px 1fr 70px 100px 80px 70px 70px 120px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span></span><span>#</span><span>QUESTION</span><span>EXAM</span><span>SUBJECT</span><span>TOPIC</span><span>DIFF</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {filtered.map((q,i)=>(
            <div key={q.id} className="tbl-row" style={{ gridTemplateColumns:"30px 40px 1fr 70px 100px 80px 70px 70px 120px" }}>
              <input type="checkbox" checked={selected.includes(q.id)} onChange={()=>toggleSelect(q.id)} style={{ cursor:"pointer", accentColor:"#38BDF8" }} />
              <Mono size={12} color="#253A52">{String(i+1).padStart(2,"0")}</Mono>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{q.question_text?.slice(0,70)}...</div>
                <div style={{ fontSize:11, color:"#6A8CAC", marginTop:2 }}>{q.subject}</div>
              </div>
              <Tag color={ec[q.exam]||"#38BDF8"}>{q.exam}</Tag>
              <div style={{ fontSize:12, color:"#6A8CAC" }}>{q.subject?.split(" ").slice(0,2).join(" ")}</div>
              <Tag color="#6A8CAC">{q.topic}</Tag>
              <Tag color={dc[q.difficulty]||"#E8B84B"}>{q.difficulty}</Tag>
              <Tag color={q.status==="active"?"#34D399":q.status==="draft"?"#FCD34D":"#6A8CAC"}>{q.status}</Tag>
              <div style={{ display:"flex", gap:5 }}>
  <button className="btn" style={{ padding:"5px 10px", fontSize:11, background:t.status==="published"?"#FB923C22":"#34D39922", color:t.status==="published"?"#FB923C":"#34D399", border:`1px solid ${t.status==="published"?"#FB923C33":"#34D39933"}` }} onClick={()=>toggleTest(t)}>
    {t.status==="published"?"⏸ Hide":"▶ Show"}
  </button>
  <button className="btn btn-ghost" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>deleteTest(t.id)}>🗑 Delete</button>
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
  const [users,setUsers]     = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch]   = useState("");
  const [addModal,setAddModal] = useState(false);
  const [toast,setToast]     = useState(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at",{ascending:false});
    setUsers(data||[]); setLoading(false);
  };
  useEffect(()=>{fetch();},[]);

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the platform? This will delete their profile data.`)) return;
    await supabase.from("test_attempts").delete().eq("user_id",id);
    await supabase.from("profiles").delete().eq("id",id);
    setToast({msg:`${name} removed successfully`,type:"success"}); fetch();
  };

  const filtered = users.filter(u=>
    u.full_name?.toLowerCase().includes(search.toLowerCase())||
    u.email?.toLowerCase().includes(search.toLowerCase())||
    u.mobile?.includes(search)||
    u.exam_preparing?.toLowerCase().includes(search.toLowerCase())
  );

  const ec={SSC:"#E8B84B",Banking:"#34D399",UPSC:"#38BDF8",JEE:"#A78BFA"};

  return (
    <div style={{ padding:28, maxWidth:1100 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}
      {addModal && <AddUserModal onClose={()=>setAddModal(false)} onSaved={(msg)=>{setToast({msg,type:"success"});fetch();}} />}

      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:24 }}>User Management</h2>
          <p style={{ color:"#6A8CAC", fontSize:13, marginTop:3 }}>{users.length} registered students</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setAddModal(true)}>+ Add User</button>
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

      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#080C18", border:"1px solid #152236", borderRadius:10, padding:"8px 14px", maxWidth:380, marginBottom:16 }}>
        <span>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, mobile or exam..." style={{ background:"transparent", border:"none", outline:"none", color:"#EEF2FF", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, width:"100%" }} />
      </div>

      {loading ? <Loading /> : filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF" }}>No users yet</div>
          <div style={{ fontSize:14, marginTop:8 }}>Users appear here after registering</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 140px 120px 120px 120px 80px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>USER</span><span>EMAIL</span><span>MOBILE</span><span>EXAM</span><span>JOINED</span><span>ACTION</span>
          </div>
          {filtered.map(u=>(
            <div key={u.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 140px 120px 120px 120px 80px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#38BDF8,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#020408", flexShrink:0 }}>
                  {(u.full_name||"U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{u.full_name||"Unknown"}</div>
                  <div style={{ fontSize:11, color:"#6A8CAC" }}>ID: {u.id?.slice(0,10)}...</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:"#6A8CAC", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email||"—"}</div>
              <Mono size={12} color="#6A8CAC">{u.mobile?"+91 "+u.mobile:"—"}</Mono>
              <Tag color={Object.entries(ec).find(([k])=>u.exam_preparing?.includes(k))?.[1]||"#38BDF8"}>{u.exam_preparing?.slice(0,10)||"Not set"}</Tag>
              <div style={{ fontSize:12, color:"#6A8CAC" }}>{u.created_at?new Date(u.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"}):"—"}</div>
              <button className="btn btn-danger" style={{ padding:"5px 10px", fontSize:11 }} onClick={()=>deleteUser(u.id,u.full_name||"User")}>🗑</button>
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
    const { data } = await supabase.from("tests").select("*").order("id",{ascending:false});
    setTests(data||[]); setLoading(false);
  };
  useEffect(()=>{fetch();},[]);

 const deleteTest = async (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this test? This cannot be undone.");
  if (!confirmed) return;
  const { error } = await supabase.from("tests").delete().eq("id", id);
  if (error) {
    setToast({ msg:"Error deleting test: " + error.message, type:"error" });
  } else {
    setToast({ msg:"Test deleted successfully", type:"success" });
    fetch();
  }
};
  const toggleTest = async (t) => {
    const s = t.status==="published"?"inactive":"published";
    await supabase.from("tests").update({status:s}).eq("id",t.id);
    setToast({msg:`Test ${s}`,type:"success"}); fetch();
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
      {loading ? <Loading /> : tests.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF", marginBottom:8 }}>No tests yet</div>
          <button className="btn btn-gold" style={{ marginTop:16 }} onClick={()=>setModal(true)}>+ Create First Test</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 90px 60px 80px 80px 130px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>TEST NAME</span><span>EXAM</span><span>TYPE</span><span>QS</span><span>TIME</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {tests.map(t=>{
            const qCount = Array.isArray(t.question_ids)?t.question_ids.length:(JSON.parse(t.question_ids||"[]")).length;
            return (
              <div key={t.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 80px 90px 60px 80px 80px 130px" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                  <div style={{ fontSize:11, color:"#6A8CAC" }}>{new Date(t.created_at).toLocaleDateString("en-IN")}</div>
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
      <p style={{ color:"#6A8CAC", fontSize:13, marginBottom:24 }}>{attempts.length} total attempts</p>
      {loading ? <Loading /> : attempts.length===0 ? (
        <div style={{ textAlign:"center", padding:80, color:"#6A8CAC" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <div style={{ fontWeight:700, fontSize:16, color:"#EEF2FF" }}>No attempts yet</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px 80px 80px 120px", gap:12, padding:"8px 16px", fontSize:10, color:"#253A52", fontWeight:700, letterSpacing:1.2 }}>
            <span>STUDENT</span><span>TEST</span><span>SCORE</span><span>ACCURACY</span><span>TIME</span><span>DATE</span>
          </div>
          {attempts.map(a=>(
            <div key={a.id} className="tbl-row" style={{ gridTemplateColumns:"1fr 1fr 80px 80px 80px 120px" }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{a.profiles?.full_name||"Unknown"}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{a.tests?.name||"Test"}</div>
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

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const [stats,setStats] = useState({ questions:0, users:0, tests:0, attempts:0 });
  useEffect(()=>{
    Promise.all([
      supabase.from("questions").select("id",{count:"exact",head:true}),
      supabase.from("profiles").select("id",{count:"exact",head:true}),
      supabase.from("tests").select("id",{count:"exact",head:true}),
      supabase.from("test_attempts").select("id",{count:"exact",head:true}),
    ]).then(([q,u,t,a])=>setStats({questions:q.count||0,users:u.count||0,tests:t.count||0,attempts:a.count||0}));
  },[]);
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
          {icon:"❓",title:"Question Bank",sub:"Add, edit, delete questions — bulk upload via CSV",btn:"Manage Questions →",color:"#E8B84B",page:"questions"},
          {icon:"📋",title:"Create Tests",sub:"Build and publish mock tests for students",btn:"Manage Tests →",color:"#38BDF8",page:"tests"},
          {icon:"👥",title:"User Management",sub:"View, add, delete registered students",btn:"Manage Users →",color:"#34D399",page:"users"},
          {icon:"📊",title:"Test Attempts",sub:"See all student test attempts and scores",btn:"View Attempts →",color:"#A78BFA",page:"attempts"},
        ].map((item,i)=>(
          <div key={i} className="card" style={{ cursor:"pointer" }} onClick={()=>setPage(item.page)}>
            <div style={{ fontSize:32, marginBottom:10 }}>{item.icon}</div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>{item.title}</div>
            <div style={{ fontSize:13, color:"#6A8CAC", marginBottom:14, lineHeight:1.5 }}>{item.sub}</div>
            <span style={{ background:item.color+"18", color:item.color, border:`1px solid ${item.color}33`, borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:700 }}>{item.btn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [page, setPage]       = useState("dashboard");
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  const ADMIN_EMAIL = "himanshu.mzn2019@gmail.com"; // 👈 REPLACE WITH YOUR EMAIL

  useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.email === ADMIN_EMAIL) {
      setAllowed(true);
      setChecking(false);
    } else {
      setAllowed(false);
      setChecking(false);
    }
  });
}, []);

if (checking) return (
  <>
    <style>{CSS}</style>
    <div style={{ minHeight:"100vh", background:"#020408", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:36, height:36, border:"2px solid #152236", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <div style={{ color:"#6A8CAC", fontSize:14 }}>Checking access...</div>
    </div>
  </>
);

if (!allowed) return (
  <>
    <style>{CSS}</style>
    <div style={{ minHeight:"100vh", background:"#020408", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:20 }}>
      <div style={{ fontSize:64 }}>🚫</div>
      <div style={{ fontWeight:800, fontSize:22 }}>Access Denied</div>
      <div style={{ color:"#6A8CAC", fontSize:14, textAlign:"center" }}>You don't have admin access.</div>
      <button style={{ padding:"12px 28px", background:"linear-gradient(135deg,#38BDF8,#0EA5E9)", border:"none", borderRadius:10, color:"#020408", fontWeight:700, fontSize:14, cursor:"pointer" }} onClick={() => window.location.href="/"}>
        Go to Home
      </button>
    </div>
  </>
);
  if (checking) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"#020408", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ display:"inline-block", width:36, height:36, border:"2px solid #152236", borderTopColor:"#38BDF8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      </div>
    </>
  );

  if (!allowed) return null;
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