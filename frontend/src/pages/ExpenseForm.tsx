import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const CATEGORIES = ["travel", "meals", "supplies", "software", "equipment", "other"];

export default function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("travel");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/expenses", {
        amount: parseFloat(amount),
        description,
        category,
      });
      navigate("/expenses");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit");
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h1>New Expense</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount ($)"
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Submit Expense
        </button>
      </form>
    </div>
  );
}
