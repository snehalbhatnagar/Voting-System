const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const votingRoutes = require("./routes/votingRoutes");
const votingOfficerRoutes = require("./routes/votingOfficerRoutes");

function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true }));
  app.use(express.json({ limit: "50kb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/user", userRoutes);
  app.use("/api/voting", votingRoutes);
  app.use("/api/voting-officer", votingOfficerRoutes);

  app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  });
  return app;
}

module.exports = { createApp };
