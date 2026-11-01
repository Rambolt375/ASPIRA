# AGENTS.md — ASPIRA (Public Eyes)

> **Project:** ASPIRA — Collaborative Public Reporting, Community & City Transparency Platform  
> **Pilot Location:** Kota Bogor, Indonesia  
> **Original Platform:** React Native + Expo  
> **Target Platform:** Next.js Web Application / PWA  
> **Architecture:** TypeScript + React + Tailwind CSS + Firebase  
> **Purpose:** Web Development Competition

---

# 1. Project Identity and Development Objective

ASPIRA is a civic-tech platform that connects citizens, local communities, and public institutions through collaborative infrastructure reporting, community discussions, AI assistance, and transparent public monitoring.

The application allows citizens to:

- Report infrastructure damage and public issues.
- Attach photographs and geographic coordinates.
- Discover local community information.
- Participate in discussions and interact with community posts.
- Vote on reports to help indicate community urgency.
- Earn contribution points, reputation levels, and achievement badges.
- Monitor the city's public issue statistics.
- Track report handling progress.
- Consult an AI-powered civic assistant.
- Customize application appearance and language.

The initial implementation is a working React Native application built with Expo SDK 54.

The current development objective is to **rebuild the existing application using a different frontend platform and technology stack without fundamentally changing its functionality, user experience, or product identity.**

## 1.1 Migration Philosophy

This is a platform migration, not a product redesign.

The existing application is the functional reference for the rewritten application.

The rewritten application must preserve:

1. Existing user-facing features.
2. Existing user workflows.
3. Existing authentication behavior.
4. Existing community interactions.
5. Existing gamification and reputation mechanics.
6. Existing report submission and tracking behavior.
7. Existing AI assistant functionality.
8. Existing Firebase integration and persistent data.
9. Existing theme and language preferences.
10. Existing navigation logic and information hierarchy.

Do not remove functionality simply because the target platform is different.

Do not simplify the application into a static dashboard or a basic infrastructure reporting form.

**The objective is functional parity with a new technical implementation.**

## 1.2 Source of Truth

When implementing features, follow this priority:

1. Existing working application behavior.
2. Existing application data structures and Firebase collections.
3. Existing user workflows and screen organization.
4. This `AGENTS.md` migration specification.
5. README documentation.
6. New implementation decisions, when no existing behavior is defined.

If the existing application contains a working feature that is not fully documented here, inspect its implementation before modifying it.

Do not invent replacement behavior when the existing behavior can be preserved.

---

# 2. Target Platform and Critical Migration Rules

## 2.1 Target Platform: Native Web / PWA

The rewritten application must use:

- Next.js 14+ with App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Semantic HTML.
- Browser-native APIs.

The following technologies are deprecated for the rewritten frontend:

- React Native.
- Expo.
- Expo Router.
- React Native Web.
- React Native `<View>`, `<Text>`, and other native primitives.
- `StyleSheet`.
- `react-native-*` UI dependencies.
- Expo-specific navigation and UI components.

Do not use React Native Web as a compatibility layer.

Translate existing React Native interfaces into proper web components.

Example migration:

Original:

```tsx
<View>
  <Text>Selamat Datang di ASPIRA</Text>
  <TouchableOpacity onPress={handlePress}>
    <Text>Lihat Laporan</Text>
  </TouchableOpacity>
</View>
```

Target:

```tsx
<section>
  <h1>Selamat Datang di ASPIRA</h1>
  <button type="button" onClick={handlePress}>
    Lihat Laporan
  </button>
</section>
```

Use Tailwind CSS for layout, responsiveness, typography, and visual styling.

## 2.2 Preserve Existing Functionality

Do not interpret the migration as permission to remove:

- Community feed.
- Community discussions.
- Comments and replies.
- Upvote and downvote interactions.
- Contribution points.
- Reputation levels.
- Achievement badges.
- Local UMKM promotions.
- Local community information.
- AI assistant.
- Dark mode and light mode.
- Indonesian and English language support.
- Authentication and onboarding.

These are intentional ASPIRA product features.

## 2.3 Avoid Unnecessary Rewrites

Before implementing anything:

- Inspect the existing repository.
- Identify existing Firebase collections.
- Identify existing service functions.
- Identify existing TypeScript types.
- Identify existing authentication workflows.
- Identify existing UI components.
- Identify existing state management.
- Identify the original feature behavior.

Reuse and adapt existing logic wherever possible.

