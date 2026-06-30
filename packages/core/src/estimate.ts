import {
  DEFAULT_TAX_RATE,
  DIY_LABOR_SHARE,
  DIY_MULT,
  INSURANCE_RATE,
  LIFESPANS,
  MORTGAGE,
  POOL_MONTHLY,
  SPENDING_INSURANCE_MULT,
  SPENDING_UTILITY_MULT,
  UTILITIES,
} from './constants.js';
import { band, lineItem, monthlyFromAnnual, mortgagePayment, round } from './math.js';
import type {
  CapexEvent,
  CostEstimate,
  CostLineItem,
  EstimateOptions,
  PropertyFacts,
  UserProfile,
} from './types.js';

function resolvePrice(property: PropertyFacts): number {
  return property.listPrice ?? 350000;
}

function resolveSqft(property: PropertyFacts): number {
  return property.sqft ?? 1800;
}

function resolveBeds(property: PropertyFacts): number {
  return property.beds ?? 3;
}

function mortgageRate(profile: UserProfile): number {
  if (profile.interestRateOverride !== undefined) {
    return profile.interestRateOverride / 100;
  }
  const spread = MORTGAGE.spreads[profile.creditTier];
  return (MORTGAGE.baselineRatePercent + spread) / 100;
}

function maintenanceRate(property: PropertyFacts, profile: UserProfile): number {
  const year = property.yearBuilt ?? 1990;
  const age = new Date().getFullYear() - year;
  let rate = 0.018;
  if (age < 10) rate = 0.01;
  else if (age > 40) rate = 0.028;

  if (profile.spendingStyle === 'thrifty') rate -= 0.003;
  if (profile.spendingStyle === 'comfortable') rate += 0.004;

  const diy = DIY_MULT[profile.diyLevel];
  const laborSaved = 1 - DIY_LABOR_SHARE + DIY_LABOR_SHARE * diy;
  return rate * laborSaved;
}

function estimateConfidence(
  property: PropertyFacts,
  lines: CostLineItem[],
): 'low' | 'medium' | 'high' {
  const hasPrice = property.listPrice !== undefined;
  const hasSqft = property.sqft !== undefined;
  const hasTax = property.annualTax !== undefined;
  if (hasPrice && hasSqft && hasTax) return 'high';
  if (hasPrice && hasSqft) return 'medium';
  return 'low';
}

export function scheduleCapex(
  property: PropertyFacts,
  asOfDate: Date = new Date(),
): CapexEvent[] {
  const sqft = resolveSqft(property);
  const yearBuilt = property.yearBuilt ?? 1980;
  const currentYear = asOfDate.getFullYear();
  const homeAge = currentYear - yearBuilt;
  const events: CapexEvent[] = [];

  const roofAge = homeAge % LIFESPANS.roof.years;
  const roofRemaining = Math.max(LIFESPANS.roof.years - roofAge, 1);
  const roofCost = sqft * LIFESPANS.roof.costPerSqft.mid;
  events.push({
    component: 'Roof',
    estimatedYear: currentYear + roofRemaining,
    estimatedCost: round(roofCost),
    urgency:
      roofRemaining <= 2 ? 'immediate' : roofRemaining <= 5 ? 'soon' : 'planned',
    notes: `Asphalt shingle, ~${LIFESPANS.roof.years}-yr lifespan`,
  });

  const hvacAge = homeAge % LIFESPANS.hvac.years;
  const hvacRemaining = Math.max(LIFESPANS.hvac.years - hvacAge, 1);
  events.push({
    component: 'HVAC',
    estimatedYear: currentYear + hvacRemaining,
    estimatedCost: LIFESPANS.hvac.cost.mid,
    urgency:
      hvacRemaining <= 2 ? 'soon' : hvacRemaining <= 5 ? 'planned' : 'distant',
  });

  const whAge = homeAge % LIFESPANS.waterHeater.years;
  const whRemaining = Math.max(LIFESPANS.waterHeater.years - whAge, 1);
  events.push({
    component: 'Water heater',
    estimatedYear: currentYear + whRemaining,
    estimatedCost: LIFESPANS.waterHeater.cost.mid,
    urgency: whRemaining <= 3 ? 'soon' : 'planned',
  });

  if (property.hasPool === true) {
    events.push({
      component: 'Pool pump',
      estimatedYear: currentYear + 5,
      estimatedCost: LIFESPANS.poolPump.cost.mid,
      urgency: 'planned',
    });
    events.push({
      component: 'Pool liner',
      estimatedYear: currentYear + 8,
      estimatedCost: LIFESPANS.poolLiner.cost.mid,
      urgency: 'distant',
    });
  }

  return events.sort((a, b) => a.estimatedYear - b.estimatedYear);
}

function capexMonthlyReserve(events: CapexEvent[], currentYear: number): {
  low: number;
  mid: number;
  high: number;
} {
  let annualLow = 0;
  let annualMid = 0;
  let annualHigh = 0;

  for (const e of events) {
    const yearsOut = Math.max(e.estimatedYear - currentYear, 1);
    if (yearsOut > 15) continue;
    annualMid += e.estimatedCost / yearsOut;
    annualLow += (e.estimatedCost * 0.85) / yearsOut;
    annualHigh += (e.estimatedCost * 1.2) / yearsOut;
  }

  return {
    low: annualLow / 12,
    mid: annualMid / 12,
    high: annualHigh / 12,
  };
}

