require("dotenv").config();
const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat");

const billingRoutes = require("./routes/billingRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "gateway" }));

app.use("/gateway", billingRoutes);
app.use("/chat", chatRoutes);

app.use((err, req, res, next) => {
  console.error("[gateway] unhandled error:", err?.message || err);
  const status = err.response?.status || err.status || 500;
  return res.status(status).json({
    error: "gateway_chat_failed",
    details: { message: err?.message || "unknown_error" },
    assistantText: "İşlem sırasında bir hata oluştu.",
  });
});

const port = process.env.PORT || 5101;
app.listen(port, () => console.log(`[gateway] listening on :${port}`));