Do not replace a working implementation with a completely different architecture unless there is a clear technical reason.

---

# 3. Technology Stack

The target application should use the following architecture.

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ |
| Routing | Next.js App Router |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Persistence | Firebase / Browser Storage |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Media Storage | Firebase Cloud Storage |
| AI | OpenRouter / Google Gemini |
| Maps | Leaflet + react-leaflet |
| Map Data | OpenStreetMap |
| Icons | Lucide React |
| Deployment | Web-compatible hosting |
| PWA | Web App Manifest + Service Worker |

Use the existing installed dependency versions where practical.

Do not upgrade or downgrade major dependencies without checking compatibility.

## 3.1 Firebase

Firebase remains the primary backend.

Use:

- Firebase Authentication for user authentication.
- Cloud Firestore for persistent application data.
- Firebase Storage for uploaded photographs and other media.

Do not replace Firebase with Prisma, PostgreSQL, Supabase, or another backend without explicit project approval.

Preserve existing collection names and document structures whenever possible.

If the old schema requires adaptation for the web application, use a controlled migration strategy rather than silently changing existing data.

## 3.2 Zustand

Zustand remains the preferred global state management solution.

Use it for application-wide state such as:

- Authenticated user.
- Theme preference.
- Language preference.
- Notifications, where appropriate.
- User profile and reputation.
- Application-level UI state.

Do not store large Firestore datasets or sensitive credentials unnecessarily in global client state.

Use Firebase as the source of truth for persistent application data.

## 3.3 Browser Persistence

The original application uses AsyncStorage.

For the web implementation, replace it with suitable browser storage:

| Original | Web Equivalent |
|---|---|
| AsyncStorage | localStorage |
| AsyncStorage for larger data | IndexedDB |
| Secure authentication persistence | Firebase Auth persistence |
| Temporary UI state | React / Zustand |
| Server-managed session | Secure HTTP-only cookies, if implemented |

Do not introduce AsyncStorage into the Next.js frontend.

---

# 4. Product Features and Functional Requirements

All existing product features must be preserved.

## 4.1 Authentication and Onboarding

The application must support the existing authentication workflows.

Expected functionality:

- Login.
- Registration.
- Logout.
- Forgot password.
- Password reset.
- Authentication state persistence.
- User profile initialization.
- New-user onboarding.
- Protected application routes.
- Guest or unauthenticated access according to existing behavior.

Use Firebase Authentication.

Do not recreate authentication with hardcoded users or client-side-only password validation.

Authentication state must be synchronized with Firebase.

User-facing authentication messages must be available in Indonesian and English.

## 4.2 Main Dashboard — Beranda

The home page is the primary entry point to ASPIRA.

It should provide an overview of the user's local community and the current state of public reports.

Expected elements:

- Welcome section.
- User information.
- City overview.
- City Pulse statistics.
- Recent reports.
- Recent community posts.
- Important local announcements.
- Quick report action.
- Navigation to major application features.

The dashboard should provide meaningful information rather than displaying decorative placeholder statistics.

Use actual Firebase data whenever the backend is connected.

Clearly identify sample data used during development.

## 4.3 Public Infrastructure Reporting

Citizens must be able to report public infrastructure issues.

Supported examples include:

- Road damage.
- Potholes.
- Damaged sidewalks.
- Broken streetlights.
- Public facility damage.
- Waste accumulation.
- Drainage problems.
- Flooding.
- Other public environmental or infrastructure concerns.
- Social disturbances where supported by the original application.

Expected functionality:

- Report title.
- Description.
- Category.
- Problem type.
- Photo evidence.
- GPS coordinates.
- Address information.
- Location selection.
- Report submission.
- Submission confirmation.
- Generated ticket number.
- Report status tracking.

Use browser APIs instead of Expo-native functionality.

Location:

```ts
navigator.geolocation.getCurrentPosition(
  (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
  },
  (error) => {
    // Handle location permission and retrieval errors.
  }
);
```

Camera and file selection:

```html
<input
  type="file"
  accept="image/*"
  capture="environment"
/>
```

Provide a manual location alternative if GPS is unavailable or permission is denied.

Do not require GPS access before users can interact with unrelated application features.

## 4.4 Report Lifecycle and Transparency

Preserve the eight-stage administrative lifecycle defined for ASPIRA.

