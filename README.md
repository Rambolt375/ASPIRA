# CIVICA

**Platform Kolaboratif Pelaporan Publik, Komunitas Warga, dan Transparansi Kota Berbasis AI & Gamifikasi**

CIVICA is a civic-technology web platform that connects citizens, local communities, and public institutions through collaborative infrastructure reporting, community participation, AI-powered assistance, and transparent public monitoring. It is built as a web-native (Next.js) migration of an existing React Native application, developed for the **MIA 2026** competition with Kota Bogor, Indonesia as its pilot city.

---

## About the Project

Public infrastructure issues — damaged roads, broken streetlights, flooded drainage, and more — often go unreported or unresolved due to a lack of accessible and accountable reporting channels. Citizens have no clear visibility into whether their reports are being acted upon, and local governments lack a structured, transparent workflow for handling community submissions.

CIVICA addresses this gap by providing a unified platform where citizens can submit geo-tagged reports with photographic evidence, track each report through an eight-stage administrative lifecycle, and engage with their community — all while earning recognition for meaningful civic contributions.

---

## Problem Statement

- Citizens lack a structured, accessible channel to report public infrastructure damage.
- Existing reporting processes offer little to no transparency into resolution progress.
- Local government agencies have no unified, audit-ready system for managing and responding to community reports.
- Community participation in civic matters is low due to a lack of engagement mechanisms.

---

## Project Objectives

1. Provide citizens with a simple, accessible tool to submit infrastructure reports with photos and GPS location.
2. Offer complete transparency through an append-only, eight-stage report lifecycle that cannot be silently modified.
3. Enable community validation of reports through confirmations, discussions, and voting.
4. Assist citizens with an AI-powered assistant for guidance on reporting and civic procedures.
5. Visualize the state of the city through interactive maps and City Pulse statistics.
6. Incentivize responsible participation through contribution points, reputation levels, and achievement badges.

---

## Main Features

### 1. Public Infrastructure Reporting

Citizens can submit reports for infrastructure issues including road damage, broken streetlights, drainage problems, flooding, waste accumulation, and more.

Each report includes:

- Title and description
- Report category (Road, Bridge, Drainage, Street Light, Park, Waste, Flooding, Other)
- Severity level (Low, Medium, High, Critical)
- Photographic evidence (uploaded via browser file input or camera capture)
- GPS coordinates (via browser Geolocation API) with manual map picker fallback
- Address information

### 2. Eight-Stage Report Lifecycle

Every report follows a transparent, append-only administrative workflow. Status transitions are never silently overwritten — each change is recorded with a timestamp, actor identity, and optional note.

```
DITERIMA → VERIFIKASI → DICEK → DITUGASKAN → DALAM_PENANGANAN → DIATASI → PENINJAUAN → PERAWATAN
```

Alternative states:

- `DITOLAK` — Rejected; a documented reason is mandatory.
- `DIBUKA_KEMBALI` — Reopened if the reported issue persists after resolution.

### 3. Community Platform

A community feed supporting multiple content types:

- Citizen discussions
- Local news and announcements
- UMKM (local small business) promotions
- Report-related posts

Citizens can create posts, leave comments, reply to comments, and upvote or downvote content. The feed clearly distinguishes between citizen-generated content and official announcements.

### 4. City Pulse

A public monitoring dashboard providing:

- Total reports and resolution statistics
- Report distribution by status and category
- Resolution rate over time
- Geographic distribution of active incidents

### 5. AI Assistant

A conversational assistant powered by Google Gemini, available through a server-side API route. The assistant can:

- Explain reporting procedures and infrastructure categories
- Clarify report statuses and next steps
- Provide general civic guidance and information about public regulations

AI requests are proxied through a Next.js Route Handler (`/api/gemini`). The `GEMINI_API_KEY` is never exposed to the browser.

### 6. Interactive Map

Geographic visualization of public reports using Leaflet and OpenStreetMap, centered on Kota Bogor (`-6.5971, 106.8060`). The map component is loaded with SSR disabled to comply with Leaflet's browser API requirements.

### 7. Gamification

Citizens earn contribution points and advance through reputation levels:

| Level | Description |
|---|---|
| Bronze | Initial level |
| Silver | Growing community participation |
| Gold | Established contributor |
| Diamond | High-impact contributor |

Achievement badges (e.g., Reporter, Helper, Top 10) recognize specific milestones.

### 8. Localization and Theme

- **Languages:** Bahasa Indonesia and English (user-selectable, persisted via `localStorage`)
- **Themes:** Light Mode and Dark Mode (user-selectable, persisted via `localStorage`)

---

## User Roles

CIVICA implements a role-based access control (RBAC) system with three roles:

| Role | Description |
|---|---|
| `USER` | Regular citizen account. Created through the public registration page. |
| `LOCAL_GOVERNMENT` | Government personnel. Accounts are provisioned through an Admin-controlled process — not available via public registration. |
| `INSPECTOR` | Authorized field inspector. Accounts are provisioned through an Admin-controlled process — not available via public registration. |

**Registration policy:**

- Public registration (`/register`) exclusively assigns the `USER` role.
- Users cannot select or request `LOCAL_GOVERNMENT` or `INSPECTOR` during registration.
- Privileged accounts are created or approved by an authorized Admin through a separate process.
- Role assignment is enforced on the backend. Client-submitted role values are never trusted.
- Hiding UI elements is not considered sufficient authorization — all privileged operations are validated server-side and through Firebase Security Rules.

---

## Technology Stack

