import type { UserProfile } from './types.js';

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

export const PROFILE_STORAGE_KEY = 'userProfile';
