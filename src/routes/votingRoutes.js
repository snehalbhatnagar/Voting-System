const express = require('express');
const router = express.Router();
const votingController = require('../controllers/votingController');

router.post('/vote', votingController.voteForCandidate);
router.get('/candidates', votingController.fetchAllCandidates);
router.post('/vote/nota', votingController.voteForNOTA);

module.exports = router;
