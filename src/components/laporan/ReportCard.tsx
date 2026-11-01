import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { REPORT_STATUSES } from '@/constants/categories';
import { palette } from '@/constants/theme';
import type { Report } from '@/types';

interface Props {
  report: Report;
}

export default function ReportCard({ report }: Props) {
  const statusStyle = palette.status[report.status] ?? 'bg-slate-100 text-slate-600';

  return (
    <Link
      href={`/laporan/${report.id}`}
      className="block bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow space-y-3"
    >
      {/* Category + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {report.category}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle}`}>
          {REPORT_STATUSES[report.status]?.label ?? report.status}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-base font-semibold text-slate-900 line-clamp-2">{report.title}</h2>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2">{report.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {report.address}
        </span>
        <span>{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
      </div>

      {/* Community confirmations */}
      {report.communityConfirmations.length > 0 && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ {report.communityConfirmations.length} warga mengonfirmasi
        </p>
      )}
    </Link>
  );
}
