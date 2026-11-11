import type {
  Role as PrismaRole,
  ReputationLevel as PrismaReputationLevel,
  ReportStatus as PrismaReportStatus,
  ReportCategory as PrismaReportCategory,
  SeverityLevel as PrismaSeverityLevel,
  CaptureSource as PrismaCaptureSource,
  PostType as PrismaPostType,
  ActivityType as PrismaActivityType,
  BadgeType as PrismaBadgeType,
} from '@prisma/client';

export type UserRole = PrismaRole | 'WARGA'; // WARGA is alias for USER
export type ReputationLevel = PrismaReputationLevel;
export type ReportStatus = PrismaReportStatus;
export type ReportCategory = PrismaReportCategory;
export type SeverityLevel = PrismaSeverityLevel;
export type CaptureSource = PrismaCaptureSource;
export type PostType = PrismaPostType;
export type ActivityType = PrismaActivityType;
export type BadgeType = PrismaBadgeType;

// ─── Status History ──────────────────────────────────────────────────────────

export interface StatusHistoryEntry {
  id?: string;
  status: ReportStatus;
  timestamp: string; // ISO 8601
  actorId: string;
  actorName?: string;
  note?: string;
  photoUrl?: string; // required at DIATASI
}

// ─── Geo ─────────────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

// ─── Evidence & Media ────────────────────────────────────────────────────────

export interface ReportMediaItem {
  id: string;
  fileUrl: string;
  mediaType: string;
  isDirectCapture: boolean;
  captureSource: CaptureSource;
  metadataJson?: string | null;
  blurredUrl?: string | null;
  isAfterPhoto: boolean;
  createdAt: string;
}

export interface EvidenceVerificationResult {
  id?: string;
  authenticityScore: number; // 0.0 - 1.0
  isLegitimate: boolean;
  confidence: number;
  aiFindingsJson?: string | null;
  suggestedCategory?: ReportCategory | null;
  suggestedSeverity?: SeverityLevel | null;
  requiresHumanReview: boolean;
  reviewerId?: string | null;
  reviewDecision?: string | null;
  reviewNotes?: string | null;
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: SeverityLevel;
  location: GeoPoint;
  address: string;
  kelurahan?: string | null;
  kecamatan?: string | null;
  photoUrls: string[];
  media?: ReportMediaItem[];
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];
  authorId: string;
  authorName: string;
  assignedAgency?: string | null;
  slaDeadline?: string | null;
  afterPhotoUrl?: string | null;
  verification?: EvidenceVerificationResult | null;
  aiTriageResult?: AiTriageResult;
  communityConfirmations: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── AI Triage ───────────────────────────────────────────────────────────────

export interface AiTriageResult {
  isLegitimate: boolean;
  confidence: number; // 0–1
  suggestedCategory: ReportCategory;
  suggestedSeverity: SeverityLevel;
  reasoning: string;
  flagged: boolean;
  flagReason?: string;
}

// ─── User Profile ────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  kelurahan?: string | null;
  kecamatan?: string | null;
  phone?: string | null;
  isVerifiedReporter?: boolean;
  contributionPoints?: number;
  reputationLevel?: ReputationLevel;
  createdAt: string;
}

// ─── Community Feed ──────────────────────────────────────────────────────────

export interface CommunityPostItem {
  id: string;
  title: string;
  content: string;
  type: PostType;
  category?: string | null;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  authorBadge?: string | null;
  linkedReportId?: string | null;
  upvotes: number;
  downvotes: number;
  userVote?: number; // 1, -1, or 0
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityCommentItem {
  id: string;
  postId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  authorBadge?: string | null;
  authorRole?: string | null;
  content: string;
  createdAt: string;
  replies?: CommunityCommentItem[];
}

// ─── Chat Assistant ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export interface PointTransactionItem {
  id: string;
  points: number;
  activityType: ActivityType;
  description: string;
  createdAt: string;
}

export interface UserBadgeItem {
  badgeType: BadgeType;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}
