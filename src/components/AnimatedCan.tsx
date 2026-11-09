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

  // Dynamic theme colors - Crisp, very light yellow energy drink profile!
  const themeColors = useMemo(() => {
    const mg = summary.currentCaffeineMg;

    if (mg > profile.dailyLimitMg || mg > 350) {
      return {
        liquidGradStart: '#fde047',
        liquidGradMid: '#f97316',
        liquidGradEnd: '#dc2626',
        liquidGradSurface: '#fef08a',
        glowColor: 'rgba(239, 68, 68, 0.45)',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300',
        stateLabel: 'Limit Exceeded',
        icon: ShieldAlert,
      };
    } else if (mg > 200) {
      return {
        liquidGradStart: '#fef08a',
        liquidGradMid: '#fde047',
        liquidGradEnd: '#ca8a04',
        liquidGradSurface: '#fef9c3',
        glowColor: 'rgba(234, 179, 8, 0.45)',
        badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-300',
        stateLabel: 'Elevated Energy',
        icon: Flame,
      };
    } else if (mg >= 40) {
      // Classic crisp very light yellow energy drink palette
      return {
        liquidGradStart: '#fef08a',
        liquidGradMid: '#fde047',
        liquidGradEnd: '#eab308',
        liquidGradSurface: '#fefce8',
        glowColor: 'rgba(250, 204, 21, 0.45)',
        badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-300',
        stateLabel: 'Optimal Energy',
        icon: Zap,
      };
    } else if (mg > 0.05) {
      // Very light pale pastel yellow for residual caffeine
      return {
        liquidGradStart: '#fef9c3',
        liquidGradMid: '#fef08a',
        liquidGradEnd: '#facc15',
        liquidGradSurface: '#ffffff',
        glowColor: 'rgba(253, 224, 71, 0.35)',
        badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-300',
        stateLabel: 'Residual',
        icon: HeartPulse,
      };
    } else {
      return {
        liquidGradStart: '#94a3b8',
        liquidGradMid: '#64748b',
        liquidGradEnd: '#475569',
        liquidGradSurface: '#cbd5e1',
        glowColor: 'rgba(148, 163, 184, 0.12)',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
        stateLabel: 'System Clear',
        icon: Sparkles,
      };
    }
  }, [summary.currentCaffeineMg, profile.dailyLimitMg]);

  // Bubbles ONLY generated when there is active liquid
  const bubbleList = useMemo(() => {
    if (fillPercentage === 0) return [];
    const count = fizzBurst || isRecentLogged ? 46 : 26;
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        cx: 46 + ((i * 17) % 108),
        r: 0.9 + (i % 4) * 0.55,
        speed: 1.0 + (i % 5) * 0.28,
        delay: (i % 7) * 0.18,
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
      {/* Outer ambient golden-yellow energy drink glow */}
      {fillPercentage > 0 && (
        <div
          className="absolute left-2 top-2 w-32 h-44 rounded-full blur-2xl opacity-40 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${themeColors.glowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Side-by-side generous health widget */}
      <div className="flex items-center gap-5 sm:gap-7 lg:gap-8">
        {/* Left: Authentic Brushed Silver Aluminum Can with Golden Energy Liquid */}
        <div
          onClick={triggerFizz}
          className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0 flex flex-col items-center"
          title={fillPercentage > 0 ? 'Tap to agitate energy fizz' : 'Can is empty'}
        >
          <svg
            viewBox="0 0 200 375"
            className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto drop-shadow-xl overflow-visible block"
          >
            <defs>
              {/* Soft ground contact shadow */}
              <radialGradient id="canDropShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#020617" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#020617" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>

              {/* Authentic Brushed Silver Aluminum Can Body Gradient */}
              <linearGradient id="silverCanChassisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="7%" stopColor="#94a3b8" />
                <stop offset="18%" stopColor="#cbd5e1" />
                <stop offset="34%" stopColor="#f1f5f9" />
                <stop offset="44%" stopColor="#ffffff" />
                <stop offset="54%" stopColor="#e2e8f0" />
                <stop offset="72%" stopColor="#cbd5e1" />
                <stop offset="88%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Cylindrical Silver Specular High-Gloss Sheen */}
              <linearGradient id="silverSpecularSheen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
                <stop offset="18%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="48%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="72%" stopColor="#000000" stopOpacity="0.03" />
                <stop offset="90%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
              </linearGradient>

              {/* Full-Width Brushed Silver Rim / Double-Seam Bead */}
              <linearGradient id="silverRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="20%" stopColor="#cbd5e1" />
                <stop offset="44%" stopColor="#ffffff" />
                <stop offset="72%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Brushed Silver Recessed Lid Basin */}
              <linearGradient id="silverLidBasinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="40%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Silver Stay-on Pull Tab Metal */}
              <linearGradient id="silverTabMetalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="35%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              {/* Transparent Logo Backlight / Luminous Halo (Ensures dark 'S' pops with contrast) */}
              <radialGradient id="logoLuminousHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </radialGradient>

              {/* Crisp Very Light Yellow Energy Drink Liquid Gradient */}
              <linearGradient id="goldenEnergyLiquidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={themeColors.liquidGradEnd} stopOpacity="0.92" />
                <stop offset="30%" stopColor={themeColors.liquidGradEnd} stopOpacity="0.9" />
                <stop offset="62%" stopColor={themeColors.liquidGradMid} stopOpacity="0.92" />
                <stop offset="85%" stopColor={themeColors.liquidGradStart} stopOpacity="0.94" />
                <stop offset="100%" stopColor={themeColors.liquidGradSurface} stopOpacity="0.98" />
              </linearGradient>

              {/* Cylindrical Translucent Light Yellow Fluid Sheen & Specular Center Glow */}
              <linearGradient id="energyLiquidDepthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.18" />
                <stop offset="16%" stopColor="#eab308" stopOpacity="0.05" />
                <stop offset="46%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="62%" stopColor="#fefce8" stopOpacity="0.25" />
                <stop offset="86%" stopColor="#eab308" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.2" />
              </linearGradient>

              {/* Effervescent Champagne-Citrus Light Foam Crest Gradient */}
              <linearGradient id="energyWaveFrothGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="30%" stopColor="#fefce8" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="70%" stopColor="#fefce8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.85" />
              </linearGradient>

              {/* Authentic Slim Beverage Can Silhouette (Shoulder taper + chime base) */}
              <clipPath id="slimSilverCanSilhouetteClip">
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

            {/* MAIN CAN BODY (Clipped to authentic slim silver can silhouette) */}
            <g clipPath="url(#slimSilverCanSilhouetteClip)">
              {/* Base Brushed Silver Aluminum Body */}
              <rect x="30" y="24" width="140" height="340" fill="url(#silverCanChassisGrad)" />

              {/* Fine vertical brushed aluminum grain lines */}
              <line x1="52" y1="24" x2="52" y2="355" stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
              <line x1="68" y1="24" x2="68" y2="355" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
              <line x1="88" y1="24" x2="88" y2="355" stroke="#ffffff" strokeWidth="0.5" opacity="0.25" />
              <line x1="126" y1="24" x2="126" y2="355" stroke="#475569" strokeWidth="0.5" opacity="0.18" />
              <line x1="144" y1="24" x2="144" y2="355" stroke="#334155" strokeWidth="0.6" opacity="0.2" />

              {/* DYNAMIC AMBER-GOLD ENERGY DRINK LIQUID FILL */}
              {fillPercentage > 0 ? (
                <g clipPath="url(#canLiquidClip)">
                  {/* Glowing active radiant amber-gold energy liquid */}
                  <rect
                    x="30"
                    y="24"
                    width="140"
                    height="340"
                    fill="url(#goldenEnergyLiquidGrad)"
                  />

                  {/* Translucent cylindrical fluid depth and center luminescence */}
                  <rect
                    x="30"
                    y="24"
                    width="140"
                    height="340"
                    fill="url(#energyLiquidDepthGrad)"
                  />

                  {/* Animated Wave Meniscus at the liquid surface */}
                  <g transform={`translate(0, ${liquidY - 4})`}>
                    <path
                      d="M 32,5 Q 68,-3 100,5 T 168,5 L 168,22 L 32,22 Z"
                      fill={themeColors.liquidGradStart}
                      opacity="0.88"
                    />
                    <path
                      d="M 32,5 Q 72,13 100,5 T 168,5 L 168,22 L 32,22 Z"
                      fill={themeColors.liquidGradMid}
                      opacity="0.75"
                    />
                    {/* Very light yellow froth wave crest */}
                    <path
                      d="M 32,5 Q 66,10 100,4 T 168,5 L 168,8 L 32,8 Z"
                      fill="url(#energyWaveFrothGrad)"
                      opacity="0.98"
                    />
                  </g>

                  {/* Rising Effervescent Micro-Bubbles */}
                  {bubbleList.map((b) => (
                    <g
                      key={b.id}
                      className="animate-fizz"
                      style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.speed}s` }}
                    >
                      <circle
                        cx={b.cx}
                        cy={liquidY + 12 + (b.id * 13) % Math.max(10, 330 - liquidY)}
                        r={b.r}
                        fill="#ffffff"
                        opacity="0.92"
                      />
                      <circle
                        cx={b.cx - b.r * 0.3}
                        cy={(liquidY + 12 + (b.id * 13) % Math.max(10, 330 - liquidY)) - b.r * 0.3}
                        r={b.r * 0.35}
                        fill="#fefce8"
                        opacity="0.98"
                      />
                    </g>
                  ))}
                </g>
              ) : (
                /* Resting baseline line when at 0mg in empty silver can */
                <path
                  d="M 36,346 Q 68,343 100,346 T 164,346"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  opacity="0.4"
                  fill="none"
                />
              )}

              {/* Upper Can Telemetry Text (Clean laser-etched style) */}
              <g>
                <text
                  x="48"
                  y="72"
                  fill="#475569"
                  fontSize="7"
                  fontWeight="800"
                  letterSpacing="1.2"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  BIO-METRIC
                </text>
                <text
                  x="152"
                  y="72"
                  textAnchor="end"
                  fill="#475569"
                  fontSize="7"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {profile.halfLifeHours}h T½
                </text>
              </g>

              {/* CENTERED TRANSPARENT LOGO (Seamless on silver can with luminous contrast halo) */}
              <g transform="translate(100, 148)">
                {/* Luminous circular halo behind transparent logo so dark 'S' is crisp on silver */}
                <circle cx="0" cy="0" r="32" fill="url(#logoLuminousHalo)" />

                {/* Transparent logo.png placed directly on silver body */}
                <image
                  href={logoSrc}
                  x="-28"
                  y="-28"
                  width="56"
                  height="56"
                  className="drop-shadow-md"
                />

                {/* Stimly Brand Typography (Clean dark graphite on silver) */}
                <text
                  x="0"
                  y="46"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="3"
                  className="drop-shadow-xs"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  STIMLY
                </text>
                <text
                  x="0"
                  y="58"
                  textAnchor="middle"
                  fill="#334155"
                  fontSize="6"
                  fontWeight="700"
                  letterSpacing="1.4"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  250 ML · ENERGY
                </text>
              </g>

              {/* Lower Status Indicator inside can */}
              <g>
                <text
                  x="48"
                  y="326"
                  fill="#475569"
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
                  fill="#1e293b"
                  fontSize="7.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {summary.currentCaffeineMg.toFixed(0)} mg
                </text>
              </g>

              {/* Ice-Cold Frost Condensation Droplets */}
              <g opacity="0.65">
                <ellipse cx="62" cy="88" rx="1.6" ry="2.2" fill="#ffffff" opacity="0.7" />
                <ellipse cx="62.5" cy="87.5" rx="0.5" ry="0.7" fill="#ffffff" />

                <ellipse cx="140" cy="98" rx="1.8" ry="2.6" fill="#ffffff" opacity="0.65" />
                <ellipse cx="140.5" cy="97.5" rx="0.6" ry="0.9" fill="#ffffff" />

                <ellipse cx="56" cy="235" rx="2" ry="2.8" fill="#ffffff" opacity="0.7" />
                <ellipse cx="56.5" cy="234.5" rx="0.7" ry="1" fill="#ffffff" />

                <ellipse cx="144" cy="255" rx="1.5" ry="2" fill="#ffffff" opacity="0.6" />
                <ellipse cx="64" cy="295" rx="1.8" ry="2.4" fill="#ffffff" opacity="0.65" />
                <ellipse cx="136" cy="300" rx="1.6" ry="2.2" fill="#ffffff" opacity="0.6" />
              </g>

              {/* Cylindrical Silver High-Gloss Specular Sheen Overlay */}
              <rect x="30" y="24" width="140" height="340" fill="url(#silverSpecularSheen)" />
            </g>

            {/* TOP RECESSED SILVER LID & STAY-ON PULL TAB */}
            {/* Full-width double-seam silver crimped lip */}
            <path
              d="
                M 48,28 
                C 48,20 152,20 152,28 
                C 152,34 48,34 48,28 
                Z
              "
              fill="url(#silverRimGrad)"
            />

            {/* Recessed Silver Lid Counter-Sink Bowl */}
            <ellipse cx="100" cy="28" rx="50" ry="5.8" fill="url(#silverLidBasinGrad)" />

            {/* Lid Basin Inner Seam Ring */}
            <ellipse cx="100" cy="28" rx="46" ry="4.8" fill="none" stroke="#64748b" strokeWidth="0.6" opacity="0.6" />

            {/* Aluminum Stay-on Pull Tab lying flat inside the silver lid basin */}
            <ellipse cx="100" cy="28" rx="17" ry="3.2" fill="url(#silverTabMetalGrad)" />
            {/* Tab Finger Opening */}
            <ellipse cx="91" cy="28" rx="5.5" ry="1.8" fill="#334155" />
            {/* Tab Rivet */}
            <circle cx="107" cy="28" r="1.4" fill="#475569" />

            {/* BOTTOM TAPERED BRUSHED SILVER CHIME RIM & CONCAVE BASE */}
            <path
              d="
                M 46,354 
                C 46,361 154,361 154,354 
                L 150,360 
                C 150,365 50,365 50,360 
                Z
              "
              fill="url(#silverRimGrad)"
            />
          </svg>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 opacity-70 group-hover:opacity-100 transition">
            {fizzBurst ? 'Energy Agitated!' : 'Tap to fizz'}
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

          {/* Dynamic Fill Progress Bar (Matching crisp very light yellow profile) */}
          <div className="w-full h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full my-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fillPercentage}%`,
                background: `linear-gradient(90deg, ${themeColors.liquidGradEnd}, ${themeColors.liquidGradMid}, ${themeColors.liquidGradStart})`,
              }}
            />
          </div>

          {/* Metabolic Clearance Status */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {summary.currentCaffeineMg > 0.05 ? (
              <>
                <span className="font-mono text-amber-500 dark:text-yellow-400 font-bold tabular-nums">
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
