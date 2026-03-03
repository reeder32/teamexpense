export function isValidEmail(email: string): boolean {
  // BUG: Overly permissive regex — accepts strings like "a@b" without a TLD
  return /^[^\s@]+@[^\s@]+$/.test(email);
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0;
}

const VALID_CATEGORIES = ["travel", "meals", "supplies", "software", "other"];

export function isValidCategory(category: string): boolean {
  // BUG: Case-sensitive comparison — "Travel" or "MEALS" will be rejected
  return VALID_CATEGORIES.includes(category);
}
