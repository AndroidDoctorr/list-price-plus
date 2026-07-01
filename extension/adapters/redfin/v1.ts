import type { PropertyFacts } from '@list-price-plus/core';

import { extractListingDocument } from '../shared/generic-extract';
import type { ExtractResult } from '../types';
import { parseNumber } from '../parse-utils';

export const ADAPTER_ID = 'redfin';
export const ADAPTER_VERSION = '1';

const REDFIN_INLINE_PATTERNS = [
  /window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\})\s*;\s*<\/script>/,
  /window\.__reactServerAgent\s*=\s*(\{[\s\S]*?\})\s*;/,
];

function enhanceDom(doc: Document): Partial<PropertyFacts> {
  const patch: Partial<PropertyFacts> = { fieldProvenance: {} };
  const prov = patch.fieldProvenance!;

  const priceEl =
    doc.querySelector('[data-rf-test-id="abp-price"]') ??
    doc.querySelector('.statsValue.price') ??
    doc.querySelector('.price-section .price');

  if (priceEl && patch.listPrice === undefined) {
    const price = parseNumber(priceEl.textContent);
    if (price !== undefined && price > 10_000) {
      patch.listPrice = price;
      prov.listPrice = 'page';
    }
  }

  return patch;
}

export function extractRedfinProperty(doc: Document, url: string): ExtractResult {
  return extractListingDocument(doc, url, {
    source: 'redfin',
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
    extraEmbeddedSelectors: ['#__NEXT_DATA__', 'script[type="application/json"]'],
    inlineJsonPatterns: REDFIN_INLINE_PATTERNS,
    enhanceDom,
  });
}

export const redfinAdapter = {
  id: ADAPTER_ID,
  version: ADAPTER_VERSION,
  extract: extractRedfinProperty,
};
