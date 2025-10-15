import express from "express";
import Session from "../models/Session.js";
import { generateResponse } from "../utils/llmHelper.js";

const router = express.Router();

router.get("/:session_id", async (req, res) => {
  const { session_id } = req.params;

  try {
    const session = await Session.findOne({ session_id });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const conversation = session.user_messages
      .map((m, i) => `User: ${m.text}\nBot: ${session.bot_responses[i]?.text || ""}`)
      .join("\n");

    const prompt = `
Summarize this customer support conversation in 5-6 lines.
Highlight:
- Main problem or topic
- Whether issue was resolved
- If escalation occurred

Conversation:
${conversation}
    `;

    const summary = await generateResponse(prompt);

    res.json({
      session_id,
      summary,
      escalated: session.escalated,
    });
  } catch (err) {
    console.error("Summary Error:", err);
    res.status(500).json({ error: "Failed to summarize conversation" });
  }
});

export default router;
