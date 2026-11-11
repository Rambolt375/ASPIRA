'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Clock,
  HardHat,
  Shield,
  UserCheck,
  Mail,
  Sparkles,
  AlertCircle,
  Info,
  Send,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import { REPORT_STATUSES, STATUS_PIPELINE, SEVERITY_LEVELS } from '@/constants/categories';
import { STAGE_ROLES, getReportSlaInfo } from '@/constants/pipelineStages';
import { palette } from '@/constants/theme';
import { getReport } from '@/services/reports';
import type { Report, ReportStatus } from '@/types';

interface Props {
  initialReport: Report;
}

export default function ReportDetailClient({ initialReport }: Props) {
  const { user } = useAuthStore();
  const [report, setReport] = useState<Report>(initialReport);
  const [sliderPos, setSliderPos] = useState(50);
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>('DICEK');
  const [statusNote, setStatusNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [agencyName, setAgencyName] = useState(report.assignedAgency || 'Dinas PUPR Kota Bogor');
  const [error, setError] = useState<string | null>(null);

  // Notification state (email)
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);
  // Extra email recipients (CC) that the dinas can add
  const [extraEmails, setExtraEmails] = useState<string>('');

  // Check if current user already confirmed
  const userConfirmed = user ? report.communityConfirmations?.includes(user.id) : false;

  // Before & After photos
  const beforePhoto =
    report.photoUrls?.[0] ||
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80';
  const afterPhoto =
    report.media?.find((m) => m.isAfterPhoto)?.fileUrl ||
    report.afterPhotoUrl ||
    (report.status === 'DIATASI' || report.status === 'PENINJAUAN' || report.status === 'PERAWATAN'
      ? 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80'
      : null);

  // Send real email notification via /api/email
  async function sendNotificationEmail(opts: {
    type: 'REPORT_CONFIRMED' | 'STATUS_UPDATE';
    newStatus?: ReportStatus;
    oldStatusLabel?: string;
    actorName?: string;
    agency?: string;
    note?: string;
    progressPercent?: number;
  }) {
    const authorEmail = report.authorEmail || user?.email;
    if (!authorEmail) return;

    setEmailSending(true);
    setEmailStatus('idle');
    try {
      const extras = extraEmails
        .split(/[,;\s]+/)
        .map((e) => e.trim())
        .filter(Boolean);

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: opts.type,
          reportId: report.id,
          ticketNumber: report.ticketNumber,
          title: report.title,
          authorName: report.authorName,
          authorEmail,
          extraEmails: extras,
          category: report.category,
          address: report.address,
          oldStatusLabel: opts.oldStatusLabel,
          newStatus: opts.newStatus,
          actorName: opts.actorName,
          agency: opts.agency,
          note: opts.note,
          progressPercent: opts.progressPercent,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setEmailStatus('sent');
        setEmailStatusMsg(`✅ Email notifikasi terkirim ke ${json.deliveredTo || authorEmail}`);
      } else {
        setEmailStatus('error');
        setEmailStatusMsg(`⚠️ Email gagal: ${json.error}`);
      }
    } catch {
      setEmailStatus('error');
      setEmailStatusMsg('⚠️ Tidak dapat mengirim email.');
    } finally {
      setEmailSending(false);
      setTimeout(() => { setEmailStatus('idle'); setEmailStatusMsg(null); }, 6000);
    }
  }

  // Citizen confirms condition
  async function handleConfirm() {
    if (!user) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${report.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error('Gagal mencatat konfirmasi.');

      setReport((prev) => ({
        ...prev,
        communityConfirmations: [...(prev.communityConfirmations || []), user.id],
      }));
      setConfirmSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setConfirming(false);
    }
  }

  // Petugas status transition
  async function handleStatusTransition() {
    if (!user) return;
    setTransitioning(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          actorId: user.id,
          note: statusNote || `Status diperbarui menjadi ${REPORT_STATUSES[newStatus]?.label ?? newStatus}`,
          evidencePhotoUrl: evidenceUrl || undefined,
          assignedAgency: agencyName,
        }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status laporan.');

      // Refresh report data via getReport so all relational fields and timestamps are mapped correctly
      const updatedReport = await getReport(report.id);
      if (updatedReport) {
        setReport(updatedReport);
      }

      // Send real email notification to reporter
      const oldStatusLabel = REPORT_STATUSES[report.status]?.label ?? report.status;
      const nextPipelineIdx = STATUS_PIPELINE.indexOf(newStatus);
      const nextProgressPercent = Math.round(((nextPipelineIdx + 1) / STATUS_PIPELINE.length) * 100);
      void sendNotificationEmail({
        type: 'STATUS_UPDATE',
        newStatus,
        oldStatusLabel,
        actorName: user.name || user.email,
        agency: agencyName,
        note: statusNote || undefined,
        progressPercent: nextProgressPercent,
      });

      setStatusNote('');
      setEvidenceUrl('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status.');
    } finally {
      setTransitioning(false);
    }
  }

  // Active step & progress calculation
  const currentPipelineIdx = STATUS_PIPELINE.indexOf(report.status);
  const isSpecialStatus = report.status === 'DITOLAK' || report.status === 'DIBUKA_KEMBALI';
  const progressPercent = isSpecialStatus
    ? STAGE_ROLES[report.status].progressPercent
    : Math.round(((currentPipelineIdx + 1) / STATUS_PIPELINE.length) * 100);

  const currentStageMeta = STAGE_ROLES[report.status] || STAGE_ROLES.DITERIMA;
  const slaInfo = getReportSlaInfo(report.status, report.slaDeadline);
  const isOfficerOrAdmin = user && (user.role === 'PETUGAS' || user.role === 'ADMIN');

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-8">
      {/* Email status toast */}
      {emailStatusMsg && (
        <div className={`fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full rounded-2xl p-4 shadow-2xl border flex items-start gap-3 animate-in slide-in-from-top-4 duration-300 ${emailStatus === 'sent' ? 'bg-emerald-900 border-emerald-500/40 text-white' : 'bg-red-900 border-red-500/40 text-white'}`}>
          <Mail className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-xs font-medium leading-snug">{emailStatusMsg}</span>
          <button onClick={() => setEmailStatusMsg(null)} className="ml-auto text-slate-300 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link href="/beranda" className="hover:text-emerald-600 flex items-center gap-1 font-medium">
          ← Kembali ke Beranda
        </Link>
        <span className="font-mono bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
          {report.ticketNumber}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. HIGH-VISIBILITY PROGRESS TRACKER BAR & SLA CARD                         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/30 space-y-6">
        {/* Top Header: Progress Status, SLA Badge & Live Notification Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-emerald-950 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {progressPercent}% Progres Selesai
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (Tahap {isSpecialStatus ? 'Khusus' : `${currentPipelineIdx + 1} dari ${STATUS_PIPELINE.length}`})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 pt-1">
              <span>{currentStageMeta.icon}</span>
              <span>{currentStageMeta.label}</span>
            </h2>
          </div>

          {/* SLA Badge & Notification Trigger */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Prominent SLA Badge */}
            <div
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
                slaInfo.isUrgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0 text-emerald-400" />
              <div>
                <span className="block leading-tight">{slaInfo.badgeText}</span>
                {slaInfo.timeRemainingText && (
                  <span className="text-[10px] text-slate-400 font-normal block">
                    {slaInfo.timeRemainingText}
                  </span>
                )}
              </div>
            </div>

            {/* Email Notification Status Badge */}
            <div className="px-3 py-1.5 rounded-2xl bg-white/10 text-white border border-white/20 text-xs font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Notifikasi Email:</span>
              <span className="text-emerald-300 font-mono text-[11px] truncate max-w-[150px]">
                {report.authorEmail || user?.email || 'Terkoneksi'}
              </span>
            </div>
          </div>
        </div>

        {/* High-Visibility Gradient Progress Tracker Bar */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 sm:hidden">
            <span className="font-semibold text-slate-400">Tahap {currentPipelineIdx + 1} dari 8:</span>
            <span className="font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px]">
              {REPORT_STATUSES[report.status]?.label ?? report.status}
            </span>
          </div>
          <div className="relative w-full h-4 sm:h-5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner border border-slate-700/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 ease-out relative shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Stepper Node Indicators on Progress Bar */}
          <div className="hidden sm:grid grid-cols-8 gap-1 pt-1 text-center">
            {STATUS_PIPELINE.map((st, idx) => {
              const isPast = currentPipelineIdx > idx;
              const isCurrent = report.status === st;

              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full mb-1 flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-emerald-400 ring-4 ring-emerald-400/30 scale-125'
                        : isPast
                        ? 'bg-emerald-600'
                        : 'bg-slate-700'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold leading-tight line-clamp-1 ${
                      isCurrent
                        ? 'text-emerald-300 font-bold'
                        : isPast
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {idx + 1}. {REPORT_STATUSES[st]?.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transparent Pemeriksa Role Card: Anti-Red Tape Clarification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Active PIC / Pemeriksa */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
              {currentStageMeta.roleType === 'PETUGAS_LAPANGAN' ? (
                <HardHat className="w-5 h-5 text-amber-400" />
              ) : currentStageMeta.roleType === 'PENGAWAS_WARGA' ? (
                <UserCheck className="w-5 h-5 text-purple-400" />
              ) : (
                <Shield className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 block">Pemeriksa & Penanggung Jawab:</span>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentStageMeta.roleName}</span>
              </p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 font-semibold border border-white/10">
                {currentStageMeta.roleBadge}
              </span>
            </div>
          </div>

          {/* Action Objective (Mengapa tahap ini ada?) */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 md:col-span-2 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-emerald-300 font-semibold block">
                Fungsi Tahap Ini (Bukan Birokrasi Berbelit):
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStageMeta.roleDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Quick notification status banner */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">
              Notifikasi email:{' '}
              <strong className="text-blue-300">
                {report.authorEmail || user?.email || 'email pelapor'}
              </strong>
            </span>
          </div>
          {emailSending && (
            <span className="text-xs text-emerald-300 animate-pulse">📧 Mengirim email…</span>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* MAIN REPORT DETAIL CARD                                                    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Title and Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${palette.status[report.status]}`}>
              {REPORT_STATUSES[report.status]?.label ?? report.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {report.category}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                report.severity === 'KRITIS'
                  ? 'bg-red-100 text-red-700'
                  : report.severity === 'TINGGI'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Urgensi: {SEVERITY_LEVELS[report.severity]?.label ?? report.severity}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {report.title}
          </h1>

          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <span>📍 {report.address || 'Kota Bogor'}</span>
            {report.kecamatan && <span>• Kec. {report.kecamatan}</span>}
          </p>
        </div>

        {/* Description */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
          {report.description}
        </div>

        {/* SLA and Agency Details */}
        {(report.assignedAgency || report.slaDeadline) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
            {report.assignedAgency && (
              <div>
                <span className="text-slate-500 block mb-0.5">Instansi Penanggung Jawab:</span>
                <p className="font-bold text-emerald-950 text-sm">{report.assignedAgency}</p>
              </div>
            )}
            {report.slaDeadline && (
              <div>
                <span className="text-slate-500 block mb-0.5">Target Waktu Penyelesaian (SLA):</span>
                <p className="font-bold text-emerald-950 text-sm">
                  {new Date(report.slaDeadline).toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Photo Proof / Before-After Interactive Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {afterPhoto ? 'Bukti Foto: Komparasi Sebelum vs Sesudah' : 'Bukti Foto Lapangan'}
            </h3>
            {report.verification && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Skor Keaslian AI: {Math.round(report.verification.authenticityScore * 100)}%
              </span>
            )}
          </div>

          {afterPhoto ? (
            /* Interactive Slider */
            <div className="space-y-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 select-none bg-slate-900">
                {/* After Photo (Full) */}
                <img src={afterPhoto} alt="Sesudah" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  Sesudah (Perbaikan)
                </div>

                {/* Before Photo (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={beforePhoto}
                    alt="Sebelum"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    Sebelum (Kerusakan)
                  </div>
                </div>

                {/* Slider divider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                    ↔
                  </div>
                </div>
              </div>

              {/* Slider Input Control */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-center text-xs text-slate-400">
                Geser tombol untuk membandingkan kondisi fisik sebelum dan sesudah penanganan
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
              <img src={beforePhoto} alt="Bukti Lapangan" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Citizen Confirmation Banner */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              👥 {report.communityConfirmations?.length || 0} Warga Telah Mengonfirmasi Kondisi Ini
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Konfirmasi warga mempercepat eskalasi dinas dan mencegah fenomena aduan diabaikan.
            </p>
          </div>

          {user && !userConfirmed && (
            <Button
              type="button"
              variant="outline"
              disabled={confirming || confirmSuccess}
              onClick={handleConfirm}
            >
              {confirmSuccess
                ? '✓ Dikonfirmasi (+10 Poin)'
                : confirming
                ? 'Mencatat...'
                : 'Konfirmasi Saya Melihat Ini (+10 Poin)'}
            </Button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. 8-STAGE STEPPER WITH EXPLICIT PEMERIKSA ROLES                           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Alur Siklus Penanganan 8-Tahap Terbuka</h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Transparansi Anti-Birokrasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap peran didefinisikan secara eksplisit untuk menjamin akuntabilitas tanpa memperpanjang rantai birokrasi.
          </p>
        </div>

        {/* 8-Stage Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STATUS_PIPELINE.map((st, idx) => {
            const isCompleted = currentPipelineIdx >= idx;
            const isCurrent = report.status === st;
            const meta = STAGE_ROLES[st];

            return (
              <div
                key={st}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-100 bg-slate-50/50 opacity-70'
                }`}
              >
                {/* Stage header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs">{meta.icon}</span>
                </div>

                {/* Stage Name */}
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-emerald-950 font-extrabold' : 'text-slate-800'
                    }`}
                  >
                    {REPORT_STATUSES[st]?.label ?? st}
                  </h4>

                  {/* Explicit Role Badge */}
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeColor}`}
                    >
                      {meta.roleBadge}
                    </span>
                  </div>
                </div>

                {/* Role Name & Explanation */}
                <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
                  <p className="text-slate-500 text-[10px]">Pemeriksa / Penanggung Jawab:</p>
                  <p className="font-semibold text-slate-800 leading-tight">{meta.roleName}</p>
                  <p className="text-slate-400 text-[10px] leading-snug line-clamp-2">
                    {meta.roleDescription}
                  </p>
                </div>

                {/* SLA target */}
                <div className="text-[10px] text-emerald-700 font-semibold bg-white/80 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>{meta.slaDefault}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ────────────────────────────────────────────────────────────────────────── */}
        {/* 3. APPEND-ONLY HISTORICAL AUDIT TRAIL WITH ROLE DISTINCTION               */}
        {/* ────────────────────────────────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Linimasa Riwayat Audit Terverifikasi (Append-Only)
              </h3>
              <p className="text-xs text-slate-400">
                Setiap pergantian status dicatat permanen lengkap dengan peran pemeriksa dan bukti lapangan.
              </p>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
              {report.statusHistory?.length || 0} Entri Tercatat
            </span>
          </div>

          <div className="relative border-l-2 border-emerald-200 ml-4 space-y-6 pl-6">
            {(report.statusHistory || []).map((entry, idx) => {
              // Support both mapped properties (status, timestamp) and raw Prisma fields (newStatus, createdAt)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const raw = entry as any;
              const statusVal = (entry.status || raw.newStatus || 'DITERIMA') as ReportStatus;
              const timeVal = entry.timestamp || raw.createdAt || raw.updatedAt;
              const meta = STAGE_ROLES[statusVal] || STAGE_ROLES.DITERIMA;
              const actorName = entry.actorName || raw.actor?.name;
              const photo = entry.photoUrl || raw.evidencePhotoUrl;

              let formattedDate = '-';
              if (timeVal) {
                const d = new Date(timeVal);
                formattedDate = !isNaN(d.getTime())
                  ? d.toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-';
              }

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white shadow-sm" />

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-emerald-300 transition-colors">
                    {/* Header: Status & Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {REPORT_STATUSES[statusVal]?.label ?? statusVal}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeColor}`}
                        >
                          {meta.roleBadge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Pemeriksa Role Highlight */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[11px]">Entitas Pemeriksa:</span>
                      <strong className="text-slate-800 font-semibold">{meta.roleName}</strong>
                      {actorName && (
                        <span className="text-slate-500 text-[11px]">({actorName})</span>
                      )}
                    </div>

                    {/* Note */}
                    {entry.note && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                        {entry.note}
                      </p>
                    )}

                    {/* Evidence Photo */}
                    {photo && (
                      <div className="mt-2 w-36 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                        <img src={photo} alt="Bukti status" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. ADMIN / PETUGAS OFFICIAL TRANSITION PANEL                               */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {isOfficerOrAdmin && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <h2 className="text-base font-bold">Panel Tindakan Resmi Petugas Dinas</h2>
                <p className="text-xs text-slate-400">
                  Pembaruan status resmi akan dicatat permanen dalam audit trail & mengirim notifikasi instan ke warga.
                </p>
              </div>
            </div>

            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
              Otoritas Terverifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Status Baru</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
              >
                {STATUS_PIPELINE.map((st) => (
                  <option key={st} value={st}>
                    {STAGE_ROLES[st]?.stepNumber}. {REPORT_STATUSES[st]?.label ?? st} ({STAGE_ROLES[st]?.roleBadge})
                  </option>
                ))}
                <option value="DITOLAK">Ditolak</option>
                <option value="DIBUKA_KEMBALI">Dibuka Kembali</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instansi Penanggung Jawab</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Pengerjaan / Alasan Resmi</label>
            <textarea
              rows={2}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Jelaskan progres perbaikan teknis atau catatan dinas..."
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
            />
          </div>

          {newStatus === 'DIATASI' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Foto Bukti Pengerjaan Selesai (Wajib di status DIATASI)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            <div className="space-y-2 w-full">
              {/* CC email field */}
              <label className="block text-xs font-semibold text-slate-300">
                📧 Kirim Notifikasi Email Ke (opsional, pisah dengan koma)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={extraEmails}
                  onChange={(e) => setExtraEmails(e.target.value)}
                  placeholder={`${report.authorEmail || user?.email || 'email pelapor'} (default) + tambah email lain…`}
                  className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Email pelapor ({report.authorEmail || user?.email || '—'}) selalu diikutsertakan secara otomatis.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Email notifikasi otomatis terkirim saat status disimpan.</span>
            </div>

            <button
              type="button"
              disabled={transitioning}
              onClick={handleStatusTransition}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{transitioning ? 'Menyimpan...' : 'Perbarui Status & Kirim Email →'}</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
