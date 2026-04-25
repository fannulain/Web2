import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTask } from '../../services/api';
import toast from 'react-hot-toast';

const jobSchema = z.object({
  text: z
    .string()
    .min(10, 'Text must be at least 10 characters long')
    .max(100000, 'Text must not exceed 100 000 characters'),
});

export default function JobForm({ onJobCreated }) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: { text: '' },
  });

  const textValue = watch('text');
  const charCount = textValue?.length || 0;

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await createTask(data.text);
      toast.success('Analysis started! Your task is queued.');
      reset();
      onJobCreated?.();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create task';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="job-form-section" className="mb-10">
      <div className="glass rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white mb-1">New Analysis</h2>
          <p className="text-sm text-surface-200/40">
            Enter text for NLP analysis — sentiment, keywords, and metrics
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Textarea */}
          <div>
            <textarea
              id="job-text-input"
              {...register('text')}
              rows={5}
              placeholder="Paste or type your text here for analysis…"
              disabled={submitting}
              className={`w-full px-4 py-3 rounded-xl bg-surface-900/70 border text-sm text-white
                         placeholder:text-surface-200/25 resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50
                         transition-all duration-200 disabled:opacity-50
                         ${errors.text
                  ? 'border-red-500/50 focus:ring-red-500/30'
                  : 'border-white/8 hover:border-white/15'}`}
            />

            {/* Char counter + error */}
            <div className="flex items-center justify-between mt-2 px-1">
              {errors.text ? (
                <p className="text-xs text-red-400">{errors.text.message}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs font-mono ${charCount > 100000 ? 'text-red-400' : charCount > 95000 ? 'text-amber-400' : 'text-surface-200/30'
                  }`}
              >
                {charCount.toLocaleString()} / 100 000
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            id="submit-job-btn"
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white rounded-xl
                       bg-gradient-to-r from-brand-500 to-brand-600
                       hover:from-brand-400 hover:to-brand-500
                       shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                       cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Run Analysis
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
