# Extraction QA checklist

Manual pass before Phase 6 (cost engine). Test **10 Zillow listings** across different property types. Copy this table into a spreadsheet or check boxes in GitHub.

## How to test

1. `pnpm dev` → reload extension in your normal Chrome
2. Open each listing URL
3. Wait ~5 seconds for hydration
4. Record panel values and confidence badge
5. Use **Edit facts** if something is wrong — note whether manual fix was needed

## Zillow — 10 listings

| # | URL (short) | Type | Price | Sqft | Beds | Tax | Confidence | Pass? | Notes |
|---|-------------|------|-------|------|------|-----|------------|-------|-------|
| 1 | | SFH suburban | | | | | | ☐ | |
| 2 | | SFH older (pre-1980) | | | | | | ☐ | |
| 3 | | New build | | | | | | ☐ | |
| 4 | | Condo + HOA | | | | | | ☐ | Pool = community only? |
| 5 | | Townhouse | | | | | | ☐ | |
| 6 | | High price ($1M+) | | | | | | ☐ | |
| 7 | | Low price (<$200k) | | | | | ☐ | |
| 8 | | With rent Zestimate | | | | | | ☐ | |
| 9 | | Rural / large lot | | | | | | ☐ | |
| 10 | | Your mom's market (IN) | | | | | | ☐ | |

**Pass criteria (Phase 5 exit):**

- ≥ **8 / 10** have **price + sqft + beds** (from page, inferred, or manual)
- ≤ **2 / 10** need more than 2 manual edits
- **0 / 10** wrong pool (community counted as private)

## Secondary sites (when adapters exist)

Repeat when FC Tucker / RE/MAX adapters land — target ≥ **6 / 10** with price + sqft + beds.

## Report issues

For failures, note in GitHub issues:

- Listing URL
- Screenshot of panel
- Which fields wrong
- Optional: save page → sanitize → add to `extension/adapters/zillow/__fixtures__/`
