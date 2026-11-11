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
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {report.category}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle}`}>
          {REPORT_STATUSES[report.status]?.label ?? report.status}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-base font-bold text-slate-900 line-clamp-2">{report.title}</h2>

      {/* Description */}
      <p className="text-sm font-normal text-slate-600 line-clamp-2 leading-relaxed">{report.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1.5 truncate mr-2">
          <MapPin size={13} className="text-emerald-600 shrink-0" />
          <span className="truncate">{report.address}</span>
        </span>
        <span className="shrink-0 text-slate-500 font-medium">{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
      </div>

      {/* Community confirmations */}
      {(report.communityConfirmations?.length ?? 0) > 0 && (
        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
          <span>✓</span> {report.communityConfirmations?.length ?? 0} warga mengonfirmasi
        </p>
      )}
    </Link>
  );
}
