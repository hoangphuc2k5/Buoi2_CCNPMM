const express = require("express");
const path = require("path");

const { connectDb } = require("./config/database");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimiters");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());

const uiPath = path.join(__dirname, "ui");
app.use(express.static(uiPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(uiPath, "index.html"));
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

connectDb();

module.exports = app;
