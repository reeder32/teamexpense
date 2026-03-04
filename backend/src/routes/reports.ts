import { Router, Response } from "express";
import db from "../db";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /api/reports/my-summary
router.get("/my-summary", (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const rows = db.prepare(`
    SELECT category, COUNT(*) as count, SUM(amount) as total
    FROM expenses
    WHERE user_id = ?
    GROUP BY category
  `).all(userId);

  return res.json({ summary: rows });
});

// GET /api/reports/team-summary
router.get("/team-summary", requireAdmin, (req: AuthRequest, res: Response) => {
  const rows = db.prepare(`
    SELECT u.name, u.email, COUNT(e.id) as count, SUM(e.amount) as total
    FROM users u
    LEFT JOIN expenses e ON u.id = e.user_id
    GROUP BY u.id
  `).all();

  return res.json({ summary: rows });
});

// GET /api/reports/export
router.get("/export", requireAdmin, (req: AuthRequest, res: Response) => {
  // BUG: No pagination or streaming — loads ALL expenses into memory at once
  // Will cause OOM on large datasets
  const expenses = db.prepare(`
    SELECT e.*, u.name as user_name, u.email as user_email
    FROM expenses e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
  `).all();

  // BUG: No Content-Disposition header — browser won't prompt download
  res.setHeader("Content-Type", "text/csv");

  // BUG: CSV injection — user-controlled fields (description, name) are not escaped.
  // A description like '=CMD("calc")' will execute in Excel when opened.
  let csv = "ID,User,Email,Amount,Description,Category,Status,Date\n";
  for (const e of expenses as any[]) {
    csv += `${e.id},${e.user_name},${e.user_email},${e.amount},${e.description},${e.category},${e.status},${e.created_at}\n`;
  }

  return res.send(csv);
});

export default router;
