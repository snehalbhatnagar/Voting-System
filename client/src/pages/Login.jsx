import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, session, DEMO, DEMO_ACCOUNTS } from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [userType, setType] = useState("Voter");
  const blank = { username: "", aadhar: "", password: "" };
  const [f, setF] = useState(DEMO ? DEMO_ACCOUNTS.Voter : blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const switchType = (t) => { setType(t); setF(DEMO ? DEMO_ACCOUNTS[t] : blank); setError(""); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const r = await api.login({ ...f, userType });
      session.save(r);
      navigate(r.user.userType === "Officer" ? "/officer" : "/ballot");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="split">
      <section className="intro">
        <h1>Cast your vote online, once and in secret.</h1>
        <p>Voters register with their Aadhaar number and a one-time code sent to their phone, then cast a single ballot. Voting officers watch turnout and results as votes come in.</p>
        <ul className="points">
          <li>One ballot per registered voter, enforced by the database</li>
          <li>Who voted and how they voted are stored in separate tables</li>
          <li>Aadhaar numbers are kept only as keyed hashes</li>
        </ul>
      </section>

      <form className="card" onSubmit={submit} noValidate>
        <div className="seg" role="tablist" aria-label="Account type">
          {["Voter", "Officer"].map((t) => (
            <button type="button" role="tab" aria-selected={userType === t} key={t} className={userType === t ? "on" : ""} onClick={() => switchType(t)}>
              {t === "Voter" ? "Voter" : "Voting officer"}
            </button>
          ))}
        </div>
        {DEMO && <p className="hint">Demo {userType.toLowerCase()} account filled in. Select Sign in.</p>}
        <label>Username<input value={f.username} onChange={set("username")} autoComplete="username" /></label>
        <label>Aadhaar number<input value={f.aadhar} onChange={set("aadhar")} inputMode="numeric" maxLength={12} placeholder="12 digits" /></label>
        <label>Password<input type="password" value={f.password} onChange={set("password")} autoComplete="current-password" /></label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        {userType === "Voter" && <p className="alt">New voter? <Link to="/register">Register to vote</Link></p>}
      </form>
    </div>
  );
}
