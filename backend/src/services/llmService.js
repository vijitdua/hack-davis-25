import dotenv from 'dotenv';
//import { GoogleGenerativeAI } from '@google/generative-ai';

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
  You are a compassionate AI therapist. Based on the user's emotion and journal, respond with:
  
  1. A **final**, short empathetic message that helps the user feel seen and supported.
  2. A detailed therapeutic analysis to help the user reflect and grow.
  3. An emotion classification score on a 1–5 scale based on their overall mood:
  
     - 1 = very sad
     - 2 = slightly sad
     - 3 = neutral
     - 4 = happy
     - 5 = very happy
  
  Do not ask follow-up questions or initiate a conversation. Reply strictly in this JSON format:
  
  {
    "feedback": "short empathetic message",
    "analysis": "therapeutic insight",
    "emotionScore": number from 1 to 5
  }
  
  Emotion: ${emotion}
  Impact Factor: ${impactFactor}
  Journal: ${journal}
  `;
  
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
  
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const parsed = JSON.parse(text.substring(start, end + 1));
  
      return {
        feedback: parsed.feedback,
        analysis: parsed.analysis,
        emotionScore: parsed.emotionScore
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        feedback: "Sorry, we couldn't generate feedback right now.",
        analysis: "",
        emotionScore: 3 // Default to neutral on failure
      };
    }
  }
  
  export async function summarizeAnalysesWithLLM(analyses) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
    const prompt = `
  You are an AI therapist. The following text contains emotional and psychological analyses written over the past several days.
  
  Your task is to read all of them and produce **one coherent paragraph** that summarizes the user's overall emotional and psychological themes. Focus on key patterns, shifts in mood, recurring concerns, and overall mental state.
  
  Do not list days or separate them. Just write a clean, compassionate, high-level summary.
  
  Analyses:
  ${analyses.join("\n\n")}
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
    You are an AI therapist assistant. Based on the user's recent journal entries, predict their overall emotional state for the next two days. Do not ask questions or request more input.
    
    Use this 1–5 scale:
    1 = very sad
    2 = slightly sad
    3 = neutral
    4 = happy
    5 = very happy
    
    Return a JSON array in this format:
    [
      { "day": "YYYY-MM-DD", "overall_emotion_score": 1–5 },
      { "day": "YYYY-MM-DD", "overall_emotion_score": 1–5 }
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



  export async function chatWithMomoLLM(message, emotionalContext) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
    const contextText = emotionalContext.map(e => 
      `Date: ${e.date}, Emotion: ${e.emotion} (Score: ${e.score})\nAnalysis: ${e.analysis}`
    ).join('\n\n');
  
    const prompt = `
  You are Momo, a warm and emotionally aware AI therapist. You're talking to a user who has shared the following emotional background over the past few days:
  
  ${contextText}
  
  Now, respond compassionately and conversationally to their new message.
  
  User: ${message}
  Momo:
  `;
  
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      console.error("Momo LLM Error:", err);
      return "Sorry, I'm having trouble responding right now. Let's try again soon.";
    }
  }
  