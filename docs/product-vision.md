# Product vision

## One-liner

List Price Plus shows the **true monthly cost of a property** — not just the sticker price — directly on real estate listing pages, personalized to how *you* live or invest.

## Mission

Help people make better housing and investment decisions by making ongoing property costs as visible as listing price.

## Target users

### Primary: Home buyers (owner-occupiers)

Browsing Zillow (or similar), comparing neighborhoods. They know the mortgage payment but not taxes + utilities + "something always breaks" money.

**Job to be done:** "Before I fall in love with this house, tell me if I can actually afford to *keep* it."

### Secondary: Small landlords / first-time investors

Evaluating rental properties on listing sites. Need vacancy, management, capex reserve, and insurance distinct from owner-occupier assumptions.

**Job to be done:** "Does this property cash-flow after realistic expenses, not fantasy expenses?"

### Tertiary: Renters comparing options

Rent vs. buy is out of scope for v1, but renters still benefit from utility + fee estimates on rental listings where data exists.

## Non-goals (v1)

- General household budgeting (groceries, childcare, entertainment)
- Full mortgage pre-approval or lender integration
- Property valuation / "is this a good deal" scoring (may come later)
- Automated offer or negotiation tools

## Core experience

1. User installs extension and completes a **profile** (credit tier, spending style, optional disability/accessibility flags).
2. User browses listings on a supported site (Zillow first).
3. List Price Plus detects a listing page, extracts property attributes, and shows a **Cost panel**:
   - Monthly total (range + point estimate)
   - Breakdown by category
   - Upcoming capex timeline ("Water heater likely within 3 years")
4. User toggles scenarios ("What if I put 20% down?" / "Thrifty mode") without leaving the page.
5. Optional: save listing + estimate to companion site for side-by-side compare.

## Design principles

1. **Honest ranges** — show uncertainty; never imply precision we don't have.
2. **Property-specific** — pool, septic, year built, and sqft matter; generic national averages are a fallback only.
3. **Neutral estimates** — monetization must not bias numbers toward affiliates.
4. **Graceful degradation** — if Zillow changes markup, manual edit fields still produce an estimate.
5. **Accessible UI** — settings and panel work with keyboard and screen readers; disability profile affects *numbers*, not usability.

## Success metrics

| Metric | Target (year 1) |
|--------|-----------------|
| Weekly active users | 5k+ |
| Estimate generated per WAU | 3+ |
| Profile completion rate | >60% |
| User-reported "helpful" (in-panel thumbs) | >70% |
| 7-day retention after install | >25% |

## Competitive landscape

| Alternative | Gap List Price Plus fills |
|-------------|------------------|
| Zillow payment calculator | Mortgage + tax + insurance only; no utilities, maintenance, capex timing |
| Spreadsheet templates | Manual, not on-listing, easy to forget line items |
| Home warranty marketing | Single vendor bias; not holistic |
| Property management software | B2B, not buyer-facing on Zillow |

## Brand

**List Price Plus** — short, memorable, directly names the category users forget (ongoing upkeep).

Tagline options:

- "The whole picture, every property."
- "What this home really costs."
