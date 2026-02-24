import React from "react";
import StatusBadge from "./StatusBadge";

interface Props {
  expense: {
    id: number;
    amount: number;
    description: string;
    category: string;
    status: string;
    created_at: string;
  };
}

export default function ExpenseCard({ expense }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        flex: 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" width={24} height={24} />
          <strong>${expense.amount.toFixed(2)}</strong>
        </div>
        <StatusBadge status={expense.status} />
      </div>
      <p style={{ margin: "8px 0 4px" }}>{expense.description}</p>
      <small style={{ color: "#666" }}>
        {expense.category} · {new Date(expense.created_at).toLocaleDateString()}
      </small>
    </div>
  );
}
