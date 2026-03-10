import React, { useState, useEffect } from "react";
import api from "../api/client";

interface TeamMember {
  name: string;
  total: number;
  count: number;
}

export default function Reports() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.role === "admin") {
      api.get("/reports/team-summary")
        .then(({ data }) => setTeam(data))
        .catch(() => setError("Failed to load team report"));
    }
  }, [user.role]);

  const handleExport = async () => {
    try {
      const { data } = await api.get("/reports/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses-export.json";
      a.click();
    } catch {
      alert("Export failed");
    }
  };

  return (
    <div>
      <h1>Reports</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user.role === "admin" && (
        <>
          <h2>Team Spending</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Name</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: 8 }}>Total</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: 8 }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.name}>
                  <td style={{ padding: 8 }}>{m.name}</td>
                  <td style={{ textAlign: "right", padding: 8 }}>${m.total.toFixed(2)}</td>
                  <td style={{ textAlign: "right", padding: 8 }}>{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleExport} style={{ marginTop: 16, padding: 10 }}>
            Export All Expenses
          </button>
        </>
      )}
    </div>
  );
}
