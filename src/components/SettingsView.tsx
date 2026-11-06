import React, { useState } from 'react';
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  Scale,
  Heart,
  Moon,
  Zap,
  Check,
  Sun,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onRerunWizard: () => void;
  onFactoryReset: () => void;
  onClearDrinkHistory: () => void;
  drinkCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onRerunWizard,
  onFactoryReset,
  onClearDrinkHistory,
  drinkCount,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [showFactoryConfirm, setShowFactoryConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  const handleWeightChange = (val: number) => {
    if (weightUnit === 'lbs') {
      setFormData((prev) => ({
        ...prev,
        weightKg: Number((val * 0.453592).toFixed(1)),
      }));
    } else {
      setFormData((prev) => ({ ...prev, weightKg: val }));
    }
  };

  const displayWeight =
    weightUnit === 'lbs'
      ? Math.round(formData.weightKg * 2.20462)
      : formData.weightKg;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveProfile(formData);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Settings
        </h2>
        {savedBadge && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Card 1: Biometrics */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Biometrics
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Weight */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Weight
                </label>
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      weightUnit === 'kg'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      weightUnit === 'lbs'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={30}
                max={250}
                value={displayWeight}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Height */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min={100}
                max={230}
                value={formData.heightCm}
                onChange={(e) =>
                  setFormData({ ...formData, heightCm: Number(e.target.value) })
                }
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min={14}
                max={100}
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Baseline Resting Heart Rate */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resting Heart Rate (BPM)
              </label>
              <input
                type="number"
                min={45}
                max={120}
                value={formData.baselineHeartRateBpm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baselineHeartRateBpm: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Daily Limit & Sleep */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Caffeine &amp; Sleep Schedule
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Daily Limit */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Daily Caffeine Limit
                </label>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formData.dailyLimitMg} mg
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={800}
                step={25}
                value={formData.dailyLimitMg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyLimitMg: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Target Bedtime */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Bedtime
                </label>
                <input
                  type="time"
                  value={formData.bedtime}
                  onChange={(e) =>
                    setFormData({ ...formData, bedtime: e.target.value })
                  }
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Bedtime threshold */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bedtime Sleep Cutoff
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  step={5}
                  value={formData.bedtimeThresholdMg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedtimeThresholdMg: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Half-Life Presets */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metabolic Half-Life ({formData.halfLifeHours} hours)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Fast (3.5h)', val: 3.5 },
                  { label: 'Normal (5.0h)', val: 5.0 },
                  { label: 'Slow (7.0h)', val: 7.0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, halfLifeHours: item.val })
                    }
                    className={`py-2 rounded-xl border text-xs font-semibold transition ${
                      formData.halfLifeHours === item.val
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Save Changes</span>
        </button>
      </form>

      {/* Card 3: App Actions & Reset */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          App Management
        </h3>

        {/* Rerun Setup Wizard */}
        <button
          type="button"
          onClick={onRerunWizard}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Rerun Setup Wizard
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Calibrate biometrics and goals step-by-step
              </span>
            </div>
          </div>
          <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" />
        </button>

        {/* Clear Logged Drinks */}
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Clear Drink History ({drinkCount})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Remove all logged drinks without resetting profile
              </span>
            </div>
          </div>
        </button>

        {/* Factory Reset */}
        <button
          type="button"
          onClick={() => setShowFactoryConfirm(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                Factory Reset App
              </span>
              <span className="text-[11px] text-rose-500/80 dark:text-rose-400/70">
                Erase all local databases and return to fresh install
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Clear Drinks Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Clear Drink History?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This will remove all {drinkCount} drink logs and reset your active circulating caffeine to 0 mg. Your biometrics and settings will remain saved.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearDrinkHistory();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Reset Confirm Modal */}
      {showFactoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Factory Reset Stimly?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This will permanently wipe all IndexedDB records, drink logs, customized presets, and profile biometrics. The initial 5-step setup wizard will launch fresh.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowFactoryConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onFactoryReset();
                  setShowFactoryConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
              >
                Erase &amp; Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