```ts
export type ReportStatus =
  | "DITERIMA"
  | "VERIFIKASI"
  | "DICEK"
  | "DITUGASKAN"
  | "DALAM_PENANGANAN"
  | "DIATASI"
  | "PENINJAUAN"
  | "PERAWATAN"
  | "DITOLAK"
  | "DIBUKA_KEMBALI";
```

Normal lifecycle:

```text
DITERIMA
    ↓
VERIFIKASI
    ↓
DICEK
    ↓
DITUGASKAN
    ↓
DALAM_PENANGANAN
    ↓
DIATASI
    ↓
PENINJAUAN
    ↓
PERAWATAN
```

Alternative states:

- `DITOLAK`: Rejected with a documented reason.
- `DIBUKA_KEMBALI`: Reopened because the reported issue persists or recurs.

Each transition must preserve its historical information.

Where supported by the existing application, retain:

- Previous status.
- New status.
- Timestamp.
- Actor information.
- Administrative notes.
- Supporting photographs.

Audit records should be append-only at the application level.

A status change must not silently overwrite historical transitions.

Community votes and reputation points must not independently change official administrative status.

## 4.5 Community Feed and Discussions

The community feed is a core ASPIRA feature.

Do not remove or replace it with a simple recent-reports list.

The feed should support the existing application behavior, including:

- Publishing community posts.
- Viewing local community updates.
- Viewing report-related discussions.
- Viewing local news and announcements.
- Sharing UMKM promotions.
- Post details.
- Comments.
- Replies, where supported.
- Upvote and downvote interactions.
- User information and timestamps.
- Relevant content categories.

The interface should make it clear whether content represents:

1. An official or administrative announcement.
2. A citizen-submitted infrastructure report.
3. A community discussion.
4. Local news or information.
5. An UMKM promotion.

Do not represent citizen-generated posts as official government statements.

### Voting System

Preserve upvote and downvote functionality.

Votes provide community feedback and help indicate the perceived urgency or relevance of a report.

Requirements:

- Prevent repeated voting by the same account on the same target.
- Allow vote changes if supported by existing behavior.
- Keep vote counts synchronized with persistent data.
- Prevent client-side manipulation of vote totals.
- Validate voting operations on the backend.
- Avoid treating popularity as proof of authenticity.

Voting must not replace official report verification.

---

# 5. Gamification and Reputation System

Gamification is an intentional component of the original ASPIRA application.

Do not remove it.

Its purpose is to encourage responsible participation and recognize meaningful community contributions.

## 5.1 Contribution Points

Preserve the existing contribution point mechanics.

Possible contribution activities include:

- Submitting valid reports.
- Participating in community discussions.
- Providing useful field confirmations.
- Helping other citizens.
- Other activities defined by the existing application.

Before modifying point calculations, inspect the original implementation.

Do not arbitrarily invent new point rewards or change existing reward values.

Point calculations must be validated by trusted backend logic where possible.

Never allow users to directly submit arbitrary point totals.

## 5.2 Reputation Levels

Preserve the existing reputation tiers:

| Level | Description |
|---|---|
| Bronze | Initial contribution level |
| Silver | Developing community participation |
| Gold | Established community contribution |
| Diamond | High contribution level |

Use the existing point thresholds if they are defined in the source application.

Do not invent new thresholds without checking the original implementation.

## 5.3 Achievement Badges

Preserve achievement badges, including existing examples:

- Reporter.
- Helper.
- Top 10.

The original badge system may contain additional achievements.

Inspect existing badge definitions before changing them.

Badge requirements should be evaluated consistently.

Do not allow client-side code to arbitrarily assign achievements.

## 5.4 Leaderboards

If the original application implements rankings or Top 10 features, preserve them.

Requirements:

- Use real persisted contribution data.
- Display consistent ranking criteria.
- Avoid exposing private account information.
- Handle tied scores consistently.
- Clearly communicate the ranking period or calculation basis.

Gamification must encourage meaningful civic participation rather than reward spam or duplicate reports.

---

# 6. City Pulse — Public Monitoring

City Pulse represents the overall condition and activity of the city.

Its purpose is to provide an accessible overview of public reporting and issue resolution.

Expected features:

- Total reports.
- Reports by status.
- Resolved reports.
- Pending reports.
- Active incidents.
- Resolution percentage.
- Historical report trends.
- Report distribution by category.
- Geographic distribution.
- Community activity where relevant.

Use actual backend data.

Where response-time statistics are available, distinguish between:

- Report submission time.
- Verification time.
- Assignment time.
- Resolution time.

