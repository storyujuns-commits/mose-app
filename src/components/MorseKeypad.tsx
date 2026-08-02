import React from 'react';
import { Delete, CornerDownLeft, Volume2 } from 'lucide-react';
import { decodeMorse } from '../data/morseData';
import { playDot, playDash, playMorseCode } from '../lib/audio';
import { UserSettings } from '../types';

interface MorseKeypadProps {
  value: string;
  onChange: (newValue: string) => void;
  onSubmit?: (decodedChar?: string) => void;
  settings?: UserSettings;
  placeholder?: string;
  className?: string;
}

export const MorseKeypad: React.FC<MorseKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  settings,
  placeholder = '모스부호를 입력하세요 (예: .-)',
  className = '',
}) => {
  const decoded = decodeMorse(value);

  const handleAddDot = async () => {
    if (settings?.soundEnabled) {
      playDot(settings.soundSpeed, settings.soundPitch);
    }
    onChange(value + '.');
  };

  const handleAddDash = async () => {
    if (settings?.soundEnabled) {
      playDash(settings.soundSpeed, settings.soundPitch);
    }
    onChange(value + '-');
  };

  const handleBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handlePlayCurrent = () => {
    if (value) {
      playMorseCode(value, settings);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(decoded?.char);
    }
  };

  return (
    <div className={`bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg ${className}`}>
      {/* Display Screen */}
      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between mb-4 min-h-[90px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">입력된 모스부호</span>
          {value && (
            <button
              onClick={handlePlayCurrent}
              className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 font-medium"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>소리 듣기</span>
            </button>
          )}
        </div>

        {/* Morse Code String Display */}
        <div className="my-1 flex items-center justify-between">
          <div className="font-mono text-2xl tracking-widest font-extrabold text-blue-400 min-h-[32px] flex items-center">
            {value ? (
              value.split('').map((char, idx) => (
                <span key={idx} className="inline-block px-0.5">
                  {char === '.' ? '•' : '—'}
                </span>
              ))
            ) : (
              <span className="text-slate-600 font-sans text-sm font-normal">
                {placeholder}
              </span>
            )}
          </div>

          {/* Realtime Decoded Character */}
          {decoded && (
            <div className="bg-blue-600/20 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-lg font-bold text-lg flex items-center gap-1.5 animate-pulse">
              <span>{decoded.char}</span>
              <span className="text-xs font-normal text-blue-400/80">({decoded.reading})</span>
            </div>
          )}
        </div>
      </div>

      {/* Touch Buttons Keypad Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Dot Button */}
        <button
          type="button"
          onClick={handleAddDot}
          className="col-span-2 h-14 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-2xl flex flex-col items-center justify-center shadow-md shadow-blue-600/30 transition-all select-none"
        >
          <span className="text-3xl leading-none">•</span>
          <span className="text-[11px] font-bold text-blue-100/90 mt-0.5">[ . 점 ]</span>
        </button>

        {/* Dash Button */}
        <button
          type="button"
          onClick={handleAddDash}
          className="col-span-2 h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-2xl flex flex-col items-center justify-center shadow-md shadow-indigo-600/30 transition-all select-none"
        >
          <span className="text-2xl leading-none">—</span>
          <span className="text-[11px] font-bold text-indigo-100/90 mt-0.5">[ - 선 ]</span>
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          onClick={handleBackspace}
          className="col-span-1 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 flex items-center justify-center transition-all"
          title="지우기"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Clear All */}
        <button
          type="button"
          onClick={handleClear}
          className="col-span-1 h-12 rounded-xl bg-slate-700/60 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-bold transition-all"
        >
          전체지우기
        </button>

        {/* Submit / Enter */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value}
          className={`col-span-2 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-md ${
            value
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <span>완료</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
