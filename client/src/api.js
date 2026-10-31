// Same interface over the real Express API or an in-browser demo store (VITE_DEMO=true).
export const DEMO = import.meta.env.VITE_DEMO === "true";
export const DEMO_ACCOUNTS = {
  Voter: { username: "voter_demo", aadhar: "123412341234", password: "demo1234" },
  Officer: { username: "officer_demo", aadhar: "999988887777", password: "demo1234" },
};

const safe = {
  get(k, s = sessionStorage) { try { return JSON.parse(s.getItem(k)); } catch { return null; } },
  set(k, v, s = sessionStorage) { try { s.setItem(k, JSON.stringify(v)); } catch { /* unavailable */ } },
  del(k, s = sessionStorage) { try { s.removeItem(k); } catch { /* ignore */ } },
};

export const session = {
  current: () => safe.get("vote.session"),
  save: (v) => safe.set("vote.session", v),
  clear: () => safe.del("vote.session"),
};

export class ApiError extends Error { constructor(m, status) { super(m); this.status = status; } }

/* ---------- real API ---------- */
const BASE = import.meta.env.VITE_API_URL || "/api";
async function http(path, body, method = body ? "POST" : "GET") {
  const token = session.current()?.token;
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new ApiError("Can't reach the server. Check that it is running.", 0); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { if (res.status === 401) session.clear(); throw new ApiError(data.error || data.message || "Request failed.", res.status); }
  return data;
}
const httpApi = {
  requestOtp: (mobile) => http("/user/get-otp", { mobile }),
  register: (f) => http("/user/register", f),
  login: (f) => http("/user/login", f),
  candidates: () => http("/voting/candidates"),
  vote: (candidateId) => (candidateId === null ? http("/voting/vote/nota", {}) : http("/voting/vote", { candidateId })),
  dashboard: () => http("/voting-officer/dashboard"),
};

/* ---------- demo store ---------- */
const KEY = "vote.demo.v1";
const CANDIDATES = [
  { id: 1, name: "Asha Verma", party: "Civic Progress Party", symbol: "lamp" },
  { id: 2, name: "Rohan Mehta", party: "United Farmers Front", symbol: "wheat" },
  { id: 3, name: "Meera Iyer", party: "Green Future Alliance", symbol: "tree" },
  { id: 4, name: "Kabir Singh", party: "Independent", symbol: "kite" },
];
const fresh = () => ({
  // Sample turnout so the officer dashboard has something to show.
  baseRegistered: 1240,
  tally: { 1: 312, 2: 268, 3: 190, 4: 41, nota: 12 },
  users: [
    { id: 1, ...DEMO_ACCOUNTS.Voter, mobile: "9876543210", type: "Voter" },
    { id: 2, ...DEMO_ACCOUNTS.Officer, mobile: "9876500000", type: "Officer" },
  ],
  cast: [],
});
const db = () => safe.get(KEY, localStorage) || fresh();
const put = (d) => safe.set(KEY, d, localStorage);
const wait = (v, ms = 250) => new Promise((r) => setTimeout(() => r(v), ms));
const otps = {};

const demoApi = {
  async requestOtp(mobile) {
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new ApiError("Enter a 10-digit mobile number.", 400);
    otps[mobile] = { code: String(Math.floor(100000 + Math.random() * 900000)), at: Date.now() };
    return wait({ message: "Verification code sent.", expiresInSeconds: 300, devCode: otps[mobile].code });
  },
  async register({ username, password, mobile, aadhar, enteredOTP }) {
    await wait(null);
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username || "")) throw new ApiError("Username must be 3 to 30 letters, numbers, dots, or underscores.", 400);
    if (!password || password.length < 8) throw new ApiError("Password must be at least 8 characters.", 400);
    if (!/^\d{12}$/.test(aadhar || "")) throw new ApiError("Aadhaar number must be 12 digits.", 400);
    const o = otps[mobile];
    if (!o || Date.now() - o.at > 300000) throw new ApiError("That code has expired. Request a new one.", 400);
    if (o.code !== enteredOTP) throw new ApiError("That code is not correct.", 400);
    delete otps[mobile];
    const d = db();
    if (d.users.some((u) => u.username === username || u.aadhar === aadhar)) throw new ApiError("That username or Aadhaar number is already registered.", 409);
    d.users.push({ id: d.users.length + 1, username, password, mobile, aadhar, type: "Voter" });
    put(d);
    return { message: "Registration complete. You can sign in now." };
  },
  async login({ username, password, aadhar, userType }) {
    await wait(null);
    const u = db().users.find((x) => x.username === username && x.aadhar === aadhar && x.type === userType);
    if (!u || u.password !== password) throw new ApiError("Username, Aadhaar number, or password is incorrect.", 401);
    return { token: `demo-${u.id}`, user: { id: u.id, username: u.username, userType: u.type } };
  },
  async candidates() {
    const me = session.current()?.user;
    return wait({ candidates: CANDIDATES, hasVoted: db().cast.includes(me?.id) });
  },
  async vote(candidateId) {
    const me = session.current()?.user;
    const d = db();
    if (d.cast.includes(me.id)) throw new ApiError("You have already voted.", 409);
    d.cast.push(me.id);
    d.tally[candidateId === null ? "nota" : candidateId] += 1;
    put(d);
    return wait({ success: true, message: "Your vote has been recorded." }, 500);
  },
  async dashboard() {
    const d = db();
    const extraVoters = d.users.filter((u) => u.type === "Voter").length - 1;
    const registeredVotes = d.baseRegistered + extraVoters;
    const total = Object.values(d.tally).reduce((a, b) => a + b, 0);
    return wait({
      registeredVotes,
      peopleVoted: total,
      pendingVotes: registeredVotes - total,
      turnout: total / registeredVotes,
      results: CANDIDATES.map((c) => ({ ...c, votes: d.tally[c.id] })).sort((a, b) => b.votes - a.votes),
      nota: d.tally.nota,
    });
  },
  reset() { safe.del(KEY, localStorage); },
};

export const api = DEMO ? demoApi : httpApi;
