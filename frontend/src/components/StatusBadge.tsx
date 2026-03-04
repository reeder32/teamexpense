import React from "react";

interface Props {
  status: string;
}

// BUG (a11y): Status conveyed by color alone — no icon or text pattern for colorblind users
const STATUS_COLORS: Record<string, string> = {
  pending: "#f0ad4e",
  approved: "#5cb85c",
  rejected: "#d9534f",
};

export default function StatusBadge({ status }: Props) {
  return (
    // BUG (a11y): No role="status" or aria-label — screen readers get no context
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 12,
        backgroundColor: STATUS_COLORS[status] || "#ccc",
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}
