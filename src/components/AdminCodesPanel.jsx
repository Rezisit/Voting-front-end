import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function AdminCodesPanel({ auth }) {
  // ✅ Hooks always declared at the top
  const [codes, setCodes] = useState([]);
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Debug: see what auth contains
  console.log("Auth object:", auth);
  console.log("User role:", auth?.user?.role);

  // Fetch codes from backend
  const fetchCodes = useCallback(async () => {
    if (!auth || !auth.token) return; // prevent API call if auth not ready
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.get(`${API_URL}/api/codes`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setCodes(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch codes");
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // Generate new codes — only admins
  const generateCodes = async () => {
    if (!auth || !auth.token) return;
    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    setGenerating(true);
    setMessage("");
    try {
      await axios.post(
        `${API_URL}/api/codes/generate`,
        { amount },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setMessage("Codes generated successfully!");
      fetchCodes();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to generate codes");
    } finally {
      setGenerating(false);
    }
  };

  // Copy code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert("Code copied: " + code);
  };

  // ✅ Conditional rendering based on auth
  if (!auth || !auth.token || !auth.user) {
    return <p>Loading authentication...</p>;
  }

  // Check if the user is admin (case-insensitive, trims spaces)
  const isAdmin = auth.user.role?.trim().toLowerCase() === "admin";

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Voter Code Management</h2>

      {message && <div style={{ marginBottom: 15, color: "green" }}>{message}</div>}

      {/* Generate section only for admins */}
      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ padding: 8, marginRight: 10 }}
            min="1"
          />
          <button onClick={generateCodes} disabled={generating}>
            {generating ? "Generating..." : "Generate Codes"}
          </button>
          <button
            onClick={fetchCodes}
            style={{ marginLeft: 10 }}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading codes...</p>
      ) : codes.length === 0 ? (
        <p>No codes found</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Used</th>
              <th>Voted</th>
              <th>Copy</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.used ? "Yes" : "No"}</td>
                <td>{c.voted ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => copyCode(c.code)}>Copy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminCodesPanel;