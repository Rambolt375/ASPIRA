import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';
import {
  sendEmail,
  buildReportConfirmationEmail,
  buildStatusUpdateEmail,
} from '@/lib/email/resend';
import { REPORT_STATUSES } from '@/constants/categories';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aspira-production.up.railway.app';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, reportId, ticketNumber, title, authorName, authorEmail, extraEmails } = body;

    if (!type || !authorEmail) {
      return NextResponse.json({ error: 'type and authorEmail are required' }, { status: 400 });
    }

    const reportUrl = `${APP_URL}/laporan/${reportId}`;

    // Collect all recipient emails (reporter + any extra CCs)
    const allRecipients: string[] = [authorEmail];
    if (Array.isArray(extraEmails)) {
      extraEmails.forEach((e: string) => {
        const clean = e.trim().toLowerCase();
        if (clean && !allRecipients.includes(clean)) allRecipients.push(clean);
      });
    }

    if (type === 'REPORT_CONFIRMED') {
      // Sent when a new report is accepted by the system
      const { category, address } = body;
      const html = buildReportConfirmationEmail({
        authorName,
        ticketNumber,
        title,
        category: category || 'Infrastruktur',
        address: address || 'Kota Bogor',
        reportUrl,
      });

      const result = await sendEmail({
        to: allRecipients,
        subject: `[ASPIRA] Laporan ${ticketNumber} berhasil diterima sistem`,
        html,
      });

      return NextResponse.json({
        ok: result.ok,
        deliveredTo: result.deliveredTo,
        error: result.error,
      });
    }

    if (type === 'STATUS_UPDATE') {
      const { oldStatusLabel, newStatus, actorName, agency, note, progressPercent } = body;
      const newStatusLabel = REPORT_STATUSES[newStatus as keyof typeof REPORT_STATUSES]?.label ?? newStatus;

      const html = buildStatusUpdateEmail({
        authorName,
        ticketNumber,
        title,
        oldStatus: oldStatusLabel || '-',
        newStatus,
        newStatusLabel,
        actorName: actorName || 'Dinas Terkait',
        agency: agency || 'Pemerintah Kota Bogor',
        note,
        reportUrl,
        progressPercent: progressPercent ?? 0,
      });

      const result = await sendEmail({
        to: allRecipients,
        subject: `[ASPIRA] Pembaruan status laporan ${ticketNumber}: ${newStatusLabel}`,
        html,
      });

      return NextResponse.json({
        ok: result.ok,
        deliveredTo: result.deliveredTo,
        error: result.error,
      });
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[/api/email] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

