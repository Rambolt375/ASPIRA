'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Mail,
  Smartphone,
  X,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { REPORT_STATUSES } from '@/constants/categories';
import { STAGE_ROLES } from '@/constants/pipelineStages';
import type { Report, ReportStatus } from '@/types';

export interface NotificationDispatch {
  id: string;
  channel: 'WHATSAPP' | 'EMAIL';
  recipient: string;
  statusTrigger: ReportStatus;
  title: string;
  message: string;
  timestamp: string;
  delivered: boolean;
  read: boolean;
  actorRole: string;
  assignedAgency?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  dispatches: NotificationDispatch[];
  onTriggerSimulate: (status: ReportStatus, channel: 'WHATSAPP' | 'EMAIL' | 'BOTH') => void;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  onToggleWhatsapp: (enabled: boolean) => void;
  onToggleEmail: (enabled: boolean) => void;
  userPhone?: string;
  userEmail?: string;
}

export default function NotificationSimulatorModal({
  isOpen,
  onClose,
  report,
  dispatches,
  onTriggerSimulate,
  whatsappEnabled,
  emailEnabled,
  onToggleWhatsapp,
  onToggleEmail,
  userPhone = '+62 812-9844-8891',
  userEmail = 'pelapor@kotabogor.go.id',
}: Props) {
  const [activeTab, setActiveTab] = useState<'PREVIEW_WA' | 'PREVIEW_EMAIL' | 'LOGS' | 'SETTINGS'>('PREVIEW_WA');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(report.status);
  const [testSentToast, setTestSentToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStage = STAGE_ROLES[report.status] || STAGE_ROLES.DITERIMA;

  function handleSendTest(channel: 'WHATSAPP' | 'EMAIL' | 'BOTH') {
    onTriggerSimulate(selectedStatus, channel);
    setTestSentToast(
      channel === 'WHATSAPP'
        ? 'Notifikasi WhatsApp berhasil dikirim ke gateway simulasi!'
        : channel === 'EMAIL'
        ? 'Email pemberitahuan berhasil dikirim ke antrean SMTP!'
        : 'Dispatched ke WhatsApp & Email!'
    );
    setTimeout(() => setTestSentToast(null), 3500);
  }

  // Latest WA dispatch for preview
  const latestWaDispatch = dispatches.find((d) => d.channel === 'WHATSAPP') || {
    id: 'default-wa',
    channel: 'WHATSAPP' as const,
    recipient: userPhone,
    statusTrigger: report.status,
    title: `Pembaruan Laporan #${report.ticketNumber}`,
    message: `Halo Bapak/Ibu ${report.authorName},\n\nLaporan infrastruktur Anda *"${report.title}"* telah diperbarui statusnya menjadi *${REPORT_STATUSES[report.status]?.label ?? report.status}*.\n\n👷 *Penanggung Jawab / Pemeriksa:*\n${currentStage.roleName} (${currentStage.roleBadge})\n\n🏢 *Instansi Terkait:*\n${report.assignedAgency || 'Dinas PUPR Kota Bogor'}\n\n⏱️ *SLA Pengerjaan:*\n${currentStage.slaDefault}\n\n🔍 Anda dapat memantau linimasa riwayat fisik & foto pengerjaan di tautan resmi ASPIRA:\nhttps://aspira.kotabogor.go.id/laporan/${report.id}\n\n_Pemerintah Kota Bogor — Transparansi Pelayanan Publik_`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    delivered: true,
    read: true,
    actorRole: currentStage.roleName,
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150 mobile-gpu-layer"
      style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88dvh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bell className="w-5 h-5 text-emerald-200 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Simulasi Notifikasi Instan Warga</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-emerald-950 uppercase tracking-wider">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Pemberitahuan real-time otomatis saat status laporan beralih tangan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating toast notification */}
        {testSentToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{testSentToast}</span>
          </div>
        )}

        {/* Quick Channels Bar & Preferences */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            {/* WhatsApp toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => onToggleWhatsapp(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Instan
                <span className="text-[10px] text-slate-400 font-normal">({userPhone})</span>
              </span>
            </label>

            {/* Email toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => onToggleEmail(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email Laporan
                <span className="text-[10px] text-slate-400 font-normal">({userEmail})</span>
              </span>
            </label>
          </div>

          <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Gateway Terhubung: Kota Bogor SMS/WA Hub
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 pt-2">
          <button
            onClick={() => setActiveTab('PREVIEW_WA')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'PREVIEW_WA'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Simulasi WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('PREVIEW_EMAIL')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'PREVIEW_EMAIL'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            Simulasi Email
          </button>
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'LOGS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Riwayat Dispatch ({dispatches.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 space-y-4">
          {/* TAB 1: WhatsApp Preview */}
          {activeTab === 'PREVIEW_WA' && (
            <div className="max-w-md mx-auto space-y-3">
              {/* WhatsApp App Mock Frame */}
              <div className="rounded-2xl shadow-lg border border-slate-300 overflow-hidden bg-[#efeae2]">
                {/* WA Top Bar */}
                <div className="bg-[#075e54] text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-xs border border-white/20">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold leading-tight">
                        ASPIRA Kota Bogor
                        <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1">✓</span>
                      </div>
                      <span className="text-[10px] text-emerald-200">Akun Resmi Layanan Publik</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-200 font-mono">Resmi</span>
                </div>

                {/* WA Chat Canvas */}
                <div className="p-4 space-y-3 min-h-[300px]">
                  {/* Date Pill */}
                  <div className="text-center">
                    <span className="bg-white/80 backdrop-blur-sm text-[10px] font-semibold text-slate-600 px-3 py-1 rounded-full shadow-sm">
                      HARI INI
                    </span>
                  </div>

                  {/* WA Message Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm text-xs text-slate-800 space-y-2 border border-slate-200/60 max-w-[95%]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        📢 Update Status Laporan
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {report.ticketNumber}
                      </span>
                    </div>

                    <p className="whitespace-pre-line text-[11.5px] leading-relaxed text-slate-700">
                      {latestWaDispatch.message}
                    </p>

                    {/* WhatsApp Quick Action Button */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-center font-bold text-[11px] border border-emerald-200 flex items-center justify-center gap-1">
                        <span>Lihat Bukti Lapangan & Komparasi Foto</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Timestamp & double ticks */}
                    <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-slate-400">
                      <span>{latestWaDispatch.timestamp}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                💡 Pesan otomatis langsung terkirim ke WhatsApp warga dalam hitungan detik setelah petugas memperbarui status.
              </p>
            </div>
          )}

          {/* TAB 2: Email Preview */}
          {activeTab === 'PREVIEW_EMAIL' && (
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              {/* Email Client Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dari:</span>
                  <span className="font-semibold text-slate-800">
                    ASPIRA Kota Bogor &lt;notifikasi@aspira.kotabogor.go.id&gt;
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kepada:</span>
                  <span className="font-semibold text-slate-800">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subjek:</span>
                  <span className="font-bold text-slate-900">
                    [ASPIRA] Pembaruan Penanganan Laporan #{report.ticketNumber}
                  </span>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="p-6 space-y-4 text-xs text-slate-700">
                {/* Government Banner */}
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Pemerintah Kota Bogor</h4>
                      <p className="text-[10px] text-slate-500">Platform Transparansi & Pengaduan Fasilitas Publik</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Laporan Aktif
                  </span>
                </div>

                <p>Halo <strong>{report.authorName}</strong>,</p>
                <p>
                  Terima kasih atas kepedulian Anda terhadap fasilitas publik Kota Bogor. Laporan Anda mengenai:
                </p>

                {/* Report Summary Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900 text-sm">{report.title}</p>
                  <p className="text-slate-500 text-[11px]">📍 {report.address}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Status Terkini: {REPORT_STATUSES[report.status]?.label ?? report.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                      {report.category}
                    </span>
                  </div>
                </div>

                {/* Role and Next Step clarity */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span>Langkah Penanganan Saat Ini:</span>
                  </div>
                  <p className="text-[11.5px] text-amber-950 font-semibold">
                    {currentStage.roleName} ({currentStage.roleBadge})
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {currentStage.roleDescription}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-md">
                    Buka Riwayat Penanganan & Bukti Foto
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center pt-2">
                  Email ini dikirim secara otomatis oleh Sistem Integrasi Pelayanan Publik ASPIRA Kota Bogor.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Dispatch Logs */}
          {activeTab === 'LOGS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">Log Transmisi Real-Time ({dispatches.length} Catatan)</span>
                <span className="text-[11px] text-slate-400">Diurutkan dari terbaru</span>
              </div>

              {dispatches.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Belum ada transmisi notifikasi yang tercatat untuk laporan ini.
                </div>
              ) : (
                <div className="space-y-2">
                  {dispatches.map((item) => {
                    const st = STAGE_ROLES[item.statusTrigger] || STAGE_ROLES.DITERIMA;
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`p-2 rounded-xl text-xs flex items-center justify-center ${
                              item.channel === 'WHATSAPP'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.channel === 'WHATSAPP' ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </span>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{item.title}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${st.badgeColor}`}
                              >
                                {REPORT_STATUSES[item.statusTrigger]?.label ?? item.statusTrigger}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Tujuan: <span className="font-mono text-slate-700">{item.recipient}</span> • Penanggung
                              Jawab: {item.actorRole}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block">{item.timestamp}</span>
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                            <CheckCheck className="w-3 h-3" />
                            Terkirim
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls: Interactive Simulation Trigger */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-700 shrink-0">Tes Transisi Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold outline-none focus:border-emerald-500"
            >
              <option value="DITERIMA">1. DITERIMA (Validasi AI)</option>
              <option value="VERIFIKASI">2. VERIFIKASI (Helpdesk)</option>
              <option value="DICEK">3. DICEK (Petugas Teknis Lapangan)</option>
              <option value="DITUGASKAN">4. DITUGASKAN (Penerbitan SPK)</option>
              <option value="DALAM_PENANGANAN">5. DALAM_PENANGANAN (Dinas Pelaksana)</option>
              <option value="DIATASI">6. DIATASI (Kru Konstruksi Tuntas)</option>
              <option value="PENINJAUAN">7. PENINJAUAN (Pengawas Warga)</option>
              <option value="PERAWATAN">8. PERAWATAN (Pemeliharaan Berkala)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleSendTest('WHATSAPP')}
              disabled={!whatsappEnabled}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Kirim Tes WhatsApp</span>
            </button>

            <button
              onClick={() => handleSendTest('EMAIL')}
              disabled={!emailEnabled}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirim Tes Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
