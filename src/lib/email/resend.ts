/**
 * ASPIRA Email Service — powered by Resend
 *
 * Sender: requires RESEND_API_KEY in environment.
 * From:   uses RESEND_FROM_EMAIL (e.g. "ASPIRA Bogor <noreply@aspira-bogor.id>")
 *         or falls back to onboarding@resend.dev for testing.
 *
 * NOTE: Without a verified custom domain in the Resend dashboard,
 * the "from" address must be onboarding@resend.dev and emails will
 * only actually land in the inbox of the email used to register the Resend account.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'ASPIRA Bogor <onboarding@resend.dev>';

// Akun pemilik Resend untuk pengujian otomatis jika belum ada domain kustom
const RESEND_TEST_RECIPIENT =
  process.env.RESEND_TEST_RECIPIENT || 'reyza1098@gmail.com';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ ok: boolean; deliveredTo?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[ASPIRA Email] RESEND_API_KEY tidak diset — email tidak dikirim.');
    return { ok: false, error: 'RESEND_API_KEY tidak dikonfigurasi.' };
  }

  const rawRecipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const originalToList = rawRecipients.join(', ');

  // Percobaan 1: Kirim ke penerima asli
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: rawRecipients,
      subject: payload.subject,
      html: payload.html,
    });

    if (!error) {
      return { ok: true, deliveredTo: originalToList };
    }

    // Jika ditolak karena batasan testing domain Resend (hanya boleh kirim ke email pemilik akun)
    const isDomainRestriction =
      typeof error.message === 'string' &&
      (error.message.includes('only send testing emails') ||
        error.message.includes('verify a domain'));

    if (isDomainRestriction) {
      console.warn(
        `[ASPIRA Email] Resend test domain aktif. Mengalihkan pengiriman dari [${originalToList}] ke [${RESEND_TEST_RECIPIENT}].`
      );

      // Tambahkan info banner simulasi tujuan ke dalam email
      const testingHtmlBanner = `
        <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; padding:12px 16px; margin-bottom:20px; border-radius:8px; font-size:12px; color:#92400e;">
          ⚠️ <strong>Mode Pengujian Resend (Domain Belum Terverifikasi)</strong><br/>
          Email ini seharusnya ditujukan kepada: <code>${originalToList}</code>.<br/>
          Dialihkan otomatis ke email akun pengembang (<code>${RESEND_TEST_RECIPIENT}</code>) agar tetap dapat diterima dan diuji.
        </div>
      `;

      const fallbackSubject = `[Uji Coba → ${originalToList}] ${payload.subject}`;
      const fallbackHtml = payload.html.replace(
        '<div class="body">',
        `<div class="body">${testingHtmlBanner}`
      );

      const fallbackRes = await resend.emails.send({
        from: FROM_EMAIL,
        to: [RESEND_TEST_RECIPIENT],
        subject: fallbackSubject,
        html: fallbackHtml,
      });

      if (!fallbackRes.error) {
        return {
          ok: true,
          deliveredTo: `${RESEND_TEST_RECIPIENT} (Dialihkan dari ${originalToList} - Mode Uji Coba Resend)`,
        };
      }

      return { ok: false, error: fallbackRes.error.message };
    }

    return { ok: false, error: error.message };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ASPIRA Email] Exception:', msg);
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
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 28px 32px; }
    .header-title { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .header-sub { color: #6ee7b7; font-size: 12px; margin: 4px 0 0 0; }
    .body { padding: 28px 32px; }
    .ticket { display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 8px; margin-bottom: 16px; }
    .status-badge { display: inline-block; background: #047857; color: #fff; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 50px; margin: 8px 0 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 600; text-align: right; max-width: 60%; }
    .note-box { background: #f8fafc; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #334155; line-height: 1.6; }
    .cta { display: block; background: #059669; color: #fff !important; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 50px; font-weight: 700; font-size: 14px; margin: 24px 0 8px 0; }
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
      Jangan balas email ini — untuk pertanyaan, kunjungi portal ASPIRA.<br/>
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

