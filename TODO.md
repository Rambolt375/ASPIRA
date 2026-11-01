# ASPIRA Web — TODO & Change Log

> Last updated: 2026-11-01  
> This file tracks what has been done and what still needs to be built.

---

## ✅ Completed in This Session

### Foundation & Architecture

| File | What Changed |
|---|---|
| `src/app/layout.tsx` | Removed global Navbar/Footer (now per-group); added `<AuthProvider>` for Firebase auth sync |
| `src/app/(public)/layout.tsx` | **NEW** — Public marketing layout with Navbar + Footer |
| `src/app/(public)/page.tsx` | **NEW** — Landing page (migrated from old `app/page.tsx`, links updated to new routes) |
| `src/app/(auth)/layout.tsx` | **NEW** — Clean centered auth layout (no Navbar/Footer), with minimal ASPIRA header/footer |
| `src/app/(main)/layout.tsx` | **NEW** — Main app layout: desktop sidebar + mobile header + mobile bottom nav |

### Authentication Pages

| File | What Changed |
|---|---|
| `src/app/(auth)/login/page.tsx` | **REBUILT** — Full Firebase login form: email + password, show/hide toggle, error handling, redirect if already authenticated |
| `src/app/(auth)/register/page.tsx` | **REBUILT** — Full Firebase registration form: name, email, password with strength meter, confirm password, validation, redirect if authenticated |
| `src/app/(auth)/forgot-password/page.tsx` | **REBUILT** — Password reset via Firebase `sendPasswordResetEmail`; two-step UX (form → success confirmation) |

### Dashboard (Beranda)

| File | What Changed |
|---|---|
| `src/app/(main)/beranda/page.tsx` | **NEW** — Full authenticated dashboard with: welcome banner, City Pulse stat cards (real Firestore data), quick actions, recent reports list, category breakdown bar chart, resolution ring, community teaser section, guest CTA |

### Layout Components

| File | What Changed |
|---|---|
| `src/components/layout/AppShell.tsx` | **NEW** — `AppSidebar`, `MobileHeader`, `MobileNav` components; sidebar with full nav items, user info + logout; mobile slide-out drawer; mobile bottom nav bar with FAB |
| `src/components/layout/Navbar.tsx` | Updated — now auth-aware (shows Dasbor/Keluar when logged in; Masuk when guest); links updated to new routes |

### Stores & Hooks

| File | What Changed |
|---|---|
| `src/stores/languageStore.ts` | **NEW** — Zustand store for language preference (`id` / `en`), persisted to `localStorage` |
| `src/hooks/useAuthListener.ts` | Fixed export style (`export function` instead of default), kept same Firebase sync logic |
| `src/hooks/useTranslation.ts` | Updated — now reads from `languageStore` instead of hardcoding Indonesian |

### Translations & Constants

| File | What Changed |
|---|---|
| `src/constants/translations.ts` | **EXPANDED** — Now exports both `id` (Indonesian) and `en` (English) objects under `translations`; added `dashboard`, `community`, new `auth` keys; backward-compatible named `id` export preserved |

### Auth Wiring

| File | What Changed |
|---|---|
| `src/components/auth/AuthProvider.tsx` | **NEW** — Client component that calls `useAuthListener()` once at the root; keeps root layout as a Server Component |

---

## 🔴 Not Yet Done — Priority Order

### 1. Community Feed (`/komunitas`)
- [ ] `src/app/(main)/komunitas/page.tsx` — Feed with post cards (DISCUSSION, NEWS, UMKM, REPORT types)
- [ ] `src/app/(main)/komunitas/[postId]/page.tsx` — Post detail with comments + replies
- [ ] `src/components/community/PostCard.tsx`
- [ ] `src/components/community/CommentList.tsx`
- [ ] `src/components/community/CreatePostModal.tsx`
- [ ] Upvote / downvote logic (Firestore + prevent double voting)
- [ ] Firestore `communityPosts` collection service (`src/services/community.ts`)

### 2. Report Submission (`/lapor`)
- [ ] `src/app/(main)/lapor/page.tsx` — Multi-step report form
- [ ] Step 1: Category + Problem Type selection
- [ ] Step 2: Title + Description
- [ ] Step 3: Photo upload (HTML file input → Firebase Storage)
- [ ] Step 4: GPS location (browser Geolocation API) + manual map picker
- [ ] AI triage call (`/api/ai/triage`) after submission
- [ ] Submission confirmation with ticket number
- [ ] Anonymous report option

### 3. Report Detail & Tracking (`/laporan/[ticket]`)
- [ ] `src/app/(main)/laporan/[ticket]/page.tsx` — Report detail with full status history timeline
- [ ] Community confirmation button
- [ ] Before/after photo display
- [ ] Status badge + progress stepper for 8-stage lifecycle
- [ ] `src/components/reports/StatusTimeline.tsx`

### 4. Interactive Map (`/peta`)
- [ ] `src/app/(main)/peta/page.tsx`
- [ ] `src/components/maps/ReportMap.tsx` (dynamic import, SSR disabled)
- [ ] Report markers with popup details
- [ ] Filter by category, status, severity
- [ ] Default center: Kota Bogor (`-6.5971, 106.8060`)

