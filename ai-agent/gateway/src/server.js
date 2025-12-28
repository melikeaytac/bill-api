import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "https://bill-api-frontend.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    res.json({ message: "Gateway çalışıyor" });
  } catch (err) {
    console.error("Chat hatası:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
