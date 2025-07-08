// server/questionController.ts
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const headers = {
  Authorization: `Bearer ${GROQ_API_KEY}`,
  "Content-Type": "application/json",
};

export const getCodingQuestion = async (
  topic: string,
  difficulty: string
): Promise<string> => {
  const prompt = `You're an expert tech interviewer. Generate a ${difficulty} level coding interview question on the topic: ${topic}. Only include the question, no answer.`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: "llama-3-70b-8192",
      messages: [{ role: "user", content: prompt }],
    },
    { headers }
  );

  return response.data.choices[0].message.content;
};

export const getBehavioralQuestion = async (): Promise<string> => {
  const prompt = `You're an expert tech interviewer. Give me one behavioral interview question suitable for a software engineering candidate. Only the question.`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: "llama-3-70b-8192",
      messages: [{ role: "user", content: prompt }],
    },
    { headers }
  );

  return response.data.choices[0].message.content;
};

export const getSystemDesignQuestion = async (): Promise<string> => {
  const prompt = `You're a senior system design interviewer. Give one challenging system design interview question. Only the question.`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: "llama-3-70b-8192",
      messages: [{ role: "user", content: prompt }],
    },
    { headers }
  );

  return response.data.choices[0].message.content;
};

export const getTopInterviewQuestions = async (
  role: string,
  difficulty: string
): Promise<string> => {
  const prompt = `
You're a senior tech recruiter and interview expert.
Give the top 15 most frequently asked and expected interview questions
for the role "${role}" at "${difficulty}" level.

The output should include a mix of:
1. Coding questions (if technical),
2. Behavioral questions,
3. Multiple-choice or conceptual questions.

Only give the questions (numbered), no answers.
`;

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: "llama-3-70b-8192",
      messages: [{ role: "user", content: prompt }],
    },
    { headers }
  );

  return response.data.choices[0].message.content;
};

