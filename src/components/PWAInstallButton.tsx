import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share2, PlusSquare, X, Monitor, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIOSGuide(false);
        setShowDesktopGuide(false);
      }
    };
    if (showIOSGuide || showDesktopGuide) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIOSGuide, showDesktopGuide]);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow when beforeinstallprompt event captured
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 active:scale-95 transition-all shadow-xs"
        title="Install Stimly PWA"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap font-medium">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/80 active:scale-95 transition-all shadow-xs"
          title="Install on iOS"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="whitespace-nowrap font-medium">Install on iOS</span>
        </button>

        {showIOSGuide &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setShowIOSGuide(false)}
            >
              <div
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                        Install on iOS
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        iPhone &amp; iPad Safari Guide
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        1. Tap Share
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Tap the <strong className="text-slate-800 dark:text-slate-200">Share icon</strong> (square with arrow up) at the bottom toolbar in Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        2. Add to Home Screen
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Scroll down and tap <strong className="text-slate-800 dark:text-slate-200">Add to Home Screen</strong>, then tap Add in top right.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-98"
                >
                  Got It
                </button>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  // Desktop / browser manual install guide
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/80 active:scale-95 transition-all shadow-xs"
        title="Install PWA"
      >
        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="whitespace-nowrap font-medium">Install App</span>
      </button>

      {showDesktopGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowDesktopGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      Install Stimly
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Offline Health &amp; Metabolism App
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDesktopGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Method 1: Address Bar
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Click the <strong className="text-slate-800 dark:text-slate-200">Install icon</strong> (computer with down arrow) on the right side of your browser address bar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Method 2: Browser Menu
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Open browser menu (<strong className="text-slate-800 dark:text-slate-200">⋮</strong>) and click <strong className="text-slate-800 dark:text-slate-200">&quot;Install Stimly...&quot;</strong> for instant standalone launch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Offline & privacy pill */}
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% offline &amp; private
                </span>
                <span>Zero telemetry</span>
              </div>

              <button
                onClick={() => setShowDesktopGuide(false)}
                className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-98"
              >
                Got It
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
