import React, { useEffect, useState } from "react";
import client from "../api/client";
import ExpenseCard from "../components/ExpenseCard";

interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  status: string;
  created_at: string;
}

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // BUG: Fetches on every keystroke in search — no debounce, hammers the API
    client.get("/expenses", { params: { page, category: search || undefined } }).then((res) => {
      setExpenses(res.data.expenses);
    });
  }, [page, search]);

  const handleDelete = async (id: number) => {
    // BUG: No confirmation dialog before delete — one click permanently removes data
    await client.delete(`/expenses/${id}`);
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    // BUG (a11y): No <main> landmark
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Expenses</div>

      {/* BUG (a11y): Search input has no label or aria-label */}
      <input
        type="text"
        placeholder="Filter by category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20 }}
      />

      {expenses.length === 0 ? (
        <div>No expenses found.</div>
      ) : (
        // BUG (a11y): List of expenses not wrapped in a <ul>/<ol> — screen readers can't navigate as a list
        <div>
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* BUG (a11y): Pagination buttons have no aria-label describing their action */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
