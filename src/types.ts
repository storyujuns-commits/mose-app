export type LanguageCategory = 'ko' | 'en';

export type TabType = 'home' | 'learn' | 'quiz' | 'stats' | 'settings';

export type CategoryType = 
  | 'ko-consonant' 
  | 'ko-vowel' 
  | 'en-letter' 
  | 'en-number' 
  | 'en-symbol';

export interface MorseChar {
  id: string;
  char: string;
  code: string; // e.g. '.-'
  category: CategoryType;
  lang: LanguageCategory;
  reading: string; // e.g. '딧 다아'
  description: string; // Mnemonic / Tip
  example?: string;
}

export type StudyMode = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  uid: string;
  username?: string; // 아이디
  nickname: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  lastLogin: string;
  authProvider?: 'custom' | 'google' | 'email';
}

export interface UserProgress {
  koreanProgress: number; // 0 to 100 percentage
  englishProgress: number; // 0 to 100 percentage
  learnedCharacters: string[]; // array of char IDs or chars
  difficultCharacters: Record<string, { wrongCount: number; totalCount: number }>; // char -> stats
  totalQuizCount: number;
  correctQuizCount: number;
  score: number; // Represents total XP
  streak: number; // Current continuous streak
  longestStreak: number;
  totalStudyDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  studyHistoryDates: string[]; // ['2026-08-01', '2026-07-31']
  completedLessons: string[]; // array of lesson IDs e.g. ['ch-1-l1', 'ch-1-l2']
  completedChapters?: string[]; // array of completed chapter IDs e.g. ['ch-1']
  earnedBadges?: string[]; // array of badge titles e.g. ['🚨 구조 신호 마스터']
  currentChapterId?: string;
  currentLessonId?: string;
  lastChapterId?: string;
  lastLessonId?: string;
  totalStudyTime: number; // in seconds
  dailyGoalXp?: number; // e.g. 50 XP
}

export type SoundSpeed = '0.5x' | '0.75x' | '1.0x' | '1.25x' | '1.5x' | '2.0x' | 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast';

export interface UserSettings {
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  soundSpeed: SoundSpeed;
  soundPitch?: number; // Hz, e.g., 600
}

export type QuizType = 'morse-to-char' | 'char-to-morse' | 'audio-to-char' | 'speed-run';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  targetChar: MorseChar;
  options?: string[]; // 4 choices for multiple choice questions
  correctAnswer: string;
}

export type LessonStepType = 
  | 'single-char'       // 문자 학습
  | 'word'              // 단어 입력
  | 'sentence'          // 문장 입력
  | 'listening'         // 모스 듣기
  | 'decode'            // 모스 해석
  | 'question-answer'   // 질문에 답하기
  | 'dialogue'          // 대화 이어가기
  | 'fill-blank'        // 빈칸 채우기
  | 'radio-practice';   // 실전 통신 연습

export interface LessonStep {
  id: string;
  type: LessonStepType;
  situation: string; // e.g. "해상 수색 구조대와의 첫 신호 교신"
  senderMessage?: string; // e.g. "상대방: 구조 요청 신호를 전송하세요." or "HELLO"
  prompt: string; // e.g. "SOS를 모스로 입력하세요."
  targetText: string; // e.g. "SOS" or "A" or "HELLO"
  targetMorse: string; // e.g. "... --- ..." or ".-"
  hint?: string; // e.g. "S는 ... O는 ---"
  charId?: string; // If single-char step
  fillBlankText?: string; // e.g. "S [ ? ] S" for fill-blank
}

export interface Lesson {
  id: string;
  chapterId: string;
  lessonNumber: number; // 1 to 15
  title: string;
  description: string;
  icon?: string;
  steps: LessonStep[];
  rewardXp: number; // e.g. 100 ~ 300 XP
}

export interface Chapter {
  id: string;
  chapterNumber: number; // 1, 2, 3, 4, 5
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeTitle: string;
  iconName: string;
  rewardXp: number; // e.g. 500 XP bonus on completion
  lessons: Lesson[];
}

export type UserRankTitle = '초보자' | '견습생' | '통신병' | '전문가' | '마스터';

export interface UserRankInfo {
  title: UserRankTitle;
  minXp: number;
  nextXp: number;
  color: string;
  badge: string;
}