### Implemented

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.4.3 | Framework — App Router, Server Components, Route Handlers |
| [React](https://react.dev/) | 19.3.0 | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Styling |
| [Zustand](https://github.com/pmndrs/zustand) | ^5.0.16 | Global state (auth, theme, language) |
| [Firebase](https://firebase.google.com/) | ^13.1.0 | Authentication (Firebase Auth) + Database (Cloud Firestore) |
| [Leaflet](https://leafletjs.com/) | ^1.9.4 | Interactive maps (client-side only, SSR disabled) |
| [react-leaflet](https://react-leaflet.js.org/) | ^5.0.0 | React bindings for Leaflet |
| [Lucide React](https://lucide.dev/) | ^1.66.0 | Icon library |
| [@google/generative-ai](https://ai.google.dev/) | ^0.24.1 | Google Gemini SDK for the AI assistant |

### Configured — Integration Pending

| Technology | Status | Notes |
|---|---|---|
| Firebase Cloud Storage | Configured | `storage.ts` and `/api/upload` route exist; wired to an external CDN proxy, not yet connected to the report submission form |
| External Storage CDN | Configured | `NEXT_PUBLIC_STORAGE_API_URL` is set; upload logic is complete but not yet integrated into the report form UI |

### Planned

| Technology | Purpose |
|---|---|
| PWA Manifest + Service Worker | Offline support and installability |

---

## Current Development Progress

> **Status as of First Draft Submission — MIA 2026**

### Pages

| Route | Status | Notes |
|---|---|---|
| `/` | **Implemented** | Public landing page with hero, features, 8-stage pipeline overview, categories, and CTAs |
| `/login` | **Implemented** | Firebase email/password authentication; error handling; show/hide password |
| `/register` | **Implemented** | Firebase registration + Firestore user profile creation; password strength indicator |
| `/forgot-password` | **Implemented** | Firebase password reset email; two-step UX (form → confirmation) |
| `/beranda` | **Implemented** | Authenticated dashboard with live Firestore stats (City Pulse cards, recent reports, category breakdown, resolution ring), quick actions, community teaser |
| `/laporan` | **Stub** | Page shell exists; report list not yet connected to Firestore |
| `/laporan/[id]` | **Partial** | Fetches report from Firestore; renders title, description, current status, and full status history timeline; community confirmation count displayed |
| `/laporan/buat` | **Stub** | Page shell exists; `ReportForm` component not yet wired |
| `/komunitas` | **Planned** | Not yet implemented |
| `/komunitas/[postId]` | **Planned** | Not yet implemented |
| `/lapor` | **Planned** | Full multi-step report form (planned successor to `/laporan/buat`) |
| `/peta` | **Planned** | Interactive map page not yet implemented |
| `/pantau` | **Planned** | Full City Pulse analytics page not yet implemented |
| `/asisten` | **Planned** | AI chat interface not yet implemented |
| `/profil` | **Planned** | User profile page not yet implemented |
| `/onboarding` | **Planned** | First-login onboarding flow not yet implemented |

### Core Infrastructure

| Component | Status | Notes |
|---|---|---|
| Firebase Auth integration | **Implemented** | `onAuthStateChanged` listener active via `AuthProvider`; state synced to Zustand |
| Firestore report service | **Implemented** | `createReport`, `getReport`, `getReports`, `getReportsByUser`, `advanceStatus`, `addCommunityConfirmation` |
| Firestore user profile service | **Implemented** | `registerUser`, `loginUser`, `logoutUser`, `resetPassword`, `getUserProfile` |
| Image upload service | **Implemented** | `uploadFile` and `compressImage` in `storage.ts`; proxied through `/api/upload` |
| AI API route | **Implemented** | `/api/gemini` — server-side Gemini proxy (text and multimodal); key never exposed to client |
| `ReportCard` component | **Implemented** | Displays category, status badge, title, description, address, date, community confirmations |
| `StatusTimeline` component | **Implemented** | Visual eight-stage lifecycle timeline with completion state |
| `ReportMap` component | **Implemented** | Client-side Leaflet map with click-to-select location; used for report location picking |
| App shell (sidebar + mobile nav) | **Implemented** | Desktop sidebar with full navigation; mobile drawer + bottom navigation bar |
| Zustand stores | **Implemented** | `authStore`, `themeStore`, `languageStore` — all persisted to `localStorage` |
| Translation constants | **Implemented** | `id` (Indonesian) and `en` (English) string objects; accessible via `useTranslation()` hook |
| Theme store | **Implemented** | Store and preference persistence in place; dark mode DOM wiring not yet complete |

### Not Yet Implemented

- Community feed (posts, comments, voting)
- Full multi-step report submission form
- City Pulse full analytics page
- Interactive map page (all reports)
- AI assistant chat UI
- User profile page
- Gamification (point awards, level calculation, badge assignment)
- Leaderboard
- Dark mode DOM wiring
- Language switcher UI
- Onboarding flow
- Firebase Security Rules
- PWA manifest and service worker

---

## Project Structure

```
civica-web/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Register, Forgot Password
│   │   │   ├── layout.tsx        # Centered auth layout (no Navbar/Footer)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (main)/               # Authenticated app routes
│   │   │   ├── layout.tsx        # Sidebar + mobile nav shell
│   │   │   └── beranda/          # Main dashboard
│   │   ├── (public)/             # Public marketing routes
│   │   │   ├── layout.tsx        # Navbar + Footer
│   │   │   └── page.tsx          # Landing page (/)
│   │   ├── api/
│   │   │   ├── gemini/           # Server-side Gemini AI proxy
│   │   │   └── upload/           # Server-side file upload proxy
│   │   └── laporan/              # Report list and detail pages
│   │
│   ├── components/
│   │   ├── auth/                 # AuthProvider
│   │   ├── icons/                # Inline SVG icon components
│   │   ├── laporan/              # ReportCard, StatusTimeline
│   │   ├── layout/               # Navbar, Footer, AppShell
│   │   ├── map/                  # ReportMap (Leaflet, client-only)
│   │   └── ui/                   # Button, Input, Textarea, Badge, Card
│   │
│   ├── constants/
│   │   ├── categories.ts         # Report categories, statuses, severity levels
│   │   ├── theme.ts              # Tailwind palette constants
│   │   └── translations.ts       # Indonesian and English UI strings
│   │
│   ├── hooks/
│   │   ├── useAuthListener.ts    # Firebase → Zustand auth sync
│   │   ├── useGeolocation.ts     # Browser Geolocation API wrapper
│   │   └── useTranslation.ts     # Language-aware translation hook
│   │
│   ├── lib/
│   │   └── firebase.ts           # Lazy Firebase singleton initialization
│   │
│   ├── services/
│   │   ├── auth.ts               # Firebase Auth + Firestore user operations
│   │   ├── reports.ts            # Firestore report CRUD + status transitions
│   │   └── storage.ts            # External CDN upload + image compression
│   │
│   ├── stores/
│   │   ├── authStore.ts          # User auth state (Zustand, persisted)
│   │   ├── themeStore.ts         # Theme preference (Zustand, persisted)
│   │   └── languageStore.ts      # Language preference (Zustand, persisted)
│   │
│   └── types/
│       └── index.ts              # Shared TypeScript types and interfaces
│
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js + Turbopack configuration
├── package.json
├── tsconfig.json
└── TODO.md                       # Development progress tracker
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- A Firebase project with **Authentication** and **Cloud Firestore** enabled
- A Google Gemini API key (for AI assistant functionality)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd civica-web

# 2. Install dependencies
npm install
```

### Environment Configuration

Copy the environment variable template and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the required values (see [Environment Variables](#environment-variables) below).

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Additional Scripts

```bash
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint
```

---

## Environment Variables

All variables must be defined in `.env.local` for local development. Do not commit this file.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain (e.g., `project.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase Storage bucket (e.g., `project.firebasestorage.app`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase App ID |
| `NEXT_PUBLIC_STORAGE_API_URL` | Yes | Base URL of the external file storage API |
| `NEXT_PUBLIC_STORAGE_API_KEY` | Yes | API key for the external file storage service |
| `GEMINI_API_KEY` | Yes | Google Gemini API key — **server-side only, never use `NEXT_PUBLIC_` prefix** |

Use `.env.example` as the reference template. It contains all required variable names without values.

---

## Development Notes

### Firebase Initialization

Firebase is initialized lazily using singleton functions (`getFirebaseAuth()`, `getFirebaseDb()`) in `src/lib/firebase.ts`. This avoids errors during Next.js build-time page collection when environment variables are absent.

### Leaflet and SSR

Leaflet requires browser APIs and cannot run during server-side rendering. The `ReportMap` component (`src/components/map/ReportMap.tsx`) handles this by dynamically importing Leaflet inside a `useEffect` hook, ensuring it only runs in the browser. Pages using the map must import it with `{ ssr: false }` via `next/dynamic`.

### AI API Security

The Google Gemini API key is accessed exclusively through the server-side Route Handler at `/api/gemini`. It is declared as `GEMINI_API_KEY` (without `NEXT_PUBLIC_`) and is never included in the client JavaScript bundle.

### Report Status Lifecycle

Report status history is append-only at the application level. The `advanceStatus` function in `src/services/reports.ts` uses Firestore's `arrayUnion` to add history entries without overwriting previous ones. A status transition never silently replaces historical data.

### Role Enforcement

The `USER` role is hardcoded in `src/services/auth.ts` during account creation — it is not read from any client-submitted value. `LOCAL_GOVERNMENT` and `INSPECTOR` roles must be assigned through a separate admin provisioning process. Firebase Security Rules must be configured to enforce role-based access on the backend.

---

## Roadmap

The following features are planned for subsequent development phases:

- [ ] Community feed — posts, comments, replies, upvote/downvote interactions
- [ ] Full multi-step report submission form — with photo upload and GPS location
- [ ] Interactive map page — all reports visualized on Kota Bogor map
- [ ] City Pulse full analytics page — charts, trends, geographic distribution
- [ ] AI assistant chat interface — connected to `/api/gemini`
- [ ] User profile page — points, level, badges, report history
- [ ] Gamification — contribution point awards, level calculation, badge assignment
- [ ] Leaderboard — Top 10 contributors
- [ ] Onboarding flow — first-login setup for new users
- [ ] Dark mode — DOM wiring for `dark:` Tailwind classes
- [ ] Language switcher UI component
- [ ] Firebase Security Rules — enforce ownership, voting restrictions, role-based access
- [ ] PWA manifest and service worker — offline support and installability
- [ ] `LOCAL_GOVERNMENT` and `INSPECTOR` dashboards

See `TODO.md` for a detailed, up-to-date task list.

---

## Contributors

<!-- Add contributor names, roles, and contact information here before final submission. -->

| Name | Role |
|---|---|
| — | — |

---

## License

This project is developed for the MIA 2026 competition. Licensing terms will be defined prior to public release.