Do not fabricate official response-time measurements.

Statistics should be calculated from consistent data definitions.

All charts must have clear labels and responsive layouts.

---

# 7. Interactive Mapping

Use:

- Leaflet.
- react-leaflet.
- OpenStreetMap.

Default map center:

```ts
const DEFAULT_MAP_CENTER: [number, number] = [
  -6.5971,
  106.8060,
];
```

Default geographic scope: Kota Bogor, Indonesia.

Expected functionality:

- Display report locations.
- Interactive markers.
- Report detail popups.
- Geographic filtering.
- Category filtering.
- Status filtering.
- Severity filtering, where supported.
- Navigation to individual report details.

### Critical Next.js SSR Requirement

Leaflet requires browser APIs.

Map components must be loaded dynamically with SSR disabled.

```tsx
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("@/components/maps/map-container"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-100 items-center justify-center">
        Memuat peta...
      </div>
    ),
  }
);
```

Do not access `window` or `document` during server rendering.

Import Leaflet CSS correctly.

---

# 8. ASPIRA AI Assistant

The AI assistant is a core product feature.

The original application uses OpenRouter and may also integrate Google Gemini.

Preserve the existing assistant's purpose and conversational workflows.

Expected capabilities:

- Answer questions about public reporting procedures.
- Explain infrastructure categories.
- Explain report statuses.
- Help citizens understand civic participation.
- Provide information about relevant public regulations.
- Explain platform features.
- Assist with community-related questions.
- Provide general civic guidance.

## 8.1 AI Architecture

All AI requests must execute through server-side Next.js Route Handlers.

Suggested architecture:

```text
app/
└── api/
    └── ai/
        ├── chat/
        │   └── route.ts
        └── triage/
            └── route.ts

lib/
└── ai/
    ├── openrouter.ts
    ├── gemini.ts
    └── prompts.ts
```

Do not expose AI API keys in browser code.

Use server-only environment variables:

