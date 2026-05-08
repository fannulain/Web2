import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '../services/api';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '' },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await login(data.username);
      toast.success(`Welcome, ${data.username}!`);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-600/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/3 rounded-full blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-3xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600
                            flex items-center justify-center shadow-xl shadow-brand-500/25 mb-5">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              TextPulse
            </h1>
            <p className="text-sm text-surface-200/40 mt-1.5 text-center">
              NLP Text Analysis Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-2"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                autoFocus
                {...register('username')}
                disabled={submitting}
                placeholder="Enter your username"
                className={`w-full px-4 py-3 rounded-xl bg-surface-900/70 border text-sm text-white
                           placeholder:text-surface-200/25
                           focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50
                           transition-all duration-200 disabled:opacity-50
                           ${errors.username
                    ? 'border-red-500/50 focus:ring-red-500/30'
                    : 'border-white/8 hover:border-white/15'}`}
              />
              {errors.username && (
                <p id="login-error-message" className="text-xs text-red-400 mt-1.5 pl-1">{errors.username.message}</p>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl
                         bg-gradient-to-r from-brand-500 to-brand-600
                         hover:from-brand-400 hover:to-brand-500
                         shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-surface-200/25 text-center mt-6">
            No registration required — just enter a username
          </p>
        </div>
      </div>
    </div>
  );
}
