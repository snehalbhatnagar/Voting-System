const db = require("../utils/db");

async function getVotingOfficerDashboard(req, res, next) {
  try {
    const [[reg]] = await db.execute("SELECT COUNT(*) AS n FROM users WHERE type = 'Voter'");
    const [[voted]] = await db.execute("SELECT COUNT(*) AS n FROM ballots_cast");
    const [tally] = await db.execute(
      `SELECT c.id, c.name, c.party, COUNT(v.id) AS votes
         FROM candidates c LEFT JOIN votes v ON v.candidate_id = c.id
        GROUP BY c.id, c.name, c.party ORDER BY votes DESC, c.id`
    );
    const [[nota]] = await db.execute("SELECT COUNT(*) AS n FROM votes WHERE nota = TRUE");
    res.json({
      registeredVotes: reg.n,
      peopleVoted: voted.n,
      pendingVotes: reg.n - voted.n,
      turnout: reg.n ? voted.n / reg.n : 0,
      results: tally.map((r) => ({ ...r, votes: Number(r.votes) })),
      nota: nota.n,
    });
  } catch (err) { next(err); }
}

module.exports = { getVotingOfficerDashboard };
