const express = require('express');
const router = express.Router();
const votingOfficerController = require('../controllers/votingOfficerController');

router.get('/dashboard', votingOfficerController.getVotingOfficerDashboard);

module.exports = router;
