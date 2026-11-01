# AGENTS.md — ASPIRA

> **Project:** ASPIRA — Collaborative Public Reporting, Community & City Transparency Platform  
> **Pilot Location:** Kota Bogor, Indonesia  
> **Target Platform:** Next.js web application / PWA  
> **Architecture:** TypeScript, React, Next.js, PostgreSQL, Docker Compose  
> **Purpose:** Web development competition

This document defines the product requirements, technical constraints, and working practices for coding agents contributing to ASPIRA. Treat it as the project specification for this repository.

---

# 1. Project Identity and Development Objective

ASPIRA is a civic-tech platform that connects citizens, local communities, and public institutions through collaborative infrastructure reporting, community discussions, AI assistance, and transparent public monitoring.

The application is intended to let citizens:

- Report infrastructure damage and public issues.
- Attach photographs and geographic coordinates.
- Discover local community information.
- Participate in discussions and interact with community posts.
- Vote on eligible reports and community content to indicate relevance or urgency.
- Earn contribution points, reputation levels, and achievement badges.
- Monitor public issue statistics for the city.
- Track report-handling progress and its history.
- Consult an AI-powered civic assistant.
- Customize application appearance and language.

## 1.1 Product principles

ASPIRA is a complete civic platform, not merely a reporting form or a static analytics dashboard. Preserve the intended product scope:

1. Public infrastructure reporting and tracking.
2. Community feed, discussions, comments, and replies.
3. Local information, news, announcements, and UMKM promotions.
4. Community voting and feedback.
5. Gamification, contribution points, reputation levels, badges, and rankings.
6. City Pulse statistics and geographic monitoring.
7. AI civic assistance.
8. Authentication, onboarding, role-based access, and user profiles.
9. Indonesian and English language support.
10. Light and dark themes.

Do not remove or silently downgrade a feature because it is more complex to implement on the web. If a feature cannot be completed in the current task, document the limitation and leave a clear implementation path.

## 1.2 Source of truth and repository independence

This repository is a standalone ASPIRA web application. Its implementation must be based on:

1. The requirements in this `AGENTS.md`.
2. The code, types, database schema, migrations, and tests in this repository.
3. Decisions explicitly confirmed by the project owner.
4. The README and other project documentation.

The earlier React Native / Expo application is product-history context only. Do not assume its source code, dependencies, database, Firebase project, collections, credentials, or build environment are available. Do not attempt to inspect, clone, import, or depend on that application. Do not add migration logic that requires access to it unless the project owner explicitly requests a data migration and supplies the required export or source material.

Where detailed business rules are not specified here, choose a conservative, maintainable implementation, document the assumption, and avoid inventing official policy or reward thresholds.

## Historical Documentation and Archived Specifications

The directory `docs/archive/` contains historical project specifications and earlier development documents.

These files are retained for reference and must not be treated as active technical instructions.

In particular:

- `docs/archive/AGENTS.firebase-era.md` contains the original ASPIRA specification written for the earlier Firebase-based migration plan.
- It may be consulted to recover product requirements, feature descriptions, user workflows, design decisions, and other details that may not have been fully carried into the current specification.
- It must not override the current root `AGENTS.md` regarding architecture, database technology, authentication, storage, dependencies, or development workflow.
- If a potentially useful requirement in an archived document is missing from the current specification, identify it and propose incorporating it into the current `AGENTS.md` rather than silently following conflicting historical instructions.

The root `AGENTS.md` is the authoritative active instruction document.

---

# 2. Target Platform and Technical Rules

## 2.1 Web platform

The application uses:

- Next.js App Router.
- React.
- TypeScript with strict type checking.
- Tailwind CSS.
- Semantic HTML and accessible browser-native behavior.
- Server Components by default; Client Components only where interactivity or browser APIs require them.

Do not introduce React Native, Expo, Expo Router, React Native Web, native UI primitives, or `StyleSheet` into the web application.

Use the existing repository structure where it is clean and appropriate. Do not create duplicate folders or abstractions solely to match an example structure in this document.

## 2.2 Current repository organization

The current project uses a `src/` directory with these areas:

```text
src/
├── app/          # Next.js routes, layouts, and route handlers
├── components/   # Reusable UI and feature components
├── constants/    # Static configuration and translations
├── hooks/        # Reusable React hooks
├── lib/          # Shared libraries, database, auth, and utilities
├── services/     # Application/business operations
├── stores/       # Zustand client state
└── types/        # Shared TypeScript types

public/           # Static assets and PWA assets
```

Keep feature-specific code cohesive. Put database access and trusted business operations on the server. Never import server-only database or secret-bearing modules into Client Components.

## 2.3 Dependency management

