import { getReport } from '@/services/reports';
import { REPORT_STATUSES } from '@/constants/categories';
import { notFound } from 'next/navigation';

// Always render at request time — Firebase credentials are not available at build time
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-sm text-slate-500">{report.category}</span>
        <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
        <p className="text-slate-600">{report.description}</p>
      </div>

      {/* Status badge */}
      <div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          // Basic fallback — replace with palette.status lookup
          'bg-emerald-100 text-emerald-700'
        }`}>
          {REPORT_STATUSES[report.status]?.label ?? report.status}
        </span>
      </div>

      {/* Audit trail */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Riwayat Status</h2>
        <ol className="relative border-l border-slate-200 space-y-6 ml-3">
          {report.statusHistory.map((entry, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white" />
              <p className="font-semibold text-slate-800">
                {REPORT_STATUSES[entry.status]?.label ?? entry.status}
              </p>
              <time className="text-xs text-slate-400">
                {new Date(entry.timestamp).toLocaleString('id-ID')}
              </time>
              {entry.note && (
                <p className="mt-1 text-sm text-slate-600">{entry.note}</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Community confirmations */}
      <section>
        <p className="text-sm text-slate-500">
          {report.communityConfirmations.length} warga mengonfirmasi laporan ini
        </p>
      </section>
    </main>
  );
}
