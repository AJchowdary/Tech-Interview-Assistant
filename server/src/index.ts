import express from "express";
import cors from "cors";
import { getCodingQuestion } from "./questionController";

const app = express();
app.use(
  cors({
    origin: "*", // later you can restrict this to frontend URL
    methods: ["POST"],
  })
);

app.use(express.json());

app.post("/api/question", async (req, res) => {
  const { topic, difficulty } = req.body;

  if (!topic || !difficulty) {
    res.status(400).json({ error: "Topic and difficulty are required." });
    return;
  }

  try {
    const question = await getCodingQuestion(topic, difficulty);
    res.json({ question });
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({ error: "Failed to get coding question." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

