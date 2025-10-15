import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, unique: true },
    user_messages: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    bot_responses: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    escalated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
