import React, { useState } from 'react';
import { Trash2, Edit2, Download, AlertCircle, Sparkles } from 'lucide-react';
import { Drink } from '../types';
import { calculateSingleDoseCaffeine } from '../utils/pharmacokinetics';

interface DrinkHistoryProps {
  drinks: Drink[];
  halfLifeHours: number;
  currentTimeMs: number;
  onEditDrink: (drink: Drink) => void;
  onDeleteDrink: (drinkId: string) => void;
  onClearAll: () => void;
}

export const DrinkHistory: React.FC<DrinkHistoryProps> = ({
  drinks,
  halfLifeHours,
  currentTimeMs,
  onEditDrink,
  onDeleteDrink,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'today'>('today');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const filteredDrinks = drinks.filter((d) => {
    if (filter === 'today') {
      return new Date(d.timestamp).getTime() >= startOfDay.getTime();
    }
    return true;
  });

  const exportAsCsv = () => {
    if (drinks.length === 0) return;
    const header = 'ID,Name,Brand,Volume_ml,Caffeine_mg,Timestamp,Category,Notes\n';
    const rows = drinks
      .map(
        (d) =>
          `"${d.id}","${d.name}","${d.brand}",${d.volumeMl},${d.caffeineMg},"${d.timestamp}","${d.category}","${d.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caffeine_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
            Consumption Log
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredDrinks.length} {filteredDrinks.length === 1 ? 'drink' : 'drinks'} recorded
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented filter */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filter === 'today'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export CSV button */}
          {drinks.length > 0 && (
            <button
              onClick={exportAsCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Export personal caffeine history as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          {/* Clear all button */}
          {drinks.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Are you sure you want to clear your drink log?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500"
            >
              Yes, Clear
            </button>
          </div>
        </div>
      )}

      {/* Drink List */}
      <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
        {filteredDrinks.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No drinks logged yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select Red Bull, Monster, or a custom espresso above to start tracking.
            </p>
          </div>
        ) : (
          filteredDrinks.map((drink) => {
            const drinkTime = new Date(drink.timestamp);
            const timeLabel = drinkTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateLabel = drinkTime.toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            const drinkTimeMs = drinkTime.getTime();
            const activeRemainingMg = calculateSingleDoseCaffeine(
              drink.caffeineMg,
              drinkTimeMs,
              currentTimeMs,
              halfLifeHours
            );

            return (
              <div
                key={drink.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
              >
                {/* Left: Color dot & details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                    style={{ backgroundColor: `${drink.color}15` }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: drink.color }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {drink.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {drink.volumeMl}ml
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{dateLabel}</span>
                      <span>·</span>
                      <span className="font-mono">{timeLabel}</span>
                      {drink.notes && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-400 truncate max-w-[120px]">
                            {drink.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1 font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm tabular-nums">
                      <span>{drink.caffeineMg}</span>
                      <span className="text-[10px] text-slate-400 font-normal">mg</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                      {activeRemainingMg > 0.05
                        ? `${activeRemainingMg.toFixed(1)}mg active`
                        : 'cleared'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEditDrink(drink)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDrink(drink.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
