import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

function AdminPanel({
  candidateForm,
  setCandidateForm,
  onSave,
  editId,
  setEditId,
  onDelete,
  candidates,
  theme,
}) {

  const [codes, setCodes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [stats, setStats] = useState({
    totalVoterCodes: 0,
    usedCodes: 0,
    totalVotes: 0,
    turnout: 0,
  });

  const positions = [
    "President",
    "Vice President",
    "Secretary",
    "Treasurer",
    "Auditor",
    "Business Manager",
  ];

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const blocks = ["Block 1", "Block 2", "Block 3"];

 
  const courses = ["BSIT", "BPA", "BSCS",  "BSENTREP", "BTVTED"];

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ================= FETCH ================= */

  const fetchCodes = async () => {
    try {
      const res = await axios.get(`${API_URL}/codes`, authHeader);
      setCodes(res.data);
    } catch (error) {
      console.error("Error fetching voter codes:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`, authHeader);
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchCodes();
    fetchStats();
  }, []);

  /* ================= ACTIONS ================= */

  const generateCodes = async () => {
    const amount = prompt("Enter number of voter codes to generate:");

    if (!amount || isNaN(amount)) {
      alert("Please enter a valid number.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/generate-codes`,
        { amount: Number(amount) },
        authHeader
      );

      fetchCodes();
      fetchStats();

      alert(`${amount} voter codes generated successfully.`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate codes.");
    }
  };

  const deleteCode = async (id) => {
    if (!window.confirm("Delete this voter code?")) return;

    try {
      await axios.delete(`${API_URL}/codes/${id}`, authHeader);
      fetchCodes();
      fetchStats();
    } catch (error) {
      alert("Failed to delete voter code.");
    }
  };

  const resetElection = async () => {
    if (!window.confirm("Reset entire election? All votes will be deleted."))
      return;

    try {
      await axios.post(`${API_URL}/reset-election`, {}, authHeader);
      fetchCodes();
      fetchStats();
      alert("Election reset successfully.");
    } catch (error) {
      alert("Failed to reset election.");
    }
  };

  /* ================= FORM ================= */

  const handleCancelEdit = () => {
    setCandidateForm({
      firstName: "",
      lastName: "",
      candidacy: "",
      partylist: "",
      yearLevel: "",
      block: "",
      course: "", // ✅
      description: "",
      image: null,
    });

    setEditId(null);
  };

  const handleEditClick = (candidate) => {
    setEditId(candidate._id);

    setCandidateForm({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      candidacy: candidate.candidacy,
      partylist: candidate.partylist || "",
      yearLevel: candidate.yearLevel || "",
      block: candidate.block || "",
      course: candidate.course || "", // ✅
      description: candidate.description || "",
      image: null,
    });
  };

  /* ================= FILTER ================= */

  const filteredCandidates = candidates.filter(
    (c) => !selectedCourse || c.course === selectedCourse
  );

  /* ================= UI ================= */

  return (
    <div style={containerStyle(theme)}>

      {/* ================= STATS ================= */}
      <h3 style={{ color: theme.text }}>Election Statistics</h3>

      <div style={statsContainer}>
        <StatCard title="Total Codes" value={stats.totalVoterCodes} theme={theme} />
        <StatCard title="Votes Cast" value={stats.totalVotes} theme={theme} />
      
      </div>

      <button onClick={resetElection} style={resetButton}>
        Reset Election
      </button>

      {/* ================= FORM ================= */}
      <h3 style={{ color: theme.text }}>
        {editId ? "Edit Candidate" : "Add Candidate"}
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        style={formStyle}
      >

        <input
          type="text"
          placeholder="First Name"
          value={candidateForm.firstName}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, firstName: e.target.value })
          }
          style={inputStyle(theme)}
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={candidateForm.lastName}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, lastName: e.target.value })
          }
          style={inputStyle(theme)}
          required
        />

        <select
          value={candidateForm.candidacy}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, candidacy: e.target.value })
          }
          style={inputStyle(theme)}
          required
        >
          <option value="">Select Position</option>
          {positions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={candidateForm.yearLevel}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, yearLevel: e.target.value })
          }
          style={inputStyle(theme)}
        >
          <option value="">Year Level</option>
          {yearLevels.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={candidateForm.block}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, block: e.target.value })
          }
          style={inputStyle(theme)}
        >
          <option value="">Block</option>
          {blocks.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        {/* ✅ COURSE */}
        <select
          value={candidateForm.course}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, course: e.target.value })
          }
          style={inputStyle(theme)}
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Partylist"
          value={candidateForm.partylist}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, partylist: e.target.value })
          }
          style={inputStyle(theme)}
        />

        <textarea
          placeholder="Candidate Description"
          value={candidateForm.description}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, description: e.target.value })
          }
          style={{ ...inputStyle(theme), minHeight: 70 }}
        />

        <input
          type="file"
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, image: e.target.files[0] })
          }
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" style={primaryButton(theme)}>
            {editId ? "Save Changes" : "Add Candidate"}
          </button>

          {editId && (
            <button type="button" onClick={handleCancelEdit} style={cancelButton}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/*  FILTER */}
      <h3 style={{ color: theme.text }}>Filter by Course</h3>
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        style={inputStyle(theme)}
      >
        <option value="">All Courses</option>
        {courses.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {/* ================= CANDIDATES ================= */}
      <h3 style={{ color: theme.text }}>Current Candidates</h3>

      {filteredCandidates.length === 0 ? (
        <p>No candidates available.</p>
      ) : (
        filteredCandidates.map((c) => (
          <div key={c._id} style={candidateCard(theme)}>
            <div>
              <strong>{c.firstName} {c.lastName}</strong> — {c.candidacy}
              <br />
              <small>
                {c.partylist || "Independent"} | {c.course || "No Course"}
              </small>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleEditClick(c)} style={editButton}>
                Edit
              </button>

              <button onClick={() => onDelete(c._id)} style={deleteButton}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* ================= CODES ================= */}
      <div style={codesHeader}>
        <h3 style={{ color: theme.text }}>Voter Codes</h3>
        <button onClick={generateCodes} style={generateButton}>
          Generate Codes
        </button>
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th style={tableCell}>Code</th>
            <th style={tableCell}>Status</th>
            <th style={tableCell}>Action</th>
          </tr>
        </thead>

        <tbody>
          {codes.map((c) => (
            <tr key={c._id}>
              <td style={tableCell}>{c.code}</td>
              <td style={tableCell}>{c.used ? "Used" : "Unused"}</td>
              <td style={tableCell}>
                <button onClick={() => deleteCode(c._id)} style={deleteButton}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

/* COMPONENT */
const StatCard = ({ title, value, theme }) => (
  <div style={statCard(theme)}>
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

/* STYLES */
const containerStyle = (theme) => ({
  padding: 20,
  borderRadius: 10,
  background: theme.card,
  display: "flex",
  flexDirection: "column",
  gap: 20,
});

const statsContainer = { display: "flex", gap: 20 };

const statCard = (theme) => ({
  background: theme.background,
  padding: 15,
  borderRadius: 8,
  minWidth: 120,
  textAlign: "center",
});

const formStyle = { display: "flex", flexDirection: "column", gap: 10 };

const inputStyle = () => ({
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
});

const candidateCard = (theme) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderRadius: 8,
  background: theme.background,
});

const primaryButton = (theme) => ({
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  background: theme.button,
  color: "#fff",
});

const editButton = { background: "#6366f1", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 6 };
const deleteButton = { background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 6 };
const cancelButton = { background: "#ef4444", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 };
const generateButton = { background: "#22c55e", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6 };
const resetButton = { background: "#ef4444", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6, width: 200 };
const codesHeader = { display: "flex", justifyContent: "space-between" };
const table = { width: "100%", borderCollapse: "collapse" };
const tableCell = { border: "1px solid #ccc", padding: 8, textAlign: "center" };

export default AdminPanel;