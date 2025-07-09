// Load environment variables from .env
require('dotenv').config();
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY); // Debug: Should print your key (or at least part of it)

import express, { Request, Response } from "express";
import fetch from "node-fetch"; // npm install node-fetch@2
const cors = require("cors");

const app = express();
app.use(express.json());

// Allow CORS for localhost (dev) and Vercel (prod)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://tech-interview-assistant.vercel.app"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // Only needed if you use cookies/auth headers
  })
);

interface LLMResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Helper to extract JSON array from LLM response
function extractJsonArray(text: string): any[] {
  const first = text.indexOf("[");
  const last = text.lastIndexOf("]");
  if (first !== -1 && last !== -1 && last > first) {
    const jsonStr = text.slice(first, last + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      throw new Error("Extracted string is not valid JSON");
    }
  }
  throw new Error("No JSON array found in response");
}

async function fetchQuestionsFromGroq(role: string, difficulty: string) {
  const prompt = `
Generate 15 interview questions for the role of "${role}" at "${difficulty}" difficulty.
Each question should be an object with:
- type: "multiple-choice", "coding", or "open-ended"
- content: the question text
- options: array of strings (for multiple-choice only)
- correctAnswer: string (for MCQ/coding)
- explanation: string

Return ONLY a valid JSON array of 15 such objects.
`;

  // Debug: Print API key just before making the request
  console.log("Using GROQ_API_KEY:", process.env.GROQ_API_KEY);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are an expert technical interviewer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    // Debug: Print Groq API response status and text
    console.error("Groq API response:", response.status, await response.text());
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = (await response.json()) as LLMResponse;
  const llmText = data.choices?.[0]?.message?.content;
  if (!llmText) {
    throw new Error("No content returned from Groq LLM.");
  }

  // Log the raw LLM response for debugging
  console.log("LLM RAW RESPONSE:", llmText);

  let questions;
  try {
    questions = extractJsonArray(llmText);
  } catch (err) {
    throw new Error("Failed to parse questions from LLM response.");
  }

  return questions;
}

// Route to get questions from LLM
app.post(
  "/api/interview-questions",
  async (req: Request, res: Response): Promise<void> => {
    const { role, difficulty } = req.body;
    if (!role || !difficulty) {
      res.status(400).json({ error: "Missing role or difficulty." });
      return;
    }
    try {
      const questions = await fetchQuestionsFromGroq(role, difficulty);
      res.json({ questions });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to generate questions." });
    }
  }
);

// Route to evaluate answers
app.post("/api/evaluate", (req: Request, res: Response): void => {
  const { questions, answers } = req.body;

  if (!questions || !answers) {
    res.status(400).json({ error: "Missing questions or answers." });
    return;
  }

  let correctCount = 0;
  const evaluation = questions.map((q: any, i: number) => {
    const userAnswer = answers[i] || "";
    const correctAnswer = q.correctAnswer || "";

    const isCorrect =
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isCorrect) correctCount++;

    return {
      question: q.content,
      type: q.type,
      userAnswer,
      correctAnswer,
      explanation: q.explanation || "",
      isCorrect,
    };
  });

  res.json({
    score: correctCount,
    total: questions.length,
    evaluation,
  });
});

const PORT = 4010;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});





















