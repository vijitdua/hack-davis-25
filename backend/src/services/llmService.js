import dotenv from 'dotenv';
//import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { GoogleGenerativeAI } from '@google/generative-ai'; // Ensure you're using the correct import

dotenv.config();

if (!env.geminiApiKey) {
    throw new Error("Gemini API key is missing. Please set GEMINI_API_KEY in the environment variables.");
}


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

export async function summarizeAnalysesWithLLM(analyses) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an AI therapist. The following are 5 days of analysis entries. Summarize the overall emotional and psychological themes in 1 paragraph.

Analyses:
${analyses.map((text, i) => `Day ${i + 1}: ${text}`).join("\n")}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        return text.trim();
    } catch (err) {
        console.error("Gemini Summary Error:", err);
        return "Sorry, couldn't generate a summary at this time.";
    }
}



export async function generateEmotionForecast(entries) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
    const entryText = entries.map(entry => {
      return `Date: ${entry.createdAt.toISOString().split('T')[0]}
  Emotion: ${entry.emotion}
  Impact Factor: ${entry.impactFactor}
  Journal: ${entry.journal}`;
    }).join('\n\n');
  
    const prompt = `
  Based on the following journal entries, predict the user's overall emotional state for the next 2 days.
  Return JSON like this:
  [
    {"day": "YYYY-MM-DD", "overall_emotions": "some emotion"},
    {"day": "YYYY-MM-DD", "overall_emotions": "another emotion"}
  ]
  
  Journal Entries:
  ${entryText}
  `;
  
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
  
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      const parsed = JSON.parse(text.substring(start, end + 1));
      return parsed;
    } catch (error) {
      console.error("LLM Forecast Error:", error);
      return [
        { day: getFutureDate(1), overall_emotions: "unknown" },
        { day: getFutureDate(2), overall_emotions: "unknown" }
      ];
    }
  }
  
  function getFutureDate(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
  }