'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import RoleQuickSwitch from '@/components/dinas/RoleQuickSwitch';
import type { Role } from '@prisma/client';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  kecamatan?: string | null;
  kelurahan?: string | null;
  phone?: string | null;
  contributionPoints: number;
  reputationLevel: string;
  createdAt: string;
  _count: {
    reports: number;
    posts: number;
  };
}

interface AuditLogItem {
  id: string;
  previousStatus?: string | null;
  newStatus: string;
  note?: string | null;
  createdAt: string;
  report: {
    id: string;
    ticketNumber: string;
    title: string;
    category: string;
    assignedAgency?: string | null;
  };
  actor: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
}

const ROLES_LIST: (Role | 'SEMUA')[] = ['SEMUA', 'USER', 'PETUGAS', 'LOCAL_GOVERNMENT', 'ADMIN'];

export default function AdminControlPage() {
  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT'>('USERS');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    roleCounts: { USER: 0, PETUGAS: 0, LOCAL_GOVERNMENT: 0, ADMIN: 0 },
    totalReports: 0,
    totalAuditLogs: 0,
    totalAnnouncements: 0,
    totalPointsIssued: 0,
  });

  // Users Tab State
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<Role | 'SEMUA'>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // User Role Modal State
  const [targetUser, setTargetUser] = useState<AdminUserItem | null>(null);
  const [newRole, setNewRole] = useState<Role>('PETUGAS');
  const [roleNote, setRoleNote] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [roleSuccessMsg, setRoleSuccessMsg] = useState<string | null>(null);

  // Audit Tab State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error('Error fetching admin stats', e);
    }
  }, [isAuthorized]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (selectedRoleFilter !== 'SEMUA') params.set('role', selectedRoleFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error('Error fetching admin users', e);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAuthorized, selectedRoleFilter, searchQuery]);

  const fetchAuditLogs = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.logs) setAuditLogs(data.logs);
    } catch (e) {
      console.error('Error fetching audit logs', e);
    } finally {
      setLoadingAudit(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      await Promise.all([fetchStats(), fetchUsers()]);
    });
    return () => {
      active = false;
    };
  }, [fetchStats, fetchUsers, isAuthorized]);

  useEffect(() => {
    if (activeTab !== 'AUDIT') return;
    void Promise.resolve().then(() => fetchAuditLogs());
  }, [activeTab, fetchAuditLogs]);

  async function handleUpdateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUser) return;

    setSavingRole(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          newRole,
          adminId: user?.id || 'demo-admin-pemkot',
          note: roleNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah peran pengguna.');

      setRoleSuccessMsg(`Peran akun ${targetUser.name} berhasil diperbarui menjadi ${newRole}.`);
      setTargetUser(null);
      setRoleNote('');
      fetchUsers();
      fetchStats();
      setTimeout(() => setRoleSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kendala.');
    } finally {
      setSavingRole(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RoleQuickSwitch />

        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl shadow-sm">
            ⚙️
          </div>
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Akses Terbatas
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            Pusat Kendali Khusus Administrator Pemkot
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Halaman ini eksklusif untuk peran <strong className="text-slate-800 dark:text-slate-200">ADMIN</strong> (Pengelola Hak Akses & Tata Kelola Sistem Kota Bogor). Gunakan panel simulasi peran di atas untuk menguji.
          </p>
          <div className="mt-6">
            <Link
              href="/beranda"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors inline-block"
            >
              Kembali ke Beranda Warga
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Simulator Switcher for judges */}
      <RoleQuickSwitch />

      {/* Success Notification */}
      {roleSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <span>✅</span>
          <span>{roleSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Pusat Kendali Eksekutif
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Sistem Tata Kelola ASPIRA
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Panel Administrator & Audit Kota
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Penetapan peran resmi (RBAC), pengawasan riwayat audit status laporan, dan integritas data publik.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            if (activeTab === 'USERS') fetchUsers();
            else fetchAuditLogs();
          }}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span>🔄</span> Segarkan Data
        </button>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Akun</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalUsers}</p>
          <p className="text-xs text-slate-400 mt-1">
            Warga: {stats.roleCounts.USER} | Petugas: {stats.roleCounts.PETUGAS}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Laporan Masuk</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalReports}</p>
          <p className="text-xs text-slate-400 mt-1">Kota Bogor Transparan</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Log Audit Resmi</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalAuditLogs}</p>
          <p className="text-xs text-slate-400 mt-1">Append-only status trail</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Poin Kontribusi</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalPointsIssued.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Gamifikasi warga aktif</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'USERS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          👥 Manajemen Pengguna & Hak Akses
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'AUDIT'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          📜 Log Audit Transaksi Status (Append-Only)
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Peran:</span>
              {ROLES_LIST.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedRoleFilter === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari nama, email, atau kecamatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
            {loadingUsers ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-400">Memuat basis data pengguna...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Tidak ada data pengguna ditemukan.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Pengguna</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Peran Saat Ini</th>
                    <th className="py-3 px-4">Wilayah</th>
                    <th className="py-3 px-4">Poin & Laporan</th>
                    <th className="py-3 px-4 text-right">Aksi Otorisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' :
                          u.role === 'LOCAL_GOVERNMENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' :
                          u.role === 'PETUGAS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {u.kecamatan ? `${u.kecamatan}${u.kelurahan ? `, ${u.kelurahan}` : ''}` : 'Kota Bogor'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-emerald-600">{u.contributionPoints} pts</span>
                        <span className="text-slate-400 ml-1.5">({u._count.reports} lap.)</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setTargetUser(u);
                            setNewRole(u.role);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                        >
                          Ubah Peran ⚙️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
          {loadingAudit ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">Memuat catatan log audit kota...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada riwayat audit tercatat.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">No. Tiket & Laporan</th>
                  <th className="py-3 px-4">Perubahan Status</th>
                  <th className="py-3 px-4">Aktor Bertanggung Jawab</th>
                  <th className="py-3 px-4">Catatan Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {log.report.ticketNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {log.report.title}
                      </p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-400 font-mono">{log.previousStatus || 'AWAL'}</span>
                      <span className="mx-1 text-slate-400">➔</span>
                      <span className="font-bold text-emerald-600 font-mono">{log.newStatus}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{log.actor.name}</p>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {log.actor.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Ubah Peran Pengguna */}
      {targetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Otorisasi Role-Based Access Control
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Ubah Hak Akses Akun
                </h2>
                <p className="text-xs text-slate-500">Target: {targetUser.name} ({targetUser.email})</p>
              </div>
              <button
                onClick={() => setTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Pilih Peran Baru:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USER">USER (Warga Pelapor Publik)</option>
                  <option value="PETUGAS">PETUGAS (Inspektur & Surveyor Lapangan)</option>
                  <option value="LOCAL_GOVERNMENT">LOCAL_GOVERNMENT (Dinas & OPD Pemkot)</option>
                  <option value="ADMIN">ADMIN (Administrator Sistem Pemkot)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sesuai AGENTS.md 9.3, akun dinas dan petugas hanya dapat ditetapkan oleh Administrator.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Catatan Penetapan / SK Penugasan (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={roleNote}
                  onChange={(e) => setRoleNote(e.target.value)}
                  placeholder="Contoh: Penugasan Surveyor Lapangan PUPR SK No. 821/2026"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {savingRole ? 'Menyimpan...' : 'Terapkan Peran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