```ini
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Do not use:

```ini
NEXT_PUBLIC_OPENROUTER_API_KEY=...
```

The original Expo application's public environment variable convention must not be carried into the web implementation.

## 8.2 AI Safety and Reliability

The assistant must not:

- Fabricate official government announcements.
- Claim to have contacted government agencies.
- Invent report statuses.
- Claim that a problem has been repaired without supporting records.
- Present AI-generated regulatory interpretations as definitive legal advice.
- Reveal private user information.
- Perform unauthorized administrative operations.

When providing information about regulations, use reliable sources when available.

AI-generated report classification and severity must remain recommendations subject to human review.

---

# 9. Authentication, Authorization, and Privacy

Use Firebase Authentication.

Preserve the original application's account and profile behavior.

Requirements:

- Authentication state must be synchronized with Firebase.
- Protected routes must validate authentication.
- User roles must be validated on trusted backend operations.
- Administrative actions must require appropriate authorization.
- Public profile information must be separated from private account information.
- Logout must properly clear application authentication state.

## 9.1 Anonymous Reporting

Preserve anonymous reporting if available in the existing application.

UI label:

`Laporkan sebagai Anonim`

An anonymous report must not publicly expose:

- Submitter name.
- Email address.
- Private account identifiers.
- Private profile information.

Internal identity records may remain available to authorized backend operations when required.

## 9.2 Firebase Security

Never rely exclusively on frontend authorization.

Use Firebase Security Rules to enforce:

- User ownership.
- Role-based access.
- Report permissions.
- Voting restrictions.
- Comment permissions.
- Contribution point integrity.
- Badge assignment restrictions.
- Administrative permissions.

Never expose service account credentials or private Firebase administrative credentials to client-side code.

Firebase client configuration identifiers may use `NEXT_PUBLIC_` variables where appropriate. This does not apply to private secrets.

## 9.3 User Roles and Registration Policy

ASPIRA uses a role-based access control (RBAC) system with three primary application roles:

1. `USER`
2. `LOCAL_GOVERNMENT`
3. `INSPECTOR`

### Public Registration

Public registration is exclusively available for the `USER` role.

Requirements:

- Every account created through the public registration page must automatically receive the `USER` role.
- Users must not be able to select or request `LOCAL_GOVERNMENT` or `INSPECTOR` through the normal registration form.
- Role assignment must be performed by trusted backend logic, never by accepting a role value submitted by the client.
- Newly registered accounts must not receive administrative or government permissions by default.

### Special Registration and Account Provisioning

`LOCAL_GOVERNMENT` and `INSPECTOR` accounts must be created through a restricted registration or account-provisioning process controlled by an authorized Admin.

Requirements:

- Admins may create or invite accounts with the `LOCAL_GOVERNMENT` or `INSPECTOR` role.
- Special registration must require an authorized invitation, approval, or administrative provisioning process.
- The assigned role must be validated and stored through trusted backend operations.
- Users must not be able to elevate their own privileges by modifying Firestore documents or client-side state.
- Role changes must be recorded in an administrative audit log.
- Suspended or revoked accounts must immediately lose access to role-restricted operations.

### Role Permissions

**USER**

- Create and submit public reports.
- Upload report photographs and location information.
- Track submitted reports.
- Participate in community discussions.
- Create community posts and comments.
- Upvote and downvote eligible content.
- Earn contribution points, levels, and badges.
- Use the ASPIRA AI assistant.
- View public City Pulse statistics.

**LOCAL_GOVERNMENT**

- Access reports assigned to their institution or authorized administrative scope.
- Review relevant report information.
- Update report handling progress.
- Record official responses and administrative notes.
- Upload supporting evidence of handling or resolution.
- View reports and statistics within their authorized scope.

**INSPECTOR**

- Access reports assigned for inspection or verification.
- Review submitted photographs and report details.
- Record inspection findings.
- Upload field inspection evidence.
- Confirm whether reported conditions match field observations.
- Submit inspection results for the appropriate administrative workflow.

### Authorization Rules

- `USER` cannot perform official administrative status transitions.
- `USER` cannot access restricted government or inspection dashboards.
- `LOCAL_GOVERNMENT` cannot modify reports outside its authorized scope.
- `INSPECTOR` cannot perform government administrative actions unless separately authorized.
- Neither `LOCAL_GOVERNMENT` nor `INSPECTOR` may assign roles or create privileged accounts unless explicitly granted that administrative permission.
- All privileged operations must be validated on the backend and enforced through Firebase Security Rules or trusted server-side authorization.
- Hiding UI elements is not sufficient authorization.
- Administrative and inspection actions must preserve an audit trail.

Role definitions and permissions must be centralized in the application rather than scattered across individual components.

---

# 10. Internationalization and Theme System

Preserve the original application's bilingual and theme functionality.

## 10.1 Language Support

Supported languages:

- Bahasa Indonesia.
- English.

The application must provide a language selector.

All user-facing content must respect the selected language.

This includes:

- Navigation.
- Page titles.
- Form labels.
- Buttons.
- Notifications.
- Error messages.
- Status badges.
- Dialogs.
- Empty states.
- AI assistant interface.
- Community interface.

Do not hardcode interface text throughout individual components.

Use centralized translation resources.

Suggested structure:

```text
constants/
└── i18n/
    ├── id.ts
    └── en.ts
```

Example:

```ts
export const translations = {
  id: {
    home: "Beranda",
    report: "Laporkan",
    community: "Komunitas",
    profile: "Profil",
  },

  en: {
    home: "Home",
    report: "Report",
    community: "Community",
    profile: "Profile",
  },
};
```

The example is illustrative. Preserve existing translation keys and wording where possible.

## 10.2 Theme Support

Preserve:

- Light Mode.
- Dark Mode.

Requirements:

- Centralized theme configuration.
- Consistent colors across components.
- Persistent user preference.
- Correct contrast.
- No isolated components that ignore the selected theme.

Use CSS variables or Tailwind theme configuration.

Do not implement separate unrelated color systems in individual pages.

---

# 11. Target Application Structure

Use Next.js App Router.

Recommended structure:

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── (onboarding)/
│   └── onboarding/
│       └── page.tsx
│
├── (main)/
│   ├── layout.tsx
│   │
│   ├── beranda/
│   │   └── page.tsx
│   │
│   ├── komunitas/
│   │   ├── page.tsx
│   │   └── [postId]/
│   │       └── page.tsx
│   │
│   ├── lapor/
│   │   └── page.tsx
│   │
│   ├── laporan/
│   │   └── [ticket]/
│   │       └── page.tsx
│   │
│   ├── peta/
│   │   └── page.tsx
│   │
│   ├── pantau/
│   │   └── page.tsx
│   │
│   ├── asisten/
│   │   └── page.tsx
│   │
│   └── profil/
│       └── page.tsx
│
├── api/
│   ├── ai/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   └── triage/
│   │       └── route.ts
│   │
│   └── reports/
│       └── route.ts
│
components/
├── ui/
├── layout/
├── auth/
├── onboarding/
├── dashboard/
├── community/
├── reports/
├── maps/
├── gamification/
├── analytics/
├── assistant/
└── profile/

constants/
├── theme.ts
└── i18n/

hooks/
├── use-auth.ts
├── use-theme.ts
└── use-translation.ts

lib/
├── firebase/
│   ├── client.ts
│   ├── auth.ts
│   ├── firestore.ts
│   └── storage.ts
│
├── ai/
│   ├── openrouter.ts
│   ├── gemini.ts
│   └── prompts.ts
│
├── validations.ts
└── utils.ts

stores/
├── auth-store.ts
├── theme-store.ts
└── language-store.ts

types/
└── index.ts

public/
├── images/
├── icons/
└── manifest.json
```

