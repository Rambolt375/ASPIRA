import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import type { Report, ReportStatus, StatusHistoryEntry } from '@/types';

const REPORTS = 'reports';
const PAGE_SIZE = 20;

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createReport(
  data: Omit<Report, 'id' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt' | 'communityConfirmations'>,
): Promise<string> {
  const db = getFirebaseDb();
  const firstEntry: StatusHistoryEntry = {
    status:    'DITERIMA',
    timestamp: new Date().toISOString(),
    actorId:   data.authorId,
    actorName: data.authorName,
    note:      'Laporan berhasil dibuat',
  };

  const ref = await addDoc(collection(db, REPORTS), {
    ...data,
    status:                 'DITERIMA',
    statusHistory:          [firstEntry],
    communityConfirmations: [],
    createdAt:              serverTimestamp(),
    updatedAt:              serverTimestamp(),
  });

  return ref.id;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getReport(id: string): Promise<Report | null> {
  const snap = await getDoc(doc(getFirebaseDb(), REPORTS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Report) : null;
}

export async function getReports(
  cursor?: QueryDocumentSnapshot,
): Promise<{ reports: Report[]; nextCursor: QueryDocumentSnapshot | null }> {
  const db = getFirebaseDb();
  let q = query(collection(db, REPORTS), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
  if (cursor) q = query(q, startAfter(cursor));

  const snap = await getDocs(q);
  const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
  const nextCursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
  return { reports, nextCursor };
}

export async function getReportsByUser(uid: string): Promise<Report[]> {
  // No composite index needed — filter then client-sort
  const snap = await getDocs(
    query(collection(getFirebaseDb(), REPORTS), where('authorId', '==', uid)),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Report))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Status transition (append-only) ─────────────────────────────────────────

export async function advanceStatus(
  reportId: string,
  entry: StatusHistoryEntry,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), REPORTS, reportId), {
    status:        entry.status,
    statusHistory: arrayUnion(entry),
    updatedAt:     serverTimestamp(),
  });
}

// ─── Community confirmation ───────────────────────────────────────────────────

export async function addCommunityConfirmation(reportId: string, userId: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), REPORTS, reportId), {
    communityConfirmations: arrayUnion(userId),
    updatedAt:              serverTimestamp(),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip undefined values before any Firestore write — Firebase rejects undefined. */
export function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
