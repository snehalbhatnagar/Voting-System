import { useEffect, useState } from "react";
import { api, DEMO } from "../api.js";
import Symbol from "../Symbol.jsx";

const fmt = (n) => n.toLocaleString("en-IN");

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const load = () => api.dashboard().then(setD).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (error) return <p className="err">{error}</p>;
  if (!d) return <p className="muted">Loading dashboard...</p>;
  const counted = d.results.reduce((a, r) => a + r.votes, 0) + d.nota;
  const top = d.results[0]?.votes || 1;

  return (
    <div className="dash">
      <div className="dash-head">
        <h1>Election dashboard</h1>
        <button className="btn ghost sm" onClick={load}>Refresh</button>
      </div>
      <div className="kpis">
        <div><span>Registered voters</span><b>{fmt(d.registeredVotes)}</b></div>
        <div><span>Voted</span><b>{fmt(d.peopleVoted)}</b></div>
        <div><span>Yet to vote</span><b>{fmt(d.pendingVotes)}</b></div>
        <div><span>Turnout</span><b>{(d.turnout * 100).toFixed(1)}%</b></div>
      </div>
      <div className="turnout" aria-label={`Turnout ${(d.turnout * 100).toFixed(1)} percent`}><i style={{ width: `${d.turnout * 100}%` }} /></div>

      <section className="card results">
        <h2>Results so far</h2>
        <ol>
          {d.results.map((r, i) => (
            <li key={r.id} className={i === 0 ? "lead" : ""}>
              <Symbol name={r.symbol} small />
              <div className="res-main">
                <div className="res-top"><strong>{r.name}</strong><span>{fmt(r.votes)} <em>{counted ? ((r.votes / counted) * 100).toFixed(1) : "0.0"}%</em></span></div>
                <div className="res-party">{r.party}</div>
                <div className="meter"><i style={{ width: `${(r.votes / top) * 100}%` }} /></div>
              </div>
            </li>
          ))}
          <li className="nota-row">
            <Symbol name="nota" small />
            <div className="res-main"><div className="res-top"><strong>None of the above</strong><span>{fmt(d.nota)}</span></div></div>
          </li>
        </ol>
      </section>
      {DEMO && <button className="btn ghost sm" onClick={() => { api.reset(); load(); }}>Reset demo data</button>}
    </div>
  );
}
