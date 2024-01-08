const db = require('../utils/db');
const userController = require('./userController')

async function voteForCandidate(req, res) {
  
  const { candidateId } = req.body;
  
  try {    
    await db.execute('INSERT INTO votes (candidate_id, aadhar, type) VALUES (?, ?, ?)', [candidateId, authenticatedAadhar, 'Voter']);
    res.json({ success: true, message: 'Vote recorded successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || typeof authenticatedAadhar === 'undefined') {      
      res.status(400).json({ success: false, message: 'You have already voted.' });
    } else {
      console.error('Error recording vote:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

async function fetchAllCandidates(req, res) {
  try {
    const [candidates] = await db.execute('SELECT * FROM candidates');
    res.json({ candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function voteForNOTA(req, res) {
  
  try {
    await db.execute('INSERT INTO votes (nota, aadhar, type) VALUES (?, ?, ?)', [0, authenticatedAadhar, 'Voter']);

    res.json({ success: true, message: 'NOTA vote recorded successfully' });
  } catch (error) {
    console.error('Error recording NOTA vote:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  voteForCandidate,
  fetchAllCandidates,
  voteForNOTA
};
