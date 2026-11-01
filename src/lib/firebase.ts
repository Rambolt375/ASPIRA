import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

function getFirebaseConfig() {
  return {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key',
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy.firebaseapp.com',
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:dummy',
  };
}

// Lazy singletons — init is deferred until first use so that importing this
// module during Next.js build-time page collection does not trigger Firebase
// initialisation when env vars are absent.
let _app: FirebaseApp | null   = null;
let _auth: Auth | null         = null;
let _db: Firestore | null      = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

// Convenience re-exports for code that expects named `auth` / `db`
export const auth = { get current() { return getFirebaseAuth(); } };
export const db   = { get current() { return getFirebaseDb(); } };

export default { get app() { return getFirebaseApp(); } };
