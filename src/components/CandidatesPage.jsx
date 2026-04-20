import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

const THEME = {
  primary: "#B11226",
  primaryDark: "#8E0E1E",
  background: "#F8F9FA",
  white: "#FFFFFF",
};

function CandidatesPage({ auth }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/candidates`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("Failed to load candidates. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: THEME.background }}>

      {/* 🔴 TOP RIBBON */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(to right, ${THEME.primary}, ${THEME.primaryDark})`,
          color: "white",
          textAlign: "center",
          padding: "18px 0",
          fontWeight: "bold",
          fontSize: "22px",
          letterSpacing: "1px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        OFFICIAL CANDIDATES LIST 2026

        {/* Ribbon Tail */}
        <div
          style={{
            position: "absolute",
            bottom: "-15px",
            left: 0,
            width: "100%",
            height: "15px",
            backgroundColor: THEME.primaryDark,
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
          }}
        />
      </div>

      {/* CONTENT */}
      <div style={{ padding: 40, maxWidth: 1200, margin: "60px auto" }}>
        {loading && <p style={{ textAlign: "center" }}>Loading candidates...</p>}
        {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
        {!loading && candidates.length === 0 && !error && (
          <p style={{ textAlign: "center" }}>No candidates available.</p>
        )}

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 25,
          }}
        >
          {candidates.map((c) => (
            <div
              key={c._id}
              style={{
                width: "100%",
                height: 470,
                backgroundColor: THEME.white,
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                textAlign: "center",
                borderTop: `5px solid ${THEME.primary}`,
                transition: "0.3s",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-6px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {/* IMAGE */}
              {c.image ? (
                <img
                  src={`${API_URL}/uploads/${c.image}`}
                  alt={`${c.firstName} ${c.lastName}`}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 15,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    backgroundColor: "#ddd",
                    borderRadius: 12,
                    marginBottom: 15,
                  }}
                />
              )}

              {/* INFO */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                <h3 style={{ color: THEME.primary, margin: "0 0 10px 0" }}>
                  {c.firstName} {c.lastName}
                </h3>

                <p style={{ margin: "0 0 5px 0" }}>
                  <strong>Candidacy:</strong> {c.candidacy}
                </p>

                <p style={{ margin: "0 0 5px 0" }}>
                  <strong>Partylist:</strong> {c.partylist || "Independent"}
                </p>

                {/* ✅ NEW FIELDS */}
                <p style={{ margin: "0 0 5px 0" }}>
                  <strong>Course:</strong> {c.course || "N/A"}
                </p>

                <p style={{ margin: "0 0 5px 0" }}>
                  <strong>Year & Block:</strong>{" "}
                  {c.yearLevel || "N/A"} {c.block || ""}
                </p>

                <p style={{ fontSize: 14, color: "#555", marginTop: 8 }}>
                  {c.description || "No description provided"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CandidatesPage;