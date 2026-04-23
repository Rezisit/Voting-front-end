import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

function BallotReceiptPage({ auth }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const token = auth?.token || localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/api/votes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setVotes(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("BALLLOT ERROR:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to load ballot.");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [auth]);

  // GROUP BY POSITION
  const groupedVotes = votes.reduce((acc, vote) => {
    if (!vote?.position) return acc;

    if (!acc[vote.position]) acc[vote.position] = [];
    acc[vote.position].push(vote);

    return acc;
  }, {});

  const handlePrint = () => window.print();

  if (loading) return <p>Loading your ballot...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.receipt}>

        <div style={styles.header}>
          <h2>Official Voting Receipt</h2>
          <p>{new Date().toLocaleString()}</p>
          <span style={styles.badge}>✔ Verified Vote</span>
        </div>

        {Object.keys(groupedVotes).length === 0 ? (
          <p>No vote records found for this account.</p>
        ) : (
          Object.keys(groupedVotes).map((position) => (
            <div key={position} style={styles.section}>
              <h3 style={styles.position}>{position}</h3>

              {groupedVotes[position].map((v, index) => (
                <div key={index} style={styles.voteItem}>

                  {v.image && (
                    <img
                      src={`${API_URL}/uploads/${v.image}`}
                      alt="candidate"
                      style={styles.image}
                    />
                  )}

                  <div>
                    <strong>
                      {v.candidateName || "Unknown Candidate"}
                    </strong>
                  </div>

                </div>
              ))}
            </div>
          ))
        )}

        <button onClick={handlePrint} style={styles.printBtn}>
          Print Receipt
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: "40px auto" },
  receipt: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  header: {
    borderBottom: "1px solid #eee",
    marginBottom: 20,
    paddingBottom: 10,
  },
  badge: {
    background: "#10b981",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
  },
  section: { marginBottom: 20, textAlign: "left" },
  position: { color: "#B11226", marginBottom: 10 },
  voteItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  image: { width: 50, height: 50, borderRadius: 6 },
  printBtn: {
    marginTop: 20,
    padding: "10px 20px",
    background: "#B11226",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default BallotReceiptPage;