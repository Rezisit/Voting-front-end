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

// Register chart components
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

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/candidates`);
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
    const interval = setInterval(fetchCandidates, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCandidates]);

  // Reset votes
  const handleResetVotes = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all votes?"
    );
    if (!confirmReset) return;

    try {
      setResetting(true);
      await axios.post(`${API_URL}/api/admin/reset-votes`);
      await fetchCandidates();
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Failed to reset votes");
    } finally {
      setResetting(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    if (!candidates.length) return;

    let csv = "Position,Candidate,Votes\n";

    candidates.forEach((c, index) => {
      csv += `${c.candidacy || "Other"},Candidate ${
        index + 1
      },${c.votes || 0}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "election_results.csv";
    link.click();
  };

  // Group candidates
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    const position = candidate.candidacy || "Other";
    if (!acc[position]) acc[position] = [];
    acc[position].push(candidate);
    return acc;
  }, {});

  if (loading) {
    return <div style={{ padding: 20 }}>Loading results...</div>;
  }

  return (
    <div style={{ padding: "20px 30px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2>Anonymous Election Monitor</h2>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Export Button */}
          <button
            onClick={handleExport}
            style={{
              backgroundColor: "#1E3A8A",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Export CSV
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetVotes}
            disabled={resetting}
            style={{
              backgroundColor: "#B11226",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              opacity: resetting ? 0.7 : 1,
            }}
          >
            {resetting ? "Resetting..." : "Reset Votes"}
          </button>
        </div>
      </div>

      {/* Charts */}
      {Object.entries(groupedCandidates).map(([position, list]) => {
        const sorted = [...list].sort(
          (a, b) => (b.votes || 0) - (a.votes || 0)
        );

        const labels = sorted.map(
          (_, index) => `Candidate ${index + 1}`
        );
        const votes = sorted.map((c) => c.votes || 0);

        const colors = [
          "#B11226",
          "#1E3A8A",
          "#E63946",
          "#3B82F6",
          "#7F1D1D",
          "#1E40AF",
          "#F87171",
          "#60A5FA",
        ];

        const dataset = {
          label: `${position} Votes`,
          data: votes,
          backgroundColor: colors,
        };

        return (
          <div
            key={position}
            style={{
              marginBottom: 40,
              backgroundColor: theme?.card || "#fff",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginBottom: 20 }}>{position}</h3>

            {/* RESPONSIVE GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 30,
                alignItems: "center",
              }}
            >
              {/* BAR CHART */}
              <div style={{ height: 300 }}>
                <Bar
                  data={{ labels, datasets: [dataset] }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                    },
                  }}
                />
              </div>

              {/* PIE CHART */}
              <div
                style={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pie
                  data={{ labels, datasets: [dataset] }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
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