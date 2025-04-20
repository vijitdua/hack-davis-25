// controllers/journalController.js

import JournalEntry from "../models/JournalEntry.js";
import { generateLLMFeedback } from "../services/llmService.js";

export const createJournalEntry = async (req, res) => {
  try {
    const userId = req.user?.userId || "abcd";


    const { emotion, impactFactor, journal } = req.body;

    const { feedback, analysis } = await generateLLMFeedback({ emotion, impactFactor, journal });

    const newEntry = new JournalEntry({
      userId,
      emotion,
      impactFactor,
      journal,
      feedback,
      analysis,
      generatedAt: new Date()
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error in journal entry:", error);
    res.status(500).json({ message: error.message });
  }
};
