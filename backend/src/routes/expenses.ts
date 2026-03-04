import { Router, Response } from "express";
import db from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { isPositiveNumber, isValidCategory } from "../utils/validate";

const router = Router();
router.use(authenticate);

const BUDGET_LIMIT = 5000;

// POST /api/expenses
router.post("/", (req: AuthRequest, res: Response) => {
  const { amount, description, category } = req.body;
  const userId = req.user!.id;

  if (!isPositiveNumber(amount)) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "Description is required" });
  }

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  // BUG: Race condition — checking total and inserting are not in a transaction,
  // so concurrent requests can exceed the budget limit
  const row = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?"
  ).get(userId) as any;

  // BUG: Off-by-one — uses > instead of >= so a user can hit exactly $5000.01 over limit
  if (row.total + amount > BUDGET_LIMIT) {
    return res.status(400).json({
      error: `Budget limit of $${BUDGET_LIMIT} exceeded. Current total: $${row.total}`,
    });
  }

  const stmt = db.prepare(
    "INSERT INTO expenses (user_id, amount, description, category) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(userId, amount, description, category);

  return res.status(201).json({ id: result.lastInsertRowid, amount, description, category, status: "pending" });
});

// GET /api/expenses
router.get("/", (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  // BUG: No upper bound on limit — a client can request limit=999999 and dump the entire table
  const offset = (page - 1) * limit;

  // BUG: SQL injection — category filter is interpolated directly into the query string
  const category = req.query.category as string;
  let query = `SELECT * FROM expenses WHERE user_id = ?`;
  if (category) {
    query += ` AND category = '${category}'`;
  }
  query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const expenses = db.prepare(query).all(userId);
  return res.json({ expenses, page, limit });
});

// PATCH /api/expenses/:id/status
router.patch("/:id/status", (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const expenseId = req.params.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  // BUG: No admin check — any authenticated user can approve/reject any expense
  const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(expenseId) as any;

  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  // BUG: Users can approve their own expenses — no self-approval guard
  db.prepare("UPDATE expenses SET status = ? WHERE id = ?").run(status, expenseId);
  return res.json({ ...expense, status });
});

// DELETE /api/expenses/:id
router.delete("/:id", (req: AuthRequest, res: Response) => {
  const expenseId = req.params.id;
  const userId = req.user!.id;

  const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(expenseId) as any;

  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  // BUG: IDOR — only checks if expense exists, not if it belongs to the requesting user
  // Any authenticated user can delete any other user's expense
  db.prepare("DELETE FROM expenses WHERE id = ?").run(expenseId);
  return res.json({ message: "Expense deleted" });
});

export default router;
