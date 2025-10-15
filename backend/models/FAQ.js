import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [String],
  embedding: { type: [Number], default: [] },
});

const FAQ = mongoose.model("FAQ", faqSchema);
export default FAQ;
