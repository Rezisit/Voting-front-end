import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function AdminLiveMonitor({ theme }) {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalCandidates: 0,
  });

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/candidates`);
      const data = res.data;

      setCandidates(data);

      const totalVotes = data.reduce(
        (sum, c) => sum + (c.votes || 0),
        0
      );

      setStats({
        totalVotes,
        totalCandidates: data.length,
      });
    } catch (err) {
      console.error("Monitor fetch error", err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const grouped = candidates.reduce((acc, c) => {
    const pos = c.candidacy || "Other";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(c);
    return acc;
  }, {});

  return (
    <div style={{ padding: 30 }}>

      <h1 style={{ marginBottom: 30 }}>
        🗳 Live Election Monitor
      </h1>

      {/* STATISTICS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>

        <div style={cardStyle}>
          <h3>Total Candidates</h3>
          <p>{stats.totalCandidates}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Votes Cast</h3>
          <p>{stats.totalVotes}</p>
        </div>

      </div>

      {/* POSITIONS */}
      {Object.entries(grouped).map(([position, list]) => {

        const sorted = [...list].sort(
          (a, b) => (b.votes || 0) - (a.votes || 0)
        );

        return (
          <div key={position} style={{ marginBottom: 40 }}>
            <h2>{position}</h2>

            {sorted.map((c) => (
              <div key={c._id} style={candidateRow}>

                <div style={{ width: 200 }}>
                  {c.firstName} {c.lastName}
                </div>

                <div style={barContainer}>
                  <div
                    style={{
                      ...bar,
                      width: `${(c.votes || 0) * 10}px`,
                    }}
                  />
                </div>

                <div style={{ width: 50 }}>
                  {c.votes || 0}
                </div>

              </div>
            ))}

          </div>
        );
      })}
    </div>
  );
}

const cardStyle = {
  background: "#f3f4f6",
  padding: 20,
  borderRadius: 10,
  minWidth: 150,
  textAlign: "center",
};

const candidateRow = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  marginBottom: 10,
};

const barContainer = {
  flex: 1,
  height: 20,
  background: "#e5e7eb",
  borderRadius: 10,
};

const bar = {
  height: "100%",
  background: "#B11226",
  borderRadius: 10,
};

export default AdminLiveMonitor;