/** Property attributes extracted from a listing or entered manually. */
export interface PropertyFacts {
  source: 'zillow' | 'manual' | 'redfin' | 'realtor' | 'fctucker';
  sourceUrl?: string;
  listPrice?: number;
  sqft?: number;
  beds?: number;
  baths?: number;
  yearBuilt?: number;
  lotSqft?: number;
  propertyType?:
    | 'single_family'
    | 'condo'
    | 'townhouse'
    | 'multi_family'
    | 'other';
  hoaMonthly?: number;
  annualTax?: number;
  hasPool?: boolean;
  hasSeptic?: boolean;
  hasWell?: boolean;
  heatingType?: string;
  coolingType?: string;
  monthlyRentEstimate?: number;
  fieldProvenance?: Record<string, 'page' | 'inferred' | 'default' | 'user'>;
}

export interface AccessibilitySettings {
  enabled: boolean;
  higherClimateControlNeed: boolean;
  mobilityModificationsReserve: number;
  increasedMaintenanceVisitNeed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  spendingStyle: 'thrifty' | 'standard' | 'comfortable';
  creditTier: 'excellent' | 'good' | 'fair' | 'poor';
  downPaymentPercent: number;
  loanTermYears: 15 | 20 | 30;
  interestRateOverride?: number;
  diyLevel: 'none' | 'some' | 'high';
  useCase: 'owner_occupier' | 'long_term_rental' | 'short_term_rental';
  accessibility?: AccessibilitySettings;
  insuranceDeductible: 'high' | 'standard' | 'low';
  utilities?: {
    evCharging: boolean;
    homeOfficeMultiplier: number;
  };
  rental?: {
    managementFeePercent: number;
    vacancyPercent: number;
    monthlyRentOverride?: number;
  };
}

export interface CostLineItem {
  category: string;
  label: string;
  monthlyLow: number;
  monthlyMid: number;
  monthlyHigh: number;
  notes?: string;
}

export interface CapexEvent {
  component: string;
  estimatedYear: number;
  estimatedCost: number;
  urgency: 'immediate' | 'soon' | 'planned' | 'distant';
  notes?: string;
}

export interface CostEstimate {
  monthlyTotal: { low: number; mid: number; high: number };
  breakdown: CostLineItem[];
  capexTimeline: CapexEvent[];
  assumptions: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface EstimateOptions {
  asOfDate?: Date;
}

/** Realtor branding copied into shared client reports. */
export interface AgentBranding {
  name: string;
  brokerage: string;
  phone: string;
  email: string;
  photoUrl?: string;
  logoUrl?: string;
}

/** Firestore document for a client share link. */
export interface SharedReport {
  id: string;
  createdAt: string;
  expiresAt: string;
  branding: AgentBranding;
  sourceUrl: string;
  propertyFacts: PropertyFacts;
  profileSnapshot: UserProfile;
  estimate: CostEstimate;
  listingTitle?: string;
}
