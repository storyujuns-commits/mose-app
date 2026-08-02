import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Brain, Volume2, CheckCircle2, XCircle, Trophy, RefreshCw, Zap, ArrowRight, 
  Flame, Play, Pause, Square, RotateCcw, Filter, Music, HelpCircle 
} from 'lucide-react';
import { ALL_MORSE, KOREAN_MORSE, ENGLISH_MORSE, NUMBER_MORSE, SPECIAL_MORSE } from '../data/morseData';
import { QuizType, UserSettings, UserProgress, SoundSpeed } from '../types';
import { globalMorsePlayer, AudioPlayerState } from '../lib/audio';
import { MorseKeypad } from '../components/MorseKeypad';

export type QuizCategory = 'all' | 'char' | 'word' | 'sentence' | 'korean' | 'english' | 'number' | 'symbol';

interface QuizItem {
  id: string;
  char: string;       // Display text, e.g., "A", "SOS", "MAYDAY MAYDAY", "ㄱ", "0", "."
  code: string;       // Morse code string, e.g., ".-", "... --- ...", "----."
  reading: string;    // Phonetic reading, e.g., "딧 다아"
  description: string;
  category: QuizCategory;
}

// Word & Sentence Bank Definitions
const WORD_BANK: QuizItem[] = [
  { id: 'w-sos', char: 'SOS', code: '... --- ...', reading: '딧 딧 딧 / 다아 다아 다아 / 딧 딧 딧', description: '국제 비상 구조 신호', category: 'word' },
  { id: 'w-help', char: 'HELP', code: '.... . .-.. .--.', reading: '딧 딧 딧 딧 / 딧 / 딧 다아 딧 딧 / 딧 다아 다아', description: '구조 요청 단어', category: 'word' },
  { id: 'w-mayday', char: 'MAYDAY', code: '--.-- .- -.-- -.. .- -.--', reading: '다아 다아 딧 다아 / 딧 다아 / 다아 딧 다아 다아...', description: '최고 단계 해상/항공 비상구호', category: 'word' },
  { id: 'w-safe', char: 'SAFE', code: '... .- ..-. .', reading: '딧 딧 딧 / 딧 다아 / 딧 딧 다아 딧 / 딧', description: '안전 상태 확인 신호', category: 'word' },
  { id: 'w-radio', char: 'RADIO', code: '.-. .- -.. .. ---', reading: '딧 다아 딧 / 딧 다아 / 다아 딧 딧 / 딧 딧 / 다아 다아 다아', description: '무선 통신 장비', category: 'word' },
  { id: 'w-beacon', char: 'BEACON', code: '-... . .- -.-. --- -.', reading: '다아 딧 딧 딧 / 딧 / 딧 다아 / 다아 딧 다아 딧...', description: '위치 발신기 신호', category: 'word' },
  { id: 'w-signal', char: 'SIGNAL', code: '... .. --. -. .- .-..', reading: '딧 딧 딧 / 딧 딧 / 다아 다아 딧 / 다아 딧...', description: '무전 신호 코드', category: 'word' },
  { id: 'w-ready', char: 'READY', code: '.-. . .- -.. -.--', reading: '딧 다아 딧 / 딧 / 딧 다아 / 다아 딧 딧 / 다아 딧 다아 다아', description: '작전 준비 완료', category: 'word' },
  { id: 'w-urgent', char: 'URGENT', code: '..- .-. --. . -. -', reading: '딧 딧 다아 / 딧 다아 딧 / 다아 다아 딧 / 딧...', description: '긴급 신호', category: 'word' },
  { id: 'w-ko-rescue', char: '구조', code: '.-.. ..- --.. ㅗ', reading: 'ㄱ ㅜ ㅈ ㅗ', description: '한국어 구조 신호', category: 'word' },
  { id: 'w-ko-confirm', char: '확인', code: '-... .- .-.. ..-.', reading: 'ㅎ ㅘ ㄱ ㅇ ㅣ ㄴ', description: '한국어 수신 확인', category: 'word' },
  { id: 'w-ko-emergency', char: '비상', code: '---... -...', reading: 'ㅂ ㅣ ㅅ ㅇ ㅏ ㅇ', description: '한국어 비상 상황', category: 'word' },
  { id: 'w-ko-wait', char: '대기', code: '-.. .-. -.-', reading: 'ㄷ 애 ㄱ ㅣ', description: '한국어 대기 명령', category: 'word' },
];

