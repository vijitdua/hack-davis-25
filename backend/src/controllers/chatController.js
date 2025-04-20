import JournalEntry from "../models/JournalEntry.js";
import { chatWithMomoLLM } from "../services/llmService.js";

export const chatWithMomo = async (req, res) => {
  try {
    const userId = req.user?.userId || "abcd";
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get the user's last 5 journal analyses to provide context
    const recentEntries = await JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const pastEmotions = recentEntries.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      emotion: entry.emotion,
      score: entry.emotionScore,
      analysis: entry.analysis,
    }));

    const response = await chatWithMomoLLM(message, pastEmotions);

    res.status(200).json({ reply: response });
  } catch (error) {
    console.error("Momo chat error:", error);
    res.status(500).json({ message: "Momo had a moment. Try again later." });
  }
};
