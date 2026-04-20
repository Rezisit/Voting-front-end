import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function ResultsPage() {
  const [candidates, setCandidates] = useState([]);
  const [winner, setWinner] = useState(null);
  const [electionEnded, setElectionEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Get candidates
        const candidatesRes = await axios.get(`${API_URL}/api/candidates`);
        setCandidates(candidatesRes.data);

        // Check election status
        const statusRes = await axios.get(`${API_URL}/api/votes/status`);
        const ended = statusRes.data.electionEnded;
        setElectionEnded(ended);

        // If ended → get winner
        if (ended) {
          const winnerRes = await axios.get(
            `${API_URL}/api/votes/winner`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setWinner(winnerRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading results...</div>;
  }

  // Sort candidates by votes
  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.votes || 0) - (a.votes || 0)
  );

  return (
    <div style={{ padding: "20px 30px" }}>
      <h1>Election Results</h1>

      {/*  WINNER */}
      {electionEnded && winner && (
        <div
          style={{
            marginBottom: 30,
            padding: 25,
            borderRadius: 12,
            background: "linear-gradient(135deg, #FFD700, #FFF3B0)",
            textAlign: "center",
            boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
            border: "2px solid #E6C200",
          }}
        >
          <h2> Official Winner</h2>
          <h1>{winner.winner}</h1>
          <p>Total Votes: {winner.votes}</p>
        </div>
      )}

      {/*  ONGOING MESSAGE */}
      {!electionEnded && (
        <p style={{ marginBottom: 20 }}>
           Election is still ongoing...
        </p>
      )}

      {/*  RESULTS LIST */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2>All Candidates</h2>

        {sortedCandidates.map((c, index) => (
          <div
            key={c._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
              fontWeight: index === 0 ? "bold" : "normal",
            }}
          >
            <span>
              {index === 0 && electionEnded ? " " : ""}
              Candidate {index + 1}
            </span>
            <span>{c.votes || 0} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsPage;