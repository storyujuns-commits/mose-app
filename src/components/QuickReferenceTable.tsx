import React, { useState } from 'react';
import { Search, Volume2, Plus, Check } from 'lucide-react';
import {
  ENGLISH_MORSE,
  KOREAN_CONSONANTS,
  KOREAN_VOWELS,
  NUMBER_MORSE,
  SPECIAL_MORSE,
} from '../data/morseData';
import { MorseChar, UserSettings } from '../types';
import { playMorseCode } from '../lib/audio';

export type RefTabType = 'en' | 'ko' | 'num' | 'sym';

interface QuickReferenceTableProps {
  settings?: UserSettings;
  onSelectChar?: (char: MorseChar) => void;
  className?: string;
}

export const QuickReferenceTable: React.FC<QuickReferenceTableProps> = ({
  settings,
  onSelectChar,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<RefTabType>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tab datasets
  const getTabDataset = () => {
    switch (activeTab) {
      case 'en':
        return ENGLISH_MORSE;
      case 'ko':
        return [...KOREAN_CONSONANTS, ...KOREAN_VOWELS];
      case 'num':
        return NUMBER_MORSE;
      case 'sym':
        return SPECIAL_MORSE;
      default:
        return ENGLISH_MORSE;
    }
  };

  const rawList = getTabDataset();

  // Filter list by search query
  const filteredList = rawList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const charMatch = item.char.toLowerCase().includes(q);
    const codeMatch = item.code.includes(q);
    const readingMatch = item.reading.toLowerCase().includes(q);
    const descMatch = item.description.toLowerCase().includes(q);
    return charMatch || codeMatch || readingMatch || descMatch;
  });

  const handlePlaySound = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (settings) {
      playMorseCode(code, settings);
    }
  };

  const handleItemClick = (item: MorseChar) => {
    if (settings) {
      playMorseCode(item.code, settings);
    }
    if (onSelectChar) {
      onSelectChar(item);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1200);
    }
  };

  return (
    <div className={`bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 shadow-xl ${className}`}>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>📋</span>
            <span>빠른 모스 참조표</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            터치하여 소리를 들으거나 변환기에 기호를 추가할 수 있습니다.
          </p>
        </div>

        {/* 4 Tabs: [영어] [한글] [숫자] [특수기호] */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('en')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'en'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            영어 (A-Z)
          </button>
          <button
            onClick={() => setActiveTab('ko')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ko'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            한글 (자/모음)
          </button>
          <button
            onClick={() => setActiveTab('num')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'num'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            숫자 (0-9)
          </button>
          <button
            onClick={() => setActiveTab('sym')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'sym'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            특수기호
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`${
            activeTab === 'en'
              ? '영어 문자, 모스부호(.-) 검색...'
              : activeTab === 'ko'
              ? '한글 자음/모음, 모스부호 검색...'
              : activeTab === 'num'
              ? '숫자 또는 모스부호 검색...'
              : '특수기호 검색 (. , ? ! 등)...'
          }`}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
          >
            취소
          </button>
        )}
      </div>

      {/* Korean Subcategory Notice if Korean tab */}
      {activeTab === 'ko' && !searchQuery && (
        <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            자음 14개
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            모음 12개
          </span>
        </div>
      )}

      {/* Card Grid Format with Vertical Scroll */}
      <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 rounded-xl p-3 transition-all cursor-pointer select-none flex flex-col justify-between hover:bg-slate-850 shadow-sm"
              >
                {/* Character & Visual Symbol */}
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-300 transition-colors">
                    {item.char}
                  </span>

                  {/* Play Sound icon button */}
                  <button
                    onClick={(e) => handlePlaySound(item.code, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    title="소리 듣기"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Morse Code Display (Large Readable Font) */}
                <div className="mt-2 mb-1">
                  <div className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-blue-400 group-hover:text-blue-300 transition-colors">
                    {item.code.replace(/\./g, '•').replace(/-/g, '—')}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.reading}
                  </div>
                </div>

                {/* Optional description label */}
                {item.description && (
                  <div className="text-[9px] text-slate-500 truncate pt-1 border-t border-slate-800/80">
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
