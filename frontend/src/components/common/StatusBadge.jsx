import { JOB_STATUS, STATUS_LABELS } from '../../utils/constants';

const STATUS_CONFIG = {
  [JOB_STATUS.CREATED]: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    animate: false,
  },
  [JOB_STATUS.QUEUED]: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    animate: false,
  },
  [JOB_STATUS.PROCESSING]: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
    animate: true,
  },
  [JOB_STATUS.DONE]: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    animate: false,
  },
  [JOB_STATUS.ERROR]: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    dot: 'bg-red-400',
    animate: false,
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[JOB_STATUS.CREATED];
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.animate ? 'animate-pulse-dot' : ''}`}
      />
      {label}
    </span>
  );
}
