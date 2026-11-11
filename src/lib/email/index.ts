/**
 * ASPIRA Unified Email Service
 *
 * Menggunakan Resend HTTPS API (Port 443) yang tidak pernah diblokir
 * oleh firewall Railway atau penyedia cloud hosting lainnya.
 *
 * Otomatis mengalihkan penerima ke reyza1098@gmail.com jika menggunakan
 * testing domain default (onboarding@resend.dev) agar email 100% terkirim.
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'ASPIRA Kota Bogor <onboarding@resend.dev>';

const RESEND_TEST_RECIPIENT =
  process.env.RESEND_TEST_RECIPIENT || 'reyza1098@gmail.com';

const resend = new Resend(RESEND_API_KEY);

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; deliveredTo?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('[ASPIRA Email] RESEND_API_KEY tidak tersedia.');
    return { ok: false, error: 'RESEND_API_KEY belum dikonfigurasi.' };
  }

  const rawRecipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const originalToList = rawRecipients.join(', ');

  try {
    // 1. Percobaan kirim ke penerima asli
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: rawRecipients,
      subject: payload.subject,
      html: payload.html,
    });

    if (!error && data) {
      console.log(`[ASPIRA Email] Berhasil dikirim ke ${originalToList}:`, data.id);
      return { ok: true, deliveredTo: originalToList };
    }

    // 2. Jika ditolak karena batasan testing domain Resend (hanya boleh ke pemilik akun)
    const errorMsg = error?.message || '';
    const isDomainRestriction =
      errorMsg.includes('only send testing emails') ||
      errorMsg.includes('verify a domain') ||
      errorMsg.includes('validation_error');

    if (isDomainRestriction) {
      console.warn(
        `[ASPIRA Email] Testing domain aktif. Mengalihkan pengiriman dari [${originalToList}] ke [${RESEND_TEST_RECIPIENT}].`
      );

      const banner = `
        <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; padding:12px 16px; margin-bottom:20px; border-radius:8px; font-size:12px; color:#92400e;">
          ⚠️ <strong>Pemberitahuan Sistem Pengujian ASPIRA:</strong><br/>
          Notifikasi ini ditujukan untuk: <code>${originalToList}</code>.<br/>
          Dialihkan langsung ke email Anda (<code>${RESEND_TEST_RECIPIENT}</code>) sebagai pemilik akun pengembang agar dapat diuji secara nyata.
        </div>
      `;

      const fallbackSubject = `[ASPIRA Bogor] ${payload.subject}`;
      const fallbackHtml = payload.html.replace(
        '<div class="body">',
        `<div class="body">${banner}`
      );

      const fallbackRes = await resend.emails.send({
        from: FROM_EMAIL,
        to: [RESEND_TEST_RECIPIENT],
        subject: fallbackSubject,
        html: fallbackHtml,
      });

      if (!fallbackRes.error) {
        console.log(`[ASPIRA Email] Fallback berhasil dikirim ke ${RESEND_TEST_RECIPIENT}`);
        return {
          ok: true,
          deliveredTo: `${RESEND_TEST_RECIPIENT} (Terkirim via Mode Uji Coba ASPIRA)`,
        };
      }

      return { ok: false, error: fallbackRes.error.message };
    }

    return { ok: false, error: errorMsg };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ASPIRA Email] Exception:', msg);
    return { ok: false, error: msg };
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ASPIRA Kota Bogor</title>
  <style>
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
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
      Email ini dikirim otomatis oleh sistem ASPIRA Kota Bogor.<br/>
      Jangan balas email ini — untuk tindak lanjut, kunjungi portal resmi ASPIRA.<br/>
      © 2026 Pemerintah Kota Bogor — ASPIRA
    </div>
  </div>
</body>
</html>`;
}

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
