import type { PropertyFacts } from '@list-price-plus/core';

import type { ExtractResult } from '../types';
import {
  detectPoolInText,
  emptyFacts,
  firstMatchingNumber,
  mergeFacts,
  parseBool,
  parseEmbeddedJsonScripts,
  parseInlineJsonAssignments,
  parseJsonLdScripts,
  parseNumber,
  walkJson,
} from '../parse-utils';

export interface ListingExtractConfig {
  source: PropertyFacts['source'];
  adapterId: string;
  adapterVersion: string;
  extraEmbeddedSelectors?: string[];
  inlineJsonPatterns?: RegExp[];
  enhanceDom?: (doc: Document) => Partial<PropertyFacts>;
}

function fromJsonLd(blocks: unknown[]): Partial<PropertyFacts> {
  const patch: Partial<PropertyFacts> = { fieldProvenance: {} };
  const prov = patch.fieldProvenance!;

  for (const block of blocks) {
    walkJson(block, (obj) => {
      const type = String(obj['@type'] ?? '');
      const isListing =
        type.includes('RealEstateListing') ||
        type.includes('SingleFamilyResidence') ||
        type.includes('Apartment') ||
        type.includes('House') ||
        type.includes('Product');

      if (!isListing && !('offers' in obj) && !('floorSize' in obj)) return;

      if (patch.sqft === undefined && obj.floorSize) {
        const size = obj.floorSize as Record<string, unknown>;
        patch.sqft = parseNumber(size.value ?? size);
        if (patch.sqft) prov.sqft = 'page';
      }

      if (patch.yearBuilt === undefined && obj.yearBuilt) {
        patch.yearBuilt = parseNumber(obj.yearBuilt);
        if (patch.yearBuilt) prov.yearBuilt = 'page';
      }

      const offers = obj.offers;
      const offer = Array.isArray(offers) ? offers[0] : offers;
      if (offer && typeof offer === 'object') {
        const o = offer as Record<string, unknown>;
        if (patch.listPrice === undefined) {
          patch.listPrice = parseNumber(o.price ?? o.lowPrice ?? o.highPrice);
          if (patch.listPrice) prov.listPrice = 'page';
        }
      }

      if (patch.listPrice === undefined && obj.price) {
        patch.listPrice = parseNumber(obj.price);
        if (patch.listPrice) prov.listPrice = 'page';
      }

      if (patch.beds === undefined) {
        patch.beds = parseNumber(
          obj.numberOfBedrooms ?? obj.numberOfRooms ?? obj.bedrooms,
        );
        if (patch.beds) prov.beds = 'page';
      }

      if (patch.baths === undefined) {
        patch.baths = parseNumber(
          obj.numberOfBathroomsTotal ?? obj.numberOfBathrooms ?? obj.bathrooms,
        );
        if (patch.baths) prov.baths = 'page';
      }
    });
  }

  return patch;
}

