import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 h-16">
        {/* Left: Brand Identity with logo.png */}
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Stimly"
            className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
            <span>Stimly</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={`Switch to ${theme === 'dark' ? 'bright' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
