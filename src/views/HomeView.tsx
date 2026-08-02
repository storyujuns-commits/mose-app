import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Sparkles, 
  Flame, 
  Trophy, 
  Target, 
  ArrowRight, 
  ShieldAlert, 
  RotateCcw,
  Zap,
  Play,
  CheckCircle2,
  Calendar,
  Radio,
  Award,
  MessageSquare
} from 'lucide-react';
import { UserProfile, UserProgress, TabType, Lesson } from '../types';
import { ALL_MORSE, KOREAN_MORSE, ENGLISH_MORSE } from '../data/morseData';
import { CHAPTERS, generateDynamicLesson, generateReviewLesson, generateCharacterLesson, getLesson, isChapterCompleted } from '../data/chaptersData';
import { getRankInfo } from '../lib/rankAndStreak';

interface HomeViewProps {
  user: UserProfile | null;
  progress: UserProgress;
  onChangeTab: (tab: TabType) => void;
  onOpenAuth: () => void;
  onStartReview: () => void;
  onStartLesson: (lesson: Lesson) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  progress,
  onChangeTab,
  onOpenAuth,
  onStartReview,
  onStartLesson,
}) => {
  const totalKorean = KOREAN_MORSE.length;
  const totalEnglish = ENGLISH_MORSE.length;

  const learnedSet = new Set(progress.learnedCharacters || []);
  const learnedKoreanCount = KOREAN_MORSE.filter(c => learnedSet.has(c.id)).length;
  const learnedEnglishCount = ENGLISH_MORSE.filter(c => learnedSet.has(c.id)).length;

  const koreanPercent = Math.min(100, Math.round((learnedKoreanCount / totalKorean) * 100));
  const englishPercent = Math.min(100, Math.round((learnedEnglishCount / totalEnglish) * 100));

  const difficultList = Object.keys(progress.difficultCharacters || {});
  const rankInfo = getRankInfo(progress.score || 0);

  // Calendar setup (last 7 days)
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('ko-KR', { weekday: 'short' });
    const isCompleted = (progress.studyHistoryDates || []).includes(dateStr);
    const isToday = dateStr === today.toISOString().split('T')[0];
    return { dateStr, dayName, isCompleted, isToday };
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Welcome & Authentication Banner */}
      {!user ? (
        <div className="bg-gradient-to-r from-blue-950/80 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                게스트 저장 모드
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                로그인하면 학습 레슨, streak, XP가 클라우드에 영구 저장됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 transition-all shadow-md shadow-blue-600/30"
          >
            로그인
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-blue-950/40 border border-slate-700/60 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                user.nickname.slice(0, 1)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-400">반가워요!</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Cloud 동기화됨
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">{user.nickname} 님</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-amber-400 flex items-center justify-end gap-1">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{progress.streak || 1}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">연속 학습일</span>
          </div>
        </div>
      )}

      {/* Duolingo Style Streak & Rank Dashboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        {/* Rank & XP */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{rankInfo.badge}</span>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">현재 등급</span>
              <span className="text-sm font-black text-white">{rankInfo.title}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold">누적 XP</span>
            <span className="text-base font-black text-amber-400">{progress.score || 0} XP</span>
          </div>
        </div>

        {/* 7-Day Streak Calendar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>주간 연속 학습 현황</span>
            </span>
            <span className="text-amber-400">🔥 {progress.streak || 1}일 연속</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {past7Days.map((day, idx) => (
              <div
                key={idx}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  day.isCompleted
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : day.isToday
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-bold">{day.dayName}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
                  {day.isCompleted ? (
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : day.isToday ? (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  ) : (
                    <span className="text-[10px] text-slate-600">•</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Action Banner: Launch Daily Recommended Lesson */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] text-white/5 font-mono font-black text-9xl select-none pointer-events-none">
          .-
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-200 border border-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              대화형 모스부호 레슨
            </span>
            <span className="text-xs text-blue-200/80 font-medium">전체 화면 모드</span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              실제 통신 상황에서 배우는<br />대화형 인터랙티브 레슨
            </h2>
            <p className="text-xs text-blue-100/80 mt-1">
              구조대, 기지국, 동료와의 상황별 교신으로 진짜 모스부호를 체득해보세요.
            </p>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                const firstLesson = CHAPTERS[0].lessons[0];
                onStartLesson(firstLesson);
              }}
              className="py-3 px-4 rounded-xl bg-white text-blue-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-blue-50 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span>단원 1 대화 레슨 시작</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                const dynLesson = generateDynamicLesson('ch-1', progress);
                onStartLesson(dynLesson);
              }}
              className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/20 backdrop-blur-md text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>랜덤 실전 생성 레슨</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chapters & Curriculum Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>상황별 학습 단원 (15 레슨 커리큘럼)</span>
          </h3>
          <span className="text-xs text-slate-400">전체 화면 실전 모드</span>
        </div>

        <div className="space-y-4">
          {CHAPTERS.map((chapter) => {
            const completedCount = chapter.lessons.filter((l) =>
              (progress.completedLessons || []).includes(l.id)
            ).length;
            const isFinished = isChapterCompleted(chapter.id, progress.completedLessons);
            const percent = Math.round((completedCount / 15) * 100);

            return (
              <div
                key={chapter.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                      {chapter.badge}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{chapter.title}</h4>
                        {isFinished && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            단원 완료 ✨ (복습 가능)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{chapter.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-blue-400">{completedCount} / 15 완료</span>
                    <span className="text-[10px] text-slate-500 block">+{chapter.rewardXp} XP 보너스</span>
                  </div>
                </div>

                {/* Chapter Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* 15 Lessons List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  {chapter.lessons.map((lessonStub) => {
                    const isDone = (progress.completedLessons || []).includes(lessonStub.id);
                    return (
                      <button
                        key={lessonStub.id}
                        onClick={() => {
                          const fullLesson = getLesson(chapter.id, lessonStub.lessonNumber, progress);
                          onStartLesson(fullLesson);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all group ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/40'
                            : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-3.5 h-3.5 fill-blue-400" />}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-blue-300 transition-colors">
                              {lessonStub.title}
                            </span>
                            <span className="text-[10px] text-slate-400">10~20 문항 • +{lessonStub.rewardXp} XP</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0 ml-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Learning Modes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          특수 연속 학습 모드
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Character Auto-Advance Mode */}
          <button
            onClick={() => {
              const charLesson = generateCharacterLesson('ko', progress);
              onStartLesson(charLesson);
            }}
            className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">문자 연속 자동 학습</h4>
            <p className="text-xs text-slate-400 mt-1">한 글자 완료 후 자동 다음 이동</p>
          </button>

          {/* Smart Review */}
          <button
            onClick={() => {
              const revLesson = generateReviewLesson(progress);
              onStartLesson(revLesson);
            }}
            className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">오늘의 맞춤 복습</h4>
            <p className="text-xs text-slate-400 mt-1">자주 틀린 약점 집중 교정</p>
          </button>
        </div>
      </div>
    </div>
  );
};
