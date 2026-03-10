export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0;
}

export function sanitizeString(input: string): string {
  return input.trim().slice(0, 500);
}

export const CATEGORIES = [
  "travel",
  "meals",
  "supplies",
  "software",
  "equipment",
  "other",
] as const;

export const BUDGET_LIMIT = 5000;