function fromEmbeddedJson(blobs: unknown[]): Partial<PropertyFacts> {
  const patch: Partial<PropertyFacts> = { fieldProvenance: {} };
  const prov = patch.fieldProvenance!;

  for (const blob of blobs) {
    if (patch.listPrice === undefined) {
      const price = firstMatchingNumber(blob, [
        'price',
        'listPrice',
        'list_price',
        'listPriceValue',
        'unformattedPrice',
        'currentPrice',
        'list_price_min',
      ]);
      if (price !== undefined && price > 10_000) {
        patch.listPrice = price;
        prov.listPrice = 'page';
      }
    }

    if (patch.sqft === undefined) {
      const sqft = firstMatchingNumber(blob, [
        'livingArea',
        'livingAreaValue',
        'livingAreaSqFt',
        'finishedSqFt',
        'sqft',
        'building_size_sqft',
        'buildingSize',
        'squareFeet',
        'livingAreaSize',
      ]);
      if (sqft !== undefined && sqft > 100) {
        patch.sqft = sqft;
        prov.sqft = 'page';
      }
    }

    if (patch.beds === undefined) {
      const beds = firstMatchingNumber(blob, [
        'bedrooms',
        'beds',
        'bedroomCount',
        'beds_total',
      ]);
      if (beds !== undefined && beds <= 20) {
        patch.beds = beds;
        prov.beds = 'page';
      }
    }

    if (patch.baths === undefined) {
      const baths = firstMatchingNumber(blob, [
        'bathrooms',
        'baths',
        'bathroomCount',
        'bathroomsFull',
        'baths_total',
        'bathsFull',
      ]);
      if (baths !== undefined && baths <= 20) {
        patch.baths = baths;
        prov.baths = 'page';
      }
    }

    if (patch.yearBuilt === undefined) {
      const year = firstMatchingNumber(blob, [
        'yearBuilt',
        'yearBuiltEffective',
        'year_built',
      ]);
      if (year !== undefined && year > 1800 && year <= new Date().getFullYear()) {
        patch.yearBuilt = year;
        prov.yearBuilt = 'page';
      }
    }

    if (patch.lotSqft === undefined) {
      const lot = firstMatchingNumber(blob, [
        'lotSize',
        'lotAreaValue',
        'lotSqft',
        'lot_size_sqft',
      ]);
      if (lot !== undefined && lot > 100) {
        patch.lotSqft = lot;
        prov.lotSqft = 'page';
      }
    }

    if (patch.annualTax === undefined) {
      const tax = firstMatchingNumber(blob, [
        'taxAnnualAmount',
        'propertyTaxRate',
        'annualTax',
        'taxPaid',
        'tax_amount',
        'taxAmount',
      ]);
      if (tax !== undefined && tax > 100) {
        patch.annualTax = tax;
        prov.annualTax = 'page';
      }
    }

    if (patch.hoaMonthly === undefined) {
      const hoa = firstMatchingNumber(blob, [
        'monthlyHoaFee',
        'hoaFee',
        'hoaMonthlyFee',
        'hoa_fee',
        'associationFee',
      ]);
      if (hoa !== undefined) {
        patch.hoaMonthly = hoa;
        prov.hoaMonthly = 'page';
      }
    }

    if (patch.monthlyRentEstimate === undefined) {
      const rent = firstMatchingNumber(blob, [
        'rentZestimate',
        'rentEstimate',
        'rent_price',
      ]);
      if (rent !== undefined && rent > 100) {
        patch.monthlyRentEstimate = rent;
        prov.monthlyRentEstimate = 'page';
      }
    }

    if (patch.hasPool === undefined) {
      const POOL_BOOL_KEYS = new Set([
        'hasPool',
        'hasPrivatePool',
        'privatePool',
        'isPoolPrivate',
      ]);
      const POOL_TEXT_KEYS =
        /^(description|remarks|publicRemarks|propertyDescription|whatILove|interiorFeatures|exteriorFeatures|poolFeatures|homeFeatures|listingDescription)$/i;
      const SKIP_TEXT_KEYS =
        /amenit|hoa|association|community|shared|fee|includedFeatures/i;

      walkJson(blob, (obj) => {
        if (patch.hasPool !== undefined) return;

        for (const key of POOL_BOOL_KEYS) {
          if (!(key in obj)) continue;
          const pool = parseBool(obj[key]);
          if (pool === true) {
            patch.hasPool = true;
            prov.hasPool = 'page';
            return;
          }
          if (pool === false) {
            patch.hasPool = false;
            prov.hasPool = 'page';
            return;
          }
        }

        for (const [key, value] of Object.entries(obj)) {
          if (typeof value !== 'string') continue;
          if (SKIP_TEXT_KEYS.test(key)) continue;
          if (!POOL_TEXT_KEYS.test(key) && key !== 'pool') continue;

          const signal = detectPoolInText(value);
          if (signal === 'property') {
            patch.hasPool = true;
            prov.hasPool = key === 'description' ? 'inferred' : 'page';
            return;
          }
        }
      });
    }
  }

  return patch;
}

