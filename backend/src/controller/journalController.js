import JournalEntry from "../models/JournalEntry";

// Create a new journal entry
export const createJournalEntry = async (req, res) => {
  try {
    const user = req.oidc?.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { emotion, impactFactor, journal } = req.body;

    // Call LLM
    const { feedback, analysis } = await generateLLMFeedback({ emotion, impactFactor, journal });

    const newEntry = new JournalEntry({
      userId: user.sub,
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
    res.status(500).json({ message: error.message });
  }
};