This structure is a recommended target, not a requirement to create every directory immediately.

Preserve the existing repository's organization when it is already clean and functional.

Do not create duplicate implementations simply to match this directory tree.

---

# 12. Firebase Data and TypeScript

Inspect the existing Firebase schema before creating or modifying collections.

Do not assume that the original application uses the same collection names as this document.

Preserve existing data structures wherever possible.

Suggested conceptual entities:

```ts
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;

  avatarUrl?: string;

  points: number;
  level: string;

  badges: string[];

  preferredLanguage: "id" | "en";
  theme: "light" | "dark";

  createdAt: string;
}
```

```ts
export interface CommunityPost {
  id: string;
  authorId: string;

  type: "DISCUSSION" | "NEWS" | "UMKM" | "REPORT";

  title: string;
  content: string;

  imageUrls: string[];

  upvotes: number;
  downvotes: number;

  commentCount: number;

  createdAt: string;
}
```

```ts
export interface ReportItem {
  id: string;
  ticketNumber: string;

  authorId: string;
  isAnonymous: boolean;

  title: string;
  description: string;

  category: string;
  problemType: string;

  latitude: number;
  longitude: number;

  addressText: string;
  subdistrict: string;

  severity: "RENDAH" | "SEDANG" | "TINGGI";

  status: ReportStatus;

  createdAt: string;
}
```

These interfaces are conceptual migration references.

If the existing application uses different field names or structures, adapt the interfaces to preserve compatibility rather than forcing a destructive schema change.

Use consistent timestamps and document identifiers.

Avoid duplicating information unnecessarily.

For Firestore operations, handle:

- Loading states.
- Empty states.
- Permission errors.
- Network errors.
- Invalid documents.
- Concurrent updates.
- Pagination where appropriate.

---

# 13. Media and File Storage

Use Firebase Cloud Storage for existing application media workflows.

Preserve existing upload functionality.

Requirements:

- Image previews.
- File type validation.
- File size validation.
- Upload progress where appropriate.
- Unique storage paths.
- Proper storage access permissions.
- Error handling.
- Image optimization where practical.

Never trust client-provided file extensions alone.

Avoid publicly exposing private user attachments.

If an existing external storage service is still used, preserve its integration when necessary.

Do not replace a working storage provider without a clear reason.

---

# 14. Responsive Design and Accessibility

The target application must support viewport widths from 360px to 1440px.

The desktop version must not simply stretch the original mobile interface.

Translate the original application's information architecture into a suitable responsive web layout.

Expected behavior:

### Mobile

- Compact navigation.
- Touch-friendly controls.
- Appropriate content spacing.
- Responsive cards.
- Mobile-friendly forms.
- Full-width or appropriately sized dialogs.
- No horizontal overflow.

### Tablet

- Flexible navigation.
- Appropriate multi-column layouts.
- Responsive content containers.
- Properly scaled map and dashboard sections.

### Desktop

- Persistent sidebar or suitable desktop navigation.
- Main content area.
- Appropriate information density.
- Multi-column layouts where useful.
- Consistent spacing and typography.

Accessibility:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible form labels.
- Appropriate ARIA attributes.
- Descriptive image alternative text.
- Sufficient color contrast.
- Status indicators that do not depend exclusively on color.

---

# 15. Visual Design Direction

Maintain ASPIRA's existing product identity.

The interface should feel like a modern civic-tech application rather than an unrelated enterprise dashboard.

Design characteristics:

- Professional.
- Modern.
- Community-oriented.
- Trustworthy.
- Data-driven.
- Clear information hierarchy.
- Consistent iconography.
- Responsive layouts.

