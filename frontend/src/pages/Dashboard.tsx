import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

interface Summary {
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/reports/my-summary");
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary", err);
      }
    };

    fetchSummary();
    setInterval(fetchSummary, 30000);
  }, []);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <nav style={{ marginBottom: 24 }}>
        <Link to="/expenses" style={{ marginRight: 16 }}>My Expenses</Link>
        <Link to="/expenses/new" style={{ marginRight: 16 }}>New Expense</Link>
        <Link to="/reports">Reports</Link>
      </nav>

      {summary && (
        <div>
          <h2>My Spending Summary</h2>
          <p>Total approved: ${summary.total.toFixed(2)}</p>
          <p>Expense count: {summary.count}</p>

          <h3>By Category</h3>
          <ul>
            {Object.entries(summary.byCategory).map(([cat, amount]) => (
              <li key={cat}>
                {cat}: ${(amount as number).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
