import React from 'react';
import { User, Volume2, VolumeX, Flame, LogIn, Moon, Sun } from 'lucide-react';
import { UserProfile, UserProgress, UserSettings } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  progress: UserProgress;
  settings: UserSettings;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  progress,
  settings,
  onToggleSound,
  onToggleTheme,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-mono font-black text-lg">
            .-
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5">
              Morse Master
            </h1>
            <p className="text-[10px] font-semibold text-blue-400 tracking-wider">
              모스부호 마스터
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{progress.streak}일</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              settings.soundEnabled
                ? 'bg-slate-800 text-blue-400 hover:bg-slate-700'
                : 'bg-slate-800/60 text-slate-500 hover:bg-slate-800'
            }`}
            title={settings.soundEnabled ? '소리 켜짐' : '소리 꺼짐'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
            title="테마 변경"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            )}
          </button>

          {/* Profile / Login Avatar */}
          {user ? (
            <button
              onClick={onOpenAuth}
              className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-blue-500/30 hover:ring-blue-500 transition-all bg-slate-800 flex items-center justify-center"
              title={user.nickname}
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.nickname.slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm shadow-blue-600/30 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
