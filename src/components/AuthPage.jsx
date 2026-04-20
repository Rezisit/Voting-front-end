// src/components/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import sorsuLogo from "../assets/sorsu-logo.png";

const API_URL = "http://localhost:5000";

function AuthPage({ setAuth }) {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [userCode, setUserCode] = useState("");
  const [mode, setMode] = useState("user");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= ADMIN LOGIN =================
  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setAuth({
        token: data.token,
        role: data.role,
      });

      // redirect to admin panel
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.message || "Admin login failed");
    }
  };

  // ================= USER LOGIN =================
  const handleUserLogin = async () => {

    if (!userCode) {
      alert("Please enter your user code");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/login-code`,
        { code: userCode }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setAuth({
        token: data.token,
        role: data.role,
      });

      // redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid user code");
    }
  };

  return (
    <div style={styles.container}>

      {/* LEFT PANEL */}
      <div style={styles.left}>
        <div style={styles.logoRow}>
          <img src={sorsuLogo} alt="SorSU Logo" style={styles.logo} />
          <div>
            <h1 style={{ margin: 0 }}>Election 2026</h1>
            <h3 style={{ margin: 0, fontWeight: "normal" }}>
              Online Voting System
            </h3>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.right}>
        <div style={styles.card}>

          <h2 style={styles.title}>Login Portal</h2>

          {/* TABS */}
          <div style={styles.tabContainer}>
            <button
              style={mode === "user" ? styles.activeTab : styles.tab}
              onClick={() => setMode("user")}
            >
               User Login
            </button>

            <button
              style={mode === "admin" ? styles.activeTab : styles.tab}
              onClick={() => setMode("admin")}
            >
               Admin
            </button>
          </div>

          {/* USER LOGIN */}
          {mode === "user" && (
            <div>

              <p style={{ fontSize: 14, marginBottom: 10 }}>
                Enter your assigned user code
              </p>

              <input
                type="text"
                placeholder="Enter User Code"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                style={styles.input}
              />

              <button
                onClick={handleUserLogin}
                style={styles.button}
              >
                Enter Voting Portal
              </button>

            </div>
          )}

          {/* ADMIN LOGIN */}
          {mode === "admin" && (
            <form onSubmit={handleAdminLogin}>

              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={form.email}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eye}
                >
                  👁
                </span>
              </div>

              <button type="submit" style={styles.button}>
                Admin Login
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {

  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    background: "linear-gradient(135deg,#8B0000,#B22222)",
    fontFamily: "Arial"
  },

  left: {
    flex: 1,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 20
  },

  logo: {
    width: 110
  },

  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    backgroundColor: "#1c1c1c",
    padding: 40,
    borderRadius: 12,
    width: 380,
    color: "white",
    boxShadow: "0 0 30px rgba(0,0,0,0.6)"
  },

  title: {
    textAlign: "center",
    marginBottom: 20
  },

  tabContainer: {
    display: "flex",
    marginBottom: 20
  },

  tab: {
    flex: 1,
    padding: 10,
    border: "none",
    background: "#e5e7eb",
    cursor: "pointer"
  },

  activeTab: {
    flex: 1,
    padding: 10,
    border: "none",
    background: "#B11226",
    color: "#fff",
    cursor: "pointer"
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: 15,
    borderRadius: 6,
    border: "none",
    backgroundColor: "#2c2c2c",
    color: "white",
    outline: "none"
  },

  passwordWrapper: {
    position: "relative",
    width: "100%"
  },

  eye: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    opacity: 0.7
  },

  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default AuthPage;