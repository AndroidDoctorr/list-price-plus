import { describe, expect, it } from 'vitest';

import { estimateMonthlyCosts } from './estimate.js';
import { defaultUserProfile } from './profile.js';
import type { PropertyFacts } from './types.js';

const sfhFacts: PropertyFacts = {
  source: 'zillow',
  listPrice: 450_000,
  sqft: 2000,
  beds: 4,
  baths: 2.5,
  yearBuilt: 1998,
  annualTax: 4200,
  hasPool: true,
  fieldProvenance: {
    listPrice: 'page',
    sqft: 'page',
    annualTax: 'page',
  },
};

describe('estimateMonthlyCosts', () => {
  it('returns a plausible monthly total for a typical SFH', () => {
    const profile = defaultUserProfile();
    profile.creditTier = 'fair';

    const est = estimateMonthlyCosts(sfhFacts, profile);

    expect(est.monthlyTotal.mid).toBeGreaterThan(3000);
    expect(est.monthlyTotal.mid).toBeLessThan(6000);
    expect(est.breakdown.some((l) => l.label.includes('Mortgage'))).toBe(true);
    expect(est.breakdown.some((l) => l.category === 'pool')).toBe(true);
    expect(est.capexTimeline.length).toBeGreaterThan(2);
    expect(est.confidence).toBe('high');
  });

  it('omits pool line when hasPool is not true', () => {
    const est = estimateMonthlyCosts(
      { ...sfhFacts, hasPool: false },
      defaultUserProfile(),
    );
    expect(est.breakdown.some((l) => l.category === 'pool')).toBe(false);
  });

  it('adds PMI when down payment is below 20%', () => {
    const profile = defaultUserProfile();
    profile.downPaymentPercent = 10;
    const est = estimateMonthlyCosts(sfhFacts, profile);
    expect(est.breakdown.some((l) => l.label === 'PMI')).toBe(true);
  });

  it('uses lower confidence when price and sqft are missing', () => {
    const est = estimateMonthlyCosts(
      { source: 'manual' },
      defaultUserProfile(),
    );
    expect(est.confidence).toBe('low');
  });
});
