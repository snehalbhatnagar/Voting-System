require("dotenv").config();
const path = require("path");
const express = require("express");
const { createApp } = require("./src/app");

const app = createApp();

// Serve the built React client (npm run client:build) from the same server.
const clientDist = path.join(__dirname, "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Voting system running on http://localhost:${port}`));
