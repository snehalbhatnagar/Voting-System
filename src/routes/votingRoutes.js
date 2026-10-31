const express = require("express");
const router = express.Router();
const votingController = require("../controllers/votingController");
const { requireRole } = require("../utils/auth");

router.use(requireRole("Voter"));
router.get("/candidates", votingController.fetchAllCandidates);
router.post("/vote", votingController.voteForCandidate);
router.post("/vote/nota", votingController.voteForNOTA);

module.exports = router;