export function estimateMonthlyCosts(
  property: PropertyFacts,
  profile: UserProfile,
  options?: EstimateOptions,
): CostEstimate {
  const asOf = options?.asOfDate ?? new Date();
  const price = resolvePrice(property);
  const sqft = resolveSqft(property);
  const beds = resolveBeds(property);
  const breakdown: CostLineItem[] = [];
  const assumptions: string[] = [];

  const down = profile.downPaymentPercent / 100;
  const loan = price * (1 - down);
  const rate = mortgageRate(profile);

  if (profile.useCase === 'owner_occupier' || loan > 0) {
    const pi = mortgagePayment(loan, rate, profile.loanTermYears);
    breakdown.push(
      lineItem('financing', 'Mortgage (P&I)', band(pi, 0.05), `${round(rate * 1000) / 10}% APR · ${profile.loanTermYears} yr`),
    );

    if (down < MORTGAGE.ltvPmiThreshold) {
      const pmi = (loan * MORTGAGE.pmiAnnualRateMid) / 12;
      breakdown.push(
        lineItem('financing', 'PMI', band(pmi, 0.1), 'Until LTV ≤ 80%'),
      );
    }
  }

  const taxAnnual =
    property.annualTax ?? price * DEFAULT_TAX_RATE;
  if (!property.annualTax) {
    assumptions.push('Property tax estimated at 1.1% of value — edit facts if you know the actual tax.');
  }
  breakdown.push(
    lineItem('taxes', 'Property tax', monthlyFromAnnual(taxAnnual)),
  );

  const insMult = SPENDING_INSURANCE_MULT[profile.spendingStyle];
  const insuranceAnnual = price * INSURANCE_RATE * insMult;
  breakdown.push(
    lineItem('insurance', 'Homeowners insurance', monthlyFromAnnual(insuranceAnnual, 0.2)),
  );

  if (property.hoaMonthly) {
    breakdown.push(
      lineItem('hoa', 'HOA', band(property.hoaMonthly, 0)),
    );
  }

  const utilMult = SPENDING_UTILITY_MULT[profile.spendingStyle];
  let electric = sqft * UTILITIES.electricPerSqft * utilMult;
  if (property.hasPool === true) electric += UTILITIES.poolElectricAdd;
  const gas = sqft * UTILITIES.gasPerSqft * utilMult * 0.8;
  let water = beds * UTILITIES.waterPerBed;
  if (property.hasPool === true) water += UTILITIES.poolWaterAdd;
  const internet = UTILITIES.internet[profile.spendingStyle];

  breakdown.push(
    lineItem('utilities', 'Electric', band(electric, 0.2)),
    lineItem('utilities', 'Gas / heat', band(gas, 0.25)),
    lineItem('utilities', 'Water / sewer', band(water, 0.2)),
    lineItem('utilities', 'Trash', band(UTILITIES.trashMonthly, 0.1)),
    lineItem('utilities', 'Internet', band(internet, 0.1)),
  );

  const maintAnnual = price * maintenanceRate(property, profile);
  breakdown.push(
    lineItem('maintenance', 'Maintenance & repairs', monthlyFromAnnual(maintAnnual, 0.25)),
  );

  const capexEvents = scheduleCapex(property, asOf);
  const capexMo = capexMonthlyReserve(capexEvents, asOf.getFullYear());
  breakdown.push(
    lineItem(
      'capex',
      'Major repair reserve',
      capexMo,
      'Roof, HVAC, water heater, and more',
    ),
  );

  if (property.hasPool === true) {
    const pool = POOL_MONTHLY[profile.spendingStyle];
    breakdown.push(
      lineItem('pool', 'Pool upkeep', pool, 'Chemicals, power, service'),
    );
  }

  const monthlyMid = breakdown.reduce((s, l) => s + l.monthlyMid, 0);
  const monthlyLow = breakdown.reduce((s, l) => s + l.monthlyLow, 0);
  const monthlyHigh = breakdown.reduce((s, l) => s + l.monthlyHigh, 0);

  const uncertainty =
    estimateConfidence(property, breakdown) === 'low' ? 0.08 : 0.04;

  assumptions.push(
    'Estimates only — not financial, tax, or insurance advice.',
  );
  if (profile.interestRateOverride === undefined) {
    assumptions.push(
      `Mortgage rate based on ${profile.creditTier} credit tier — shop lenders for your actual rate.`,
    );
  }

  return {
    monthlyTotal: {
      low: round(monthlyLow * (1 - uncertainty)),
      mid: round(monthlyMid),
      high: round(monthlyHigh * (1 + uncertainty)),
    },
    breakdown,
    capexTimeline: capexEvents,
    assumptions,
    confidence: estimateConfidence(property, breakdown),
  };
}
