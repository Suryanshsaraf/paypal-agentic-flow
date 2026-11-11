/**
 * Money utilities using integer minor units (cents)
 * As required by DOCS/BUILD_PLAN.md:
 * Money as integer minor units (cents) or decimal strings — never raw JS floats.
 */

export function dollarsToCents(dollars: number | string): number {
  if (typeof dollars === "number") {
    return Math.round(dollars * 100);
  }
  const clean = dollars.replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function centsToDecimalString(cents: number): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = `${dollars}.${remainder.toString().padStart(2, "0")}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCents(cents: number, currency = "USD"): string {
  const decimalStr = centsToDecimalString(cents);
  return `$${decimalStr} ${currency}`;
}

export function addCents(...amounts: number[]): number {
  return amounts.reduce((acc, curr) => acc + curr, 0);
}

export function calculateLatePenalty(cents: number, monthlyRateDecimal = 0.015, daysOverdue = 0): number {
  if (daysOverdue <= 0) return 0;
  // (cents * 1.5% * daysOverdue) / 30
  return Math.round((cents * monthlyRateDecimal * daysOverdue) / 30);
}
