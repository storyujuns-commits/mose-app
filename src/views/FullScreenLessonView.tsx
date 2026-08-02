import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Volume2, 
  Flame, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  RotateCcw,
  Radio,
  Zap,
  VolumeX,
  Play
} from 'lucide-react';
import { Lesson, LessonStep, UserProgress, UserSettings } from '../types';
import { playDot, playDash, playMorseCode, playSuccessSound, playErrorSound, stopAllSounds } from '../lib/audio';
import { decodeMorse, CHAR_LOOKUP_MAP } from '../data/morseData';
import { getRankInfo } from '../lib/rankAndStreak';

interface FullScreenLessonViewProps {
  lesson: Lesson;
  progress: UserProgress;
  settings: UserSettings;
  onClose: () => void;
  onFinishLesson: (rewardXp: number, learnedCharIds: string[], difficultCharIds: string[]) => void;
}

export function FullScreenLessonView({
  lesson,
  progress,
  settings,
  onClose,
  onFinishLesson,
}: FullScreenLessonViewProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [learnedCharIds, setLearnedCharIds] = useState<string[]>([]);
  const [difficultCharIds, setDifficultCharIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalXpGained, setTotalXpGained] = useState(0);
  const [paddleMode, setPaddleMode] = useState(false);

  // Paddle touch state
  const paddlePressTimer = useRef<NodeJS.Timeout | null>(null);
  const paddleStartTime = useRef<number>(0);

  const currentStep: LessonStep | undefined = lesson.steps[currentStepIdx];
  const totalSteps = lesson.steps.length;
  const progressPercent = Math.round(((currentStepIdx + (isCompleted ? 1 : 0)) / totalSteps) * 100);

  // Play target sound automatically on step change
  useEffect(() => {
    if (currentStep && settings.soundEnabled) {
      playMorseCode(currentStep.targetMorse, settings);
    }
    return () => stopAllSounds();
  }, [currentStepIdx, currentStep, settings]);

  // Handle dot press
  const handlePressDot = () => {
    if (isAnswered) return;
    if (settings.soundEnabled) playDot(settings.soundSpeed, settings.soundPitch);
    setInputBuffer((prev) => (prev ? `${prev}.` : '.'));
  };

  // Handle dash press
  const handlePressDash = () => {
    if (isAnswered) return;
    if (settings.soundEnabled) playDash(settings.soundSpeed, settings.soundPitch);
    setInputBuffer((prev) => (prev ? `${prev}-` : '-'));
  };

  // Handle space press (separates characters)
  const handlePressSpace = () => {
    if (isAnswered || !inputBuffer) return;
    if (inputBuffer.endsWith(' ')) return;
    setInputBuffer((prev) => `${prev} `);
  };

  // Handle word slash separator
  const handlePressSlash = () => {
    if (isAnswered || !inputBuffer) return;
    if (inputBuffer.endsWith('/')) return;
    setInputBuffer((prev) => `${prev} / `);
  };

  // Handle backspace
  const handleBackspace = () => {
    if (isAnswered) return;
    setInputBuffer((prev) => {
      if (!prev) return '';
      if (prev.endsWith(' ')) return prev.slice(0, -1);
      return prev.slice(0, -1);
    });
  };

  // Handle clear
  const handleClear = () => {
    if (isAnswered) return;
    setInputBuffer('');
  };

  // Single paddle press down (Short = dot, Long > 220ms = dash)
  const handlePaddleStart = () => {
    if (isAnswered) return;
    paddleStartTime.current = Date.now();
  };

  const handlePaddleEnd = () => {
    if (isAnswered) return;
    const duration = Date.now() - paddleStartTime.current;
    if (duration > 220) {
      handlePressDash();
    } else {
      handlePressDot();
    }
  };

  // Decode live user Morse input buffer into text
  const getDecodedInput = (buffer: string): string => {
    if (!buffer.trim()) return '';
    // Split words by '/'
    const words = buffer.split('/');
    return words
      .map((wordStr) => {
        // Split letters by space
        const letters = wordStr.trim().split(/\s+/);
        return letters
          .map((code) => {
            if (!code) return '';
            const found = decodeMorse(code);
            return found ? found.char : '?';
          })
          .join('');
      })
      .join(' ');
  };

  // Check answer
  const handleSubmitAnswer = () => {
    if (!currentStep || isAnswered) return;
    if (!inputBuffer.trim()) return;

    // Normalize comparison (ignore excess spaces)
    const normalizedInput = inputBuffer.trim().replace(/\s+/g, ' ');
    const normalizedTarget = currentStep.targetMorse.trim().replace(/\s+/g, ' ');

    // Also check if decoded text matches target text
    const decodedUserText = getDecodedInput(normalizedInput).replace(/\s+/g, '').toUpperCase();
    const targetTextClean = currentStep.targetText.replace(/\s+/g, '').toUpperCase();

    const correct = normalizedInput === normalizedTarget || decodedUserText === targetTextClean;

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      if (settings.soundEnabled) playSuccessSound();
      setTotalXpGained((prev) => prev + 10);
      if (currentStep.charId) {
        setLearnedCharIds((prev) => [...prev, currentStep.charId!]);
      }
    } else {
      if (settings.soundEnabled) playErrorSound();
      if (currentStep.charId) {
        setDifficultCharIds((prev) => [...prev, currentStep.charId!]);
      }
    }
  };

  // Advance to next step or complete lesson
  const handleNextStep = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      setInputBuffer('');
      setIsAnswered(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      // Finished all steps!
      setIsCompleted(true);
      const finalXp = totalXpGained + (lesson.rewardXp || 100);
      onFinishLesson(finalXp, learnedCharIds, difficultCharIds);
    }
  };

  const decodedLiveText = getDecodedInput(inputBuffer);
  const rankInfo = getRankInfo(progress.score + totalXpGained);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-full w-full overflow-hidden select-none font-sans">
      {/* Top Bar Navigation & Progress Header */}
      <header className="px-4 pt-3 pb-2 bg-slate-900/90 border-b border-slate-800 backdrop-blur flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          aria-label="학습 종료"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Center Progress Bar */}
        <div className="flex-1 max-w-xs flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-blue-400 truncate max-w-[140px]">{lesson.title}</span>
            <span className="text-slate-400">
              {currentStepIdx + 1} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Right Stats Badges */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{progress.streak || 1}일</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
            <Zap className="w-4 h-4" />
            <span>+{totalXpGained} XP</span>
          </div>
        </div>
      </header>

      {/* Main Interactive Screen Area */}
      {!isCompleted ? (
        <main className="flex-1 flex flex-col justify-between px-4 py-3 overflow-y-auto max-w-lg mx-auto w-full">
          {/* Situation Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                {currentStep?.situation}
              </span>
              <button
                onClick={() => settings.soundEnabled && playMorseCode(currentStep?.targetMorse || '', settings)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1 text-xs font-medium"
              >
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span>청취</span>
              </button>
            </div>

            {/* Conversation / Prompt Bubble */}
            <motion.div
              key={currentStepIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3"
            >
              {/* Tactical Radio Practice Header */}
              {currentStep?.type === 'radio-practice' && (
                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 rounded-xl p-3 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      [RADIO ON AIR] 144.120 MHz
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-mono">
                    SECURE
                  </span>
                </div>
              )}

              {/* Sender Chat Bubble */}
              {currentStep?.senderMessage && (
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/30">
                    📡
                  </div>
                  <div className="text-sm text-slate-200">
                    <span className="text-xs font-bold text-blue-400 block mb-0.5">상대 교신 메시지</span>
                    {currentStep.senderMessage}
                  </div>
                </div>
              )}

              {/* Fill Blank Custom Display */}
              {currentStep?.type === 'fill-blank' && currentStep.fillBlankText && (
                <div className="bg-slate-950 p-4 rounded-xl text-center border border-indigo-500/30">
                  <span className="text-xs text-indigo-400 font-bold block mb-1">빈칸 모스 완충 문제</span>
                  <span className="text-3xl font-mono font-black text-amber-300 tracking-widest">
                    {currentStep.fillBlankText}
                  </span>
                </div>
              )}

              {/* Decode Mode Custom Display */}
              {currentStep?.type === 'decode' && (
                <div className="bg-slate-950 p-4 rounded-xl text-center border border-blue-500/30">
                  <span className="text-xs text-blue-400 font-bold block mb-1">🔍 수신된 모스부호</span>
                  <span className="text-2xl font-mono font-black text-blue-300 tracking-widest">
                    {currentStep.targetMorse}
                  </span>
                </div>
              )}

              {/* Listening Mode Custom Display */}
              {currentStep?.type === 'listening' && (
                <div className="bg-gradient-to-r from-indigo-950/60 to-slate-950 p-4 rounded-xl text-center border border-indigo-500/40 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center animate-pulse">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-indigo-300 block">🎧 모스 소리를 잘 들어보세요</span>
                  <button
                    onClick={() => settings.soundEnabled && playMorseCode(currentStep.targetMorse, settings)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>소리 다시 재생</span>
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{currentStep?.prompt}</span>
                </h3>
              </div>

              {/* Target Highlight */}
              {currentStep?.type !== 'listening' || isAnswered || showHint ? (
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">목표 텍스트</span>
                    <span className="text-xl font-black text-amber-400 tracking-wider">
                      {currentStep?.targetText}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">목표 모스 코드</span>
                    <span className="text-lg font-mono font-bold text-blue-300 tracking-widest">
                      {currentStep?.targetMorse}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-center">
                  <span className="text-xs text-slate-400 block">모스 청음 수신 중</span>
                  <span className="text-sm font-bold text-indigo-400">??? (소리를 듣고 정답 모스를 입력하세요)</span>
                </div>
              )}

              {/* Hint Toggle */}
              {currentStep?.hint && (
                <div>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium pt-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showHint ? '힌트 접기' : '힌트 보기'}
                  </button>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-slate-400 bg-indigo-950/40 border border-indigo-900/40 p-2.5 rounded-lg mt-2 font-mono"
                    >
                      💡 {currentStep.hint}
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Input Display Display Area */}
            <div className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-4 space-y-2 shadow-inner">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                <span>입력된 모스 기호</span>
                <span>실시간 변환: <span className="text-amber-300 font-bold">{decodedLiveText || '-'}</span></span>
              </div>
              <div className="min-h-[50px] bg-slate-950 rounded-xl px-4 py-3 font-mono font-bold text-xl tracking-widest text-blue-400 flex items-center justify-between border border-slate-800 overflow-x-auto">
                <span>{inputBuffer || <span className="text-slate-600 font-sans text-sm tracking-normal font-normal">. 또는 - 버튼으로 입력하세요</span>}</span>
                {inputBuffer && (
                  <button
                    onClick={handleBackspace}
                    disabled={isAnswered}
                    className="text-slate-500 hover:text-slate-300 transition text-sm font-sans font-semibold ml-2 shrink-0"
                  >
                    ⌫ 삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Controls / Keypad */}
          <div className="pt-2 pb-2 space-y-3">
            {/* Paddle mode toggle */}
            <div className="flex justify-between items-center px-1">
              <button
                onClick={() => setPaddleMode(!paddleMode)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 transition ${
                  paddleMode
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span>{paddleMode ? '🔘 패들 터치 모드' : '⌨️ 분리 입력 모드'}</span>
              </button>
              <button
                onClick={handleClear}
                disabled={isAnswered || !inputBuffer}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                전체 지우기
              </button>
            </div>

            {/* Touch Keypad */}
            {!paddleMode ? (
              <div className="grid grid-cols-3 gap-2.5">
                {/* Dot Button */}
                <button
                  onClick={handlePressDot}
                  disabled={isAnswered}
                  className="h-20 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-95 border-2 border-slate-700 rounded-2xl flex flex-col items-center justify-center shadow-lg transition disabled:opacity-50"
                >
                  <span className="text-4xl font-black text-blue-400 leading-none mb-1">•</span>
                  <span className="text-xs text-slate-400 font-bold">점 (.)</span>
                </button>

                {/* Dash Button */}
                <button
                  onClick={handlePressDash}
                  disabled={isAnswered}
                  className="h-20 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:scale-95 border-2 border-slate-700 rounded-2xl flex flex-col items-center justify-center shadow-lg transition disabled:opacity-50"
                >
                  <span className="text-4xl font-black text-indigo-400 leading-none mb-1">━</span>
                  <span className="text-xs text-slate-400 font-bold">선 (-)</span>
                </button>

                {/* Space / Slash buttons stack */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handlePressSpace}
                    disabled={isAnswered || !inputBuffer}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center transition disabled:opacity-40"
                  >
                    글자 띄우기 (Space)
                  </button>
                  <button
                    onClick={handlePressSlash}
                    disabled={isAnswered || !inputBuffer}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center transition disabled:opacity-40"
                  >
                    단어 띄우기 (/)
                  </button>
                </div>
              </div>
            ) : (
              /* Single Paddle Touch Button */
              <div className="space-y-2">
                <button
                  onMouseDown={handlePaddleStart}
                  onMouseUp={handlePaddleEnd}
                  onTouchStart={handlePaddleStart}
                  onTouchEnd={handlePaddleEnd}
                  disabled={isAnswered}
                  className="w-full h-24 bg-gradient-to-b from-indigo-900/60 to-slate-900 border-2 border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition shadow-lg"
                >
                  <span className="text-sm font-bold text-indigo-300">통신 패들 터치 영역</span>
                  <span className="text-xs text-slate-400 mt-1">짧게 누르면 점(.), 꾹 누르면 선(-)</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handlePressSpace}
                    disabled={isAnswered || !inputBuffer}
                    className="flex-1 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 border border-slate-700"
                  >
                    글자 구분 (Space)
                  </button>
                  <button
                    onClick={handlePressSlash}
                    disabled={isAnswered || !inputBuffer}
                    className="flex-1 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 border border-slate-700"
                  >
                    단어 구분 (/)
                  </button>
                </div>
              </div>
            )}

            {/* Submit / Check Answer Button */}
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!inputBuffer.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-base active:scale-98"
              >
                <span>정답 제출하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : null}
          </div>

          {/* Feedback Bottom Sheet / Toast */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className={`fixed bottom-0 left-0 right-0 p-5 border-t shadow-2xl z-50 flex flex-col gap-3 ${
                  isCorrect
                    ? 'bg-slate-900 border-emerald-500/50 text-slate-100'
                    : 'bg-slate-900 border-rose-500/50 text-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/40">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/40">
                      <XCircle className="w-7 h-7" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h4
                      className={`text-lg font-black ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCorrect ? '완벽합니다! 정답입니다 🎉' : '아쉽습니다. 오답입니다'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {isCorrect ? (
                        <span>+10 XP 획득! 다음 문제로 진행하세요.</span>
                      ) : (
                        <span>
                          정답 모스: <strong className="font-mono text-amber-300">{currentStep?.targetMorse}</strong> ({currentStep?.targetText})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 shadow-lg ${
                    isCorrect
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <span>{currentStepIdx < totalSteps - 1 ? '다음 문제 진행' : '레슨 완료하기'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      ) : (
        /* Lesson Finished Celebration Screen */
        <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-2xl border-4 border-amber-300/30"
          >
            🌟
          </motion.div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {lesson.title} 완료!
            </span>
            <h2 className="text-3xl font-black text-white">축하합니다! 레슨 클리어</h2>
            <p className="text-sm text-slate-300">
              오늘의 모스부호 실전 수신 및 송신 능력이 크게 향상되었습니다.
            </p>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
              <Zap className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-xs text-slate-400 font-semibold">획득 XP</span>
              <span className="text-2xl font-black text-white">+{totalXpGained + lesson.rewardXp}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center">
              <Flame className="w-6 h-6 text-amber-500 mb-1 fill-amber-500" />
              <span className="text-xs text-slate-400 font-semibold">연속 학습 기록</span>
              <span className="text-2xl font-black text-amber-400">🔥 {progress.streak || 1}일</span>
            </div>
          </div>

          {/* User Rank Card */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{rankInfo.badge}</span>
              <div>
                <span className="text-xs text-slate-400 block">현재 계급</span>
                <span className="text-lg font-bold text-white">{rankInfo.title}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">총 누적 점수</span>
              <span className="text-lg font-black text-blue-400">{progress.score + totalXpGained + lesson.rewardXp} XP</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-base"
          >
            <span>대시보드로 돌아가기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </main>
      )}

      {/* Exit Confirmation Dialog Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">학습을 중단하시겠습니까?</h3>
            <p className="text-xs text-slate-300">
              지금 나가시면 현재 레슨 진행 상황이 저장되지 않을 수 있습니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                학습 계속하기
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
