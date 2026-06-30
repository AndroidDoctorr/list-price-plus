import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { detectPoolInText } from '../parse-utils';
import { extractZillowProperty } from './v1';

const fixtureDir = dirname(fileURLToPath(import.meta.url));
const listingHtml = readFileSync(
  join(fixtureDir, '__fixtures__', 'listing.html'),
  'utf-8',
);

function docFromFixture(html: string): Document {
  return new JSDOM(html, {
    url: 'https://www.zillow.com/homedetails/123-main-st/123_zpid/',
  }).window.document;
}

describe('detectPoolInText', () => {
  it('ignores HOA community pool amenities', () => {
    expect(
      detectPoolInText('HOA amenities include pool, fitness center, and clubhouse'),
    ).toBe('community');
    expect(detectPoolInText('Community swimming pool access')).toBe('community');
  });

  it('detects property pools in descriptions', () => {
    expect(
      detectPoolInText('Beautiful home with a swimming pool in the backyard.'),
    ).toBe('property');
    expect(detectPoolInText('Private heated pool and spa')).toBe('property');
  });
});

describe('extractZillowProperty', () => {
  it('reads price, size, beds, baths, tax, HOA, rent, and pool from fixture', () => {
    const result = extractZillowProperty(
      docFromFixture(listingHtml),
      'https://www.zillow.com/homedetails/123-main-st/123_zpid/',
    );

    expect(result.facts.listPrice).toBe(425000);
    expect(result.facts.sqft).toBe(2100);
    expect(result.facts.beds).toBe(4);
    expect(result.facts.baths).toBe(2.5);
    expect(result.facts.yearBuilt).toBe(2005);
    expect(result.facts.annualTax).toBe(4200);
    expect(result.facts.hoaMonthly).toBe(125);
    expect(result.facts.monthlyRentEstimate).toBe(2400);
    expect(result.facts.hasPool).toBe(true);
    expect(result.facts.fieldProvenance?.listPrice).toBe('page');
  });

  it('reports missing fields when page has no data', () => {
    const empty = docFromFixture('<html><body></body></html>');
    const result = extractZillowProperty(
      empty,
      'https://www.zillow.com/homedetails/empty/0_zpid/',
    );

    expect(result.errors.some((e) => e.includes('listPrice'))).toBe(true);
    expect(result.errors.some((e) => e.includes('sqft'))).toBe(true);
  });

  it('does not flag pool when only HOA community amenity mentions pool', () => {
    const hoaHtml = readFileSync(
      join(fixtureDir, '__fixtures__', 'hoa-pool-amenity.html'),
      'utf-8',
    );
    const result = extractZillowProperty(
      docFromFixture(hoaHtml),
      'https://www.zillow.com/homedetails/condo/1_zpid/',
    );

    expect(result.facts.hasPool).toBeUndefined();
  });

  it('extracts partial listing from JSON-LD and DOM fallbacks', () => {
    const partialHtml = readFileSync(
      join(fixtureDir, '__fixtures__', 'partial-listing.html'),
      'utf-8',
    );
    const result = extractZillowProperty(
      docFromFixture(partialHtml),
      'https://www.zillow.com/homedetails/partial/99_zpid/',
    );

    expect(result.facts.listPrice).toBe(289000);
    expect(result.facts.sqft).toBe(1650);
    expect(result.facts.beds).toBe(3);
  });
});
