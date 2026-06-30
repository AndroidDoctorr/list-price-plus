# User profiles

Settings that adjust estimates without changing property facts.

## Profile schema (draft)

```typescript
interface UserProfile {
  id: string;
  name: string;  // "My defaults", "Conservative investor"

  spendingStyle: 'thrifty' | 'standard' | 'comfortable';

  creditTier: 'excellent' | 'good' | 'fair' | 'poor';
  downPaymentPercent: number;   // 3.5 - 50
  loanTermYears: 15 | 20 | 30;
  interestRateOverride?: number; // APR; if set, ignores credit tier table

  diyLevel: 'none' | 'some' | 'high';

  useCase: 'owner_occupier' | 'long_term_rental' | 'short_term_rental';

  accessibility?: AccessibilitySettings;

  insuranceDeductible: 'high' | 'standard' | 'low';

  utilities?: {
    evCharging: boolean;
    homeOfficeMultiplier: number; // 1.0 default
  };

  rental?: {
    managementFeePercent: number;
    vacancyPercent: number;
    monthlyRentOverride?: number;
  };
}

interface AccessibilitySettings {
  enabled: boolean;
  /** Documented assumptions only — user controls all toggles */
  higherClimateControlNeed: boolean;  // +utility multiplier
  mobilityModificationsReserve: number; // $/mo reserve for ramps, lifts, maintenance
  increasedMaintenanceVisitNeed: boolean; // +maintenance opex
}
```

## Spending style

| Style | Maintenance rate | Utility mult | Pool service | Insurance deductible |
|-------|------------------|--------------|--------------|----------------------|
| Thrifty | Lower band of age-based rate | 0.85 | DIY, no weekly service | High |
| Standard | Mid | 1.0 | Seasonal pro open/close | Standard |
| Comfortable | Upper mid (proactive) | 1.15 | Full weekly service | Low |

Thrifty ≠ "pretend nothing breaks" — capex reserve stays; routine opex and utilities shrink.

## Credit tier → mortgage rate

Uses baseline 30-yr fixed from `data/credit/mortgage-rate-spreads.json` (updated periodically):

| Tier | Typical spread vs excellent | Example (if baseline 6.5%) |
|------|----------------------------|----------------------------|
| Excellent (760+) | +0.0% | 6.5% |
| Good (700–759) | +0.25% | 6.75% |
| Fair (640–699) | +0.75% | 7.25% |
| Poor (<640) | +1.5%+ | 8.0%+ |

User can always override APR. UI explains: "Rates are illustrative; shop lenders."

PMI rules when LTV > 80% (or FHA MI for low down) — simplified table in core.

## DIY level

Reduces **labor portion** of maintenance and some pool/HVAC service lines:

| DIY | Labor cost multiplier |
|-----|----------------------|
| None | 1.0 |
| Some | 0.75 |
| High | 0.55 |

Does not eliminate capex reserves for major systems (roof still needs pros).

## Use case modes

### Owner-occupier (default)

HO-3 insurance, owner utility occupancy, no vacancy.

### Long-term rental

- Landlord insurance baseline
- Vacancy + management (from `rental` sub-object)
- Maintenance at upper band (tenant wear)
- Rent from page or override for cash-flow line: `rent - totalCosts`

### Short-term rental (later)

- Higher utility multiplier
- Higher turnover/cleaning reserve
- STR insurance premium factor
- Regulatory note in UI (local STR rules not modeled)

## Disability / accessibility

**Important:** List Price Plus does not diagnose or assume disability. User opts into `accessibility.enabled` and chooses toggles.

When enabled, optional adjustments:

| Toggle | Effect |
|--------|--------|
| Higher climate control need | +10% utilities (editable %) |
| Mobility modifications reserve | Flat $/mo (default $50–150, user set) |
| Increased maintenance visits | +15% routine maintenance |

Copy is respectful and factual: "Adjust estimates for accessibility-related costs you expect."

No medical data collected.

## Multiple profiles

Users may save:

- "Personal — fair credit"
- "Investment — conservative"

Popup quick-switch; extension uses active profile ID.

## Presets (onboarding)

First-run wizard:

1. "I'm buying to live in" / "I'm investing" / "Both"
2. Credit rough band
3. Thrifty / typical / comfortable
4. Optional accessibility step (skippable)

Defaults applied immediately; advanced settings in popup.
