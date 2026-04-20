import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function ResultsPage() {
  const [results, setResults] = useState([]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vote/results`);

      const updated = res.data.map(position => {
        const totalVotes = position.candidates.reduce(
          (sum, c) => sum + c.votes,
          0
        );

        const candidates = position.candidates.map(c => ({
          ...c,
          percent: totalVotes === 0
            ? 0
            : Math.round((c.votes / totalVotes) * 100)
        }));

        return { ...position, candidates };
      });

      setResults(updated);

    } catch (err) {
      console.error("Failed to fetch results");
    }
  };

  useEffect(() => {
    fetchResults();

    const interval = setInterval(fetchResults, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Live Election Results</h1>

      {results.map(pos => (
        <div key={pos.position} style={{ marginBottom: 40 }}>
          <h2>{pos.position}</h2>

          {pos.candidates.map(c => (
            <div key={c.candidateId} style={{ marginBottom: 15 }}>
              <strong>{c.name}</strong> — {c.votes} votes ({c.percent}%)

              <div
                style={{
                  background: "#eee",
                  height: 20,
                  borderRadius: 10,
                  overflow: "hidden",
                  marginTop: 5
                }}
              >
                <div
                  style={{
                    width: `${c.percent}%`,
                    background: "#B11226",
                    height: "100%"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default ResultsPage;