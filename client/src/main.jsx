import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./styles.css";
import { DEMO, session } from "./api.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Ballot from "./pages/Ballot.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function Shell({ children }) {
  const navigate = useNavigate();
  const me = session.current()?.user;
  return (
    <>
      {DEMO && <div className="demo">Demo mode: sample data, stored only in this browser. The real app runs on the Express and MySQL API in this repo.</div>}
      <header className="bar">
        <Link to="/" className="logo"><span className="tick" aria-hidden="true" />Online Voting</Link>
        {me && (
          <div className="me">
            <span>{me.username} <em>{me.userType.toLowerCase()}</em></span>
            <button className="btn ghost sm" onClick={() => { session.clear(); navigate("/"); }}>Sign out</button>
          </div>
        )}
      </header>
      <main className="page">{children}</main>
    </>
  );
}

function Guard({ role, children }) {
  const s = session.current();
  if (!s) return <Navigate to="/" replace />;
  if (s.user.userType !== role) return <Navigate to={s.user.userType === "Officer" ? "/officer" : "/ballot"} replace />;
  return children;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ballot" element={<Guard role="Voter"><Ballot /></Guard>} />
          <Route path="/officer" element={<Guard role="Officer"><Dashboard /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </HashRouter>
  </React.StrictMode>
);
