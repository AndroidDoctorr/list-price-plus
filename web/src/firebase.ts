import { FIREBASE_PROJECT_ID } from '@list-price-plus/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY ?? '';

export function isFirebaseConfigured(): boolean {
  return apiKey.length > 0;
}

export const firebaseApp = isFirebaseConfigured()
  ? initializeApp({
      apiKey,
      authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
    })
  : undefined;

export const db = firebaseApp ? getFirestore(firebaseApp) : undefined;
