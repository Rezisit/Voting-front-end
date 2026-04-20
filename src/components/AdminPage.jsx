import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function AdminPage({ theme }) {
  const [candidates, setCandidates] = useState([]);
  const [electionOpen, setElectionOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // ======================
  // FETCH CANDIDATES
  // ======================
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // ======================
  // FETCH ELECTION STATUS
  // ======================
  const fetchElectionStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/election/status`);
      setElectionOpen(res.data.isOpen);
    } catch (err) {
      console.error("Error fetching election status:", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchElectionStatus();
  }, []);

  // ======================
  // CLOSE ELECTION BUTTON
  // ======================
  const handleCloseElection = async () => {
    const confirmClose = window.confirm(
      "Are you sure you want to close the election?"
    );

    if (!confirmClose) return;

    try {
      setLoading(true);

      const res = await axios.put(`${API_URL}/election/close`);

      setElectionOpen(false);
      alert(res.data.message || "Election closed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to close election.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // OPEN ELECTION (optional)
  // ======================
  const handleOpenElection = async () => {
    try {
      setLoading(true);

      const res = await axios.put(`${API_URL}/election/open`);

      setElectionOpen(true);
      alert(res.data.message || "Election opened successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to open election.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      {/* STATUS */}
      <h3>
        Election Status:{" "}
        <span style={{ color: electionOpen ? "green" : "red" }}>
          {electionOpen ? "OPEN" : "CLOSED"}
        </span>
      </h3>

      {/* CLOSE / OPEN BUTTON */}
      {electionOpen ? (
        <button
          onClick={handleCloseElection}
          disabled={loading}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          {loading ? "Closing..." : "Close Election"}
        </button>
      ) : (
        <button
          onClick={handleOpenElection}
          disabled={loading}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          {loading ? "Opening..." : "Open Election"}
        </button>
      )}

      {/* CANDIDATES LIST */}
      <h2>Candidates</h2>
      <ul>
        {candidates.map((c) => (
          <li key={c._id}>
            {c.name} - {c.party}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;