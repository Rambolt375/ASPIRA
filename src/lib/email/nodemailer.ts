/**
 * ASPIRA Email Service — powered by Nodemailer (Gmail SMTP)
 *
 * Mengirimkan email asli dari akun Google resmi pengembang / instansi
 * tanpa batasan domain atau pembatasan daftar pengujian.
 */

import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || 'reyza1098@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL =
  process.env.SMTP_FROM || `ASPIRA Kota Bogor <${SMTP_USER}>`;

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; deliveredTo?: string; error?: string }> {
  if (!SMTP_PASS) {
    console.warn('[ASPIRA Email] SMTP_PASS belum dikonfigurasi.');
    return {
      ok: false,
      error: 'SMTP_PASS (Sandi Aplikasi Google) belum dikonfigurasi.',
    };
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const recipientList = recipients.join(', ');

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipients,
      subject: payload.subject,
      html: payload.html,
    });

    console.log(`[ASPIRA Email] Terkirim ke [${recipientList}]:`, info.messageId);
    return { ok: true, deliveredTo: recipientList };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown SMTP error';
    console.error('[ASPIRA Email] Gagal kirim email via SMTP:', msg);
    return { ok: false, error: msg };
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ASPIRA Kota Bogor</title>
  <style>
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 28px 32px; }
    .header-title { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .header-sub { color: #6ee7b7; font-size: 12px; margin: 4px 0 0 0; }
    .body { padding: 28px 32px; }
    .ticket { display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 8px; margin-bottom: 16px; }
    .status-badge { display: inline-block; background: #047857; color: #fff; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 50px; margin: 8px 0 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 600; text-align: right; max-width: 65%; }
    .note-box { background: #f8fafc; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #334155; line-height: 1.6; }
    .cta { display: block; background: #059669; color: #ffffff !important; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 50px; font-weight: 700; font-size: 14px; margin: 24px 0 8px 0; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="header-title">🏙️ ASPIRA Kota Bogor</p>
      <p class="header-sub">Platform Pelaporan Infrastruktur &amp; Transparansi Kota</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      Email resmi ini dikirimkan melalui gerbang komunikasi ASPIRA Kota Bogor.<br/>
      Jangan balas email ini — untuk tindak lanjut, kunjungi portal resmi ASPIRA.<br/>
      © 2026 Pemerintah Kota Bogor — ASPIRA
    </div>
  </div>
</body>
</html>`;
}

/** Email konfirmasi saat laporan pertama kali diterima sistem */
export function buildReportConfirmationEmail(opts: {
  authorName: string;
  ticketNumber: string;
  title: string;
  category: string;
  address: string;
  reportUrl: string;
}): string {
  return baseLayout(`
    <p style="font-size:15px; color:#0f172a; font-weight:600; margin:0 0 4px 0;">
      Halo, ${opts.authorName}! 👋
    </p>
    <p style="font-size:13px; color:#475569; margin:0 0 20px 0;">
      Laporan infrastruktur Anda telah <strong>berhasil diterima</strong> oleh sistem ASPIRA Kota Bogor.
    </p>

    <div class="ticket">${opts.ticketNumber}</div>
    <div class="status-badge">✅ DITERIMA SISTEM</div>

    <div>
      <div class="info-row"><span class="info-label">Judul Laporan</span><span class="info-value">${opts.title}</span></div>
      <div class="info-row"><span class="info-label">Kategori</span><span class="info-value">${opts.category}</span></div>
      <div class="info-row"><span class="info-label">Lokasi</span><span class="info-value">${opts.address}</span></div>
    </div>

    <div class="note-box">
      📋 Laporan Anda sedang dalam antrean verifikasi awal oleh tim ASPIRA. Anda akan menerima pembaruan email setiap kali status laporan berubah.
    </div>

    <a class="cta" href="${opts.reportUrl}">Pantau Status Laporan →</a>
  `);
}

/** Email notifikasi saat dinas/petugas update status laporan */
export function buildStatusUpdateEmail(opts: {
  authorName: string;
  ticketNumber: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  newStatusLabel: string;
  actorName: string;
  agency: string;
  note?: string;
  reportUrl: string;
  progressPercent: number;
}): string {
  return baseLayout(`
    <p style="font-size:15px; color:#0f172a; font-weight:600; margin:0 0 4px 0;">
      Halo, ${opts.authorName}!
    </p>
    <p style="font-size:13px; color:#475569; margin:0 0 20px 0;">
      Ada pembaruan resmi dari Dinas terkait laporan infrastruktur Anda.
    </p>

    <div class="ticket">${opts.ticketNumber}</div>
    <div class="status-badge">🔄 ${opts.newStatusLabel}</div>

    <div>
      <div class="info-row"><span class="info-label">Judul Laporan</span><span class="info-value">${opts.title}</span></div>
      <div class="info-row"><span class="info-label">Status Sebelumnya</span><span class="info-value">${opts.oldStatus}</span></div>
      <div class="info-row"><span class="info-label">Status Sekarang</span><span class="info-value" style="color:#059669;">${opts.newStatusLabel}</span></div>
      <div class="info-row"><span class="info-label">Diperbarui Oleh</span><span class="info-value">${opts.actorName}</span></div>
      <div class="info-row"><span class="info-label">Instansi</span><span class="info-value">${opts.agency}</span></div>
      <div class="info-row"><span class="info-label">Progres Penanganan</span><span class="info-value">${opts.progressPercent}% selesai</span></div>
    </div>

    ${opts.note ? `<div class="note-box">📝 Catatan Resmi Dinas:<br/><strong>${opts.note}</strong></div>` : ''}

    <a class="cta" href="${opts.reportUrl}">Lihat Detail &amp; Linimasa Lengkap →</a>
  `);
}
