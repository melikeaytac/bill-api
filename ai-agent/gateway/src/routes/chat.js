const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { message, mode } = req.body || {};
    if (!message) return res.status(400).json({ success: false, message: "message is required" });

    const base = process.env.ORCHESTRATOR_BASE_URL || "http://localhost:5102";
    const result = await axios.post(`${base}/chat`, { message, mode });

    return res.json(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
