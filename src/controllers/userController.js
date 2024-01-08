const userModel = require('../models/userModel');
const otpUtils = require('../utils/otpUtils');
const bcrypt = require('bcrypt');

global.otp = 0;
async function getOTP(req, res){
  const { mobile } = req.body;
  try {
      otp = otpUtils.generateOTP();
      const val = otpUtils.sendOTP(mobile, otp);
      res.json({val});         
    }  
    
  catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

let authenticatedAadhar = null;

async function login(req, res) {

  const { username, password, userType, aadhar } = req.body;
  global.authenticatedAadhar = aadhar;
  
  try {
   
    const user = await userModel.getUserByCredentials(username, userType, aadhar);
    
  
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.type !== userType) { 
      return res.status(401).json({ error: 'Invalid user type' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
     
    
    if (!passwordMatch) {
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("Logged in");
    res.json({ userId: user.id, username: user.username, userType: user.type });
         

    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
 
}
 const y = authenticatedAadhar;
 module.exports = { y: authenticatedAadhar };



async function registerUser(req, res) {
  const { username, password, mobile, aadhar, enteredOTP } = req.body;

  try {
     var isOtpValid = false;
    if(enteredOTP == otp)
      isOtpValid = true;
    if (!isOtpValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    const userId = await userModel.createUser(username, password, mobile, aadhar, "Voter");    
    res.json({ userId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  registerUser,
  getOTP,
  login,
};
