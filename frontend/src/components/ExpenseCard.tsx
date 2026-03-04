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
  onDelete: (id: number) => void;
}

export default function ExpenseCard({ expense, onDelete }: Props) {
  return (
    // BUG (a11y): Card is not an <article> or list item — no semantic structure
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* BUG (a11y): Amount displayed with color alone to indicate high values — no text/icon alternative */}
        <div style={{ fontSize: 20, fontWeight: "bold", color: expense.amount > 500 ? "red" : "green" }}>
          ${expense.amount.toFixed(2)}
        </div>
        <StatusBadge status={expense.status} />
      </div>

      {/* BUG: Renders description as raw HTML via dangerouslySetInnerHTML — XSS vulnerability
         If a user submits '<img src=x onerror=alert(1)>' as a description, it executes */}
      <div
        style={{ margin: "8px 0", color: "#555" }}
        dangerouslySetInnerHTML={{ __html: expense.description }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#888" }}>
        <span>{expense.category}</span>
        <span>{expense.created_at}</span>
      </div>

      {/* BUG (a11y): Delete button has no aria-label — screen reader just says "X" with no context */}
      <button
        onClick={() => onDelete(expense.id)}
        style={{ marginTop: 8, color: "red", background: "none", border: "none", cursor: "pointer" }}
      >
        X
      </button>
    </div>
  );
}
