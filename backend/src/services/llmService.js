import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {env} from "./config/env.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

export async function generateLLMFeedback({ emotion, impactFactor, journal }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
You are a compassionate AI therapist. Given the user's emotion, impact factor, and journal entry, generate:

1. A short empathetic feedback message.
2. A detailed therapeutic analysis based on their journal.

Reply strictly in this JSON format:
{
  "feedback": "short feedback",
  "analysis": "detailed therapeutic analysis"
}

Emotion: ${emotion}
Impact Factor: ${impactFactor}
Journal: ${journal}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const json = text.substring(start, end + 1);

    const { feedback, analysis } = JSON.parse(json);
    return { feedback, analysis };
  } catch (err) {
    console.error("Gemini Error:", err);
    return {
      feedback: "Sorry, we couldn't generate feedback right now.",
      analysis: ""
    };
  }
}
