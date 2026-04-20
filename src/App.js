import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";

import sorsuLogo from "./assets/sorsu-logo.png";

import AdminPanel from "./components/AdminPanel";
import AdminCodesPanel from "./components/AdminCodesPanel";
import AdminAnonymousResults from "./components/AdminAnonymousResults";
import AuthPage from "./components/AuthPage";
import VoterDashboard from "./components/VoterDashboard";
import CandidatesPage from "./components/CandidatesPage";
import AdminFeedback from "./pages/AdminFeedback";
import BallotReceiptPage from "./components/BallotReceiptPage"; // ✅ Proper ballot page

const API_URL = "http://localhost:5000";

function App() {
  const [candidates, setCandidates] = useState([]);
  const [showAnonymous, setShowAnonymous] = useState(false);
  const [electionClosed, setElectionClosed] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  });

  const [candidateForm, setCandidateForm] = useState({
    firstName: "",
    lastName: "",
    candidacy: "",
    partylist: "",
    yearLevel: "",
    block: "",
    course: "",
    description: "",
    image: null,
  });

  const theme = {
    background: "#f1f5f9",
    navbar: "#ffffff",
    card: "#ffffff",
    text: "#0f172a",
    button: "#6366f1",
  };

  // Fetch candidates every 10 seconds
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/candidates`);
      setCandidates(res.data);
    } catch {
      setMessage("Failed to load candidates.");
    }
  };

  useEffect(() => {
    fetchCandidates();
    const interval = setInterval(fetchCandidates, 10000);
    return () => clearInterval(interval);
  }, []);

  // Check if user has voted
  useEffect(() => {
    const fetchMyVotes = async () => {
      if (!auth.token) return;

      try {
        const res = await axios.get(`${API_URL}/api/votes`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setHasVoted(res.data.length > 0);
      } catch (err) {
        console.error("Vote fetch error:", err);
      }
    };
    fetchMyVotes();
  }, [auth.token]);

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null });
  };

  const handleSaveCandidate = async () => {
    try {
      const formData = new FormData();
      Object.keys(candidateForm).forEach((key) => {
        if (candidateForm[key]) formData.append(key, candidateForm[key]);
      });

      if (editId) {
        await axios.put(`${API_URL}/api/candidates/${editId}`, formData, {
          headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "multipart/form-data" },
        });
        setMessage("Candidate updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/candidates`, formData, {
          headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "multipart/form-data" },
        });
        setMessage("Candidate added successfully.");
      }

      setCandidateForm({
        firstName: "",
        lastName: "",
        candidacy: "",
        partylist: "",
        yearLevel: "",
        block: "",
        course: "",
        description: "",
        image: null,
      });
      setEditId(null);
      fetchCandidates();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save candidate.");
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/candidates/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setMessage("Candidate deleted.");
      fetchCandidates();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Delete failed.");
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  return (
    <Router>
      {!auth.token && (
        <Routes>
          <Route path="*" element={<AuthPage setAuth={setAuth} />} />
        </Routes>
      )}

      {auth.token && <AdminApp
        auth={auth}
        theme={theme}
        candidates={candidates}
        candidateForm={candidateForm}
        setCandidateForm={setCandidateForm}
        editId={editId}
        setEditId={setEditId}
        handleSaveCandidate={handleSaveCandidate}
        handleDeleteCandidate={handleDeleteCandidate}
        showAnonymous={showAnonymous}
        setShowAnonymous={setShowAnonymous}
        electionClosed={electionClosed}
        setElectionClosed={setElectionClosed}
        hasVoted={hasVoted}
        message={message}
        totalVotes={totalVotes}
        handleLogout={handleLogout}
      />}
    </Router>
  );
}

function AdminApp({
  auth, theme, candidates, candidateForm, setCandidateForm, editId, setEditId,
  handleSaveCandidate, handleDeleteCandidate, showAnonymous, setShowAnonymous,
  electionClosed, setElectionClosed, hasVoted, message, totalVotes, handleLogout
}) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.background, color: theme.text }}>
      {/* NAVBAR */}
      <div style={navbarStyle(theme)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={sorsuLogo} alt="SorSU Logo" style={{ height: 50 }} />
          <div>
            <h1 style={{ margin: 0 }}>SorSU Online Voting</h1>
            <small style={{ opacity: 0.6 }}>Official Student Election Portal</small>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {auth.role === "admin" && window.location.pathname === "/admin-feedback" && (
            <button onClick={() => navigate(-1)} style={modernButton(theme)}>← Back</button>
          )}

          {(auth.role === "user" || auth.role === "voter") && (
            <>
              <Link to="/dashboard" style={modernButton(theme)}>Dashboard</Link>
              <Link to="/candidates" style={modernButton(theme)}>Candidates</Link>
              {hasVoted && <Link to="/my-votes" style={modernButton(theme)}>My Ballot</Link>}
            </>
          )}

          {auth.role === "admin" && window.location.pathname !== "/admin-feedback" && (
            <>
              <Link to="/admin-feedback" style={modernButton(theme)}>Feedback</Link>

              <button onClick={() => setShowAnonymous(!showAnonymous)} style={modernButton(theme)}>
                {showAnonymous ? "Hide Chart" : "Anonymous Chart"}
              </button>

              <button
                onClick={() => setElectionClosed(!electionClosed)}
                style={{
                  ...modernButton(theme),
                  backgroundColor: electionClosed ? "#10b981" : "#ef4444",
                }}
              >
                {electionClosed ? "Open Election" : "Close Election"}
              </button>
            </>
          )}

          <button onClick={handleLogout} style={{ ...modernButton(theme), backgroundColor: "#ef4444" }}>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
        <Routes>
          {/* Voter/User Routes */}
          {(auth.role === "user" || auth.role === "voter") && (
            <>
              <Route path="/dashboard" element={<VoterDashboard auth={auth} electionClosed={electionClosed} />} />
              <Route path="/candidates" element={<CandidatesPage auth={auth} />} />
              <Route path="/my-votes" element={<BallotReceiptPage auth={auth} />} /> {/* ✅ Fixed */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}

          {/* Admin Routes */}
          {auth.role === "admin" && (
            <>
              <Route path="/admin-feedback" element={<AdminFeedback />} />
              <Route
                path="*"
                element={
                  <>
                    <h2>Live Vote Monitor</h2>

                    {message && (
                      <div style={{
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 20
                      }}>
                        {message}
                      </div>
                    )}

                    {showAnonymous ? (
                      <AdminAnonymousResults theme={theme} />
                    ) : (
                      <>
                        <div style={{
                          backgroundColor: theme.card,
                          padding: 15,
                          borderRadius: 8,
                          marginBottom: 20
                        }}>
                          <strong>Total Votes:</strong> {totalVotes}
                        </div>

                        <AdminPanel
                          candidateForm={candidateForm}
                          setCandidateForm={setCandidateForm}
                          onSave={handleSaveCandidate}
                          editId={editId}
                          setEditId={setEditId}
                          onDelete={handleDeleteCandidate}
                          candidates={candidates}
                          theme={theme}
                        />

                        <AdminCodesPanel />
                      </>
                    )}
                  </>
                }
              />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const modernButton = (theme) => ({
  padding: "8px 14px",
  backgroundColor: theme.button,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  textDecoration: "none",
});

const navbarStyle = (theme) => ({
  position: "sticky",
  top: 0,
  zIndex: 1000,
  backgroundColor: theme.navbar,
  padding: "18px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
});

export default App;