import { Chapter, Lesson, LessonStep, LessonStepType, UserProgress } from '../types';
import { KOREAN_MORSE, ENGLISH_MORSE, encodeTextToMorse } from './morseData';

// --- Vocabulary & Scenario Banks for Randomized Generation ---

const EN_BASIC_CHARS = [
  { char: 'E', code: '.', reading: '딧', desc: '가장 자주 사용되는 단일 점' },
  { char: 'T', code: '-', reading: '다아', desc: '가장 대표적인 단일 선' },
  { char: 'A', code: '.-', reading: '딧 다아', desc: '점 하나, 선 하나' },
  { char: 'N', code: '-.', reading: '다아 딧', desc: '선 하나, 점 하나' },
  { char: 'S', code: '...', reading: '딧 딧 딧', desc: '점 3개' },
  { char: 'O', code: '---', reading: '다아 다아 다아', desc: '선 3개' },
  { char: 'H', code: '....', reading: '딧 딧 딧 딧', desc: '점 4개' },
  { char: 'I', code: '..', reading: '딧 딧', desc: '점 2개' },
  { char: 'R', code: '.-.', reading: '딧 다아 딧', desc: '딧-다아-딧' },
  { char: 'M', code: '--', reading: '다아 다아', desc: '선 2개' },
  { char: 'D', code: '-..', reading: '다아 딧 딧', desc: '다아-딧-딧' },
  { char: 'K', code: '-.-', reading: '다아 딧 다아', desc: '다아-딧-다아' },
];

const EASY_WORDS = ['SOS', 'HI', 'AT', 'AN', 'OK', 'NO', 'GO', 'ME', 'IT', 'IN'];
const MEDIUM_WORDS = ['HELP', 'WAIT', 'SAFE', 'COPY', 'DONE', 'FINE', 'ALERT', 'READY', 'RADIO', 'CALL', 'FAST'];
const HARD_WORDS = ['MAYDAY', 'RESCUE', 'SIGNAL', 'BEACON', 'URGENT', 'TARGET', 'STATUS', 'SYSTEM', 'REPORT', 'STATION'];

const SENTENCES = [
  { text: 'MAYDAY MAYDAY', prompt: '비상 해상 구호 신호 전송' },
  { text: 'HELP US NOW', prompt: '긴급 구조 요청 메시지' },
  { text: 'POSITION OK', prompt: '현재 위치 안전 확인' },
  { text: 'STATUS READY', prompt: '작전 준비 완료 전송' },
  { text: 'SEND BEACON', prompt: '위치 발신기 신호 송출' },
  { text: 'COPY THAT', prompt: '상대 메시지 수신 완료' },
  { text: 'WAIT FOR ME', prompt: '합류 대기 요청 신호' },
];

const QA_BANK = [
  { question: '국제 통용 비상 구조 신호인 SOS의 모스부호는 무엇입니까?', targetText: 'SOS', targetMorse: '... --- ...' },
  { question: '단일 점(.) 하나로 구성된 가장 짧은 알파벳은 무엇입니까?', targetText: 'E', targetMorse: '.' },
  { question: '단일 선(-) 하나로 구성된 대표적인 알파벳은 무엇입니까?', targetText: 'T', targetMorse: '-' },
  { question: '비상 선박 통신에서 사용하는 최고 단계 구조 구호 6글자는?', targetText: 'MAYDAY', targetMorse: '--.-- .- -.-- -.. .- -.--' },
  { question: '수신 완료 및 알겠다는 의미의 긍정 무전 응답 2글자는?', targetText: 'OK', targetMorse: '--- -.-' },
  { question: '상대방에게 대기를 요청할 때 보내는 신호(WAIT)의 첫 글자 W는?', targetText: 'W', targetMorse: '.--' },
  { question: '숫자 5를 모스부호로 표현하면 무엇입니까?', targetText: '5', targetMorse: '.....' },
  { question: '미국의 긴급 구조 대표 전화번호 911을 모스로 입력하세요.', targetText: '911', targetMorse: '----. .---- .----' },
];

