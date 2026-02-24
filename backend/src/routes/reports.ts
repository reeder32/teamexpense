import { Router, Request, Response } from "express";
import db from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// User spending summary
router.get("/my-summary", authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const expenses = db.prepare(
    "SELECT amount, category FROM expenses WHERE user_id = ? AND status = 'approved'"
  ).all(userId) as any[];

  const byCategory: Record<string, number> = {};
  let total = 0;

  for (const exp of expenses) {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    total += exp.amount;
  }

  res.json({ total, byCategory, count: expenses.length });
});

// Team summary — admin only
router.get("/team-summary", (req: Request, res: Response) => {
  const expenses = db.prepare(
    "SELECT * FROM expenses WHERE status = 'approved'"
  ).all() as any[];

  const summary: Record<string, { name: string; total: number; count: number }> = {};

  for (const exp of expenses) {
    if (!summary[exp.user_id]) {
      const user = db.prepare("SELECT name FROM users WHERE id = ?").get(exp.user_id) as any;
      summary[exp.user_id] = { name: user.name, total: 0, count: 0 };
    }
    summary[exp.user_id].total += exp.amount;
    summary[exp.user_id].count += 1;
  }

  res.json(Object.values(summary));
});

// Export all expenses
router.get("/export", authenticate, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const allExpenses = db.prepare("SELECT * FROM expenses").all();
  res.json(allExpenses);
});

export default router;
