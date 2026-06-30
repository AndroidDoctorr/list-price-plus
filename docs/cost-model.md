# Cost model

How List Price Plus turns property facts + user profile into a monthly estimate.

## Output shape

```typescript
interface CostEstimate {
  monthlyTotal: { low: number; mid: number; high: number };
  breakdown: CostLineItem[];
  capexTimeline: CapexEvent[];  // next 10 years, annualized $/mo for reserve
  assumptions: string[];        // human-readable
  confidence: 'low' | 'medium' | 'high';
}
```

Each `CostLineItem`: `{ category, label, monthlyMid, monthlyLow, monthlyHigh, notes? }`.

## Categories

### 1. Financing (owner) or acquisition context (investor)

**Mortgage (P&I)**

```
M = P * [r(1+r)^n] / [(1+r)^n - 1]
```

- `P` = loan amount = price − down payment
- `r` = monthly rate from profile credit tier + user-editable override
- `n` = term months

Add **PMI** if LTV > 80% (profile down payment default e.g. 10% / 20%).

**Investor mode:** same math if financed; optional cash purchase (no P&I line).

### 2. Property tax

Priority order:

1. Annual tax from listing / county data on page → ÷ 12
2. Else: `listPrice × effectiveRate` from `data/regional/tax-rates-by-county.json`
3. Apply profile multiplier (disabled veteran exemptions etc. — user flag, not auto-applied)

### 3. Insurance

- **Owner-occupier:** HO-3 benchmark by state, sqft, year built, flood zone hint if available
- **Landlord:** DP-3 / landlord policy ~15–25% higher baseline
- Profile: thrifty → higher deductible assumption → lower premium mid estimate

### 4. HOA / condo fees

From page when present; else $0 with note "Verify HOA."

### 5. Utilities

Modeled per utility; sum to monthly range.

| Utility | Model inputs |
|---------|--------------|
| Electric | sqft, climate zone, beds (occupancy proxy), pool pump, EV flag |
| Gas | heating type, climate |
| Water/sewer | beds, lot irrigation, pool top-up |
| Trash | flat regional default |
| Internet | profile tier (thrifty = lower speed tier) |

```
utilityMid = sqft * region.electricPerSqft * occupancyFactor * profile.utilityMultiplier
```

`profile.utilityMultiplier`: thrifty 0.85, standard 1.0, comfortable 1.15  
Disability profile (if user opts in): +5–15% electric (medical equipment, climate control needs) — user-configurable, documented.

### 6. Routine maintenance (opex)

Industry rule of thumb: **1%–4% of property value per year** depending on age and profile.

```
annualMaint = homeValue * maintRate
monthlyMaint = annualMaint / 12
```

| Condition | maintRate (annual % of value) |
|-----------|-------------------------------|
| New build (<10 yr), thrifty DIY | 1.0% |
| Standard 20–40 yr | 1.5–2.5% |
| Older / deferred maintenance inferred | 2.5–4% |

DIY profile: reduce labor portion (~40% of maintenance) by `diySkill` factor.

### 7. Capital expenditures (capex reserve)

Major systems have **lifespan** and **replacement cost** from `data/lifespans.json`.

For each component (roof, HVAC, water heater, appliances, pool liner, septic, well pump):

```
age = currentYear - (installYear or inferred from yearBuilt rules)
remainingLife = lifespan - age
if remainingLife <= 0: urgency = immediate
replacementCost = sqftFactor * regionalCostIndex * componentBaseCost
annualReserve += replacementCost / max(remainingLife, 1)
monthlyCapexReserve = annualReserve / 12
```

**Inference when install year unknown:**

| Component | Default assumption |
|-----------|-------------------|
| Roof | Replaced at 25 yrs if yearBuilt old; else original |
| HVAC | 15 yr lifespan; if yearBuilt > 15 yrs ago, assume 1 replacement |
| Water heater | 10 yr |

Panel shows **timeline**: "Roof (~$18k) — likely needed in 2–4 years."

Pool (if `hasPool`):

| Item | Monthly mid (US average band) |
|------|-------------------------------|
| Chemicals + minor supplies | $30–80 |
| Electricity (pump) | $30–50 |
| Water | $10–30 |
| Professional service (optional) | $80–150 |
| Reserve (liner, equipment) | amortized from lifespan table |

Thrifty: DIY chemicals, skip weekly service. Comfortable: full service company.

### 8. Business / rental mode add-ons

| Line | Default |
|------|---------|
| Vacancy | 5–8% of gross rent (market adjustable) |
| Property management | 8–10% of rent if enabled |
| LLC/admin | flat optional |
| Turnover reserve | 0.5–1 mo rent / 12 |

Rent estimate: page rent Zestimate if present, else user input, else price × gross yield default for ZIP.

### 9. Excluded (explicit)

- Food, personal insurance, commuting
- Furniture, moving
- Income tax (except noting mortgage interest deductibility in footnote only)

## Combining into monthly total

```
monthlyMid = sum(line.monthlyMid for all lines)
monthlyLow = sum(line.monthlyLow) * (1 - globalUncertaintyLow)
monthlyHigh = sum(line.monthlyHigh) * (1 + globalUncertaintyHigh)
```

Global uncertainty widens when critical fields are missing (no tax, no sqft).

## Confidence scoring

| Score | Criteria |
|-------|----------|
| High | price, sqft, tax, year built from page; profile complete |
| Medium | missing tax or one major field inferred |
| Low | mostly defaults; user should edit facts |

## Example (illustrative)

$450k SFH, 2000 sqft, built 1998, pool, 7% mortgage (fair credit), 20% down:

| Category | $/mo mid |
|----------|----------|
| P&I | ~2,400 |
| Tax | ~350 |
| Insurance | ~180 |
| Utilities | ~320 |
| Maintenance | ~560 |
| Capex reserve | ~280 |
| Pool | ~150 |
| **Total** | **~4,240** |

*(Numbers illustrative; engine uses structured data.)*

## Validation strategy

- Golden-file tests: fixed PropertyFacts + profile → snapshot breakdown
- Sanity bounds: $/sqft/month total within 0.3–2.5 for typical US SFH
- Compare against public "true cost of ownership" calculators for regression
