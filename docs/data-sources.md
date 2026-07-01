# Data sources

What List Price Plus reads from listing sites, what it infers, and what comes from bundled datasets.

## Zillow (v1 target)

### Typically available on listing pages

| Field | Where / how | Reliability |
|-------|---------------|-------------|
| List price | Header, JSON-LD, or embedded state | High |
| Beds / baths | Summary stats | High |
| Sqft | Summary | High |
| Lot size | Facts section | Medium |
| Year built | Facts | Medium |
| HOA fee | Monthly cost section | Medium (often missing) |
| Property tax | Tax history table | High when present |
| Price history | Chart | Low priority |
| Climate / energy | Sometimes in facts | Low |
| Pool | Keywords in description or facts | Medium (NLP + icons) |
| Zestimate / rent estimate | Widget | Medium for investor mode |

### Extraction approach

1. **Structured data:** parse `application/ld+json` RealEstateListing if present.
2. **Embedded JSON:** many sites hydrate React state in `<script>` blobs — adapter-specific parsers (fragile, versioned per adapter).
3. **DOM selectors:** fallback with semantic selectors; avoid class names tied to CSS modules where possible.
4. **Description NLP (light):** regex/keywords for pool, septic, well, "new roof", solar.

Each field records `fieldProvenance` for UI ("Tax: from listing", "Pool: inferred from description").

### Zillow-specific risks

- DOM and embedded state change without notice → adapter versioning (`zillowAdapter@2`).
- Some data behind login — extension only sees public page.
- Rent/Zestimate are estimates themselves — label clearly.

## Other sites (future adapters)

| Site | Priority | Notes |
|------|----------|-------|
| **FC Tucker** | P1 | Indiana broker — see [site-priority.md](site-priority.md) |
| **Redfin** | P1 | Similar data richness to Zillow |
| **Realtor.com** | P1 | MLS-backed facts |
| Trulia | P2 | Zillow Group; may share patterns |
| Homes.com | P2 | National portal |
| Apartments.com | P3 | Renter-focused; different cost model |

Adapter interface:

```typescript
interface SiteAdapter {
  id: string;
  matches(url: URL): boolean;
  extract(): Promise<{ facts: PropertyFacts; errors: string[] }>;
}
```

## Bundled static data (`data/`)

| Dataset | Purpose | Update cadence |
|---------|---------|----------------|
| `regional/utility-rates.json` | $/kWh, $/therm, water by state/ climate zone | Quarterly |
| `regional/insurance-index.json` | HO-3 baseline multipliers | Annual |
| `regional/tax-rates-effective.json` | Fallback effective property tax rate | Annual |
| `lifespans/components.json` | Roof, HVAC, WH, pool equipment lifespans & cost bands | Rare |
| `credit/mortgage-rate-spreads.json` | Rate bands by credit tier + date | Monthly (manual or scrape FRED) |

## External APIs (optional, phase 2+)

| API | Use | Cost / limits |
|-----|-----|---------------|
| OpenEI Utility Rates | Electricity benchmarks | Free |
| Census / ACS | Regional income, housing stats | Free |
| FRED | Mortgage rate anchors | Free |
| ATTOM / CoreLogic | Tax, deed, permits | Paid — premium tier |
| Insurance quote APIs | Real quotes | Affiliate; async UX |

v1 should **not depend** on paid APIs — extension must work offline-first with bundled data.

## User overrides

Always editable in panel:

- List price, down payment, interest rate
- Annual tax, HOA, insurance override
- Rent (investor mode)
- Toggle pool / septic / year major systems replaced

Overrides persist per listing URL in local storage.

## Data freshness

- Extension ships with data bundle at build time.
- Optional: background fetch of `https://data.listpriceplus.app/manifest.json` with semver + signature; user consent for network.

## Quality feedback loop

In-panel: "Was this estimate useful?" + optional "Actual bill" anonymous aggregate (opt-in only) to tune regional coefficients — phase 3.
