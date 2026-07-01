import { describe, expect, it } from 'vitest';
import { buildSharedReport, isReportExpired, normalizeSharedReport, shareUrlForReport } from './report.js';
import type { CostEstimate, PropertyFacts, UserProfile } from './types.js';

const facts: PropertyFacts = { source: 'zillow', listPrice: 350_000, sqft: 1800 };
const profile: UserProfile = {
  id: 'default',
  name: 'My defaults',
  spendingStyle: 'standard',
  creditTier: 'good',
  downPaymentPercent: 20,
  loanTermYears: 30,
  diyLevel: 'some',
  useCase: 'owner_occupier',
  insuranceDeductible: 'standard',
};
const estimate: CostEstimate = {
  monthlyTotal: { low: 2000, mid: 2500, high: 3000 },
  breakdown: [],
  capexTimeline: [],
  assumptions: ['Test assumption.'],
  confidence: 'medium',
};

describe('buildSharedReport', () => {
  it('builds a report with expiry 90 days out', () => {
    const createdAt = new Date('2026-01-01T12:00:00.000Z');
    const report = buildSharedReport({
      id: 'abc-123',
      branding: { name: 'Jane', brokerage: 'Acme', phone: '555', email: 'j@x.com' },
      sourceUrl: 'https://zillow.com/homedetails/1',
      propertyFacts: facts,
      profileSnapshot: profile,
      estimate,
      listingTitle: '123 Main St',
      createdAt,
    });

    expect(report.id).toBe('abc-123');
    const expires = new Date(report.expiresAt);
    const expected = new Date('2026-01-01T12:00:00.000Z');
    expected.setDate(expected.getDate() + 90);
    expect(expires.toISOString()).toBe(expected.toISOString());
    expect(report.listingTitle).toBe('123 Main St');
  });

  it('omits undefined optional fields for Firestore', () => {
    const report = buildSharedReport({
      id: 'abc-123',
      branding: { name: 'Jane', brokerage: 'Acme', phone: '555', email: 'j@x.com' },
      sourceUrl: 'https://zillow.com/homedetails/1',
      propertyFacts: { source: 'zillow', listPrice: 350_000 },
      profileSnapshot: profile,
      estimate,
    });

    expect('listingTitle' in report).toBe(false);
    expect(JSON.stringify(report)).not.toContain('undefined');
  });
});

describe('isReportExpired', () => {
  it('returns true after expiresAt', () => {
    const report = buildSharedReport({
      id: 'x',
      branding: { name: 'A', brokerage: 'B', phone: '1', email: 'a@b.com' },
      sourceUrl: 'https://example.com',
      propertyFacts: facts,
      profileSnapshot: profile,
      estimate,
      createdAt: new Date('2020-01-01'),
    });
    expect(isReportExpired(report, new Date('2026-01-01'))).toBe(true);
  });
});

describe('shareUrlForReport', () => {
  it('builds the public report URL', () => {
    expect(shareUrlForReport('uuid-here')).toBe(
      'https://list-price-plus.web.app/r/uuid-here',
    );
  });
});

describe('normalizeSharedReport', () => {
  it('converts Firestore-like Timestamp expiresAt to ISO string', () => {
    const iso = '2026-04-01T12:00:00.000Z';
    const normalized = normalizeSharedReport({
      id: 'x',
      createdAt: '2026-01-01T12:00:00.000Z',
      expiresAt: { toDate: () => new Date(iso) },
      branding: { name: 'A', brokerage: 'B', phone: '1', email: 'a@b.com' },
      sourceUrl: 'https://example.com',
      propertyFacts: facts,
      profileSnapshot: profile,
      estimate,
    });
    expect(normalized.expiresAt).toBe(iso);
  });
});
