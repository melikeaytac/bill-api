import express from "express";
import cors from "cors";

const app = express();

const cors = require("cors");
app.use(cors({
  origin: "https://bill-api-frontend-91y3nyoy-melike-aytacs-projects.vercel.app"
}));

app.use(express.json());

app.post("/chat", async (req, res) => {
});