- Inspect `package.json` before assuming a command or dependency exists.
- Use the installed project versions unless a change is necessary.
- Check compatibility before upgrading major dependencies.
- Do not add a library for functionality that is already adequately supported by the existing stack.
- Keep `package-lock.json` committed and use npm consistently unless the project owner changes the package manager.

---

# 3. Technology Stack and System Architecture

The intended stack is:

| Layer | Technology | Responsibility |
|---|---|---|
| Web framework | Next.js 16 App Router | Routing, rendering, server actions/route handlers |
| UI | React 19 | Interface and component behavior |
| Language | TypeScript | Application types and compile-time checks |
| Styling | Tailwind CSS 4 | Responsive layout and visual system |
| Client state | Zustand | Small, shared client-side UI state |
| Relational database | PostgreSQL 17 | Persistent application records and relationships |
| Database runtime | Docker Compose | Local PostgreSQL development service |
| ORM / migrations | Prisma ORM, subject to project approval | Typed database access and schema migrations |
| Authentication | Select a server-compatible auth library | Identity, sessions, password flows |
| Media storage | S3-compatible object storage or a suitable local development adapter | Uploaded images and attachments |
| Maps | Leaflet + react-leaflet | Interactive maps |
| Map data | OpenStreetMap | Basemap data |
| AI | OpenRouter and/or Google Gemini | Server-side AI features |
| Icons | Lucide React | Interface icons |
| PWA | Web App Manifest and service worker, if implemented | Installable web experience |

Do not use Firebase, Firestore, Firebase Authentication, or Firebase Storage in this project. PostgreSQL is the primary persistent application database.

Important distinction: PostgreSQL replaces the database role previously assigned to Firestore. It does not itself provide authentication/session management, object/file storage, or an AI provider. Implement those concerns with their own appropriate services and keep them integrated with the PostgreSQL-backed application.

## 3.1 PostgreSQL and Docker Compose

The local development database is PostgreSQL 17, managed by the repository's `docker-compose.yml`.

The expected service configuration is:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: aspira-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: aspira_dev
      POSTGRES_USER: aspira
      POSTGRES_PASSWORD: local_dev_password
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - aspira_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aspira -d aspira_dev"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  aspira_postgres_data:
```

The checked-in development password is for local development only. Never reuse it in staging or production. Keep the database bound to `127.0.0.1` for local development unless there is a deliberate, documented networking requirement.

### Database connection

When Next.js runs directly on the host machine, the local connection string is:

```dotenv
DATABASE_URL="postgresql://aspira:local_dev_password@localhost:5432/aspira_dev"
```

If the Next.js application is later run as a service inside the same Compose network, use the Compose service name as the hostname:

```dotenv
DATABASE_URL="postgresql://aspira:local_dev_password@postgres:5432/aspira_dev"
```

Do not use `localhost` from one container to connect to another container. Use the service name `postgres` on the Compose network.

### Local database commands

```bash
# Start PostgreSQL in the background
docker compose up -d

# Check service state
docker compose ps

# View database logs
docker compose logs -f postgres

# Stop containers; the named volume is retained
docker compose down

