import React from "react";

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  pending: {
    color: "#F5E642",
    backgroundColor: "#FFFFFF",
    border: "1px solid #F5E642",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
  },
  approved: {
    color: "#FFFFFF",
    backgroundColor: "#22C55E",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
  },
  rejected: {
    color: "#FFFFFF",
    backgroundColor: "#EF4444",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
  },
};

export default function StatusBadge({ status }: { status: string }) {
  return <span style={STATUS_STYLES[status] || {}}>{status}</span>;
}
