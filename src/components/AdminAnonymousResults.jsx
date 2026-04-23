import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = "http://localhost:5000";
const REFRESH_INTERVAL = 2000;

function AdminAnonymousResults({ theme = {} }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  // 🔥 NEW: toggle view
  const [viewMode, setViewMode] = useState("censored"); 
  // "censored" | "uncensored"

  // ======================
  // FETCH
  // ======================
  const fetchCandidates = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/candidates`);
      setCandidates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
    const interval = setInterval(fetchCandidates, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCandidates]);

  // ======================
  // RESET
  // ======================
  const handleResetVotes = async () => {
    if (!window.confirm("Reset all votes?")) return;

    try {
      setResetting(true);
      await axios.post(`${API_URL}/api/admin/reset-votes`);
      await fetchCandidates();
    } catch (err) {
      alert("Reset failed");
    } finally {
      setResetting(false);
    }
  };

  // ======================
  // GROUP
  // ======================
  const groupedCandidates = candidates.reduce((acc, c) => {
    const pos = c.candidacy || "Other";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(c);
    return acc;
  }, {});

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 30 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Election Results Dashboard</h2>

        <div style={{ display: "flex", gap: 10 }}>
          {/* TOGGLE BUTTON */}
          <button
            onClick={() =>
              setViewMode(viewMode === "censored" ? "uncensored" : "censored")
            }
            style={{
              padding: "10px 15px",
              borderRadius: 8,
              border: "none",
              background: "#1E3A8A",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {viewMode === "censored"
              ? "Show Real Names"
              : "Hide Names"}
          </button>

          {/* RESET */}
          <button
            onClick={handleResetVotes}
            disabled={resetting}
            style={{
              backgroundColor: "#B11226",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: 8,
              border: "none",
            }}
          >
            {resetting ? "Resetting..." : "Reset Votes"}
          </button>
        </div>
      </div>

      {/* CHARTS */}
      {Object.entries(groupedCandidates).map(([position, list]) => {
        const sorted = [...list].sort(
          (a, b) => (b.votes || 0) - (a.votes || 0)
        );

        // 🔥 LABEL LOGIC
        const labels =
          viewMode === "censored"
            ? sorted.map((_, i) => `Candidate ${i + 1}`)
            : sorted.map(
                (c) => `${c.firstName} ${c.lastName}`
              );

        const votes = sorted.map((c) => c.votes || 0);

        const colors = [
          "#B11226",
          "#1E3A8A",
          "#E63946",
          "#3B82F6",
          "#7F1D1D",
          "#1E40AF",
        ];

        const dataset = {
          label: position,
          data: votes,
          backgroundColor: colors,
        };

        return (
          <div
            key={position}
            style={{
              marginTop: 30,
              background: "#fff",
              padding: 20,
              borderRadius: 12,
            }}
          >
            <h3>{position}</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              {/* BAR */}
              <div style={{ height: 300 }}>
                <Bar
                  data={{ labels, datasets: [dataset] }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>

              {/* PIE */}
              <div style={{ height: 300 }}>
                <Pie
                  data={{ labels, datasets: [dataset] }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AdminAnonymousResults;