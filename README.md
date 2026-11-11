# ASPIRA 🌐

> **Platform Kolaboratif Pelaporan Infrastruktur Publik, Komunitas Warga, dan Transparansi Kota Berbasis AI**  
> Pilot: **Kota Bogor, Indonesia** — Dibuat untuk Kompetisi Pengembangan Web

ASPIRA menghubungkan warga, komunitas lokal, dan institusi publik melalui pelaporan infrastruktur kolaboratif, forum komunitas, statistik kota real-time, dan asisten AI yang berdedikasi untuk layanan sipil.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📋 **Pelaporan Infrastruktur** | Form multi-langkah dengan GPS, foto langsung/galeri, triase AI otomatis, dan opsi anonimitas |
| 🔄 **Siklus 8 Status Transparan** | Lacak progres laporan dari `DITERIMA` hingga `PERAWATAN` dengan linimasa audit append-only |
| 🗺️ **Peta Geospasial** | Peta interaktif Leaflet + OpenStreetMap terpusat di Kota Bogor dengan filter kategori & status |
| 📊 **City Pulse** | Dashboard transparansi kota: statistik laporan, distribusi kategori, sebaran per kecamatan |
| 💬 **Komunitas Warga** | Forum diskusi, informasi lokal, promosi UMKM, komentar bersarang, dan voting anti-duplikasi |
| 🤖 **Asisten AI Sipil** | Chat berbasis Gemini untuk panduan pelaporan dan informasi layanan publik Kota Bogor |
| 🏆 **Gamifikasi** | Poin kontribusi, 4 tingkat reputasi (Bronze–Diamond), lencana, dan leaderboard |
| 🌙 **Tema & Bahasa** | Mode gelap/terang dan dukungan dwibahasa Indonesia/Inggris |

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Web Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + Tailwind CSS 4 |
| **Bahasa** | TypeScript (strict) |
| **Client State** | Zustand |
| **Database** | PostgreSQL 17 (via Docker Compose) |
| **ORM** | Prisma ORM 6 |
| **Autentikasi** | Custom JWT / bcryptjs (server-side) |
| **Peta** | Leaflet + react-leaflet + OpenStreetMap |
| **AI** | Google Gemini (`@google/generative-ai`) |
| **Ikon** | Lucide React |
| **PWA** | Web App Manifest |

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js 20+
- Docker Desktop
- npm

### 1. Clone Repositori

```bash
git clone https://github.com/Rambolt375/ASPIRA.git
cd ASPIRA
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env.local
```

Isi `.env.local` dengan nilai berikut:

```dotenv
# Database (PostgreSQL 17 via Docker Compose)
DATABASE_URL="postgresql://aspira:12345678@localhost:5432/aspira_dev"

# Autentikasi
AUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider (Google Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# Lokasi Default (Kota Bogor)
NEXT_PUBLIC_DEFAULT_CITY="Kota Bogor"
NEXT_PUBLIC_DEFAULT_LAT="-6.5971"
NEXT_PUBLIC_DEFAULT_LNG="106.8060"
```

### 4. Jalankan Database PostgreSQL

```bash
docker compose up -d
```

Periksa status:

```bash
docker compose ps
```

### 5. Setup Database (Prisma)

```bash
# Generate Prisma client
npx prisma generate

# Buat tabel di database
npx prisma migrate dev --name init

# (Opsional) Isi data awal realistis Kota Bogor
npx prisma db seed
```

### 6. Jalankan Server Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── (main)/          # Halaman utama terautentikasi
│   │   ├── beranda/     # Dashboard utama
│   │   ├── laporan/     # Daftar & detail laporan
│   │   ├── lapor/       # Form pelaporan cepat
│   │   ├── peta/        # Peta geospasial interaktif
│   │   ├── pantau/      # City Pulse — statistik kota
│   │   ├── komunitas/   # Forum & diskusi warga
│   │   ├── asisten/     # Chat asisten AI sipil
│   │   └── profil/      # Profil & pengaturan pengguna
│   ├── (onboarding)/    # Alur onboarding pengguna baru
│   ├── (public)/        # Landing page publik
│   └── api/             # Route Handlers (auth, reports, community, AI)
├── components/          # Komponen UI & fitur reusable
├── constants/           # Konfigurasi & terjemahan
├── hooks/               # Custom React hooks
├── lib/                 # Prisma client, utilitas
├── services/            # Logika bisnis & akses database
├── stores/              # Zustand stores (auth, tema, bahasa)
└── types/               # TypeScript types bersama

prisma/
├── schema.prisma        # Schema database (12 model relasional)
└── seed.ts              # Data seed realistis Kota Bogor

public/
└── manifest.json        # Web App Manifest (PWA)
```

---

## 🗄️ Model Database

Schema Prisma mencakup 12 model relasional:

- **User** — Profil warga, petugas dinas, dan admin
- **Report** — Laporan infrastruktur dengan koordinat GPS
- **ReportMedia** — Lampiran foto laporan
- **StatusHistory** — Riwayat audit perubahan status (append-only)
- **EvidenceVerification** — Bukti perbaikan (Before/After)
- **ReportConfirmation** — Konfirmasi kondisi lapangan oleh warga
- **CommunityPost** — Postingan forum komunitas
- **CommunityComment** — Komentar & balasan bersarang
- **PostVote** — Sistem voting anti-duplikasi
- **PointTransaction** — Ledger poin kontribusi idempoten
- **UserBadge** — Lencana prestasi pengguna
- **CityAnnouncement** — Pengumuman resmi Pemkot

---

## 🔄 Siklus Status Laporan

```
DITERIMA → VERIFIKASI → DICEK → DITUGASKAN → DALAM_PENANGANAN → DIATASI → PENINJAUAN → PERAWATAN
                                                                               ↑
                                                                         DIBUKA_KEMBALI
                              DITOLAK (dengan alasan terdokumentasi)
```

Setiap transisi status dicatat secara atomik dalam database dengan timestamp, aktor, dan catatan resmi.

---

## 🤖 Fitur AI (Server-Side)

| Endpoint | Fungsi |
|---|---|
| `POST /api/ai/triage` | Analisis multimodal foto & teks, skor keaslian, rekomendasi kategori |
| `POST /api/ai/compare` | Analisis visual Before/After untuk verifikasi kualitas perbaikan |
| `POST /api/ai/chat` | Chat asisten sipil panduan warga Kota Bogor |

Semua permintaan AI diproses di server-side. API key tidak pernah dikirim ke browser.

---

## 📜 Lisensi

Proyek ini dibuat untuk keperluan kompetisi web development. Hak cipta © 2026 Tim ASPIRA.
