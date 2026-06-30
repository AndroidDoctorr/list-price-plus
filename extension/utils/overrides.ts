import type { PropertyFacts } from '@list-price-plus/core';

const STORAGE_KEY = 'listingOverrides';

export type ListingOverridesMap = Record<string, Partial<PropertyFacts>>;

/** Stable key per listing — pathname without query/hash. */
export function normalizeListingUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export async function loadAllOverrides(): Promise<ListingOverridesMap> {
  const data = await browser.storage.local.get(STORAGE_KEY);
  const map = data[STORAGE_KEY];
  return map && typeof map === 'object' ? (map as ListingOverridesMap) : {};
}

export async function loadOverridesForUrl(
  url: string,
): Promise<Partial<PropertyFacts>> {
  const map = await loadAllOverrides();
  return map[normalizeListingUrl(url)] ?? {};
}

export async function saveOverridesForUrl(
  url: string,
  overrides: Partial<PropertyFacts>,
): Promise<void> {
  const key = normalizeListingUrl(url);
  const map = await loadAllOverrides();
  map[key] = {
    ...overrides,
    fieldProvenance: {
      ...overrides.fieldProvenance,
      ...Object.fromEntries(
        Object.keys(overrides)
          .filter((k) => k !== 'fieldProvenance' && k !== 'source' && k !== 'sourceUrl')
          .map((k) => [k, 'user' as const]),
      ),
    },
  };
  await browser.storage.local.set({ [STORAGE_KEY]: map });
}

export async function clearOverridesForUrl(url: string): Promise<void> {
  const key = normalizeListingUrl(url);
  const map = await loadAllOverrides();
  delete map[key];
  await browser.storage.local.set({ [STORAGE_KEY]: map });
}

export function applyOverrides(
  facts: PropertyFacts,
  overrides: Partial<PropertyFacts>,
): PropertyFacts {
  if (!overrides || Object.keys(overrides).length === 0) return facts;

  const merged: PropertyFacts = { ...facts, fieldProvenance: { ...facts.fieldProvenance } };

  for (const [key, value] of Object.entries(overrides)) {
    if (key === 'fieldProvenance' || key === 'source') continue;
    if (value === undefined || value === '') continue;
    Object.assign(merged, { [key]: value });
    merged.fieldProvenance![key] =
      overrides.fieldProvenance?.[key] ?? 'user';
  }

  return merged;
}

/** Fields users can override from the panel. */
export const EDITABLE_FIELDS = [
  'listPrice',
  'sqft',
  'beds',
  'baths',
  'yearBuilt',
  'lotSqft',
  'annualTax',
  'hoaMonthly',
  'monthlyRentEstimate',
  'hasPool',
] as const satisfies readonly (keyof PropertyFacts)[];

export type EditableField = (typeof EDITABLE_FIELDS)[number];

export function overridesFromForm(
  form: FormData,
): Partial<PropertyFacts> {
  const patch: Partial<PropertyFacts> = { fieldProvenance: {} };

  for (const key of EDITABLE_FIELDS) {
    const raw = form.get(key);
    if (raw === null || raw === '') continue;

    if (key === 'hasPool') {
      patch.hasPool = raw === 'true';
      continue;
    }

    const n = Number(String(raw).replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n)) {
      (patch as Record<string, number>)[key] = n;
    }
  }

  return patch;
}

export function formDefaults(facts: PropertyFacts): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of EDITABLE_FIELDS) {
    const v = facts[key];
    if (v === undefined) {
      out[key] = '';
      continue;
    }
    if (typeof v === 'boolean') {
      out[key] = v ? 'true' : 'false';
    } else {
      out[key] = String(v);
    }
  }
  return out;
}
