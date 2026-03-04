import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function Dashboard() {
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    // BUG: No cleanup/abort — if the component unmounts before the request completes,
    // this will attempt to setState on an unmounted component (memory leak)
    client.get("/reports/my-summary").then((res) => {
      setSummary(res.data.summary);
    });
  }, []);

  const total = summary.reduce((sum, row) => sum + row.total, 0);

  return (
    // BUG (a11y): No <main> landmark wrapping page content
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>Dashboard</div>

      <div style={{ margin: "20px 0", padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
        {/* BUG (a11y): Important status info not in a landmark or live region */}
        <div style={{ fontSize: 18 }}>Total Spending: ${total.toFixed(2)}</div>
        <div>Budget Remaining: ${(5000 - total).toFixed(2)}</div>
      </div>

      {/* BUG (a11y): Navigation links styled as plain text — no visual focus indicator */}
      <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
        <Link to="/expenses/new" style={{ textDecoration: "none", color: "#007bff" }}>New Expense</Link>
        <Link to="/expenses" style={{ textDecoration: "none", color: "#007bff" }}>View All</Link>
        <Link to="/reports" style={{ textDecoration: "none", color: "#007bff" }}>Reports</Link>
      </div>

      {summary.length > 0 && (
        // BUG (a11y): Table has no <caption> or aria-label describing its purpose
        <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {/* BUG (a11y): Uses <td> instead of <th> for header cells — no scope attribute */}
              <td style={{ borderBottom: "2px solid #ddd", padding: 8 }}>Category</td>
              <td style={{ borderBottom: "2px solid #ddd", padding: 8 }}>Count</td>
              <td style={{ borderBottom: "2px solid #ddd", padding: 8 }}>Total</td>
            </tr>
          </thead>
          <tbody>
            {summary.map((row: any) => (
              // BUG: Using array index as key implicitly — category could be a better key
              <tr key={row.category}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{row.category}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{row.count}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>${row.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
