import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { JOB_STATUS } from '../../utils/constants';

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const PREVIEW_LENGTH = 120;

export default function JobCard({ job, onView, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const isDone = job.status === JOB_STATUS.DONE;
  const isError = job.status === JOB_STATUS.ERROR;
  const isProcessing = job.status === JOB_STATUS.PROCESSING;
  const isLongText = job.input_text && job.input_text.length > PREVIEW_LENGTH;

  const displayText = expanded || !isLongText
    ? job.input_text
    : job.input_text.substring(0, PREVIEW_LENGTH).trimEnd() + '…';

  return (
    <div
      className={`card-enter animate-fade-in-up glass rounded-2xl p-5 transition-all duration-300
                   hover:border-white/10 hover:shadow-lg hover:shadow-brand-500/5
                   group relative overflow-hidden
                   ${isProcessing ? 'border-blue-500/20' : ''}
                   ${isError ? 'border-red-500/20' : ''}`}
    >
      {/* Processing shimmer bar */}
      {isProcessing && (
        <div className="absolute top-0 left-0 right-0 h-0.5 animate-shimmer rounded-full" />
      )}

      {/* Top row: status + date */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={job.status} />
        <span className="text-xs text-surface-200/30 font-mono">
          {formatDate(job.created_at)}
        </span>
      </div>

      {/* Text preview */}
      <div className="mb-4">
        <p className={`text-sm text-surface-200/70 leading-relaxed min-h-[2.5rem] ${expanded ? 'whitespace-pre-wrap break-words' : ''
          }`}>
          {displayText}
        </p>
        {isLongText && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-1.5 text-xs font-medium text-brand-400 hover:text-brand-300
                       transition-colors cursor-pointer"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Result preview (when DONE) */}
      {isDone && job.result && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl bg-surface-900/60 p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {job.result.metrics?.word_count ?? '—'}
            </div>
            <div className="text-[10px] text-surface-200/40 uppercase tracking-wider mt-0.5">
              Words
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-surface-900/60 p-3 text-center">
            <div className={`text-lg font-semibold ${(job.result.sentiment?.polarity ?? 0) > 0
                ? 'text-emerald-400'
                : (job.result.sentiment?.polarity ?? 0) < 0
                  ? 'text-red-400'
                  : 'text-surface-200'
              }`}>
              {job.result.sentiment?.polarity ?? '—'}
            </div>
            <div className="text-[10px] text-surface-200/40 uppercase tracking-wider mt-0.5">
              Sentiment
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-surface-900/60 p-3 text-center">
            <div className="text-lg font-semibold text-brand-300">
              {job.result.metrics?.sentences_count ?? '—'}
            </div>
            <div className="text-[10px] text-surface-200/40 uppercase tracking-wider mt-0.5">
              Sentences
            </div>
          </div>
        </div>
      )}

      {/* Error preview */}
      {isError && job.result && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-xs text-red-400">
            {job.result.error || job.result.error_message || 'An error occurred'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <button
          id={`view-job-${job.id}`}
          onClick={() => onView(job)}
          className="flex-1 px-3 py-2 text-xs font-medium text-brand-300 rounded-lg
                     hover:bg-brand-500/10 transition-colors duration-200 cursor-pointer"
        >
          View Details
        </button>
        <button
          id={`delete-job-${job.id}`}
          onClick={() => onDelete(job.id)}
          className="px-3 py-2 text-xs font-medium text-surface-200/30 rounded-lg
                     hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
