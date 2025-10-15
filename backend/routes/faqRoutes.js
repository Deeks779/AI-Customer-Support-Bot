import express from "express";
import FAQ from "../models/FAQ.js";
import fs from "fs";

const router = express.Router();

// GET all FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find();
    if (faqs.length === 0) {
      const data = JSON.parse(fs.readFileSync("./dataset/faqs.json"));
      await FAQ.insertMany(data);
      console.log("Mock FAQs inserted into DB");
      return res.json(data);
    }
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

export default router;
