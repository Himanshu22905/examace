import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
const FALLBACK_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "P@ndit123";

// ── STYLES ────────────────────────────────────────────────────────────────────
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
  .modal{background:#080C18;border:1px solid #152236;border-radius:20px;padding:32px;width:100%;max-width:640px;max-height:92vh;overflow-y:auto;animation:fadeUp 0.3s ease;}
  .toast{position:fixed;bottom:28px;right:28px;z-index:500;background:#080C18;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;animation:toastIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
  .drop-zone{border:2px dashed #152236;border-radius:14px;padding:40px;text-align:center;cursor:pointer;transition:all 0.2s;}
  .drop-zone:hover{border-color:#38BDF8;background:#38BDF808;}
  .label{font-size:12px;font-weight:700;color:#6A8CAC;display:block;margin-bottom:7px;letter-spacing:0.5px;}
  .sm-spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(2,4,8,0.3);border-top-color:#020408;border-radius:50%;animation:spin 0.7s linear infinite;}
`;

const SUBJECTS = {
  SSC:["Quantitative Aptitude","Reasoning","English","General Awareness"],
  UPSC:["History","Geography","Polity","Economics","General Science","Current Affairs"],
  JEE:["Physics","Chemistry","Mathematics"],
  Banking:["Quantitative Aptitude","Reasoning","English","General Awareness","Computer Knowledge"],
  RRB:["Quantitative Aptitude","Reasoning","General Science","General Awareness"],
};
const EXAMS = Object.keys(SUBJECTS);
const L = {fontSize:12,fontWeight:700,color:"#6A8CAC",display:"block",marginBottom:7,letterSpacing:0.5};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Toast({message,type,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  const color=type==="success"?"#34D399":type==="error"?"#F87171":"#38BDF8";
  return(<div className="toast" style={{border:`1.5px solid ${color}44`}}><span style={{fontSize:20}}>{type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span><span style={{fontSize:14,fontWeight:600}}>{message}</span></div>);
}
function Tag({children,color}){return<span className="tag" style={{background:color+"1A",color,border:`1px solid ${color}30`}}>{children}</span>;}
function Mono({children,color="#38BDF8",size=13}){return<span style={{fontFamily:"'Fira Code',monospace",fontSize:size,color,fontWeight:500}}>{children}</span>;}
function Loading(){return(<div style={{textAlign:"center",padding:60}}><div style={{width:36,height:36,border:"2px solid #152236",borderTopColor:"#38BDF8",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/><div style={{color:"#6A8CAC",fontSize:13}}>Loading...</div></div>);}
function SafeLogo({src,name,color="#38BDF8",size=22}){
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <span style={{ width:size, height:size, borderRadius:"50%", background:color+"22", border:`1px solid ${color}44`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color }}>
        {String(name||"?").slice(0,2).toUpperCase()}
      </span>
    );
  }
  return <img src={src} alt={name} onError={()=>setBroken(true)} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover"}} />;
}


// ── QUESTION MODAL ────────────────────────────────────────────────────────────
function QuestionModal({question,onClose,onSaved}){
  const editing=!!question;
  const[form,setForm]=useState(question||{exam:"SSC",subject:"Quantitative Aptitude",topic:"",difficulty:"Medium",question_text:"",options:["","","",""],correct_answer:0,explanation:"",status:"active"});
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const updOpt=(i,v)=>setForm(f=>({...f,options:f.options.map((o,j)=>j===i?v:o)}));
  const handleSave=async()=>{
    if(!form.topic.trim()){setError("Please enter a topic");return;}
    if(!form.question_text.trim()){setError("Please enter the question");return;}
    if(form.options.some(o=>!o.trim())){setError("Please fill all 4 options");return;}
    if(!form.explanation.trim()){setError("Please enter an explanation");return;}
    setLoading(true);setError("");
    const payload={exam:form.exam,subject:form.subject,topic:form.topic,difficulty:form.difficulty,question_text:form.question_text,options:form.options,correct_answer:form.correct_answer,explanation:form.explanation,status:form.status};
    const result=editing?await supabase.from("questions").update(payload).eq("id",question.id):await supabase.from("questions").insert(payload);
    if(result.error){setError(result.error.message);setLoading(false);return;}
    onSaved(editing?"Question updated!":"Question added!");onClose();
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontWeight:800,fontSize:20}}>{editing?"✏️ Edit":"➕ Add"} Question</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#6A8CAC",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {error&&<div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:16}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div><label style={L}>EXAM *</label><select className="select" value={form.exam} onChange={e=>{upd("exam",e.target.value);upd("subject",SUBJECTS[e.target.value][0]);}}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
          <div><label style={L}>SUBJECT *</label><select className="select" value={form.subject} onChange={e=>upd("subject",e.target.value)}>{SUBJECTS[form.exam].map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div><label style={L}>TOPIC *</label><input className="input" placeholder="e.g. Algebra..." value={form.topic} onChange={e=>upd("topic",e.target.value)}/></div>
          <div><label style={L}>DIFFICULTY *</label><select className="select" value={form.difficulty} onChange={e=>upd("difficulty",e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
        </div>
        <div style={{marginBottom:14}}><label style={L}>QUESTION TEXT *</label><textarea className="input" rows={3} placeholder="Enter the full question..." value={form.question_text} onChange={e=>upd("question_text",e.target.value)} style={{resize:"vertical"}}/></div>
        <div style={{marginBottom:14}}>
          <label style={L}>OPTIONS * <span style={{color:"#6A8CAC",fontWeight:400}}>(click circle = correct answer)</span></label>
          {form.options.map((opt,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div onClick={()=>upd("correct_answer",i)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${form.correct_answer===i?"#34D399":"#152236"}`,background:form.correct_answer===i?"#34D399":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                {form.correct_answer===i&&<span style={{fontSize:11,color:"#020408",fontWeight:900}}>✓</span>}
              </div>
              <div style={{background:"#38BDF814",border:"1px solid #38BDF833",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700,color:"#38BDF8",flexShrink:0,width:28,textAlign:"center"}}>{["A","B","C","D"][i]}</div>
              <input className="input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt} onChange={e=>updOpt(i,e.target.value)} style={{borderColor:form.correct_answer===i?"#34D39966":undefined}}/>
            </div>
          ))}
        </div>
        <div style={{marginBottom:14}}><label style={L}>EXPLANATION *</label><textarea className="input" rows={2} placeholder="Why is this correct?" value={form.explanation} onChange={e=>upd("explanation",e.target.value)} style={{resize:"vertical"}}/></div>
        <div style={{marginBottom:20}}>
          <label style={L}>STATUS</label>
          <div style={{display:"flex",gap:8}}>
            {["active","draft","inactive"].map(s=>(
              <button key={s} onClick={()=>upd("status",s)} style={{padding:"7px 18px",borderRadius:8,border:`1.5px solid ${form.status===s?"#38BDF8":"#152236"}`,background:form.status===s?"#38BDF814":"transparent",color:form.status===s?"#38BDF8":"#6A8CAC",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",textTransform:"capitalize"}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,paddingTop:16,borderTop:"1px solid #0E1A2C"}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-success" style={{flex:2}} onClick={handleSave} disabled={loading}>
            {loading?<><span className="sm-spin"/>&nbsp;Saving...</>:`✅ ${editing?"Update":"Save"} Question`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BULK UPLOAD MODAL ─────────────────────────────────────────────────────────
function BulkUploadModal({onClose,onSaved}){
  const[step,setStep]=useState(1);
  const[rawText,setRawText]=useState("");
  const[parsed,setParsed]=useState([]);
  const[exam,setExam]=useState("SSC");
  const[subject,setSubject]=useState("Quantitative Aptitude");
  const[uploading,setUploading]=useState(false);
  const[error,setError]=useState("");
  const[dragOver,setDragOver]=useState(false);
  const fileRef=useRef();
  const sample=`question_text,option_a,option_b,option_c,option_d,correct_answer,topic,difficulty,explanation\nWhat is 25% of 200?,25,50,75,100,B,Percentage,Easy,25% of 200 = 50`;
  const downloadSample=()=>{const b=new Blob([sample],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="sample.csv";a.click();};
  const parseCsvRows = (text) => {
    const rows = [];
    let current = [];
    let value = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];
      if (char === "\"") {
        if (inQuotes && next === "\"") {
          value += "\"";
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        current.push(value);
        value = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i++;
        current.push(value);
        if (current.some((cell) => String(cell).trim() !== "")) rows.push(current);
        current = [];
        value = "";
      } else {
        value += char;
      }
    }
    current.push(value);
    if (current.some((cell) => String(cell).trim() !== "")) rows.push(current);
    return rows;
  };

  const parseCSV=(text)=>{
    setError("");
    const normalized = String(text || "").replace(/^\uFEFF/, "");
    const lines = parseCsvRows(normalized);
    if(lines.length<2){setError("Need header row + at least 1 question");return;}
    const headers=lines[0].map(h=>String(h).trim().toLowerCase());
    const required=["question_text","option_a","option_b","option_c","option_d","correct_answer","topic","difficulty","explanation"];
    const missing=required.filter(r=>!headers.includes(r));
    if(missing.length>0){setError("Missing: "+missing.join(", "));return;}
    const rows=[];
    for(let i=1;i<lines.length;i++){
      const vals=lines[i];
      if(vals.length<9)continue;
      const row={};headers.forEach((h,idx)=>row[h]=String(vals[idx] ?? "").trim());
      const ansMap={A:0,B:1,C:2,D:3,"0":0,"1":1,"2":2,"3":3};
      const ci=ansMap[row.correct_answer?.toUpperCase()];
      if(ci===undefined)continue;
      rows.push({exam,subject,question_text:row.question_text,options:[row.option_a,row.option_b,row.option_c,row.option_d],correct_answer:ci,topic:row.topic,difficulty:row.difficulty||"Medium",explanation:row.explanation,status:"active"});
    }
    if(rows.length===0){setError("No valid questions found");return;}
    setParsed(rows);setStep(3);
  };
  const handleFile = async (file) => {
    if (!file) return;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      setRawText(utf8Text);
      parseCSV(utf8Text);
    } catch {
      const r = new FileReader();
      r.onload = (e) => {
        const text = String(e.target?.result || "");
        setRawText(text);
        parseCSV(text);
      };
      r.readAsText(file, "utf-8");
    }
  };
  const handleUpload=async()=>{
    setUploading(true);
    const{error}=await supabase.from("questions").insert(parsed);
    if(error){setError(error.message);setUploading(false);return;}
    setStep(4);setUploading(false);onSaved(`${parsed.length} questions uploaded!`);
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:680}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontWeight:800,fontSize:20}}>📤 Bulk Upload Questions</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#6A8CAC",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:24}}>
          {["Format","Upload","Preview","Done"].map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:step>i+1?"#34D399":step===i+1?"#38BDF8":"#152236",color:step>=i+1?"#020408":"#6A8CAC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{step>i+1?"✓":i+1}</div>
              <span style={{fontSize:11,color:step===i+1?"#38BDF8":step>i+1?"#34D399":"#6A8CAC",fontWeight:600}}>{s}</span>
              {i<3&&<div style={{flex:1,height:1,background:step>i+1?"#34D39944":"#152236"}}/>}
            </div>
          ))}
        </div>
        {error&&<div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:16}}>{error}</div>}
        {step===1&&(<>
          <div style={{background:"#050810",border:"1px solid #0E1A2C",borderRadius:14,padding:20,marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📋 Required CSV columns:</div>
            <div style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:"#38BDF8",background:"#020408",borderRadius:8,padding:"10px 14px",lineHeight:1.8}}>question_text, option_a, option_b, option_c, option_d,<br/>correct_answer (A/B/C/D), topic, difficulty, explanation</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <div><label style={L}>EXAM</label><select className="select" value={exam} onChange={e=>{setExam(e.target.value);setSubject(SUBJECTS[e.target.value][0]);}}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
            <div><label style={L}>SUBJECT</label><select className="select" value={subject} onChange={e=>setSubject(e.target.value)}>{SUBJECTS[exam].map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={downloadSample}>📥 Sample CSV</button>
            <button className="btn btn-primary" style={{flex:2}} onClick={()=>setStep(2)}>Next →</button>
          </div>
        </>)}
        {step===2&&(<>
          <div className={`drop-zone${dragOver?" drag-over":""}`} style={{marginBottom:16}} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>fileRef.current.click()}>
            <div style={{fontSize:40,marginBottom:10}}>📂</div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Drop CSV here or click to browse</div>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          </div>
          <textarea className="input" rows={5} placeholder="Or paste CSV content here..." value={rawText} onChange={e=>setRawText(e.target.value)} style={{resize:"vertical",marginBottom:14,fontFamily:"'Fira Code',monospace",fontSize:12}}/>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-primary" style={{flex:2}} onClick={()=>parseCSV(rawText)}>Parse & Preview →</button>
          </div>
        </>)}
        {step===3&&(<>
          <div style={{background:"#34D39914",border:"1px solid #34D39933",borderRadius:10,padding:"12px 16px",marginBottom:14,color:"#34D399",fontSize:14,fontWeight:600}}>✅ {parsed.length} questions ready! Review then save.</div>
          <div style={{maxHeight:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
            {parsed.map((q,i)=>(
              <div key={i} style={{background:"#050810",border:"1px solid #0E1A2C",borderRadius:10,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:"#6A8CAC"}}>Q{i+1}</span><div style={{display:"flex",gap:5}}><Tag color="#6A8CAC">{q.topic}</Tag><Tag color={q.difficulty==="Easy"?"#34D399":q.difficulty==="Hard"?"#F87171":"#E8B84B"}>{q.difficulty}</Tag></div></div>
                <div style={{fontSize:13,fontWeight:600}}>{q.question_text?.slice(0,70)}...</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(2)}>← Back</button>
            <button className="btn btn-success" style={{flex:2}} onClick={handleUpload} disabled={uploading}>{uploading?<><span className="sm-spin"/>&nbsp;Uploading...</>:`💾 Save ${parsed.length} Questions`}</button>
          </div>
        </>)}
        {step===4&&(<div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:56,marginBottom:12}}>🎉</div><div style={{fontWeight:800,fontSize:20,color:"#34D399",marginBottom:8}}>Done!</div><div style={{color:"#6A8CAC",fontSize:14,marginBottom:24}}>{parsed.length} questions saved!</div><button className="btn btn-primary" style={{padding:"12px 28px"}} onClick={onClose}>Close</button></div>)}
      </div>
    </div>
  );
}

// ── CREATE TEST MODAL ─────────────────────────────────────────────────────────
function CreateTestModal({onClose,onSaved}){
  const[form,setForm]=useState({name:"",exam:"SSC",type:"Full Length",time_limit:60});
  const[questions,setQuestions]=useState([]);
  const[selected,setSelected]=useState([]);
  const[loading,setLoading]=useState(false);
  const[fetching,setFetching]=useState(false);
  const[error,setError]=useState("");
  const[search,setSearch]=useState("");
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  useEffect(()=>{
    const load=async()=>{setFetching(true);const{data}=await supabase.from("questions").select("id,question_text,subject,topic,difficulty").eq("exam",form.exam).eq("status","active").order("id",{ascending:false});setQuestions(data||[]);setSelected([]);setFetching(false);};
    load();
  },[form.exam]);
  const filtered=questions.filter(q=>q.question_text?.toLowerCase().includes(search.toLowerCase())||q.topic?.toLowerCase().includes(search.toLowerCase()));
  const toggleQ=(id)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const handleCreate=async()=>{
    if(!form.name.trim()){setError("Please enter a test name");return;}
    if(selected.length<1){setError("Select at least 1 question");return;}
    setLoading(true);setError("");
    const{error}=await supabase.from("tests").insert({...form,question_ids:selected,status:"published"});
    if(error){setError(error.message);setLoading(false);return;}
    onSaved("Test created and published!");onClose();
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:700}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontWeight:800,fontSize:20}}>📋 Create New Test</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#6A8CAC",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {error&&<div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:16}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div style={{gridColumn:"1/-1"}}><label style={L}>TEST NAME *</label><input className="input" placeholder="e.g. SSC CGL Full Mock Test #2" value={form.name} onChange={e=>upd("name",e.target.value)}/></div>
          <div><label style={L}>EXAM</label><select className="select" value={form.exam} onChange={e=>upd("exam",e.target.value)}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
          <div><label style={L}>TYPE</label><select className="select" value={form.type} onChange={e=>upd("type",e.target.value)}>{["Full Length","Sectional","Topic-wise","PYQ"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={L}>TIME (minutes)</label><input className="input" type="number" min={5} max={180} value={form.time_limit} onChange={e=>upd("time_limit",+e.target.value)}/></div>
          <div style={{display:"flex",alignItems:"flex-end"}}><div style={{padding:"11px 14px",background:"#38BDF814",border:"1px solid #38BDF833",borderRadius:10,color:"#38BDF8",fontWeight:700,fontSize:14,width:"100%",textAlign:"center"}}>{selected.length} selected</div></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <label style={{...L,marginBottom:0}}>SELECT QUESTIONS</label>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-ghost" style={{padding:"4px 12px",fontSize:11}} onClick={()=>setSelected(filtered.map(q=>q.id))}>All</button>
            <button className="btn btn-ghost" style={{padding:"4px 12px",fontSize:11}} onClick={()=>setSelected([])}>Clear</button>
          </div>
        </div>
        <input className="input" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:8}}/>
        {fetching?<Loading/>:(
          <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
            {filtered.length===0?<div style={{textAlign:"center",padding:20,color:"#6A8CAC",fontSize:13}}>No questions for {form.exam}</div>:
            filtered.map(q=>(
              <div key={q.id} onClick={()=>toggleQ(q.id)} style={{padding:"9px 14px",borderRadius:9,border:`1.5px solid ${selected.includes(q.id)?"#38BDF8":"#0E1A2C"}`,background:selected.includes(q.id)?"#38BDF814":"#050810",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                <div style={{fontSize:13,fontWeight:selected.includes(q.id)?700:400,flex:1}}>{q.question_text?.slice(0,60)}...</div>
                <div style={{display:"flex",gap:5,flexShrink:0}}><Tag color="#6A8CAC">{q.topic}</Tag>{selected.includes(q.id)&&<span style={{color:"#38BDF8",fontWeight:700}}>✓</span>}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:10,paddingTop:14,borderTop:"1px solid #0E1A2C"}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" style={{flex:2}} onClick={handleCreate} disabled={loading}>{loading?<><span className="sm-spin"/>&nbsp;Creating...</>:`🚀 Publish (${selected.length} Qs)`}</button>
        </div>
      </div>
    </div>
  );
}

// ── ADD USER MODAL ────────────────────────────────────────────────────────────
function AddUserModal({onClose,onSaved}){
  const[form,setForm]=useState({full_name:"",email:"",password:"",mobile:"",exam_preparing:"SSC CGL"});
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const exams=["SSC CGL","SSC CHSL","IBPS PO","IBPS Clerk","SBI PO","UPSC CSE","JEE Main","RRB NTPC"];
  const handleCreate=async()=>{
    if(!form.full_name||!form.email||!form.password){setError("Name, email and password required");return;}
    if(form.password.length<6){setError("Password min 6 chars");return;}
    setLoading(true);setError("");
    const{data,error}=await supabase.auth.signUp({email:form.email,password:form.password,options:{data:{full_name:form.full_name,mobile:form.mobile,exam_preparing:form.exam_preparing}}});
    if(error){setError(error.message);setLoading(false);return;}
    if(data?.user){await supabase.from("profiles").upsert({id:data.user.id,full_name:form.full_name,email:form.email,mobile:form.mobile,exam_preparing:form.exam_preparing});}
    onSaved("User created!");onClose();
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontWeight:800,fontSize:20}}>➕ Add New User</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#6A8CAC",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        {error&&<div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:16}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1/-1"}}><label style={L}>FULL NAME *</label><input className="input" placeholder="Student name" value={form.full_name} onChange={e=>upd("full_name",e.target.value)}/></div>
          <div><label style={L}>EMAIL *</label><input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={e=>upd("email",e.target.value)}/></div>
          <div><label style={L}>PASSWORD *</label><input className="input" type="password" placeholder="Min 6 chars" value={form.password} onChange={e=>upd("password",e.target.value)}/></div>
          <div><label style={L}>MOBILE</label><input className="input" type="tel" placeholder="10-digit" value={form.mobile} onChange={e=>upd("mobile",e.target.value)} maxLength={10}/></div>
          <div><label style={L}>EXAM</label><select className="select" value={form.exam_preparing} onChange={e=>upd("exam_preparing",e.target.value)}>{exams.map(e=><option key={e}>{e}</option>)}</select></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid #0E1A2C"}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-success" style={{flex:2}} onClick={handleCreate} disabled={loading}>{loading?<><span className="sm-spin"/>&nbsp;Creating...</>:"✅ Create User"}</button>
        </div>
      </div>
    </div>
  );
}

// ── AI GENERATOR PAGE ─────────────────────────────────────────────────────────
function AIGeneratorPage(){
  const[exam,setExam]=useState("SSC");
  const[subject,setSubject]=useState("Quantitative Aptitude");
  const[topic,setTopic]=useState("");
  const[difficulty,setDifficulty]=useState("Medium");
  const[count,setCount]=useState(5);
    const[loading,setLoading]=useState(false);
  const[saving,setSaving]=useState(false);
  const[questions,setQuestions]=useState([]);
  const[message,setMessage]=useState("");
  const[error,setError]=useState("");

  const generate=async()=>{
    if(!topic){setError("Please enter a topic");return;}
        setLoading(true);setError("");setMessage("");setQuestions([]);
    const prompt=`Generate exactly ${count} multiple choice questions for ${exam} exam.\nSubject: ${subject}, Topic: ${topic}, Difficulty: ${difficulty}\nReturn ONLY a valid JSON array, no extra text:\n[{"question":"text","options":["A","B","C","D"],"correct_answer":0,"explanation":"why"}]\ncorrect_answer is 0-3 index.`;
    try{
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Login required. Please sign in again.");
        setLoading(false);
        return;
      }
      const res=await fetch("/api/generate",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer " + session.access_token
        },
        body:JSON.stringify({prompt, scope:"admin"})
      });
      const data=await res.json();
      if(!res.ok){setError(data.error||"Failed to generate questions");setLoading(false);return;}
      const text=data.content;
      const clean=text.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setQuestions(parsed.map(q=>({...q,exam,subject,topic,difficulty})));
      setMessage(`✅ ${parsed.length} questions generated! Review and save.`);
    }catch(err){
      setError("Error: "+err.message);
    }
    setLoading(false);
  };

  const saveAll=async()=>{
    setSaving(true);
    const{error}=await supabase.from("questions").insert(questions.map(q=>({exam:q.exam,subject:q.subject,topic:q.topic,difficulty:q.difficulty,question_text:q.question,options:q.options,correct_answer:q.correct_answer,explanation:q.explanation,status:"active"})));
    if(error)setError("Save error: "+error.message);
    else{setMessage(`🎉 ${questions.length} questions saved!`);setQuestions([]);}
    setSaving(false);
  };

  return(
    <div style={{padding:28,maxWidth:900}}>
      <h2 style={{fontWeight:800,fontSize:24,marginBottom:6}}>🤖 AI Question Generator</h2>
      <p style={{color:"#6A8CAC",fontSize:13,marginBottom:24}}>Generate questions securely via server API.</p>
      <div className="card" style={{marginBottom:20}}>        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div><label style={L}>EXAM</label><select className="select" value={exam} onChange={e=>{setExam(e.target.value);setSubject(SUBJECTS[e.target.value][0]);}}>{EXAMS.map(e=><option key={e}>{e}</option>)}</select></div>
          <div><label style={L}>SUBJECT</label><select className="select" value={subject} onChange={e=>setSubject(e.target.value)}>{SUBJECTS[exam].map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:4}}>
          <div><label style={L}>TOPIC *</label><input className="input" placeholder="e.g. Algebra..." value={topic} onChange={e=>setTopic(e.target.value)}/></div>
          <div><label style={L}>DIFFICULTY</label><select className="select" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
          <div><label style={L}>COUNT</label><select className="select" value={count} onChange={e=>setCount(+e.target.value)}><option>5</option><option>10</option><option>15</option><option>20</option></select></div>
        </div>
        <button style={{width:"100%",padding:14,marginTop:16,background:"linear-gradient(135deg,#E8B84B,#C89030)",border:"none",borderRadius:12,color:"#020408",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:15,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={generate} disabled={loading}>
          {loading?<><span className="sm-spin" style={{borderTopColor:"#020408"}}/>&nbsp;Generating...</>:"✨ Generate with AI"}
        </button>
      </div>
      {error&&<div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"12px 16px",color:"#F87171",fontSize:13,marginBottom:16}}>{error}</div>}
      {message&&<div style={{background:"#34D39922",border:"1px solid #34D39944",borderRadius:10,padding:"12px 16px",color:"#34D399",fontSize:13,marginBottom:16}}>{message}</div>}
      {questions.length>0&&(
        <div className="card">
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>{questions.length} Questions — Review Before Saving</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {questions.map((q,i)=>(
              <div key={i} style={{background:"#050810",border:"1px solid #0E1A2C",borderRadius:12,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:"#6A8CAC"}}>Q{i+1}</span><div style={{display:"flex",gap:5}}><Tag color="#6A8CAC">{q.topic}</Tag><Tag color={q.difficulty==="Easy"?"#34D399":q.difficulty==="Hard"?"#F87171":"#E8B84B"}>{q.difficulty}</Tag></div></div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>{q.question}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
                  {q.options.map((opt,j)=>(
                    <div key={j} style={{fontSize:12,padding:"6px 10px",borderRadius:7,background:j===q.correct_answer?"#34D39918":"#020408",color:j===q.correct_answer?"#34D399":"#6A8CAC",border:`1px solid ${j===q.correct_answer?"#34D39933":"#0E1A2C"}`}}><strong>{["A","B","C","D"][j]}.</strong> {opt} {j===q.correct_answer&&"✓"}</div>
                  ))}
                </div>
                <div style={{fontSize:12,color:"#7090B0",padding:"8px 12px",background:"#090E18",borderRadius:7,borderLeft:"3px solid #E8B84B"}}>💡 {q.explanation}</div>
              </div>
            ))}
          </div>
          <button style={{width:"100%",padding:14,background:"linear-gradient(135deg,#34D399,#059669)",border:"none",borderRadius:12,color:"#020408",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:15,fontWeight:800,cursor:"pointer"}} onClick={saveAll} disabled={saving}>
            {saving?<><span className="sm-spin" style={{borderTopColor:"#020408"}}/>&nbsp;Saving...</>:`💾 Save All ${questions.length} Questions`}
          </button>
        </div>
      )}
    </div>
  );
}

