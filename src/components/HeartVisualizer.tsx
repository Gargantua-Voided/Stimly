import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Heart, Activity, ShieldCheck, AlertCircle, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { MetabolismSummary, UserProfile } from '../types';

interface HeartVisualizerProps {
  summary: MetabolismSummary;
  profile: UserProfile;
  onOpenSettings: () => void;
  onUpdateBaselineBpm?: (newBpm: number) => void;
}

export const HeartVisualizer: React.FC<HeartVisualizerProps> = ({
  summary,
  profile,
  onOpenSettings,
  onUpdateBaselineBpm,
}) => {
  const bpm = summary.estimatedBpm;
  const delta = summary.bpmDelta;
  const baseBpm = profile.baselineHeartRateBpm || 68;

  // Pulse animation period in seconds: 60 / bpm
  const heartDuration = Math.max(0.4, 60 / Math.max(40, bpm));
  const rrIntervalMs = Math.round(60000 / Math.max(40, bpm));

  // Interactive Tap to Measure Pulse state
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [measuredBpm, setMeasuredBpm] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Handle pulse tap
  const handlePulseTap = () => {
    const now = Date.now();
    setIsMeasuring(true);
    setTapTimestamps((prev) => {
      // Keep taps within last 4 seconds
      const filtered = [...prev, now].filter((t) => now - t < 4000);
      if (filtered.length >= 3) {
        // Calculate average interval
        let totalInterval = 0;
        for (let i = 1; i < filtered.length; i++) {
          totalInterval += filtered[i] - filtered[i - 1];
        }
        const avgInterval = totalInterval / (filtered.length - 1);
        const calculated = Math.round(60000 / avgInterval);
        if (calculated >= 45 && calculated <= 160) {
          setMeasuredBpm(calculated);
        }
      }
      return filtered;
    });
  };

  // Canvas Oscilloscope Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-time sweeping phosphor ECG oscilloscope animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let sweepX = 0;
    const speed = (bpm / 60) * 1.8; // Speed proportional to BPM

    // Buffer of heights for smooth trace
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Cardiac cycle generator: P-wave, Q-dip, R-spike, S-dip, T-wave
    const getEcgSample = (phase: number) => {
      // phase: 0 to 1
      if (phase > 0.08 && phase < 0.16) {
        // P-wave (atrial depolarization)
        return -Math.sin(((phase - 0.08) / 0.08) * Math.PI) * 7;
      }
      if (phase > 0.22 && phase < 0.25) {
        // Q-dip
        return 4;
      }
      if (phase >= 0.25 && phase <= 0.3) {
        // R-spike (ventricular depolarization)
        return -((1 - Math.abs((phase - 0.275) / 0.025)) * 36);
      }
      if (phase > 0.3 && phase < 0.33) {
        // S-dip
        return 7;
      }
      if (phase > 0.42 && phase < 0.6) {
        // T-wave (ventricular repolarization)
        return -Math.sin(((phase - 0.42) / 0.18) * Math.PI) * 11;
      }
      // Baseline flat with micro physiological noise
      return (Math.random() - 0.5) * 1.2;
    };

    let prevX = 0;
    let prevY = midY;
    let cyclePhase = 0;

    const render = () => {
      // Semi-transparent sweep clear to create phosphor glow persistence
      ctx.fillStyle = 'rgba(10, 15, 29, 0.08)';
      ctx.fillRect(sweepX, 0, 12, height);

      // Erase directly ahead of the sweep beam
      ctx.fillStyle = '#090e1a';
      ctx.fillRect((sweepX + 4) % width, 0, 8, height);

      // Compute ECG deflection
      cyclePhase = (cyclePhase + 0.012 * (bpm / 60)) % 1;
      const deflection = getEcgSample(cyclePhase);
      const currentY = midY + deflection;

      // Draw glowing ECG sweep stroke
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(sweepX, currentY);

      // Color depends on cardiac stimulation
      const strokeColor =
        bpm >= 92 ? '#f43f5e' : bpm >= 80 ? '#f59e0b' : '#10b981';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Lead cursor point
      ctx.beginPath();
      ctx.arc(sweepX, currentY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      prevX = sweepX;
      prevY = currentY;

      sweepX = (sweepX + speed) % width;
      if (sweepX < prevX) {
        prevX = 0;
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [bpm]);

  // Status Info
  const statusInfo = useMemo(() => {
    switch (summary.heartStatus) {
      case 'high-stimulation':
        return {
          label: 'Elevated Tachycardia Caution',
          colorText: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
          heartFill: '#f43f5e',
          description: `+${delta} BPM elevation. Adenosine receptor blockade is increasing adrenergic drive. Hydrate and pause stimulants.`,
          icon: AlertCircle,
        };
      case 'moderate-elevation':
        return {
          label: 'Moderate Cardiac Output',
          colorText: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
          heartFill: '#f59e0b',
          description: `Elevated by +${delta} BPM above resting. Increased myocardial contractility and alertness.`,
          icon: Activity,
        };
      case 'mild-elevation':
        return {
          label: 'Mild Cardiovascular Lift',
          colorText: 'text-teal-600 dark:text-teal-400',
          bgColor: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
          heartFill: '#0d9488',
          description: `Gentle +${delta} BPM response. Healthy physiological alertness stimulation.`,
          icon: ShieldCheck,
        };
      case 'normal':
      default:
        return {
          label: 'Normal Resting Sinus Rhythm',
          colorText: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
          heartFill: '#10b981',
          description: `Operating at your calibrated baseline resting pulse (${baseBpm} BPM).`,
          icon: ShieldCheck,
        };
    }
  }, [summary.heartStatus, delta, baseBpm]);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-100 dark:border-rose-900/50 shadow-xs">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <span>Heart Rate</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
        >
          Calibrate
        </button>
      </div>

      {/* Main Cardiac HUD Split */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left: Living Beating Heart & Acoustic Shockwave Ripples */}
        <div className="md:col-span-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Expanding Acoustic Shockwave Ripples */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Ripple ring 1 */}
            <div
              className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping pointer-events-none"
              style={{ animationDuration: `${heartDuration}s` }}
            />
            {/* Ripple ring 2 */}
            <div
              className="absolute -inset-3 rounded-full border border-rose-500/20 animate-pulse pointer-events-none"
              style={{ animationDuration: `${heartDuration * 1.4}s` }}
            />
            {/* Soft Ambient Glow */}
            <div
              className="absolute inset-2 rounded-full blur-xl opacity-30 pointer-events-none"
              style={{ backgroundColor: statusInfo.heartFill }}
            />

            {/* Living Heart with Lub-Dub Contraction */}
            <div
              className="animate-cardiac relative z-10 cursor-pointer"
              style={{ ['--heart-duration' as any]: `${heartDuration.toFixed(2)}s` }}
              onClick={handlePulseTap}
              title="Tap along with your pulse to measure!"
            >
              <Heart
                className="w-16 h-16 drop-shadow-md transition-all duration-300"
                style={{
                  fill: statusInfo.heartFill,
                  color: statusInfo.heartFill,
                  filter: `drop-shadow(0 4px 14px ${statusInfo.heartFill}70)`,
                }}
              />
            </div>
          </div>

          {/* Large Numerical BPM Readout */}
          <div className="mt-2 text-center">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                {bpm}
              </span>
              <span className="text-sm font-extrabold text-rose-500 font-display">
                BPM
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs mt-1">
              {delta > 0 ? (
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  +{delta} BPM elevated
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  +0 BPM (Resting)
                </span>
              )}
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {rrIntervalMs}ms R-R
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sweeping Phosphor Oscilloscope ECG Screen */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div className="relative rounded-2xl bg-[#090e1a] p-3 border border-slate-800 shadow-inner overflow-hidden">
            {/* Medical Telemetry Header in Canvas */}
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>LEAD II · 25mm/s</span>
              </span>
              <span className="text-slate-400">HR: {bpm} BPM</span>
              <span className="text-cyan-400 tabular-nums">1.0 mV/cm</span>
            </div>

            {/* Living Sweeping Phosphor ECG Canvas */}
            <div className="relative w-full h-24 overflow-hidden rounded-xl">
              <canvas
                ref={canvasRef}
                width={500}
                height={96}
                className="w-full h-full block"
              />
            </div>

            {/* Oscilloscope Grid Watermark */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/80 mt-1">
              <span>PR: 142ms</span>
              <span>QRS: 88ms</span>
              <span>QTc: 412ms</span>
              <span>ST: Isoelectric</span>
            </div>
          </div>

          {/* Status Badge & Tap to Measure Button */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bgColor}`}
            >
              <statusInfo.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{statusInfo.label}</span>
            </span>

            {/* Tap to measure pulse button */}
            <button
              onClick={handlePulseTap}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
              <span>
                {measuredBpm
                  ? `Measured: ${measuredBpm} BPM (Tap to re-test)`
                  : 'Tap Pulse to Check'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {onUpdateBaselineBpm && measuredBpm && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={() => onUpdateBaselineBpm(measuredBpm)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Save {measuredBpm} BPM as baseline
          </button>
        </div>
      )}
    </div>
  );
};
