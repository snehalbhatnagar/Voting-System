const db = require("../utils/db");
const bcrypt = require("bcrypt");
const { hashAadhaar } = require("../utils/validate");

async function getUserForLogin(username, type, aadhar) {
  const [rows] = await db.query(
    "SELECT id, username, password_hash, type FROM users WHERE username = ? AND type = ? AND aadhaar_hash = ?",
    [username, type, hashAadhaar(aadhar)]
  );
  return rows[0] || null;
}

async function createUser({ username, password, mobile, aadhar, type = "Voter" }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await db.execute(
    "INSERT INTO users (username, password_hash, mobile, aadhaar_hash, type) VALUES (?, ?, ?, ?, ?)",
    [username, passwordHash, mobile, hashAadhaar(aadhar), type]
  );
  return result.insertId;
}

module.exports = { getUserForLogin, createUser };
