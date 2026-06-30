/** National planning defaults — tune via data/ bundles later. */

export const MORTGAGE = {
  baselineRatePercent: 6.5,
  spreads: { excellent: 0, good: 0.25, fair: 0.75, poor: 1.5 } as const,
  pmiAnnualRateMid: 0.0075,
  ltvPmiThreshold: 0.8,
};

/** Fallback effective property tax rate when listing has no tax. */
export const DEFAULT_TAX_RATE = 0.011;

/** HO-3 benchmark as fraction of home value per year. */
export const INSURANCE_RATE = 0.0035;

export const UTILITIES = {
  electricPerSqft: 0.12,
  gasPerSqft: 0.04,
  waterPerBed: 40,
  trashMonthly: 25,
  internet: { thrifty: 50, standard: 70, comfortable: 90 },
  poolElectricAdd: 40,
  poolWaterAdd: 15,
};

export const POOL_MONTHLY = {
  thrifty: { low: 60, mid: 90, high: 130 },
  standard: { low: 120, mid: 150, high: 200 },
  comfortable: { low: 180, mid: 220, high: 280 },
};

export const LIFESPANS = {
  roof: { years: 25, costPerSqft: { low: 4, mid: 5.5, high: 8 } },
  hvac: { years: 15, cost: { low: 5000, mid: 8500, high: 14000 } },
  waterHeater: { years: 10, cost: { low: 900, mid: 1400, high: 2200 } },
  poolPump: { years: 8, cost: { low: 400, mid: 750, high: 1200 } },
  poolLiner: { years: 12, cost: { low: 3500, mid: 5500, high: 9000 } },
};

export const SPENDING_UTILITY_MULT = {
  thrifty: 0.85,
  standard: 1.0,
  comfortable: 1.15,
} as const;

export const SPENDING_INSURANCE_MULT = {
  thrifty: 0.9,
  standard: 1.0,
  comfortable: 1.1,
} as const;

export const DIY_LABOR_SHARE = 0.4;
export const DIY_MULT = { none: 1.0, some: 0.85, high: 0.7 } as const;
