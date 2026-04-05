import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const COLORS = {
  bg: "#030508",
  panel: "#06090F",
  card: "#090E18",
  border: "#0F1C2E",
  gold: "#E8B84B",
  cyan: "#38BDF8",
  green: "#34D399",
  red: "#F87171",
  text: "#EEF2FF",
  sub: "#7090B0"
};

const QUIZ_SECONDS = 30;

function getISTDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function safeParseQuestions(content) {
  const clean = String(content || "").replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((q) => ({
      question_text: q.question_text || q.question || "",
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      correct_answer: Number.isInteger(q.correct_answer) ? q.correct_answer : -1,
      explanation: q.explanation || "",
      topic: q.topic || "General Knowledge",
      difficulty: q.difficulty || "Medium"
    }))
    .filter((q) => q.question_text && q.options.length === 4 && q.correct_answer >= 0 && q.correct_answer <= 3);
}

export default function DailyQuiz() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [alreadyAttempted, setAlreadyAttempted] = useState(null);

  const [phase, setPhase] = useState("ready");
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_SECONDS);
  const [selected, setSelected] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => getISTDate(), []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");

      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const { data: attemptData, error: attemptError } = await supabase
        .from("daily_quiz_attempts")
        .select("id, score, total, completed_at")
        .eq("user_id", currentUser.id)
        .eq("date", today)
        .maybeSingle();

      if (attemptError) {
        setError(attemptError.message);
        setLoading(false);
        return;
      }

      if (attemptData) setAlreadyAttempted(attemptData);

      const { data: existingQuestions, error: questionsError } = await supabase
        .from("daily_questions")
        .select("id, question_text, options, correct_answer, explanation, topic, difficulty")
        .eq("date", today)
        .order("id", { ascending: true });

      if (questionsError) {
        setError(questionsError.message);
        setLoading(false);
        return;
      }

      let dayQuestions = existingQuestions || [];

      if (dayQuestions.length < 20) {
        const required = 20 - dayQuestions.length;
        const prompt = `Generate exactly ${required} multiple-choice questions for Indian competitive exam aspirants.\nTopics must cover: Current Affairs, General Knowledge, History/Geography, Science/Technology, Sports/Awards, Economy.\nReturn ONLY valid JSON array with this shape:\n[{"question_text":"...","options":["A","B","C","D"],"correct_answer":0,"explanation":"...","topic":"...","difficulty":"Easy|Medium|Hard"}]\nRules:\n- Exactly 4 options\n- correct_answer must be 0-3 index\n- concise but clear explanations\n- no markdown wrapper`;

        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + accessToken
            },
            body: JSON.stringify({ prompt })
          });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || "Failed to generate daily quiz");
          }

          const generated = safeParseQuestions(payload.content).slice(0, required);

          if (generated.length > 0) {
            const inserts = generated.map((q) => ({ ...q, date: today }));
            const { error: insertError } = await supabase.from("daily_questions").insert(inserts);
            if (insertError) throw new Error(insertError.message);
          }

          const { data: refreshed, error: refreshError } = await supabase
            .from("daily_questions")
            .select("id, question_text, options, correct_answer, explanation, topic, difficulty")
            .eq("date", today)
            .order("id", { ascending: true });

          if (refreshError) throw new Error(refreshError.message);
          dayQuestions = refreshed || [];
        } catch (e) {
          setError(e.message);
        }
      }

      setQuestions(dayQuestions.slice(0, 20));
      setLoading(false);
    };

    init();
  }, [today]);

  useEffect(() => {
    if (phase !== "quiz" || showReview) return;

    if (secondsLeft <= 0) {
      handleAnswer(-1);
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, showReview, secondsLeft]);

  const current = questions[index];

  const score = useMemo(() => {
    return questions.reduce((acc, q, i) => (selected[i] === q.correct_answer ? acc + 1 : acc), 0);
  }, [questions, selected]);

  function startQuiz() {
    setPhase("quiz");
    setIndex(0);
    setSecondsLeft(QUIZ_SECONDS);
    setSelected({});
    setShowReview(false);
    setError("");
  }

  function handleAnswer(answerIndex) {
    if (phase !== "quiz") return;
    setSelected((prev) => ({ ...prev, [index]: answerIndex }));
    setShowReview(true);
  }

  function nextQuestion() {
    if (index >= questions.length - 1) {
      submitQuiz();
      return;
    }
    setIndex((v) => v + 1);
    setSecondsLeft(QUIZ_SECONDS);
    setShowReview(false);
  }

  async function submitQuiz() {
    if (!user) return;
    setSubmitting(true);

    const answers = questions.map((q, i) => ({
      question_id: q.id,
      selected_answer: selected[i] ?? -1,
      correct_answer: q.correct_answer,
      is_correct: (selected[i] ?? -1) === q.correct_answer
    }));

    const payload = {
      user_id: user.id,
      date: today,
      answers,
      score,
      total: questions.length
    };

    const { error: saveError } = await supabase.from("daily_quiz_attempts").insert(payload);

    if (saveError && !String(saveError.message || "").toLowerCase().includes("duplicate")) {
      setError(saveError.message);
      setSubmitting(false);
      return;
    }

    setPhase("result");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, display: "grid", placeItems: "center", fontFamily: "Outfit, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.gold, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: COLORS.sub }}>Loading daily quiz...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: 24, fontFamily: "Outfit, sans-serif" }}>
        <div style={{ maxWidth: 760, margin: "40px auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0, color: COLORS.red }}>Daily Quiz Error</h2>
          <p style={{ color: COLORS.sub }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, background: `linear-gradient(135deg, ${COLORS.gold}, #C89030)`, border: "none", color: "#030508", fontWeight: 800, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>Retry</button>
        </div>
      </div>
    );
  }

  if (alreadyAttempted && phase === "ready") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: 24, fontFamily: "Outfit, sans-serif" }}>
        <div style={{ maxWidth: 760, margin: "40px auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>Daily Quiz</h1>
          <p style={{ color: COLORS.sub }}>You have already attempted today&apos;s quiz ({today}).</p>
          <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
            <div style={{ color: COLORS.gold, fontWeight: 800, fontSize: 24 }}>{alreadyAttempted.score}/{alreadyAttempted.total}</div>
            <div style={{ color: COLORS.sub, marginTop: 6 }}>Come back after midnight IST for a fresh set.</div>
          </div>
          <button onClick={() => (window.location.href = "/dashboard")} style={{ marginTop: 18, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.text, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: 24, fontFamily: "Outfit, sans-serif" }}>
        <div style={{ maxWidth: 860, margin: "20px auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 24 }}>
          <h1 style={{ margin: 0 }}>Daily Quiz Challenge</h1>
          <p style={{ color: COLORS.sub, marginTop: 10 }}>20 AI-generated questions. 30 seconds per question. Attempt once per day.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 16 }}>
            {[
              "Current Affairs",
              "General Knowledge",
              "History/Geography",
              "Science/Technology",
              "Sports/Awards",
              "Economy"
            ].map((topic) => (
              <div key={topic} style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, color: COLORS.sub, borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
                {topic}
              </div>
            ))}
          </div>
          <button onClick={startQuiz} disabled={questions.length === 0} style={{ marginTop: 20, width: "100%", background: `linear-gradient(135deg, ${COLORS.gold}, #C89030)`, border: "none", color: "#030508", fontWeight: 800, padding: "14px 16px", borderRadius: 12, cursor: "pointer", fontSize: 15 }}>
            Start Today&apos;s Quiz
          </button>
        </div>
      </div>
    );
  }

  if (phase === "quiz" && current) {
    const picked = selected[index];
    const correctIndex = current.correct_answer;

    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: 24, fontFamily: "Outfit, sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "10px auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
            <div style={{ color: COLORS.sub }}>Question {index + 1} of {questions.length}</div>
            <div style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${secondsLeft <= 10 ? COLORS.red : COLORS.border}`, color: secondsLeft <= 10 ? COLORS.red : COLORS.cyan, fontWeight: 700 }}>
              {secondsLeft}s
            </div>
          </div>

          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ color: COLORS.gold, fontSize: 12, marginBottom: 8 }}>{current.topic} • {current.difficulty}</div>
            <h2 style={{ marginTop: 0, lineHeight: 1.45, fontSize: 22 }}>{current.question_text}</h2>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              {current.options.map((option, i) => {
                const isChosen = picked === i;
                const isCorrect = correctIndex === i;
                const reviewed = showReview;

                let border = COLORS.border;
                let bg = COLORS.panel;
                let color = COLORS.text;

                if (reviewed && isCorrect) {
                  border = `${COLORS.green}88`;
                  bg = `${COLORS.green}22`;
                  color = COLORS.green;
                } else if (reviewed && isChosen && !isCorrect) {
                  border = `${COLORS.red}88`;
                  bg = `${COLORS.red}22`;
                  color = COLORS.red;
                } else if (!reviewed && isChosen) {
                  border = `${COLORS.cyan}88`;
                  bg = `${COLORS.cyan}16`;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={showReview}
                    style={{ textAlign: "left", background: bg, border: `1px solid ${border}`, color, borderRadius: 12, padding: "12px 14px", cursor: showReview ? "default" : "pointer", fontSize: 14 }}
                  >
                    <strong style={{ marginRight: 8 }}>{["A", "B", "C", "D"][i]}.</strong>
                    {option}
                  </button>
                );
              })}
            </div>

            {showReview && (
              <div style={{ marginTop: 16, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: selected[index] === correctIndex ? COLORS.green : COLORS.red }}>
                  {selected[index] === correctIndex ? "Correct" : "Incorrect"}
                </div>
                <div style={{ color: COLORS.sub, lineHeight: 1.6 }}>{current.explanation}</div>
                <button onClick={nextQuestion} disabled={submitting} style={{ marginTop: 12, background: `linear-gradient(135deg, ${COLORS.gold}, #C89030)`, border: "none", color: "#030508", fontWeight: 800, padding: "10px 16px", borderRadius: 10, cursor: "pointer" }}>
                  {index === questions.length - 1 ? (submitting ? "Submitting..." : "Finish Quiz") : "Next Question"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, padding: 24, fontFamily: "Outfit, sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "10px auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Daily Quiz Results</h1>
        <div style={{ fontSize: 34, color: COLORS.gold, fontWeight: 800 }}>{score}/{questions.length}</div>
        <div style={{ color: COLORS.sub, marginTop: 6 }}>Accuracy: {questions.length ? Math.round((score / questions.length) * 100) : 0}%</div>

        <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
          {questions.map((q, i) => {
            const chosen = selected[i] ?? -1;
            const ok = chosen === q.correct_answer;
            return (
              <div key={q.id || i} style={{ background: COLORS.panel, border: `1px solid ${ok ? `${COLORS.green}55` : COLORS.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ color: COLORS.sub, fontSize: 12 }}>Q{i + 1} • {q.topic}</div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>{q.question_text}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: ok ? COLORS.green : COLORS.red }}>
                  Your answer: {chosen >= 0 ? ["A", "B", "C", "D"][chosen] : "Not answered"} | Correct: {["A", "B", "C", "D"][q.correct_answer]}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: COLORS.sub, lineHeight: 1.5 }}>{q.explanation}</div>
              </div>
            );
          })}
        </div>

        <button onClick={() => (window.location.href = "/dashboard")} style={{ marginTop: 18, background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.text, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
