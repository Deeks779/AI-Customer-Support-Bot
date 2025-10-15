import express from "express";
import Session from "../models/Session.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Start new session
router.post("/start", async (req, res) => {
  try {
    const newSession = await Session.create({ session_id: uuidv4() });
    res.status(201).json({ session_id: newSession.session_id });
  } catch (err) {
    res.status(500).json({ error: "Failed to start session" });
  }
});

// Get session by ID
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findOne({ session_id: req.params.id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving session" });
  }
});

export default router;