Use Tailwind CSS and Lucide React.

Example:

```tsx
import {
  MapPin,
  Camera,
  MessageCircle,
  Users,
  Trophy,
  TrendingUp,
} from "lucide-react";
```

Avoid:

- Excessive gradients.
- Excessive animations.
- Unnecessary decorative cards.
- Inconsistent component styles.
- Emoji replacing functional icons.
- Overly dense mobile layouts.
- Unnecessary UI redesigns that change existing user workflows.

The design should improve the original experience while preserving its recognizable product identity.

---

# 16. Environment Variables

Use `.env.local` for local development.

Example:

```ini
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Services - Server Only
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key

# Optional External Storage
STORAGE_API_URL=https://your-storage-api-url.com
STORAGE_API_KEY=your_storage_api_key

# Public Application Configuration
NEXT_PUBLIC_DEFAULT_CITY=Kota Bogor
NEXT_PUBLIC_DEFAULT_LAT=-6.5971
NEXT_PUBLIC_DEFAULT_LNG=106.8060
```

Rules:

1. Private API keys must never use `NEXT_PUBLIC_`.
2. Firebase client configuration may use public environment variables.
3. Do not hardcode credentials.
4. Do not commit `.env.local`.
5. Maintain `.env.example` with placeholders.
6. Validate required environment variables.
7. Keep server-only services separate from client-side modules.

---

# 17. Development Commands

Use the commands defined in the actual `package.json`.

Typical commands:

```bash
# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Production server
npm run start
```

Do not assume every script exists.

Inspect `package.json` before running or adding commands.

Do not introduce Prisma commands unless Prisma is explicitly added and approved for a separate requirement.

Firebase is the primary backend.

---

# 18. Migration Guidelines

This section is particularly important.

The original application already works. The new implementation must preserve its behavior.

## 18.1 React Native to React

Translate components according to their actual responsibilities.

| React Native | Next.js / React |
|---|---|
| View | div / section / main |
| Text | p / span / h1-h6 |
| Pressable | button / a |
| TouchableOpacity | button |
| TextInput | input / textarea |
| ScrollView | Native document scrolling / overflow container |
| FlatList | Array.map / paginated list |
| Image | img / Next Image |
| Modal | Dialog / accessible modal |
| ActivityIndicator | Loading component |
| StyleSheet | Tailwind CSS |
| SafeAreaView | Responsive layout and CSS safe-area support |
| Expo Router | Next.js App Router |
| AsyncStorage | Browser storage |
| Expo Location | Geolocation API |
| Expo Image Picker | HTML file input |
| Expo Camera | Browser camera APIs |
| React Native Reanimated | CSS transitions / appropriate web animation |

Do not mechanically translate every component one-to-one.

Choose the semantic web element that matches the original component's purpose.

## 18.2 Navigation Migration

Preserve the original navigation hierarchy.

The original application includes:

- Authentication routes.
- Onboarding routes.
- Main application tabs.
- Community post details.
- Report creation and tracking.

Translate these into appropriate Next.js routes.

Navigation should remain intuitive and consistent.

Do not remove access to existing features because their original Expo navigation structure is unavailable.

## 18.3 State Migration

Preserve the behavior of existing Zustand stores.

Translate native persistence mechanisms into browser-compatible persistence.

Do not introduce multiple competing global state systems.

Keep server data synchronized with Firebase.

## 18.4 Backend Migration

Keep Firebase as the primary backend.

Do not migrate existing users, reports, comments, votes, points, or badges into an entirely new database unless explicitly required.

Preserve document identifiers and existing relationships whenever possible.

Test existing user data against the rewritten frontend.

## 18.5 Feature Parity

Before declaring the migration complete, compare the original application's behavior with the new implementation.

A feature is not considered migrated merely because its page exists.

It must perform its intended operations and preserve its original user workflow.

---

# 19. Agent Development Workflow

All coding agents must follow this workflow.

## Step 1 — Inspect Existing Implementation

Before modifying a feature:

- Read relevant source files.
- Inspect the existing components.
- Inspect associated Zustand stores.
- Inspect Firebase service functions.
- Inspect Firestore document structures.
- Inspect authentication behavior.
- Identify existing business logic.
- Understand the original user interaction.

Never assume the original feature behavior based solely on its name.

## Step 2 — Identify Migration Requirements

Determine:

