import { useState } from "react";
import "./App.css";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Mobile App Developer",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Cybersecurity Analyst",
  "Technical Support",
  "Business Analyst",
  "Network Engineer",
];

type Question = {
  type: string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  starterCode?: string;
};

type EvaluationItem = {
  question: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
};

function App() {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationItem[]>([]);

  // Use env variable in production, fallback to relative path for dev
  const API_BASE =
    import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL !== ""
      ? import.meta.env.VITE_BACKEND_URL
      : "";

  const getInterviewQuestions = async () => {
    if (!role) {
      alert("Please select a job role.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/interview-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });

      if (!res.ok) {
        let errMsg = `HTTP error! status: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch {}
        setError(errMsg);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setAnswers({});
        setSubmitted(false);
        setScore(null);
        setEvaluation([]);
      } else {
        setError("❌ Failed to load questions.");
        setQuestions([]);
      }
    } catch (error: any) {
      setError("❌ Network or server error. Please try again.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Submit answers to backend for evaluation
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `HTTP error! status: ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setScore(data.score);
      setSubmitted(true);
      setEvaluation(data.evaluation || []);
    } catch (err) {
      setError("Failed to submit answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f5f7fa",
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 900 }}>
        <h1>🧠 Tech Interview Prep Assistant</h1>

        <div style={{ margin: "1rem 0" }}>
          <label>
            <strong>Job Role:</strong>{" "}
            <input
              list="roles"
              placeholder="Start typing a role..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: "0.5rem",
                width: "250px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                color: "#222",
                background: "#fff",
              }}
            />
            <datalist id="roles">
              {roles.map((r, i) => (
                <option key={i} value={r} />
              ))}
            </datalist>
          </label>
        </div>

        <div style={{ margin: "1rem 0" }}>
          <label>
            <strong>Difficulty:</strong>{" "}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                color: "#222",
                background: "#fff",
              }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
        </div>

        <button
          onClick={getInterviewQuestions}
          disabled={loading}
          style={{
            padding: "0.7rem 1.5rem",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1rem",
          }}
        >
          {loading ? "Loading..." : "Start Test"}
        </button>

        {error && (
          <div style={{ color: "red", marginTop: "2rem" }}>
            <strong>{error}</strong>
          </div>
        )}

        {questions.length > 0 && (
          <div
            style={{
              marginTop: "2rem",
              width: "100%",
            }}
          >
            <h2 style={{ color: "#222" }}>📝 Questions:</h2>
            <ol style={{ listStyle: "none", padding: 0 }}>
              {questions.map((q, i) => {
                const evalItem = evaluation[i];
                return (
                  <li
                    key={i}
                    style={{
                      marginBottom: "2rem",
                      padding: "1.5rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "10px",
                      background: "#fafbfc",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      color: "#222",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Q{i + 1}: {q.content}
                    </div>

                    {/* Multiple-choice */}
                    {q.type === "multiple-choice" && q.options && (
                      <ul style={{ paddingLeft: 0 }}>
                        {q.options.map((opt, j) => (
                          <li
                            key={j}
                            style={{
                              marginBottom: "0.5rem",
                              listStyle: "none",
                              color: "#222",
                            }}
                          >
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <input
                                type="radio"
                                name={`question-${i}`}
                                value={opt}
                                checked={answers[i] === opt}
                                onChange={() =>
                                  setAnswers((prev) => ({ ...prev, [i]: opt }))
                                }
                                disabled={submitted}
                                style={{ accentColor: "#1976d2" }}
                              />
                              <span>{opt}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Coding */}
                    {q.type === "coding" && (
                      <>
                        <textarea
                          rows={6}
                          style={{
                            width: "100%",
                            fontFamily: "monospace",
                            border: "1px solid #bdbdbd",
                            borderRadius: "6px",
                            padding: "0.75rem",
                            background: "#fff",
                            fontSize: "1rem",
                            marginTop: "0.5rem",
                            marginBottom: "0.5rem",
                            boxSizing: "border-box",
                            resize: "vertical",
                            color: "#222",
                          }}
                          value={answers[i] || ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [i]: e.target.value,
                            }))
                          }
                          placeholder={q.starterCode || "// Write your code here"}
                          disabled={submitted}
                        />
                      </>
                    )}

                    {/* Open-ended */}
                    {q.type === "open-ended" && (
                      <>
                        <textarea
                          rows={4}
                          style={{
                            width: "100%",
                            border: "1px solid #bdbdbd",
                            borderRadius: "6px",
                            padding: "0.75rem",
                            background: "#fff",
                            fontSize: "1rem",
                            marginTop: "0.5rem",
                            marginBottom: "0.5rem",
                            boxSizing: "border-box",
                            resize: "vertical",
                            color: "#222",
                          }}
                          value={answers[i] || ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [i]: e.target.value,
                            }))
                          }
                          placeholder="Type your answer here..."
                          disabled={submitted}
                        />
                      </>
                    )}

                    {/* Show evaluation results */}
                    {submitted && evalItem && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          background: evalItem.isCorrect ? "#f1f8e9" : "#ffebee",
                          border: evalItem.isCorrect
                            ? "1px solid #c5e1a5"
                            : "1px solid #ef9a9a",
                          color: evalItem.isCorrect ? "#33691e" : "#b71c1c",
                        }}
                      >
                        <div>
                          <strong>
                            {evalItem.isCorrect ? "✔ Correct!" : "✖ Incorrect"}
                          </strong>
                        </div>
                        <div>
                          <strong>Your Answer:</strong>{" "}
                          {evalItem.userAnswer || "(No answer)"}
                        </div>
                        <div>
                          <strong>Correct Answer:</strong>{" "}
                          {evalItem.correctAnswer || "N/A"}
                        </div>
                        {evalItem.explanation && (
                          <div>
                            <strong>Explanation:</strong> {evalItem.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  marginTop: "1rem",
                  padding: "0.7rem 1.5rem",
                  background: "#388e3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Submitting..." : "Submit Answers"}
              </button>
            )}
            {submitted && score !== null && (
              <div
                style={{
                  marginTop: "1.5rem",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#1976d2",
                }}
              >
                ✅ You got {score} out of {questions.length} questions correct!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;










