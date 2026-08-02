import React, { useState, useRef } from 'react';
import {
  Volume2,
  RotateCcw,
  CornerDownLeft,
  Delete,
  Copy,
  Check,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import {
  decodeMorseStringToText,
  encodeTextToMorse,
  decodeMorse,
} from '../data/morseData';
import { playDot, playDash, playMorseCode } from '../lib/audio';
import { UserSettings } from '../types';

interface MorseConverterProps {
  settings?: UserSettings;
  className?: string;
  externalInput?: string;
}

export const MorseConverter: React.FC<MorseConverterProps> = ({
  settings,
  className = '',
  externalInput,
}) => {
  // Input text (Morse or Text)
  const [inputVal, setInputVal] = useState('');
  // Last conversion result
  const [resultText, setResultText] = useState('');
  // Conversion mode: 'morseToText' or 'textToMorse'
  const [mode, setMode] = useState<'morseToText' | 'textToMorse'>('morseToText');
  // Copy confirmation state
  const [isCopied, setIsCopied] = useState(false);

  // Conversion History List
  const [history, setHistory] = useState<
    { id: string; input: string; output: string; timestamp: string }[]
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize external input if provided from reference table
  React.useEffect(() => {
    if (externalInput !== undefined) {
      setInputVal((prev) => (prev ? `${prev} ${externalInput}` : externalInput));
    }
  }, [externalInput]);

  // Handle dot touch tap
  const handleAddDot = () => {
    if (settings?.soundEnabled) {
      playDot(settings.soundSpeed, settings.soundPitch);
    }
    setInputVal((prev) => prev + '.');
    inputRef.current?.focus();
  };

  // Handle dash touch tap
  const handleAddDash = () => {
    if (settings?.soundEnabled) {
      playDash(settings.soundSpeed, settings.soundPitch);
    }
    setInputVal((prev) => prev + '-');
    inputRef.current?.focus();
  };

  // Handle space touch tap (word separator '/')
  const handleAddSpace = () => {
    setInputVal((prev) => (prev.endsWith(' ') ? prev + '/ ' : prev + ' '));
    inputRef.current?.focus();
  };

  // Handle backspace
  const handleBackspace = () => {
    setInputVal((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  // 1. Completion / Submit handler (완료 버튼 클릭 시 순서)
  // 1) 입력된 모스부호 변환 실행
  // 2) 결과 표시
  // 3) 입력 텍스트창 자동 초기화
  // 4) 다음 입력을 바로 할 수 있도록 입력창 유지
  const handleConvert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    let converted = '';
    if (mode === 'morseToText') {
      // Decode Morse string to human text (e.g. "... --- ..." -> "SOS")
      converted = decodeMorseStringToText(inputVal.trim());
    } else {
      // Encode human text to Morse string (e.g. "SOS" -> "... --- ...")
      converted = encodeTextToMorse(inputVal.trim());
    }

    // Fallback if empty or space
    if (!converted) converted = inputVal.trim();

    // Set output result
    setResultText(converted);

    // Add to history
    const newEntry = {
      id: Date.now().toString(),
      input: inputVal.trim(),
      output: converted,
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);

    // Automatically clear the input text field
    setInputVal('');

    // Play result audio if enabled
    if (settings?.soundEnabled) {
      if (mode === 'morseToText') {
        playMorseCode(inputVal.trim(), settings);
      } else {
        playMorseCode(converted, settings);
      }
    }

    // Keep input window focused for immediate next entry
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // 2. Reset button handler (초기화 버튼)
  // - 입력 내용 삭제
  // - 결과 내용 삭제
  // - 입력 상태 초기화
  const handleReset = () => {
    setInputVal('');
    setResultText('');
    inputRef.current?.focus();
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  // Real-time live preview decoding for morseToText mode
  const livePreview =
    mode === 'morseToText' && inputVal.trim()
      ? decodeMorseStringToText(inputVal.trim())
      : mode === 'textToMorse' && inputVal.trim()
      ? encodeTextToMorse(inputVal.trim())
      : '';

  return (
    <div
      className={`bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-xl space-y-4 ${className}`}
    >
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>모스부호 변환기</span>
        </h3>

        {/* Mode Switcher */}
        <button
          onClick={() => {
            setMode((prev) =>
              prev === 'morseToText' ? 'textToMorse' : 'morseToText'
            );
            setInputVal('');
            setResultText('');
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-xs font-bold text-blue-300 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>
            {mode === 'morseToText' ? '모스 → 텍스트' : '텍스트 → 모스'}
          </span>
        </button>
      </div>

      {/* 1. Result Display Window (변환 결과 표시 영역) */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-inner min-h-[100px] flex flex-col justify-between relative group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            변환 결과
          </span>

          {resultText && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => playMorseCode(resultText, settings)}
                className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-medium flex items-center gap-1 transition-all"
                title="결과 소리 듣기"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>재생</span>
              </button>

              <button
                onClick={handleCopyResult}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-all"
                title="결과 복사하기"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>복사</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Main Result Text */}
        <div className="my-2">
          {resultText ? (
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-wide break-all">
              {resultText}
            </div>
          ) : (
            <div className="text-xs text-slate-600 py-2">
              변환 버튼을 누르면 이 곳에 결과가 표시됩니다.
            </div>
          )}
        </div>

        {/* Real-time live preview indicator while typing */}
        {inputVal.trim() && (
          <div className="text-[11px] text-blue-400 font-medium pt-2 border-t border-slate-900 flex items-center justify-between">
            <span>실시간 미리보기:</span>
            <span className="font-bold font-mono text-slate-200 truncate max-w-[200px]">
              {livePreview}
            </span>
          </div>
        )}
      </div>

      {/* 2. Input Window & Touch Controls (입력창 및 컨트롤) */}
      <form onSubmit={handleConvert} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              mode === 'morseToText'
                ? '모스부호를 입력하세요 (예: ... --- ...)'
                : '변환할 텍스트를 입력하세요 (예: SOS 또는 안녕)'
            }
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3.5 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-all pr-24"
            autoFocus
          />

          {/* Quick Clear icon on input */}
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="입력 내용 지우기"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Keypad Buttons for Touch Input ( 점 • / 선 — / 띄어쓰기 / 완료 / 초기화 ) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {/* Dot Button */}
          <button
            type="button"
            onClick={handleAddDot}
            className="col-span-2 sm:col-span-2 h-14 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-2xl flex flex-col items-center justify-center shadow-md shadow-blue-600/30 transition-all select-none"
          >
            <span className="text-3xl leading-none">•</span>
            <span className="text-[10px] font-bold text-blue-100/90 mt-0.5">
              [ . 점 ]
            </span>
          </button>

          {/* Dash Button */}
          <button
            type="button"
            onClick={handleAddDash}
            className="col-span-2 sm:col-span-2 h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-2xl flex flex-col items-center justify-center shadow-md shadow-indigo-600/30 transition-all select-none"
          >
            <span className="text-2xl leading-none">—</span>
            <span className="text-[10px] font-bold text-indigo-100/90 mt-0.5">
              [ - 선 ]
            </span>
          </button>

          {/* Space / Word separator */}
          <button
            type="button"
            onClick={handleAddSpace}
            className="col-span-2 sm:col-span-1 h-12 sm:h-14 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 text-xs font-bold transition-all select-none"
          >
            띄어쓰기
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="col-span-2 sm:col-span-1 h-12 sm:h-14 rounded-xl bg-slate-700/80 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center transition-all"
            title="한 글자 지우기"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Reset Button (초기화 버튼) */}
          <button
            type="button"
            onClick={handleReset}
            className="col-span-2 sm:col-span-3 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>초기화</span>
          </button>

          {/* Submit / Completion Button (완료 버튼) */}
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className={`col-span-2 sm:col-span-3 h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
              inputVal.trim()
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <span>완료 (변환)</span>
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Conversion History List */}
      {history.length > 0 && (
        <div className="pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">
              최근 변환 기록 ({history.length})
            </span>
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              기록 삭제
            </button>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-xs">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setResultText(item.output);
                  playMorseCode(item.input, settings);
                }}
                className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 rounded-lg p-2 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-mono text-blue-400 font-bold truncate max-w-[120px]">
                    {item.input}
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="font-bold text-emerald-400 truncate max-w-[120px]">
                    {item.output}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
