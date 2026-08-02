import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Moon, Sun, Globe, Download, LogOut, Trash2, Cloud, Check, AlertCircle, Play } from 'lucide-react';
import { UserProfile, UserSettings } from '../types';
import { canInstallPWA, promptPWAInstall } from '../lib/pwa';
import { playDot, playDash } from '../lib/audio';

interface SettingsViewProps {
  user: UserProfile | null;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenAuth: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings,
  onUpdateSettings,
  onOpenAuth,
  onResetData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  const handleTestSound = () => {
    playDot(settings.soundSpeed, settings.soundPitch);
    setTimeout(() => {
      playDash(settings.soundSpeed, settings.soundPitch);
    }, 200);
  };

  const handleInstallPWA = async () => {
    const success = await promptPWAInstall();
    if (success) {
      setPwaInstalled(true);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Settings Top Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">환경 설정</h2>
            <p className="text-xs text-slate-400 mt-0.5">계정, 소리 속도, 테마 및 앱 설정</p>
          </div>
        </div>
      </div>

      {/* Account Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">계정 정보</h3>
        {user ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  user.nickname.slice(0, 1)
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{user.nickname}</h4>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-all"
            >
              계정 관리
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">체험 사용자로 이용 중</h4>
              <p className="text-[11px] text-slate-400">Google 계정으로 로그인하고 진도를 백업하세요.</p>
            </div>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95 shrink-0"
            >
              로그인
            </button>
          </div>
        )}
      </div>

      {/* Sound Settings */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">소리 설정</h3>

        {/* Sound Enable Switch */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">음향 효과</span>
            <span className="text-xs text-slate-400">모스부호 신호음 재생</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Sound Speed Option */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 block">신호음 속도</span>
          <div className="grid grid-cols-6 gap-1">
            {[
              { id: '0.5x', label: '0.5×' },
              { id: '0.75x', label: '0.75×' },
              { id: '1.0x', label: '1.0×' },
              { id: '1.25x', label: '1.25×' },
              { id: '1.5x', label: '1.5×' },
              { id: '2.0x', label: '2.0×' },
            ].map((spd) => (
              <button
                key={spd.id}
                onClick={() => onUpdateSettings({ soundSpeed: spd.id as any })}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center ${
                  settings.soundSpeed === spd.id || 
                  (settings.soundSpeed === 'normal' && spd.id === '1.0x') ||
                  (settings.soundSpeed === 'slow' && spd.id === '0.75x') ||
                  (settings.soundSpeed === 'very-slow' && spd.id === '0.5x') ||
                  (settings.soundSpeed === 'fast' && spd.id === '1.5x') ||
                  (settings.soundSpeed === 'very-fast' && spd.id === '2.0x')
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Sound Button */}
        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-xs text-slate-400">현재 소리 미리듣기</span>
          <button
            onClick={handleTestSound}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>소리 테스트</span>
          </button>
        </div>
      </div>

      {/* Theme & Display */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">디스플레이 테마</h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'dark', label: '다크 모드', icon: Moon },
            { id: 'light', label: '라이트 모드', icon: Sun },
            { id: 'system', label: '시스템 설정', icon: Globe },
          ].map((thm) => {
            const Icon = thm.icon;
            const isActive = settings.theme === thm.id;
            return (
              <button
                key={thm.id}
                onClick={() => onUpdateSettings({ theme: thm.id as any })}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{thm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PWA App Install Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-400" />
              스마트폰 앱으로 설치 (PWA)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              홈 화면에 앱 아이콘을 추가하여 언제든 빠르게 접속하세요.
            </p>
          </div>
          <button
            onClick={handleInstallPWA}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
          >
            앱 설치
          </button>
        </div>
      </div>

      {/* Reset Data */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-wider">데이터 관리</h3>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>학습 진도 및 기록 초기화</span>
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl space-y-2 text-center">
            <p className="text-xs font-bold text-red-300">
              정말로 모든 학습 진도와 퀴즈 기록을 초기화하시겠습니까?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold shadow-md"
              >
                초기화 확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
