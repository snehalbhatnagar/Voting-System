const db = require("../utils/db");

// Ballot secrecy: `ballots_cast` records THAT a voter voted (one row per voter,
// enforced by a unique key); `votes` records WHAT was chosen with no link back
// to the voter. Both rows are written in one transaction.
async function castBallot(userId, candidateId) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (candidateId !== null) {
      const [c] = await conn.execute("SELECT id FROM candidates WHERE id = ?", [candidateId]);
      if (!c.length) { await conn.rollback(); return { status: 404, body: { error: "That candidate is not on the ballot." } }; }
    }
    await conn.execute("INSERT INTO ballots_cast (user_id) VALUES (?)", [userId]);
    await conn.execute("INSERT INTO votes (candidate_id, nota) VALUES (?, ?)", [candidateId, candidateId === null]);
    await conn.commit();
    return { status: 201, body: { success: true, message: "Your vote has been recorded." } };
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") return { status: 409, body: { success: false, error: "You have already voted." } };
    throw err;
  } finally {
    conn.release();
  }
}

async function voteForCandidate(req, res, next) {
  try {
    const candidateId = Number(req.body.candidateId);
    if (!Number.isInteger(candidateId) || candidateId < 1) return res.status(400).json({ error: "Choose a candidate." });
    const r = await castBallot(req.user.id, candidateId);
    res.status(r.status).json(r.body);
  } catch (err) { next(err); }
}

async function voteForNOTA(req, res, next) {
  try {
    const r = await castBallot(req.user.id, null);
    res.status(r.status).json(r.body);
  } catch (err) { next(err); }
}

async function fetchAllCandidates(req, res, next) {
  try {
    const [candidates] = await db.execute("SELECT id, name, party, symbol FROM candidates ORDER BY id");
    const [[cast]] = await db.execute("SELECT COUNT(*) AS n FROM ballots_cast WHERE user_id = ?", [req.user.id]);
    res.json({ candidates, hasVoted: cast.n > 0 });
  } catch (err) { next(err); }
}

module.exports = { voteForCandidate, fetchAllCandidates, voteForNOTA, castBallot };
