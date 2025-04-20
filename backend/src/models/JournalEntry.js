import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },         // Auth0 User ID
  emotion: { type: String, required: true },
  impactFactor: { type: String, required: true },
  journal: { type: String, required: true },
  feedback: { type: String },                       // From LLM
  analysis: { type: String },                      
  generatedAt: { type: Date, default: Date.now },   
}, { timestamps: true }); // adds `createdAt` and `updatedAt` automatically

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;
