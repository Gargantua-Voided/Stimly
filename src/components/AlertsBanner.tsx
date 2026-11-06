import React from 'react';
import { AlertTriangle, Moon, ShieldAlert } from 'lucide-react';
import { MetabolismSummary, UserProfile } from '../types';

interface AlertsBannerProps {
  summary: MetabolismSummary;
  profile: UserProfile;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({ summary, profile }) => {
  const alerts: {
    id: string;
    type: 'danger' | 'warning';
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [];

  // 1. Daily Limit Alert
  if (profile.alertDailyLimit) {
    if (summary.dailyTotalMg >= profile.dailyLimitMg) {
      alerts.push({
        id: 'limit_exceeded',
        type: 'danger',
        title: `Daily Limit Exceeded (${summary.dailyTotalMg} / ${profile.dailyLimitMg} mg)`,
        description:
          'Your total caffeine today has entered the clinical danger zone. Expect elevated heart rate, jitteriness, and disrupted sleep.',
        icon: ShieldAlert,
      });
    } else if (summary.dailyTotalMg >= profile.dailyLimitMg * 0.8) {
      alerts.push({
        id: 'limit_near',
        type: 'warning',
        title: `Approaching Daily Limit (${summary.percentOfDailyLimit}%)`,
        description: `You have consumed ${summary.dailyTotalMg} mg out of your ${profile.dailyLimitMg} mg target. Switch to hydration for the rest of the day.`,
        icon: AlertTriangle,
      });
    }
  }

  // 2. High mg/kg exposure alert
  if (profile.alertHighDose && summary.mgPerKg > 5.7) {
    alerts.push({
      id: 'high_mg_kg',
      type: 'warning',
      title: `High Biomass Exposure (${summary.mgPerKg} mg/kg)`,
      description: `EFSA health authorities recommend staying under 5.7 mg/kg daily for healthy adults (${Math.round(5.7 * profile.weightKg)} mg for your ${profile.weightKg}kg weight).`,
      icon: AlertTriangle,
    });
  }

  // 3. Bedtime Sleep Interference Alert
  if (profile.alertBedtime && summary.bedtimeRemainingMg > profile.bedtimeThresholdMg) {
    const isSevere = summary.bedtimeRemainingMg > 50;
    alerts.push({
      id: 'bedtime_alert',
      type: isSevere ? 'danger' : 'warning',
      title: `Bedtime Sleep Interference (${summary.bedtimeRemainingMg} mg at ${profile.bedtime})`,
      description: isSevere
        ? `High caffeine levels at bedtime will delay sleep onset and suppress restorative deep/REM sleep. Safe clearance to <${profile.bedtimeThresholdMg}mg projected by ${summary.sleepClearanceTime || 'early morning'}.`
        : `Elevated residual caffeine may cause lighter sleep. Expected to clear below ${profile.bedtimeThresholdMg}mg threshold by ${summary.sleepClearanceTime || 'bedtime'}.`,
      icon: Moon,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        const isDanger = alert.type === 'danger';

        return (
          <div
            key={alert.id}
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 shadow-sm transition ${
              isDanger
                ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200'
                : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isDanger
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                {alert.title}
              </h4>
              <p className="text-[11px] sm:text-xs opacity-90 mt-0.5 leading-relaxed">
                {alert.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
