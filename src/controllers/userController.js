const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const otp = require("../utils/otpUtils");
const { validateRegistration, MOBILE_RE } = require("../utils/validate");
const { signToken } = require("../utils/auth");

async function getOTP(req, res, next) {
  try {
    const mobile = String(req.body.mobile || "");
    if (!MOBILE_RE.test(mobile)) return res.status(400).json({ error: "Enter a 10-digit mobile number." });
    const code = otp.issueOTP(mobile);
    const sent = await otp.sendOTP(mobile, code);
    res.json({ message: "Verification code sent.", expiresInSeconds: 300, devCode: sent.devCode });
  } catch (err) { next(err); }
}

async function registerUser(req, res, next) {
  try {
    const { username, password, mobile, aadhar, enteredOTP } = req.body;
    const errors = validateRegistration({ username, password, mobile, aadhar });
    if (errors.length) return res.status(400).json({ error: errors[0], details: errors });

    const result = otp.verifyOTP(mobile, enteredOTP);
    if (result !== "ok") {
      const msg = { expired: "That code has expired. Request a new one.", locked: "Too many wrong codes. Request a new one." }[result] || "That code is not correct.";
      return res.status(400).json({ error: msg });
    }

    const userId = await userModel.createUser({ username, password, mobile, aadhar, type: "Voter" });
    res.status(201).json({ userId, message: "Registration complete. You can sign in now." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "That username or Aadhaar number is already registered." });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password, userType = "Voter", aadhar } = req.body;
    if (!["Voter", "Officer"].includes(userType)) return res.status(400).json({ error: "Choose voter or officer." });
    const user = username && aadhar ? await userModel.getUserForLogin(username, userType, aadhar) : null;
    const ok = user && (await bcrypt.compare(String(password || ""), user.password_hash));
    if (!ok) return res.status(401).json({ error: "Username, Aadhaar number, or password is incorrect." });
    res.json({ token: signToken(user), user: { id: user.id, username: user.username, userType: user.type } });
  } catch (err) { next(err); }
}

module.exports = { registerUser, getOTP, login };
