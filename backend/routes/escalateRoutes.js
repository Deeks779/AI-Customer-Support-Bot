import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// Manual escalation endpoint
router.post("/", async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: "session_id required" });
  }

  try {
    const session = await Session.findOne({ session_id });
    if (!session) return res.status(404).json({ error: "Session not found" });

    session.escalated = true;
    await session.save();

    res.json({ message: "Session escalated successfully", session });
  } catch (err) {
    console.error("Escalation Error:", err);
    res.status(500).json({ error: "Failed to escalate session" });
  }
});

export default router;
