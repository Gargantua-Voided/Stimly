import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { DrinkPreset } from '../types';
import { sortPresets } from '../db/storage';

interface QuickLogBarProps {
  presets: DrinkPreset[];
  onLogPreset: (preset: DrinkPreset) => void;
  onOpenCustomModal: () => void;
}

export const QuickLogBar: React.FC<QuickLogBarProps> = ({
  presets,
  onLogPreset,
  onOpenCustomModal,
}) => {
  const orderedPresets = useMemo(() => sortPresets(presets), [presets]);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
          Quick Log
        </h3>
        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom</span>
        </button>
      </div>

      {/* Grid of the 4 requested drinks - Guaranteed Red Bull #1, Monster #2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {orderedPresets.slice(0, 4).map((preset) => (
          <button
            key={preset.id}
            onClick={() => onLogPreset(preset)}
            className="group relative flex flex-col items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-slate-600 transition-all text-left shadow-xs active:scale-[0.97]"
          >
            {/* Top row with color pill & volume */}
            <div className="w-full flex items-center justify-between mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs"
                style={{ backgroundColor: preset.color }}
              />
              <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                {preset.volumeMl}ml
              </span>
            </div>

            {/* Drink Title */}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">
              {preset.name}
            </span>

            {/* Caffeine mg pill */}
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums leading-none">
                {preset.caffeineMg}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                mg
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
