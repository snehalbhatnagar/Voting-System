const jwt = require("jsonwebtoken");

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return process.env.JWT_SECRET;
};

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.type }, secret(), { expiresIn: "2h" });
}

// Replaces the original global `authenticatedAadhar`, which let whoever logged in
// last decide whose vote was recorded. Identity now comes from each request's token.
function requireRole(role) {
  return (req, res, next) => {
    const h = req.get("authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Sign in to continue." });
    try {
      req.user = jwt.verify(token, secret());
    } catch {
      return res.status(401).json({ error: "Your session has expired. Sign in again." });
    }
    if (role && req.user.role !== role) return res.status(403).json({ error: "This page is for a different account type." });
    next();
  };
}

module.exports = { signToken, requireRole };
