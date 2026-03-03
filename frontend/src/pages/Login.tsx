import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await client.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: any) {
      // BUG: Displays raw server error message to user — may leak internal details
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    // BUG (a11y): No <main> landmark, no <h1> heading, no skip-navigation link
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 20 }}>
      <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Team Expense Login</div>

      {/* BUG (a11y): Error message has no role="alert" or aria-live — screen readers won't announce it */}
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* BUG (a11y): Inputs have no associated <label> elements — only placeholder text */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
        />
        {/* BUG (a11y): Button has insufficient color contrast — light gray on white */}
        <button
          type="submit"
          style={{ width: "100%", padding: 10, backgroundColor: "#ccc", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}
