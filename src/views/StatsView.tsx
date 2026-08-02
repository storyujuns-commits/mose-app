import React from 'react';
import { BarChart3, Clock, Trophy, Target, Flame, RotateCcw, CheckCircle2, AlertTriangle, BookOpen, Award } from 'lucide-react';
import { UserProgress, UserProfile } from '../types';
import { KOREAN_MORSE, ENGLISH_MORSE, ALL_MORSE } from '../data/morseData';
import { getRankInfo } from '../lib/rankAndStreak';

interface StatsViewProps {
  user: UserProfile | null;
  progress: UserProgress;
  onStartReview: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  user,
  progress,
  onStartReview,
}) => {
  const learnedSet = new Set(progress.learnedCharacters || []);
  const totalChars = ALL_MORSE.length;
  const totalLearned = learnedSet.size;

  const totalKorean = KOREAN_MORSE.length;
  const totalEnglish = ENGLISH_MORSE.length;

  const learnedKorean = KOREAN_MORSE.filter(c => learnedSet.has(c.id)).length;
  const learnedEnglish = ENGLISH_MORSE.filter(c => learnedSet.has(c.id)).length;

  const koreanPct = Math.min(100, Math.round((learnedKorean / totalKorean) * 100));
  const englishPct = Math.min(100, Math.round((learnedEnglish / totalEnglish) * 100));

  const totalQuiz = progress.totalQuizCount || 0;
  const correctQuiz = progress.correctQuizCount || 0;
  const accuracy = totalQuiz > 0 ? Math.round((correctQuiz / totalQuiz) * 100) : 0;

  // Format study time (seconds to mins)
  const totalMins = Math.floor((progress.totalStudyTime || 0) / 60);
  const rankInfo = getRankInfo(progress.score || 0);
  const completedLessonsCount = (progress.completedLessons || []).length;

  const difficultList = Object.entries(progress.difficultCharacters || {}).map(([id, statObj]) => {
    const stat = statObj as { wrongCount: number; totalCount: number };
    const charObj = ALL_MORSE.find(c => c.id === id);
    return {
      id,
      charObj,
      wrongCount: stat.wrongCount,
      totalCount: stat.totalCount,
      acc: stat.totalCount > 0 ? Math.round(((stat.totalCount - stat.wrongCount) / stat.totalCount) * 100) : 0,
    };
  }).filter(item => item.charObj);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Overview Top Card */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-blue-950/40 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-700/80">
            {rankInfo.badge}
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 block">{rankInfo.title}</span>
            <h2 className="text-base font-extrabold text-white">
              {user ? user.nickname : '게스트 회원'}
            </h2>
            <p className="text-[11px] text-slate-400">
              다음 계급까지: {rankInfo.nextXp < 99999 ? `${rankInfo.nextXp - (progress.score || 0)} XP 남음` : '최고 계급 도달'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-amber-400">{progress.score || 0}</span>
          <span className="text-[10px] text-slate-400 block font-semibold">누적 XP</span>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Study Time */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 text-center">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <span className="text-lg font-black text-white block">{totalMins}분</span>
          <span className="text-[10px] font-semibold text-slate-400">총 학습 시간</span>
        </div>

        {/* Mastered Chars */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 text-center">
          <BookOpen className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-lg font-black text-white block">{totalLearned}/{totalChars}</span>
          <span className="text-[10px] font-semibold text-slate-400">마스터한 문자</span>
        </div>

        {/* Completed Lessons */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 text-center">
          <Award className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <span className="text-lg font-black text-white block">{completedLessonsCount}개</span>
          <span className="text-[10px] font-semibold text-slate-400">완료한 대화 레슨</span>
        </div>

        {/* Streak */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 text-center">
          <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <span className="text-lg font-black text-white block">{progress.streak || 1}일</span>
          <span className="text-[10px] font-semibold text-slate-400">연속 학습 일수</span>
        </div>
      </div>

      {/* Progress Bars (Korean vs English) */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-300">언어별 학습 진도율</h3>

        {/* Korean Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-200">🇰🇷 한국어 모스부호</span>
            <span className="font-extrabold text-blue-400">{koreanPct}% ({learnedKorean}/{totalKorean})</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${koreanPct}%` }}
            />
          </div>
        </div>

        {/* English Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-200">🇺🇸 영어 모스부호</span>
            <span className="font-extrabold text-indigo-400">{englishPct}% ({learnedEnglish}/{totalEnglish})</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${englishPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Chart Graphic (Weekly Activity / Accuracy Graph) */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-300">학습 활동 그래프</h3>
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
          <div className="h-32 flex items-end justify-between gap-2 pt-4">
            {[
              { day: '월', val: 40 },
              { day: '화', val: 65 },
              { day: '수', val: 30 },
              { day: '목', val: 85 },
              { day: '금', val: 50 },
              { day: '토', val: 95 },
              { day: '일', val: 75 },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden flex items-end h-24">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all"
                    style={{ height: `${item.val}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak Characters Analysis List */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            복습이 필요한 약점 문자 ({difficultList.length})
          </h3>
          {difficultList.length > 0 && (
            <button
              onClick={onStartReview}
              className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>복습 시작</span>
            </button>
          )}
        </div>

        {difficultList.length === 0 ? (
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60 text-center text-xs text-slate-500">
            아직 약점 문자가 없습니다! 퀴즈를 풀면 오답 분석 데이터가 쌓입니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {difficultList.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-lg font-black text-white">{item.charObj?.char}</span>
                  <span className="font-mono text-xs text-blue-400 block">{item.charObj?.code}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-400 block">{item.wrongCount}회 오답</span>
                  <span className="text-[10px] text-slate-500">정답률 {item.acc}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
