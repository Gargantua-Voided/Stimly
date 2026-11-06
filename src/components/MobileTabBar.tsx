import React from 'react';
import { Home, Plus, Settings } from 'lucide-react';

export type MobileTab = 'home' | 'settings';

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onOpenQuickLog: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickLog,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe">
      <div className="max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Center Prominent Action: The Big Plus to Add Drink */}
        <div className="flex flex-col items-center justify-center flex-1 h-full">
          <button
            onClick={onOpenQuickLog}
            className="w-13 h-13 -mt-6 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 transition-all border-4 border-slate-50 dark:border-slate-950"
            title="Log Beverage"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[11px] mt-0.5 tracking-tight font-semibold text-emerald-600 dark:text-emerald-400">
            Add
          </span>
        </div>

        {/* Tab 2: Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'settings'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Settings
            className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-2'}`}
          />
          <span className="text-[11px] mt-1 tracking-tight">Settings</span>
        </button>
      </div>
    </div>
  );
};
