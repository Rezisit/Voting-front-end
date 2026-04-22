import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import sorsuLogo from "../assets/sorsu-logo.png";

const API_URL = "http://localhost:5000";

const THEME = {
  primary: "#B11226",
  primaryDark: "#8E0E1E",
  background: "#F8F9FA",
  white: "#FFFFFF",
  textDark: "#1F2937",
  lightGray: "#E5E7EB",
};

function VotingPage({ auth }) {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Vote modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("confirm");

  // Feedback modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);

  const navigate = useNavigate();

  // Fetch candidates and user votes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resCandidates = await axios.get(`${API_URL}/api/candidates`);
        setCandidates(resCandidates.data);

        if (auth?.token) {
          const resVotes = await axios.get(`${API_URL}/api/votes`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });

          const selectedVotes = {};
          resVotes.data.forEach((v) => {
            selectedVotes[v.position] = v.candidateId;
          });

          setSelected(selectedVotes);

          if (resVotes.data.length > 0) setHasVoted(true);
        }
      } catch (err) {
        console.error(err);
        setModalType("error");
        setModalMessage("Failed to load candidates or votes.");
        setShowModal(true);
      }
      setLoading(false);
    };

    fetchData();
  }, [auth]);

  // Group candidates by position
  const groupedCandidates = useMemo(() => {
    return candidates.reduce((groups, candidate) => {
      const position = candidate.candidacy;
      if (!groups[position]) groups[position] = [];
      groups[position].push(candidate);
      return groups;
    }, {});
  }, [candidates]);

  // Handle candidate selection
  const handleSelect = (position, candidateId) => {
    if (hasVoted) return;
    setSelected((prev) => ({
      ...prev,
      [position]: prev[position] === candidateId ? null : candidateId,
    }));
  };

  // Cast vote button
  const handleCastVote = () => {
    if (!auth?.token) {
      setModalType("error");
      setModalMessage("You must be logged in to vote.");
      setShowModal(true);
      return;
    }

    if (Object.keys(selected).filter((k) => selected[k]).length === 0) {
      setModalType("error");
      setModalMessage("Please select a candidate first.");
      setShowModal(true);
      return;
    }

    setModalType("confirm");
    setModalMessage("Are you sure you want to cast your vote?");
    setShowModal(true);
  };

  // ✅ FIXED CONFIRM VOTE
  const confirmVote = async () => {
  try {
    setSubmitting(true);

    // ✅ Build proper vote structure (IMPORTANT FIX)
    const votes = Object.entries(selected)
      .filter(([_, candidateId]) => candidateId)
      .map(([position, candidateId]) => ({
        candidateId,
        position,
      }));

    // ❗ DEBUG (you can remove later)
    console.log("SENDING VOTES:", votes);

    await axios.post(
      `${API_URL}/api/votes/batch`,
      { votes },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

  
    setHasVoted(true);
    setSelected({});
    setShowModal(false);
    setShowFeedback(true);
  } catch (err) {
    console.error("VOTE ERROR:", err.response?.data || err.message);

    setModalType("error");
    setModalMessage(
      err.response?.data?.message || "Vote failed. Please try again."
    );
    setShowModal(true);
  } finally {
    setSubmitting(false);
  }
  };

  if (loading) return <div style={{ padding: 50 }}>Loading candidates...</div>;

  return (
    <div style={{ backgroundColor: THEME.background, minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(to right, ${THEME.primary}, ${THEME.primaryDark})`,
          color: "white",
          textAlign: "center",
          padding: "20px 0",
          fontWeight: "bold",
          fontSize: 22,
        }}
      >
        <img src={sorsuLogo} alt="SorSU Logo" style={{ height: 50, marginRight: 10 }} />
        OFFICIAL CANDIDATES LIST 2026
      </div>

      {/* CANDIDATES */}
      <div style={{ padding: 60, maxWidth: 1300, margin: "auto" }}>
        {Object.entries(groupedCandidates).map(([position, list]) => (
          <div key={position} style={{ marginBottom: 60 }}>
            <h2
              style={{
                marginBottom: 30,
                color: THEME.primary,
                borderLeft: `6px solid ${THEME.primary}`,
                paddingLeft: 15,
              }}
            >
              {position}
            </h2>
            <div style={{ display: "flex", gap: 20, overflowX: "auto" }}>
              {list.map((candidate) => {
                const isSelected = selected[position] === candidate._id;
                const alreadyVoted = hasVoted;
                return (
                  <div
                    key={candidate._id}
                    onClick={() => handleSelect(position, candidate._id)}
                    style={{
                      width: 240,
                      backgroundColor: THEME.white,
                      borderRadius: 15,
                      padding: 20,
                      cursor: alreadyVoted ? "not-allowed" : "pointer",
                      opacity: alreadyVoted ? 0.6 : 1,
                      border: isSelected
                        ? `4px solid ${THEME.primary}`
                        : "2px solid transparent",
                      boxShadow: isSelected
                        ? "0 15px 30px rgba(177,18,38,0.3)"
                        : "0 10px 25px rgba(0,0,0,0.05)",
                      transition: "0.3s",
                    }}
                  >
                    {candidate.image ? (
                      <img
                        src={`${API_URL}/uploads/${candidate.image}`}
                        alt=""
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 10,
                          marginBottom: 12,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: 180,
                          backgroundColor: "#ddd",
                          borderRadius: 10,
                          marginBottom: 12,
                        }}
                      />
                    )}
                    <h3>
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p>
                      <strong>Course:</strong> {candidate.course || "N/A"}
                    </p>
                    <p>
                      <strong>Year & Block:</strong> {candidate.yearLevel || "N/A"} -{" "}
                      {candidate.block || ""}
                    </p>
                    <p>
                      <strong>Partylist:</strong> {candidate.partylist || "Independent"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CAST VOTE BUTTON */}
        {!hasVoted && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={handleCastVote}
              disabled={submitting}
              style={{
                padding: "15px 40px",
                fontSize: 18,
                fontWeight: "bold",
                backgroundColor: THEME.primary,
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Cast Vote"}
            </button>
          </div>
        )}
      </div>

      {/* VOTE MODAL */}
      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>
              {modalType === "confirm"
                ? "Confirm Vote"
                : modalType === "success"
                ? "Success"
                : "Error"}
            </h3>
            <p style={{ marginBottom: 20 }}>{modalMessage}</p>
            {modalType === "confirm" ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button style={modalStyles.cancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button style={modalStyles.confirm} onClick={confirmVote}>
                  Confirm
                </button>
              </div>
            ) : (
              <button style={modalStyles.confirm} onClick={() => setShowModal(false)}>
                OK
              </button>
            )}
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {showFeedback && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>We value your feedback!</h3>
            <p>How was your voting experience?</p>

            <div style={{ margin: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: 30,
                    color: star <= rating ? "#FFD700" : "#ccc",
                    cursor: "pointer",
                    marginRight: 5,
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                margin: "15px 0",
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
              placeholder="Type your feedback here..."
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                style={modalStyles.cancel}
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackText("");
                  setRating(0);
                  navigate("/my-votes");
                }}
              >
                Skip
              </button>

              <button
                style={modalStyles.confirm}
                onClick={async () => {
                  try {
                    await axios.post(
                      `${API_URL}/api/feedback`,
                      { message: feedbackText, rating },
                      { headers: { Authorization: `Bearer ${auth.token}` } }
                    );

                    setShowFeedback(false);
                    setFeedbackText("");
                    setRating(0);
                    navigate("/my-votes");
                  } catch (err) {
                    console.error(err);
                    alert(err.response?.data?.message || "Failed to submit feedback.");
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    width: 380,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    textAlign: "center",
  },
  cancel: {
    padding: "10px 20px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  confirm: {
    padding: "10px 20px",
    backgroundColor: "#B11226",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default VotingPage;