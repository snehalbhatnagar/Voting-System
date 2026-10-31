import { useEffect, useState } from "react";
import { api } from "../api.js";
import Symbol from "../Symbol.jsx";

export default function Ballot() {
  const [data, setData] = useState(null);
  const [choice, setChoice] = useState(undefined); // candidate id, null for NOTA
  const [confirming, setConfirming] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.candidates().then(setData).catch((e) => setError(e.message)); }, []);

  const picked = data?.candidates.find((c) => c.id === choice);
  const cast = async () => {
    setBusy(true); setError("");
    try { const r = await api.vote(choice); setReceipt(r.message); }
    catch (e) { setError(e.message); setConfirming(false); }
    finally { setBusy(false); }
  };

  if (error && !data) return <p className="err">{error}</p>;
  if (!data) return <p className="muted">Loading your ballot...</p>;

  if (receipt || data.hasVoted) {
    return (
      <div className="card narrow center">
        <div className="big-tick" aria-hidden="true" />
        <h1>{receipt ? "Vote recorded" : "You have already voted"}</h1>
        <p>{receipt ? "Thank you. Your choice is stored without your name attached, and this account cannot vote again." : "Each registered voter can cast one ballot. Your ballot has been counted."}</p>
      </div>
    );
  }

  return (
    <div className="ballot">
      <h1>Your ballot</h1>
      <p className="muted">Choose one option. You can change your selection until you confirm.</p>
      <div className="options" role="radiogroup" aria-label="Candidates">
        {data.candidates.map((c) => (
          <button key={c.id} role="radio" aria-checked={choice === c.id} className={`opt ${choice === c.id ? "on" : ""}`} onClick={() => setChoice(c.id)}>
            <Symbol name={c.symbol} />
            <span className="who"><strong>{c.name}</strong><span>{c.party}</span></span>
            <span className="radio" aria-hidden="true" />
          </button>
        ))}
        <button role="radio" aria-checked={choice === null} className={`opt nota ${choice === null ? "on" : ""}`} onClick={() => setChoice(null)}>
          <Symbol name="nota" />
          <span className="who"><strong>None of the above</strong><span>Record a vote for no candidate</span></span>
          <span className="radio" aria-hidden="true" />
        </button>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn wide" disabled={choice === undefined} onClick={() => setConfirming(true)}>Review vote</button>

      {confirming && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="cf">
          <div className="card narrow">
            <h2 id="cf">Confirm your vote</h2>
            <p>You are voting for <strong>{picked ? `${picked.name}, ${picked.party}` : "none of the above"}</strong>. After you confirm, you cannot change it.</p>
            <div className="row">
              <button className="btn" onClick={cast} disabled={busy}>{busy ? "Recording..." : "Confirm vote"}</button>
              <button className="btn ghost" onClick={() => setConfirming(false)} disabled={busy}>Go back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
