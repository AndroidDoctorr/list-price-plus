import { REPORT_TTL_DAYS } from './share-constants.js';
import { stripUndefined } from './firestore.js';
import type { AgentBranding, CostEstimate, PropertyFacts, SharedReport, UserProfile } from './types.js';

export function defaultAgentBranding(): AgentBranding {
  return {
    name: '',
    brokerage: '',
    phone: '',
    email: '',
  };
}

export function shareUrlForReport(id: string, baseUrl?: string): string {
  const base = (baseUrl ?? 'https://list-price-plus.web.app').replace(/\/$/, '');
  return `${base}/r/${id}`;
}

export function buildSharedReport(input: {
  id: string;
  branding: AgentBranding;
  sourceUrl: string;
  propertyFacts: PropertyFacts;
  profileSnapshot: UserProfile;
  estimate: CostEstimate;
  listingTitle?: string;
  createdAt?: Date;
}): SharedReport {
  const createdAt = input.createdAt ?? new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + REPORT_TTL_DAYS);

  return stripUndefined({
    id: input.id,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    branding: input.branding,
    sourceUrl: input.sourceUrl,
    propertyFacts: input.propertyFacts,
    profileSnapshot: input.profileSnapshot,
    estimate: input.estimate,
    listingTitle: input.listingTitle,
  });
}

export function isReportExpired(report: SharedReport, asOf = new Date()): boolean {
  return new Date(report.expiresAt).getTime() < asOf.getTime();
}

/** Firestore may store expiresAt as ISO string or Timestamp — normalize for the app. */
export function parseExpiresAt(value: unknown): string {
  if (typeof value === 'string') return value;
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  throw new Error('Invalid expiresAt on shared report');
}

export function normalizeSharedReport(data: unknown): SharedReport {
  const report = data as SharedReport;
  return {
    ...report,
    expiresAt: parseExpiresAt(report.expiresAt),
    createdAt:
      typeof report.createdAt === 'string'
        ? report.createdAt
        : parseExpiresAt(report.createdAt),
  };
}
