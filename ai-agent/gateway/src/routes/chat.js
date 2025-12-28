const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    res.set("X-Handler", "express");
    const { message, mode } = req.body || {};
    if (!message) return res.status(400).json({ success: false, message: "message is required" });

    let base = process.env.ORCHESTRATOR_BASE_URL || "https://bill-api-orch.vercel.app";
    if (/localhost|127\.0\.0\.1/.test(base)) {
      console.warn("[gateway/src/routes/chat] ORCHESTRATOR_* env points to localhost; falling back to deployed URL");
      base = "https://bill-api-orch.vercel.app";
    }
    console.log("[gateway/src/routes/chat] forwarding to:", `${base}/chat`);
    const result = await axios.post(`${base}/chat`, { message, mode });

    return res.json(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
