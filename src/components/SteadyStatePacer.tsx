import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Target, Bell, BellOff, Coffee, Clock, Sparkles, Check, ChevronRight } from 'lucide-react';
import { MetabolismSummary, UserProfile } from '../types';

interface SteadyStatePacerProps {
  summary: MetabolismSummary;
  profile: UserProfile;
  currentTimeMs: number;
  targetMg: number;
  onUpdateTargetMg: (newTarget: number) => void;
  onLogMicrodoseSip: (caffeineMg: number, volumeMl: number) => void;
}

const TARGET_PRESETS = [
  { mg: 60, label: 'Gentle', desc: 'Light focus, calm' },
  { mg: 100, label: 'Deep Focus', desc: 'Recommended baseline' },
  { mg: 140, label: 'High Alert', desc: 'Deep work & coding' },
  { mg: 180, label: 'Peak Drive', desc: 'Intense stimulation' },
];

export const SteadyStatePacer: React.FC<SteadyStatePacerProps> = ({
  summary,
  profile,
  currentTimeMs,
  targetMg,
  onUpdateTargetMg,
  onLogMicrodoseSip,
}) => {
  const [alertsActive, setAlertsActive] = useState(() => profile.sipAlertsEnabled ?? false);
  const [intervalMinutes, setIntervalMinutes] = useState(() => profile.sipIntervalMinutes || 25);
  const [secondsRemaining, setSecondsRemaining] = useState(() => intervalMinutes * 60);
  const [lastAlertTimeMs, setLastAlertTimeMs] = useState<number>(0);
  const [sipToast, setSipToast] = useState(false);

  // Play pleasant dual-bell chime synthesizer using Web Audio API
  const playSipChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.1);

      // Note 2: B5 (987.77 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.22, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 1.4);
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  }, []);

  // Pharmacokinetic hourly clearance rate at target level
  const ke = Math.LN2 / profile.halfLifeHours;
  const targetHourlyClearanceMg = (targetMg * ke).toFixed(1);

  // Microdose sip calculation:
  // e.g. If you lose 14 mg/hr and interval is 25 min (0.416 hr), you need ~5.8 mg per sip (~18-20 ml of Red Bull)
  const sipCaffeineMg = Math.round((Number(targetHourlyClearanceMg) * (intervalMinutes / 60)) * 10) / 10;
  const sipVolumeMl = Math.round(sipCaffeineMg / 0.32); // 0.32 mg/ml for typical 250ml/80mg energy drink

  // Hours until current caffeine drops down to target
  const hoursUntilTarget = useMemo(() => {
    if (summary.currentCaffeineMg <= targetMg) return 0;
    // C(t) = C0 * e^(-ke * t) => t = ln(C0 / C_target) / ke
    return Math.log(summary.currentCaffeineMg / targetMg) / ke;
  }, [summary.currentCaffeineMg, targetMg, ke]);

  // Projected next boost / sip timestamp
  const nextTargetTimestampMs = useMemo(() => {
    if (hoursUntilTarget <= 0) return currentTimeMs;
    return currentTimeMs + hoursUntilTarget * 3600 * 1000;
  }, [currentTimeMs, hoursUntilTarget]);

  const nextTargetTimeFormatted = useMemo(() => {
    const d = new Date(nextTargetTimestampMs);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [nextTargetTimestampMs]);

  // Status state
  const deltaFromTarget = summary.currentCaffeineMg - targetMg;
  const isOptimalInZone = Math.abs(deltaFromTarget) <= 18;
  const isAboveTarget = deltaFromTarget > 18;
  const isBelowTarget = deltaFromTarget < -18;

  // Countdown timer for microdose sips
  useEffect(() => {
    if (!alertsActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger alert!
          const now = Date.now();
          if (now - lastAlertTimeMs > 10000) {
            playSipChime();
            setLastAlertTimeMs(now);
            setSipToast(true);
            setTimeout(() => setSipToast(false), 5000);

            // Native notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('Stimly Microdose Sip', {
                  body: `Time for a ~${sipVolumeMl}ml sip (${sipCaffeineMg}mg) to sustain your ${targetMg}mg steady state!`,
                  icon: `${import.meta.env.BASE_URL}logo.png`,
                });
              } catch {
                // Ignore
              }
            }
          }
          return intervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alertsActive, intervalMinutes, lastAlertTimeMs, playSipChime, sipVolumeMl, sipCaffeineMg, targetMg]);

  // Handle Quick Sip Log
  const handleLogSip = () => {
    onLogMicrodoseSip(sipCaffeineMg, sipVolumeMl);
    setSecondsRemaining(intervalMinutes * 60);
    setSipToast(false);
  };

  // Format seconds mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
              <span>Steady-State Pacer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Maintain stable focus without crash
            </span>
          </div>
        </div>

        {/* Sip Reminder Alert Toggle */}
        <button
          type="button"
          onClick={() => {
            const next = !alertsActive;
            setAlertsActive(next);
            if (next) {
              setSecondsRemaining(intervalMinutes * 60);
              playSipChime();
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            alertsActive
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
          }`}
          title="Toggle periodic microdose sip reminder alerts"
        >
          {alertsActive ? (
            <>
              <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              <span>Alerts On</span>
            </>
          ) : (
            <>
              <BellOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Alerts Off</span>
            </>
          )}
        </button>
      </div>

      {/* Target Level Selector Pills */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Target Concentration
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {targetMg} mg active
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {TARGET_PRESETS.map((p) => {
            const isSelected = targetMg === p.mg;
            return (
              <button
                key={p.mg}
                type="button"
                onClick={() => onUpdateTargetMg(p.mg)}
                className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                }`}
              >
                <span className="text-xs font-black font-mono leading-none">{p.mg}mg</span>
                <span className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Pacing Telemetry Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Status Indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOptimalInZone
                  ? 'bg-emerald-500 animate-pulse'
                  : isAboveTarget
                  ? 'bg-cyan-500'
                  : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {isOptimalInZone
                ? 'Target Steady-State Locked'
                : isAboveTarget
                ? `Gliding to ${targetMg}mg Target`
                : `Below ${targetMg}mg Target`}
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-400">
            Loss: -{targetHourlyClearanceMg}mg/h
          </span>
        </div>

        {/* Microdose Pacing & Next Window */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Box 1: Optimal Next Boost Time */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-medium block">
              {isAboveTarget ? 'Target Touchdown' : 'Next Booster Time'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                {isAboveTarget ? nextTargetTimeFormatted : 'Now / Soon'}
              </span>
              {isAboveTarget && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  (in {Math.round(hoursUntilTarget * 60)}m)
                </span>
              )}
            </div>
          </div>

          {/* Box 2: Microdose Titration (Sips) */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium block">Microdose Sip</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ~{sipVolumeMl}ml
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                +{sipCaffeineMg} mg
              </span>
              <span className="text-[10px] text-slate-400">every {intervalMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Sip Timer & Action Strip */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
          {/* Countdown timer */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] text-slate-400">Next sip:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          {/* Quick Log Sip Action */}
          <button
            type="button"
            onClick={handleLogSip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Log Sip (+{sipCaffeineMg}mg)</span>
          </button>
        </div>
      </div>

      {/* In-app Toast reminder when timer expires */}
      {sipToast && (
        <div className="p-3 rounded-2xl bg-emerald-500 text-white flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Time for a ~{sipVolumeMl}ml sip to sustain {targetMg}mg focus!</span>
          </div>
          <button
            type="button"
            onClick={handleLogSip}
            className="px-2.5 py-1 rounded-lg bg-white text-emerald-700 text-xs font-extrabold shadow-xs hover:bg-emerald-50"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
