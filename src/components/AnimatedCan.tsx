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
        glowColor: 'rgba(6, 182, 212, 0.35)',
        badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800 dark:text-cyan-300',
        stateLabel: 'Residual',
        icon: HeartPulse,
      };
    } else {
      return {
        liquidGradStart: '#38bdf8',
        liquidGradEnd: '#0284c7',
        glowColor: 'rgba(56, 189, 248, 0.15)',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
        stateLabel: 'System Clear',
        icon: Sparkles,
      };
    }
  }, [summary.currentCaffeineMg, profile.dailyLimitMg]);

  // Bubbles ONLY generated when there is active liquid
  const bubbleList = useMemo(() => {
    if (fillPercentage === 0) return [];
    const count = fizzBurst || isRecentLogged ? 28 : 14;
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        cx: 50 + ((i * 19) % 100),
        r: 1.4 + (i % 3) * 0.8,
        speed: 1.1 + (i % 4) * 0.35,
        delay: (i % 5) * 0.22,
      });
    }
    return list;
  }, [fillPercentage, fizzBurst, isRecentLogged]);

  const StatusIcon = themeColors.icon;

  // Rate of decay right now in mg/hour
  const ke = Math.LN2 / profile.halfLifeHours;
  const decayRatePerHour = (summary.currentCaffeineMg * ke).toFixed(1);

  // Liquid height in SVG coordinates (from y=348 up to y=64)
  const canBaseY = 348;
  const canTopY = 64;
  const canLiquidHeight = canBaseY - canTopY; // 284
  const liquidY = canBaseY - (fillPercentage / 100) * canLiquidHeight;

  // Logo path supporting base URL for GitHub Pages & local preview
  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <div className="relative select-none w-full">
      {/* Outer ambient liquid / stimulation glow */}
      {fillPercentage > 0 && (
        <div
          className="absolute left-2 top-2 w-28 h-36 rounded-full blur-2xl opacity-35 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${themeColors.glowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Side-by-side generous health widget */}
      <div className="flex items-center gap-5 sm:gap-7 lg:gap-8">
        {/* Left: Authentic 250ml Slim Energy Can (No borders, genuine can lid & pull-tab) */}
        <div
          onClick={triggerFizz}
          className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0 flex flex-col items-center"
          title={fillPercentage > 0 ? 'Tap to agitate fizz bubbles' : 'Can is empty'}
        >
          <svg
            viewBox="0 0 200 375"
            className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto drop-shadow-xl overflow-visible block"
          >
            <defs>
              {/* Soft ground contact shadow */}
              <radialGradient id="canDropShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#020617" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#020617" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>

              {/* Brushed aluminum can body cylindrical lighting */}
              <linearGradient id="canChassisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0f1d" />
                <stop offset="12%" stopColor="#151f38" />
                <stop offset="30%" stopColor="#223358" />
                <stop offset="44%" stopColor="#3b4f7d" />
                <stop offset="50%" stopColor="#25375e" />
                <stop offset="72%" stopColor="#151f38" />
                <stop offset="100%" stopColor="#070a14" />
              </linearGradient>

              {/* Cylindrical Glass / Aluminum Specular Reflection */}
              <linearGradient id="canSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="28%" stopColor="#ffffff" stopOpacity="0.04" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0.28" />
                <stop offset="46%" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="82%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>

              {/* Full-Width Aluminum Rim / Double-Seam Bead */}
              <linearGradient id="rimMetallicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="18%" stopColor="#cbd5e1" />
                <stop offset="40%" stopColor="#ffffff" />
                <stop offset="65%" stopColor="#cbd5e1" />
                <stop offset="85%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Recessed Lid Basin Gradient */}
              <linearGradient id="lidBasinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#090e1a" />
              </linearGradient>

              {/* Stay-on Tab Metal Gradient */}
              <linearGradient id="tabMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="45%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              {/* Transparent Logo Backlight / Luminous Halo (Ensures dark 'S' pops with contrast) */}
              <radialGradient id="logoLuminousHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </radialGradient>

              {/* Dynamic Fluid Gradient */}
              <linearGradient id="canFluidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={themeColors.liquidGradEnd} stopOpacity="0.92" />
                <stop offset="80%" stopColor={themeColors.liquidGradStart} stopOpacity="0.96" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
              </linearGradient>

              {/* Wave Froth Foam Crest */}
              <linearGradient id="waveFrothGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
              </linearGradient>

              {/* Authentic Slim Beverage Can Silhouette (Shoulder taper + chime base) */}
              <clipPath id="slimCanSilhouetteClip">
                <path d="
                  M 48,28 
                  L 152,28 
                  Q 166,40 166,62 
                  L 166,330 
                  Q 166,346 154,354 
                  L 46,354 
                  Q 34,346 34,330 
                  L 34,62 
                  Q 34,40 48,28 
                  Z
                " />
              </clipPath>

              {/* Liquid Level Clip */}
              <clipPath id="canLiquidClip">
                <rect x="0" y={liquidY} width="200" height={375 - liquidY} />
              </clipPath>
            </defs>

            {/* Soft Ground Contact Shadow */}
            <ellipse cx="100" cy="364" rx="64" ry="7" fill="url(#canDropShadow)" />

            {/* MAIN CAN BODY (No borders! Clipped to genuine slim can silhouette) */}
            <g clipPath="url(#slimCanSilhouetteClip)">
              {/* Can Body Base Chassis */}
              <rect x="30" y="24" width="140" height="340" fill="url(#canChassisGrad)" />

              {/* Fine vertical brushed aluminum grain lines */}
              <line x1="52" y1="24" x2="52" y2="355" stroke="#ffffff" strokeWidth="0.4" opacity="0.12" />
              <line x1="74" y1="24" x2="74" y2="355" stroke="#ffffff" strokeWidth="0.6" opacity="0.15" />
              <line x1="126" y1="24" x2="126" y2="355" stroke="#000000" strokeWidth="0.5" opacity="0.12" />
              <line x1="146" y1="24" x2="146" y2="355" stroke="#000000" strokeWidth="0.6" opacity="0.15" />

              {/* DYNAMIC LIQUID FILL */}
              {fillPercentage > 0 ? (
                <g clipPath="url(#canLiquidClip)">
                  {/* Glowing active liquid */}
                  <rect
                    x="30"
                    y="24"
                    width="140"
                    height="340"
                    fill="url(#canFluidGrad)"
                    opacity="0.88"
                  />

                  {/* Animated Wave Meniscus at the liquid surface */}
                  <g transform={`translate(0, ${liquidY - 4})`}>
                    <path
                      d="M 32,5 Q 68,-3 100,5 T 168,5 L 168,22 L 32,22 Z"
                      fill={themeColors.liquidGradStart}
                      opacity="0.75"
                    />
                    <path
                      d="M 32,5 Q 72,13 100,5 T 168,5 L 168,22 L 32,22 Z"
                      fill={themeColors.liquidGradEnd}
                      opacity="0.85"
                    />
                    <path
                      d="M 32,5 Q 66,10 100,4 T 168,5 L 168,8 L 32,8 Z"
                      fill="url(#waveFrothGrad)"
                      opacity="0.95"
                    />
                  </g>

                  {/* Rising Effervescent Fizz Micro-Bubbles */}
                  {bubbleList.map((b) => (
                    <g
                      key={b.id}
                      className="animate-fizz"
                      style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.speed}s` }}
                    >
                      <circle
                        cx={b.cx}
                        cy={liquidY + 14 + (b.id * 14) % Math.max(10, 330 - liquidY)}
                        r={b.r}
                        fill="#ffffff"
                        opacity="0.9"
                      />
                      <circle
                        cx={b.cx - b.r * 0.3}
                        cy={(liquidY + 14 + (b.id * 14) % Math.max(10, 330 - liquidY)) - b.r * 0.3}
                        r={b.r * 0.35}
                        fill="#ffffff"
                      />
                    </g>
                  ))}
                </g>
              ) : (
                /* Resting baseline neon line when at 0mg */
                <path
                  d="M 36,346 Q 68,343 100,346 T 164,346"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  opacity="0.4"
                  fill="none"
                />
              )}

              {/* Upper Can Telemetry Text (Subtle & Integrated) */}
              <g>
                <text
                  x="48"
                  y="72"
                  fill="#94a3b8"
                  fontSize="7"
                  fontWeight="700"
                  letterSpacing="1.2"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  BIO-METRIC
                </text>
                <text
                  x="152"
                  y="72"
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="7"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {profile.halfLifeHours}h T½
                </text>
              </g>

              {/* CENTERED TRANSPARENT LOGO (Seamless on the can with luminous contrast halo) */}
              <g transform="translate(100, 148)">
                {/* Luminous circular halo behind transparent logo so dark 'S' is crisp on any background */}
                <circle cx="0" cy="0" r="32" fill="url(#logoLuminousHalo)" />

                {/* Transparent logo.png placed directly on the can with zero boxy borders */}
                <image
                  href={logoSrc}
                  x="-28"
                  y="-28"
                  width="56"
                  height="56"
                  className="drop-shadow-md"
                />

                {/* Stimly Brand Typography */}
                <text
                  x="0"
                  y="46"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="3"
                  className="drop-shadow-sm"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  STIMLY
                </text>
                <text
                  x="0"
                  y="58"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="6"
                  fontWeight="700"
                  letterSpacing="1.4"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  250 ML · ACTIVE
                </text>
              </g>

              {/* Lower Status Indicator inside can */}
              <g>
                <text
                  x="48"
                  y="326"
                  fill="#64748b"
                  fontSize="6.5"
                  fontWeight="700"
                  letterSpacing="1"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  CIRCULATING
                </text>
                <text
                  x="152"
                  y="326"
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {summary.currentCaffeineMg.toFixed(0)} mg
                </text>
              </g>

              {/* Ice-Cold Frost Condensation Droplets (Crisp & Natural) */}
              <g opacity="0.65">
                <ellipse cx="62" cy="88" rx="1.6" ry="2.2" fill="#ffffff" opacity="0.6" />
                <ellipse cx="62.5" cy="87.5" rx="0.5" ry="0.7" fill="#ffffff" />

                <ellipse cx="140" cy="98" rx="1.8" ry="2.6" fill="#ffffff" opacity="0.55" />
                <ellipse cx="140.5" cy="97.5" rx="0.6" ry="0.9" fill="#ffffff" />

                <ellipse cx="56" cy="235" rx="2" ry="2.8" fill="#ffffff" opacity="0.6" />
                <ellipse cx="56.5" cy="234.5" rx="0.7" ry="1" fill="#ffffff" />

                <ellipse cx="144" cy="255" rx="1.5" ry="2" fill="#ffffff" opacity="0.5" />
                <ellipse cx="64" cy="295" rx="1.8" ry="2.4" fill="#ffffff" opacity="0.55" />
                <ellipse cx="136" cy="300" rx="1.6" ry="2.2" fill="#ffffff" opacity="0.5" />
              </g>

              {/* Cylindrical Specular Highlight Sheen Overlay */}
              <rect x="30" y="24" width="140" height="340" fill="url(#canSpecular)" />
            </g>

            {/* TOP RECESSED LID & STAY-ON PULL TAB (Authentic beverage can lid, NOT a battery terminal!) */}
            {/* Full-width double-seam crimped lip */}
            <path
              d="
                M 48,28 
                C 48,20 152,20 152,28 
                C 152,34 48,34 48,28 
                Z
              "
              fill="url(#rimMetallicGrad)"
            />

            {/* Recessed Lid Counter-Sink Bowl */}
            <ellipse cx="100" cy="28" rx="50" ry="5.8" fill="url(#lidBasinGrad)" />

            {/* Lid Basin Inner Seam Ring */}
            <ellipse cx="100" cy="28" rx="46" ry="4.8" fill="none" stroke="#475569" strokeWidth="0.6" opacity="0.5" />

            {/* Authentic Aluminum Stay-on Pull Tab lying flat inside the lid basin */}
            <ellipse cx="100" cy="28" rx="17" ry="3.2" fill="url(#tabMetalGrad)" />
            {/* Tab Finger Opening */}
            <ellipse cx="91" cy="28" rx="5.5" ry="1.8" fill="#090e1a" />
            {/* Tab Rivet */}
            <circle cx="107" cy="28" r="1.4" fill="#334155" />

            {/* BOTTOM TAPERED CHIME RIM & CONCAVE BASE (Authentic beverage can bottom chime) */}
            <path
              d="
                M 46,354 
                C 46,361 154,361 154,354 
                L 150,360 
                C 150,365 50,365 50,360 
                Z
              "
              fill="url(#rimMetallicGrad)"
            />
          </svg>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 opacity-70 group-hover:opacity-100 transition">
            {fizzBurst ? 'Agitated!' : 'Tap to fizz'}
          </span>
        </div>

        {/* Right: Telemetry & Bio-Metrics */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {/* Status Badge & Half-Life Indicator */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${themeColors.badgeBg} transition-colors shadow-xs`}
            >
              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{themeColors.stateLabel}</span>
            </div>
            <span className="font-mono text-xs sm:text-sm text-slate-400 tabular-nums font-semibold">
              {profile.halfLifeHours}h T½
            </span>
          </div>

          {/* Primary Circulating Value */}
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums leading-none">
              {summary.currentCaffeineMg.toFixed(1)}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 font-display">
              mg active
            </span>
          </div>

          {/* Dynamic Fill Progress Bar */}
          <div className="w-full h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full my-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fillPercentage}%`,
                background: `linear-gradient(90deg, ${themeColors.liquidGradStart}, ${themeColors.liquidGradEnd})`,
              }}
            />
          </div>

          {/* Metabolic Clearance Status */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {summary.currentCaffeineMg > 0.05 ? (
              <>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                  -{decayRatePerHour} mg/h
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                  {Math.round(fillPercentage)}% filled
                </span>
              </>
            ) : (
              <span className="font-medium text-slate-500 dark:text-slate-400">
                0% · System Clear
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