const DIALOGUE_BANK = [
  { sender: '해양 기지국: 주파수를 수신했습니다. 상태를 보고하십시오.', prompt: '[READY] 신호를 모스로 송신하세요.', targetText: 'READY' },
  { sender: '구조 헬기: 신호 위치 확인 중. 전방에 위치해 있습니까?', prompt: '[YES]라고 응답 모스를 보내세요.', targetText: 'YES' },
  { sender: '정찰대: 현재 이동이 불가합니까?', prompt: '[NO]라고 모스 응답을 송신하세요.', targetText: 'NO' },
  { sender: '통신 제어소: 전진 명령 발령. 즉시 이동을 개시하십시오.', prompt: '[GO] 명령 신호를 모스로 송신하세요.', targetText: 'GO' },
  { sender: '연락함: 상대측 메시지를 정상적으로 수신했습니까?', prompt: '[COPY]를 모스로 전송하세요.', targetText: 'COPY' },
  { sender: '중앙 기지: 현재 위치 좌표를 인코딩하십시오.', prompt: '[BASE] 위치 코드를 입력하세요.', targetText: 'BASE' },
];

const FILL_BLANK_BANK = [
  { display: 'S [ ? ] S', blankChar: 'O', blankMorse: '---', hint: 'SOS 중 가운데 O의 모스 (---)' },
  { display: 'H [ ? ] L P', blankChar: 'E', blankMorse: '.', hint: 'HELP 중 E의 모스 (.)' },
  { display: 'M [ ? ] Y D A Y', blankChar: 'A', blankMorse: '.-', hint: 'MAYDAY 중 A의 모스 (.-)' },
  { display: 'R [ ? ] A D Y', blankChar: 'E', blankMorse: '.', hint: 'READY 중 E의 모스 (.)' },
  { display: 'W [ ? ] I T', blankChar: 'A', blankMorse: '.-', hint: 'WAIT 중 A의 모스 (.-)' },
  { display: '1 [ ? ] 1', blankChar: '9', blankMorse: '----.', hint: '911 비상 번호 중 9의 모스 (----.)' },
];

const RADIO_PRACTICE_BANK = [
  { callsign: 'CONTROL-1', freq: '144.120 MHz', situation: '비상 작전 무선 통신망 개설', prompt: '비상 구호 코드 [SOS]를 전송하세요.', targetText: 'SOS' },
  { callsign: 'RESCUE-ALPHA', freq: '433.920 MHz', situation: '해상 야간 수색 작전', prompt: '안전 확인 신호 [SAFE]를 전송하세요.', targetText: 'SAFE' },
  { callsign: 'EAGLE-BASE', freq: '27.125 MHz', situation: '전술 거점 기지 통신 연결', prompt: '기지 명칭 [BASE]를 전송하세요.', targetText: 'BASE' },
  { callsign: 'TOWER-7', freq: '121.500 MHz', situation: '항공 비상 응급 통신', prompt: '즉시 통신 메시지 [NOW]를 송신하세요.', targetText: 'NOW' },
];

// Korean vocabulary banks for Chapter 5
const KO_BASIC_CHARS = KOREAN_MORSE.slice(0, 14);
const KO_WORDS = [
  { text: '구조', morse: '.-.. ..- --.. ㅗ' },
  { text: '확인', morse: '-... .- .-.. ..-.' },
  { text: '안녕', morse: '.-.- .--. .-.- .--.' },
  { text: '이상', morse: '..- -... .--.' },
  { text: '비상', morse: '---... -...' },
  { text: '대기', morse: '-.. .-. -.-' },
  { text: '나무', morse: '..-. --' },
  { text: '바다', morse: '---... -..' },
];

