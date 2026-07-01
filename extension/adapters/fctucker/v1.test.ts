import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { extractFctuckerProperty } from './v1';

const fixtureDir = dirname(fileURLToPath(import.meta.url));
const listingHtml = readFileSync(
  join(fixtureDir, '__fixtures__', 'listing.html'),
  'utf-8',
);

describe('extractFctuckerProperty', () => {
  it('reads listing facts from JSON-LD and embedded data', () => {
    const doc = new JSDOM(listingHtml, {
      url: 'https://www.talktotucker.com/homes/602-s-main-street-whitestown-in-46075/12345678',
    }).window.document;

    const result = extractFctuckerProperty(
      doc,
      'https://www.talktotucker.com/homes/602-s-main-street-whitestown-in-46075/12345678',
    );

    expect(result.facts.listPrice).toBe(325000);
    expect(result.facts.sqft).toBe(1316);
    expect(result.facts.beds).toBe(3);
    expect(result.facts.baths).toBe(2);
    expect(result.facts.yearBuilt).toBe(2018);
    expect(result.facts.source).toBe('fctucker');
    expect(result.errors).toHaveLength(0);
  });
});
