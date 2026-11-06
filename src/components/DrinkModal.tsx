import React, { useState, useEffect } from 'react';
import { X, Clock, Check } from 'lucide-react';
import { Drink, DrinkPreset } from '../types';

interface DrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrink: (drink: Omit<Drink, 'id'>, saveAsPreset: boolean) => void;
  initialPreset?: DrinkPreset | null;
  editDrink?: Drink | null;
}

const COLOR_OPTIONS = [
  { name: 'Red Bull Cyan', hex: '#06b6d4' },
  { name: 'Monster Volt', hex: '#10b981' },
  { name: 'Electric Blue', hex: '#3b82f6' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Espresso Amber', hex: '#d97706' },
  { name: 'Dark Roast', hex: '#b45309' },
  { name: 'Nitro Violet', hex: '#8b5cf6' },
  { name: 'High Volt Red', hex: '#ef4444' },
];

export const DrinkModal: React.FC<DrinkModalProps> = ({
  isOpen,
  onClose,
  onSaveDrink,
  initialPreset,
  editDrink,
}) => {
  const [name, setName] = useState('Red Bull Energy');
  const [brand, setBrand] = useState('Red Bull');
  const [volumeMl, setVolumeMl] = useState(250);
  const [caffeineMg, setCaffeineMg] = useState(80);
  const [servingFactor, setServingFactor] = useState(1);
  const [category, setCategory] = useState<Drink['category']>('energy-drink');
  const [color, setColor] = useState('#06b6d4');
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editDrink) {
      setName(editDrink.name);
      setBrand(editDrink.brand);
      setVolumeMl(editDrink.volumeMl);
      setCaffeineMg(editDrink.caffeineMg);
      setCategory(editDrink.category);
      setColor(editDrink.color);
      setTimestamp(new Date(editDrink.timestamp).toISOString().slice(0, 16));
      setNotes(editDrink.notes || '');
      setServingFactor(1);
    } else if (initialPreset) {
      setName(initialPreset.name);
      setBrand(initialPreset.brand);
      setVolumeMl(initialPreset.volumeMl);
      setCaffeineMg(initialPreset.caffeineMg);
      setCategory(initialPreset.category);
      setColor(initialPreset.color);
      setTimestamp(new Date().toISOString().slice(0, 16));
      setServingFactor(1);
      setNotes('');
    } else {
      setName('Custom Energy Drink');
      setBrand('Custom');
      setVolumeMl(355);
      setCaffeineMg(160);
      setCategory('energy-drink');
      setColor('#10b981');
      setTimestamp(new Date().toISOString().slice(0, 16));
      setServingFactor(1);
      setNotes('');
    }
  }, [initialPreset, editDrink, isOpen]);

  if (!isOpen) return null;

  const applyTimeOffsetMinutes = (mins: number) => {
    const target = new Date(Date.now() - mins * 60 * 1000);
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localIso = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
    setTimestamp(localIso);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVolume = Math.round(volumeMl * servingFactor);
    const finalCaffeine = Math.round(caffeineMg * servingFactor);

    onSaveDrink(
      {
        name,
        brand,
        volumeMl: finalVolume,
        caffeineMg: finalCaffeine,
        timestamp: new Date(timestamp).toISOString(),
        category,
        color,
        notes: notes.trim() || undefined,
      },
      saveAsPreset
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              {editDrink ? 'Edit Beverage Entry' : 'Log Caffeine Intake'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize beverage, portion size, and exact consumption time
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
          {/* Drink Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Drink Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Red Bull Original"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Source
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Red Bull, Monster, Nespresso"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Volume & Caffeine Mg */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serving Size (ml)
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                required
                value={volumeMl}
                onChange={(e) => setVolumeMl(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Caffeine (mg)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                required
                value={caffeineMg}
                onChange={(e) => setCaffeineMg(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Serving Multiplier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantity / Serving Portion
            </label>
            <div className="flex items-center gap-2">
              {[0.5, 1, 1.5, 2].map((factor) => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => setServingFactor(factor)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-mono font-medium transition ${
                    servingFactor === factor
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {factor === 1 ? '1 Can' : `${factor}x`}
                </button>
              ))}
            </div>
            {servingFactor !== 1 && (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                Total: {Math.round(volumeMl * servingFactor)}ml · {Math.round(caffeineMg * servingFactor)}mg caffeine
              </p>
            )}
          </div>

          {/* Timestamp with Quick-Offset Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Consumption Time</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyTimeOffsetMinutes(0)}
                  className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  Just Now
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeOffsetMinutes(30)}
                  className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  -30m
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeOffsetMinutes(60)}
                  className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  -1h
                </button>
                <button
                  type="button"
                  onClick={() => applyTimeOffsetMinutes(120)}
                  className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  -2h
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Curve &amp; Liquid Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setColor(col.hex)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    color === col.hex
                      ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {color === col.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Drink['category'])}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="energy-drink">Energy Drink</option>
              <option value="coffee">Coffee / Espresso</option>
              <option value="tea">Tea / Matcha</option>
              <option value="pre-workout">Pre-Workout</option>
              <option value="soda">Soda / Cola</option>
              <option value="other">Other Beverage</option>
            </select>
          </div>

          {/* Save as preset toggle */}
          {!editDrink && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="savePreset"
                checked={saveAsPreset}
                onChange={(e) => setSaveAsPreset(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="savePreset"
                className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Save as reusable preset in quick-log library
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              {editDrink ? 'Update Drink' : 'Log Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
