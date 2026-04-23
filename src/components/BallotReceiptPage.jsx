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

        setVotes(res.data || []);

      } catch (err) {
        console.error("BALLOT ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [auth]);

  const groupedVotes = votes.reduce((acc, vote) => {
    if (!vote.position) return acc;

    if (!acc[vote.position]) acc[vote.position] = [];
    acc[vote.position].push(vote);

    return acc;
  }, {});

  if (loading) return <p>Loading your ballot...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>Official Voting Receipt</h2>

      {Object.keys(groupedVotes).length === 0 ? (
        <p>No vote records found.</p>
      ) : (
        Object.entries(groupedVotes).map(([position, list]) => (
          <div key={position}>
            <h3>{position}</h3>

            {list.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                {v.image && (
                  <img
                    src={`${API_URL}/uploads/${v.image}`}
                    width={60}
                  />
                )}

                <strong>{v.candidateName}</strong>
              </div>
            ))}
          </div>
        ))
      )}

      <button onClick={() => window.print()}>
        Print Receipt
      </button>
    </div>
  );
}

export default BallotReceiptPage;