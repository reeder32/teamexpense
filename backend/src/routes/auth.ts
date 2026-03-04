import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db";
import { JWT_SECRET } from "../middleware/auth";
import { isValidEmail } from "../utils/validate";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // BUG: No minimum password length or complexity check
  const hashed = await bcrypt.hash(password, 10);

  try {
    const stmt = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    const result = stmt.run(email, hashed, name);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: "member" },
      JWT_SECRET
      // BUG: No token expiration — JWTs are valid forever
    );

    return res.status(201).json({ token, user: { id: result.lastInsertRowid, email, name, role: "member" } });
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Email already registered" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // BUG: SQL injection — user input interpolated directly into query
  const user = db.prepare(`SELECT * FROM users WHERE email = '${email}'`).get() as any;

  if (!user) {
    // BUG: Leaks whether an email exists — allows user enumeration
    return res.status(401).json({ error: "No account found with that email" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET
    // BUG: No token expiration here either
  );

  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

export default router;
