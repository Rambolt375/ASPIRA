'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getRoleWorkspace } from '@/lib/roles';
import type { AppUser, UserRole } from '@/types';
import type { Role } from '@prisma/client';

const DEMO_PERSONAS: { role: Role; name: string; title: string; email: string; id: string; targetWorkspace: string }[] = [
  {
    role: 'USER',
    name: 'Rahmat Hidayat',
    title: 'Warga Pelapor (Kec. Bogor Tengah)',
    email: 'warga@aspira.id',
    id: 'demo-citizen-rahmat',
    targetWorkspace: '/beranda',
  },
  {
    role: 'PETUGAS',
    name: 'Budi Santoso',
    title: 'Inspektur Lapangan (PUPR)',
    email: 'petugas@pupr.bogor.go.id',
    id: 'demo-officer-pupr',
    targetWorkspace: '/petugas',
  },
  {
    role: 'LOCAL_GOVERNMENT',
    name: 'Hendra Wijaya',
    title: 'Dinas PUPR Kota Bogor',
    email: 'dinas@kotabogor.go.id',
    id: 'demo-dinas-pupr',
    targetWorkspace: '/dinas',
  },
  {
    role: 'ADMIN',
    name: 'Administrator Pemkot',
    title: 'Diskominfo Kota Bogor',
    email: 'admin@aspira.bogor.go.id',
    id: 'demo-admin-pemkot',
    targetWorkspace: '/admin',
  },
];

export default function RoleQuickSwitch() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  async function handleSwitch(persona: typeof DEMO_PERSONAS[0]) {
    const updatedUser: AppUser = {
      id: user?.id || persona.id,
      email: persona.email,
      name: persona.name,
      role: persona.role as UserRole,
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Pabaton',
      avatarUrl: user?.avatarUrl || null,
      createdAt: user?.createdAt || new Date().toISOString(),
    };
    setUser(updatedUser);

    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: persona.role, id: persona.id }),
      });
    } catch {
      // Continue even if network glitch
    }

    const workspace = getRoleWorkspace(persona.role);
    router.push(workspace);
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/60 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Mode Evaluasi Juri & Pengujian Peran
            </p>
            <p className="text-sm font-bold text-white">
              Login Aktif:{' '}
              <span className="text-emerald-400">
                {user?.name || 'Belum Login'}
              </span>{' '}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {user?.role || 'GUEST'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1 hidden md:inline">Ganti Peran:</span>
          {DEMO_PERSONAS.map((p) => {
            const isActive = user?.role === p.role;
            return (
              <button
                key={p.role}
                onClick={() => handleSwitch(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {p.name} ({p.role})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
