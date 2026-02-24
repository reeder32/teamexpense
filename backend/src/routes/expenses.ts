import { Router, Response } from "express";
import db from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { isPositiveNumber, sanitizeString, CATEGORIES, BUDGET_LIMIT } from "../utils/validate";

const router = Router();

// Create expense
router.post("/", authenticate, (req: AuthRequest, res: Response) => {
  const { amount, description, category } = req.body;
  const userId = req.user!.id;

  if (!isPositiveNumber(amount)) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (!description || !category) {
    return res.status(400).json({ error: "Description and category are required" });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const existing = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND status != 'rejected'"
  ).get(userId) as any;

  if (existing.total + amount > BUDGET_LIMIT) {
    return res.status(400).json({ error: `Would exceed budget limit of $${BUDGET_LIMIT}` });
  }

  const result = db.prepare(
    "INSERT INTO expenses (user_id, amount, description, category) VALUES (?, ?, ?, ?)"
  ).run(userId, amount, sanitizeString(description), category);

  res.status(201).json({ id: result.lastInsertRowid, amount, description, category, status: "pending" });
});

// Get single expense
router.get("/:id", authenticate, (req: AuthRequest, res: Response) => {
  const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);

  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  res.json(expense);
});

// List expenses with pagination
router.get("/", authenticate, (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const userId = req.user!.id;

  const expenses = db.prepare(
    "SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(userId, limit, page * limit);

  const count = db.prepare(
    "SELECT COUNT(*) as total FROM expenses WHERE user_id = ?"
  ).get(userId) as any;

  res.json({ data: expenses, total: count.total, page, limit });
});

// Search expenses
router.get("/search", authenticate, (req: AuthRequest, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const results = db.prepare(
    `SELECT * FROM expenses WHERE user_id = ${req.user!.id} AND description LIKE '%${query}%' ORDER BY created_at DESC`
  ).all();

  res.json(results);
});

// Filter expenses by date range
router.get("/filter", authenticate, (req: AuthRequest, res: Response) => {
  const { startDate, endDate, category } = req.query;
  const userId = req.user!.id;

  let sql = "SELECT * FROM expenses WHERE user_id = ?";
  const params: any[] = [userId];

  if (startDate) {
    sql += " AND created_at >= ?";
    params.push(startDate);
  }

  if (endDate) {
    sql += " AND created_at < ?";
    params.push(endDate);
  }

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  sql += " ORDER BY created_at DESC";
  const results = db.prepare(sql).all(...params);
  res.json(results);
});

// Approve / reject expense (managers only)
router.patch("/:id/status", authenticate, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Only managers can approve/reject expenses" });
  }

  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  const result = db.prepare(
    "UPDATE expenses SET status = ? WHERE id = ?"
  ).run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Expense not found" });
  }

  res.json({ message: `Expense ${status}` });
});

// Delete expense
router.delete("/:id", authenticate, (req: AuthRequest, res: Response) => {
  const expense = db.prepare("SELECT * FROM expenses WHERE id = ? AND user_id = ?").get(
    req.params.id,
    req.user!.id
  ) as any;

  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  if (expense.status !== "pending") {
    return res.status(400).json({ error: "Can only delete pending expenses" });
  }

  db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
  res.json({ message: "Expense deleted" });
});

export default router;
