const db = require('../utils/db');

async function getVotingOfficerDashboard(req, res) {
  try { 
    const [dashboardData] = await db.execute('SELECT COUNT(type) AS registeredVotes FROM users WHERE type = \'Voter\'');
    const [votedData] = await db.execute('SELECT COUNT(*) AS peopleVoted FROM votes');
    const pendingVotes = dashboardData[0].registeredVotes - votedData[0].peopleVoted;

    res.json({
      registeredVotes: dashboardData[0].registeredVotes,
      peopleVoted: votedData[0].peopleVoted,
      pendingVotes
    });
  } catch (error) {
    console.error('Error fetching voting officer dashboard data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getVotingOfficerDashboard
};