# Destructive: stop containers and delete the database volume/data
docker compose down -v
```

Never run `docker compose down -v` as routine cleanup. It deletes the local database volume and all data stored in it.

## 3.2 ORM and database access

Prisma is the preferred ORM candidate, but treat its adoption as subject to explicit project approval. If Prisma is approved:

- Use Prisma schema and committed migration files as the database schema source of truth.
- Use migrations for schema changes; do not rely on ad-hoc manual production schema edits.
- Generate and commit the lockfile changes associated with dependency changes.
- Keep Prisma Client and database access in server-only modules, typically under `src/lib/`.
- Use transactions for operations that must succeed or fail together.
- Validate input before database writes.
- Do not expose raw database credentials or Prisma internals to the browser.

If Prisma has not yet been approved or configured, do not invent Prisma commands or create a second database abstraction. Keep database-dependent work isolated behind `src/services/` and `src/lib/` so the ORM can be introduced consistently later.

Avoid raw SQL unless it is justified, parameterized, and reviewed for correctness and injection safety.

## 3.3 Database design principles

Use relational tables and explicit relationships for core application data. Model foreign keys, uniqueness, indexes, and deletion behavior deliberately.

Expected domain entities include, but are not limited to:

- Users and user profiles.
- Roles and, if required, role assignments.
- Reports and report attachments.
- Report status history / audit events.
- Report assignments and inspection records.
- Community posts, comments, replies, and votes.
- Point transactions, reputation levels, and badges.
- Notifications.
- Administrative audit events.

Do not store uploaded image binaries directly in PostgreSQL. Store object keys/URLs and relevant metadata in database records; keep the actual files in the configured object storage.

Use database constraints to enforce invariants where practical. Use indexes for frequently filtered or joined columns. Avoid duplicating derived counts or totals unless there is a clear consistency strategy.

## 3.4 Authentication is separate from PostgreSQL

Do not implement authentication by storing plaintext passwords or by treating a user table as a complete authentication system.

Evaluate and select a compatible authentication solution (for example, Better Auth or Auth.js) before implementing production authentication. The selected solution must support secure password hashing where password authentication is used, session lifecycle management, CSRF protections appropriate to its design, and server-side session validation.

Persist application user profiles and role assignments in PostgreSQL. Link authentication identities to the corresponding application user record. Keep authorization decisions in trusted server-side code and the database, not only in client state.

Do not use Firebase Authentication.

## 3.5 Media storage is separate from PostgreSQL

Use an S3-compatible object storage provider for production media storage, with a suitable local development option if needed. The exact provider may be selected later, but the application must access it through a small storage service abstraction.

Requirements:

- Validate actual file type and file size on the server.
- Generate unique, non-user-controlled object keys.
- Restrict upload permissions and access to private attachments.
- Use signed URLs or an authenticated proxy where appropriate.
- Store file metadata and object keys in PostgreSQL, not file binaries.
- Support image previews, upload progress where practical, and clear error handling.

Do not use Firebase Storage.

## 3.6 Zustand and browser persistence

Use Zustand only for appropriate shared client state, such as:

- Theme preference.
- Language preference.
- Temporary UI state, drawers, dialogs, and filters.
- Client-side session/user presentation state where needed.

The server and PostgreSQL remain the source of truth for persistent application data. Do not duplicate large server datasets in Zustand without a clear reason. Do not store passwords, private API keys, or sensitive session credentials in localStorage or Zustand persistence.

Use browser storage only for non-sensitive preferences or temporary client state. Use secure, HTTP-only cookies for sessions when required by the selected authentication solution.

---

# 4. Product Features and Functional Requirements

All product areas in this section are part of ASPIRA's intended scope. A page existing visually does not mean its feature is complete; functionality must be connected to validated server operations and persistent data where applicable.

## 4.1 Authentication and onboarding

Support:

- Login and logout.
- Public registration for ordinary users.
- Forgot-password and password-reset workflows, if supported by the selected auth provider.
- Secure session persistence and expiration.
- User profile initialization.
- New-user onboarding.
- Protected routes and server-side authorization.
- Appropriate guest/public access for public pages.

Public registration must only create accounts with the `USER` role. Never accept a privileged role from a public registration form or trust a role supplied by the browser.

Authentication and user-facing messages must support Indonesian and English.

## 4.2 Main dashboard — Beranda

The dashboard is the main authenticated entry point. It may include:

- Welcome section and user information.
- City overview and City Pulse summary.
- Recent public reports.
- Recent community posts.
- Important local announcements.
- Quick report action.
- Navigation to major application features.

Use real PostgreSQL-backed data when available. Clearly label seeded or sample data. Do not present decorative placeholder statistics as live city information.

## 4.3 Public infrastructure reporting

Citizens must be able to report infrastructure and public issues, including:

- Road damage and potholes.
- Damaged sidewalks.
- Broken streetlights.
- Public facility damage.
- Waste accumulation.
- Drainage problems and flooding.
- Other public environmental or infrastructure concerns.
- Social disturbances where the product scope supports them.

A report may contain:

- Title and description.
- Category and problem type.
- Photo evidence and attachment metadata.
- GPS coordinates and address information.
- Manually selected location.
- Anonymous-public-display preference.
- Submission timestamp and generated ticket number.
- Current status and status history.

Use browser APIs instead of native mobile APIs. For geolocation, use `navigator.geolocation` with permission/error handling. Provide manual location selection if GPS is unavailable or permission is denied. Do not require location permission to use unrelated parts of the application.

For image selection, use an appropriate HTML file input and validate files on the server. Do not trust file extensions or client-side validation alone.

## 4.4 Report lifecycle and transparency

Use the following defined report statuses:

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

- `DITOLAK`: rejected with a documented reason.
- `DIBUKA_KEMBALI`: reopened because the issue persists or recurs.

Every official status transition must create a historical record containing, as appropriate:

- Previous status.
- New status.
- Timestamp.
- Actor/user ID.
- Administrative notes or reason.
- Supporting evidence references.

Treat audit history as append-only at the application level. Do not silently overwrite or delete previous transitions. Perform status changes and history insertion atomically in a database transaction. Community votes and reputation points must never directly change official administrative report status.

## 4.5 Community feed and discussions

The community feed is a core feature; do not replace it with a simple recent-reports list.

Support:

- Publishing and viewing community posts.
- Local community updates.
- Report-related discussions.
- Local news and announcements.
- UMKM promotions.
- Post details.
- Comments and replies.
- Upvote and downvote interactions.
- Author information and timestamps.
- Relevant content categories.

Clearly distinguish:

1. Official or administrative announcements.
2. Citizen-submitted infrastructure reports.
3. Community discussions.
4. Local news or information.
5. UMKM promotions.

Do not represent citizen-generated content as an official government statement.

### Voting

- Prevent duplicate votes by the same account on the same target.
- Allow vote changes if supported by the implemented interaction design.
- Persist votes in PostgreSQL and calculate counts from trusted data.
- Validate all vote operations on the server.
- Never trust client-submitted vote totals.
- Do not treat popularity as proof of authenticity or verification.

Voting is community feedback, not an administrative verification mechanism.

---

# 5. Gamification and Reputation

Gamification encourages responsible participation and recognizes meaningful community contributions. Do not remove it.

## 5.1 Contribution points

Potential eligible activities include:

- Submitting valid reports.
- Participating constructively in community discussions.
- Providing useful field confirmations.
- Helping other citizens.
- Other explicitly approved contribution activities.

Do not invent point rewards or thresholds and present them as established policy. Treat unconfirmed values as configuration requiring project-owner approval.

Implement points through a server-authoritative, append-only point transaction ledger. Do not allow clients to submit arbitrary point totals. Make reward processing idempotent so retries or duplicate requests cannot award the same contribution repeatedly. Add anti-abuse validation for spam, duplicate reports, and other easily manipulated activities.

## 5.2 Reputation levels

Support these tiers:

| Level | Description |
|---|---|
| Bronze | Initial contribution level |
| Silver | Developing community participation |
| Gold | Established community contribution |
| Diamond | High contribution level |

The exact point thresholds must remain configurable until confirmed. Do not hardcode guessed thresholds throughout UI components or business logic.

## 5.3 Achievement badges and rankings

Support the badge concepts:

- Reporter.
- Helper.
- Top 10.

Additional badges may be introduced only with documented criteria. Badge eligibility and assignment must be evaluated by trusted server-side logic. Do not allow clients to assign achievements.

If a leaderboard is implemented:

- Use persisted contribution data.
- Define ranking criteria and period clearly.
- Handle tied scores consistently.
- Avoid exposing private account information.
- Apply anti-abuse rules.

---

# 6. City Pulse — Public Monitoring

City Pulse provides an accessible overview of public reporting and issue resolution.

Expected metrics and views:

- Total reports.
- Reports by status.
- Resolved reports.
- Pending reports.
- Active incidents.
- Resolution percentage.
- Historical report trends.
- Distribution by category.
- Geographic distribution.
- Community activity where relevant.

Calculate statistics from PostgreSQL-backed records using consistent definitions. Do not fabricate official response-time measurements. If response-time data is available, distinguish report submission, verification, assignment, and resolution timestamps. Label sample or seeded data clearly.

Charts must have clear labels, appropriate empty/loading/error states, and responsive layouts.

---

# 7. Interactive Mapping

Use:

- Leaflet.
- react-leaflet.
- OpenStreetMap.

Default map center:

```ts
const DEFAULT_MAP_CENTER: [number, number] = [-6.5971, 106.8060];
```

Default geographic scope: Kota Bogor, Indonesia.

Expected functionality:

- Display report locations.
- Interactive markers and report-detail popups.
- Geographic, category, and status filtering.
- Severity filtering where supported by the data model.
- Navigation to individual report details.

Leaflet requires browser APIs. Load map components client-side with SSR disabled using the supported Next.js dynamic-import pattern. Do not access `window` or `document` during server rendering. Import Leaflet CSS correctly and provide a useful loading state.

---

# 8. ASPIRA AI Assistant

The AI assistant supports civic participation and platform use. Expected capabilities:

- Explain public reporting procedures and infrastructure categories.
- Explain report statuses and platform features.
- Help citizens understand civic participation.
- Provide general information about relevant public regulations.
- Assist with community-related questions.
- Suggest report classification or triage for human review.

AI integration must run through server-side Next.js Route Handlers or another trusted server-only layer. Keep provider clients and prompts in server-only modules, for example:

```text
src/
├── app/api/ai/chat/route.ts
├── app/api/ai/triage/route.ts
└── lib/ai/
    ├── openrouter.ts
    ├── gemini.ts
    └── prompts.ts
