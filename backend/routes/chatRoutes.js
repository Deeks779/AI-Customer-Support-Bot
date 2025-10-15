import express from "express";
import Session from "../models/Session.js";
import FAQ from "../models/FAQ.js";
import { generateResponse } from "../utils/llmHelper.js";
import { findBestFAQ } from "../utils/faqMatcher.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { session_id, message } = req.body;

  if (!session_id || !message) {
    return res.status(400).json({ error: "Missing session_id or message" });
  }

  try {
    const session = await Session.findOne({ session_id });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const faqs = await FAQ.find();
    const { bestMatch, bestScore } = await findBestFAQ(faqs, message);

    let reply = "";
    let shouldEscalate = false;

    if (bestScore > 0.6) {
      reply = bestMatch.answer;
    } else {
      // Contextual prompt for LLM
      const lastUserMessages = session.user_messages
        .slice(-3)
        .map((m) => `User: ${m.text}`)
        .join("\n");
      const lastBotReplies = session.bot_responses
        .slice(-3)
        .map((m) => `Bot: ${m.text}`)
        .join("\n");

      const contextPrompt = `
You are a helpful AI customer support bot. 
Here is the previous conversation:
${lastUserMessages}
${lastBotReplies}

User: ${message}
Bot:
      `;

      reply = await generateResponse(contextPrompt);

      // Escalate if uncertain or low-confidence
      if (
        bestScore < 0.1 ||
        reply.toLowerCase().includes("i’m not sure") ||
        reply.toLowerCase().includes("cannot help") ||
        reply.toLowerCase().includes("connect you to support")
      ) {
        shouldEscalate = true;
        session.escalated = true;
        reply =
          "I’m forwarding your query to a human support agent for further assistance.";
      }
    }

    // Save the chat update
    session.user_messages.push({ text: message });
    session.bot_responses.push({ text: reply });
    await session.save();

    res.json({ reply, escalated: shouldEscalate });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat processing failed" });
  }
});

export default router;