// --- Chapters Definitions (5 Chapters, 15 Lessons Each) ---

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    chapterNumber: 1,
    title: '단원 1: 기본 통신과 구조 신호',
    subtitle: '모스부호의 첫걸음과 국제 구조 비상 신호 SOS',
    description: '가장 자주 사용되는 점/선 기호부터 국제 해상 비상 신호 SOS와 MAYDAY까지 습득합니다.',
    badge: '🚨',
    badgeTitle: '구조 신호 마스터',
    iconName: 'Radio',
    rewardXp: 500,
    lessons: Array.from({ length: 15 }, (_, i) => {
      const num = i + 1;
      return {
        id: `ch-1-l${num}`,
        chapterId: 'ch-1',
        lessonNumber: num,
        title: `레슨 ${num}: ${
          num === 1 ? '기본 점과 선 (E, T, A, N)' :
          num === 2 ? '국제 구조 신호 SOS' :
          num === 3 ? '기본 응답 알파벳 (H, I, S, O)' :
          num === 4 ? '비상 구호 메시지 (HELP, MAYDAY)' :
          num === 5 ? '수신기 점검 및 기초 무전' :
          num === 6 ? '기지국 긍정 응답 (OK, COPY)' :
          num === 7 ? '해상 비상 통신 전술' :
          num === 8 ? '속도 향상 청음 트레이닝' :
          num === 9 ? '빈칸 모스 보완 훈련' :
          num === 10 ? '정찰대 비상 암호 교신' :
          num === 11 ? '구조 헬기 신호 송수신' :
          num === 12 ? '대화형 수신 해석 실전' :
          num === 13 ? '콤보 단어 및 문장 무전' :
          num === 14 ? '고속 무신 송수신 훈련' :
          '[단원 1 최종 시험] 구조 통신 종합 실전'
        }`,
        description: `단원 1의 레슨 ${num}입니다. 난이도 단계별 실전 문제로 구호 모스 통신 능력을 키웁니다.`,
        rewardXp: num === 15 ? 300 : 100 + num * 10,
        steps: [], // Steps generated dynamically at runtime!
      };
    }),
  },
  {
    id: 'ch-2',
    chapterNumber: 2,
    title: '단원 2: 짧은 대화와 무선 응답',
    subtitle: '상대방과의 대화 개시 및 상황별 빠른 무전 응답',
    description: '현장에서 주고받는 인사, 준비 상태(READY), 출발(GO) 및 무전 종료(OVER, OUT)를 익힙니다.',
    badge: '💬',
    badgeTitle: '무선 교신 특공대',
    iconName: 'MessageSquare',
    rewardXp: 500,
    lessons: Array.from({ length: 15 }, (_, i) => {
      const num = i + 1;
      return {
        id: `ch-2-l${num}`,
        chapterId: 'ch-2',
        lessonNumber: num,
        title: `레슨 ${num}: ${
          num === 1 ? '기본 인사와 접속 (HI, HELLO)' :
          num === 2 ? '긍정과 부정 응답 (YES, NO)' :
          num === 3 ? '통신 가동 신호 (READY, GO)' :
          num === 4 ? '상태 확인 메시지 (GOOD, SAFE)' :
          num === 5 ? '대화 유지와 대기 (WAIT, AGAIN)' :
          num === 6 ? '무선 교신 종료 (OVER, OUT)' :
          num === 7 ? '조난자 수색 대화' :
          num === 8 ? '기지국 대화 이어가기' :
          num === 9 ? '질문 응답 속성 트레이닝' :
          num === 10 ? '다자간 통신망 대화' :
          num === 11 ? '주파수 교선 대화 수신' :
          num === 12 ? '속기 및 빠른 응답' :
          num === 13 ? '실전 야간 무선 대화' :
          num === 14 ? '긴급 메시지 전달' :
          '[단원 2 최종 시험] 무선 대화 완벽 실전'
        }`,
        description: `단원 2의 레슨 ${num}입니다. 대화형 질문과 응답 무전 연습을 진행합니다.`,
        rewardXp: num === 15 ? 300 : 110 + num * 10,
        steps: [],
      };
    }),
  },
  {
    id: 'ch-3',
    chapterNumber: 3,
    title: '단원 3: 숫자, 수량 및 비상 코드',
    subtitle: '모스부호 숫자(1~0) 패턴과 전술 긴급 번호 전송',
    description: '규칙적인 모스 숫자 패턴을 습득하고 비상 전화번호(911, 119) 및 수량을 전송합니다.',
    badge: '🔢',
    badgeTitle: '비상 코드 마스터',
    iconName: 'Hash',
    rewardXp: 500,
    lessons: Array.from({ length: 15 }, (_, i) => {
      const num = i + 1;
      return {
        id: `ch-3-l${num}`,
        chapterId: 'ch-3',
        lessonNumber: num,
        title: `레슨 ${num}: ${
          num === 1 ? '점이 늘어나는 숫자 (1~5)' :
          num === 2 ? '선이 늘어나는 숫자 (6~0)' :
          num === 3 ? '비상 전화번호 (911, 119, 112)' :
          num === 4 ? '수량 및 카운트다운 (10, 20)' :
          num === 5 ? '무선 경찰 전술 코드 (10-4, 10-20)' :
          num === 6 ? '암호화 숫자 조합' :
          num === 7 ? '위치 번호 코드 전달' :
          num === 8 ? '숫자 청음 속도 훈련' :
          num === 9 ? '빈칸 숫자 완성 문제' :
          num === 10 ? '긴급 재난 시각 전송' :
          num === 11 ? '난수표 코드 수신 및 해독' :
          num === 12 ? '군사 통신 수량 보고' :
          num === 13 ? '고속 숫자 송신 훈련' :
          num === 14 ? '실전 암호 코드 번호 교신' :
          '[단원 3 최종 시험] 숫자 & 코드 종합 실전'
        }`,
        description: `단원 3의 레슨 ${num}입니다. 수량 및 비상 코드 숫자 송수신 능력을 평가합니다.`,
        rewardXp: num === 15 ? 300 : 120 + num * 10,
        steps: [],
      };
    }),
  },
  {
    id: 'ch-4',
    chapterNumber: 4,
    title: '단원 4: 시간, 위치 좌표 및 탐색 교신',
    subtitle: '현재 시각 및 거점 좌표, 방위 지점 송수신',
    description: '작전 수행 시 필요한 시간(NOW, TODAY)과 거점 위치(BASE, NORTH, SEOUL)를 전달합니다.',
    badge: '📍',
    badgeTitle: '위치 좌표 통제관',
    iconName: 'MapPin',
    rewardXp: 500,
    lessons: Array.from({ length: 15 }, (_, i) => {
      const num = i + 1;
      return {
        id: `ch-4-l${num}`,
        chapterId: 'ch-4',
        lessonNumber: num,
        title: `레슨 ${num}: ${
          num === 1 ? '시점 보고 (NOW, TODAY)' :
          num === 2 ? '거점 기지 전송 (BASE, PORT)' :
          num === 3 ? '방위 신호 (NORTH, SOUTH)' :
          num === 4 ? '동서 좌표 (EAST, WEST)' :
          num === 5 ? '작전 시간 교신 (NIGHT, FAST)' :
          num === 6 ? '주파수 지도 위치 (MAP, HERE)' :
          num === 7 ? '귀환 지점 보고대' :
          num === 8 ? '위치 청음 트레이닝' :
          num === 9 ? '좌표 빈칸 채우기' :
          num === 10 ? '항해 해상 위치 보고' :
          num === 11 ? '야간 비상 수색 좌표' :
          num === 12 ? '복합 시간 위치 교신' :
          num === 13 ? '항공 통신 좌표 송신' :
          num === 14 ? '고난도 전술 이동 경로' :
          '[단원 4 최종 시험] 좌표 탐색 종합 실전'
        }`,
        description: `단원 4의 레슨 ${num}입니다. 시간과 위치 좌표 무선 송출 기술을 훈련합니다.`,
        rewardXp: num === 15 ? 300 : 130 + num * 10,
        steps: [],
      };
    }),
  },
  {
    id: 'ch-5',
    chapterNumber: 5,
    title: '단원 5: 한글 모스부호 자모음 마스터',
    subtitle: '국내 통신 전술 한글 자음/모음 및 한국어 단어 변환',
    description: '한글 자음(ㄱ, ㄴ, ㄷ, ㄹ...)과 모음(ㅏ, ㅓ, ㅗ, ㅜ...)을 정교하게 모스로 변환하여 연습합니다.',
    badge: '🇰🇷',
    badgeTitle: '한글 모스 마스터',
    iconName: 'Languages',
    rewardXp: 500,
    lessons: Array.from({ length: 15 }, (_, i) => {
      const num = i + 1;
      return {
        id: `ch-5-l${num}`,
        chapterId: 'ch-5',
        lessonNumber: num,
        title: `레슨 ${num}: ${
          num === 1 ? '기본 자음 (ㄱ, ㄴ, ㄷ, ㅁ)' :
          num === 2 ? '확장 자음 (ㄹ, ㅂ, ㅅ, ㅇ)' :
          num === 3 ? '정밀 자음 (ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ)' :
          num === 4 ? '기본 모음 (ㅏ, ㅓ, ㅗ, ㅜ)' :
          num === 5 ? '복합 모음 (ㅡ, ㅣ, ㅐ, ㅔ)' :
          num === 6 ? '한글 단어 [나무, 산, 바다]' :
          num === 7 ? '한글 단어 [구조, 확인, 완료]' :
          num === 8 ? '한글 청음 훈련 (자음)' :
          num === 9 ? '한글 청음 훈련 (모음)' :
          num === 10 ? '한글 빈칸 채우기' :
          num === 11 ? '한글 비상 메시지 [비상 상황]' :
          num === 12 ? '한글 구호 대화 이어가기' :
          num === 13 ? '한글 고속 송수신 훈련' :
          num === 14 ? '한글 실전 무선 통신' :
          '[단원 5 최종 시험] 한글 모스 완벽 마스터'
        }`,
        description: `단원 5의 레슨 ${num}입니다. 한글 자모음과 낱말 모스 교신 훈련을 다룹니다.`,
        rewardXp: num === 15 ? 300 : 130 + num * 10,
        steps: [],
      };
    }),
  },
];

