import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const CATEGORIES = ["travel", "meals", "supplies", "software", "other"];

export default function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // BUG: parseFloat("12.34abc") returns 12.34 — no strict numeric validation
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid positive amount");
      return;
    }

    // BUG: No client-side XSS sanitization on description — stored XSS if server also lacks sanitization
    try {
      await client.post("/expenses", { amount: parsed, description, category });
      navigate("/expenses");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create expense");
    }
  };

  return (
    // BUG (a11y): No <main> landmark, no page heading
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>New Expense</div>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* BUG (a11y): No <label> elements — inputs only have placeholder text */}
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
        />
        {/* BUG (a11y): <select> has no associated label */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 10, padding: 8 }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Submit Expense
        </button>
      </form>
    </div>
  );
}
