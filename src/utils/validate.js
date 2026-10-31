const crypto = require("crypto");

const MOBILE_RE = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
const AADHAAR_RE = /^\d{12}$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

function validateRegistration({ username, password, mobile, aadhar }) {
  const errors = [];
  if (!USERNAME_RE.test(username || "")) errors.push("Username must be 3 to 30 letters, numbers, dots, or underscores.");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters.");
  if (!MOBILE_RE.test(mobile || "")) errors.push("Mobile number must be 10 digits.");
  if (!AADHAAR_RE.test(aadhar || "")) errors.push("Aadhaar number must be 12 digits.");
  return errors;
}

// Aadhaar numbers are never stored in plain text: only a keyed hash, which is
// enough to stop the same person registering twice.
function hashAadhaar(aadhar) {
  const key = process.env.AADHAAR_HASH_KEY;
  if (!key) throw new Error("AADHAAR_HASH_KEY is not set");
  return crypto.createHmac("sha256", key).update(String(aadhar)).digest("hex");
}

module.exports = { validateRegistration, hashAadhaar, MOBILE_RE, AADHAAR_RE };
