import { describe, expect, it } from 'vitest';

import type { PropertyFacts } from '@list-price-plus/core';

import { scoreExtractionConfidence } from './confidence';
import { applyOverrides, normalizeListingUrl } from './overrides';

function facts(partial: Partial<PropertyFacts>): PropertyFacts {
  return {
    source: 'zillow',
    fieldProvenance: {},
    ...partial,
  };
}

describe('scoreExtractionConfidence', () => {
  it('returns high when critical fields are from page', () => {
    const report = scoreExtractionConfidence(
      facts({
        listPrice: 400000,
        sqft: 2000,
        beds: 3,
        baths: 2,
        yearBuilt: 1990,
        annualTax: 3000,
        fieldProvenance: {
          listPrice: 'page',
          sqft: 'page',
          beds: 'page',
          baths: 'page',
          yearBuilt: 'page',
          annualTax: 'page',
        },
      }),
    );
    expect(report.level).toBe('high');
    expect(report.missingCritical).toHaveLength(0);
  });

  it('returns low when price and sqft are missing', () => {
    const report = scoreExtractionConfidence(facts({ beds: 2 }));
    expect(report.level).toBe('low');
    expect(report.missingCritical).toContain('listPrice');
    expect(report.missingCritical).toContain('sqft');
  });

  it('treats user overrides as strong as page data', () => {
    const report = scoreExtractionConfidence(
      facts({
        listPrice: 500000,
        sqft: 1800,
        beds: 4,
        fieldProvenance: {
          listPrice: 'user',
          sqft: 'user',
          beds: 'user',
        },
      }),
    );
    expect(report.level).not.toBe('low');
  });
});

describe('overrides', () => {
  it('normalizes listing URLs without query strings', () => {
    expect(
      normalizeListingUrl(
        'https://www.zillow.com/homedetails/123/456_zpid/?utm=abc',
      ),
    ).toBe('www.zillow.com/homedetails/123/456_zpid');
  });

  it('merges user overrides and marks provenance', () => {
    const merged = applyOverrides(
      facts({ listPrice: 400000, fieldProvenance: { listPrice: 'page' } }),
      { listPrice: 410000 },
    );
    expect(merged.listPrice).toBe(410000);
    expect(merged.fieldProvenance?.listPrice).toBe('user');
  });
});