const SENTENCE_BANK: QuizItem[] = [
  { id: 's-mayday-mayday', char: 'MAYDAY MAYDAY', code: '--.-- .- -.-- -.. .- -.-- / --.-- .- -.-- -.. .- -.--', reading: '메이데이 메이데이 비상 구호', description: '연속 해상 구조요청 문장', category: 'sentence' },
  { id: 's-help-us', char: 'HELP US NOW', code: '.... . .-.. .--. / ..- ... / -. --- .--', reading: '헬프 어스 나우', description: '즉시 구조 요청 문장', category: 'sentence' },
  { id: 's-position-ok', char: 'POSITION OK', code: '.--. --- ... .. - .. --- -. / --- -.-', reading: '포지션 오케이', description: '현재 위치 안전 확인', category: 'sentence' },
  { id: 's-status-ready', char: 'STATUS READY', code: '... - .- - ..- ... / .-. . .- -.. -.--', reading: '스테이터스 레디', description: '상태 준비 완료 문장', category: 'sentence' },
  { id: 's-send-beacon', char: 'SEND BEACON', code: '... . -. -.. / -... . .- -.-. --- -.', reading: '샌드 비콘', description: '위치 발신기 송출 명령', category: 'sentence' },
  { id: 's-copy-that', char: 'COPY THAT', code: '-.-. --- .--. -.-- / - .... .- -', reading: '카피 댓', description: '수신 및 이해 완료', category: 'sentence' },
  { id: 's-wait-me', char: 'WAIT FOR ME', code: '.-- .- .. - / ..-. --- .-. / -- .', reading: '웨이트 포 미', description: '합류 대기 요청', category: 'sentence' },
];

interface QuizViewProps {
  settings: UserSettings;
  progress: UserProgress;
  onRecordQuizResult: (isCorrect: boolean, charId: string, points: number) => void;
  onUpdateSettings?: (newSettings: Partial<UserSettings>) => void;
  initialTargetIds?: string[];
}