// Helper to get total count of all lessons across chapters (5 x 15 = 75 lessons)
export function getTotalLessonCount(): number {
  return CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0);
}

// Check if a chapter is completely cleared (all 15 lessons done)
export function isChapterCompleted(chapterId: string, completedLessons: string[] = []): boolean {
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return false;
  const completedSet = new Set(completedLessons);
  return chapter.lessons.every((lesson) => completedSet.has(lesson.id));
}

/**
 * Dynamic Step Generator
 * Creates 10 ~ 20 randomized, progressive steps for a given lesson
 * ensuring NO TWO CONSECUTIVE steps have the same type!
 */
export function generateLessonSteps(
  chapterId: string,
  lessonNumber: number,
  progress?: UserProgress
): LessonStep[] {
  // Determine step count: 10 steps for L1 up to 18~20 steps for L15
  const stepCount = Math.min(20, Math.max(10, 10 + Math.floor((lessonNumber - 1) * 0.7)));

  const isKoreanChapter = chapterId === 'ch-5';
  const steps: LessonStep[] = [];
  let lastType: LessonStepType | null = null;

  // Available types pool depending on lesson level
  const availableTypes: LessonStepType[] = [];
  if (lessonNumber <= 3) {
    availableTypes.push('single-char', 'word', 'fill-blank', 'listening');
  } else if (lessonNumber <= 7) {
    availableTypes.push('single-char', 'word', 'sentence', 'listening', 'decode', 'fill-blank');
  } else if (lessonNumber <= 11) {
    availableTypes.push('word', 'sentence', 'listening', 'decode', 'question-answer', 'dialogue', 'fill-blank');
  } else {
    // Advanced & Master Exam: All 9 types!
    availableTypes.push(
      'single-char',
      'word',
      'sentence',
      'listening',
      'decode',
      'question-answer',
      'dialogue',
      'fill-blank',
      'radio-practice'
    );
  }

  // Shuffle array utility
  const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  for (let i = 0; i < stepCount; i++) {
    // Pick a step type that is NOT equal to lastType
    const validTypes = availableTypes.filter((t) => t !== lastType);
    const chosenType = validTypes.length > 0 ? getRandomItem(validTypes) : availableTypes[0];
    lastType = chosenType;

    const stepId = `step-${chapterId}-l${lessonNumber}-${i + 1}-${Date.now()}`;

    if (chosenType === 'single-char') {
      const charObj = isKoreanChapter ? getRandomItem(KO_BASIC_CHARS) : getRandomItem(EN_BASIC_CHARS);
      steps.push({
        id: stepId,
        type: 'single-char',
        situation: `[레슨 ${lessonNumber}] 문자 학습 및 기본 타건`,
        prompt: `문자 [${charObj.char}]를 모스부호로 입력하세요.`,
        targetText: charObj.char,
        targetMorse: charObj.code,
        hint: `${charObj.char}의 읽기: ${charObj.reading} (${charObj.code})`,
        charId: isKoreanChapter ? (charObj as { id?: string }).id || `ko-${charObj.char}` : `en-${charObj.char.toLowerCase()}`,
      });
    } else if (chosenType === 'word') {
      const wordStr = lessonNumber <= 5 ? getRandomItem(EASY_WORDS) : lessonNumber <= 10 ? getRandomItem(MEDIUM_WORDS) : getRandomItem(HARD_WORDS);
      const morseCode = encodeTextToMorse(wordStr);
      steps.push({
        id: stepId,
        type: 'word',
        situation: `[레슨 ${lessonNumber}] 단어 무선 송출`,
        prompt: `단어 [${wordStr}]를 모스부호로 송신하세요.`,
        targetText: wordStr,
        targetMorse: morseCode,
        hint: `단어 각 알파벳 변환: ${morseCode}`,
      });
    } else if (chosenType === 'sentence') {
      const item = getRandomItem(SENTENCES);
      const morseCode = encodeTextToMorse(item.text);
      steps.push({
        id: stepId,
        type: 'sentence',
        situation: `[레슨 ${lessonNumber}] 문장 전술 통신`,
        senderMessage: `전신소 경보: ${item.prompt}`,
        prompt: `[${item.text}] 문장을 모스로 송신하세요.`,
        targetText: item.text,
        targetMorse: morseCode,
        hint: `문장 기호: ${morseCode}`,
      });
    } else if (chosenType === 'listening') {
      const listenWord = getRandomItem([...EASY_WORDS, ...MEDIUM_WORDS]);
      const morseCode = encodeTextToMorse(listenWord);
      steps.push({
        id: stepId,
        type: 'listening',
        situation: `[레슨 ${lessonNumber}] 🎧 청음 해석 훈련`,
        senderMessage: '수신 장비: 소리를 들은 뒤 해당 단어 또는 모스를 입력하세요.',
        prompt: '송출되는 모스 소리를 청취하고 정답을 입력하세요.',
        targetText: listenWord,
        targetMorse: morseCode,
        hint: `소리 기호: ${morseCode}`,
      });
    } else if (chosenType === 'decode') {
      const decodeWord = getRandomItem(EASY_WORDS);
      const morseCode = encodeTextToMorse(decodeWord);
      steps.push({
        id: stepId,
        type: 'decode',
        situation: `[레슨 ${lessonNumber}] 🔍 모스 부호 해독`,
        prompt: `수신된 모스부호 [ ${morseCode} ]의 원문 텍스트(${decodeWord})를 모스로 입력하세요.`,
        targetText: decodeWord,
        targetMorse: morseCode,
        hint: `해독 텍스트는 ${decodeWord}입니다.`,
      });
    } else if (chosenType === 'question-answer') {
      const qa = getRandomItem(QA_BANK);
      steps.push({
        id: stepId,
        type: 'question-answer',
        situation: `[레슨 ${lessonNumber}] ❓ 상황별 질문 및 응답`,
        prompt: `Q: ${qa.question}`,
        targetText: qa.targetText,
        targetMorse: qa.targetMorse,
        hint: `정답: ${qa.targetText} (${qa.targetMorse})`,
      });
    } else if (chosenType === 'dialogue') {
      const dlg = getRandomItem(DIALOGUE_BANK);
      const morseCode = encodeTextToMorse(dlg.targetText);
      steps.push({
        id: stepId,
        type: 'dialogue',
        situation: `[레슨 ${lessonNumber}] 📡 실시간 대화 이어가기`,
        senderMessage: dlg.sender,
        prompt: dlg.prompt,
        targetText: dlg.targetText,
        targetMorse: morseCode,
        hint: `${dlg.targetText} -> ${morseCode}`,
      });
    } else if (chosenType === 'fill-blank') {
      const fb = getRandomItem(FILL_BLANK_BANK);
      steps.push({
        id: stepId,
        type: 'fill-blank',
        situation: `[레슨 ${lessonNumber}] 🧩 빈칸 채우기 완성`,
        fillBlankText: fb.display,
        prompt: `[ ${fb.display} ] 의 빈칸 [ ? ]에 들어갈 모스를 입력하세요.`,
        targetText: fb.blankChar,
        targetMorse: fb.blankMorse,
        hint: fb.hint,
      });
    } else if (chosenType === 'radio-practice') {
      const rp = getRandomItem(RADIO_PRACTICE_BANK);
      const morseCode = encodeTextToMorse(rp.targetText);
      steps.push({
        id: stepId,
        type: 'radio-practice',
        situation: `[레슨 ${lessonNumber}] 📻 실전 무선 통신 연습`,
        senderMessage: `호출부호 [${rp.callsign}] | 주파수 [${rp.freq}]: ${rp.situation}`,
        prompt: rp.prompt,
        targetText: rp.targetText,
        targetMorse: morseCode,
        hint: `${rp.targetText} -> ${morseCode}`,
      });
    }
  }

  return steps;
}

