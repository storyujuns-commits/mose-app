import React from 'react';
import { Home, BookOpen, Brain, BarChart3, Settings } from 'lucide-react';

export type TabType = 'home' | 'learn' | 'quiz' | 'stats' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: '홈', icon: Home },
    { id: 'learn' as TabType, label: '학습', icon: BookOpen },
    { id: 'quiz' as TabType, label: '퀴즈', icon: Brain },
    { id: 'stats' as TabType, label: '통계', icon: BarChart3 },
    { id: 'settings' as TabType, label: '설정', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[44px] rounded-xl transition-all ${
                isActive
                  ? 'text-blue-400 font-bold bg-blue-500/10'
                  : 'text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
