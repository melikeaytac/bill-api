const axios = require("axios");

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  const allowOrigin = process.env.ALLOW_ORIGIN || origin || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { message, mode } = req.body || {};
    if (!message) {
      res.status(400).json({ success: false, message: "message is required" });
      return;
    }

    const base = process.env.ORCHESTRATOR_BASE_URL ||
      "https://bill-api-orch-fnij27o30-melike-aytacs-projects.vercel.app";

    const result = await axios.post(`${base}/chat`, { message, mode });
    res.status(200).json(result.data);
  } catch (err) {
    const status = err.response?.status || err.status || 500;
    res.status(status).json({
      error: "gateway_chat_failed",
      details: { message: err?.message || "unknown_error" },
      assistantText: "İşlem sırasında bir hata oluştu.",
    });
  }
};
