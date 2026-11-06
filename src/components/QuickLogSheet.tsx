import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Coffee, Zap, Plus, Check, Sparkles, SlidersHorizontal, Droplets } from 'lucide-react';
import { DrinkPreset } from '../types';
import { sortPresets } from '../db/storage';

interface QuickLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  presets: DrinkPreset[];
  onLogPreset: (preset: DrinkPreset) => void;
  onLogSip: (caffeineMg: number, volumeMl: number) => void;
  onOpenCustomModal: () => void;
  steadyStateTargetMg?: number;
}

const SIP_PRESETS = [
  { label: 'Single Sip', volumeMl: 18, caffeineMg: 6, desc: 'Quick titration' },
  { label: 'Double Sip', volumeMl: 35, caffeineMg: 11, desc: 'Sustained focus' },
  { label: 'Deep Sip', volumeMl: 55, caffeineMg: 18, desc: 'Flow booster' },
];

export const QuickLogSheet: React.FC<QuickLogSheetProps> = ({
  isOpen,
  onClose,
  presets,
  onLogPreset,
  onLogSip,
  onOpenCustomModal,
  steadyStateTargetMg = 100,
}) => {
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);
  const [customSipVolume, setCustomSipVolume] = useState<number>(20);

  const orderedPresets = useMemo(() => sortPresets(presets), [presets]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: DrinkPreset) => {
    setJustLoggedId(preset.id);
    onLogPreset(preset);
    setTimeout(() => {
      setJustLoggedId(null);
      onClose();
    }, 450);
  };

  const handleSelectSip = (caffeineMg: number, volumeMl: number, idKey: string) => {
    setJustLoggedId(idKey);
    onLogSip(caffeineMg, volumeMl);
    setTimeout(() => {
      setJustLoggedId(null);
      onClose();
    }, 450);
  };

  const calculatedCustomSipMg = Math.round(customSipVolume * 0.32 * 10) / 10;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet Grab Handle on Mobile */}
        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Quick Log Drink or Sip
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-tap log to update your live metabolism curve
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: THE 4 QUICK LOG ENERGY DRINK CANS */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Full Can Log (Select One)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">4 Top Drinks</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {orderedPresets.slice(0, 4).map((preset) => {
              const isLogged = justLoggedId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={justLoggedId !== null}
                  className={`group relative flex flex-col p-3.5 rounded-2xl border text-left transition-all active:scale-[0.97] shadow-xs ${
                    isLogged
                      ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/70 hover:border-emerald-300'
                  }`}
                >
                  {/* Top Bar with Drink Accent color & volume */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span
                      className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span
                      className={`text-[10px] font-mono font-bold tabular-nums ${
                        isLogged ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {preset.volumeMl}ml
                    </span>
                  </div>

                  {/* Drink Title */}
                  <span
                    className={`text-sm font-bold truncate line-clamp-1 ${
                      isLogged
                        ? 'text-white'
                        : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}
                  >
                    {preset.name}
                  </span>

                  {/* Caffeine Amount */}
                  <div className="mt-1 flex items-baseline justify-between w-full">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-lg font-extrabold font-mono tabular-nums leading-none ${
                          isLogged ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {preset.caffeineMg}
                      </span>
                      <span className={`text-[11px] ${isLogged ? 'text-emerald-100' : 'text-slate-400'}`}>
                        mg
                      </span>
                    </div>

                    {isLogged ? (
                      <Check className="w-4 h-4 text-white animate-bounce" />
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                        + Log
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: MICRODOSE SIP LOGGING */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-emerald-500" />
              <span>Microdose Sip (Keep Stable at {steadyStateTargetMg}mg)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              No crash
            </span>
          </div>

          {/* Sip Preset Pills */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {SIP_PRESETS.map((sip, idx) => {
              const sipKey = `sip_preset_${idx}`;
              const isLogged = justLoggedId === sipKey;
              return (
                <button
                  key={sip.label}
                  onClick={() => handleSelectSip(sip.caffeineMg, sip.volumeMl, sipKey)}
                  disabled={justLoggedId !== null}
                  className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.97] flex flex-col justify-between ${
                    isLogged
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/70 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-medium text-slate-400">
                      ~{sip.volumeMl}ml
                    </span>
                    {isLogged && <Check className="w-3.5 h-3.5 text-white animate-bounce" />}
                  </div>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isLogged ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {sip.label}
                  </span>
                  <span
                    className={`text-xs font-mono font-extrabold mt-1 ${
                      isLogged ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    +{sip.caffeineMg} mg
                  </span>
                </button>
              );
            })}
          </div>

          {/* Adjustable Sip Stepper / Quick Action */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Quick Titration Sip:
                </span>
                <span className="text-[11px] text-slate-400">
                  {customSipVolume}ml Energy Drink = ~{calculatedCustomSipMg}mg caffeine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCustomSipVolume((v) => Math.max(10, v - 5))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setCustomSipVolume((v) => Math.min(100, v + 5))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleSelectSip(calculatedCustomSipMg, customSipVolume, 'sip_stepper')}
                className="ml-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1"
              >
                <span>Log +{calculatedCustomSipMg}mg</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: SUBTLE OPTIONAL CUSTOM DRINK FOOTER */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">Need custom brands or timing?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomModal();
            }}
            className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Open Custom Drink Form →</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
