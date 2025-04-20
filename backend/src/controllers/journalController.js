// controllers/journalController.js

import JournalEntry from "../models/JournalEntry.js";
import { generateLLMFeedback } from "../services/llmService.js";
import { summarizeAnalysesWithLLM } from "../services/llmService.js";
import { generateEmotionForecast } from "../services/llmService.js"; 

export const createJournalEntry = async (req, res) => {
  try {
    const userId = req.user?.userId || "abcd";


    const { emotion, impactFactor, journal } = req.body;

    const { feedback, analysis, emotionScore } = await generateLLMFeedback({ emotion, impactFactor, journal });

    const newEntry = new JournalEntry({
      userId,
      emotion,
      impactFactor,
      journal,
      feedback,
      analysis,
      emotionScore,
      generatedAt: new Date()
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error in journal entry:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getEmotionSummary = async (req, res) => {
  try {
    const userId = req.user?.userId || "abcd";

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const result = await JournalEntry.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: fiveDaysAgo },
          emotionScore: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            score: "$emotionScore"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.day": 1, count: -1 } // group by day, get most frequent score
      },
      {
        $group: {
          _id: "$_id.day",
          overall_emotion_score: { $first: "$_id.score" }
        }
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          overall_emotion_score: 1
        }
      }
    ]);

    console.log("Emotion score summary:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting emotion summary:", error);
    res.status(500).json({ message: error.message });
  }
};






export const getAnalysisSummary = async (req, res) => {
  try {
    const userId = req.user?.userId || "abcd";

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const entries = await JournalEntry.find({
      userId,
      createdAt: { $gte: fiveDaysAgo },
      analysis: { $ne: "" }
    }).sort({ createdAt: 1 });

    const analysisTexts = entries.map(entry => entry.analysis).filter(Boolean);

    if (analysisTexts.length === 0) {
      return res.status(200).json({ summary: "No analysis entries found in the last 5 days." });
    }

    const summary = await summarizeAnalysesWithLLM(analysisTexts);
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error generating analysis summary:", error);
    res.status(500).json({ message: error.message });
  }
};


export const predictEmotions = async (req, res) => {
  try {
    const userId = req.user?.userId || "abcd";

    
    const recentEntries = await JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (recentEntries.length === 0) {
      return res.status(404).json({ message: "No journal entries found." });
    }

    const forecast = await generateEmotionForecast(recentEntries);

    res.status(200).json(forecast);
  } catch (error) {
    console.error("Error predicting emotions:", error);
    res.status(500).json({ message: error.message });
  }
};




