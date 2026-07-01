import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { extractRealtorProperty } from './v1';

const fixtureDir = dirname(fileURLToPath(import.meta.url));
const listingHtml = readFileSync(
  join(fixtureDir, '__fixtures__', 'listing.html'),
  'utf-8',
);

describe('extractRealtorProperty', () => {
  it('reads listing facts from Next.js payload', () => {
    const url =
      'https://www.realtor.com/realestateandhomes-detail/1234-Elm-St_Indianapolis_IN_46201_M12345-67890';
    const doc = new JSDOM(listingHtml, { url }).window.document;

    const result = extractRealtorProperty(doc, url);

    expect(result.facts.listPrice).toBe(415000);
    expect(result.facts.sqft).toBe(1950);
    expect(result.facts.beds).toBe(3);
    expect(result.facts.baths).toBe(2);
    expect(result.facts.yearBuilt).toBe(1998);
    expect(result.facts.hoaMonthly).toBe(110);
    expect(result.facts.source).toBe('realtor');
    expect(result.errors).toHaveLength(0);
  });
});
