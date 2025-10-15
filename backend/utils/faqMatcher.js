import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate text embeddings using Gemini
 */
export async function getEmbedding(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Empty text input for embedding");
    }

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001", // ✅ correct model name
      contents: [text],              // ✅ must be a list of texts
      taskType: "SEMANTIC_SIMILARITY", 
    });

    if (!response || !response.embeddings || !response.embeddings[0]?.values) {
      console.error("Unexpected Gemini embedding response:", response);
      throw new Error("Invalid embedding response from Gemini");
    }

    return response.embeddings[0].values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error.message);
    throw new Error("Failed to generate embedding with Gemini API.");
  }
}


/**
 * Compute cosine similarity
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dot / (magA * magB);
}

/**
 * Compare user query embedding with stored FAQ embeddings
 */
export async function findBestFAQ(faqs, query) {
  const queryEmbedding = await getEmbedding(query);

  let bestMatch = null;
  let bestScore = 0;

  for (const faq of faqs) {
    if (!faq.embedding) continue;
    const score = cosineSimilarity(queryEmbedding, faq.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return { bestMatch, bestScore };
}
