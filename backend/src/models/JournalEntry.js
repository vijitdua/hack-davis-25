import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    emotion: { type: String, required: true },
    impactFactor: { type: String, required: true },
    journal: { type: String, required: true },
    feedback: { type: String },
    analysis: { type: String },
    emotionScore: { type: Number, min: 1, max: 5 }, // ✅ added
    generatedAt: { type: Date, default: Date.now }
  }, { timestamps: true });
  

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;
