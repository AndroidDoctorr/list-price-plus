import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { extractRedfinProperty } from './v1';

const fixtureDir = dirname(fileURLToPath(import.meta.url));
const listingHtml = readFileSync(
  join(fixtureDir, '__fixtures__', 'listing.html'),
  'utf-8',
);

describe('extractRedfinProperty', () => {
  it('reads listing facts from JSON-LD and Next data', () => {
    const url =
      'https://www.redfin.com/IN/Indianapolis/602-S-Main-St-46201/home/12345678';
    const doc = new JSDOM(listingHtml, { url }).window.document;

    const result = extractRedfinProperty(doc, url);

    expect(result.facts.listPrice).toBe(389000);
    expect(result.facts.sqft).toBe(2200);
    expect(result.facts.beds).toBe(4);
    expect(result.facts.baths).toBe(2.5);
    expect(result.facts.annualTax).toBe(4800);
    expect(result.facts.hoaMonthly).toBe(75);
    expect(result.facts.source).toBe('redfin');
    expect(result.errors).toHaveLength(0);
  });
});
