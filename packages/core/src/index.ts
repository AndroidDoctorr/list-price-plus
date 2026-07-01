import type {
  CapexEvent,
  CostEstimate,
  EstimateOptions,
  PropertyFacts,
  UserProfile,
} from './types.js';

export type {
  AccessibilitySettings,
  AgentBranding,
  CapexEvent,
  CostEstimate,
  CostLineItem,
  EstimateOptions,
  PropertyFacts,
  SharedReport,
  UserProfile,
} from './types.js';

export {
  AGENT_PROFILE_STORAGE_KEY,
  FIREBASE_PROJECT_ID,
  REALTOR_MODE_STORAGE_KEY,
  REPORTS_COLLECTION,
  REPORT_TTL_DAYS,
  SHARE_BASE_URL,
} from './share-constants.js';
export { formatCurrency } from './format.js';
export { stripUndefined } from './firestore.js';
export { defaultUserProfile, PROFILE_STORAGE_KEY } from './profile.js';
export {
  buildSharedReport,
  defaultAgentBranding,
  isReportExpired,
  normalizeSharedReport,
  parseExpiresAt,
  shareUrlForReport,
} from './report.js';
export { estimateMonthlyCosts, scheduleCapex } from './estimate.js';
