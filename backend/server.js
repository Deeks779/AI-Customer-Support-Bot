import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import escalateRoutes from "./routes/escalateRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

// 🧠 Import FAQ data and embedding prep function
// import faqs from "./dataset/faqs.json" assert { type: "json" };
import fs from "fs";

const faqs = JSON.parse(fs.readFileSync("./dataset/faqs.json", "utf8"));

// import { prepareFAQEmbeddings } from "./utils/faqMatcher.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/escalate", escalateRoutes);
app.use("/api/summary", summaryRoutes);

// Connect MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 🧩 Prepare FAQ embeddings ONCE when the server starts
    console.log("🔄 Preparing FAQ embeddings...");
    // await prepareFAQEmbeddings(faqs);
    console.log("✅ FAQ embeddings ready!");

    // Start server only after embeddings are ready
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

connectDB();
