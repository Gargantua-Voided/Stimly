import { Drink, MetabolismSummary, PharmacokineticPoint, UserProfile } from '../types';

// Absorption rate constant ka (approx 2.77 hr^-1 -> absorption t1/2 = ~15 mins, peak at 35-45 mins)
export const ABSORPTION_RATE_CONSTANT = 2.77;

/**
 * Calculates remaining active caffeine (mg) from a single dose at time t (ms)
 * using the 1-compartment Bateman oral pharmacokinetic function.
 */
export function calculateSingleDoseCaffeine(
  caffeineMg: number,
  consumptionTimeMs: number,
  targetTimeMs: number,
  halfLifeHours: number
): number {
  const deltaHours = (targetTimeMs - consumptionTimeMs) / (1000 * 60 * 60);

  if (deltaHours < 0) return 0;

  const ke = Math.LN2 / Math.max(0.5, halfLifeHours);
  const ka = ABSORPTION_RATE_CONSTANT;

  if (Math.abs(ka - ke) < 0.0001) {
    // Limit case when ka == ke
    return caffeineMg * ka * deltaHours * Math.exp(-ke * deltaHours);
  }

  // Bateman oral absorption model:
  // C(t) = Dose * (ka / (ka - ke)) * (e^(-ke*t) - e^(-ka*t))
  const multiplier = ka / (ka - ke);
  const remaining = caffeineMg * multiplier * (Math.exp(-ke * deltaHours) - Math.exp(-ka * deltaHours));

  return Math.max(0, remaining);
}

/**
 * Calculates total cumulative active caffeine across all drinks at target time
 */
export function calculateTotalCaffeineAtTime(
  drinks: Drink[],
  targetTimeMs: number,
  halfLifeHours: number
): number {
  let total = 0;
  for (const drink of drinks) {
    const drinkTimeMs = new Date(drink.timestamp).getTime();
    total += calculateSingleDoseCaffeine(drink.caffeineMg, drinkTimeMs, targetTimeMs, halfLifeHours);
  }
  return total;
}

/**
 * Parses user bedtime string (e.g. "23:00") into timestamp for the relevant night
 */
export function getBedtimeTimestamp(bedtimeStr: string, referenceTime: Date = new Date()): number {
  const [hoursStr, minutesStr] = bedtimeStr.split(':');
  const bedtime = new Date(referenceTime);
  const hours = parseInt(hoursStr, 10) || 23;
  const minutes = parseInt(minutesStr, 10) || 0;

  bedtime.setHours(hours, minutes, 0, 0);

  // If bedtime hour is past midnight (e.g. 01:00) and current time is evening (e.g. 21:00),
  // bedtime belongs to the next calendar morning.
  if (hours < 12 && referenceTime.getHours() >= 12) {
    bedtime.setDate(bedtime.getDate() + 1);
  }
  // If bedtime was earlier today (e.g. 22:00 and now it is 23:30), target is tonight/passed
  return bedtime.getTime();
}

/**
 * Calculates comprehensive metabolism summary metrics for the dashboard
 */
