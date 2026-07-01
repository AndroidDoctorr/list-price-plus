import type { PropertyFacts } from '@list-price-plus/core';

import { extractListingDocument } from '../shared/generic-extract';
import type { ExtractResult } from '../types';
import { parseNumber } from '../parse-utils';

export const ADAPTER_ID = 'realtor';
export const ADAPTER_VERSION = '1';

function enhanceDom(doc: Document): Partial<PropertyFacts> {
  const patch: Partial<PropertyFacts> = { fieldProvenance: {} };
  const prov = patch.fieldProvenance!;

  const priceEl =
    doc.querySelector('[data-testid="list-price"]') ??
    doc.querySelector('[data-label="pc-price"]') ??
    doc.querySelector('.listing-price');

  if (priceEl && patch.listPrice === undefined) {
    const price = parseNumber(priceEl.textContent);
    if (price !== undefined && price > 10_000) {
      patch.listPrice = price;
      prov.listPrice = 'page';
    }
  }

  return patch;
}

export function extractRealtorProperty(doc: Document, url: string): ExtractResult {
  return extractListingDocument(doc, url, {
    source: 'realtor',
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
    extraEmbeddedSelectors: ['#__NEXT_DATA__', 'script#___NEXT_DATA__'],
    enhanceDom,
  });
}

export const realtorAdapter = {
  id: ADAPTER_ID,
  version: ADAPTER_VERSION,
  extract: extractRealtorProperty,
};
