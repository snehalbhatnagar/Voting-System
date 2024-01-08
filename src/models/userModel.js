// models/userModel.js
const db = require('../utils/db');
const bcrypt = require('bcrypt');


async function getUserByCredentials(username, type, aadhar) {
  try {
    const query = 'SELECT * FROM users WHERE username = ? AND type = ? AND aadhar = ?';
    const [rows, fields] = await db.query(query, [username, type, aadhar]);

    if (rows.length > 0) {
       return rows[0];
    } 
    else {
        return null;
    }
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    throw error;
  }
}
async function createUser(username, password, mobile, aadhar, type) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    'INSERT INTO users (username, password, mobile, aadhar, type) VALUES (?, ?, ?, ?, ?)',
    [username, hashedPassword, mobile, aadhar, type]    
  );
 
}

module.exports = {
  createUser,
  getUserByCredentials: getUserByCredentials,
  };
