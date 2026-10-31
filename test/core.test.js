const { test } = require("node:test");
const assert = require("node:assert/strict");
process.env.AADHAAR_HASH_KEY = "k";
process.env.JWT_SECRET = "s";

const otp = require("../src/utils/otpUtils");
const { validateRegistration, hashAadhaar } = require("../src/utils/validate");
const { signToken, requireRole } = require("../src/utils/auth");

test("OTPs are per number, single-use, and expire", () => {
  const a = otp.issueOTP("9000000001", 0);
  const b = otp.issueOTP("9000000002", 0);
  assert.equal(otp.verifyOTP("9000000001", b === a ? "000000" : b, 1), "invalid");
  assert.equal(otp.verifyOTP("9000000001", a, 1), "ok");
  assert.equal(otp.verifyOTP("9000000001", a, 2), "invalid");
  assert.equal(otp.verifyOTP("9000000002", b, 10 * 60 * 1000), "expired");
});

test("OTP locks after five wrong attempts", () => {
  const code = otp.issueOTP("9000000003", 0);
  const wrong = code === "111111" ? "222222" : "111111";
  for (let i = 0; i < 5; i++) otp.verifyOTP("9000000003", wrong, 1);
  assert.equal(otp.verifyOTP("9000000003", code, 1), "locked");
});

test("registration validation", () => {
  assert.deepEqual(validateRegistration({ username: "asha_v", password: "longenough", mobile: "9876543210", aadhar: "123412341234" }), []);
  assert.equal(validateRegistration({ username: "a", password: "x", mobile: "123", aadhar: "12" }).length, 4);
});

test("Aadhaar is hashed, deterministic, and not reversible to the input", () => {
  const h = hashAadhaar("123412341234");
  assert.equal(h, hashAadhaar("123412341234"));
  assert.equal(h.includes("123412341234"), false);
  assert.equal(h.length, 64);
});

test("role guard blocks voters from the officer dashboard", () => {
  const token = signToken({ id: 1, username: "v", type: "Voter" });
  const run = (role, auth) => {
    let code = 200;
    const res = { status(c) { code = c; return this; }, json() { return this; } };
    requireRole(role)({ get: () => auth }, res, () => {});
    return code;
  };
  assert.equal(run("Voter", `Bearer ${token}`), 200);
  assert.equal(run("Officer", `Bearer ${token}`), 403);
  assert.equal(run("Voter", ""), 401);
});
