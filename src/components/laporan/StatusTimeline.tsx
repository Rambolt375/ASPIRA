import { REPORT_STATUSES, STATUS_PIPELINE } from '@/constants/categories';
import type { ReportStatus, StatusHistoryEntry } from '@/types';

interface Props {
  currentStatus: ReportStatus;
  history: StatusHistoryEntry[];
}

export default function StatusTimeline({ currentStatus, history }: Props) {
  // Build a map for quick lookup
  const historyMap = new Map(history.map((e) => [e.status, e]));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
        Riwayat Status
      </h3>

      <ol className="relative border-l-2 border-slate-200 ml-3 space-y-5">
        {STATUS_PIPELINE.map((status) => {
          const entry    = historyMap.get(status);
          const isDone   = !!entry;
          const isCurrent = status === currentStatus;

          return (
            <li key={status} className="ml-6">
              {/* Timeline dot */}
              <span
                className={[
                  'absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white',
                  isDone ? 'bg-emerald-600' : 'bg-slate-200',
                ].join(' ')}
              />

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-semibold ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                    {REPORT_STATUSES[status].label}
                    {isCurrent && (
                      <span className="ml-2 inline-block text-xs font-medium text-emerald-600">
                        ← saat ini
                      </span>
                    )}
                  </p>
                  {entry && (
                    <>
                      <time className="text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleString('id-ID')}
                      </time>
                      {entry.note && (
                        <p className="mt-0.5 text-xs text-slate-500">{entry.note}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
