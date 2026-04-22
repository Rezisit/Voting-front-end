import { useState } from "react";
import axios from "axios";
import sorsuLogo from "../assets/sorsu-logo.png";

function Login({ loginForm, setLoginForm, onLogin }) {

  const [userCode, setUserCode] = useState("");
  const [mode, setMode] = useState("user");

  // =========================
  // USER LOGIN WITH CODE
  // =========================
  const handleCodeLogin = async () => {

    if (!userCode.trim()) {
      alert("Please enter your user code");
      return;
    }

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login-code",
        {
          code: userCode.trim().toUpperCase(),
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Login successful");

      window.location.href = "/voting";

    } catch (err) {

      alert(err.response?.data?.message || "Login failed");

    }
  };

  return (

    <div style={containerStyle}>

      <div style={cardStyle}>

        <img
          src={sorsuLogo}
          alt="SorSU Logo"
          style={{ width: 80, marginBottom: 15 }}
        />

        <h2 style={{ marginBottom: 20 }}>
          SorSU Voting System
        </h2>

        {/* TAB SWITCH */}
        <div style={tabContainer}>

          <button
            style={mode === "user" ? activeTab : tab}
            onClick={() => setMode("user")}
          >
            User Login
          </button>

          <button
            style={mode === "admin" ? activeTab : tab}
            onClick={() => setMode("admin")}
          >
            Admin
          </button>

        </div>

        {/* ================= USER LOGIN ================= */}
        {mode === "user" && (

          <div>

            <p style={{ fontSize: 14, marginBottom: 10 }}>
              Enter your assigned user code
            </p>

            <input
              style={inputStyle}
              type="text"
              placeholder="Enter User Code"
              value={userCode}
              required
              onChange={(e) =>
                setUserCode(e.target.value.toUpperCase())
              }
            />

            <button
              style={loginButton}
              onClick={handleCodeLogin}
            >
              Enter Voting Portal
            </button>

          </div>

        )}

        {/* ================= ADMIN LOGIN ================= */}
        {mode === "admin" && (

          <div>

            <input
              style={inputStyle}
              type="email"
              placeholder="Admin Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  email: e.target.value
                })
              }
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value
                })
              }
            />

            <button
              style={loginButton}
              onClick={onLogin}
            >
              Admin Login
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default Login;


// ===================== STYLES =====================

const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg,#B11226,#8E0E1E)"
};

const cardStyle = {
  width: 380,
  padding: 35,
  borderRadius: 15,
  background: "#ffffff",
  textAlign: "center",
  boxShadow: "0 10px 35px rgba(0,0,0,0.25)"
};

const tabContainer = {
  display: "flex",
  marginBottom: 20
};

const tab = {
  flex: 1,
  padding: 10,
  border: "none",
  background: "#e5e7eb",
  cursor: "pointer"
};

const activeTab = {
  flex: 1,
  padding: 10,
  border: "none",
  background: "#B11226",
  color: "#fff",
  cursor: "pointer"
};

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const loginButton = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#B11226",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};