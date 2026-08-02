import React, { useState } from 'react';
import { Volume2, CheckCircle, Circle, BookOpen, Key, Zap, Sparkles } from 'lucide-react';
import { KOREAN_MORSE, ENGLISH_MORSE } from '../data/morseData';
import { MorseChar, StudyMode, UserSettings, LanguageCategory } from '../types';
import { playMorseCode } from '../lib/audio';
import { MorseConverter } from '../components/MorseConverter';
import { QuickReferenceTable } from '../components/QuickReferenceTable';

interface LearnViewProps {
  learnedSet: Set<string>;
  onToggleLearned: (id: string) => void;
  settings: UserSettings;
}

export const LearnView: React.FC<LearnViewProps> = ({
  learnedSet,
  onToggleLearned,
  settings,
}) => {
  const [lang, setLang] = useState<LanguageCategory>('ko');
  const [mode, setMode] = useState<StudyMode>('intermediate'); // Default to Converter & Reference mode!
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChar, setSelectedChar] = useState<MorseChar | null>(null);
  const [externalMorseChar, setExternalMorseChar] = useState<string | undefined>(undefined);

  // Selected language dataset for Beginner mode
  const currentList = lang === 'ko' ? KOREAN_MORSE : ENGLISH_MORSE;

  // Filtered dataset for Beginner mode
  const filteredList = currentList.filter((item) => {
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      const matchChar = item.char.toLowerCase().includes(query);
      const matchCode = item.code.includes(query);
      const matchReading = item.reading.includes(query);
      if (!matchChar && !matchCode && !matchReading) return false;
    }

    if (filterCategory === 'all') return true;
    if (filterCategory === 'learned') return learnedSet.has(item.id);
    if (filterCategory === 'unlearned') return !learnedSet.has(item.id);
    return item.category === filterCategory;
  });

  const handlePlaySound = (code: string) => {
    playMorseCode(code, settings);
  };

  const handleSelectCharFromRef = (item: MorseChar) => {
    setExternalMorseChar(item.code);
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Top Header Mode Selector */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">모스부호 학습 & 변환 센터</h2>
            <p className="text-[11px] text-slate-400">
              실시간 변환기, 완성형 참조표 및 청음 트레이닝
            </p>
          </div>
        </div>

        {/* Study Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setMode('intermediate')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'intermediate'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>변환기 & 참조표</span>
          </button>

          <button
            onClick={() => setMode('beginner')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'beginner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>문자별 탐색</span>
          </button>

          <button
            onClick={() => setMode('advanced')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'advanced'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>청음 트레이닝</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Morse Converter & Quick Reference Table (변환기 및 빠른 참조표) */}
      {mode === 'intermediate' && (
        <div className="space-y-5">
          {/* 1. Morse Code Converter Component */}
          <MorseConverter settings={settings} externalInput={externalMorseChar} />

          {/* 2. Quick Reference Table Component */}
          <QuickReferenceTable settings={settings} onSelectChar={handleSelectCharFromRef} />
        </div>
      )}

      {/* Mode 2: Beginner Explorer (문자별 카드 탐색) */}
      {mode === 'beginner' && (
        <div className="space-y-4">
          {/* Language Selector */}
          <div className="flex bg-slate-800/80 p-2 border border-slate-700/60 rounded-2xl items-center justify-between">
            <span className="text-xs font-bold text-slate-300">언어 선택:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setLang('ko');
                  setFilterCategory('all');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'ko'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇰🇷 한국어
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  setFilterCategory('all');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="문자, 모스부호(.-), 읽기 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  filterCategory === 'all'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                전체 ({currentList.length})
              </button>
              {lang === 'ko' ? (
                <>
                  <button
                    onClick={() => setFilterCategory('ko-consonant')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      filterCategory === 'ko-consonant'
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    자음
                  </button>
                  <button
                    onClick={() => setFilterCategory('ko-vowel')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      filterCategory === 'ko-vowel'
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    모음
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setFilterCategory('en-letter')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      filterCategory === 'en-letter'
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    알파벳
                  </button>
                </>
              )}
              <button
                onClick={() => setFilterCategory('unlearned')}
                className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  filterCategory === 'unlearned'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                미학습
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredList.map((item) => {
              const isLearned = learnedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedChar(item)}
                  className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isLearned
                      ? 'bg-slate-800/40 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-800/80 border-slate-700/60 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">{item.char}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLearned(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title={isLearned ? '학습 취소' : '학습 완료 표시'}
                    >
                      {isLearned ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>

                  <div className="my-2">
                    <span className="font-mono text-lg font-extrabold tracking-widest text-blue-400">
                      {item.code.replace(/\./g, '•').replace(/-/g, '—')}
                    </span>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {item.reading}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[90px]">
                      {item.description}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySound(item.code);
                      }}
                      className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                      title="소리 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Advanced Flashcard Speed Trainer */}
      {mode === 'advanced' && (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">고급 청음 & 반응 트레이닝</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              소리만 듣고 순발력 있게 암기하는 고급 학습 모드입니다. 퀴즈 메뉴에서 실력 테스트에 도전해 보세요!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() =>
                handlePlaySound(
                  currentList[Math.floor(Math.random() * currentList.length)].code
                )
              }
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>랜덤 모스부호 청음하기</span>
            </button>
          </div>
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xs rounded-2xl p-5 shadow-2xl relative text-slate-100 text-center">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              {selectedChar.lang === 'ko' ? '한글 모스부호' : '영어 모스부호'}
            </span>

            <div className="text-5xl font-black text-white my-2">{selectedChar.char}</div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 my-4">
              <span className="font-mono text-3xl font-extrabold tracking-widest text-blue-400 block">
                {selectedChar.code.replace(/\./g, '•').replace(/-/g, '—')}
              </span>
              <p className="text-xs font-bold text-indigo-300 mt-1">
                읽기: {selectedChar.reading}
              </p>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-left mb-5">
              💡 {selectedChar.description}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handlePlaySound(selectedChar.code)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>소리 재생</span>
              </button>

              <button
                onClick={() => {
                  onToggleLearned(selectedChar.id);
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  learnedSet.has(selectedChar.id)
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{learnedSet.has(selectedChar.id) ? '학습 완료됨' : '학습 완료로 표시'}</span>
              </button>

              <button
                onClick={() => setSelectedChar(null)}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
