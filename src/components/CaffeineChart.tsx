import React, { useState, useMemo, useRef } from 'react';
import { Moon, AlertTriangle, Layers, Sparkles, Target, Clock, ArrowRight } from 'lucide-react';
import { Drink, UserProfile, MetabolismSummary } from '../types';
import { generateTimelineData, getBedtimeTimestamp } from '../utils/pharmacokinetics';

interface CaffeineChartProps {
  drinks: Drink[];
  profile: UserProfile;
  currentTimeMs: number;
  targetSteadyStateMg?: number;
  summary?: MetabolismSummary;
}

export const CaffeineChart: React.FC<CaffeineChartProps> = ({
  drinks,
  profile,
  currentTimeMs,
  targetSteadyStateMg,
  summary,
}) => {
  const [timeRangeHours, setTimeRangeHours] = useState<12 | 24 | 36>(24);
  const [showIndividualCurves, setShowIndividualCurves] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const targetMg = targetSteadyStateMg ?? profile.steadyStateTargetMg ?? 100;

  // Generate Pharmacokinetic timeline dataset
  const { points, peakPoints } = useMemo(() => {
    return generateTimelineData(drinks, profile, currentTimeMs, timeRangeHours);
  }, [drinks, profile, currentTimeMs, timeRangeHours]);

  // Determine chart bounds
  const maxMg = useMemo(() => {
    let peak = Math.max(250, profile.dailyLimitMg, targetMg * 1.25);
    for (const p of points) {
      if (p.totalMg > peak) peak = p.totalMg;
    }
    return Math.ceil((peak * 1.15) / 50) * 50;
  }, [points, profile.dailyLimitMg, targetMg]);

  const chartHeight = 390;
  const chartWidth = 800;
  const padding = { top: 32, right: 35, bottom: 44, left: 56 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const minTime = points.length > 0 ? points[0].time : 0;
  const maxTime = points.length > 0 ? points[points.length - 1].time : 1;

  const getX = (t: number) => {
    if (maxTime === minTime) return padding.left;
    return padding.left + ((t - minTime) / (maxTime - minTime)) * innerWidth;
  };

  const getY = (mg: number) => {
    return padding.top + innerHeight - (Math.max(0, mg) / maxMg) * innerHeight;
  };

  // Build SVG path for cumulative curve
  const cumulativePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, pt, index) => {
      const x = getX(pt.time);
      const y = getY(pt.totalMg);
      return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  }, [points, maxMg, minTime, maxTime]);

  // Build SVG path for cumulative area fill
  const cumulativeAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baselineY = getY(0);
    const firstX = getX(points[0].time);
    const lastX = getX(points[points.length - 1].time);
    return `${cumulativePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }, [cumulativePath, points, maxMg, minTime, maxTime]);

  // Build SVG paths for individual drink curves
  const individualPaths = useMemo(() => {
    if (!showIndividualCurves) return [];
    return drinks.map((drink) => {
      const dPoints = points.map((pt) => ({
        x: getX(pt.time),
        y: getY(pt.individualDoses[drink.id] || 0),
        mg: pt.individualDoses[drink.id] || 0,
      }));

      const pathString = dPoints.reduce((p, pt, idx) => {
        return idx === 0 ? `M ${pt.x} ${pt.y}` : `${p} L ${pt.x} ${pt.y}`;
      }, '');

      return {
        drink,
        pathString,
        points: dPoints,
      };
    });
  }, [drinks, points, showIndividualCurves, maxMg, minTime, maxTime]);

  const dangerY = getY(profile.dailyLimitMg);
  const cautionY = getY(200);
  const sleepCutoffY = getY(profile.bedtimeThresholdMg);
  const targetY = getY(targetMg);

  // Compute future point where active caffeine reaches the target steady-state level
  const targetCrossingPoint = useMemo(() => {
    if (points.length === 0) return null;
    const futurePoints = points.filter((p) => p.time >= currentTimeMs);
    if (futurePoints.length === 0) return null;

    const currentActiveMg = futurePoints[0].totalMg;

    if (currentActiveMg <= targetMg) {
      return {
        status: 'ready' as const,
        time: currentTimeMs,
        timeLabel: 'Now',
        mg: currentActiveMg,
        hoursFromNow: 0,
      };
    }

    // Traverse to locate when curve descends through target level
    for (let i = 0; i < futurePoints.length; i++) {
      if (futurePoints[i].totalMg <= targetMg) {
        const pt = futurePoints[i];
        const hoursFromNow = (pt.time - currentTimeMs) / (3600 * 1000);
        return {
          status: 'future' as const,
          time: pt.time,
          timeLabel: pt.timeLabel,
          mg: pt.totalMg,
          hoursFromNow,
        };
      }
    }

    return null;
  }, [points, currentTimeMs, targetMg]);

  const nowX = getX(currentTimeMs);
  const isNowInView = currentTimeMs >= minTime && currentTimeMs <= maxTime;

  const bedtimeMs = getBedtimeTimestamp(profile.bedtime, new Date(currentTimeMs));
  const bedtimeX = getX(bedtimeMs);
  const isBedtimeInView = bedtimeMs >= minTime && bedtimeMs <= maxTime;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;

    if (svgX < padding.left || svgX > chartWidth - padding.right) {
      setHoveredPointIndex(null);
      return;
    }

    const ratio = (svgX - padding.left) / innerWidth;
    const targetTime = minTime + ratio * (maxTime - minTime);

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.time - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredPointIndex(closestIdx);
  };

  const activeHoverPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-md transition">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Metabolism Timeline
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {profile.halfLifeHours}h Half-Life
          </span>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {drinks.length > 1 && (
            <button
              onClick={() => setShowIndividualCurves(!showIndividualCurves)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                showIndividualCurves
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
              }`}
              title="Toggle individual beverage breakdown curves"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Individual Cans</span>
            </button>
          )}

          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeRangeHours(12)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                timeRangeHours === 12
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              12h
            </button>
            <button
              onClick={() => setTimeRangeHours(24)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                timeRangeHours === 24
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRangeHours(36)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                timeRangeHours === 36
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              36h
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Quick Bio-Metrics Strip */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-3">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 block font-medium">Circulating</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {(summary?.currentCaffeineMg ?? 0).toFixed(1)}
            <span className="text-[9px] font-normal text-slate-400 ml-0.5">mg</span>
          </span>
        </div>

        <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 text-center">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">Target Plateau</span>
          <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {targetMg}
            <span className="text-[9px] font-normal text-slate-400 ml-0.5">mg</span>
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
          <span className="text-[10px] text-slate-400 block font-medium">Daily Peak</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {(summary?.peakCaffeineTodayMg ?? 0).toFixed(0)}
            <span className="text-[9px] font-normal text-slate-400 ml-0.5">mg</span>
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-medium">At Bedtime</span>
          <span className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {(summary?.bedtimeRemainingMg ?? 0).toFixed(0)}
            <span className="text-[9px] font-normal text-slate-400 ml-0.5">mg</span>
          </span>
        </div>
      </div>

      {/* SVG Timeline Canvas */}
      <div className="relative mt-2 w-full select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoveredPointIndex(null)}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
              <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.08" />
              <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
            </linearGradient>

            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0.04" />
            </linearGradient>
          </defs>

          {/* DANGER ZONE RECTANGLE (above daily limit) */}
          {dangerY > padding.top && (
            <g>
              <rect
                x={padding.left}
                y={padding.top}
                width={innerWidth}
                height={Math.max(0, dangerY - padding.top)}
                fill="url(#dangerGradient)"
              />
              <line
                x1={padding.left}
                y1={dangerY}
                x2={chartWidth - padding.right}
                y2={dangerY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />
              <text
                x={chartWidth - padding.right - 6}
                y={dangerY - 6}
                textAnchor="end"
                fill="#ef4444"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                ⚠️ DAILY LIMIT DANGER ZONE ({profile.dailyLimitMg}mg)
              </text>
            </g>
          )}

          {/* CAUTION LINE (200mg single dose caution) */}
          {cautionY > padding.top && cautionY < chartHeight - padding.bottom && (
            <g>
              <line
                x1={padding.left}
                y1={cautionY}
                x2={chartWidth - padding.right}
                y2={cautionY}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.45"
              />
              <text
                x={padding.left + 8}
                y={cautionY - 5}
                fill="#d97706"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                200 mg (High Stimulation Line)
              </text>
            </g>
          )}

          {/* SLEEP INTERFERENCE CUTOFF LINE (25mg) */}
          {sleepCutoffY < chartHeight - padding.bottom && (
            <g>
              <line
                x1={padding.left}
                y1={sleepCutoffY}
                x2={chartWidth - padding.right}
                y2={sleepCutoffY}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <text
                x={padding.left + 8}
                y={sleepCutoffY - 4}
                fill="#6366f1"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {profile.bedtimeThresholdMg} mg (Deep Sleep Cutoff)
              </text>
            </g>
          )}

          {/* TARGET STEADY-STATE GUIDELINE */}
          {targetY > padding.top && targetY < chartHeight - padding.bottom && (
            <g>
              <line
                x1={padding.left}
                y1={targetY}
                x2={chartWidth - padding.right}
                y2={targetY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <rect
                x={chartWidth - padding.right - 146}
                y={targetY - 17}
                width="142"
                height="15"
                rx="3.5"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="0.8"
                opacity="0.95"
              />
              <text
                x={chartWidth - padding.right - 75}
                y={targetY - 6}
                textAnchor="middle"
                fill="#a7f3d0"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                TARGET: {targetMg}mg STABLE
              </text>
            </g>
          )}

          {/* HORIZONTAL GRID LINES & Y-AXIS LABELS */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const mgVal = Math.round(fraction * maxMg);
            const y = getY(mgVal);
            return (
              <g key={fraction}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="0.75"
                  strokeDasharray="2 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {mgVal}
                </text>
              </g>
            );
          })}

          {/* VERTICAL TIME GRID LINES & LABELS */}
          {points.length > 0 &&
            [0, 0.2, 0.4, 0.6, 0.8, 1].map((pct) => {
              const idx = Math.min(points.length - 1, Math.round(pct * (points.length - 1)));
              const pt = points[idx];
              const x = getX(pt.time);
              return (
                <g key={pct}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800/80"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 16}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {pt.timeLabel}
                  </text>
                </g>
              );
            })}

          {/* BEDTIME VERTICAL MARKER */}
          {isBedtimeInView && (
            <g>
              <line
                x1={bedtimeX}
                y1={padding.top}
                x2={bedtimeX}
                y2={chartHeight - padding.bottom}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <circle cx={bedtimeX} cy={padding.top + 8} r="5" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="1.5" />
              <text
                x={bedtimeX}
                y={padding.top - 8}
                textAnchor="middle"
                fill="#4f46e5"
                fontSize="10"
                fontFamily="Outfit, sans-serif"
                fontWeight="700"
              >
                Bedtime ({profile.bedtime})
              </text>
            </g>
          )}

          {/* INDIVIDUAL DRINK CURVES */}
          {showIndividualCurves &&
            individualPaths.map(({ drink, pathString }) => (
              <path
                key={drink.id}
                d={pathString}
                fill="none"
                stroke={drink.color || '#0284c7'}
                strokeWidth="1.75"
                strokeDasharray="4 2"
                opacity="0.8"
              />
            ))}

          {/* CUMULATIVE AREA UNDER CURVE */}
          {points.length > 0 && (
            <path d={cumulativeAreaPath} fill="url(#curveGradient)" pointerEvents="none" />
          )}

          {/* CUMULATIVE PRIMARY CURVE */}
          {points.length > 0 && (
            <path
              d={cumulativePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* PEAK CONCENTRATION POINTS & BADGES */}
          {peakPoints.map((peak) => {
            const px = getX(peak.timeMs);
            const py = getY(peak.peakMg);
            if (px < padding.left || px > chartWidth - padding.right) return null;

            return (
              <g key={peak.drinkId + peak.timeMs} className="transition-transform">
                <circle cx={px} cy={py} r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <rect
                  x={px - 28}
                  y={Math.max(padding.top + 2, py - 22)}
                  width="56"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  stroke="#059669"
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x={px}
                  y={Math.max(padding.top + 13, py - 11)}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {peak.peakMg}mg
                </text>
              </g>
            );
          })}

          {/* CURRENT TIME "NOW" VERTICAL LINE */}
          {isNowInView && (
            <g>
              <line
                x1={nowX}
                y1={padding.top}
                x2={nowX}
                y2={chartHeight - padding.bottom}
                stroke="#0284c7"
                strokeWidth="2"
                opacity="0.85"
              />
              <circle
                cx={nowX}
                cy={getY(points.find((p) => Math.abs(p.time - currentTimeMs) < 600000)?.totalMg || 0)}
                r="5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={nowX}
                y={chartHeight - padding.bottom + 28}
                textAnchor="middle"
                fill="#0284c7"
                fontSize="10"
                fontFamily="Outfit, sans-serif"
                fontWeight="700"
              >
                NOW
              </text>
            </g>
          )}

          {/* TARGET STEADY-STATE CROSSING BEACON / BOOSTER WINDOW */}
          {targetCrossingPoint &&
            targetCrossingPoint.time >= minTime &&
            targetCrossingPoint.time <= maxTime && (
              <g className="transition-all duration-300">
                <line
                  x1={getX(targetCrossingPoint.time)}
                  y1={padding.top}
                  x2={getX(targetCrossingPoint.time)}
                  y2={chartHeight - padding.bottom}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <circle
                  cx={getX(targetCrossingPoint.time)}
                  cy={getY(targetCrossingPoint.mg)}
                  r="5.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <g
                  transform={`translate(${getX(targetCrossingPoint.time)}, ${Math.max(
                    padding.top + 16,
                    getY(targetCrossingPoint.mg) - 24
                  )})`}
                >
                  <rect
                    x="-68"
                    y="-9"
                    width="136"
                    height="18"
                    rx="5"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                  >
                    🎯 {targetCrossingPoint.status === 'ready' ? 'Boost Now' : `Next Boost: ${targetCrossingPoint.timeLabel}`}
                  </text>
                </g>
              </g>
            )}

          {/* ACTIVE HOVER SCRUBBER */}
          {activeHoverPoint && (
            <g pointerEvents="none">
              <line
                x1={getX(activeHoverPoint.time)}
                y1={padding.top}
                x2={getX(activeHoverPoint.time)}
                y2={chartHeight - padding.bottom}
                stroke="#0f172a"
                className="dark:stroke-white"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={getX(activeHoverPoint.time)}
                cy={getY(activeHoverPoint.totalMg)}
                r="6"
                fill="#059669"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* HOVER TOOLTIP */}
        {activeHoverPoint && (
          <div
            className="absolute top-2 pointer-events-none z-30 transition-all duration-75"
            style={{
              left: `${Math.min(
                85,
                Math.max(15, ((getX(activeHoverPoint.time) - padding.left) / innerWidth) * 100)
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xl text-xs min-w-[170px] border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
                <span className="font-semibold text-slate-300 font-mono">
                  {activeHoverPoint.timeLabel}
                </span>
                <span className="font-bold text-emerald-400 font-mono tabular-nums">
                  {activeHoverPoint.totalMg.toFixed(1)} mg
                </span>
              </div>

              {Object.keys(activeHoverPoint.individualDoses).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(activeHoverPoint.individualDoses).map(([dId, mg]) => {
                    const matchedDrink = drinks.find((d) => d.id === dId);
                    return (
                      <div key={dId} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[100px] flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: matchedDrink?.color || '#0284c7' }}
                          />
                          {matchedDrink?.name || 'Drink'}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {mg.toFixed(1)} mg
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No active doses at this hour</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Steady-State Booster & Microdose Guidance Callout */}
      <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">
              Booster &amp; Sip Guidance:
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {targetCrossingPoint?.status === 'future'
                ? `Active caffeine glides to ${targetMg}mg target at ${targetCrossingPoint.timeLabel} (~${Math.round(targetCrossingPoint.hoursFromNow * 60)}m). Shoot another can or sip then to sustain focus.`
                : targetCrossingPoint?.status === 'ready'
                ? `Currently below ${targetMg}mg target. Shoot a can or microdose sips now to build to your steady state.`
                : `Log drinks above to calculate personalized steady-state booster windows.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <Clock className="w-3 h-3 text-emerald-500" />
          <span>
            {targetCrossingPoint?.status === 'future'
              ? targetCrossingPoint.timeLabel
              : 'Window Open'}
          </span>
        </div>
      </div>

      {/* LEGEND BAR */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-emerald-600 rounded-full" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Active Pool</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <Target className="w-3.5 h-3.5" />
            <span>{targetMg}mg Target</span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
            <Moon className="w-3.5 h-3.5" />
            <span>Bedtime Target</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>&gt;{profile.dailyLimitMg}mg Daily Limit</span>
          </div>
        </div>

        {drinks.length > 0 && showIndividualCurves && (
          <div className="flex flex-wrap items-center gap-2">
            {drinks.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[90px]">
                  {d.name}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {drinks.length === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-center">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Timeline Ready
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log your first beverage above to render your personalized elimination curve.
          </p>
        </div>
      )}
    </div>
  );
};
