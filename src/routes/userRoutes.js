const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/get-otp', userController.getOTP);
router.post('/login', userController.login);

module.exports = router;