```

Use server-only environment variables such as `OPENROUTER_API_KEY` and `GEMINI_API_KEY`. Never expose provider secrets through `NEXT_PUBLIC_` variables or browser bundles.

The assistant must not:

- Fabricate official government announcements.
- Claim to have contacted an agency or changed a report unless the system actually did so.
- Invent report statuses or claim an issue has been repaired without supporting records.
- Present generated regulatory interpretations as definitive legal advice.
- Reveal private user information.
- Perform unauthorized administrative operations.

AI-generated classification, severity, or recommendations remain suggestions subject to human review.

---

# 9. Authorization, Roles, and Privacy

Use server-side role-based access control (RBAC). Every privileged operation must verify the authenticated user and their current role/permissions on the server. Hiding a button or route in the UI is not authorization.

## 9.1 Roles

ASPIRA has three primary application roles and an administrative provisioning role:

- `USER`
- `LOCAL_GOVERNMENT`
- `INSPECTOR`
- `ADMIN`

`ADMIN` is the trusted administrative authority for provisioning and role management. It must not be publicly self-selectable.

## 9.2 Public registration

Public registration is exclusively for `USER` accounts.

- Every account created through the public registration flow must receive `USER` from trusted server-side logic.
- Do not show `LOCAL_GOVERNMENT`, `INSPECTOR`, or `ADMIN` as public registration options.
- Ignore or reject any privileged role value submitted by the client.
- Never grant privileged permissions by default.

## 9.3 Special account provisioning

`LOCAL_GOVERNMENT` and `INSPECTOR` accounts must be created or invited through a restricted process controlled by an authorized `ADMIN`.

- Require an authorized invitation, approval, or administrative provisioning action.
- Validate and persist role assignment on the server.
- Record role creation and changes in an administrative audit log.
- Prevent users from elevating their own privileges by changing client state or sending modified requests.
- Suspended or revoked accounts must lose access to restricted operations.

Only `ADMIN` may provision privileged accounts or assign roles unless a separately documented permission explicitly delegates that capability.

## 9.4 Role permissions

### `USER`

- Create and submit public reports.
- Upload report photographs and location information.
- Track reports.
- Participate in community discussions.
- Create community posts and comments.
- Vote on eligible content.
- Earn contribution points, levels, and badges.
- Use the AI assistant.
- View public City Pulse statistics.

### `LOCAL_GOVERNMENT`

- Access reports assigned to its institution or authorized administrative scope.
- Review relevant report information.
- Update report handling progress within permitted workflow transitions.
- Record official responses and administrative notes.
- Upload supporting handling or resolution evidence.
- View reports and statistics within its authorized scope.

### `INSPECTOR`

- Access reports assigned for inspection or verification.
- Review submitted photographs and report details.
- Record inspection findings.
- Upload field inspection evidence.
- Confirm whether reported conditions match field observations.
- Submit inspection results for the appropriate administrative workflow.

### `ADMIN`

- Provision and manage accounts and roles.
- Manage authorized administrative scopes and assignments.
- Access administrative controls required to operate the platform.
- Review administrative audit records.

Grant only the permissions required for each task. Do not assume that every `ADMIN` action should be available to `LOCAL_GOVERNMENT` or `INSPECTOR`.

## 9.5 Authorization rules

- `USER` cannot perform official administrative status transitions.
- `USER` cannot access restricted government or inspection dashboards.
- `LOCAL_GOVERNMENT` cannot modify reports outside its authorized scope.
- `INSPECTOR` cannot perform government administrative actions unless separately authorized.
- `LOCAL_GOVERNMENT` and `INSPECTOR` cannot provision accounts or assign roles by default.
- All privileged operations must be checked on the server against trusted identity/session data and PostgreSQL-backed role/permission records.
- Administrative and inspection actions must preserve an audit trail.
- Centralize role and permission definitions; do not scatter inconsistent checks throughout UI components.

## 9.6 Anonymous reporting and privacy

If anonymous reporting is enabled, it means the submitter's identity is hidden from public display; it does not necessarily mean the platform has no internal record of the submitter.

Anonymous reports must not publicly expose the submitter's name, email, private account identifier, or private profile information. Restrict internal identity information to authorized server-side operations.

Separate public profile fields from private account and authentication data. Never return private fields unnecessarily in API responses.

---

# 10. Internationalization and Theme

## 10.1 Language support

Support:

- Bahasa Indonesia (`id`).
- English (`en`).

Provide a language selector and centralized translation resources. All user-facing text should use the selected language, including navigation, page titles, forms, buttons, notifications, errors, status labels, dialogs, empty states, community UI, and AI assistant UI.

Suggested location:

```text
src/constants/i18n/
├── id.ts
└── en.ts
```

Do not scatter hardcoded interface text across components.

## 10.2 Theme support

Support light and dark modes with centralized theme tokens, consistent colors, persistent non-sensitive user preference, and adequate contrast. Use CSS variables and the existing Tailwind CSS 4 configuration approach. Do not create unrelated per-page color systems.

---

# 11. Data Model and TypeScript

PostgreSQL is the source of truth for persistent application data. Define the schema based on ASPIRA's domain requirements, not on assumed legacy Firestore collection names or document structures.

The following are conceptual TypeScript examples, not a complete schema. Adapt field names and normalization as the implementation evolves.

```ts
export type UserRole = "USER" | "LOCAL_GOVERNMENT" | "INSPECTOR" | "ADMIN";
export type ThemePreference = "light" | "dark";
export type LanguagePreference = "id" | "en";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  preferredLanguage: LanguagePreference;
  theme: ThemePreference;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  type: "DISCUSSION" | "NEWS" | "UMKM" | "REPORT";
  title: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface ReportItem {
  id: string;
  ticketNumber: string;
  authorId: string | null;
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

Data-model requirements:

- Use stable primary keys and explicit foreign-key relationships.
- Enforce unique constraints for values such as ticket numbers and one-vote-per-user-per-target rules.
- Add indexes for common filtering, sorting, and relationship queries.
- Store timestamps consistently; use timezone-aware database timestamps where appropriate.
- Validate all external input before persistence.
- Use transactions for multi-record operations that must remain consistent.
- Handle loading, empty, validation, permission, network, and database errors.
- Implement pagination for potentially large feeds and report lists.
- Avoid trusting client-provided derived values such as vote counts, points, role, or report status.

Do not assume that every field in the conceptual interfaces must be stored in a single table. Normalize relational data where appropriate.

---

# 12. Media and File Handling

The database stores media metadata and object references only. The actual file contents belong in the configured object storage provider.

Requirements:

- Image previews before upload.
- Server-side file type and size validation.
- Unique object keys generated by trusted code.
- Upload progress where practical.
- Access control for private attachments.
- Signed URL or authenticated delivery where appropriate.
- Error handling and cleanup for failed or abandoned uploads.
- Image optimization where practical.

Never trust a client-provided file extension or MIME type without server-side validation. Do not expose private user attachments publicly.

---

# 13. Responsive Design and Accessibility

Support viewport widths from 360px to 1440px and beyond where practical. The desktop experience must not simply stretch a mobile layout.

### Mobile

- Compact navigation.
- Touch-friendly controls.
- Appropriate content spacing.
- Responsive cards and forms.
- Mobile-friendly dialogs.
- No unintended horizontal overflow.

### Tablet

- Flexible navigation.
- Appropriate multi-column layouts.
- Responsive content containers.
- Properly scaled map and dashboard sections.

### Desktop

- Persistent sidebar or suitable desktop navigation.
- Main content area with appropriate information density.
- Multi-column layouts where useful.
- Consistent spacing and typography.

Accessibility requirements:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible form labels and validation messages.
- Appropriate ARIA attributes.
- Descriptive image alternative text.
- Sufficient color contrast.
- Status indicators that do not depend exclusively on color.

---

# 14. Visual Design Direction

ASPIRA should feel like a modern civic-tech application: professional, trustworthy, community-oriented, data-driven, and clear.

Use Tailwind CSS and Lucide React. Maintain consistent spacing, typography, component states, and iconography.

Avoid excessive gradients, excessive animation, unnecessary decorative cards, inconsistent component styles, emoji replacing functional icons, dense mobile layouts, and visual changes that obscure established user workflows.

---

# 15. Environment Variables and Secrets

Use `.env.local` for local development and keep it out of version control. Maintain `.env.example` with variable names and safe placeholders only.

A possible environment template is:

```dotenv
# PostgreSQL — local Docker Compose database
DATABASE_URL="postgresql://aspira:local_dev_password@localhost:5432/aspira_dev"

# Authentication — exact variables depend on the selected auth library
# AUTH_SECRET="replace_with_a_secure_random_secret"
# AUTH_URL="http://localhost:3000"

# AI providers — server-side only
OPENROUTER_API_KEY="your_openrouter_api_key"
GEMINI_API_KEY="your_gemini_api_key"

# Object storage — exact variables depend on the selected provider
# S3_ENDPOINT=""
# S3_REGION=""
# S3_BUCKET=""
# S3_ACCESS_KEY_ID=""
# S3_SECRET_ACCESS_KEY=""

# Public application configuration
NEXT_PUBLIC_DEFAULT_CITY="Kota Bogor"
NEXT_PUBLIC_DEFAULT_LAT="-6.5971"
NEXT_PUBLIC_DEFAULT_LNG="106.8060"
```

Rules:

1. Never commit `.env.local`, database passwords, auth secrets, AI keys, or storage credentials.
2. Never expose private keys through `NEXT_PUBLIC_` variables.
3. `DATABASE_URL` is server-only and must not be imported into client code.
4. Keep `.env.example` synchronized with the variables actually used by the application.
5. Validate required environment variables at server startup or service initialization.
6. Do not add placeholder variables for services that have not been selected or implemented unless clearly commented as optional.
7. Use separate credentials and databases for local development, staging, and production.

---

# 16. Development Commands and Workflow

Inspect `package.json` before running commands. Typical Next.js commands may include:

```bash
npm run dev
npm run build
npm run lint
npm run start
```

Only run scripts that actually exist. Add or update scripts deliberately and document them in the README.

When PostgreSQL and Prisma are configured, the usual local workflow is:

```bash
# Start the local database
docker compose up -d

# Install dependencies
npm install

# Apply committed development migrations
npx prisma migrate dev

# Start the Next.js application
npm run dev
```

Use the actual migration and generation commands appropriate to the installed Prisma version and project configuration. Do not copy commands from outdated Prisma tutorials without checking the installed major version and its configuration requirements.

For a fresh database, use the repository's documented migration and seed workflow. Do not manually create tables or assume the database contains data.

---

# 17. Migration and Implementation Guidelines

This is a standalone web implementation guided by the ASPIRA product requirements. It is not a live migration from a connected Expo/Firebase repository.

## 17.1 Web-native implementation

Use appropriate web equivalents for mobile concepts:

| Mobile concept | Web implementation |
|---|---|
| View | `div`, `section`, `main`, or another semantic element |
| Text | `p`, `span`, headings, and labels |
| Pressable / TouchableOpacity | `button` or `a` |
| TextInput | `input` / `textarea` |
| ScrollView | Native document scrolling or an intentional overflow container |
| FlatList | Paginated or virtualized web list where appropriate |
| Image | `next/image` or suitable HTML image element |
| Modal | Accessible dialog |
| ActivityIndicator | Loading component |
| StyleSheet | Tailwind CSS |
| Expo Router | Next.js App Router |
| AsyncStorage | Browser storage for non-sensitive preferences only |
| Expo Location | Browser Geolocation API |
| Expo Image Picker | HTML file input |
| Expo Camera | Browser camera/file input APIs where supported |

Do not mechanically translate components one-to-one. Choose semantic web elements and accessible interaction patterns.

## 17.2 Backend and data implementation

- PostgreSQL is the persistent application database.
- Use the selected ORM/data-access layer consistently.
- Keep database operations in server-only modules.
- Validate authorization and input on the server.
- Use transactions for operations that update related records.
- Keep schema changes in committed migrations.
- Use seed scripts for reproducible development/demo data.
- Never introduce Firebase dependencies or Firebase-specific data access.

Do not claim to have migrated legacy user or report data. A real data migration requires an explicitly supplied export, mapping, and migration plan.

## 17.3 Feature completion

A feature is not complete merely because its page or mockup exists. Completion means the intended workflow works, permissions are enforced, data persists where required, error/loading/empty states are handled, and relevant tests or manual validation have been performed.

---

# 18. Coding Agent Workflow

All coding agents must follow this workflow.

## Step 1 — Inspect this repository

Before changing code:

- Inspect the relevant files in the current repository.
- Review `package.json` and the installed dependency versions.
- Review existing components, hooks, stores, services, types, and routes.
- Review the current database schema and migrations if present.
- Review environment variable usage without exposing secret values.
- Understand the affected user workflow and role permissions.

Do not inspect or depend on an external/original Expo project. Do not assume an unavailable Firebase project or schema exists.

## Step 2 — Plan the change

Identify:

- Routes and components affected.
- Services and database models affected.
- Required schema changes and migrations.
- Authentication and authorization requirements.
- Translations and theme behavior.
- Validation, error, loading, and empty states.
- Tests and checks needed.

For ambiguous product rules, document assumptions and ask for clarification when the ambiguity affects security, permissions, official workflow, or persisted data.

## Step 3 — Implement

- Use TypeScript and the existing project conventions.
- Prefer Server Components unless client interactivity is required.
- Use semantic HTML and Tailwind CSS.
- Keep database and secret-bearing code server-only.
- Validate user input and authorization on the server.
- Use PostgreSQL for persistent application data.
- Preserve all ASPIRA product areas in this specification.
- Keep AI provider keys server-side.
- Maintain responsive and accessible behavior.
- Avoid unrelated rewrites.

## Step 4 — Validate

Run relevant checks that exist in the repository, such as:

```bash
npm run lint
npm run build
```

Also validate relevant database migrations, API/service behavior, and tests. Verify as appropriate:

- Registration and login.
- Public registration always creates `USER`.
- Privileged account provisioning and role checks.
- Report submission and status history.
- Report assignment and inspection permissions.
- Community posts, comments, and votes.
- Point ledger and badge assignment.
- City Pulse calculations.
- Media upload permissions.
- AI route behavior and secret handling.
- Theme and language switching.
- Responsive layouts and map hydration.

Do not claim that a command, test, migration, or feature passed unless it was actually executed and verified. If a check cannot be run, state why.

## Step 5 — Report the result

After completing a task, summarize:

1. What was implemented.
2. Which files were changed.
3. Any database schema or migration changes.
4. Dependencies added, removed, or upgraded.
5. Validation actually performed and its result.
6. Known limitations, assumptions, or incomplete integrations.

---

# 19. Competition Acceptance Criteria

## Platform

- [ ] Next.js App Router is used.
- [ ] React Native UI primitives and unnecessary Expo dependencies are absent.
- [ ] Semantic HTML and Tailwind CSS are used.
- [ ] Responsive layouts work across mobile, tablet, and desktop.
- [ ] PWA installation works if PWA support is configured.

## Database and backend

- [ ] PostgreSQL is the primary persistent application database.
- [ ] Local PostgreSQL starts through Docker Compose.
- [ ] Database schema changes are reproducible through committed migrations.
- [ ] Environment variables and credentials are not committed.
- [ ] Database access is server-only.
- [ ] Relevant constraints, indexes, and transactions are implemented.
- [ ] Seed data is clearly distinguished from real data.
- [ ] No Firebase/Firestore integration remains.

## Authentication and authorization

- [ ] Login and logout work through the selected authentication solution.
- [ ] Registration works and always assigns `USER` server-side.
- [ ] Password recovery works if supported by the selected provider.
- [ ] Sessions are handled securely.
- [ ] Protected routes and privileged operations are enforced server-side.
- [ ] `LOCAL_GOVERNMENT` and `INSPECTOR` accounts require authorized provisioning.
- [ ] `ADMIN` role assignment and administrative actions are protected and audited.

## Reporting

- [ ] Citizens can submit infrastructure reports.
- [ ] Photo uploads use the configured object storage.
- [ ] GPS works where permission is granted.
- [ ] Manual location selection is available.
- [ ] Report tracking and ticket numbers work.
- [ ] Status transitions create immutable historical audit records.
- [ ] Role and scope restrictions are enforced.

## Community

- [ ] Community feed works.
- [ ] Post creation and details work.
- [ ] Comments and replies work where implemented.
- [ ] Voting is persisted and duplicate voting is prevented.
- [ ] Local information and UMKM content are supported.

## Gamification

- [ ] Contribution points are awarded by trusted server-side logic.
- [ ] Point transactions are idempotent and auditable.
- [ ] Bronze, Silver, Gold, and Diamond levels are supported.
- [ ] Achievement badges are supported.
- [ ] Top 10 ranking is supported where implemented.
- [ ] Clients cannot arbitrarily manipulate points, levels, or badges.

## City Pulse and maps

- [ ] Statistics use persisted backend data.
- [ ] Report status distributions and resolution metrics are accurate.
- [ ] Historical trends are shown only when supporting data exists.
- [ ] Map displays report locations and supports relevant filters.
- [ ] Leaflet is loaded client-side without SSR hydration errors.

## AI

- [ ] AI assistant uses server-side integration.
- [ ] API credentials are not exposed to browsers.
- [ ] AI requests handle provider errors and appropriate rate limits.
- [ ] AI does not fabricate official information or perform unauthorized actions.

## Localization, theme, and accessibility

- [ ] Indonesian language works.
- [ ] English language works.
- [ ] Language preference persists.
- [ ] Light mode and dark mode work.
- [ ] Theme preference persists.
- [ ] Keyboard navigation, focus indicators, labels, and contrast are appropriate.

## Technical validation

- [ ] Production build succeeds.
- [ ] Lint checks pass.
- [ ] Relevant database migrations apply successfully.
- [ ] No Firebase integration remains.
- [ ] No unnecessary Expo dependencies remain.
- [ ] No private credentials are exposed in client bundles.

---

# 20. Final Project Directive

ASPIRA is a collaborative civic-tech platform combining public infrastructure reporting, community participation, gamification, AI assistance, and city transparency.

Build it as a standalone, web-native application using Next.js and PostgreSQL. Use Docker Compose to provide the local PostgreSQL development database. Keep authentication, media storage, and AI integrations as separate concerns with secure server-side boundaries.

**Do not confuse a technology change with product simplification.** Preserve the reporting system, community features, gamification, AI assistant, bilingual interface, and role-based workflows.

The objective is a complete, responsive, maintainable ASPIRA web platform with a reliable PostgreSQL-backed foundation.
