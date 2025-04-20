import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from "../config/env.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

export async function generateLLMFeedback({ emotion, impactFactor, journal }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

    // Use a regular expression to find the JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch && jsonMatch[0]) {
      try {
        const parsedJSON = JSON.parse(jsonMatch[0]);
        return { feedback: parsedJSON.feedback, analysis: parsedJSON.analysis };
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Problematic JSON:", jsonMatch[0]);
        return {
          feedback: "Sorry, there was an issue processing the feedback.",
          analysis: ""
        };
      }
    } else {
      console.error("Could not find JSON in the response:", text);
      return {
        feedback: "Sorry, the feedback format was unexpected.",
        analysis: ""
      };
    }
  } catch (err) {
    console.error("Gemini Error:", err);
    return {
      feedback: "Sorry, we couldn't generate feedback right now.",
      analysis: ""
    };
  }
}