import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
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

  useEffect(() => {
    const fetch = async () => {
      const { data } = await api.get(`/expenses?page=${page}`);
      setExpenses(data.data);
    };
    fetch();
  }, [page]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div>
      <h1>My Expenses</h1>
      <Link to="/expenses/new">+ New Expense</Link>

      <div style={{ marginTop: 16 }}>
        {expenses.map((exp) => (
          <div key={exp.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <ExpenseCard expense={exp} />
            <div
              onClick={() => handleDelete(exp.id)}
              style={{
                marginLeft: 12,
                color: "red",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Delete
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
        <span style={{ margin: "0 12px" }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
