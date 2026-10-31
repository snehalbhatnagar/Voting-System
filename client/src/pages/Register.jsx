import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Register() {
  const [f, setF] = useState({ username: "", password: "", mobile: "", aadhar: "", enteredOTP: "" });
  const [sent, setSent] = useState(null); // { devCode, until }
  const [left, setLeft] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!sent) return;
    const t = setInterval(() => setLeft(Math.max(0, Math.round((sent.until - Date.now()) / 1000))), 500);
    return () => clearInterval(t);
  }, [sent]);

  const sendCode = async () => {
    setError(""); setBusy(true);
    try {
      const r = await api.requestOtp(f.mobile);
      setSent({ devCode: r.devCode, until: Date.now() + r.expiresInSeconds * 1000 });
      setLeft(r.expiresInSeconds);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try { const r = await api.register(f); setDone(r.message); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="card narrow center">
        <div className="big-tick" aria-hidden="true" />
        <h1>You're registered</h1>
        <p>{done}</p>
        <Link to="/" className="btn">Go to sign in</Link>
      </div>
    );
  }

  return (
    <form className="card narrow" onSubmit={submit} noValidate>
      <h1>Register to vote</h1>
      <p className="muted">You'll need your Aadhaar number and a phone that can receive a verification code.</p>
      <label>Username<input value={f.username} onChange={set("username")} autoComplete="username" placeholder="letters, numbers, dots, underscores" /></label>
      <label>Password<input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" placeholder="at least 8 characters" /></label>
      <label>Aadhaar number<input value={f.aadhar} onChange={set("aadhar")} inputMode="numeric" maxLength={12} placeholder="12 digits" /></label>

      <div className="otp-row">
        <label>Mobile number<input value={f.mobile} onChange={set("mobile")} inputMode="numeric" maxLength={10} placeholder="10 digits" /></label>
        <button type="button" className="btn ghost" onClick={sendCode} disabled={busy || f.mobile.length !== 10}>{sent ? "Resend code" : "Send code"}</button>
      </div>

      {sent && (
        <>
          {sent.devCode && <p className="hint">No SMS is sent in this {import.meta.env.VITE_DEMO === "true" ? "demo" : "development setup"}. Your code is <strong className="mono">{sent.devCode}</strong>.</p>}
          <label>Verification code<input value={f.enteredOTP} onChange={set("enteredOTP")} inputMode="numeric" maxLength={6} placeholder="6 digits" /></label>
          <p className="muted small">{left > 0 ? `Code expires in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : "Code expired. Send a new one."}</p>
        </>
      )}

      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" disabled={busy || !sent || f.enteredOTP.length !== 6}>Register</button>
      <p className="alt">Already registered? <Link to="/">Sign in</Link></p>
    </form>
  );
}
