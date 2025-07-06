// client/src/App.tsx
import { useState } from "react";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("Arrays");
  const [difficulty, setDifficulty] = useState("Easy");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const getQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });

      const data = await res.json();
      setQuestion(data.question);
    } catch (error) {
      setQuestion("❌ Failed to fetch question. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Tech Interview Prep Assistant</h1>

      <label>
        Topic:
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="Arrays">Arrays</option>
          <option value="Graphs">Graphs</option>
          <option value="Strings">Strings</option>
          <option value="Trees">Trees</option>
        </select>
      </label>

      <label>
        Difficulty:
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>

      <button onClick={getQuestion} disabled={loading}>
        {loading ? "Loading..." : "Get Question"}
      </button>

      {question && (
        <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
          <strong>Question:</strong>
          <p>{question}</p>
        </div>
      )}
    </div>
  );
}

export default App;

