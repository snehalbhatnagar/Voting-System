const express = require("express");
const router = express.Router();
const votingOfficerController = require("../controllers/votingOfficerController");
const { requireRole } = require("../utils/auth");

router.get("/dashboard", requireRole("Officer"), votingOfficerController.getVotingOfficerDashboard);

module.exports = router;
