import type { PropertyFacts } from '@list-price-plus/core';

export type ExtractionConfidence = 'low' | 'medium' | 'high';

const CRITICAL_FIELDS = ['listPrice', 'sqft', 'beds'] as const;
const IMPORTANT_FIELDS = ['baths', 'yearBuilt', 'annualTax'] as const;

function fieldPoints(
  facts: PropertyFacts,
  key: string,
): number {
  const value = facts[key as keyof PropertyFacts];
  if (value === undefined || value === null) return 0;

  const prov = facts.fieldProvenance?.[key];
  if (prov === 'page' || prov === 'user') return 3;
  if (prov === 'inferred') return 2;
  return 1;
}

export interface ConfidenceReport {
  level: ExtractionConfidence;
  score: number;
  maxScore: number;
  missingCritical: string[];
  missingImportant: string[];
  summary: string;
}

export function scoreExtractionConfidence(
  facts: PropertyFacts,
): ConfidenceReport {
  let score = 0;
  const maxScore =
    CRITICAL_FIELDS.length * 3 + IMPORTANT_FIELDS.length * 3;

  const missingCritical: string[] = [];
  const missingImportant: string[] = [];

  for (const key of CRITICAL_FIELDS) {
    const pts = fieldPoints(facts, key);
    score += pts;
    if (pts === 0) missingCritical.push(key);
  }

  for (const key of IMPORTANT_FIELDS) {
    const pts = fieldPoints(facts, key);
    score += pts;
    if (pts === 0) missingImportant.push(key);
  }

  const ratio = score / maxScore;

  let level: ExtractionConfidence;
  if (missingCritical.length === 0 && ratio >= 0.75) {
    level = 'high';
  } else if (missingCritical.length <= 1 && ratio >= 0.45) {
    level = 'medium';
  } else {
    level = 'low';
  }

  const summary =
    level === 'high'
      ? 'Enough data to estimate costs.'
      : level === 'medium'
        ? 'Usable — verify highlighted gaps or edit below.'
        : 'Missing key facts — edit below for better estimates.';

  return {
    level,
    score,
    maxScore,
    missingCritical,
    missingImportant,
    summary,
  };
}
