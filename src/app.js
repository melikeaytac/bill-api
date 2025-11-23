require("dotenv").config();

const express = require("express");
const cors = require("cors");

const mobileRoutes = require("./routes/mobile");
const bankRoutes = require("./routes/bank");
const webRoutes = require("./routes/web");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Versioned API
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mobile", mobileRoutes);
app.use("/api/v1/bank", bankRoutes);
app.use("/api/v1/web", webRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