// ── QUESTIONS PAGE ────────────────────────────────────────────────────────────
function QuestionsPage(){
  const[questions,setQuestions]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filterExam,setFilter]=useState("All");
  const[search,setSearch]=useState("");
  const[modal,setModal]=useState(false);
  const[bulkModal,setBulkModal]=useState(false);
  const[editQ,setEditQ]=useState(null);
  const[toast,setToast]=useState(null);
  const[selected,setSelected]=useState([]);
  const fetchQ=async()=>{setLoading(true);const{data}=await supabase.from("questions").select("*").order("id",{ascending:false});setQuestions(data||[]);setLoading(false);};
  useEffect(()=>{fetchQ();},[]);
  const deleteQ=async(id)=>{if(!window.confirm("Delete?"))return;const{error}=await supabase.from("questions").delete().eq("id",id);if(error){setToast({msg:"Error: "+error.message,type:"error"});return;}setToast({msg:"Deleted!",type:"success"});fetchQ();};
  const deleteBulk=async()=>{if(!window.confirm(`Delete ${selected.length}?`))return;await supabase.from("questions").delete().in("id",selected);setSelected([]);setToast({msg:`${selected.length} deleted`,type:"success"});fetchQ();};
  const toggleStatus=async(q)=>{const s=q.status==="active"?"inactive":"active";await supabase.from("questions").update({status:s}).eq("id",q.id);setToast({msg:`${s}`,type:"success"});fetchQ();};
  const toggleSel=(id)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const filtered=questions.filter(q=>filterExam==="All"||q.exam===filterExam).filter(q=>q.question_text?.toLowerCase().includes(search.toLowerCase())||q.topic?.toLowerCase().includes(search.toLowerCase()));
  const ec={SSC:"#E8B84B",UPSC:"#38BDF8",JEE:"#A78BFA",Banking:"#34D399",RRB:"#FB923C"};
  const dc={Easy:"#34D399",Medium:"#E8B84B",Hard:"#F87171"};
  return(
    <div style={{padding:28,maxWidth:1200}}>
      {toast&&<Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      {(modal||editQ)&&<QuestionModal question={editQ} onClose={()=>{setModal(false);setEditQ(null);}} onSaved={(msg)=>{setToast({msg,type:"success"});fetchQ();}}/>}
      {bulkModal&&<BulkUploadModal onClose={()=>setBulkModal(false)} onSaved={(msg)=>{setToast({msg,type:"success"});fetchQ();}}/>}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div><h2 style={{fontWeight:800,fontSize:24}}>Question Bank</h2><p style={{color:"#6A8CAC",fontSize:13,marginTop:3}}>{questions.length} questions · {questions.filter(q=>q.status==="active").length} active</p></div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {selected.length>0&&<button className="btn btn-danger" onClick={deleteBulk}>🗑 Delete {selected.length}</button>}
          <button className="btn btn-ghost" onClick={()=>setBulkModal(true)}>📤 Bulk Upload</button>
          <button className="btn btn-primary" onClick={()=>{setEditQ(null);setModal(true);}}>+ Add Question</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
        {EXAMS.map(e=>(<div key={e} className="card" style={{cursor:"pointer",borderColor:filterExam===e?ec[e]+"55":undefined}} onClick={()=>setFilter(filterExam===e?"All":e)}><div style={{fontFamily:"'Fira Code',monospace",fontSize:22,fontWeight:700,color:ec[e]}}>{questions.filter(q=>q.exam===e).length}</div><div style={{fontSize:12,color:"#6A8CAC",marginTop:4}}>{e}</div></div>))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#080C18",border:"1px solid #152236",borderRadius:10,padding:"8px 14px",flex:1,maxWidth:300}}>
          <span>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:"transparent",border:"none",outline:"none",color:"#EEF2FF",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,width:"100%"}}/>
        </div>
        {["All",...EXAMS].map(e=>(<button key={e} onClick={()=>setFilter(e)} style={{padding:"7px 16px",borderRadius:999,border:`1px solid ${filterExam===e?"#38BDF8":"#152236"}`,background:filterExam===e?"#38BDF814":"transparent",color:filterExam===e?"#38BDF8":"#6A8CAC",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>{e}</button>))}
        <Tag color="#6A8CAC">{filtered.length}</Tag>
      </div>
      {loading?<Loading/>:filtered.length===0?(<div style={{textAlign:"center",padding:80,color:"#6A8CAC"}}><div style={{fontSize:48,marginBottom:16}}>❓</div><div style={{fontWeight:700,fontSize:16,color:"#EEF2FF",marginBottom:16}}>No questions yet</div><div style={{display:"flex",gap:10,justifyContent:"center"}}><button className="btn btn-ghost" onClick={()=>setBulkModal(true)}>📤 Bulk Upload</button><button className="btn btn-primary" onClick={()=>setModal(true)}>+ Add Question</button></div></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <div style={{display:"grid",gridTemplateColumns:"30px 40px 1fr 70px 100px 80px 70px 70px 120px",gap:12,padding:"8px 16px",fontSize:10,color:"#253A52",fontWeight:700,letterSpacing:1.2}}>
            <span></span><span>#</span><span>QUESTION</span><span>EXAM</span><span>SUBJECT</span><span>TOPIC</span><span>DIFF</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {filtered.map((q,i)=>(
            <div key={q.id} className="tbl-row" style={{gridTemplateColumns:"30px 40px 1fr 70px 100px 80px 70px 70px 120px"}}>
              <input type="checkbox" checked={selected.includes(q.id)} onChange={()=>toggleSel(q.id)} style={{cursor:"pointer",accentColor:"#38BDF8"}}/>
              <Mono size={12} color="#253A52">{String(i+1).padStart(2,"0")}</Mono>
              <div><div style={{fontWeight:600,fontSize:13}}>{q.question_text?.slice(0,70)}...</div><div style={{fontSize:11,color:"#6A8CAC",marginTop:2}}>{q.subject}</div></div>
              <Tag color={ec[q.exam]||"#38BDF8"}>{q.exam}</Tag>
              <div style={{fontSize:12,color:"#6A8CAC"}}>{q.subject?.split(" ").slice(0,2).join(" ")}</div>
              <Tag color="#6A8CAC">{q.topic}</Tag>
              <Tag color={dc[q.difficulty]||"#E8B84B"}>{q.difficulty}</Tag>
              <Tag color={q.status==="active"?"#34D399":q.status==="draft"?"#FCD34D":"#6A8CAC"}>{q.status}</Tag>
              <div style={{display:"flex",gap:5}}>
                <button className="btn btn-ghost" style={{padding:"5px 10px",fontSize:11}} onClick={()=>{setEditQ(q);setModal(true);}}>✏️</button>
                <button className="btn" style={{padding:"5px 10px",fontSize:11,background:q.status==="active"?"#FB923C22":"#34D39922",color:q.status==="active"?"#FB923C":"#34D399",border:`1px solid ${q.status==="active"?"#FB923C33":"#34D39933"}`}} onClick={()=>toggleStatus(q)}>{q.status==="active"?"⏸":"▶"}</button>
                <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>deleteQ(q.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TESTS PAGE ────────────────────────────────────────────────────────────────
function TestsPage(){
  const[tests,setTests]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(false);
  const[toast,setToast]=useState(null);
  const fetchT=async()=>{setLoading(true);const{data}=await supabase.from("tests").select("*").order("id",{ascending:false});setTests(data||[]);setLoading(false);};
  useEffect(()=>{fetchT();},[]);
  const deleteTest=async(id)=>{
    if(!window.confirm("Delete this test?"))return;
    const{error}=await supabase.from("tests").delete().eq("id",id);
    if(error){setToast({msg:"Error: "+error.message,type:"error"});return;}
    setToast({msg:"Test deleted!",type:"success"});fetchT();
  };
  const toggleTest=async(t)=>{const s=t.status==="published"?"inactive":"published";await supabase.from("tests").update({status:s}).eq("id",t.id);setToast({msg:`Test ${s}`,type:"success"});fetchT();};
  return(
    <div style={{padding:28,maxWidth:1100}}>
      {toast&&<Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      {modal&&<CreateTestModal onClose={()=>setModal(false)} onSaved={(msg)=>{setToast({msg,type:"success"});fetchT();}}/>}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
        <div><h2 style={{fontWeight:800,fontSize:24}}>Mock Tests</h2><p style={{color:"#6A8CAC",fontSize:13,marginTop:3}}>{tests.filter(t=>t.status==="published").length} published</p></div>
        <button className="btn btn-gold" onClick={()=>setModal(true)}>+ Create Test</button>
      </div>
      {loading?<Loading/>:tests.length===0?(<div style={{textAlign:"center",padding:80,color:"#6A8CAC"}}><div style={{fontSize:48,marginBottom:16}}>📋</div><div style={{fontWeight:700,fontSize:16,color:"#EEF2FF",marginBottom:8}}>No tests yet</div><button className="btn btn-gold" style={{marginTop:8}} onClick={()=>setModal(true)}>+ Create First Test</button></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 80px 90px 60px 80px 80px 150px",gap:12,padding:"8px 16px",fontSize:10,color:"#253A52",fontWeight:700,letterSpacing:1.2}}>
            <span>TEST NAME</span><span>EXAM</span><span>TYPE</span><span>QS</span><span>TIME</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {tests.map(t=>{
            const qCount=Array.isArray(t.question_ids)?t.question_ids.length:(JSON.parse(t.question_ids||"[]")).length;
            return(
              <div key={t.id} className="tbl-row" style={{gridTemplateColumns:"1fr 80px 90px 60px 80px 80px 150px"}}>
                <div><div style={{fontWeight:700,fontSize:14}}>{t.name}</div><div style={{fontSize:11,color:"#6A8CAC"}}>{new Date(t.created_at).toLocaleDateString("en-IN")}</div></div>
                <Tag color="#E8B84B">{t.exam}</Tag>
                <Tag color="#38BDF8">{t.type}</Tag>
                <Mono size={13} color="#EEF2FF">{qCount}</Mono>
                <Mono size={12} color="#6A8CAC">{t.time_limit}m</Mono>
                <Tag color={t.status==="published"?"#34D399":"#6A8CAC"}>{t.status}</Tag>
                <div style={{display:"flex",gap:5}}>
                  <button className="btn" style={{padding:"5px 10px",fontSize:11,background:t.status==="published"?"#FB923C22":"#34D39922",color:t.status==="published"?"#FB923C":"#34D399",border:`1px solid ${t.status==="published"?"#FB923C33":"#34D39933"}`}} onClick={()=>toggleTest(t)}>{t.status==="published"?"⏸ Hide":"▶ Show"}</button>
                  <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>deleteTest(t.id)}>🗑 Delete</button>
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
function UsersPage(){
  const[users,setUsers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[search,setSearch]=useState("");
  const[addModal,setAddModal]=useState(false);
  const[toast,setToast]=useState(null);
  const fetchU=async()=>{setLoading(true);const{data}=await supabase.from("profiles").select("*").order("created_at",{ascending:false});setUsers(data||[]);setLoading(false);};
  useEffect(()=>{fetchU();},[]);
  const deleteUser=async(id,name)=>{
    if(!window.confirm(`Remove ${name}?`))return;
    await supabase.from("test_attempts").delete().eq("user_id",id);
    await supabase.from("profiles").delete().eq("id",id);
    setToast({msg:`${name} removed`,type:"success"});fetchU();
  };
  const filtered=users.filter(u=>u.full_name?.toLowerCase().includes(search.toLowerCase())||u.email?.toLowerCase().includes(search.toLowerCase())||u.mobile?.includes(search)||u.exam_preparing?.toLowerCase().includes(search.toLowerCase()));
  const ec={SSC:"#E8B84B",Banking:"#34D399",UPSC:"#38BDF8",JEE:"#A78BFA"};
  return(
    <div style={{padding:28,maxWidth:1100}}>
      {toast&&<Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      {addModal&&<AddUserModal onClose={()=>setAddModal(false)} onSaved={(msg)=>{setToast({msg,type:"success"});fetchU();}}/>}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
        <div><h2 style={{fontWeight:800,fontSize:24}}>User Management</h2><p style={{color:"#6A8CAC",fontSize:13,marginTop:3}}>{users.length} registered students</p></div>
        <button className="btn btn-primary" onClick={()=>setAddModal(true)}>+ Add User</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[["👥","Total",users.length,"#38BDF8"],["📚","SSC",users.filter(u=>u.exam_preparing?.includes("SSC")).length,"#E8B84B"],["🏦","Banking",users.filter(u=>u.exam_preparing?.includes("Banking")||u.exam_preparing?.includes("IBPS")||u.exam_preparing?.includes("SBI")).length,"#34D399"],["🎓","UPSC/JEE",users.filter(u=>u.exam_preparing?.includes("UPSC")||u.exam_preparing?.includes("JEE")).length,"#A78BFA"]].map(([icon,l,v,c])=>(
          <div key={l} className="card"><div style={{fontSize:22,marginBottom:8}}>{icon}</div><div style={{fontFamily:"'Fira Code',monospace",fontSize:26,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:12,color:"#6A8CAC",marginTop:5}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"#080C18",border:"1px solid #152236",borderRadius:10,padding:"8px 14px",maxWidth:360,marginBottom:14}}>
        <span>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, mobile..." style={{background:"transparent",border:"none",outline:"none",color:"#EEF2FF",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,width:"100%"}}/>
      </div>
      {loading?<Loading/>:filtered.length===0?(<div style={{textAlign:"center",padding:80,color:"#6A8CAC"}}><div style={{fontSize:48,marginBottom:16}}>👥</div><div style={{fontWeight:700,fontSize:16,color:"#EEF2FF"}}>No users yet</div></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 150px 110px 120px 110px 80px",gap:12,padding:"8px 16px",fontSize:10,color:"#253A52",fontWeight:700,letterSpacing:1.2}}>
            <span>USER</span><span>EMAIL</span><span>MOBILE</span><span>EXAM</span><span>JOINED</span><span>ACTION</span>
          </div>
          {filtered.map(u=>(
            <div key={u.id} className="tbl-row" style={{gridTemplateColumns:"1fr 150px 110px 120px 110px 80px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#38BDF8,#0EA5E9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#020408",flexShrink:0}}>{(u.full_name||"U").charAt(0).toUpperCase()}</div>
                <div><div style={{fontWeight:700,fontSize:14}}>{u.full_name||"Unknown"}</div><div style={{fontSize:11,color:"#6A8CAC"}}>ID: {u.id?.slice(0,10)}...</div></div>
              </div>
              <div style={{fontSize:12,color:"#6A8CAC",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email||"—"}</div>
              <Mono size={12} color="#6A8CAC">{u.mobile?"+91 "+u.mobile:"—"}</Mono>
              <Tag color={Object.entries(ec).find(([k])=>u.exam_preparing?.includes(k))?.[1]||"#38BDF8"}>{u.exam_preparing?.slice(0,12)||"Not set"}</Tag>
              <div style={{fontSize:12,color:"#6A8CAC"}}>{u.created_at?new Date(u.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"}):"—"}</div>
              <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>deleteUser(u.id,u.full_name||"User")}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ATTEMPTS PAGE ─────────────────────────────────────────────────────────────
function AttemptsPage(){
  const[attempts,setAttempts]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from("test_attempts").select("*,profiles(full_name),tests(name,exam)").order("completed_at",{ascending:false}).then(({data})=>{setAttempts(data||[]);setLoading(false);});},[]);
  return(
    <div style={{padding:28,maxWidth:1100}}>
      <h2 style={{fontWeight:800,fontSize:24,marginBottom:6}}>Test Attempts</h2>
      <p style={{color:"#6A8CAC",fontSize:13,marginBottom:24}}>{attempts.length} total</p>
      {loading?<Loading/>:attempts.length===0?(<div style={{textAlign:"center",padding:80,color:"#6A8CAC"}}><div style={{fontSize:48,marginBottom:16}}>📊</div><div style={{fontWeight:700,fontSize:16,color:"#EEF2FF"}}>No attempts yet</div></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px 80px 80px 120px",gap:12,padding:"8px 16px",fontSize:10,color:"#253A52",fontWeight:700,letterSpacing:1.2}}>
            <span>STUDENT</span><span>TEST</span><span>SCORE</span><span>ACCURACY</span><span>TIME</span><span>DATE</span>
          </div>
          {attempts.map(a=>(
            <div key={a.id} className="tbl-row" style={{gridTemplateColumns:"1fr 1fr 80px 80px 80px 120px"}}>
              <div style={{fontWeight:600,fontSize:13}}>{a.profiles?.full_name||"Unknown"}</div>
              <div><div style={{fontSize:13,fontWeight:600}}>{a.tests?.name||"Test"}</div><Tag color="#E8B84B">{a.tests?.exam||"—"}</Tag></div>
              <Mono size={14} color="#EEF2FF">{a.score}</Mono>
              <Tag color={a.accuracy>=70?"#34D399":a.accuracy>=50?"#E8B84B":"#F87171"}>{a.accuracy}%</Tag>
              <Mono size={12} color="#6A8CAC">{a.time_taken?Math.floor(a.time_taken/60)+"m":"—"}</Mono>
              <div style={{fontSize:12,color:"#6A8CAC"}}>{new Date(a.completed_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD HOME ────────────────────────────────────────────────────────────
function SuggestionsPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "Book",
    exam: "All",
    weak_topic: "",
    message: "",
    affiliate_url: "",
    priority: 1,
    active: true
  });

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("admin_suggestions")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveSuggestion = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setToast({ msg: "Title and message are required", type: "error" });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      type: form.type,
      exam: form.exam,
      weak_topic: form.weak_topic.trim() || null,
      message: form.message.trim(),
      affiliate_url: form.affiliate_url.trim() || null,
      priority: Number(form.priority) || 1,
      active: !!form.active
    };
    const { error } = await supabase.from("admin_suggestions").insert(payload);
    if (error) {
      setToast({ msg: error.message, type: "error" });
    } else {
      setToast({ msg: "Suggestion added", type: "success" });
      setForm({ title: "", type: "Book", exam: "All", weak_topic: "", message: "", affiliate_url: "", priority: 1, active: true });
      fetchItems();
    }
    setSaving(false);
  };

  const toggleActive = async (row) => {
    await supabase.from("admin_suggestions").update({ active: !row.active }).eq("id", row.id);
    fetchItems();
  };

  const removeItem = async (row) => {
    if (!window.confirm("Delete this suggestion?")) return;
    await supabase.from("admin_suggestions").delete().eq("id", row.id);
    fetchItems();
  };

  return (
    <div style={{padding:28,maxWidth:1150}}>
      {toast&&<Toast message={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>} 
      <h2 style={{fontWeight:800,fontSize:24,marginBottom:6}}>Manual Suggestions</h2>
      <p style={{color:"#6A8CAC",fontSize:13,marginBottom:20}}>Add affiliate books, promotions, and custom preparation tips for AI Analysis.</p>

      <div className="card" style={{marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Add New Suggestion</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:10}}>
          <div><label style={L}>TITLE</label><input className="input" value={form.title} onChange={e=>updateField("title", e.target.value)} placeholder="e.g. Quant Formula Book"/></div>
          <div><label style={L}>TYPE</label><select className="select" value={form.type} onChange={e=>updateField("type", e.target.value)}><option>Book</option><option>Course</option><option>Tip</option><option>Promotion</option></select></div>
          <div><label style={L}>EXAM</label><select className="select" value={form.exam} onChange={e=>updateField("exam", e.target.value)}><option>All</option><option>SSC</option><option>Banking</option><option>UPSC</option><option>JEE</option><option>RRB</option></select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:10}}>
          <div><label style={L}>WEAK TOPIC (OPTIONAL)</label><input className="input" value={form.weak_topic} onChange={e=>updateField("weak_topic", e.target.value)} placeholder="e.g. Algebra"/></div>
          <div><label style={L}>AFFILIATE URL (OPTIONAL)</label><input className="input" value={form.affiliate_url} onChange={e=>updateField("affiliate_url", e.target.value)} placeholder="https://..."/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 130px 140px",gap:12}}>
          <div><label style={L}>MESSAGE</label><textarea className="input" rows={3} value={form.message} onChange={e=>updateField("message", e.target.value)} placeholder="Why this is useful for the student..." style={{resize:"vertical"}}/></div>
          <div><label style={L}>PRIORITY</label><input className="input" type="number" min={1} max={10} value={form.priority} onChange={e=>updateField("priority", e.target.value)}/></div>
          <div>
            <label style={L}>STATUS</label>
            <button className="btn btn-ghost" style={{width:"100%",height:44}} onClick={()=>updateField("active", !form.active)}>{form.active ? "Active" : "Inactive"}</button>
          </div>
        </div>
        <div style={{marginTop:14}}><button className="btn btn-success" onClick={saveSuggestion} disabled={saving}>{saving ? "Saving..." : "Save Suggestion"}</button></div>
      </div>

      {error && <div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"10px 14px",color:"#F87171",fontSize:13,marginBottom:12}}>{error}</div>}

      {loading ? <Loading/> : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 70px 90px 100px 1fr 90px 140px",gap:12,padding:"8px 16px",fontSize:10,color:"#253A52",fontWeight:700,letterSpacing:1.2}}>
            <span>TITLE</span><span>TYPE</span><span>EXAM</span><span>TOPIC</span><span>URL</span><span>STATUS</span><span>ACTIONS</span>
          </div>
          {items.map((row)=>(
            <div key={row.id} className="tbl-row" style={{gridTemplateColumns:"1fr 70px 90px 100px 1fr 90px 140px"}}>
              <div><div style={{fontWeight:700,fontSize:13}}>{row.title}</div><div style={{fontSize:11,color:"#6A8CAC"}}>{row.message?.slice(0,70)}</div></div>
              <Tag color="#38BDF8">{row.type||"Tip"}</Tag>
              <Tag color="#E8B84B">{row.exam||"All"}</Tag>
              <Tag color="#6A8CAC">{row.weak_topic||"All"}</Tag>
              <div style={{fontSize:12,color:"#6A8CAC",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.affiliate_url||"-"}</div>
              <Tag color={row.active ? "#34D399" : "#6A8CAC"}>{row.active ? "active" : "inactive"}</Tag>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-ghost" style={{padding:"5px 10px",fontSize:11}} onClick={()=>toggleActive(row)}>{row.active ? "Disable" : "Enable"}</button>
                <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>removeItem(row)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesPage({ isSuperAdmin }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", logo_url: "", color_hex: "#38BDF8", sort_order: 100, is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("exam_categories").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!isSuperAdmin) return;
    if (!form.name.trim()) {
      setToast({ msg: "Category name is required", type: "error" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      logo_url: form.logo_url.trim() || null,
      color_hex: form.color_hex || "#38BDF8",
      sort_order: Number(form.sort_order) || 100,
      is_active: !!form.is_active
    };
    const { error } = await supabase.from("exam_categories").insert(payload);
    if (error) setToast({ msg: error.message, type: "error" });
    else {
      setToast({ msg: "Category created", type: "success" });
      setForm({ name: "", description: "", logo_url: "", color_hex: "#38BDF8", sort_order: 100, is_active: true });
      load();
    }
  };

  const remove = async (id, name) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`Delete category "${name}"?`)) return;
    const { error } = await supabase.from("exam_categories").delete().eq("id", id);
    if (error) setToast({ msg: error.message, type: "error" });
    else {
      setToast({ msg: "Category deleted", type: "success" });
      load();
    }
  };

  return (
    <div style={{ padding: 28, maxWidth: 1150 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Exam Categories</h2>
      <p style={{ color: "#6A8CAC", fontSize: 13, marginBottom: 20 }}>Create and manage test categories with logos.</p>

      {isSuperAdmin ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Add Category</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input className="input" placeholder="Category name (e.g. SSC)" value={form.name} onChange={(e) => setForm((x) => ({ ...x, name: e.target.value }))} />
            <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm((x) => ({ ...x, description: e.target.value }))} />
            <input className="input" placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm((x) => ({ ...x, logo_url: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "130px 120px 160px", gap: 10 }}>
            <input className="input" type="color" value={form.color_hex} onChange={(e) => setForm((x) => ({ ...x, color_hex: e.target.value }))} />
            <input className="input" type="number" value={form.sort_order} onChange={(e) => setForm((x) => ({ ...x, sort_order: e.target.value }))} />
            <button className="btn btn-success" onClick={save}>Save Category</button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#E8B84B18", border: "1px solid #E8B84B40", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E8B84B", marginBottom: 12 }}>
          Only Super Admin can create or delete categories.
        </div>
      )}

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.id} className="tbl-row" style={{ gridTemplateColumns: "44px 1fr 180px 120px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #152236", background: row.color_hex ? row.color_hex + "22" : "#0E1A2C", display: "grid", placeItems: "center" }}>
                <SafeLogo src={row.logo_url} name={row.name} color={row.color_hex || "#38BDF8"} size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{row.name}</div>
                <div style={{ color: "#6A8CAC", fontSize: 12 }}>{row.description || "No description"}</div>
              </div>
              <div style={{ color: "#6A8CAC", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.logo_url || "-"}</div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {isSuperAdmin ? <button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => remove(row.id, row.name)}>Delete</button> : <Tag color="#6A8CAC">View only</Tag>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudyMaterialsAdminPage({ isSuperAdmin }) {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category_name: "", pdf_url: "", logo_url: "", language: "English", is_active: true });

  const load = async () => {
    setLoading(true);
    const [{ data: materialRows }, { data: categoryRows }] = await Promise.all([
      supabase.from("study_materials").select("*").order("created_at", { ascending: false }),
      supabase.from("exam_categories").select("name,logo_url,color_hex").eq("is_active", true).order("sort_order", { ascending: true })
    ]);
    setRows(materialRows || []);
    setCategories(categoryRows || []);
    if (!form.category_name && categoryRows?.length) setForm((x) => ({ ...x, category_name: categoryRows[0].name }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim()) {
      setToast({ msg: "Title is required", type: "error" });
      return;
    }
    setSaving(true);
    let finalPdfUrl = form.pdf_url.trim();
    if (!finalPdfUrl && selectedFile) {
      setUploadingFile(true);
      const clean = String(form.title || "material").replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "-").toLowerCase();
      const filePath = `${Date.now()}-${clean || "material"}.pdf`;
      const uploadRes = await supabase.storage.from("study-materials").upload(filePath, selectedFile, { upsert: true, contentType: "application/pdf" });
      setUploadingFile(false);
      if (uploadRes.error) {
        setSaving(false);
        setToast({ msg: `Upload failed: ${uploadRes.error.message}`, type: "error" });
        return;
      }
      const pub = supabase.storage.from("study-materials").getPublicUrl(filePath);
      finalPdfUrl = pub.data?.publicUrl || "";
    }
    if (!finalPdfUrl) {
      setSaving(false);
      setToast({ msg: "Add PDF URL or upload a PDF file", type: "error" });
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category_name: form.category_name || "Other",
      pdf_url: finalPdfUrl,
      logo_url: form.logo_url.trim() || null,
      language: form.language || "English",
      is_active: !!form.is_active
    };
    let error = null;
    if (editingId) {
      const updateRes = await supabase.from("study_materials").update(payload).eq("id", editingId);
      error = updateRes.error;
      if (error && String(error.message || "").toLowerCase().includes("logo_url")) {
        const retry = await supabase.from("study_materials").update({
          title: payload.title,
          description: payload.description,
          category_name: payload.category_name,
          pdf_url: payload.pdf_url,
          language: payload.language,
          is_active: payload.is_active
        }).eq("id", editingId);
        error = retry.error;
      }
    } else {
      const insertRes = await supabase.from("study_materials").insert(payload);
      error = insertRes.error;
      if (error && String(error.message || "").toLowerCase().includes("logo_url")) {
        const retry = await supabase.from("study_materials").insert({
          title: payload.title,
          description: payload.description,
          category_name: payload.category_name,
          pdf_url: payload.pdf_url,
          language: payload.language,
          is_active: payload.is_active
        });
        error = retry.error;
      }
    }
    setSaving(false);
    if (error) setToast({ msg: error.message, type: "error" });
    else {
      setToast({ msg: editingId ? "Study material updated" : "Study material added", type: "success" });
      setForm({ title: "", description: "", category_name: categories[0]?.name || "Other", pdf_url: "", logo_url: "", language: "English", is_active: true });
      setSelectedFile(null);
      setEditingId(null);
      load();
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      description: row.description || "",
      category_name: row.category_name || categories[0]?.name || "Other",
      pdf_url: row.pdf_url || "",
      logo_url: row.logo_url || "",
      language: row.language || "English",
      is_active: row.is_active !== false
    });
    setSelectedFile(null);
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await supabase.from("study_materials").delete().eq("id", id);
    load();
  };

  return (
    <div style={{ padding: 28, maxWidth: 1150 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Study Material PDFs</h2>
      <p style={{ color: "#6A8CAC", fontSize: 13, marginBottom: 20 }}>Manage downloadable category-wise PDFs.</p>

      <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Add New PDF</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm((x) => ({ ...x, title: e.target.value }))} />
            <select className="select" value={form.category_name} onChange={(e) => setForm((x) => ({ ...x, category_name: e.target.value }))}>{categories.map((row) => <option key={row.name}>{row.name}</option>)}</select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input className="input" placeholder="PDF URL (public)" value={form.pdf_url} onChange={(e) => setForm((x) => ({ ...x, pdf_url: e.target.value }))} />
            <input className="input" placeholder="Language" value={form.language} onChange={(e) => setForm((x) => ({ ...x, language: e.target.value }))} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:10,alignItems:"center"}}>
            <input className="input" type="file" accept="application/pdf,.pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            <Tag color={selectedFile ? "#34D399" : "#6A8CAC"}>{selectedFile ? selectedFile.name : "No file selected"}</Tag>
          </div>
          <input className="input" placeholder="Logo URL (optional)" value={form.logo_url} onChange={(e) => setForm((x) => ({ ...x, logo_url: e.target.value }))} style={{ marginBottom: 10 }} />
          <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm((x) => ({ ...x, description: e.target.value }))} style={{ resize: "vertical", marginBottom: 10 }} />
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-success" onClick={save} disabled={saving || uploadingFile}>{saving || uploadingFile ? (uploadingFile ? "Uploading..." : "Saving...") : editingId ? "Update PDF" : "Save PDF"}</button>
            {editingId ? <button className="btn btn-ghost" onClick={() => { setEditingId(null); setForm({ title: "", description: "", category_name: categories[0]?.name || "Other", pdf_url: "", logo_url: "", language: "English", is_active: true }); setSelectedFile(null); }}>Cancel Edit</button> : null}
          </div>
        </div>

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.id} className="tbl-row" style={{ gridTemplateColumns: "44px 1fr 120px 1fr 90px" }}>
              <div style={{display:"grid",placeItems:"center"}}>
                <SafeLogo
                  src={row.logo_url || categories.find((c)=>c.name===row.category_name)?.logo_url}
                  name={row.category_name || "PDF"}
                  color={categories.find((c)=>c.name===row.category_name)?.color_hex || "#38BDF8"}
                  size={22}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{row.title}</div>
                <div style={{ color: "#6A8CAC", fontSize: 12 }}>{row.description || "No description"}</div>
              </div>
              <Tag color="#38BDF8">{row.category_name || "Other"}</Tag>
              <div style={{ color: "#6A8CAC", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.pdf_url || "-"}</div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => startEdit(row)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => remove(row.id, row.title)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialLinksPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ platform: "", url: "", icon_text: "🔗", display_order: 100, is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_social_links").select("*").order("display_order", { ascending: true });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ platform: "", url: "", icon_text: "🔗", display_order: 100, is_active: true });
  };

  const save = async () => {
    if (!form.platform.trim() || !form.url.trim()) {
      setToast({ msg: "Platform and URL are required", type: "error" });
      return;
    }
    setSaving(true);
    const payload = {
      platform: form.platform.trim(),
      url: form.url.trim(),
      icon_text: form.icon_text.trim() || "🔗",
      display_order: Number(form.display_order) || 100,
      is_active: !!form.is_active
    };
    let res;
    if (editingId) res = await supabase.from("site_social_links").update(payload).eq("id", editingId);
    else res = await supabase.from("site_social_links").insert(payload);
    setSaving(false);
    if (res.error) setToast({ msg: res.error.message, type: "error" });
    else {
      setToast({ msg: editingId ? "Social link updated" : "Social link added", type: "success" });
      resetForm();
      load();
    }
  };

  const edit = (row) => {
    setEditingId(row.id);
    setForm({
      platform: row.platform || "",
      url: row.url || "",
      icon_text: row.icon_text || "🔗",
      display_order: row.display_order || 100,
      is_active: row.is_active !== false
    });
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete social link "${row.platform}"?`)) return;
    await supabase.from("site_social_links").delete().eq("id", row.id);
    load();
  };

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Social Media Links</h2>
      <p style={{ color: "#6A8CAC", fontSize: 13, marginBottom: 20 }}>Manage website footer social icons and links.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{editingId ? "Edit Social Link" : "Add Social Link"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 120px", gap: 10, marginBottom: 10 }}>
          <input className="input" placeholder="Platform (Instagram)" value={form.platform} onChange={(e) => setForm((x) => ({ ...x, platform: e.target.value }))} />
          <input className="input" placeholder="https://..." value={form.url} onChange={(e) => setForm((x) => ({ ...x, url: e.target.value }))} />
          <input className="input" placeholder="Icon" value={form.icon_text} onChange={(e) => setForm((x) => ({ ...x, icon_text: e.target.value }))} />
          <input className="input" type="number" placeholder="Order" value={form.display_order} onChange={(e) => setForm((x) => ({ ...x, display_order: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-success" onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Add"}</button>
          {editingId ? <button className="btn btn-ghost" onClick={resetForm}>Cancel</button> : null}
        </div>
      </div>

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.id} className="tbl-row" style={{ gridTemplateColumns: "50px 1fr 1fr 130px" }}>
              <div style={{fontSize:20,textAlign:"center"}}>{row.icon_text || "🔗"}</div>
              <div>
                <div style={{fontWeight:700}}>{row.platform}</div>
                <div style={{fontSize:12,color:"#6A8CAC"}}>Order: {row.display_order ?? 100}</div>
              </div>
              <div style={{fontSize:12,color:"#6A8CAC",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.url}</div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:6}}>
                <button className="btn btn-ghost" style={{padding:"5px 10px",fontSize:11}} onClick={() => edit(row)}>Edit</button>
                <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:11}} onClick={() => remove(row)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminUsersPage({ isSuperAdmin }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ email: "", role: "admin", is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addUser = async () => {
    if (!isSuperAdmin) return;
    const email = form.email.trim().toLowerCase();
    if (!email) {
      setToast({ msg: "Admin email is required", type: "error" });
      return;
    }
    const { error } = await supabase.from("admin_users").insert({ email, role: form.role, is_active: !!form.is_active });
    if (error) setToast({ msg: error.message, type: "error" });
    else {
      setToast({ msg: "Admin user added", type: "success" });
      setForm({ email: "", role: "admin", is_active: true });
      load();
    }
  };

  const toggleActive = async (row) => {
    if (!isSuperAdmin) return;
    await supabase.from("admin_users").update({ is_active: !row.is_active }).eq("id", row.id);
    load();
  };

  return (
    <div style={{ padding: 28, maxWidth: 980 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Admin Access Control</h2>
      <p style={{ color: "#6A8CAC", fontSize: 13, marginBottom: 20 }}>Super Admin can add and manage admin accounts.</p>

      {isSuperAdmin ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 10 }}>
            <input className="input" placeholder="admin@email.com" value={form.email} onChange={(e) => setForm((x) => ({ ...x, email: e.target.value }))} />
            <select className="select" value={form.role} onChange={(e) => setForm((x) => ({ ...x, role: e.target.value }))}>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <button className="btn btn-success" onClick={addUser}>Add Admin</button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#E8B84B18", border: "1px solid #E8B84B40", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E8B84B", marginBottom: 12 }}>
          Only Super Admin can change admin access.
        </div>
      )}

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.id} className="tbl-row" style={{ gridTemplateColumns: "1fr 140px 110px" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{row.email}</div>
                <div style={{ color: "#6A8CAC", fontSize: 12 }}>Role: {row.role || "admin"}</div>
              </div>
              <Tag color={row.role === "super_admin" ? "#A78BFA" : "#38BDF8"}>{row.role || "admin"}</Tag>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {isSuperAdmin ? <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => toggleActive(row)}>{row.is_active ? "Disable" : "Enable"}</button> : <Tag color={row.is_active ? "#34D399" : "#6A8CAC"}>{row.is_active ? "active" : "inactive"}</Tag>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function DashboardHome({setPage}){
  const[stats,setStats]=useState({questions:0,users:0,tests:0,attempts:0});
  useEffect(()=>{
    Promise.all([
      supabase.from("questions").select("id",{count:"exact",head:true}),
      supabase.from("profiles").select("id",{count:"exact",head:true}),
      supabase.from("tests").select("id",{count:"exact",head:true}),
      supabase.from("test_attempts").select("id",{count:"exact",head:true}),
    ]).then(([q,u,t,a])=>setStats({questions:q.count||0,users:u.count||0,tests:t.count||0,attempts:a.count||0}));
  },[]);
  return(
    <div style={{padding:28,maxWidth:1100}}>
      <h2 style={{fontWeight:800,fontSize:24,marginBottom:6}}>Admin Dashboard</h2>
      <p style={{color:"#6A8CAC",fontSize:13,marginBottom:28}}>mockies.in — Live platform overview</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:32}}>
        {[["❓","Questions",stats.questions,"#E8B84B"],["👥","Users",stats.users,"#38BDF8"],["📋","Tests",stats.tests,"#A78BFA"],["📝","Attempts",stats.attempts,"#34D399"]].map(([icon,label,val,color])=>(
          <div key={label} className="card fade-up">
            <div style={{fontSize:30,marginBottom:12}}>{icon}</div>
            <div style={{fontFamily:"'Fira Code',monospace",fontSize:36,fontWeight:700,color,lineHeight:1}}>{val}</div>
            <div style={{fontSize:12,color:"#6A8CAC",marginTop:8}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[
          {icon:"❓",title:"Question Bank",sub:"Add, edit, bulk upload via CSV",btn:"Manage →",color:"#E8B84B",page:"questions"},
          {icon:"📋",title:"Tests",sub:"Create and publish mock tests",btn:"Manage →",color:"#38BDF8",page:"tests"},
          {icon:"👥",title:"Users",sub:"View, add, delete students",btn:"Manage →",color:"#34D399",page:"users"},
          {icon:"🤖",title:"AI Generator",sub:"Auto-generate questions with Groq AI",btn:"Open →",color:"#A78BFA",page:"ai"},
        ].map((item,i)=>(
          <div key={i} className="card" style={{cursor:"pointer"}} onClick={()=>setPage(item.page)}>
            <div style={{fontSize:32,marginBottom:10}}>{item.icon}</div>
            <div style={{fontWeight:800,fontSize:15,marginBottom:6}}>{item.title}</div>
            <div style={{fontSize:13,color:"#6A8CAC",marginBottom:14,lineHeight:1.5}}>{item.sub}</div>
            <span style={{background:item.color+"18",color:item.color,border:`1px solid ${item.color}33`,borderRadius:8,padding:"7px 16px",fontSize:13,fontWeight:700}}>{item.btn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function AdminPanel({ allowPasswordFallback = true }) {
  const [page, setPage]       = useState("dashboard");
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [adminRole, setAdminRole] = useState("admin");
  const [accessError, setAccessError] = useState("");
  const [manualUnlocked, setManualUnlocked] = useState(false);
  const [manualPass, setManualPass] = useState("");
  const [manualError, setManualError] = useState("");

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }
      try {
        const response = await fetch("/api/admin-check", {
          method: "GET",
          headers: { Authorization: "Bearer " + session.access_token }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setAllowed(false);
          setAccessError("Access denied. Admin role required.");
        } else {
          setAllowed(true);
          setAdminRole(payload?.role || "admin");
        }
      } catch {
        setAllowed(false);
        setAccessError("Unable to verify admin access.");
      } finally {
        setChecking(false);
      }
    };
    verifyAdmin();
  }, []);

  if (checking) return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"#020408",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:40,height:40,border:"2px solid #152236",borderTopColor:"#38BDF8",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      </div>
    </>
  );

  if (!(allowed || manualUnlocked)) return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"#020408",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"#080C18",border:"1px solid #152236",borderRadius:16,padding:24,maxWidth:560,width:"100%"}}>
          <div style={{fontWeight:800,fontSize:22,marginBottom:8}}>Admin Access Blocked</div>
          <div style={{color:"#6A8CAC",fontSize:14,marginBottom:14}}>{accessError || "You are not authorized to open admin panel."}</div>
          {allowPasswordFallback && (
            <div style={{marginBottom:14,padding:12,border:"1px solid #0E1A2C",borderRadius:10,background:"#050810"}}>
              <div style={{fontSize:12,color:"#6A8CAC",marginBottom:8}}>Fallback Access (Temporary)</div>
              <input
                className="input"
                type="password"
                placeholder="Enter admin fallback password"
                value={manualPass}
                onChange={(e)=>{setManualPass(e.target.value);setManualError("");}}
                onKeyDown={(e)=>{
                  if(e.key==="Enter"){
                    if(manualPass===FALLBACK_ADMIN_PASSWORD){setManualUnlocked(true);}
                    else{setManualError("Invalid fallback password.");}
                  }
                }}
                style={{marginBottom:8}}
              />
              {manualError && <div style={{fontSize:12,color:"#F87171",marginBottom:8}}>{manualError}</div>}
              <button
                className="btn btn-primary"
                onClick={()=>{
                  if(manualPass===FALLBACK_ADMIN_PASSWORD){setManualUnlocked(true);}
                  else{setManualError("Invalid fallback password.");}
                }}
              >
                Unlock With Password
              </button>
            </div>
          )}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-ghost" onClick={()=>window.location.href="/dashboard"}>Go to Dashboard</button>
            <button className="btn btn-ghost" onClick={()=>window.location.href="/admin-direct"}>Open Separate Admin</button>
          </div>
        </div>
      </div>
    </>
  );

  const nav = [
    {id:"dashboard", icon:"⊞", label:"Dashboard"},
    {id:"questions", icon:"❓", label:"Questions"},
    {id:"tests",     icon:"📋", label:"Tests"},
    {id:"categories", icon:"🏷", label:"Categories"},
    {id:"materials", icon:"📚", label:"Study PDFs"},
    {id:"socials", icon:"🔗", label:"Social Links"},
    {id:"users",     icon:"👥", label:"Users"},
    {id:"admins",    icon:"🛡", label:"Admin Access"},
    {id:"attempts",  icon:"📊", label:"Attempts"},
    {id:"suggestions", icon:"📌", label:"Suggestions"},
    {id:"ai",        icon:"🤖", label:"AI Generator"},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",minHeight:"100vh",background:"#020408"}}>
        <aside style={{width:220,background:"#050810",borderRight:"1px solid #0E1A2C",display:"flex",flexDirection:"column",padding:"20px 12px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
          <div style={{padding:"4px 6px 22px"}}>
            <div style={{fontFamily:"'Fira Code',monospace",fontSize:14,fontWeight:600,color:"#38BDF8",letterSpacing:2.5}}>MOCKIES</div>
            <div style={{fontSize:9,color:"#253A52",letterSpacing:2,marginTop:2}}>ADMIN PANEL</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#34D39912",border:"1px solid #34D39930",borderRadius:9,padding:"8px 12px",marginBottom:18}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#34D399",animation:"pulse 2s infinite",flexShrink:0}}/>
            <span style={{fontSize:11,color:"#34D399",fontWeight:700}}>PLATFORM LIVE</span>
            <span style={{marginLeft:"auto",fontSize:10,color:adminRole==="super_admin"?"#A78BFA":"#6A8CAC",fontWeight:700}}>{adminRole==="super_admin"?"SUPER":"ADMIN"}</span>
          </div>
          <nav style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
            {nav.map(n=>(
              <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
                <span style={{fontSize:16,width:22,textAlign:"center"}}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div style={{borderTop:"1px solid #0E1A2C",paddingTop:14,display:"flex",flexDirection:"column",gap:8}}>
            <button className="btn btn-ghost" style={{width:"100%",justifyContent:"center",fontSize:12}} onClick={()=>window.location.href="/"}>View Site</button>
            <button className="btn btn-danger" style={{width:"100%",justifyContent:"center",fontSize:12}} onClick={async()=>{await supabase.auth.signOut();window.location.href="/login";}}>Sign Out</button>
          </div>
        </aside>
        <div style={{flex:1,overflowY:"auto"}} key={page} className="fade-in">
          {page==="dashboard" && <DashboardHome setPage={setPage}/>}
          {page==="questions" && <QuestionsPage/>}
          {page==="tests"     && <TestsPage/>}
          {page==="categories" && <CategoriesPage isSuperAdmin={adminRole==="super_admin"}/>}
          {page==="materials" && <StudyMaterialsAdminPage isSuperAdmin={adminRole==="super_admin"}/>}
          {page==="socials" && <SocialLinksPage/>}
          {page==="users"     && <UsersPage/>}
          {page==="admins" && <AdminUsersPage isSuperAdmin={adminRole==="super_admin"}/>}
          {page==="attempts"  && <AttemptsPage/>}
          {page==="suggestions" && <SuggestionsPage/>}
          {page==="ai"        && <AIGeneratorPage/>}
        </div>
      </div>
    </>
  );
}
