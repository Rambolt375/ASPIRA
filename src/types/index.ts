// ─── Report lifecycle ────────────────────────────────────────────────────────

export type ReportStatus =
  | 'DITERIMA'          // Ticket created with timestamp
  | 'VERIFIKASI'        // AI/human authenticity check
  | 'DICEK'             // On-site survey by agency
  | 'DITUGASKAN'        // Assigned to agency with SLA deadline
  | 'DALAM_PENANGANAN'  // Active repair work
  | 'DIATASI'           // Completed — requires "after" photo proof
  | 'PENINJAUAN'        // Citizen confirmation + before/after AI comparison
  | 'PERAWATAN'         // Periodic maintenance schedule
  | 'DITOLAK'           // Rejected — must include transparent reason
  | 'DIBUKA_KEMBALI';   // Reopened if repair is found to have failed

export interface StatusHistoryEntry {
  status: ReportStatus;
  timestamp: string;       // ISO 8601
  actorId: string;
  actorName?: string;
  note?: string;
  photoUrl?: string;       // required at DIATASI
}

// ─── Report ─────────────────────────────────────────────────────────────────

export type ReportCategory =
  | 'JALAN'
  | 'JEMBATAN'
  | 'DRAINASE'
  | 'LAMPU_JALAN'
  | 'TAMAN'
  | 'SAMPAH'
  | 'BANJIR'
  | 'LAINNYA';

export type SeverityLevel = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: SeverityLevel;
  location: GeoPoint;
  address: string;
  photoUrls: string[];
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];  // append-only
  authorId: string;
  authorName: string;
  assignedAgency?: string;
  slaDeadline?: string;                 // ISO 8601 — set at DITUGASKAN
  afterPhotoUrl?: string;               // required before DIATASI → PENINJAUAN
  aiTriageResult?: AiTriageResult;
  communityConfirmations: string[];     // array of user IDs
  createdAt: string;
  updatedAt: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface AiTriageResult {
  isLegitimate: boolean;
  confidence: number;       // 0–1
  suggestedCategory: ReportCategory;
  suggestedSeverity: SeverityLevel;
  reasoning: string;
  flagged: boolean;
  flagReason?: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'WARGA' | 'PETUGAS' | 'ADMIN';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  kelurahan?: string;
  createdAt: string;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
