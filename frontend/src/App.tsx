import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExpenseForm from "./pages/ExpenseForm";
import ExpenseList from "./pages/ExpenseList";
import Reports from "./pages/Reports";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  // BUG: Only checks if token exists, not if it's valid or expired
  // An expired or tampered token will pass this check
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/expenses/new" element={<PrivateRoute><ExpenseForm /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><ExpenseList /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
