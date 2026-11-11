'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { AppUser, UserRole } from '@/types';

const DEMO_PERSONAS: { role: UserRole; name: string; title: string; email: string; id: string }[] = [
  {
    role: 'PETUGAS',
    name: 'Budi Santoso',
    title: 'Dinas PUPR Kota Bogor',
    email: 'petugas@pupr.bogor.go.id',
    id: 'demo-officer-pupr',
  },
  {
    role: 'ADMIN',
    name: 'Administrator Pemkot',
    title: 'Diskominfo Kota Bogor',
    email: 'admin@aspira.bogor.go.id',
    id: 'demo-admin-pemkot',
  },
  {
    role: 'USER',
    name: 'Rahmat Hidayat',
    title: 'Warga Pelapor (Kec. Bogor Tengah)',
    email: 'warga@aspira.id',
    id: 'demo-citizen-rahmat',
  },
];

export default function RoleQuickSwitch() {
  const { user, setUser } = useAuthStore();

  function handleSwitch(persona: typeof DEMO_PERSONAS[0]) {
    const updatedUser: AppUser = {
      id: user?.id || persona.id,
      email: persona.email,
      name: persona.name,
      role: persona.role,
      kecamatan: 'Bogor Tengah',
      kelurahan: 'Pabaton',
      avatarUrl: user?.avatarUrl || null,
      createdAt: user?.createdAt || new Date().toISOString(),
    };
    setUser(updatedUser);
  }

  const isDinas = user?.role === 'PETUGAS' || user?.role === 'LOCAL_GOVERNMENT' || user?.role === 'ADMIN';

  return (
    <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hak Akses Aktif:
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                isDinas
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                {user?.role || 'USER'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {user?.name || 'Pengguna Publik'}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({user?.email || 'Tamu'})
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
            Uji Coba Persona:
          </span>
          {DEMO_PERSONAS.map((p) => {
            const isActive = user?.role === p.role;
            return (
              <button
                key={p.role}
                type="button"
                onClick={() => handleSwitch(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
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
