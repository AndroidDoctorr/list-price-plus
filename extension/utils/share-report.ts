import {
  buildSharedReport,
  REPORTS_COLLECTION,
  shareUrlForReport,
  type AgentBranding,
  type CostEstimate,
  type PropertyFacts,
  type SharedReport,
  type UserProfile,
} from '@list-price-plus/core';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/utils/firebase';

export interface ShareReportInput {
  branding: AgentBranding;
  sourceUrl: string;
  propertyFacts: PropertyFacts;
  profileSnapshot: UserProfile;
  estimate: CostEstimate;
  listingTitle?: string;
}

export interface ShareReportResult {
  report: SharedReport;
  shareUrl: string;
}

export async function publishSharedReport(
  input: ShareReportInput,
): Promise<ShareReportResult> {
  const id = crypto.randomUUID();
  const report = buildSharedReport({
    id,
    branding: input.branding,
    sourceUrl: input.sourceUrl,
    propertyFacts: input.propertyFacts,
    profileSnapshot: input.profileSnapshot,
    estimate: input.estimate,
    listingTitle: input.listingTitle,
  });

  await setDoc(doc(getFirebaseDb(), REPORTS_COLLECTION, id), {
    ...report,
    expiresAt: Timestamp.fromDate(new Date(report.expiresAt)),
  });

  return {
    report,
    shareUrl: shareUrlForReport(id),
  };
}

export async function copyTextToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}
