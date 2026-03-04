import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function Reports() {
  const [mySummary, setMySummary] = useState<any[]>([]);
  const [teamSummary, setTeamSummary] = useState<any[]>([]);

  useEffect(() => {
    // BUG: Both requests fire even if user is not admin — team-summary will 403
    // and the error is silently swallowed
    client.get("/reports/my-summary").then((res) => setMySummary(res.data.summary));
    client.get("/reports/team-summary").then((res) => setTeamSummary(res.data.summary)).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Reports</div>

      {/* BUG (a11y): Section has no heading hierarchy — goes from page title to table directly */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>My Spending</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <td style={{ padding: 8, borderBottom: "2px solid #ddd" }}>Category</td>
              <td style={{ padding: 8, borderBottom: "2px solid #ddd" }}>Total</td>
            </tr>
          </thead>
          <tbody>
            {mySummary.map((row: any) => (
              <tr key={row.category}>
                <td style={{ padding: 8 }}>{row.category}</td>
                <td style={{ padding: 8 }}>${row.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {teamSummary.length > 0 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Team Spending</div>
          {/* BUG (a11y): Table has no caption and uses <td> for headers */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <td style={{ padding: 8, borderBottom: "2px solid #ddd" }}>Name</td>
                <td style={{ padding: 8, borderBottom: "2px solid #ddd" }}>Expenses</td>
                <td style={{ padding: 8, borderBottom: "2px solid #ddd" }}>Total</td>
              </tr>
            </thead>
            <tbody>
              {teamSummary.map((row: any) => (
                <tr key={row.email}>
                  <td style={{ padding: 8 }}>{row.name}</td>
                  <td style={{ padding: 8 }}>{row.count}</td>
                  {/* BUG: row.total can be null (user with no expenses) — toFixed() will throw */}
                  <td style={{ padding: 8 }}>${row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