### 5. City Pulse / Analytics (`/pantau`)
- [ ] `src/app/(main)/pantau/page.tsx`
- [ ] Report status distribution chart
- [ ] Resolution rate over time
- [ ] Category breakdown
- [ ] Monthly report trend
- [ ] Geographic heatmap (optional, Leaflet)

### 6. AI Assistant (`/asisten`)
- [ ] `src/app/(main)/asisten/page.tsx` — Chat UI
- [ ] `src/app/api/ai/chat/route.ts` — Server-side OpenRouter/Gemini proxy (key never exposed to browser)
- [ ] Chat history state (Zustand or local state)
- [ ] AI safety guards (no fabricated official statements)

### 7. User Profile (`/profil`)
- [ ] `src/app/(main)/profil/page.tsx`
- [ ] Display name, avatar, contribution points, level badge
- [ ] Achievement badges list
- [ ] User's own report history
- [ ] Edit profile form
- [ ] Avatar upload (Firebase Storage)

### 8. Gamification
- [ ] Contribution points awarded on: report submission, community post, comment, confirmation
- [ ] Reputation level calculation (Bronze → Silver → Gold → Diamond)
- [ ] `src/components/gamification/LevelBadge.tsx`
- [ ] `src/components/gamification/AchievementCard.tsx`
- [ ] Leaderboard page (Top 10)
- [ ] Point awards must go through server-side logic (not client-only)

### 9. Onboarding
- [ ] `src/app/(onboarding)/onboarding/page.tsx` — First-login onboarding flow
- [ ] Triggered automatically after first registration
- [ ] Collects: kelurahan/kecamatan preference, notification opt-in

### 10. Theme System (Dark Mode)
- [ ] Wire `themeStore` to actual `dark:` Tailwind classes via `<html>` class
- [ ] Theme toggle component in sidebar / profile settings
- [ ] Persist across sessions (already in store, needs DOM wiring)

### 11. Report List Page (`/laporan`)
- [ ] Pagination with Firestore cursor
- [ ] Filter by status, category, severity
- [ ] Search by title / address
- [ ] `src/components/reports/ReportListItem.tsx`

### 12. PWA
- [ ] `public/manifest.json` — Web App Manifest
- [ ] Service worker for offline support
- [ ] Install prompt

### 13. Firebase Security Rules
- [ ] Firestore rules: user can only edit own profile; votes prevent double-voting; admin-only status transitions
- [ ] Storage rules: authenticated upload only; max file size

### 14. Error & Loading States
- [ ] Global error boundary (`src/app/error.tsx`)
- [ ] Not-found page (`src/app/not-found.tsx`)
- [ ] Suspense boundaries on data-heavy pages

### 15. Lint & Quality
- [ ] Run `npm run lint` — fix any remaining warnings
- [ ] Add `src/app/api/ai/triage/route.ts`
- [ ] Add `src/services/community.ts`
- [ ] Add `src/services/gamification.ts`

---

## 🗂️ Route Map (Current State)

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Done | Public landing page |
| `/login` | ✅ Done | Firebase email/password login |
| `/register` | ✅ Done | Firebase registration + Firestore profile |
| `/forgot-password` | ✅ Done | Firebase password reset email |
| `/beranda` | ✅ Done | Dashboard with real Firestore stats |
| `/komunitas` | ❌ TODO | Community feed |
| `/komunitas/[postId]` | ❌ TODO | Post detail + comments |
| `/lapor` | ❌ TODO | Report submission form |
| `/laporan` | 🔶 Stub | Basic page exists, no real data |
| `/laporan/[id]` | 🔶 Stub | Basic route exists |
| `/peta` | ❌ TODO | Interactive map |
| `/pantau` | ❌ TODO | City Pulse analytics |
| `/asisten` | ❌ TODO | AI chat assistant |
| `/profil` | ❌ TODO | User profile |
| `/onboarding` | ❌ TODO | First-login flow |

---

## 🏆 Competition Checklist Progress

### Platform
- [x] Next.js App Router
- [x] No React Native UI primitives
- [x] Semantic HTML
- [x] Tailwind CSS
- [ ] PWA manifest + service worker

### Authentication
- [x] Login works (Firebase)
- [x] Registration works (Firebase + Firestore profile)
- [x] Password recovery works
- [x] Auth state persists (Zustand + Firebase)
- [x] Protected routes (redirect if not authenticated)
- [ ] Onboarding flow for new users

### Community
- [ ] Feed works
- [ ] Post creation
- [ ] Comments
- [ ] Voting

### Gamification
- [ ] Contribution points
- [ ] Level system
- [ ] Badges
- [ ] Leaderboard

### Reporting
- [ ] Report submission with photo + GPS
- [ ] 8-stage status lifecycle
- [ ] Report tracking

### City Pulse
- [ ] Real data stats *(beranda page has live stats)*
- [ ] Full analytics page

### AI
- [ ] Chat assistant (server-side)

### Localization
- [x] Indonesian strings
- [x] English strings
- [x] Language store (Zustand, persisted)
- [ ] Language switcher UI component

### Theme
- [x] Theme store exists
- [ ] Dark mode DOM wiring
- [ ] Theme toggle UI

### Responsive
- [x] Mobile bottom nav
- [x] Desktop sidebar
- [x] Mobile drawer
- [ ] Tablet layouts verified
