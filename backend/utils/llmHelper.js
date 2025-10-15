import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateResponse(prompt) {
  try {
    const systemInstruction = "You are an AI customer support bot. Be concise, polite, and helpful.";

    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }], 
        },
      ],
      config: {
        systemInstruction: systemInstruction, 
        temperature: 0.6,
        maxOutputTokens: 200,
      },
    });

    // Return the generated text
    return completion.text;
  } catch (error) {
    console.error("LLM Error:", error);
    return "Sorry, I’m facing some technical difficulties right now.";
  }
}
