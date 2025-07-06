// server/src/questionController.ts
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const getCodingQuestion = async (topic: string, difficulty: string): Promise<string> => {
  const prompt = `
You're an expert tech interviewer. Generate a ${difficulty} level coding interview question on the topic: ${topic}.
Only include the question, no answer.`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: prompt }
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};
