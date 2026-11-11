import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { Role, ReputationLevel } from '@prisma/client';

export interface DefaultAccountConfig {
  email: string;
  password: string;
  name: string;
  role: Role;
  kecamatan?: string;
  kelurahan?: string;
  phone?: string;
  contributionPoints?: number;
  reputationLevel?: ReputationLevel;
  isVerifiedReporter?: boolean;
}

export const OFFICIAL_DEFAULT_ACCOUNTS: DefaultAccountConfig[] = [
  // 1. DINAS / PEMERINTAH DAERAH (Role: LOCAL_GOVERNMENT - Tingkat 1 Pimpinan/Disposisi)
  {
    email: 'dinas@kotabogor.go.id',
    password: 'Dinas123!',
    name: 'Pimpinan Dinas Pemkot Bogor',
    role: 'LOCAL_GOVERNMENT',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Pabaton',
    phone: '0251-8321075',
    contributionPoints: 1000,
    reputationLevel: 'DIAMOND',
    isVerifiedReporter: true,
  },
  {
    email: 'dinas.pupr@kotabogor.go.id',
    password: 'Dinas123!',
    name: 'Ir. Hendra Kusuma (Kadis PUPR)',
    role: 'LOCAL_GOVERNMENT',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Babakan',
    phone: '08111223344',
    contributionPoints: 950,
    reputationLevel: 'DIAMOND',
    isVerifiedReporter: true,
  },
  {
    email: 'dinas.dishub@kotabogor.go.id',
    password: 'Dinas123!',
    name: 'Drs. Eko Prabowo (Kadis Perhubungan)',
    role: 'LOCAL_GOVERNMENT',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Pabaton',
    phone: '08123344556',
    contributionPoints: 900,
    reputationLevel: 'DIAMOND',
    isVerifiedReporter: true,
  },
  {
    email: 'dinas.dlh@kotabogor.go.id',
    password: 'Dinas123!',
    name: 'Dra. Hj. Nina Nurmala (Kadis Lingkungan Hidup)',
    role: 'LOCAL_GOVERNMENT',
    kecamatan: 'Bogor Timur',
    kelurahan: 'Baranangsiang',
    phone: '08134455667',
    contributionPoints: 900,
    reputationLevel: 'DIAMOND',
    isVerifiedReporter: true,
  },

  // 2. PETUGAS LAPANGAN / TEKNIS OPD (Role: PETUGAS - Tingkat 2 Pelaksana Lapangan)
  {
    email: 'petugas@pupr.bogor.go.id',
    password: 'Petugas123!',
    name: 'Budi Santoso (Petugas PUPR)',
    role: 'PETUGAS',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Babakan',
    phone: '081288991122',
    contributionPoints: 600,
    reputationLevel: 'GOLD',
    isVerifiedReporter: true,
  },
  {
    email: 'petugas.dishub@bogor.go.id',
    password: 'Petugas123!',
    name: 'Agus Setiawan (Teknisi PJU Dishub)',
    role: 'PETUGAS',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Pabaton',
    phone: '081288992233',
    contributionPoints: 550,
    reputationLevel: 'GOLD',
    isVerifiedReporter: true,
  },
  {
    email: 'petugas.dlh@bogor.go.id',
    password: 'Petugas123!',
    name: 'Rina Wahyuni (Unit Reaksi Cepat DLH)',
    role: 'PETUGAS',
    kecamatan: 'Bogor Timur',
    kelurahan: 'Baranangsiang',
    phone: '081288993344',
    contributionPoints: 500,
    reputationLevel: 'GOLD',
    isVerifiedReporter: true,
  },
  {
    email: 'petugas.bpbd@bogor.go.id',
    password: 'Petugas123!',
    name: 'Doni Saputra (Satgas Reaksi Bencana BPBD)',
    role: 'PETUGAS',
    kecamatan: 'Bogor Selatan',
    kelurahan: 'Empang',
    phone: '081288994455',
    contributionPoints: 520,
    reputationLevel: 'GOLD',
    isVerifiedReporter: true,
  },

  // 3. ADMINISTRATOR SISTEM (Role: ADMIN)
  {
    email: 'admin@aspira.bogor.go.id',
    password: 'Admin123!',
    name: 'Administrator Kota Bogor',
    role: 'ADMIN',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Pabaton',
    phone: '0251-8321000',
    contributionPoints: 1200,
    reputationLevel: 'DIAMOND',
    isVerifiedReporter: true,
  },

  // 4. WARGA BIASA CONTOH (Role: USER)
  {
    email: 'warga@aspira.id',
    password: 'Warga123!',
    name: 'Rahmat Hidayat',
    role: 'USER',
    kecamatan: 'Bogor Tengah',
    kelurahan: 'Pabaton',
    phone: '081234567890',
    contributionPoints: 150,
    reputationLevel: 'SILVER',
    isVerifiedReporter: true,
  },
];

let isSeeding = false;
let hasSeededOnce = false;

/**
 * Ensures all standard official accounts exist in the database.
 * Idempotent: safe to run multiple times without corrupting existing data.
 */
export async function ensureOfficialUsers() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const salt = await bcrypt.genSalt(10);

    for (const acc of OFFICIAL_DEFAULT_ACCOUNTS) {
      const existing = await prisma.user.findUnique({
        where: { email: acc.email.toLowerCase() },
      });

      const passwordHash = await bcrypt.hash(acc.password, salt);

      if (!existing) {
        await prisma.user.create({
          data: {
            email: acc.email.toLowerCase(),
            passwordHash,
            name: acc.name,
            role: acc.role,
            kecamatan: acc.kecamatan,
            kelurahan: acc.kelurahan,
            phone: acc.phone,
            contributionPoints: acc.contributionPoints ?? 0,
            reputationLevel: acc.reputationLevel ?? 'BRONZE',
            isVerifiedReporter: acc.isVerifiedReporter ?? false,
          },
        });
        console.log(`[seed-users] Created default account: ${acc.email} (${acc.role})`);
      } else {
        // If password does not match or role differs, update it to ensure login works
        const passwordMatches = await bcrypt.compare(acc.password, existing.passwordHash);
        if (!passwordMatches || existing.role !== acc.role) {
          await prisma.user.update({
            where: { email: acc.email.toLowerCase() },
            data: {
              passwordHash,
              role: acc.role,
              name: existing.name || acc.name,
            },
          });
          console.log(`[seed-users] Synchronized account credentials: ${acc.email} (${acc.role})`);
        }
      }
    }
    hasSeededOnce = true;
  } catch (err) {
    console.error('[seed-users] Error ensuring official accounts:', err);
  } finally {
    isSeeding = false;
  }
}
