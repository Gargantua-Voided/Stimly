import React, { useState } from 'react';
import {
  Heart,
  Scale,
  Moon,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Activity,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingWizardProps {
  isOpen: boolean;
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');

  if (!isOpen) return null;

  const handleWeightChange = (val: number) => {
    if (weightUnit === 'lbs') {
      setFormData({ ...formData, weightKg: Number((val * 0.453592).toFixed(1)) });
    } else {
      setFormData({ ...formData, weightKg: val });
    }
  };

  const displayWeight =
    weightUnit === 'lbs'
      ? Math.round(formData.weightKg * 2.20462)
      : formData.weightKg;

  const displayHeight =
    heightUnit === 'in'
      ? Math.round(formData.heightCm / 2.54)
      : formData.heightCm;

  const handleHeightChange = (val: number) => {
    if (heightUnit === 'in') {
      setFormData({ ...formData, heightCm: Math.round(val * 2.54) });
    } else {
      setFormData({ ...formData, heightCm: val });
    }
  };

  const handleFinish = () => {
    onComplete({
      ...formData,
      hasCompletedOnboarding: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col justify-between min-h-[540px]">
        {/* Step Indicator Header (Now 5 Distinct Steps) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              Initial Setup · Step {step} of 5
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-emerald-500'
                      : s < step
                      ? 'w-2.5 bg-emerald-300 dark:bg-emerald-700'
                      : 'w-2.5 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Welcome to Stimly
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your mobile companion for real-time caffeine metabolism, animated liquid tracking, and cardiovascular heart health.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Activity className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Live Heart Rate Visualizer
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Dynamic ECG rhythm monitor and acute BPM elevation prediction.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Scale className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Biomass Exposure (mg/kg)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Calculates safe plasma concentration based on your exact body weight.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <Moon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Bedtime Sleep Protection
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Prevents sleep disruption by computing clearance to safe levels before bed.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIOMETRICS */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-800">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Your Physical Biometrics
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Caffeine distributes rapidly across total body water. Enter your weight and height to calibrate your volume of distribution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Weight */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Body Weight
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setWeightUnit('kg')}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                          weightUnit === 'kg'
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('lbs')}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                          weightUnit === 'lbs'
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="35"
                    max="280"
                    value={displayWeight}
                    onChange={(e) => handleWeightChange(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Height */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Height
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setHeightUnit('cm')}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                          heightUnit === 'cm'
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('in')}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                          heightUnit === 'in'
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        inches
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={displayHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="110"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: Number(e.target.value) })
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Sex */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sex: 'male' })}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                        formData.sex === 'male'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sex: 'female' })}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                        formData.sex === 'female'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESTING HEART RATE BASELINE */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-800">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Resting Heart Rate Calibration
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Stimly calculates caffeine cardiac elevation relative to your resting baseline (+1 BPM per ~12mg circulating caffeine).
              </p>

              <div className="pt-2 space-y-4">
                {/* Visual BPM Readout & Steppers */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Calibrated Resting Baseline
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5 my-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                      {formData.baselineHeartRateBpm || 68}
                    </span>
                    <span className="text-sm font-extrabold text-rose-500">BPM</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          baselineHeartRateBpm: Math.max(42, (formData.baselineHeartRateBpm || 68) - 1),
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                    >
                      -1
                    </button>
                    <input
                      type="range"
                      min="45"
                      max="100"
                      step="1"
                      value={formData.baselineHeartRateBpm || 68}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baselineHeartRateBpm: Number(e.target.value),
                        })
                      }
                      className="w-40 accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          baselineHeartRateBpm: Math.min(110, (formData.baselineHeartRateBpm || 68) + 1),
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* 4 Clinical Archetype Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Athletic', range: '48-58', val: 54 },
                    { label: 'Fit Adult', range: '59-66', val: 62 },
                    { label: 'Normal Median', range: '67-75', val: 68 },
                    { label: 'Elevated', range: '76-85', val: 80 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, baselineHeartRateBpm: item.val })
                      }
                      className={`p-2.5 rounded-xl border text-xs transition ${
                        formData.baselineHeartRateBpm === item.val
                          ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
                      }`}
                    >
                      <div className="font-semibold text-xs">{item.label}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.val} BPM
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SEPARATE STEP FOR DAILY LIMITS */}
          {step === 4 && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Daily Caffeine Limits
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Set your daily intake limit. The European Food Safety Authority (EFSA) and FDA recommend up to 400 mg daily for healthy adults (approx 5 standard Red Bulls or 4 cups of coffee).
              </p>

              <div className="space-y-4 pt-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Daily Intake Ceiling
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formData.dailyLimitMg} mg
                    </span>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="50"
                    value={formData.dailyLimitMg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyLimitMg: Number(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                    <span>200 mg (Light)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      400 mg (FDA Recommended)
                    </span>
                    <span>600 mg (High)</span>
                  </div>
                </div>

                {/* Quick explanation box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                    Why limits matter:
                  </span>
                  Exceeding 400 mg per day triggers autonomic jitteriness, elevated resting blood pressure, and potential tachyarrhythmias.
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SEPARATE STEP FOR SLEEP SCHEDULE & BEDTIME */}
          {step === 5 && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                <Moon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Sleep Schedule &amp; Bedtime
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Caffeine has a 5-hour half-life. Having more than 25 mg in your system at bedtime delays sleep onset and severely suppresses slow-wave restorative deep sleep.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Bedtime
                  </label>
                  <input
                    type="time"
                    value={formData.bedtime}
                    onChange={(e) =>
                      setFormData({ ...formData, bedtime: e.target.value })
                    }
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Metabolic Clearance Half-Life
                    </label>
                    <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {formData.halfLifeHours} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="8.0"
                    step="0.5"
                    value={formData.halfLifeHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        halfLifeHours: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>3.5h (Fast)</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">5.0h (Average)</span>
                    <span>7.0h (Slow)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Setup &amp; Launch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