/**
 * Get or dynamically generate full Lesson with randomized non-repeating steps
 */
export function getLesson(chapterId: string, lessonNumber: number, progress?: UserProgress): Lesson {
  const chapter = CHAPTERS.find((c) => c.id === chapterId) || CHAPTERS[0];
  const lessonStub = chapter.lessons.find((l) => l.lessonNumber === lessonNumber) || chapter.lessons[0];

  const steps = generateLessonSteps(chapter.id, lessonNumber, progress);

  return {
    ...lessonStub,
    steps,
  };
}

// Generate dynamic lesson based on current state and chapter
export function generateDynamicLesson(chapterId: string, progress: UserProgress): Lesson {
  const chapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
  const lessonIndex = (progress.completedLessons?.length || 0) + 1;
  const steps = generateLessonSteps(chapterId, (lessonIndex % 15) || 1, progress);

  return {
    id: `dyn-lesson-${chapterId}-${Date.now()}`,
    chapterId: chapter.id,
    lessonNumber: (lessonIndex % 15) || 1,
    title: `실전 생성 맞춤 레슨 #${lessonIndex}`,
    description: '학습자의 성취도와 레벨을 분석하여 동적으로 생성된 10~20문항 실전 교신 레슨입니다.',
    rewardXp: 150,
    steps,
  };
}

