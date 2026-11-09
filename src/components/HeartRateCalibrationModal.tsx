import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Activity,
  ShieldCheck,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface HeartRateCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBaselineBpm: number;
  onSaveBaseline: (newBpm: number) => void;
}

interface Archetype {
  id: string;
  title: string;
  range: string;
  bpm: number;
  badge: string;
  desc: string;
}

const CLINICAL_ARCHETYPES: Archetype[] = [
  {
    id: 'athlete',
    title: 'Endurance Athlete',
    range: '48–58 BPM',
    bpm: 54,
    badge: 'High Vagal Tone',
    desc: 'Regular marathon, cycling, or intense cardio conditioning.',
  },
  {
    id: 'fit',
    title: 'Active & Fit',
    range: '59–66 BPM',
    bpm: 62,
    badge: 'Fit Baseline',
    desc: 'Regular exercise 3–5x weekly with strong recovery.',
  },
  {
    id: 'standard',
    title: 'Standard Healthy Adult',
    range: '67–75 BPM',
    bpm: 68,
    badge: 'Population Median',
    desc: 'Clinical standard resting pulse for healthy adults.',
  },
  {
    id: 'elevated',
    title: 'Desk / Elevated Baseline',
    range: '76–85 BPM',
    bpm: 80,
    badge: 'Higher Baseline',
    desc: 'High cognitive stress, sedentary schedule, or natural higher rate.',
  },
];

export const HeartRateCalibrationModal: React.FC<HeartRateCalibrationModalProps> = ({
  isOpen,
  onClose,
  currentBaselineBpm,
  onSaveBaseline,
}) => {
  const [selectedBpm, setSelectedBpm] = useState<number>(currentBaselineBpm || 68);
  const [activeTab, setActiveTab] = useState<'tap' | 'presets' | 'manual'>('tap');

  // Tap-to-Measure Pulse states
  const [taps, setTaps] = useState<number[]>([]);
  const [tapBpm, setTapBpm] = useState<number | null>(null);
  const [isBeating, setIsBeating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedBpm(currentBaselineBpm || 68);
      setTaps([]);
      setTapBpm(null);
      setSavedSuccess(false);
    }
  }, [isOpen, currentBaselineBpm]);

  // Handle pulse tap
  const handleTap = useCallback(() => {
    const now = Date.now();
    setIsBeating(true);
    setTimeout(() => setIsBeating(false), 200);

    setTaps((prev) => {
      // Keep taps within last 5 seconds
      const recent = [...prev, now].filter((t) => now - t < 5000);
      if (recent.length >= 3) {
        // Calculate average interval
        let total = 0;
        for (let i = 1; i < recent.length; i++) {
          total += recent[i] - recent[i - 1];
        }
        const avg = total / (recent.length - 1);
        const calculated = Math.round(60000 / avg);
        if (calculated >= 42 && calculated <= 140) {
          setTapBpm(calculated);
          setSelectedBpm(calculated);
        }
      }
      return recent;
    });
  }, []);

  const resetTaps = () => {
    setTaps([]);
    setTapBpm(null);
  };

  const handleSave = () => {
    onSaveBaseline(selectedBpm);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-900/60 shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                Resting Heart Rate Calibration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calibrate your baseline for accurate caffeine cardiac load tracking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tap')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              activeTab === 'tap'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Tap to Measure</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clinical Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Precise Dial</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: TAP TO MEASURE PULSE */}
          {activeTab === 'tap' && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Find your radial pulse (wrist) or carotid pulse (neck). Tap the heart button with each beat:
                </span>
              </div>

              {/* Tap Pad */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  type="button"
                  onClick={handleTap}
                  className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-150 active:scale-90 shadow-lg cursor-pointer ${
                    isBeating
                      ? 'scale-105 border-rose-500 bg-rose-500 text-white shadow-rose-500/50'
                      : 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:border-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                  }`}
                >
                  <Heart
                    className={`w-12 h-12 transition-transform duration-150 ${
                      isBeating ? 'scale-125 fill-white' : 'fill-rose-500'
                    }`}
                  />
                  <span className="text-xs font-extrabold uppercase tracking-wider mt-1">
                    {taps.length === 0 ? 'Tap Pulse' : `Tap (${taps.length})`}
                  </span>
                </button>

                {/* Progress / Prompt indicator */}
                <div className="mt-3 text-center">
                  {taps.length === 0 ? (
                    <span className="text-xs text-slate-400">Tap at least 3 times along with your pulse</span>
                  ) : taps.length < 3 ? (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Tap {3 - taps.length} more beat{3 - taps.length > 1 ? 's' : ''} to calculate...
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Rhythm Acquired
                      </span>
                      <button
                        type="button"
                        onClick={resetTaps}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Calculated Result Readout */}
              {tapBpm && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center animate-in zoom-in-95 duration-200">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Measured Resting Baseline:
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                      {tapBpm}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">BPM</span>
                  </div>
                  <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
                    Calculated from {taps.length} consecutive cardiac intervals
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLINICAL ARCHETYPES */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Select your fitness profile to populate a validated clinical baseline:
              </span>

              {CLINICAL_ARCHETYPES.map((arch) => {
                const isSelected = selectedBpm === arch.bpm;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedBpm(arch.bpm)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 dark:border-rose-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/70 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {arch.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-800'
                              : 'bg-slate-200/60 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {arch.range}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {arch.desc}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                          {arch.bpm}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">BPM</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 justify-end mt-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: PRECISE DIAL & STEPPER */}
          {activeTab === 'manual' && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center">
                <span className="text-xs text-slate-400 font-medium block">Selected Baseline</span>
                <div className="flex items-baseline justify-center gap-2 my-2">
                  <span className="text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    {selectedBpm}
                  </span>
                  <span className="text-base font-extrabold text-rose-500 font-display">
                    BPM
                  </span>
                </div>

                {/* Fine Steppers */}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBpm((prev) => Math.max(40, prev - 5))}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBpm((prev) => Math.max(40, prev - 1))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBpm((prev) => Math.min(115, prev + 1))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBpm((prev) => Math.min(115, prev + 5))}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min="42"
                  max="110"
                  step="1"
                  value={selectedBpm}
                  onChange={(e) => setSelectedBpm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>42 BPM (Athlete)</span>
                  <span>68 BPM (Median)</span>
                  <span>110 BPM (High)</span>
                </div>
              </div>
            </div>
          )}

          {/* Scientific Guidance Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200">How Stimly uses this:</strong>{' '}
              Caffeine stimulates myocardial contractility by blocking adenosine A1/A2A receptors (+1 BPM per ~12mg circulating caffeine). Calibrating your resting baseline ensures real-time cardiac strain alerts reflect true adrenergic lift.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-400">Target Baseline:</span>
            <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
              {selectedBpm} BPM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Save Baseline ({selectedBpm} BPM)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
