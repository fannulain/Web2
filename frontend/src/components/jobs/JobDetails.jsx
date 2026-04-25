import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { JOB_STATUS } from '../../utils/constants';
import { updateTask } from '../../services/api';
import toast from 'react-hot-toast';

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function SentimentBar({ value, label }) {
  const percentage = Math.round(((value + 1) / 2) * 100);
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-surface-200/50">{label}</span>
        <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-surface-200/60'
          }`}>
          {value}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-surface-900/80 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-emerald-500' : isNegative ? 'bg-red-500' : 'bg-surface-200/30'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function JobDetails({ job, onClose, onRerun }) {
  const [editText, setEditText] = useState(job.input_text || '');
  const [rerunning, setRerunning] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!job) return null;

  const isDone = job.status === JOB_STATUS.DONE;
  const isError = job.status === JOB_STATUS.ERROR;
  const result = job.result;

  const handleRerun = async () => {
    if (editText.length < 10) {
      toast.error('Text must be at least 10 characters');
      return;
    }
    try {
      setRerunning(true);
      await updateTask(job.id, editText);
      toast.success('Task re-queued for analysis');
      setShowEdit(false);
      onRerun?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to re-run task');
    } finally {
      setRerunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto
                      animate-fade-in-up shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="sticky top-0 glass rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-white/5 z-10">
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            <span className="text-xs font-mono text-surface-200/30 hidden sm:inline">
              {job.id?.substring(0, 8)}…
            </span>
          </div>
          <button
            id="close-details-btn"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-surface-200/40 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-surface-200/40 text-xs uppercase tracking-wider">Created</span>
              <p className="text-white mt-0.5">{formatDate(job.created_at)}</p>
            </div>
            <div>
              <span className="text-surface-200/40 text-xs uppercase tracking-wider">Updated</span>
              <p className="text-white mt-0.5">{formatDate(job.updated_at)}</p>
            </div>
          </div>

          {/* Input text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-surface-200/40 text-xs uppercase tracking-wider">Input Text</span>
              {!showEdit && (
                <button
                  id="edit-text-btn"
                  onClick={() => setShowEdit(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  Edit & Re-run
                </button>
              )}
            </div>

            {showEdit ? (
              <div className="space-y-3">
                <textarea
                  id="edit-text-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-surface-900/70 border border-brand-500/30
                             text-sm text-white placeholder:text-surface-200/25 resize-none
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <div className="flex gap-2">
                  <button
                    id="confirm-rerun-btn"
                    onClick={handleRerun}
                    disabled={rerunning}
                    className="px-4 py-2 text-xs font-medium text-white rounded-lg
                               bg-brand-500 hover:bg-brand-400 transition-colors
                               disabled:opacity-50 cursor-pointer"
                  >
                    {rerunning ? 'Re-running…' : 'Re-run Analysis'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEdit(false);
                      setEditText(job.input_text || '');
                    }}
                    className="px-4 py-2 text-xs font-medium text-surface-200/50 rounded-lg
                               hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-surface-900/60 p-4">
                <p className="text-sm text-surface-200/70 leading-relaxed whitespace-pre-wrap">
                  {job.input_text}
                </p>
              </div>
            )}
          </div>

          {/* Results (when DONE) */}
          {isDone && result && (
            <>
              {/* Metrics */}
              <div>
                <span className="text-surface-200/40 text-xs uppercase tracking-wider mb-3 block">
                  Text Metrics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-surface-900/60 p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {result.metrics?.word_count ?? '—'}
                    </div>
                    <div className="text-xs text-surface-200/40 mt-1">Words</div>
                  </div>
                  <div className="rounded-xl bg-surface-900/60 p-4 text-center">
                    <div className="text-2xl font-bold text-brand-300">
                      {result.metrics?.sentences_count ?? '—'}
                    </div>
                    <div className="text-xs text-surface-200/40 mt-1">Sentences</div>
                  </div>
                  <div className="rounded-xl bg-surface-900/60 p-4 text-center sm:col-span-1 col-span-2">
                    <div className="text-2xl font-bold text-amber-400">
                      {result.analysis_type || 'NLP'}
                    </div>
                    <div className="text-xs text-surface-200/40 mt-1">Analysis Type</div>
                  </div>
                </div>
              </div>

              {/* Sentiment */}
              {result.sentiment && (
                <div>
                  <span className="text-surface-200/40 text-xs uppercase tracking-wider mb-3 block">
                    Sentiment Analysis
                  </span>
                  <div className="rounded-xl bg-surface-900/60 p-4 space-y-4">
                    <SentimentBar value={result.sentiment.polarity} label="Polarity" />
                    <SentimentBar
                      value={result.sentiment.subjectivity * 2 - 1}
                      label={`Subjectivity (${result.sentiment.subjectivity})`}
                    />
                  </div>
                </div>
              )}

              {/* Keywords */}
              {result.keywords && result.keywords.length > 0 && (
                <div>
                  <span className="text-surface-200/40 text-xs uppercase tracking-wider mb-3 block">
                    Extracted Keywords
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-medium rounded-full
                                   bg-brand-500/15 text-brand-300 border border-brand-500/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error details */}
          {isError && result && (
            <div>
              <span className="text-surface-200/40 text-xs uppercase tracking-wider mb-3 block">
                Error Details
              </span>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm text-red-400">
                  {result.error || result.error_message || 'An unknown error occurred during processing.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
