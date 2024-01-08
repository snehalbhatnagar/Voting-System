function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

function sendOTP(mobile, otp) {
  const val = `Sent OTP ${otp} to ${mobile}`;
  return val;
}

module.exports = {
  generateOTP,
  sendOTP
};