function genericFromDom(doc: Document): Partial<PropertyFacts> {
  const patch: Partial<PropertyFacts> = { fieldProvenance: {} };
  const prov = patch.fieldProvenance!;
  const bodyText = doc.body?.innerText || doc.body?.textContent || '';

  const priceEl =
    doc.querySelector('[data-testid="price"]') ??
    doc.querySelector('[data-rf-test-id="abp-price"]') ??
    doc.querySelector('.price') ??
    doc.querySelector('.list-price');

  if (!patch.listPrice) {
    const priceText = priceEl?.textContent ?? bodyText.match(/\$[\d,]+/)?.[0];
    const price = parseNumber(priceText);
    if (price !== undefined && price > 10_000) {
      patch.listPrice = price;
      prov.listPrice = priceEl ? 'page' : 'inferred';
    }
  }

  const bedMatch = bodyText.match(/(\d+(?:\.\d+)?)\s*(?:bd|beds?|bedrooms?)\b/i);
  if (bedMatch && patch.beds === undefined) {
    patch.beds = parseNumber(bedMatch[1]);
    if (patch.beds) prov.beds = 'inferred';
  }

  const bathMatch = bodyText.match(/(\d+(?:\.\d+)?)\s*(?:ba|baths?|bathrooms?)\b/i);
  if (bathMatch && patch.baths === undefined) {
    patch.baths = parseNumber(bathMatch[1]);
    if (patch.baths) prov.baths = 'inferred';
  }

  const sqftMatch = bodyText.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet)\b/i);
  if (sqftMatch && patch.sqft === undefined) {
    patch.sqft = parseNumber(sqftMatch[1]);
    if (patch.sqft) prov.sqft = 'inferred';
  }

  const yearMatch = bodyText.match(/\b(?:built|year built)[:\s]*(\d{4})\b/i);
  if (yearMatch && patch.yearBuilt === undefined) {
    patch.yearBuilt = parseNumber(yearMatch[1]);
    if (patch.yearBuilt) prov.yearBuilt = 'inferred';
  }

  return patch;
}

function collectEmbeddedBlobs(
  doc: Document,
  config: ListingExtractConfig,
): unknown[] {
  const blobs = parseEmbeddedJsonScripts(doc);

  if (config.extraEmbeddedSelectors) {
    for (const selector of config.extraEmbeddedSelectors) {
      for (const el of doc.querySelectorAll(selector)) {
        const text = el.textContent?.trim();
        if (!text || text.length < 20) continue;
        try {
          blobs.push(JSON.parse(text));
        } catch {
          // ignore
        }
      }
    }
  }

  if (config.inlineJsonPatterns?.length) {
    blobs.push(...parseInlineJsonAssignments(doc, config.inlineJsonPatterns));
  }

  return blobs;
}

export function extractListingDocument(
  doc: Document,
  url: string,
  config: ListingExtractConfig,
): ExtractResult {
  const errors: string[] = [];
  let facts = emptyFacts(config.source, url);

  try {
    facts = mergeFacts(facts, fromJsonLd(parseJsonLdScripts(doc)));
  } catch {
    errors.push('JSON-LD parse failed');
  }

  try {
    facts = mergeFacts(facts, fromEmbeddedJson(collectEmbeddedBlobs(doc, config)));
  } catch {
    errors.push('Embedded JSON parse failed');
  }

  try {
    facts = mergeFacts(facts, genericFromDom(doc));
    if (config.enhanceDom) {
      facts = mergeFacts(facts, config.enhanceDom(doc));
    }
  } catch {
    errors.push('DOM parse failed');
  }

  for (const field of ['listPrice', 'sqft'] as const) {
    if (facts[field] === undefined) {
      errors.push(`Missing ${field}`);
    }
  }

  return {
    facts,
    errors,
    adapterId: config.adapterId,
    adapterVersion: config.adapterVersion,
  };
}
