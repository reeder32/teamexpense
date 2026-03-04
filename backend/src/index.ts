import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expenses";
import reportRoutes from "./routes/reports";

const app = express();
const PORT = process.env.PORT || 3001;

// BUG: Wildcard CORS — allows any origin to make authenticated requests
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

// BUG: No rate limiting on any endpoints — susceptible to brute-force attacks

// BUG: Global error handler leaks stack traces to the client in production
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
