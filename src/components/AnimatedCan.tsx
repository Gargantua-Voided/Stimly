import React, { useMemo, useState } from 'react';
import { Sparkles, Zap, Flame, ShieldAlert, HeartPulse } from 'lucide-react';
import { MetabolismSummary, UserProfile } from '../types';

interface AnimatedCanProps {
  summary: MetabolismSummary;
  profile: UserProfile;
  isRecentLogged?: boolean;
}

export const AnimatedCan: React.FC<AnimatedCanProps> = ({
  summary,
  profile,
  isRecentLogged = false,
}) => {
  const [fizzBurst, setFizzBurst] = useState(false);

  // Trigger extra fizz on click
  const triggerFizz = () => {
    if (summary.currentCaffeineMg <= 0.05) return;
    setFizzBurst(true);
    setTimeout(() => setFizzBurst(false), 1600);
  };

  const maxCapacity = Math.max(250, profile.dailyLimitMg);

  // Exact fill percentage: 0% when empty, never fake percentage
  const fillPercentage = useMemo(() => {
    if (summary.currentCaffeineMg <= 0.05) return 0;
    const pct = (summary.currentCaffeineMg / maxCapacity) * 100;
    return Math.min(94, Math.max(6, pct));
  }, [summary.currentCaffeineMg, maxCapacity]);

  // Dynamic theme colors matching stimulation zone
  const themeColors = useMemo(() => {
    const mg = summary.currentCaffeineMg;

    if (mg > profile.dailyLimitMg || mg > 350) {
      return {
        liquidGradStart: '#f43f5e',
        liquidGradEnd: '#be123c',
        glowColor: 'rgba(244, 63, 94, 0.45)',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300',
        stateLabel: 'Limit Exceeded',
        icon: ShieldAlert,
      };
    } else if (mg > 200) {
      return {
        liquidGradStart: '#f59e0b',
        liquidGradEnd: '#d97706',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
        stateLabel: 'Elevated',
        icon: Flame,
      };
    } else if (mg >= 40) {
      return {
        liquidGradStart: '#10b981',
        liquidGradEnd: '#059669',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300',
        stateLabel: 'Optimal Focus',
        icon: Zap,
      };
    } else if (mg > 0.05) {
      return {
        liquidGradStart: '#06b6d4',
        liquidGradEnd: '#0284c7',
        glowColor: 'rgba(6, 182, 212, 0.3)',
        badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800 dark:text-cyan-300',
        stateLabel: 'Residual',
        icon: HeartPulse,
      };
    } else {
      return {
        liquidGradStart: '#94a3b8',
        liquidGradEnd: '#64748b',
        glowColor: 'rgba(148, 163, 184, 0.1)',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
        stateLabel: 'System Clear',
        icon: Sparkles,
      };
    }
  }, [summary.currentCaffeineMg, profile.dailyLimitMg]);

  // Bubbles ONLY generated when there is active liquid
  const bubbleList = useMemo(() => {
    if (fillPercentage === 0) return [];
    const count = fizzBurst || isRecentLogged ? 30 : 16;
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        cx: 48 + ((i * 17) % 104),
        r: 1.2 + (i % 3) * 0.8,
        speed: 1.1 + (i % 4) * 0.3,
        delay: (i % 6) * 0.2,
      });
    }
    return list;
  }, [fillPercentage, fizzBurst, isRecentLogged]);

  const StatusIcon = themeColors.icon;

  // Rate of decay right now in mg/hour
  const ke = Math.LN2 / profile.halfLifeHours;
  const decayRatePerHour = (summary.currentCaffeineMg * ke).toFixed(1);

  // Liquid height in SVG coordinates (from y=350 down to y=55)
  const canBaseY = 352;
  const canTopY = 56;
  const canLiquidHeight = canBaseY - canTopY; // 296
  const liquidY = canBaseY - (fillPercentage / 100) * canLiquidHeight;

  return (
    <div className="relative select-none w-full">
      {/* Outer ambient liquid / stimulation glow */}
      {fillPercentage > 0 && (
        <div
          className="absolute left-2 top-2 w-28 h-36 rounded-full blur-2xl opacity-30 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${themeColors.glowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Side-by-side compact health widget */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Left: The Brand New "Stimly" Kinetic Vessel */}
        <div
          onClick={triggerFizz}
          className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0 flex flex-col items-center"
          title={fillPercentage > 0 ? 'Tap to agitate fizz bubbles' : 'Can is empty'}
        >
          <svg
            viewBox="0 0 200 395"
            className="w-20 sm:w-22 h-auto drop-shadow-xl overflow-visible block"
          >
            <defs>
              {/* Ground Contact Soft Drop Shadow */}
              <radialGradient id="canGroundShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0f172a" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>

              {/* Machined Satin Titanium Body (Echoing logo.png's metallic texture) */}
              <linearGradient id="stimlyChassisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="8%" stopColor="#334155" />
                <stop offset="22%" stopColor="#64748b" />
                <stop offset="38%" stopColor="#94a3b8" />
                <stop offset="46%" stopColor="#f1f5f9" />
                <stop offset="56%" stopColor="#cbd5e1" />
                <stop offset="78%" stopColor="#475569" />
                <stop offset="92%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* High-Gloss Specular Refraction Strip */}
              <linearGradient id="stimlySpecular" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="36%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="44%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="52%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="75%" stopColor="#000000" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>

              {/* Top Rim Machined Collar Gradients (Echoing the outer ring of logo.png) */}
              <linearGradient id="rimMetallicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="20%" stopColor="#94a3b8" />
                <stop offset="46%" stopColor="#ffffff" />
                <stop offset="74%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Inner Translucent Fluid Chamber Glow */}
              <linearGradient id="stimlyFluidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={themeColors.liquidGradEnd} stopOpacity="0.92" />
                <stop offset="80%" stopColor={themeColors.liquidGradStart} stopOpacity="0.95" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
              </linearGradient>

              {/* Dynamic Wave Froth Foam */}
              <linearGradient id="waveFrothGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="48%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
              </linearGradient>

              {/* Precise Stimly Modern Can Silhouette */}
              <clipPath id="stimlyCanClip">
                <path d="
                  M 48,24 
                  L 152,24 
                  L 165,58 
                  L 165,342 
                  L 150,368 
                  L 50,368 
                  L 35,342 
                  L 35,58 
                  Z
                " />
              </clipPath>

              {/* Liquid Fill Clip */}
              <clipPath id="stimlyLiquidClip">
                <rect x="0" y={liquidY} width="200" height={400 - liquidY} />
              </clipPath>
            </defs>

            {/* Ground Contact Soft Drop Shadow */}
            <ellipse cx="100" cy="380" rx="68" ry="9" fill="url(#canGroundShadow)" />

            {/* MAIN CAN BODY (Clipped to precision 250ml slim silhouette) */}
            <g clipPath="url(#stimlyCanClip)">
              {/* Layer 1: Brushed Titanium Chassis */}
              <rect x="30" y="20" width="140" height="355" fill="url(#stimlyChassisGrad)" />

              {/* Fine vertical brushed grain texture */}
              <line x1="55" y1="20" x2="55" y2="370" stroke="#ffffff" strokeWidth="0.4" opacity="0.2" />
              <line x1="72" y1="20" x2="72" y2="370" stroke="#ffffff" strokeWidth="0.6" opacity="0.22" />
              <line x1="86" y1="20" x2="86" y2="370" stroke="#ffffff" strokeWidth="0.5" opacity="0.18" />
              <line x1="128" y1="20" x2="128" y2="370" stroke="#000000" strokeWidth="0.5" opacity="0.15" />
              <line x1="144" y1="20" x2="144" y2="370" stroke="#000000" strokeWidth="0.6" opacity="0.12" />

              {/* Layer 2: ACTIVE FLUID CHAMBER (Bateman PK equation fill) */}
              {fillPercentage > 0 && (
                <g clipPath="url(#stimlyLiquidClip)">
                  {/* Glowing kinetic fluid */}
                  <rect
                    x="30"
                    y="20"
                    width="140"
                    height="355"
                    fill="url(#stimlyFluidGrad)"
                    opacity="0.86"
                  />

                  {/* Dynamic oscillating wave crest */}
                  <g transform={`translate(0, ${liquidY - 4})`}>
                    {/* Back wave */}
                    <path
                      d="M 32,5 Q 68,-3 100,5 T 168,5 L 168,20 L 32,20 Z"
                      fill={themeColors.liquidGradStart}
                      opacity="0.75"
                    />
                    {/* Front wave */}
                    <path
                      d="M 32,5 Q 72,13 100,5 T 168,5 L 168,20 L 32,20 Z"
                      fill={themeColors.liquidGradEnd}
                      opacity="0.85"
                    />
                    {/* Frothy effervescent wave crest line */}
                    <path
                      d="M 32,5 Q 66,10 100,4 T 168,5 L 168,8 L 32,8 Z"
                      fill="url(#waveFrothGrad)"
                      opacity="0.95"
                    />
                  </g>

                  {/* Streaming Carbonation Fizz Micro-bubbles */}
                  {bubbleList.map((b) => (
                    <g
                      key={b.id}
                      className="animate-fizz"
                      style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.speed}s` }}
                    >
                      <circle
                        cx={b.cx}
                        cy={liquidY + 14 + (b.id * 13) % Math.max(10, 340 - liquidY)}
                        r={b.r}
                        fill="#ffffff"
                        opacity="0.9"
                      />
                      <circle
                        cx={b.cx - b.r * 0.3}
                        cy={(liquidY + 14 + (b.id * 13) % Math.max(10, 340 - liquidY)) - b.r * 0.3}
                        r={b.r * 0.35}
                        fill="#ffffff"
                      />
                    </g>
                  ))}
                </g>
              )}

              {/* Layer 3: THE ICONIC STIMLY TITANIUM MEDALLION (Embedded logo.png disc) */}
              <g transform="translate(100, 130)">
                {/* Outer Chamfer Ring */}
                <circle cx="0" cy="0" r="28" fill="#1e293b" opacity="0.3" />
                <circle
                  cx="0"
                  cy="0"
                  r="27"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  opacity="0.75"
                />

                {/* The authentic logo.png circular metallic lid disc */}
                <image
                  href="/logo.png"
                  x="-25"
                  y="-25"
                  width="50"
                  height="50"
                  className="drop-shadow-md"
                />

                {/* Subtle core aperture glow matching active fluid state */}
                {fillPercentage > 0 && (
                  <circle
                    cx="0"
                    cy="0"
                    r="5.5"
                    fill={themeColors.liquidGradStart}
                    opacity="0.8"
                    className="animate-pulse"
                  />
                )}
              </g>

              {/* Layer 4: Laser-etched STIMLY Brand Identity Typography */}
              <g>
                <text
                  x="100"
                  y="186"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="3.5"
                  opacity="0.92"
                  className="drop-shadow-sm"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  STIMLY
                </text>
                <text
                  x="100"
                  y="199"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="6"
                  fontWeight="700"
                  letterSpacing="1.8"
                  opacity="0.8"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  250 ML · KINETIC
                </text>
              </g>

              {/* Layer 5: Precision Measurement Calibration Tick Marks */}
              <g opacity="0.5">
                <line x1="148" y1="110" x2="155" y2="110" stroke="#ffffff" strokeWidth="0.8" />
                <text x="145" y="112" textAnchor="end" fontSize="5" fill="#ffffff" fontFamily="monospace">200</text>

                <line x1="150" y1="170" x2="155" y2="170" stroke="#ffffff" strokeWidth="0.8" />
                <text x="145" y="172" textAnchor="end" fontSize="5" fill="#ffffff" fontFamily="monospace">150</text>

                <line x1="148" y1="230" x2="155" y2="230" stroke="#ffffff" strokeWidth="0.8" />
                <text x="145" y="232" textAnchor="end" fontSize="5" fill="#ffffff" fontFamily="monospace">100</text>

                <line x1="150" y1="290" x2="155" y2="290" stroke="#ffffff" strokeWidth="0.8" />
                <text x="145" y="292" textAnchor="end" fontSize="5" fill="#ffffff" fontFamily="monospace">50</text>
              </g>

              {/* Layer 6: Ice-Cold Crisp Condensation Beads */}
              <g opacity="0.7">
                {/* Scattered cold condensation droplets */}
                <ellipse cx="64" cy="85" rx="1.8" ry="2.4" fill="#ffffff" opacity="0.6" />
                <ellipse cx="64.5" cy="84.5" rx="0.6" ry="0.8" fill="#ffffff" />

                <ellipse cx="138" cy="95" rx="2" ry="3" fill="#ffffff" opacity="0.55" />
                <ellipse cx="138.5" cy="94.5" rx="0.7" ry="1" fill="#ffffff" />

                <ellipse cx="58" cy="225" rx="2.2" ry="3.2" fill="#ffffff" opacity="0.6" />
                <ellipse cx="58.5" cy="224.5" rx="0.8" ry="1.1" fill="#ffffff" />

                <ellipse cx="142" cy="245" rx="1.6" ry="2.2" fill="#ffffff" opacity="0.5" />
                <ellipse cx="68" cy="310" rx="2" ry="2.6" fill="#ffffff" opacity="0.55" />
                <ellipse cx="134" cy="315" rx="1.8" ry="2.4" fill="#ffffff" opacity="0.5" />
              </g>

              {/* Layer 7: Specular Cylindrical Reflection Bar Overlay */}
              <rect
                x="30"
                y="20"
                width="140"
                height="355"
                fill="url(#stimlySpecular)"
                style={{ mixBlendMode: 'overlay' }}
              />
            </g>

            {/* TOP RECESSED LID BASIN & METALLIC LIP (Matching logo.png aperture profile) */}
            {/* Recessed Basin plate */}
            <ellipse cx="100" cy="24" rx="51" ry="5.5" fill="#0f172a" stroke="#475569" strokeWidth="0.6" />

            {/* Outer Beveled Rim Collar */}
            <path
              d="
                M 48,24 
                C 48,18 152,18 152,24 
                C 152,29 48,29 48,24 
                Z
              "
              fill="url(#rimMetallicGrad)"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />

            {/* Top Stay-on Pull Tab & Rivet */}
            <ellipse cx="100" cy="24" rx="15" ry="2.4" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.6" />
            <circle cx="100" cy="24" r="1.5" fill="#334155" />

            {/* BOTTOM TAPERED CHIME RIM & CONCAVE BASE */}
            <path
              d="
                M 50,368 
                C 50,375 150,375 150,368 
                L 146,374 
                C 146,379 54,379 54,374 
                Z
              "
              fill="url(#rimMetallicGrad)"
              stroke="#64748b"
              strokeWidth="0.7"
            />
          </svg>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 opacity-70 group-hover:opacity-100 transition">
            {fizzBurst ? 'Agitated!' : 'Tap to fizz'}
          </span>
        </div>

        {/* Right: Telemetry & Bio-Metrics */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Status Badge & Half-Life Indicator */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${themeColors.badgeBg} transition-colors shadow-xs`}
            >
              <StatusIcon className="w-3 h-3 shrink-0" />
              <span>{themeColors.stateLabel}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 tabular-nums font-semibold">
              {profile.halfLifeHours}h T½
            </span>
          </div>

          {/* Primary Circulating Value */}
          <div className="flex items-baseline gap-1.5 my-0.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums leading-none">
              {summary.currentCaffeineMg.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display">
              mg active
            </span>
          </div>

          {/* Dynamic Fill Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full my-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fillPercentage}%`,
                background: `linear-gradient(90deg, ${themeColors.liquidGradStart}, ${themeColors.liquidGradEnd})`,
              }}
            />
          </div>

          {/* Metabolic Clearance Status */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            {summary.currentCaffeineMg > 0.05 ? (
              <>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums text-xs">
                  -{decayRatePerHour} mg/h
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 tabular-nums text-xs">
                  {Math.round(fillPercentage)}% filled
                </span>
              </>
            ) : (
              <span className="font-medium text-slate-500 dark:text-slate-400 text-[11px]">
                0% · System Clear
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
