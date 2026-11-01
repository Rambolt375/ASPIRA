import Link from 'next/link';
import { Badge } from '@/components/ui';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
} from '@/components/icons';

// ─── Static data for the landing sections ─────────────────────────────────────

const features = [
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: 'Verifikasi AI Otomatis',
    description:
      'Setiap laporan dianalisis oleh AI untuk menentukan kategori, tingkat keparahan, dan keaslian laporan secara instan.',
  },
  {
    icon: <ClockIcon className="w-6 h-6" />,
    title: 'Pantau Status Real-time',
    description:
      '8 tahap alur penanganan yang transparan — dari laporan masuk hingga perawatan berkala.',
  },
  {
    icon: <MapPinIcon className="w-6 h-6" />,
    title: 'Berbasis Lokasi',
    description:
      'Tandai lokasi kerusakan di peta Kota Bogor secara presisi dengan GPS perangkat Anda.',
  },
  {
    icon: <CameraIcon className="w-6 h-6" />,
    title: 'Bukti Foto Wajib',
    description:
      'Foto sebelum dan sesudah perbaikan menjadi bukti nyata yang disimpan permanen di setiap laporan.',
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Akuntabel & Transparan',
    description:
      'Jejak audit lengkap setiap perubahan status — siapa yang mengubah, kapan, dan alasannya.',
  },
  {
    icon: <CheckCircleIcon className="w-6 h-6" />,
    title: 'Konfirmasi Warga',
    description:
      'Warga lain dapat mengonfirmasi laporan di lapangan, memperkuat urgensi dan prioritas penanganan.',
  },
];

const pipeline = [
  { stage: '01', label: 'Diterima', desc: 'Laporan berhasil dibuat dan tercatat dengan timestamp.' },
  { stage: '02', label: 'Verifikasi', desc: 'AI & petugas memverifikasi keaslian laporan.' },
  { stage: '03', label: 'Dicek Lapangan', desc: 'Survei langsung oleh dinas terkait di lokasi.' },
  { stage: '04', label: 'Ditugaskan', desc: 'Diteruskan ke dinas dengan tenggat waktu jelas.' },
  { stage: '05', label: 'Dalam Penanganan', desc: 'Pekerjaan perbaikan sedang berlangsung.' },
  { stage: '06', label: 'Diatasi', desc: 'Perbaikan selesai, dilengkapi foto bukti.' },
  { stage: '07', label: 'Peninjauan', desc: 'Warga diminta mengonfirmasi hasil perbaikan.' },
  { stage: '08', label: 'Perawatan', desc: 'Masuk jadwal perawatan berkala.' },
];

const categories = [
  { emoji: '🛣️', label: 'Jalan' },
  { emoji: '🌉', label: 'Jembatan' },
  { emoji: '🌊', label: 'Drainase' },
  { emoji: '💡', label: 'Lampu Jalan' },
  { emoji: '🌳', label: 'Taman & RTH' },
  { emoji: '🗑️', label: 'Sampah' },
  { emoji: '🌧️', label: 'Banjir' },
  { emoji: '📋', label: 'Lainnya' },
];

const stats = [
  { value: '8', label: 'Tahap Alur Audit', sub: 'transparan & terverifikasi' },
  { value: 'AI', label: 'Verifikasi Otomatis', sub: 'powered by Gemini' },
  { value: '24/7', label: 'Sistem Aktif', sub: 'pantau kapan saja' },
  { value: '100%', label: 'Jejak Audit', sub: 'tidak bisa dihapus' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          {/* Pill badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-medium mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Pilot Kota Bogor — 2026
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Laporkan. Pantau.{' '}
            <span className="text-emerald-200">Wujudkan.</span>
          </h1>

          <p className="mt-6 text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            ASPIRA adalah platform pelaporan infrastruktur publik berbasis AI untuk
            warga Kota Bogor. Transparan, akuntabel, dan terverifikasi dari awal hingga selesai.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/lapor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-emerald-700 font-semibold text-base hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-900/20"
            >
              Buat Laporan Sekarang
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/beranda"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Masuk ke Dasbor
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-emerald-200/70 text-sm">
            Gratis untuk semua warga · Didukung AI · Data tidak bisa dimanipulasi
          </p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-3xl font-bold text-emerald-600">{s.value}</p>
              <p className="text-sm font-semibold text-slate-800">{s.label}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 mb-3">Fitur Platform</Badge>
            <h2 className="text-3xl font-bold text-slate-900">
              Dirancang untuk transparansi nyata
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Setiap fitur dibangun agar warga, petugas, dan pemerintah bisa bekerja sama
              dalam satu ekosistem yang terbuka.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8-stage pipeline ─────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-700 mb-3">Alur Penanganan</Badge>
            <h2 className="text-3xl font-bold text-slate-900">
              8 tahap audit yang tidak bisa dimanipulasi
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Setiap perubahan status tercatat permanen. Tidak ada yang bisa dihapus atau
              diubah — hanya bisa ditambah.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map((p, i) => (
              <div
                key={p.stage}
                className="relative bg-slate-50 rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
              >
                {/* connector line — desktop only, not last column */}
                {i % 4 !== 3 && (
                  <div className="hidden lg:block absolute top-8 -right-2 w-4 h-0.5 bg-slate-300" />
                )}
                <span className="inline-block text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mb-3">
                  {p.stage}
                </span>
                <h3 className="font-semibold text-slate-900 mb-1">{p.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Side exits note */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Ditolak — alasan wajib dicatat
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Dibuka Kembali — jika perbaikan gagal
            </span>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-slate-100 text-slate-600 mb-3">Kategori Laporan</Badge>
            <h2 className="text-3xl font-bold text-slate-900">
              Apa yang bisa dilaporkan?
            </h2>
            <p className="mt-3 text-slate-500">
              Semua jenis kerusakan infrastruktur publik di Kota Bogor.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={`/beranda?kategori=${c.label}`}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl sm:text-3xl">{c.emoji}</span>
                <span className="text-xs text-slate-600 font-medium text-center group-hover:text-emerald-700 transition-colors leading-tight">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 mb-3">Cara Pakai</Badge>
            <h2 className="text-3xl font-bold text-slate-900">
              Semudah 3 langkah
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              {
                step: '1',
                title: 'Foto & Lokasi',
                desc: 'Ambil foto kerusakan, tandai lokasi di peta, dan isi deskripsi singkat.',
                color: 'bg-emerald-600',
              },
              {
                step: '2',
                title: 'Kirim & Verifikasi',
                desc: 'AI menganalisis laporan Anda secara instan — kategori dan keparahan terisi otomatis.',
                color: 'bg-teal-600',
              },
              {
                step: '3',
                title: 'Pantau Progres',
                desc: 'Ikuti setiap tahap penanganan secara real-time hingga infrastruktur diperbaiki.',
                color: 'bg-amber-500',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full ${item.color} text-white text-2xl font-bold flex items-center justify-center shadow-lg`}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mulai laporkan sekarang
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Daftar gratis dan jadilah bagian dari gerakan transparansi infrastruktur Kota Bogor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-emerald-700 font-semibold text-base hover:bg-emerald-50 transition-colors shadow-md"
            >
              Daftar Gratis
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/beranda"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Masuk ke Dasbor
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
