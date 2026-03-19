import { useState } from "react";
import { supabase } from "../lib/supabase";

const GEMINI_KEY = "AIzaSyCkkBsY3geN03-d7WhNWF8Jpwf-UxyUi60";

export default function AIQuestionGenerator() {
  const [exam, setExam] = useState("SSC");
  const [subject, setSubject] = useState("Quantitative Aptitude");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const SUBJECTS = {
    SSC: ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
    UPSC: ["History", "Geography", "Polity", "Economics", "General Science"],
    JEE: ["Physics", "Chemistry", "Mathematics"],
    Banking: ["Quantitative Aptitude", "Reasoning", "English", "General Awareness", "Computer Knowledge"],
  };

  const generateQuestions = async () => {
    if (!topic) { setError("Please enter a topic!"); return; }
    setLoading(true);
    setError("");
    setMessage("");
    setQuestions([]);

    const prompt = `Generate exactly ${count} multiple choice questions for ${exam} exam.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY a valid JSON array. No extra text before or after. Format:
[
  {
    "question": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correct_answer": 0,
    "explanation": "explanation why this answer is correct"
  }
]
correct_answer is the index (0,1,2,3) of the correct option.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await response.json();
      if (!data.candidates) {
        setError("❌ Gemini API error: " + JSON.stringify(data));
        setLoading(false);
        return;
      }
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed.map(q => ({ ...q, exam, subject, topic, difficulty })));
      setMessage(`✅ ${parsed.length} questions generated! Review them below then save.`);
    } catch (err) {
      setError("❌ Error: " + err.message);
    }
    setLoading(false);
  };

  const saveToDatabase = async () => {
    setSaving(true);
    setError("");
    try {
      const toInsert = questions.map(q => ({
        exam: q.exam,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        question_text: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        status: "active"
      }));
      const { error } = await supabase.from("questions").insert(toInsert);
      if (error) setError("❌ Save error: " + error.message);
      else {
        setMessage(`🎉 ${questions.length} questions saved to database successfully!`);
        setQuestions([]);
      }
    } catch (err) {
      setError("❌ Something went wrong: " + err.message);
    }
    setSaving(false);
  };

  const removeQuestion = (index) => {
    setQuestions(qs => qs.filter((_, i) => i !== index));
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Fira+Code:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; background: #030508; color: #EEF2FF; }
    .wrap { max-width: 900px; margin: 0 auto; padding: 32px 20px; }
    .title { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
    .gold { color: #E8B84B; }
    .sub { color: #7090B0; font-size: 14px; margin-bottom: 28px; }
    .card { background: #090E18; border: 1px solid #0F1C2E; border-radius: 18px; padding: 24px; margin-bottom: 20px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 4px; }
    .label { font-size: 12px; font-weight: 700; color: #7090B0; margin-bottom: 8px; display: block; letter-spacing: 0.5px; }
    .input, .select {
      width: 100%; background: #030508; border: 1.5px solid #162840;
      border-radius: 10px; padding: 11px 14px; color: #EEF2FF;
      font-family: 'Outfit', sans-serif; font-size: 14px; outline: none;
      transition: border-color 0.2s;
    }
    .input:focus, .select:focus { border-color: #E8B84B88; }
    .select option { background: #090E18; }
    .btn-main {
      width: 100%; padding: 14px; margin-top: 20px;
      background: linear-gradient(135deg, #E8B84B, #C89030);
      border: none; border-radius: 12px; color: #030508;
      font-family: 'Outfit', sans-serif; font-size: 15px;
      font-weight: 800; cursor: pointer; transition: opacity 0.2s;
    }
    .btn-main:hover { opacity: 0.9; }
    .btn-main:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-save {
      width: 100%; padding: 14px; margin-top: 12px;
      background: linear-gradient(135deg, #34D399, #059669);
      border: none; border-radius: 12px; color: #030508;
      font-family: 'Outfit', sans-serif; font-size: 15px;
      font-weight: 800; cursor: pointer; transition: opacity 0.2s;
    }
    .btn-save:hover { opacity: 0.9; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { background: #F8717122; border: 1px solid #F8717144; border-radius: 10px; padding: 12px 16px; color: #F87171; font-size: 13px; margin-bottom: 16px; }
    .success { background: #34D39922; border: 1px solid #34D39944; border-radius: 10px; padding: 12px 16px; color: #34D399; font-size: 13px; margin-bottom: 16px; }
    .q-card { background: #06090F; border: 1px solid #0F1C2E; border-radius: 14px; padding: 20px; margin-bottom: 12px; }
    .q-num { font-family: 'Fira Code', monospace; font-size: 11px; color: #7090B0; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .q-text { font-size: 15px; font-weight: 600; margin-bottom: 14px; line-height: 1.5; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .option { padding: 9px 14px; border-radius: 8px; font-size: 13px; border: 1px solid #0F1C2E; background: #090E18; }
    .option.correct { border-color: #34D39944; background: #34D39918; color: #34D399; font-weight: 700; }
    .explanation { font-size: 12px; color: #7090B0; padding: 10px 14px; background: #090E18; border-radius: 8px; border-left: 3px solid #E8B84B; line-height: 1.5; }
    .remove-btn { margin-left: auto; background: #F8717118; border: 1px solid #F8717133; color: #F87171; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; }
    .loading { text-align: center; padding: 40px; color: #7090B0; }
    .spinner { display: inline-block; width: 40px; height: 40px; border: 3px solid #0F1C2E; border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .back-btn { background: transparent; border: 1px solid #162840; color: #7090B0; padding: 8px 16px; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; margin-bottom: 24px; transition: all 0.2s; }
    .back-btn:hover { border-color: #E8B84B44; color: #E8B84B; }
    .tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .section-title { font-weight: 700; font-size: 16px; margin-bottom: 6px; }
    .section-sub { font-size: 12px; color: #7090B0; margin-bottom: 20px; }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <button className="back-btn" onClick={() => window.location.href = "/admin"}>
          ← Back to Admin
        </button>

        <div className="title">🤖 AI Question <span className="gold">Generator</span></div>
        <div className="sub">Generate exam-ready questions instantly using Google Gemini AI</div>

        {/* Config Card */}
        <div className="card">
          <div className="section-title">Configure Your Questions</div>
          <div className="section-sub">Choose exam, subject, topic and how many questions to generate</div>

          <div className="grid2">
            <div>
              <label className="label">TARGET EXAM</label>
              <select className="select" value={exam} onChange={e => {
                setExam(e.target.value);
                setSubject(SUBJECTS[e.target.value][0]);
              }}>
                <option>SSC</option>
                <option>UPSC</option>
                <option>JEE</option>
                <option>Banking</option>
              </select>
            </div>
            <div>
              <label className="label">SUBJECT</label>
              <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
                {SUBJECTS[exam].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid3">
            <div>
              <label className="label">TOPIC *</label>
              <input
                className="input"
                placeholder="e.g. Algebra, Syllogism..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="label">DIFFICULTY</label>
              <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="label">NO. OF QUESTIONS</label>
              <select className="select" value={count} onChange={e => setCount(+e.target.value)}>
                <option>5</option>
                <option>10</option>
                <option>15</option>
                <option>20</option>
              </select>
            </div>
          </div>

          <button className="btn-main" onClick={generateQuestions} disabled={loading}>
            {loading ? "⏳ Generating with AI..." : "✨ Generate Questions with AI"}
          </button>
        </div>

        {/* Messages */}
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {/* Loading spinner */}
        {loading && (
          <div className="loading">
            <div><div className="spinner"></div></div>
            <div style={{ fontWeight: 600 }}>AI is generating your questions...</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>This usually takes 5–10 seconds</div>
          </div>
        )}

        {/* Generated Questions */}
        {questions.length > 0 && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div className="section-title">📋 Review Questions</div>
                <div className="section-sub">{questions.length} questions generated — remove any you don't want before saving</div>
              </div>
            </div>

            {questions.map((q, i) => (
              <div className="q-card" key={i}>
                <div className="q-num">
                  <span>QUESTION {i + 1}</span>
                  <span className="tag" style={{ background: "#E8B84B18", color: "#E8B84B", border: "1px solid #E8B84B33" }}>
                    {q.difficulty}
                  </span>
                  <span className="tag" style={{ background: "#38BDF818", color: "#38BDF8", border: "1px solid #38BDF833" }}>
                    {q.topic}
                  </span>
                  <button className="remove-btn" onClick={() => removeQuestion(i)}>✕ Remove</button>
                </div>
                <div className="q-text">{q.question}</div>
                <div className="options">
                  {q.options.map((opt, j) => (
                    <div key={j} className={`option${j === q.correct_answer ? " correct" : ""}`}>
                      <strong>{["A", "B", "C", "D"][j]}.</strong> {opt}
                      {j === q.correct_answer && " ✓"}
                    </div>
                  ))}
                </div>
                <div className="explanation">💡 <strong>Explanation:</strong> {q.explanation}</div>
              </div>
            ))}

            <button className="btn-save" onClick={saveToDatabase} disabled={saving}>
              {saving ? "💾 Saving to database..." : `💾 Save All ${questions.length} Questions to Database`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}