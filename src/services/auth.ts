import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase';
import type { AppUser, UserRole } from '@/types';

// ─── Auth operations ─────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const db   = getFirebaseDb();

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });

  const user: AppUser = {
    id:        credential.user.uid,
    email,
    name,
    role:      'WARGA',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.id), { ...user, createdAt: serverTimestamp() });
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

// ─── Firestore user profile ───────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'users', uid), { role }, { merge: true });
}

// ─── Auth state listener ──────────────────────────────────────────────────────

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
