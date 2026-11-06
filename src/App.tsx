/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { AnimatedCan } from './components/AnimatedCan';
import { HeartVisualizer } from './components/HeartVisualizer';
import { CaffeineChart } from './components/CaffeineChart';
import { SteadyStatePacer } from './components/SteadyStatePacer';
import { QuickLogBar } from './components/QuickLogBar';
import { QuickLogSheet } from './components/QuickLogSheet';
import { DrinkHistory } from './components/DrinkHistory';
import { DrinkModal } from './components/DrinkModal';
import { SettingsView } from './components/SettingsView';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AlertsBanner } from './components/AlertsBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileTabBar, MobileTab } from './components/MobileTabBar';
import { Drink, DrinkPreset, UserProfile } from './types';
import {
  getDrinks,
  saveDrink,
  deleteDrink,
  clearAllDrinks,
  getPresets,
  savePreset,
  getUserProfile,
  saveUserProfile,
  factoryResetAll,
  DEFAULT_PROFILE,
  DEFAULT_PRESETS,
} from './db/storage';
import { calculateMetabolismSummary } from './utils/pharmacokinetics';
import { Zap, Moon, Scale } from 'lucide-react';

export default function App() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [presets, setPresets] = useState<DrinkPreset[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active Mobile Tab: home | log | settings
  const [activeTab, setActiveTab] = useState<MobileTab>('home');

  // Modal and Wizard states
  const [isQuickLogSheetOpen, setIsQuickLogSheetOpen] = useState(false);
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
  const [selectedPresetForModal, setSelectedPresetForModal] = useState<DrinkPreset | null>(null);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [recentLoggedTrigger, setRecentLoggedTrigger] = useState(false);

  // Real-time clock for decay updates
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync document class for light/dark theme
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Initial database load from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedDrinks, loadedPresets, loadedProfile] = await Promise.all([
          getDrinks(),
          getPresets(),
          getUserProfile(),
        ]);
        setDrinks(loadedDrinks);
        setPresets(loadedPresets);
        setProfile(loadedProfile);

        // If user has not completed onboarding wizard, show it!
        if (!loadedProfile.hasCompletedOnboarding) {
          setIsOnboardingOpen(true);
        }
      } catch (err) {
        console.error('Error loading initial data from IndexedDB:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Compute live pharmacokinetic metabolism metrics
  const summary = useMemo(() => {
    return calculateMetabolismSummary(drinks, profile, currentTimeMs);
  }, [drinks, profile, currentTimeMs]);

  // Theme toggle
  const handleToggleTheme = useCallback(async () => {
    const nextTheme: 'light' | 'dark' = profile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...profile, theme: nextTheme };
    await saveUserProfile(updated);
    setProfile(updated);
  }, [profile]);

  // Quick preset log handler
  const handleQuickLog = useCallback(
    async (preset: DrinkPreset) => {
      const newDrink: Drink = {
        id: `drink_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: preset.name,
        brand: preset.brand,
        volumeMl: preset.volumeMl,
        caffeineMg: preset.caffeineMg,
        timestamp: new Date().toISOString(),
        category: preset.category,
        color: preset.color,
      };

      await saveDrink(newDrink);
      setDrinks((prev) => [newDrink, ...prev]);

      setRecentLoggedTrigger(true);
      setTimeout(() => setRecentLoggedTrigger(false), 2000);
    },
    []
  );

  const handleSaveDrink = useCallback(
    async (drinkData: Omit<Drink, 'id'>, saveAsPresetFlag: boolean) => {
      if (editingDrink) {
        const updated: Drink = { ...drinkData, id: editingDrink.id };
        await saveDrink(updated);
        setDrinks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        setEditingDrink(null);
      } else {
        const newDrink: Drink = {
          ...drinkData,
          id: `drink_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        await saveDrink(newDrink);
        setDrinks((prev) => [newDrink, ...prev]);

        if (saveAsPresetFlag) {
          const newPreset: DrinkPreset = {
            id: `preset_${Date.now()}`,
            name: newDrink.name,
            brand: newDrink.brand,
            volumeMl: newDrink.volumeMl,
            caffeineMg: newDrink.caffeineMg,
            color: newDrink.color,
            category: newDrink.category,
            iconType: 'can-custom',
          };
          await savePreset(newPreset);
          setPresets((prev) => [...prev, newPreset]);
        }

        setRecentLoggedTrigger(true);
        setTimeout(() => setRecentLoggedTrigger(false), 2000);
      }
    },
    [editingDrink]
  );

  const handleDeleteDrink = useCallback(async (drinkId: string) => {
    await deleteDrink(drinkId);
    setDrinks((prev) => prev.filter((d) => d.id !== drinkId));
  }, []);

  const handleClearAllDrinks = useCallback(async () => {
    await clearAllDrinks();
    setDrinks([]);
  }, []);

  const handleSaveProfile = useCallback(async (newProfile: UserProfile) => {
    await saveUserProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const handleOnboardingComplete = useCallback(async (onboardingProfile: UserProfile) => {
    await saveUserProfile(onboardingProfile);
    setProfile(onboardingProfile);
    setIsOnboardingOpen(false);
  }, []);

  const handleUpdateBaselineBpm = useCallback(
    async (newBpm: number) => {
      const updated: UserProfile = { ...profile, baselineHeartRateBpm: newBpm };
      await saveUserProfile(updated);
      setProfile(updated);
    },
    [profile]
  );

  const handleUpdateSteadyStateTarget = useCallback(
    async (newTarget: number) => {
      const updated: UserProfile = { ...profile, steadyStateTargetMg: newTarget };
      await saveUserProfile(updated);
      setProfile(updated);
    },
    [profile]
  );

  const handleLogMicrodoseSip = useCallback(
    async (caffeineMg: number, volumeMl: number) => {
      const newDrink: Drink = {
        id: `drink_${Date.now()}_sip`,
        name: `Microdose Sip (~${volumeMl}ml)`,
        brand: 'Steady-State Sip',
        volumeMl: volumeMl,
        caffeineMg: caffeineMg,
        timestamp: new Date().toISOString(),
        category: 'energy-drink',
        color: '#10b981',
      };
      await saveDrink(newDrink);
      setDrinks((prev) => [newDrink, ...prev]);
      setRecentLoggedTrigger(true);
      setTimeout(() => setRecentLoggedTrigger(false), 2000);
    },
    []
  );

  // Factory reset: wipes IndexedDB and restarts setup wizard
  const handleFactoryReset = useCallback(async () => {
    await factoryResetAll();
    setDrinks([]);
    setPresets(DEFAULT_PRESETS);
    const freshProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      hasCompletedOnboarding: false,
    };
    setProfile(freshProfile);
    setIsOnboardingOpen(true);
    setActiveTab('home');
  }, []);

  const handleTabChange = useCallback((tab: MobileTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-mono">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors antialiased">
      {/* Dynamically Responsive Viewport Container */}
      <div className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen bg-slate-50 dark:bg-[#070a11] flex flex-col shadow-2xl relative border-x border-slate-200/80 dark:border-slate-800/80 pb-24 transition-all duration-300">
        {/* Mobile Top App Bar */}
        <Header theme={profile.theme} onToggleTheme={handleToggleTheme} />

        {/* Alerts Banner */}
        <div className="px-4 sm:px-6 pt-3">
          <AlertsBanner summary={summary} profile={profile} />
        </div>

        {/* TAB 1: HOME (Responsive 2-column on desktop/tablet, single-column on mobile) */}
        {activeTab === 'home' && (
          <main className="flex-1 px-4 sm:px-6 py-4 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column on Desktop / Top on Mobile: Can + Timeline + Pacer */}
              <div className="lg:col-span-7 space-y-4">
                {/* Compact Live Can Monitor Card */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm">
                  <AnimatedCan
                    summary={summary}
                    profile={profile}
                    isRecentLogged={recentLoggedTrigger}
                  />
                </div>

                {/* METABOLISM TIMELINE (Directly below the can - Expanded Star Section) */}
                <CaffeineChart
                  drinks={drinks}
                  profile={profile}
                  summary={summary}
                  currentTimeMs={currentTimeMs}
                  targetSteadyStateMg={profile.steadyStateTargetMg || 100}
                />

                {/* STEADY-STATE PACER (Microdose sip recommendations, timer & audio alert) */}
                <SteadyStatePacer
                  summary={summary}
                  profile={profile}
                  currentTimeMs={currentTimeMs}
                  targetMg={profile.steadyStateTargetMg || 100}
                  onUpdateTargetMg={handleUpdateSteadyStateTarget}
                  onLogMicrodoseSip={handleLogMicrodoseSip}
                />
              </div>

              {/* Right Column on Desktop / Middle on Mobile: Vitals + Quick Log + Living Heart */}
              <div className="lg:col-span-5 space-y-4">
                {/* Health Vitals Summary Row */}
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2.5">
                  {/* Daily Intake */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Intake</span>
                    </div>
                    <div className="my-1.5">
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none">
                        {summary.dailyTotalMg}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">mg</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            summary.percentOfDailyLimit > 100
                              ? 'bg-rose-500'
                              : summary.percentOfDailyLimit > 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, summary.percentOfDailyLimit)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {summary.percentOfDailyLimit}% of {profile.dailyLimitMg}mg
                    </span>
                  </div>

                  {/* Bedtime Level */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Bedtime</span>
                    </div>
                    <div className="my-1.5">
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none">
                        {summary.bedtimeRemainingMg}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">mg</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {summary.bedtimeSleepStatus === 'optimal'
                        ? '✓ Sleep Safe'
                        : '⚠️ Disrupted'}
                    </span>
                  </div>

                  {/* Body Exposure (mg/kg) */}
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <Scale className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Exposure</span>
                    </div>
                    <div className="my-1.5">
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none">
                        {summary.mgPerKg.toFixed(1)}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">mg/kg</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {profile.weightKg} kg weight
                    </span>
                  </div>
                </div>

                {/* Quick Log Presets */}
                <QuickLogBar
                  presets={presets}
                  onLogPreset={handleQuickLog}
                  onOpenCustomModal={() => setIsQuickLogSheetOpen(true)}
                />

                {/* BOLDLY PRESENT ON HOME: Heart Rate Monitor & Living ECG */}
                <HeartVisualizer
                  summary={summary}
                  profile={profile}
                  onOpenSettings={() => setActiveTab('settings')}
                  onUpdateBaselineBpm={handleUpdateBaselineBpm}
                />
              </div>

              {/* Full Width at Bottom: Drink History Log */}
              <div id="drink-log-section" className="lg:col-span-12">
                <DrinkHistory
                  drinks={drinks}
                  halfLifeHours={profile.halfLifeHours}
                  currentTimeMs={currentTimeMs}
                  onEditDrink={(drink) => {
                    setEditingDrink(drink);
                    setIsDrinkModalOpen(true);
                  }}
                  onDeleteDrink={handleDeleteDrink}
                  onClearAll={handleClearAllDrinks}
                />
              </div>
            </div>
          </main>
        )}

        {/* TAB 2: SETTINGS (Modify data, rerun wizard, factory reset) */}
        {activeTab === 'settings' && (
          <main className="flex-1 px-4 sm:px-6 py-4 space-y-4 animate-in fade-in duration-200 max-w-3xl mx-auto w-full">
            <SettingsView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onRerunWizard={() => setIsOnboardingOpen(true)}
              onFactoryReset={handleFactoryReset}
              onClearDrinkHistory={handleClearAllDrinks}
              drinkCount={drinks.length}
            />
          </main>
        )}

        {/* Mobile Fixed Bottom Navigation Bar - Plus button triggers QuickLogSheet */}
        <MobileTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenQuickLog={() => setIsQuickLogSheetOpen(true)}
        />

        {/* Quick Log Sheet GUI: 1-tap for 4 cans or microdose sip */}
        <QuickLogSheet
          isOpen={isQuickLogSheetOpen}
          onClose={() => setIsQuickLogSheetOpen(false)}
          presets={presets}
          onLogPreset={handleQuickLog}
          onLogSip={handleLogMicrodoseSip}
          onOpenCustomModal={() => {
            setSelectedPresetForModal(null);
            setEditingDrink(null);
            setIsDrinkModalOpen(true);
          }}
          steadyStateTargetMg={profile.steadyStateTargetMg || 100}
        />

        {/* Modals & Wizards */}
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          initialProfile={profile}
          onComplete={handleOnboardingComplete}
        />

        <DrinkModal
          isOpen={isDrinkModalOpen}
          onClose={() => {
            setIsDrinkModalOpen(false);
            setEditingDrink(null);
            setSelectedPresetForModal(null);
          }}
          onSaveDrink={handleSaveDrink}
          initialPreset={selectedPresetForModal}
          editDrink={editingDrink}
        />

        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </div>
  );
}