export const QuizView: React.FC<QuizViewProps> = ({
  settings,
  progress,
  onRecordQuizResult,
  onUpdateSettings,
  initialTargetIds,
}) => {
  const [activeType, setActiveType] = useState<QuizType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  
  const [currentQuestion, setCurrentQuestion] = useState<{
    item: QuizItem;
    options: string[];
    correctAnswer: string;
  } | null>(null);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [keypadInput, setKeypadInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreInSession, setScoreInSession] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streakInSession, setStreakInSession] = useState(0);

  // Audio player state tracking
  const [playerState, setPlayerState] = useState<AudioPlayerState>(globalMorsePlayer.getState());

  // Speed run timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Subscribe to Audio Player state
  useEffect(() => {
    const unsubscribe = globalMorsePlayer.subscribe((st) => {
      setPlayerState(st);
    });
    return () => {
      unsubscribe();
      globalMorsePlayer.stop();
    };
  }, []);

  // Sync Audio Player speed with UserSettings
  useEffect(() => {
    if (settings.soundSpeed) {
      globalMorsePlayer.setSpeed(settings.soundSpeed);
    }
  }, [settings.soundSpeed]);

  // Timer effect for Speed Run
  useEffect(() => {
    let timer: any;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      globalMorsePlayer.stop();
      triggerConfetti();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Build full available Quiz Items bank
  const getFullItemBank = (): QuizItem[] => {
    const chars: QuizItem[] = ALL_MORSE.map((item) => {
      let cat: QuizCategory = 'char';
      if (item.category === 'ko-consonant' || item.category === 'ko-vowel') cat = 'korean';
      else if (item.category === 'en-letter') cat = 'english';
      else if (item.category === 'en-number') cat = 'number';
      else if (item.category === 'en-symbol') cat = 'symbol';

      return {
        id: item.id,
        char: item.char,
        code: item.code,
        reading: item.reading,
        description: item.description,
        category: cat,
      };
    });

    return [...chars, ...WORD_BANK, ...SENTENCE_BANK];
  };

  // Filter bank by selected category
  const getFilteredItems = (cat: QuizCategory): QuizItem[] => {
    const fullBank = getFullItemBank();
    
    // Priority filter if weak character review requested
    if (initialTargetIds && initialTargetIds.length > 0) {
      const filtered = fullBank.filter(item => initialTargetIds.includes(item.id));
      if (filtered.length > 0) return filtered;
    }

    if (cat === 'all') return fullBank;
    if (cat === 'char') return fullBank.filter(i => i.category === 'char' || i.category === 'english');
    if (cat === 'word') return WORD_BANK;
    if (cat === 'sentence') return SENTENCE_BANK;
    if (cat === 'korean') return fullBank.filter(i => i.category === 'korean' || i.char === '구조' || i.char === '비상' || i.char === '확인');
    if (cat === 'english') return fullBank.filter(i => i.category === 'english' || i.category === 'word' || i.category === 'sentence');
    if (cat === 'number') return fullBank.filter(i => i.category === 'number');
    if (cat === 'symbol') return fullBank.filter(i => i.category === 'symbol');

    return fullBank;
  };

  // Generate a random question
  const generateQuestion = (type: QuizType, cat: QuizCategory = selectedCategory) => {
    globalMorsePlayer.stop();

    const pool = getFilteredItems(cat);
    if (pool.length === 0) return;

    const target = pool[Math.floor(Math.random() * pool.length)];
    let options: string[] = [];
    let correctAnswer = target.char;

    if (type === 'char-to-morse') {
      correctAnswer = target.code;
    }

    if (type === 'morse-to-char' || type === 'audio-to-char' || type === 'speed-run') {
      const wrongPool = pool.filter(item => item.id !== target.id);
      const shuffledWrong = [...wrongPool].sort(() => 0.5 - Math.random()).slice(0, 3);
      options = [target.char, ...shuffledWrong.map(w => w.char)].sort(() => 0.5 - Math.random());
    }

    setCurrentQuestion({
      item: target,
      options,
      correctAnswer,
    });

    setSelectedOption(null);
    setKeypadInput('');
    setIsSubmitted(false);
    setIsCorrect(false);

    // Set Morse code for audio player
    globalMorsePlayer.setCode(target.code);

    // Auto play audio for audio-to-char mode
    if (type === 'audio-to-char') {
      setTimeout(() => {
        globalMorsePlayer.play(target.code, settings.soundSpeed);
      }, 350);
    }
  };

  const startQuizMode = (type: QuizType) => {
    setActiveType(type);
    setScoreInSession(0);
    setQuestionsAnswered(0);
    setStreakInSession(0);
    if (type === 'speed-run') {
      setTimeLeft(60);
      setIsTimerRunning(true);
    }
    generateQuestion(type, selectedCategory);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
    checkAnswer(option);
  };

  const handleKeypadSubmit = () => {
    if (isSubmitted || !keypadInput) return;
    checkAnswer(keypadInput.trim());
  };

  const checkAnswer = (userAns: string) => {
    if (!currentQuestion) return;

    const correct = userAns.toUpperCase().replace(/\s+/g, '') === currentQuestion.correctAnswer.toUpperCase().replace(/\s+/g, '');
    setIsSubmitted(true);
    setIsCorrect(correct);

    const points = correct ? (activeType === 'speed-run' ? 30 : 20) : 0;
    if (correct) {
      setScoreInSession(prev => prev + points);
      setStreakInSession(prev => prev + 1);
      if (streakInSession > 0 && (streakInSession + 1) % 5 === 0) {
        triggerConfetti();
      }
    } else {
      setStreakInSession(0);
    }

    setQuestionsAnswered(prev => prev + 1);
    onRecordQuizResult(correct, currentQuestion.item.id, points);
  };

  const handleNextQuestion = () => {
    if (activeType) {
      generateQuestion(activeType, selectedCategory);
    }
  };

  const handleSpeedChange = (speed: SoundSpeed) => {
    globalMorsePlayer.setSpeed(speed);
    if (onUpdateSettings) {
      onUpdateSettings({ soundSpeed: speed });
    }
  };

  // 1. Quiz Mode Selection & Filter Setup Screen
  if (!activeType) {
    return (
      <div className="space-y-4 pb-20 animate-fade-in">
        {/* Banner */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold mx-auto flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-white">모스부호 퀴즈 & 청음 센터</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            모든 퀴즈 문제에서 실제 모스부호 소리를 재생하고 속도를 조절할 수 있습니다.
          </p>
        </div>

        {/* Category Filter Selector */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Filter className="w-4 h-4 text-blue-400" />
              <span>문제 범위 (Category)</span>
            </div>
            <span className="text-[11px] text-blue-400 font-medium">
              선택됨: {
                selectedCategory === 'all' ? '전체' :
                selectedCategory === 'char' ? '문자 퀴즈' :
                selectedCategory === 'word' ? '단어 퀴즈' :
                selectedCategory === 'sentence' ? '문장 퀴즈' :
                selectedCategory === 'korean' ? '한국어 퀴즈' :
                selectedCategory === 'english' ? '영어 퀴즈' :
                selectedCategory === 'number' ? '숫자 퀴즈' : '특수기호 퀴즈'
              }
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'all', label: '🌐 전체' },
              { id: 'char', label: '🔤 문자' },
              { id: 'word', label: '💬 단어' },
              { id: 'sentence', label: '📜 문장' },
              { id: 'korean', label: '🇰🇷 한국어' },
              { id: 'english', label: '🔠 영어' },
              { id: 'number', label: '🔢 숫자' },
              { id: 'symbol', label: '🔣 특수기호' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as QuizCategory)}
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Mode Selection Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Mode 1: Morse -> Char */}
          <button
            onClick={() => startQuizMode('morse-to-char')}
            className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 font-mono font-extrabold text-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                .-
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">1. 모스부호 → 문자/단어/문장</h3>
                <p className="text-xs text-slate-400 mt-0.5">화면에 표시된 부호와 소리를 함께 들으며 선택</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Mode 2: Char -> Morse Keypad */}
          <button
            onClick={() => startQuizMode('char-to-morse')}
            className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800 transition-all text-left flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 font-extrabold text-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                A/ㄱ
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">2. 문자/단어/문장 → 모스부호 입력</h3>
                <p className="text-xs text-slate-400 mt-0.5">터치 키패드로 직접 점과 선을 터치하여 입력</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Mode 3: Audio -> Char */}
          <button
            onClick={() => startQuizMode('audio-to-char')}
            className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-left flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">3. 청음 테스트 (소리 듣기 → 맞추기)</h3>
                <p className="text-xs text-slate-400 mt-0.5">실제 모스부호 소리를 청음하고 해당 문자/단어 적중</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Mode 4: Speed Run */}
          <button
            onClick={() => startQuizMode('speed-run')}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-all text-left flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
                  4. 스피드 런 (60초 타임어택)
                </h3>
                <p className="text-xs text-amber-200/70 mt-0.5">60초 동안 소리를 들으며 최대한 많은 문제 정복</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Active Quiz Question Screen
  if (!currentQuestion) return null;

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header during quiz */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between">
        <button
          onClick={() => { 
            setActiveType(null); 
            setIsTimerRunning(false); 
            globalMorsePlayer.stop();
          }}
          className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1"
        >
          ← 퀴즈 목록으로
        </button>

        {/* Speed Run Timer badge */}
        {activeType === 'speed-run' && (
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full text-amber-300 font-extrabold text-xs">
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>{timeLeft}초 남음</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs font-extrabold">
          <span className="text-slate-400">풀이: {questionsAnswered}</span>
          <span className="text-amber-400 flex items-center gap-0.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {streakInSession}연속
          </span>
          <span className="text-blue-400">{scoreInSession}점</span>
        </div>
      </div>

      {/* Speed Run Ended Screen */}
      {activeType === 'speed-run' && timeLeft === 0 ? (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center ring-4 ring-amber-500/30">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">타임어택 완료!</h2>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 max-w-xs mx-auto space-y-2">
            <div className="text-2xl font-black text-amber-400">{scoreInSession}점 획득</div>
            <div className="text-xs text-slate-400">맞춘 문제 수: {streakInSession}개</div>
          </div>
          <button
            onClick={() => startQuizMode('speed-run')}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>다시 도전하기</span>
          </button>
        </div>
      ) : (
        /* Active Question Card */
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 text-center space-y-4 shadow-xl">
          {/* Question Prompt Header */}
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
              {activeType === 'morse-to-char' && '다음 모스부호에 해당하는 문자/단어/문자는?'}
              {activeType === 'char-to-morse' && '다음 문자/단어/문자의 모스부호를 입력하세요.'}
              {activeType === 'audio-to-char' && '신호음을 청음하고 문자/단어를 맞추세요.'}
              {activeType === 'speed-run' && '모스부호 및 신호음에 맞는 답을 신속하게 선택!'}
            </span>

            {/* Display Target (Morse string or Character text) */}
            {activeType === 'morse-to-char' || activeType === 'speed-run' ? (
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 my-2">
                <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-blue-400 break-all">
                  {currentQuestion.item.code.replace(/\./g, '•').replace(/-/g, '—')}
                </span>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {currentQuestion.item.reading}
                </p>
              </div>
            ) : activeType === 'char-to-morse' ? (
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 my-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {currentQuestion.item.char}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  힌트: {currentQuestion.item.description} ({currentQuestion.item.reading})
                </p>
              </div>
            ) : (
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 my-2 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-400 mb-1">청음 모드 (Morse Audio)</span>
                <span className="text-[11px] text-blue-400 font-medium">
                  아래 소리 컨트롤러로 신호음을 청취하세요.
                </span>
              </div>
            )}
          </div>

          {/* ================================================== */}
          {/* STREAMLINED MORSE AUDIO PLAYER & SPEED SELECTOR    */}
          {/* ================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 text-left shadow-inner">
            {/* Header: Title & Equalizer status */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-slate-200">🔊 모스 소리 재생</span>
              </div>
              {playerState.isPlaying && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-extrabold">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  재생 중...
                </span>
              )}
            </div>

            {/* Audio Control Action Buttons (▶ 재생, ⏸ 일시정지, ⏹ 정지, 🔁 다시 듣기) */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* 1. Play Button */}
              <button
                onClick={() => globalMorsePlayer.play(currentQuestion.item.code, settings.soundSpeed)}
                className={`py-2.5 px-1 rounded-xl border text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  playerState.isPlaying && !playerState.isPaused
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>▶ 재생</span>
              </button>

              {/* 2. Pause Button */}
              <button
                onClick={() => globalMorsePlayer.pause()}
                disabled={!playerState.isPlaying && !playerState.isPaused}
                className={`py-2.5 px-1 rounded-xl border text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  playerState.isPaused
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30 ring-2 ring-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100 disabled:opacity-40 disabled:hover:bg-slate-800'
                }`}
              >
                <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>⏸ 일시정지</span>
              </button>

              {/* 3. Stop Button */}
              <button
                onClick={() => globalMorsePlayer.stop()}
                className="py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>⏹ 정지</span>
              </button>

              {/* 4. Replay Button */}
              <button
                onClick={() => globalMorsePlayer.replay(currentQuestion.item.code, settings.soundSpeed)}
                className="py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>↻ 다시 듣기</span>
              </button>
            </div>

            {/* Single-touch Direct Speed Selector Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>⚡ 재생 속도</span>
                <span className="text-blue-400 font-extrabold">
                  {settings.soundSpeed || '1.0x'}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[
                  { id: '0.5x', label: '0.5×' },
                  { id: '0.75x', label: '0.75×' },
                  { id: '1.0x', label: '1.0×' },
                  { id: '1.25x', label: '1.25×' },
                  { id: '1.5x', label: '1.5×' },
                  { id: '2.0x', label: '2.0×' },
                ].map((spd) => {
                  const isActive =
                    settings.soundSpeed === spd.id ||
                    (settings.soundSpeed === 'normal' && spd.id === '1.0x') ||
                    (settings.soundSpeed === 'slow' && spd.id === '0.75x') ||
                    (settings.soundSpeed === 'very-slow' && spd.id === '0.5x') ||
                    (settings.soundSpeed === 'fast' && spd.id === '1.5x') ||
                    (settings.soundSpeed === 'very-fast' && spd.id === '2.0x');

                  return (
                    <button
                      key={spd.id}
                      onClick={() => handleSpeedChange(spd.id as SoundSpeed)}
                      className={`py-1.5 px-0.5 text-[11px] font-black rounded-lg transition-all border text-center ${
                        isActive
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                          : 'bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                      }`}
                    >
                      {spd.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Multiple Choice Options (for Mode 1, 3, 4) */}
          {(activeType === 'morse-to-char' || activeType === 'audio-to-char' || activeType === 'speed-run') && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {currentQuestion.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-900 border-slate-800 text-white hover:border-blue-500/50';

                if (isSubmitted) {
                  if (opt === currentQuestion.correctAnswer) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30';
                  } else if (opt === selectedOption) {
                    btnStyle = 'bg-red-600 text-white border-red-500';
                  } else {
                    btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isSubmitted}
                    className={`h-14 rounded-2xl border font-extrabold text-lg flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Keypad Input (for Mode 2: char-to-morse) */}
          {activeType === 'char-to-morse' && (
            <div className="space-y-3 pt-2">
              <MorseKeypad
                value={keypadInput}
                onChange={setKeypadInput}
                onSubmit={handleKeypadSubmit}
                settings={settings}
                placeholder="모스부호 입력 (예: .-)"
              />
            </div>
          )}

          {/* Feedback Result Banner */}
          {isSubmitted && (
            <div className={`p-4 rounded-2xl border text-center space-y-2 animate-fade-in ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center justify-center gap-2 font-black text-base">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>정답입니다! (+{activeType === 'speed-run' ? 30 : 20}점)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span>아쉽네요! 정답: {currentQuestion.correctAnswer} ({currentQuestion.item.reading})</span>
                  </>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
              >
                <span>다음 문제로</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
