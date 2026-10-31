const crypto = require("crypto");

const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// One pending code per mobile number. The original version kept a single global
// OTP for every user; this keeps them separate, expiring, and single-use.
// In production this map would live in Redis or a database table.
const pending = new Map();

function generateOTP() {
  return String(crypto.randomInt(100000, 1000000));
}

function issueOTP(mobile, now = Date.now()) {
  const code = generateOTP();
  pending.set(mobile, { code, expiresAt: now + TTL_MS, attempts: 0 });
  return code;
}

// Returns "ok", "expired", "invalid", or "locked".
function verifyOTP(mobile, code, now = Date.now()) {
  const entry = pending.get(mobile);
  if (!entry) return "invalid";
  if (now > entry.expiresAt) { pending.delete(mobile); return "expired"; }
  if (entry.attempts >= MAX_ATTEMPTS) { pending.delete(mobile); return "locked"; }
  entry.attempts += 1;
  const a = Buffer.from(String(code));
  const b = Buffer.from(entry.code);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "invalid";
  pending.delete(mobile);
  return "ok";
}

// No SMS provider is wired up. Plug one in here (Twilio, MSG91, AWS SNS).
async function sendOTP(mobile, code) {
  console.log(`[otp] code for ${mobile.slice(0, 2)}******${mobile.slice(-2)} issued`);
  return { delivered: false, devCode: process.env.OTP_DEV_ECHO === "true" ? code : undefined };
}

module.exports = { generateOTP, issueOTP, verifyOTP, sendOTP, _pending: pending };