// Generate "Today's Review" (오늘의 복습) lesson dynamically
export function generateReviewLesson(progress: UserProgress): Lesson {
  const steps = generateLessonSteps('ch-1', 5, progress);

  return {
    id: `review-lesson-${Date.now()}`,
    chapterId: 'ch-review',
    lessonNumber: 1,
    title: '오늘의 맞춤 복습 세션',
    description: '자주 틀렸던 오답 항목을 집중 조명하여 약점을 보완하는 10~20문항 복습 세션입니다.',
    rewardXp: 150,
    steps,
  };
}

// Generate single character sequential learning lesson
export function generateCharacterLesson(lang: 'ko' | 'en', progress: UserProgress): Lesson {
  const list = lang === 'ko' ? KOREAN_MORSE : ENGLISH_MORSE;
  const learnedSet = new Set(progress.learnedCharacters || []);

  const unlearned = list.filter(c => !learnedSet.has(c.id));
  const targetList = unlearned.length > 0 ? unlearned.slice(0, 10) : list.slice(0, 10);

  const steps: LessonStep[] = targetList.map((c, idx) => ({
    id: `char-step-${idx}-${Date.now()}`,
    type: 'single-char',
    situation: `문자 자동 연속 학습 (${lang === 'ko' ? '한글' : '영어'})`,
    prompt: `문자 [${c.char}]를 터치패드로 모스 입력하세요.`,
    targetText: c.char,
    targetMorse: c.code,
    hint: `${c.description} -> 모스 기호: ${c.code}`,
    charId: c.id,
  }));

  return {
    id: `char-lesson-${lang}-${Date.now()}`,
    chapterId: 'ch-char-learn',
    lessonNumber: 1,
    title: `${lang === 'ko' ? '한글' : '영어'} 문자 순차 연속 학습`,
    description: '한 문자씩 입력하고 정답 시 자동 연속 이동하는 직관적 암기 모드입니다.',
    rewardXp: 120,
    steps,
  };
}
