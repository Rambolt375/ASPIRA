# ASPIRA Web — Status & Change Log

> Terakhir diperbarui: 2026-11-08  
> Arsitektur: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma ORM, PostgreSQL 17 (Docker Compose).

---

## ✅ Selesai (Completed)

### 1. Fondasi Arsitektur & Database Relasional
- [x] **PostgreSQL 17** via Docker Compose (`aspira-postgres` pada port 5432).
- [x] **Prisma ORM** (`@prisma/client@6.19.3` & `prisma@6.19.3`) terpasang dan terkonfigurasi.
- [x] **Skema Prisma Lengkap** (`prisma/schema.prisma`): 12 model relasional (`User`, `Report`, `ReportMedia`, `StatusHistory`, `EvidenceVerification`, `ReportConfirmation`, `CommunityPost`, `CommunityComment`, `PostVote`, `PointTransaction`, `UserBadge`, `CityAnnouncement`).
- [x] **Pembersihan Total Firebase**: Seluruh modul Firebase telah dihapus dan digantikan oleh Prisma ORM dan API server-side ASPIRA.
- [x] **Seed Data Realistis Kota Bogor** (`prisma/seed.ts`): Akun admin, petugas dinas PUPR, warga pelapor, laporan jalan berlubang Jl. Pajajaran, PJU padam Suryakencana, drainase Sempur, diskusi SSA Kebun Raya, dan pengumuman resmi Pemkot.
- [x] Klien singleton Prisma (`src/lib/prisma.ts`).

### 2. Autentikasi & Otorisasi Server-Side
- [x] Hash kata sandi menggunakan `bcryptjs`.
- [x] Registrasi publik (`/api/auth/register`) yang secara ketat selalu menetapkan peran `USER` (Warga).
- [x] Endpoint login (`/api/auth/login`) dan profil pengguna aman (`SafeUser`).
- [x] Halaman login (`/login`), registrasi (`/register`), dan pemulihan (`/forgot-password`).
- [x] Alur onboarding pengguna baru (`/onboarding`) untuk preferensi domisili kecamatan/kelurahan di Kota Bogor.

### 3. Pelaporan Berintegritas & Siklus 8-Status
- [x] Form pelaporan multi-step (`/laporan/buat` dan `/lapor`):
  - Langkah 1: Kategori masalah & tingkat keparahan (Rendah, Sedang, Tinggi, Kritis).
  - Langkah 2: Bukti foto via kamera langsung (`getUserMedia`) dengan cap waktu asli atau unggahan galeri.
  - Langkah 3: Koordinat GPS peramban (`navigator.geolocation`) & alamat patokan Kota Bogor.
  - Langkah 4: Tinjauan triase AI otomatis (Authenticity Score & rekomendasi kategori).
  - Opsi anonimitas publik.
- [x] Halaman daftar laporan lengkap (`/laporan`) dengan pencarian teks, filter kategori, filter status, dan pagination.
- [x] Halaman rincian laporan transparan (`/laporan/[id]`):
  - Stepper visual 8-tahap siklus status (`DITERIMA` ➔ `PERAWATAN`).
  - Linimasa riwayat audit append-only dengan tanggal, aktor, dan catatan resmi.
  - **Slider interaktif perbandingan Sebelum vs Sesudah (Before/After Photo Comparison)** pada status `PENINJAUAN`/`DIATASI`.
  - Tombol konfirmasi kondisi lapangan oleh warga (+10 Poin).
  - Panel kontrol eskalasi status resmi bagi petugas dinas/admin.

### 4. Peta Geospasial & City Pulse (Pemantauan Kota Bogor)
- [x] Peta interaktif Leaflet (`/peta`) terpusat di Kota Bogor (`-6.5971, 106.8060`) dengan marker kustom, popup rincian, dan filter kategori dinamis (SSR disabled via Next.js dynamic import).
- [x] Dashboard transparansi **City Pulse** (`/pantau`):
  - Total laporan, persentase laju penyelesaian kota, laporan dalam penanganan, laporan tuntas.
  - Sebaran grafik 8 siklus status.
  - Distribusi kategori kerusakan fasilitas fisik.
  - Statistik proporsi per kecamatan di Kota Bogor.

### 5. Komunitas Warga & Gamifikasi
- [x] Feed forum komunitas (`/komunitas`): Diskusi warga, informasi resmi dinas, dan promosi UMKM lokal.
- [x] Detail postingan & utas komentar (`/komunitas/[postId]`).
- [x] Sistem voting upvote/downvote anti-duplikasi per akun.
- [x] Gamifikasi etis:
  - 4 Tingkat reputasi (*Bronze, Silver, Gold, Diamond*).
  - Buku kas transaksi poin kontribusi idempoten di server.
  - Lencana prestasi (*Reporter*, *Helper*, *Top 10*).
- [x] Halaman profil warga (`/profil`) dengan progres reputasi, lencana, pengaturan tema (Light/Dark), dan dwibahasa (ID/EN).

### 6. Layanan Kecerdasan Buatan (AI) Server-Side
- [x] `/api/ai/triage`: Analisis multimodal foto dan teks, deteksi manipulasi keaslian, rekomendasi kategori dan keparahan.
- [x] `/api/ai/compare`: Analisis komparasi visual sebelum-sesudah untuk tahap peninjauan mutu perbaikan.
- [x] `/api/ai/chat`: Asisten AI sipil panduan pengaduan warga Kota Bogor.
- [x] Antarmuka chat interaktif asisten AI (`/asisten`) dengan tombol rekomendasi pertanyaan cepat.

### 7. Standar Teknis & Kesiapan Lomba
- [x] Web App Manifest (`/manifest.json`) untuk kemampuan Progressive Web App (PWA).
- [x] `npm run lint` lolos dengan **0 error**.
- [x] `npm run build` sukses memproduksi 25 rute statis dan dinamis.
