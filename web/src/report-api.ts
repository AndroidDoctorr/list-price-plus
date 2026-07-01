import {
  formatCurrency,
  isReportExpired,
  normalizeSharedReport,
  REPORTS_COLLECTION,
  type SharedReport,
} from '@list-price-plus/core';
import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export async function loadSharedReport(id: string): Promise<SharedReport | null> {
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firebase is not configured for this deployment.');
  }

  const snap = await getDoc(doc(db, REPORTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return normalizeSharedReport(snap.data());
}

export { formatCurrency, isReportExpired };
export type { SharedReport };
