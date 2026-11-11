# ASPIRA Web — Status & Change Log

> Terakhir diperbarui: 2026-11-11

## ✅ Role-Based Dashboards & Access Control

- [x] Citizen dashboard (`USER`) at `/beranda` with reporting, tracking, community and City Pulse access.
- [x] Field inspector dashboard (`PETUGAS`) at `/petugas`:
  - Inspection queue, district/severity filters, AI authenticity indicators.
  - Field inspection record workflow with findings, severity confirmation and append-only status history.
  - APIs: `/api/petugas/tasks`, `/api/petugas/inspect`, `/api/petugas/stats`.
- [x] Local government operational dashboard (`LOCAL_GOVERNMENT`) at `/dinas`:
  - OPD report monitoring, assignment, official status workflow and announcements.
  - Existing APIs: `/api/dinas/stats`, `/api/dinas/reports`, `/api/dinas/officers`, `/api/dinas/announcements`.
- [x] Executive administration dashboard (`ADMIN`) at `/admin`:
  - Platform metrics, account/RBAC management and append-only audit log review.
  - APIs: `/api/admin/stats`, `/api/admin/users`, `/api/admin/audit-logs`.
- [x] Central role workspace mapping in `src/lib/roles.ts`.
- [x] Signed HMAC session validation in `middleware.ts` for specialized pages and API namespaces:
  - `/petugas` and `/api/petugas/*` → `PETUGAS` only.
  - `/dinas` and `/api/dinas/*` → `LOCAL_GOVERNMENT` only.
  - `/admin` and `/api/admin/*` → `ADMIN` only.
  - Unauthorized web requests redirect to login; API requests return 401/403 JSON.
- [x] AppShell sidebar/mobile navigation now exposes the role-specific workspace only.
- [x] Evaluator role switch supports all four roles and synchronizes the session cookie.

## ✅ Existing platform areas

- [x] PostgreSQL/Prisma foundation, authentication, reporting lifecycle, community, gamification, maps, City Pulse, AI assistant, bilingual UI, theme support, and PWA manifest.

## Validation

- [x] `npm run lint` — passed with existing warnings only.
- [x] `npm run build` — passed successfully.
