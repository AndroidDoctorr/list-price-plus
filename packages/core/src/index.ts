import type {
  CapexEvent,
  CostEstimate,
  EstimateOptions,
  PropertyFacts,
  UserProfile,
} from './types.js';

export type {
  AccessibilitySettings,
  CapexEvent,
  CostEstimate,
  CostLineItem,
  EstimateOptions,
  PropertyFacts,
  UserProfile,
} from './types.js';

/**
 * Primary entry point — not yet implemented.
 * @see docs/cost-model.md
 */
export function estimateMonthlyCosts(
  _property: PropertyFacts,
  _profile: UserProfile,
  _options?: EstimateOptions,
): CostEstimate {
  throw new Error(
    'estimateMonthlyCosts is not implemented yet. See docs/cost-model.md and docs/roadmap.md.',
  );
}

/**
 * Schedule major capital expenditures over the next decade.
 * @see docs/cost-model.md
 */
export function scheduleCapex(
  _property: PropertyFacts,
  _asOfDate: Date = new Date(),
): CapexEvent[] {
  throw new Error(
    'scheduleCapex is not implemented yet. See docs/cost-model.md.',
  );
}

/** Sensible defaults for first-run / popup onboarding. */
export function defaultUserProfile(): UserProfile {
  return {
    id: 'default',
    name: 'My defaults',
    spendingStyle: 'standard',
    creditTier: 'good',
    downPaymentPercent: 20,
    loanTermYears: 30,
    diyLevel: 'some',
    useCase: 'owner_occupier',
    insuranceDeductible: 'standard',
    utilities: {
      evCharging: false,
      homeOfficeMultiplier: 1,
    },
  };
}
