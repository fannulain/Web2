import { useNavigate } from 'react-router-dom';
import { logout, getUsername } from '../../services/api';

export default function Header() {
  const navigate = useNavigate();
  const username = getUsername();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight leading-none">
              TextPulse
            </h1>
            <p className="text-xs text-surface-200/50 leading-none mt-0.5">
              NLP Analysis Dashboard
            </p>
          </div>
        </div>

        {/* Right side: user + connection + logout */}
        <div className="flex items-center gap-4">
          {/* Connection status placeholder */}
          <div id="ws-connection-status" className="hidden sm:flex items-center gap-1.5 text-xs text-surface-200/40">
            <span className="w-2 h-2 rounded-full bg-surface-200/20"></span>
            <span>Offline</span>
          </div>

          {/* User info */}
          {username && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center text-sm font-medium text-brand-300 uppercase">
                {username.charAt(0)}
              </div>
              <span className="hidden sm:block text-sm text-surface-200/70 font-medium">
                {username}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-surface-200/60 hover:text-white
                       rounded-lg border border-white/8 hover:border-white/15
                       hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
