import type { CostLineItem } from './types.js';

export function lineItem(
  category: string,
  label: string,
  monthly: { low: number; mid: number; high: number },
  notes?: string,
): CostLineItem {
  return {
    category,
    label,
    monthlyLow: round(monthly.low),
    monthlyMid: round(monthly.mid),
    monthlyHigh: round(monthly.high),
    notes,
  };
}

export function round(n: number): number {
  return Math.round(n);
}

export function monthlyFromAnnual(annual: number, spread = 0.15): {
  low: number;
  mid: number;
  high: number;
} {
  const mid = annual / 12;
  return { low: mid * (1 - spread), mid, high: mid * (1 + spread) };
}

export function band(mid: number, spread = 0.15): {
  low: number;
  mid: number;
  high: number;
} {
  return { low: mid * (1 - spread), mid, high: mid * (1 + spread) };
}

export function mortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number,
): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / (termYears * 12);
  const r = annualRate / 12;
  const n = termYears * 12;
  return (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}
