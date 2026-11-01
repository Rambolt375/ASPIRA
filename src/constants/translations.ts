// UI strings — Bahasa Indonesia & English
// Use the useTranslation() hook to access these: const { t } = useTranslation()

const id = {
  // Navigation
  nav: {
    home: 'Beranda',
    reports: 'Laporan',
    createReport: 'Buat Laporan',
    community: 'Komunitas',
    map: 'Peta',
    cityPulse: 'City Pulse',
    assistant: 'Asisten AI',
    profile: 'Profil',
    logout: 'Keluar',
    login: 'Masuk',
    register: 'Daftar',
  },

  // Auth
  auth: {
    loginTitle: 'Masuk ke ASPIRA',
    registerTitle: 'Daftar Akun Baru',
    forgotTitle: 'Lupa Kata Sandi?',
    email: 'Email',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    fullName: 'Nama Lengkap',
    forgotPassword: 'Lupa kata sandi?',
    loginButton: 'Masuk',
    registerButton: 'Daftar Sekarang',
    sendResetButton: 'Kirim Tautan Reset',
    noAccount: 'Belum punya akun?',
    hasAccount: 'Sudah punya akun?',
    registerFree: 'Daftar gratis',
    loginHere: 'Masuk di sini',
  },

  // Dashboard
  dashboard: {
    welcome: 'Selamat datang di ASPIRA',
    cityPulse: 'City Pulse',
    cityCondition: 'Kondisi kota saat ini',
    quickActions: 'Aksi Cepat',
    recentReports: 'Laporan Terbaru',
    viewAll: 'Lihat semua',
    topCategories: 'Kategori Teratas',
    resolutionRate: 'Tingkat Resolusi',
    noReports: 'Belum ada laporan',
    noReportsDesc: 'Jadilah yang pertama melaporkan masalah infrastruktur.',
    firstReport: 'Buat laporan pertama',
    totalReports: 'Total Laporan',
    resolved: 'Diatasi',
    inProgress: 'Dalam Proses',
    pending: 'Menunggu',
  },

  // Report form
  report: {
    title: 'Judul Laporan',
    description: 'Deskripsi',
    category: 'Kategori',
    severity: 'Tingkat Keparahan',
    location: 'Lokasi',
    photo: 'Foto',
    addPhoto: 'Tambah Foto',
    takePhoto: 'Ambil Foto',
    submit: 'Kirim Laporan',
    statusHistory: 'Riwayat Status',
    communityConfirm: 'Konfirmasi Lapangan',
    confirmCount: (n: number) => `${n} warga mengonfirmasi`,
    anonymous: 'Laporkan sebagai Anonim',
  },

  // Status labels
  status: {
    DITERIMA: 'Diterima',
    VERIFIKASI: 'Verifikasi',
    DICEK: 'Dicek Lapangan',
    DITUGASKAN: 'Ditugaskan',
    DALAM_PENANGANAN: 'Dalam Penanganan',
    DIATASI: 'Diatasi',
    PENINJAUAN: 'Peninjauan',
    PERAWATAN: 'Perawatan',
    DITOLAK: 'Ditolak',
    DIBUKA_KEMBALI: 'Dibuka Kembali',
  },

  // Community
  community: {
    title: 'Komunitas',
    discussion: 'Diskusi Warga',
    news: 'Berita Kota',
    umkm: 'UMKM Lokal',
    postDiscussion: 'Buat Diskusi',
    viewAll: 'Lihat semua',
    upvote: 'Setuju',
    downvote: 'Tidak Setuju',
    comment: 'Komentar',
    reply: 'Balas',
  },

  // General
  general: {
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    retry: 'Coba lagi',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    search: 'Cari laporan...',
    noResults: 'Tidak ada laporan',
    viewDetail: 'Lihat Detail',
    reportedBy: 'Dilaporkan oleh',
    reportedAt: 'Dilaporkan pada',
    seeDetail: 'Lihat Detail →',
  },

  // AI assistant
  chatbot: {
    title: 'Asisten ASPIRA',
    placeholder: 'Tanyakan sesuatu tentang laporan atau infrastruktur...',
    send: 'Kirim',
    thinking: 'Sedang berpikir...',
  },
} as const;

const en = {
  // Navigation
  nav: {
    home: 'Home',
    reports: 'Reports',
    createReport: 'Create Report',
    community: 'Community',
    map: 'Map',
    cityPulse: 'City Pulse',
    assistant: 'AI Assistant',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
  },

  // Auth
  auth: {
    loginTitle: 'Sign in to ASPIRA',
    registerTitle: 'Create New Account',
    forgotTitle: 'Forgot Password?',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot password?',
    loginButton: 'Sign In',
    registerButton: 'Create Account',
    sendResetButton: 'Send Reset Link',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    registerFree: 'Register free',
    loginHere: 'Sign in here',
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome to ASPIRA',
    cityPulse: 'City Pulse',
    cityCondition: 'Current city status',
    quickActions: 'Quick Actions',
    recentReports: 'Recent Reports',
    viewAll: 'View all',
    topCategories: 'Top Categories',
    resolutionRate: 'Resolution Rate',
    noReports: 'No reports yet',
    noReportsDesc: 'Be the first to report an infrastructure issue.',
    firstReport: 'Create first report',
    totalReports: 'Total Reports',
    resolved: 'Resolved',
    inProgress: 'In Progress',
    pending: 'Pending',
  },

  // Report form
  report: {
    title: 'Report Title',
    description: 'Description',
    category: 'Category',
    severity: 'Severity Level',
    location: 'Location',
    photo: 'Photo',
    addPhoto: 'Add Photo',
    takePhoto: 'Take Photo',
    submit: 'Submit Report',
    statusHistory: 'Status History',
    communityConfirm: 'Field Confirmation',
    confirmCount: (n: number) => `${n} citizens confirmed`,
    anonymous: 'Report Anonymously',
  },

  // Status labels
  status: {
    DITERIMA: 'Received',
    VERIFIKASI: 'Verification',
    DICEK: 'Field Check',
    DITUGASKAN: 'Assigned',
    DALAM_PENANGANAN: 'In Progress',
    DIATASI: 'Resolved',
    PENINJAUAN: 'Under Review',
    PERAWATAN: 'Maintenance',
    DITOLAK: 'Rejected',
    DIBUKA_KEMBALI: 'Reopened',
  },

  // Community
  community: {
    title: 'Community',
    discussion: 'Citizen Discussion',
    news: 'City News',
    umkm: 'Local UMKM',
    postDiscussion: 'Start Discussion',
    viewAll: 'View all',
    upvote: 'Upvote',
    downvote: 'Downvote',
    comment: 'Comment',
    reply: 'Reply',
  },

  // General
  general: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search reports...',
    noResults: 'No reports found',
    viewDetail: 'View Detail',
    reportedBy: 'Reported by',
    reportedAt: 'Reported on',
    seeDetail: 'View Detail →',
  },

  // AI assistant
  chatbot: {
    title: 'ASPIRA Assistant',
    placeholder: 'Ask anything about reports or infrastructure...',
    send: 'Send',
    thinking: 'Thinking...',
  },
} as const;

export const translations = { id, en } as const;

// Named exports preserved for backward compatibility
export { id };
export type Translations = typeof id;
export type Language = keyof typeof translations;
