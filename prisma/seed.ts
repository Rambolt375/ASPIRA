import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ASPIRA Kota Bogor development data...');

  // 1. Clean existing records
  await prisma.postVote.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.reportConfirmation.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.evidenceVerification.deleteMany();
  await prisma.reportMedia.deleteMany();
  await prisma.report.deleteMany();
  await prisma.cityAnnouncement.deleteMany();
  await prisma.user.deleteMany();

  // 2. Passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const officerPassword = await bcrypt.hash('Petugas123!', salt);
  const citizenPassword = await bcrypt.hash('Warga123!', salt);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aspira.bogor.go.id',
      passwordHash: adminPassword,
      name: 'Administrator Kota Bogor',
      role: 'ADMIN',
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Pabaton',
      contributionPoints: 1000,
      reputationLevel: 'DIAMOND',
      isVerifiedReporter: true,
    },
  });

  const officer = await prisma.user.create({
    data: {
      email: 'petugas@pupr.bogor.go.id',
      passwordHash: officerPassword,
      name: 'Budi Santoso (Dinas PUPR)',
      role: 'PETUGAS',
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Babakan',
      contributionPoints: 500,
      reputationLevel: 'GOLD',
      isVerifiedReporter: true,
    },
  });

  const citizen1 = await prisma.user.create({
    data: {
      email: 'warga@aspira.id',
      passwordHash: citizenPassword,
      name: 'Rahmat Hidayat',
      role: 'USER',
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Pabaton',
      phone: '081234567890',
      contributionPoints: 150,
      reputationLevel: 'SILVER',
      isVerifiedReporter: true,
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      email: 'siti@aspira.id',
      passwordHash: citizenPassword,
      name: 'Siti Aminah',
      role: 'USER',
      kecamatan: 'Bogor Timur',
      kelurahan: 'Baranangsiang',
      phone: '081298765432',
      contributionPoints: 40,
      reputationLevel: 'BRONZE',
      isVerifiedReporter: false,
    },
  });

  // 4. Badges
  await prisma.userBadge.createMany({
    data: [
      { userId: citizen1.id, badgeType: 'REPORTER' },
      { userId: citizen1.id, badgeType: 'HELPER' },
      { userId: citizen2.id, badgeType: 'REPORTER' },
      { userId: admin.id, badgeType: 'TOP_10' },
    ],
  });

  // 5. Reports in Kota Bogor
  await prisma.report.create({
    data: {
      ticketNumber: 'ASP-BGR-202611-0001',
      title: 'Jalan Berlubang Dalam di Depan Mal Botani Square',
      description:
        'Lubang jalan berdiameter sekitar 60 cm dengan kedalaman 10 cm, sangat membahayakan pengendara motor saat hujan karena tertutup genangan air.',
      category: 'JALAN',
      severity: 'TINGGI',
      status: 'DALAM_PENANGANAN',
      lat: -6.5985,
      lng: 106.8095,
      address: 'Jl. Raya Pajajaran No. 40, Tegallega, Kecamatan Bogor Tengah',
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Tegallega',
      assignedAgency: 'Dinas PUPR Kota Bogor',
      slaDeadline: new Date(Date.now() + 48 * 3600 * 1000),
      authorId: citizen1.id,
      media: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
            isDirectCapture: true,
            captureSource: 'CAMERA_DIRECT',
          },
        ],
      },
      verification: {
        create: {
          authenticityScore: 0.94,
          isLegitimate: true,
          confidence: 0.91,
          suggestedCategory: 'JALAN',
          suggestedSeverity: 'TINGGI',
          aiFindingsJson: JSON.stringify({
            evidenceType: 'asli',
            manipulationDetected: false,
            potholeDepthEst: '10 cm',
            trafficHazard: 'Tinggi untuk roda dua',
          }),
        },
      },
      statusHistory: {
        create: [
          {
            newStatus: 'DITERIMA',
            actorId: citizen1.id,
            note: 'Laporan dibuat melalui aplikasi ASPIRA dengan bukti foto kamera langsung.',
          },
          {
            previousStatus: 'DITERIMA',
            newStatus: 'VERIFIKASI',
            actorId: officer.id,
            note: 'Verifikasi AI dan petugas: bukti foto otentik dan sesuai titik lokasi.',
          },
          {
            previousStatus: 'VERIFIKASI',
            newStatus: 'DICEK',
            actorId: officer.id,
            note: 'Survei lapangan telah dilaksanakan oleh tim unit reaksi cepat.',
          },
          {
            previousStatus: 'DICEK',
            newStatus: 'DITUGASKAN',
            actorId: officer.id,
            note: 'Ditugaskan ke Seksi Pemeliharaan Jalan Dinas PUPR Kota Bogor dengan target SLA 3x24 jam.',
          },
          {
            previousStatus: 'DITUGASKAN',
            newStatus: 'DALAM_PENANGANAN',
            actorId: officer.id,
            note: 'Pekerjaan penambalan aspal sedang berlangsung oleh regu teknis.',
          },
        ],
      },
    },
  });

  await prisma.report.create({
    data: {
      ticketNumber: 'ASP-BGR-202611-0002',
      title: 'Lampu Penerangan Jalan Umum Mati di Kawasan Suryakencana',
      description:
        'Dua tiang lampu PJU mati total sejak 3 hari lalu, membuat gang masuk kawasan pasar dan pemukiman gelap gulita di malam hari.',
      category: 'LAMPU_JALAN',
      severity: 'SEDANG',
      status: 'PENINJAUAN',
      lat: -6.6025,
      lng: 106.801,
      address: 'Jl. Suryakencana No. 120, Babakan Pasar, Kecamatan Bogor Tengah',
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Babakan Pasar',
      assignedAgency: 'Dinas Perhubungan Kota Bogor',
      authorId: citizen2.id,
      media: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
            isDirectCapture: true,
            captureSource: 'CAMERA_DIRECT',
          },
          {
            fileUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
            isDirectCapture: true,
            isAfterPhoto: true,
            captureSource: 'CAMERA_DIRECT',
          },
        ],
      },
      verification: {
        create: {
          authenticityScore: 0.98,
          isLegitimate: true,
          confidence: 0.95,
          suggestedCategory: 'LAMPU_JALAN',
          suggestedSeverity: 'SEDANG',
        },
      },
      statusHistory: {
        create: [
          {
            newStatus: 'DITERIMA',
            actorId: citizen2.id,
            note: 'Laporan diterima dari warga sekitar.',
          },
          {
            previousStatus: 'DITERIMA',
            newStatus: 'VERIFIKASI',
            actorId: officer.id,
            note: 'Verifikasi berhasil.',
          },
          {
            previousStatus: 'VERIFIKASI',
            newStatus: 'DITUGASKAN',
            actorId: officer.id,
            note: 'Ditugaskan ke Dishub PJU.',
          },
          {
            previousStatus: 'DITUGASKAN',
            newStatus: 'DALAM_PENANGANAN',
            actorId: officer.id,
            note: 'Penggantian bohlam LED dan trafo tiang.',
          },
          {
            previousStatus: 'DALAM_PENANGANAN',
            newStatus: 'DIATASI',
            actorId: officer.id,
            note: 'Pekerjaan selesai. Lampu menyala normal. Menunggu peninjauan warga.',
            evidencePhotoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
          },
          {
            previousStatus: 'DIATASI',
            newStatus: 'PENINJAUAN',
            actorId: citizen2.id,
            note: 'Warga pelapor dan warga sekitar meninjau hasil perbaikan di lapangan.',
          },
        ],
      },
    },
  });

  await prisma.report.create({
    data: {
      ticketNumber: 'ASP-BGR-202611-0003',
      title: 'Tumpukan Sampah Menumpuk di Bantaran Sungai Ciliwung Sempur',
      description:
        'Sampah plastik dan ranting menumpuk menyumbat pintu air kecil di area taman Sempur, berpotensi banjir jika hujan lebat turun.',
      category: 'DRAINASE',
      severity: 'KRITIS',
      status: 'DITUGASKAN',
      lat: -6.5895,
      lng: 106.8015,
      address: 'Taman Sempur, Sempur, Kecamatan Bogor Tengah',
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Sempur',
      assignedAgency: 'Dinas Lingkungan Hidup Kota Bogor',
      slaDeadline: new Date(Date.now() + 24 * 3600 * 1000),
      authorId: citizen1.id,
      media: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
            isDirectCapture: false,
            captureSource: 'GALLERY',
          },
        ],
      },
      statusHistory: {
        create: [
          {
            newStatus: 'DITERIMA',
            actorId: citizen1.id,
            note: 'Laporan masuk sistem.',
          },
          {
            previousStatus: 'DITERIMA',
            newStatus: 'DITUGASKAN',
            actorId: officer.id,
            note: 'Eskalasi prioritas tinggi karena risiko luapan air saat musim penghujan.',
          },
        ],
      },
    },
  });

  // 6. Community Posts
  await prisma.communityPost.create({
    data: {
      title: 'Usulan Penambahan Tempat Sampah Terpilah di Jalur SSA Seputar Kebun Raya',
      content:
        'Banyak pejalan kaki dan pelari pagi di seputar Kebun Raya Bogor (Sistem Satu Arah) kesulitan membuang sampah botol plastik karena jarak tempat sampah cukup jauh. Mohon dukungan kawan-kawan warga agar bisa diajukan ke dinas terkait.',
      type: 'DISCUSSION',
      category: 'Kebersihan',
      authorId: citizen1.id,
      votes: {
        create: [
          { userId: citizen1.id, value: 1 },
          { userId: citizen2.id, value: 1 },
          { userId: officer.id, value: 1 },
        ],
      },
      comments: {
        create: [
          {
            authorId: citizen2.id,
            content: 'Sangat setuju! Terutama di titik dekat pintu 3 Kebun Raya dan Halte BTM sering menumpuk sampah di pinggir trotoar.',
          },
          {
            authorId: officer.id,
            content: 'Terima kasih masukannya warga. Usulan titik penempatan sudah kami catat untuk rapat koordinasi DLH minggu depan.',
          },
        ],
      },
    },
  });

  await prisma.communityPost.create({
    data: {
      title: 'Dukung UMKM: Asinan Jagung Bakar Pak Sabur Surya Kencana',
      content:
        'Kuliner legendaris khas Bogor yang wajib dicoba saat jalan-jalan santai di Surya Kencana. Buka setiap hari jam 09.00 - 17.00 WIB. Yuk dukung UMKM lokal kita!',
      type: 'UMKM',
      category: 'Kuliner',
      authorId: citizen2.id,
      votes: {
        create: [
          { userId: citizen1.id, value: 1 },
          { userId: citizen2.id, value: 1 },
        ],
      },
    },
  });

  // 7. City Announcement
  await prisma.cityAnnouncement.create({
    data: {
      title: 'Pemerintah Kota Bogor Percepat Perbaikan 12 Ruas Jalan Penghubung Antar Kecamatan',
      content:
        'Dinas PUPR Kota Bogor mengumumkan alokasi anggaran pemeliharaan rutin jalan untuk kuartal IV tahun 2026. Prioritas difokuskan pada perbaikan jalan berlubang, normalisasi drainase, dan peningkatan penerangan jalan umum di 6 kecamatan.',
      sourceName: 'Pemerintah Kota Bogor',
      sourceUrl: 'https://kotabogor.go.id',
      isEmergency: false,
      summarizedByAi: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
