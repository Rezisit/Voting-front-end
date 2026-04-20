import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ FIXED: wrapped in useCallback to avoid warning
  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFeedbacks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  
  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
          feedbacks.length
        ).toFixed(1)
      : 0;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}> Voter Feedback</h1>

      {/* STATS */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>Total Feedback</h3>
          <p>{feedbacks.length}</p>
        </div>

        <div style={styles.statCard}>
          <h3>Average Rating</h3>
          <p>{averageRating} ⭐</p>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <div style={styles.grid}>
          {feedbacks.map((fb) => (
            <div key={fb._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <strong>
                  {fb.user?.name || `Voter (${fb.voter?.code})`}
                </strong>
                <span style={styles.date}>
                  {new Date(fb.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Rating */}
              <div style={styles.rating}>
                {fb.rating
                  ? "⭐".repeat(fb.rating)
                  : "No rating provided"}
              </div>

              {/* Message */}
              <p style={styles.message}>{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ✅ FIX: styles added */
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  statCard: {
    flex: 1,
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "15px",
  },
  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  date: {
    fontSize: "12px",
    color: "#888",
  },
  rating: {
    marginBottom: "10px",
    color: "#f5a623",
    fontSize: "16px",
  },
  message: {
    fontSize: "14px",
    color: "#333",
  },
};

export default AdminFeedback;