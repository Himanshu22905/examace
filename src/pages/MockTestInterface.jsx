import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Outfit',sans-serif;background:#030508;color:#EEF2FF;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#030508;} ::-webkit-scrollbar-thumb{background:#162840;border-radius:2px;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  @keyframes timerWarn{0%,100%{background:#F8717122;}50%{background:#F8717144;}}
  .fade-in{animation:fadeIn 0.35s ease forwards;}
  .spinner{display:inline-block;width:40px;height:40px;border:3px solid #162840;border-top-color:#E8B84B;border-radius:50%;animation:spin 0.9s linear infinite;}
  .opt-btn{
    width:100%;padding:14px 18px;border-radius:12px;border:1.5px solid #0F1C2E;
    background:#06090F;color:#EEF2FF;font-family:'Outfit',sans-serif;
    font-size:15px;font-weight:500;cursor:pointer;text-align:left;
    transition:all 0.18s;display:flex;align-items:center;gap:12px;
  }
  .opt-btn:hover{border-color:#E8B84B44;background:#0C1220;}
  .opt-btn.selected{border-color:#E8B84B;background:#E8B84B14;color:#EEF2FF;font-weight:700;}
  .opt-btn.correct{border-color:#34D399;background:#34D39918;color:#34D399;font-weight:700;}
  .opt-btn.wrong{border-color:#F87171;background:#F8717118;color:#F87171;font-weight:700;}
  .q-palette-btn{
    width:34px;height:34px;border-radius:8px;border:none;
    font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
    cursor:pointer;transition:all 0.15s;
  }
  .q-palette-btn:hover{transform:scale(1.1);}
  .btn{padding:10px 22px;border-radius:10px;border:none;font-family:'Outfit',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.15s;}
  .btn:hover{transform:translateY(-1px);}
  .btn-gold{background:linear-gradient(135deg,#E8B84B,#C89030);color:#030508;}
  .btn-ghost{background:transparent;border:1px solid #162840;color:#7090B0;}
  .btn-ghost:hover{border-color:#E8B84B44;color:#E8B84B;}
  .btn-danger{background:#F8717122;border:1px solid #F8717133;color:#F87171;}
`;

export default function MockTestInterface() {
  const [phase, setPhase]         = useState("loading"); // loading | tests | pre | exam | result
  const [tests, setTests]         = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState({});
  const [marked, setMarked]       = useState({});
  const [timeLeft, setTimeLeft]   = useState(0);
  const [result, setResult]       = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [saving, setSaving]       = useState(false);
  const timerRef = useRef(null);

  // Load available tests on mount
  useEffect(() => {
    const loadTests = async () => {
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("status", "published")
        .order("id", { ascending: false });
      if (!error && data) setTests(data);
      setPhase("tests");
    };
    loadTests();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const loadTest = async (test) => {
    setSelectedTest(test);
    setPhase("loading");
    const ids = test.question_ids;
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .in("id", ids);
    if (error || !data) { alert("Error loading questions!"); setPhase("tests"); return; }
    // Sort by original order
    const sorted = ids.map(id => data.find(q => q.id === id)).filter(Boolean);
    setQuestions(sorted);
    setAnswers({});
    setMarked({});
    setCurrent(0);
    setTimeLeft(test.time_limit * 60);
    setPhase("pre");
  };

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    setShowSubmit(false);
    setSaving(true);

    let correct = 0, wrong = 0, skipped = 0;
    const detailed = questions.map((q, i) => {
      const ans = answers[i];
      if (ans === undefined) { skipped++; return { ...q, userAnswer: null, isCorrect: false }; }
      if (ans === q.correct_answer) { correct++; return { ...q, userAnswer: ans, isCorrect: true }; }
      wrong++;
      return { ...q, userAnswer: ans, isCorrect: false };
    });

    const score    = correct * 2 - wrong * 0.5;
    const maxScore = questions.length * 2;
    const accuracy = Math.round((correct / (correct + wrong || 1)) * 100);

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("test_attempts").insert({
        user_id:    user.id,
        test_id:    selectedTest.id,
        answers:    answers,
        score:      Math.round(score * 10) / 10,
        accuracy:   accuracy,
        time_taken: selectedTest.time_limit * 60 - timeLeft,
      });
    }

    setResult({ correct, wrong, skipped, score: Math.round(score * 10) / 10, maxScore, accuracy, detailed });
    setSaving(false);
    setPhase("result");
  };

  const timerColor = timeLeft < 60 ? "#F87171" : timeLeft < 300 ? "#FB923C" : "#34D399";

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (phase === "loading") return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#030508", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div className="spinner" />
        <div style={{ color: "#7090B0", fontSize: 14 }}>Loading...</div>
      </div>
    </>
  );

  // ── TEST LIST ─────────────────────────────────────────────────────────────────
  if (phase === "tests") return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#030508", padding: "40px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <button className="btn btn-ghost" style={{ marginBottom: 24, fontSize: 13 }} onClick={() => window.location.href = "/dashboard"}>← Back to Dashboard</button>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#7090B0", letterSpacing: 2.5, marginBottom: 8 }}>EXAMACE · TEST CENTRE</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Available <span style={{ color: "#E8B84B" }}>Mock Tests</span></h1>
          <p style={{ color: "#7090B0", fontSize: 14, marginBottom: 32 }}>Choose a test to begin your preparation</p>

          {tests.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80, background: "#090E18", borderRadius: 20, border: "1px solid #0F1C2E" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No tests available yet</div>
              <div style={{ color: "#7090B0", fontSize: 14 }}>Ask your admin to publish a test</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tests.map((test, i) => (
                <div key={test.id} className="fade-in" style={{ animationDelay: `${i * 0.07}s`, background: "#090E18", border: "1px solid #0F1C2E", borderRadius: 18, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#E8B84B44"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#0F1C2E"}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{test.name}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {[
                        [test.exam,         "#E8B84B"],
                        [test.type,         "#38BDF8"],
                        [`⏱ ${test.time_limit} min`, "#7090B0"],
                        [`📝 ${Array.isArray(test.question_ids) ? test.question_ids.length : JSON.parse(test.question_ids || "[]").length} Qs`, "#7090B0"],
                      ].map(([l, c]) => (
                        <span key={l} style={{ background: c + "18", color: c, border: `1px solid ${c}33`, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-gold" style={{ flexShrink: 0, marginLeft: 20 }} onClick={() => loadTest(test)}>
                    Start Test →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ── PRE-EXAM ──────────────────────────────────────────────────────────────────
  if (phase === "pre") return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#030508", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 580, width: "100%", background: "#090E18", border: "1px solid #0F1C2E", borderRadius: 24, padding: 36 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#E8B84B", letterSpacing: 2, marginBottom: 10 }}>EXAM INSTRUCTIONS</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{selectedTest?.name}</h2>
          <p style={{ color: "#7090B0", fontSize: 13, marginBottom: 28 }}>Read all instructions carefully before starting</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              ["📝", "Questions", questions.length],
              ["⏱", "Time Limit", `${selectedTest?.time_limit} min`],
              ["✅", "Correct", "+2 marks"],
              ["❌", "Wrong", "−0.5 marks"],
            ].map(([icon, l, v]) => (
              <div key={l} style={{ background: "#06090F", border: "1px solid #0F1C2E", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: "#E8B84B" }}>{v}</div>
                <div style={{ fontSize: 12, color: "#7090B0", marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#06090F", border: "1px solid #E8B84B22", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#E8B84B", marginBottom: 10 }}>📌 Instructions</div>
            {[
              "Each correct answer gives +2 marks",
              "Each wrong answer deducts 0.5 marks",
              "Skipped questions have no penalty",
              "You can mark questions for review",
              "Timer starts when you click Start",
              "Results are saved automatically",
            ].map((ins, i) => (
              <div key={i} style={{ fontSize: 13, color: "#7090B0", marginBottom: 6, display: "flex", gap: 8 }}>
                <span style={{ color: "#34D399", flexShrink: 0 }}>✓</span> {ins}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setPhase("tests")}>← Back</button>
            <button className="btn btn-gold" style={{ flex: 2, fontSize: 15 }} onClick={() => setPhase("exam")}>
              🚀 Start Exam
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── EXAM ──────────────────────────────────────────────────────────────────────
  if (phase === "exam") {
    const q = questions[current];
    const userAns = answers[current];

    return (
      <>
        <style>{CSS}</style>
        {showSubmit && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(3,5,8,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <div style={{ background: "#090E18", border: "1px solid #162840", borderRadius: 20, padding: 32, maxWidth: 440, width: "100%" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Submit Test?</div>
              <div style={{ color: "#7090B0", fontSize: 14, marginBottom: 20 }}>Your progress will be saved and you can see your results.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  [Object.keys(answers).length, "Answered", "#34D399"],
                  [questions.length - Object.keys(answers).length - Object.keys(marked).length, "Skipped", "#F87171"],
                  [Object.keys(marked).length, "Marked", "#A78BFA"],
                ].map(([v, l, c]) => (
                  <div key={l} style={{ background: "#06090F", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 11, color: "#7090B0", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowSubmit(false)}>Continue</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={() => handleSubmit(false)}>Submit Now</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ minHeight: "100vh", background: "#030508", display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div style={{ background: "#06090F", borderBottom: "1px solid #0F1C2E", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedTest?.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: timerColor, background: timerColor + "18", border: `1px solid ${timerColor}33`, padding: "6px 16px", borderRadius: 10, animation: timeLeft < 60 ? "timerWarn 1s infinite" : "none" }}>
              ⏱ {formatTime(timeLeft)}
            </div>
            <button className="btn btn-danger" onClick={() => setShowSubmit(true)}>Submit Test</button>
          </div>

          <div style={{ display: "flex", flex: 1, gap: 0 }}>
            {/* Question area */}
            <div style={{ flex: 1, padding: "28px 32px", maxWidth: 760 }} key={current} className="fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#7090B0" }}>
                  QUESTION {current + 1} <span style={{ color: "#253A52" }}>/ {questions.length}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ background: "#38BDF818", color: "#38BDF8", border: "1px solid #38BDF833", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{q.subject}</span>
                  <span style={{ background: q.difficulty === "Easy" ? "#34D39918" : q.difficulty === "Hard" ? "#F8717118" : "#E8B84B18", color: q.difficulty === "Easy" ? "#34D399" : q.difficulty === "Hard" ? "#F87171" : "#E8B84B", border: "1px solid transparent", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{q.difficulty}</span>
                </div>
              </div>

              <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.6, marginBottom: 28, padding: "20px 24px", background: "#06090F", borderRadius: 16, border: "1px solid #0F1C2E" }}>
                {q.question_text}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {q.options.map((opt, i) => (
                  <button key={i} className={`opt-btn${userAns === i ? " selected" : ""}`} onClick={() => setAnswers(a => ({ ...a, [current]: i }))}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: userAns === i ? "#E8B84B" : "#0F1C2E", color: userAns === i ? "#030508" : "#7090B0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, transition: "all 0.18s" }}>
                      {["A","B","C","D"][i]}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }} disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>← Prev</button>
                  <button className="btn" style={{ fontSize: 13, background: marked[current] ? "#A78BFA22" : "transparent", color: marked[current] ? "#A78BFA" : "#7090B0", border: `1px solid ${marked[current] ? "#A78BFA44" : "#162840"}` }}
                    onClick={() => setMarked(m => ({ ...m, [current]: !m[current] }))}>
                    {marked[current] ? "🔖 Marked" : "🔖 Mark"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {userAns !== undefined && (
                    <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setAnswers(a => { const n = { ...a }; delete n[current]; return n; })}>Clear</button>
                  )}
                  {current < questions.length - 1 ? (
                    <button className="btn btn-gold" onClick={() => setCurrent(c => c + 1)}>Next →</button>
                  ) : (
                    <button className="btn btn-gold" onClick={() => setShowSubmit(true)}>Submit Test →</button>
                  )}
                </div>
              </div>
            </div>

            {/* Question palette */}
            <div style={{ width: 220, background: "#06090F", borderLeft: "1px solid #0F1C2E", padding: "20px 16px", overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7090B0", letterSpacing: 1.2, marginBottom: 14 }}>QUESTION PALETTE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {questions.map((_, i) => {
                  const isAns = answers[i] !== undefined;
                  const isMark = marked[i];
                  const isCurr = i === current;
                  let bg = "#0F1C2E", color = "#7090B0";
                  if (isCurr)  { bg = "#E8B84B"; color = "#030508"; }
                  else if (isMark && isAns) { bg = "#A78BFA"; color = "#030508"; }
                  else if (isMark) { bg = "#A78BFA44"; color = "#A78BFA"; }
                  else if (isAns)  { bg = "#34D399"; color = "#030508"; }
                  return (
                    <button key={i} className="q-palette-btn" style={{ background: bg, color }} onClick={() => setCurrent(i)}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["#34D399","Answered"],["#F87171","Not answered"],["#A78BFA","Marked"],["#E8B84B","Current"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#7090B0" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────────
  if (phase === "result") {
    const pct = Math.round((result.score / result.maxScore) * 100);
    const grade = pct >= 80 ? ["🏆","Excellent!","#34D399"] : pct >= 60 ? ["🎯","Good Job!","#E8B84B"] : pct >= 40 ? ["📚","Keep Practicing","#FB923C"] : ["💪","Don't Give Up!","#F87171"];

    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: "100vh", background: "#030508", padding: "40px 20px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>

            {/* Score card */}
            <div style={{ background: "#090E18", border: `1px solid ${grade[2]}33`, borderRadius: 24, padding: 36, textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>{grade[0]}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: grade[2], marginBottom: 4 }}>{grade[1]}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 52, fontWeight: 700, color: "#EEF2FF", lineHeight: 1, marginBottom: 4 }}>
                {result.score}
                <span style={{ fontSize: 22, color: "#7090B0" }}>/{result.maxScore}</span>
              </div>
              <div style={{ fontSize: 14, color: "#7090B0", marginBottom: 28 }}>{selectedTest?.name}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[
                  [result.correct,  "Correct",  "#34D399"],
                  [result.wrong,    "Wrong",    "#F87171"],
                  [result.skipped,  "Skipped",  "#7090B0"],
                  [result.accuracy+"%","Accuracy","#E8B84B"],
                ].map(([v, l, c]) => (
                  <div key={l} style={{ background: "#06090F", borderRadius: 12, padding: "14px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 12, color: "#7090B0", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {saving && (
              <div style={{ textAlign: "center", color: "#7090B0", marginBottom: 16, fontSize: 13 }}>
                💾 Saving your result...
              </div>
            )}

            {/* Solutions */}
            <div style={{ background: "#090E18", border: "1px solid #0F1C2E", borderRadius: 20, padding: 28, marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📖 Solutions & Explanations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {result.detailed.map((q, i) => (
                  <div key={i} style={{ background: "#06090F", border: `1px solid ${q.isCorrect ? "#34D39933" : q.userAnswer === null ? "#162840" : "#F8717133"}`, borderRadius: 14, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#7090B0" }}>Q{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: q.isCorrect ? "#34D399" : q.userAnswer === null ? "#7090B0" : "#F87171" }}>
                        {q.isCorrect ? "✓ Correct +2" : q.userAnswer === null ? "— Skipped" : "✗ Wrong −0.5"}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>{q.question_text}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                      {q.options.map((opt, j) => (
                        <div key={j} className={`opt-btn${j === q.correct_answer ? " correct" : j === q.userAnswer && !q.isCorrect ? " wrong" : ""}`} style={{ cursor: "default", fontSize: 13, padding: "8px 12px" }}>
                          <span style={{ fontWeight: 800, marginRight: 6 }}>{["A","B","C","D"][j]}.</span>{opt}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#090E18", borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #E8B84B", fontSize: 12, color: "#7090B0", lineHeight: 1.5 }}>
                      💡 {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => window.location.href = "/dashboard"}>← Dashboard</button>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => { setPhase("tests"); setResult(null); }}>Take Another Test →</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}