export function calculateMetabolismSummary(
  drinks: Drink[],
  profile: UserProfile,
  currentTimeMs: number = Date.now()
): MetabolismSummary {
  const now = new Date(currentTimeMs);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  // Drinks consumed today
  const todaysDrinks = drinks.filter((d) => {
    const t = new Date(d.timestamp).getTime();
    return t >= startOfDay && t <= endOfDay;
  });

  const dailyTotalMg = todaysDrinks.reduce((sum, d) => sum + d.caffeineMg, 0);
  const currentCaffeineMg = calculateTotalCaffeineAtTime(drinks, currentTimeMs, profile.halfLifeHours);

  // mg / kg exposure
  const weight = Math.max(30, profile.weightKg || 70);
  const mgPerKg = Number((dailyTotalMg / weight).toFixed(2));

  // Bedtime calculation
  const bedtimeMs = getBedtimeTimestamp(profile.bedtime, now);
  const bedtimeRemainingMg = calculateTotalCaffeineAtTime(drinks, bedtimeMs, profile.halfLifeHours);

  let bedtimeSleepStatus: 'optimal' | 'mild' | 'disrupted' = 'optimal';
  if (bedtimeRemainingMg > 50) {
    bedtimeSleepStatus = 'disrupted';
  } else if (bedtimeRemainingMg > profile.bedtimeThresholdMg) {
    bedtimeSleepStatus = 'mild';
  }

  // Find sleep clearance time (time when remaining caffeine drops below bedtimeThresholdMg, e.g. 25 mg)
  let sleepClearanceTime: string | null = null;
  if (currentCaffeineMg > profile.bedtimeThresholdMg) {
    // Step forward in 10-minute increments up to 36 hours
    for (let offset = 0; offset <= 36 * 60; offset += 5) {
      const futureTime = currentTimeMs + offset * 60 * 1000;
      const futureMg = calculateTotalCaffeineAtTime(drinks, futureTime, profile.halfLifeHours);
      if (futureMg <= profile.bedtimeThresholdMg) {
        const d = new Date(futureTime);
        sleepClearanceTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      }
    }
  }

  // Find peak caffeine level today
  let peakCaffeineTodayMg = currentCaffeineMg;
  let peakTimeLabel: string | null = null;

  if (todaysDrinks.length > 0) {
    let maxMg = 0;
    let maxTimeMs = currentTimeMs;

    // Scan today's window with 5 min steps
    for (let t = startOfDay; t <= currentTimeMs + 4 * 3600 * 1000; t += 5 * 60 * 1000) {
      const val = calculateTotalCaffeineAtTime(drinks, t, profile.halfLifeHours);
      if (val > maxMg) {
        maxMg = val;
        maxTimeMs = t;
      }
    }
    peakCaffeineTodayMg = Math.round(maxMg * 10) / 10;
    const peakDate = new Date(maxTimeMs);
    peakTimeLabel = peakDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const percentOfDailyLimit = Math.min(
    200,
    Math.round((dailyTotalMg / Math.max(100, profile.dailyLimitMg)) * 100)
  );

  // Heart rate impact calculation based on active caffeine and body weight
  const baseBpm = profile.baselineHeartRateBpm || 68;
  const weightFactor = 70 / Math.max(40, profile.weightKg || 70);

  // Clinical Emax pharmacodynamic model for caffeine chronotropic effect
  let bpmDelta = 0;
  if (currentCaffeineMg > 0.5) {
    const eMax = 22; // Maximum acute increase in resting heart rate
    const ec50 = 170 / weightFactor; // Half-maximal response concentration in mg
    bpmDelta = Number(((eMax * currentCaffeineMg) / (ec50 + currentCaffeineMg)).toFixed(1));
  }
  const estimatedBpm = Math.round(baseBpm + bpmDelta);

  let heartStatus: MetabolismSummary['heartStatus'] = 'normal';
  if (bpmDelta >= 13 || estimatedBpm >= 92) {
    heartStatus = 'high-stimulation';
  } else if (bpmDelta >= 7 || estimatedBpm >= 80) {
    heartStatus = 'moderate-elevation';
  } else if (bpmDelta >= 2.0) {
    heartStatus = 'mild-elevation';
  }

  return {
    currentCaffeineMg: Math.round(currentCaffeineMg * 10) / 10,
    dailyTotalMg: Math.round(dailyTotalMg),
    mgPerKg,
    bedtimeRemainingMg: Math.round(bedtimeRemainingMg * 10) / 10,
    bedtimeSleepStatus,
    sleepClearanceTime,
    peakCaffeineTodayMg,
    peakTimeLabel,
    percentOfDailyLimit,
    estimatedBpm,
    bpmDelta,
    heartStatus,
  };
}

/**
 * Generates continuous timeline data for the 24-hour pharmacokinetic chart
 */
export function generateTimelineData(
  drinks: Drink[],
  profile: UserProfile,
  referenceTimeMs: number = Date.now(),
  spanHours: number = 24
): { points: PharmacokineticPoint[]; peakPoints: { drinkId: string; timeMs: number; peakMg: number; label: string }[] } {
  const points: PharmacokineticPoint[] = [];
  const peakPoints: { drinkId: string; timeMs: number; peakMg: number; label: string }[] = [];

  const refDate = new Date(referenceTimeMs);
  // Start from midnight of today or 6 hours ago
  const startOfDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 0, 0, 0, 0).getTime();
  const startTime = startOfDay;
  const endTime = startTime + spanHours * 60 * 60 * 1000;

  // Sampling resolution: every 10 minutes gives 144 points for smooth 24h curve
  const stepMs = 10 * 60 * 1000;

  for (let t = startTime; t <= endTime; t += stepMs) {
    const pointDate = new Date(t);
    const timeLabel = pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let totalMg = 0;
    const individualDoses: { [drinkId: string]: number } = {};

    for (const drink of drinks) {
      const drinkTimeMs = new Date(drink.timestamp).getTime();
      const doseMg = calculateSingleDoseCaffeine(drink.caffeineMg, drinkTimeMs, t, profile.halfLifeHours);
      if (doseMg > 0.05) {
        individualDoses[drink.id] = Math.round(doseMg * 10) / 10;
        totalMg += doseMg;
      }
    }

    points.push({
      time: t,
      timeLabel,
      totalMg: Math.round(totalMg * 10) / 10,
      individualDoses,
    });
  }

  // Calculate analytical peak points for each drink for clean visual badges
  const ke = Math.LN2 / profile.halfLifeHours;
  const ka = ABSORPTION_RATE_CONSTANT;
  const tPeakDeltaHours = Math.log(ka / ke) / (ka - ke);

  for (const drink of drinks) {
    const drinkTimeMs = new Date(drink.timestamp).getTime();
    if (drinkTimeMs >= startTime - 8 * 3600 * 1000 && drinkTimeMs <= endTime) {
      const peakTimeMs = drinkTimeMs + tPeakDeltaHours * 3600 * 1000;
      const peakMg = calculateSingleDoseCaffeine(drink.caffeineMg, drinkTimeMs, peakTimeMs, profile.halfLifeHours);
      const peakDate = new Date(peakTimeMs);
      const timeStr = peakDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      peakPoints.push({
        drinkId: drink.id,
        timeMs: peakTimeMs,
        peakMg: Math.round(peakMg),
        label: `${drink.name} Peak (${Math.round(peakMg)}mg @ ${timeStr})`,
      });
    }
  }

  return { points, peakPoints };
}
