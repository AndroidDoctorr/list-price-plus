import { FIREBASE_PROJECT_ID } from '@list-price-plus/core';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

function readApiKey(): string {
  const env = import.meta.env;
  const key =
    (typeof env.WXT_FIREBASE_API_KEY === 'string' && env.WXT_FIREBASE_API_KEY) ||
    (typeof env.VITE_FIREBASE_API_KEY === 'string' && env.VITE_FIREBASE_API_KEY) ||
    '';
  return key.trim();
}

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export function isFirebaseConfigured(): boolean {
  return readApiKey().length > 0;
}

export function getFirebaseDb(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add WXT_FIREBASE_API_KEY (or VITE_FIREBASE_API_KEY) to extension/.env (see .env.example).',
    );
  }

  if (!db) {
    app = initializeApp({
      apiKey: readApiKey(),
      authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
    });
    db = getFirestore(app);
  }

  return db;
}
