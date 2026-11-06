export interface Drink {
  id: string;
  name: string;
  brand: string;
  volumeMl: number;
  caffeineMg: number;
  timestamp: string; // ISO string
  color: string; // Hex color for curve & drink theme
  category: 'energy-drink' | 'coffee' | 'tea' | 'pre-workout' | 'soda' | 'other';
  notes?: string;
}

export interface DrinkPreset {
  id: string;
  name: string;
  brand: string;
  volumeMl: number;
  caffeineMg: number;
  color: string;
  category: Drink['category'];
  iconType: string;
}

export interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  baselineHeartRateBpm: number; // Resting heart rate baseline (default 68 BPM)
  dailyLimitMg: number;
  halfLifeHours: number;
  bedtime: string; // "23:00"
  bedtimeThresholdMg: number; // e.g. 25 mg for deep sleep
  metabolicSensitivity: 'fast' | 'normal' | 'slow' | 'oral-contraceptives' | 'smoker';
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  alertHighDose: boolean;
  alertBedtime: boolean;
  alertDailyLimit: boolean;
  theme: 'light' | 'dark';
  steadyStateTargetMg?: number; // Target caffeine level to keep stable (e.g. 100 mg)
  sipAlertsEnabled?: boolean; // Alerts every few minutes for microdose sips
  sipIntervalMinutes?: number; // Microdose sip interval (e.g. 20, 30, 45 min)
}

export interface PharmacokineticPoint {
  time: number; // timestamp in ms
  timeLabel: string; // "14:00"
  totalMg: number;
  individualDoses: { [drinkId: string]: number };
}

export interface MetabolismSummary {
  currentCaffeineMg: number;
  dailyTotalMg: number;
  mgPerKg: number;
  bedtimeRemainingMg: number;
  bedtimeSleepStatus: 'optimal' | 'mild' | 'disrupted';
  sleepClearanceTime: string | null; // e.g. "01:45 AM"
  peakCaffeineTodayMg: number;
  peakTimeLabel: string | null;
  percentOfDailyLimit: number;
  estimatedBpm: number; // Current calculated heart rate
  bpmDelta: number; // Increase above baseline
  heartStatus: 'normal' | 'mild-elevation' | 'moderate-elevation' | 'high-stimulation';
}
