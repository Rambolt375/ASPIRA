# ASPIRA

Platform kolaboratif pelaporan infrastruktur publik, komunitas warga, dan transparansi kota berbasis AI untuk Kota Bogor.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Firebase (Authentication, Cloud Firestore)
- Leaflet + OpenStreetMap
- Google Gemini (`@google/generative-ai`)
- Lucide React

## How to Run

```bash
git clone <repository-url>
cd ASPIRA-web
npm install
cp .env.example .env.local
# Fill in .env.local with your Firebase and Gemini credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current Progress

- [x] Landing page (`/`)
- [x] Login page with Firebase authentication (`/login`)
- [x] Register page with Firestore profile creation (`/register`)
- [x] Forgot password page (`/forgot-password`)
- [x] Authenticated dashboard with live Firestore stats (`/beranda`)
- [ ] Report detail page with status history timeline (`/laporan/[id]`)
- [ ] Server-side Gemini AI route (`/api/gemini`)
- [ ] File upload proxy route (`/api/upload`)
- [x] App shell — desktop sidebar, mobile drawer, mobile bottom nav
- [ ] Zustand stores for auth, theme, and language (persisted)
- [ ] Bilingual translation constants (Indonesian + English)
- [ ] Report submission form (`/laporan/buat`)
- [ ] Report list page (`/laporan`)
- [ ] Community feed (`/komunitas`)
- [ ] Interactive map page (`/peta`)
- [ ] City Pulse analytics page (`/pantau`)
- [ ] AI assistant chat UI (`/asisten`)
- [ ] User profile page (`/profil`)
