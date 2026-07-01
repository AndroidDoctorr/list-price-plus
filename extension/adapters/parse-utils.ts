import type { PropertyFacts } from '@list-price-plus/core';

type FieldProvenance = NonNullable<PropertyFacts['fieldProvenance']>[string];

type PartialFacts = Partial<Omit<PropertyFacts, 'fieldProvenance' | 'source'>> & {
  fieldProvenance?: Record<string, FieldProvenance>;
};

/** Fill in missing fields only — earlier merges win over later ones. */
export function mergeFacts(
  base: PropertyFacts,
  patch: PartialFacts,
): PropertyFacts {
  const fieldProvenance = { ...base.fieldProvenance };
  const merged: PropertyFacts = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'fieldProvenance' || value === undefined) continue;
    const field = key as keyof PropertyFacts;
    if (merged[field] !== undefined) continue;
    Object.assign(merged, { [field]: value });
    fieldProvenance[key] = patch.fieldProvenance?.[key] ?? 'page';
  }

  merged.fieldProvenance = fieldProvenance;
  return merged;
}

export function emptyFacts(
  source: PropertyFacts['source'],
  sourceUrl: string,
): PropertyFacts {
  return { source, sourceUrl, fieldProvenance: {} };
}

export function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function parseBool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/** Walk JSON and invoke callback on every object node. */
export function walkJson(
  node: unknown,
  visit: (obj: Record<string, unknown>, path: string) => void,
  path = '$',
): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkJson(item, visit, `${path}[${i}]`));
    return;
  }
  const obj = node as Record<string, unknown>;
  visit(obj, path);
  for (const [key, value] of Object.entries(obj)) {
    walkJson(value, visit, `${path}.${key}`);
  }
}

export function firstMatchingNumber(
  root: unknown,
  keys: string[],
): number | undefined {
  let found: number | undefined;
  walkJson(root, (obj) => {
    if (found !== undefined) return;
    for (const key of keys) {
      if (key in obj) {
        const n = parseNumber(obj[key]);
        if (n !== undefined) {
          found = n;
          return;
        }
      }
    }
  });
  return found;
}

export function parseJsonLdScripts(doc: Document): unknown[] {
  const results: unknown[] = [];
  for (const script of doc.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    const text = script.textContent?.trim();
    if (!text) continue;
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) results.push(...parsed);
      else results.push(parsed);
    } catch {
      // ignore malformed blocks
    }
  }
  return results;
}

export function parseEmbeddedJsonScripts(doc: Document): unknown[] {
  const results: unknown[] = [];
  const selectors = [
    '#hdpApolloPreloadedData',
    '#__NEXT_DATA__',
    'script[type="application/json"]',
  ];
  for (const selector of selectors) {
    for (const el of doc.querySelectorAll(selector)) {
      const text = el.textContent?.trim();
      if (!text || text.length < 20) continue;
      try {
        results.push(JSON.parse(text));
      } catch {
        // ignore
      }
    }
  }
  return results;
}

/** Parse JSON assigned to window variables in inline scripts (e.g. Redfin preloaded state). */
export function parseInlineJsonAssignments(
  doc: Document,
  patterns: RegExp[],
): unknown[] {
  const results: unknown[] = [];
  for (const script of doc.querySelectorAll('script:not([src])')) {
    const text = script.textContent ?? '';
    if (text.length < 40) continue;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match?.[1]) continue;
      try {
        results.push(JSON.parse(match[1]));
      } catch {
        // ignore malformed assignments
      }
    }
  }
  return results;
}

export type PoolSignal = 'property' | 'community' | undefined;

/** Distinguish a pool on the property vs a shared HOA/community amenity. */
export function detectPoolInText(text: string): PoolSignal {
  const lower = text.toLowerCase();

  const propertyPatterns = [
    /\bprivate\s+(swimming\s+)?pool\b/,
    /\b(in-?ground|inground)\s+(swimming\s+)?pool\b/,
    /\bpool\s+in\s+(the\s+)?(backyard|yard)\b/,
    /\b(backyard|heated|saltwater|lap)\s+pool\b/,
    /\b(swimming\s+)?pool\s+(and\s+spa|w\/\s*spa)\b/,
    /\bhome\s+(has|with|includes)\s+(a\s+)?(swimming\s+)?pool\b/,
  ];

  const communityPatterns = [
    /\b(community|shared|association|hoa|club|condo)\s+(swimming\s+)?pool\b/,
    /\b(swimming\s+)?pool\s+(access|amenity|amenities)\b/,
    /\bamenities[\s\S]{0,60}\b(swimming\s+)?pool\b/,
    /\b(swimming\s+)?pool\b[\s\S]{0,40}\b(amenity|amenities|hoa|association)\b/,
    /\b(fitness center|tennis|clubhouse)[\s\S]{0,80}\b(swimming\s+)?pool\b/,
  ];

  if (propertyPatterns.some((p) => p.test(lower))) return 'property';
  if (communityPatterns.some((p) => p.test(lower))) return 'community';

  if (/\b(swimming\s+)?pool\b/.test(lower)) {
    // Bare "pool" in HOA-ish copy — treat as community, not the unit
    if (/\b(hoa|homeowners association|association fee|community features)\b/.test(lower)) {
      return 'community';
    }
  }

  return undefined;
}

/** @deprecated Use detectPoolInText — returns true only for property pools */
export function detectPool(text: string): boolean | undefined {
  return detectPoolInText(text) === 'property' ? true : undefined;
}

export function formatFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    listPrice: 'List price',
    sqft: 'Square feet',
    beds: 'Bedrooms',
    baths: 'Bathrooms',
    yearBuilt: 'Year built',
    lotSqft: 'Lot size',
    annualTax: 'Annual tax',
    hoaMonthly: 'HOA / month',
    monthlyRentEstimate: 'Rent estimate',
    hasPool: 'Pool',
    propertyType: 'Property type',
  };
  return labels[key] ?? key;
}

export function formatFieldValue(key: string, value: unknown): string {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'listPrice' || key === 'annualTax' || key === 'hoaMonthly') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(value));
  }
  if (key === 'monthlyRentEstimate') {
    return `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(value))}/mo`;
  }
  if (key === 'sqft' || key === 'lotSqft') {
    return `${Number(value).toLocaleString()} sqft`;
  }
  return String(value);
}