- Which React Native components must be replaced.
- Which browser APIs are needed.
- Which Firebase operations must be preserved.
- Which state stores are involved.
- Which routes are affected.
- Which user-facing translations are needed.
- Whether existing data structures are affected.

## Step 3 — Implement

Follow the target architecture.

- Use TypeScript.
- Use semantic HTML.
- Use Tailwind CSS.
- Preserve Firebase integrations.
- Preserve existing business logic.
- Preserve existing application functionality.
- Use server-side AI integration.
- Maintain responsive behavior.

Do not rewrite unrelated features.

## Step 4 — Validate

Run the relevant checks:

```bash
npm run lint
npm run build
```

Verify:

- Authentication.
- Database operations.
- Community feed.
- Voting.
- Points and badges.
- Report submission.
- Report tracking.
- AI assistant.
- Theme switching.
- Language switching.
- Responsive layouts.
- Map hydration.

Do not claim that a check passed unless it was actually executed.

## Step 5 — Report Changes

After completing a task, provide:

1. What was implemented.
2. Which files were changed.
3. Which original functionality was preserved.
4. Any dependencies added or removed.
5. Validation performed.
6. Known limitations or incomplete integrations.

---

# 20. Competition Acceptance Criteria

The migration must satisfy the following requirements.

### Platform

- [ ] Next.js App Router is used.
- [ ] React Native dependencies are not used for the target UI.
- [ ] Semantic HTML is used.
- [ ] Tailwind CSS is used.
- [ ] Application supports PWA installation where configured.

### Authentication

- [ ] Login works.
- [ ] Registration works.
- [ ] Password recovery works.
- [ ] Authentication persists correctly.
- [ ] Protected routes are enforced.
- [ ] Onboarding behavior is preserved.

### Community

- [ ] Community feed works.
- [ ] Post creation works.
- [ ] Post details work.
- [ ] Comments work.
- [ ] Voting works.
- [ ] Local information and UMKM content are supported.

### Gamification

- [ ] Contribution points are preserved.
- [ ] Bronze, Silver, Gold, and Diamond levels are supported.
- [ ] Achievement badges are preserved.
- [ ] Top 10 ranking is supported where implemented.
- [ ] Point calculations cannot be arbitrarily manipulated by clients.

### Reporting

- [ ] Citizens can submit infrastructure reports.
- [ ] Photo uploads work.
- [ ] GPS location works where permission is granted.
- [ ] Manual location selection is available.
- [ ] Report tracking works.
- [ ] Ticket numbers are preserved.
- [ ] Existing status lifecycle behavior is preserved.

### City Pulse

- [ ] Statistics use real backend data.
- [ ] Report status distributions are available.
- [ ] Resolution statistics are accurate.
- [ ] Historical trends are available where data exists.

### AI

- [ ] AI assistant works through server-side integration.
- [ ] API credentials are not exposed to browsers.
- [ ] AI responses handle errors.
- [ ] AI does not fabricate official information.
- [ ] Existing assistant functionality is preserved.

### Localization and Theme

- [ ] Indonesian language works.
- [ ] English language works.
- [ ] Language preference persists.
- [ ] Light mode works.
- [ ] Dark mode works.
- [ ] Theme preference persists.

### Responsive Design

- [ ] 360px viewport supported.
- [ ] Tablet layouts supported.
- [ ] Desktop layouts supported up to 1440px.
- [ ] No unintended horizontal overflow.
- [ ] Interactive elements are touch-friendly.

### Technical Validation

- [ ] No React Native UI primitives remain.
- [ ] No unnecessary Expo dependencies remain.
- [ ] Leaflet uses dynamic client-only imports.
- [ ] Firebase integration works.
- [ ] Production build succeeds.
- [ ] Lint checks pass.

---

# 21. Final Project Directive

ASPIRA is a collaborative civic-tech platform combining public infrastructure reporting, community participation, gamification, AI assistance, and city transparency.

The existing Expo application defines the intended product experience.

The new Next.js application must reproduce that experience using web-native technologies.

**Do not confuse technology migration with product simplification.**

Preserve the community features. Preserve the gamification. Preserve the AI assistant. Preserve the reporting system. Preserve the bilingual interface. Preserve the original user workflows.

Improve the implementation where necessary, but do not silently remove established functionality.

The ultimate objective is:

**ASPIRA — A complete, responsive, web-native civic platform that retains the functionality and identity of its original mobile application while providing a reliable foundation for future development.**