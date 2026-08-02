import { MorseChar } from '../types';

export const ENGLISH_MORSE: MorseChar[] = [
  // Letters A~Z
  { id: 'en-a', char: 'A', code: '.-', category: 'en-letter', lang: 'en', reading: '딧 다아', description: '짧은 소리 후 긴 소리' },
  { id: 'en-b', char: 'B', code: '-...', category: 'en-letter', lang: 'en', reading: '다아 딧 딧 딧', description: '긴 소리 1번, 짧은 소리 3번' },
  { id: 'en-c', char: 'C', code: '-.-.', category: 'en-letter', lang: 'en', reading: '다아 딧 다아 딧', description: '긴 소리와 짧은 소리 교대' },
  { id: 'en-d', char: 'D', code: '-..', category: 'en-letter', lang: 'en', reading: '다아 딧 딧', description: '긴 소리 1번, 짧은 소리 2번' },
  { id: 'en-e', char: 'E', code: '.', category: 'en-letter', lang: 'en', reading: '딧', description: '가장 짧은 단일 점' },
  { id: 'en-f', char: 'F', code: '..-.', category: 'en-letter', lang: 'en', reading: '딧 딧 다아 딧', description: '짧은 소리 2번, 긴 소리, 짧은 소리' },
  { id: 'en-g', char: 'G', code: '--.', category: 'en-letter', lang: 'en', reading: '다아 다아 딧', description: '긴 소리 2번 후 짧은 소리' },
  { id: 'en-h', char: 'H', code: '....', category: 'en-letter', lang: 'en', reading: '딧 딧 딧 딧', description: '연속 짧은 소리 4번' },
  { id: 'en-i', char: 'I', code: '..', category: 'en-letter', lang: 'en', reading: '딧 딧', description: '짧은 소리 2번' },
  { id: 'en-j', char: 'J', code: '.---', category: 'en-letter', lang: 'en', reading: '딧 다아 다아 다아', description: '짧은 소리 1번 후 긴 소리 3번' },
  { id: 'en-k', char: 'K', code: '-.-', category: 'en-letter', lang: 'en', reading: '다아 딧 다아', description: '긴 소리 사이에 짧은 소리' },
  { id: 'en-l', char: 'L', code: '.-..', category: 'en-letter', lang: 'en', reading: '딧 다아 딧 딧', description: '짧은, 긴, 짧은, 짧은' },
  { id: 'en-m', char: 'M', code: '--', category: 'en-letter', lang: 'en', reading: '다아 다아', description: '연속 긴 소리 2번' },
  { id: 'en-n', char: 'N', code: '-.', category: 'en-letter', lang: 'en', reading: '다아 딧', description: '긴 소리 후 짧은 소리' },
  { id: 'en-o', char: 'O', code: '---', category: 'en-letter', lang: 'en', reading: '다아 다아 다아', description: '연속 긴 소리 3번' },
  { id: 'en-p', char: 'P', code: '.--.', category: 'en-letter', lang: 'en', reading: '딧 다아 다아 딧', description: '짧은, 긴, 긴, 짧은' },
  { id: 'en-q', char: 'Q', code: '--.-', category: 'en-letter', lang: 'en', reading: '다아 다아 딧 다아', description: '긴, 긴, 짧은, 긴' },
  { id: 'en-r', char: 'R', code: '.-.', category: 'en-letter', lang: 'en', reading: '딧 다아 딧', description: '짧은 소리와 긴 소리 샌드위치' },
  { id: 'en-s', char: 'S', code: '...', category: 'en-letter', lang: 'en', reading: '딧 딧 딧', description: '연속 짧은 소리 3번 (SOS의 S)' },
  { id: 'en-t', char: 'T', code: '-', category: 'en-letter', lang: 'en', reading: '다아', description: '가장 단순한 단일 선' },
  { id: 'en-u', char: 'U', code: '..-', category: 'en-letter', lang: 'en', reading: '딧 딧 다아', description: '짧은 소리 2번 후 긴 소리' },
  { id: 'en-v', char: 'V', code: '...-', category: 'en-letter', lang: 'en', reading: '딧 딧 딧 다아', description: '베토벤 운명 교향곡 리듬' },
  { id: 'en-w', char: 'W', code: '.--', category: 'en-letter', lang: 'en', reading: '딧 다아 다아', description: '짧은 소리 1번 후 긴 소리 2번' },
  { id: 'en-x', char: 'X', code: '-..-', category: 'en-letter', lang: 'en', reading: '다아 딧 딧 다아', description: '양쪽 긴 소리, 가운데 짧은 소리 2번' },
  { id: 'en-y', char: 'Y', code: '-.--', category: 'en-letter', lang: 'en', reading: '다아 딧 다아 다아', description: '긴, 짧은, 긴, 긴' },
  { id: 'en-z', char: 'Z', code: '--..', category: 'en-letter', lang: 'en', reading: '다아 다아 딧 딧', description: '긴 소리 2번 후 짧은 소리 2번' },
];

export const KOREAN_CONSONANTS: MorseChar[] = [
  { id: 'ko-g', char: 'ㄱ', code: '.-..', category: 'ko-consonant', lang: 'ko', reading: '딧 다아 딧 딧', description: '자음 ㄱ' },
  { id: 'ko-n', char: 'ㄴ', code: '..-.', category: 'ko-consonant', lang: 'ko', reading: '딧 딧 다아 딧', description: '자음 ㄴ' },
  { id: 'ko-d', char: 'ㄷ', code: '-...', category: 'ko-consonant', lang: 'ko', reading: '다아 딧 딧 딧', description: '자음 ㄷ' },
  { id: 'ko-r', char: 'ㄹ', code: '...-', category: 'ko-consonant', lang: 'ko', reading: '딧 딧 딧 다아', description: '자음 ㄹ' },
  { id: 'ko-m', char: 'ㅁ', code: '--', category: 'ko-consonant', lang: 'ko', reading: '다아 다아', description: '자음 ㅁ' },
  { id: 'ko-b', char: 'ㅂ', code: '.--', category: 'ko-consonant', lang: 'ko', reading: '딧 다아 다아', description: '자음 ㅂ' },
  { id: 'ko-s', char: 'ㅅ', code: '--.', category: 'ko-consonant', lang: 'ko', reading: '다아 다아 딧', description: '자음 ㅅ' },
  { id: 'ko-ng', char: 'ㅇ', code: '-.-', category: 'ko-consonant', lang: 'ko', reading: '다아 딧 다아', description: '자음 ㅇ' },
  { id: 'ko-j', char: 'ㅈ', code: '.--.', category: 'ko-consonant', lang: 'ko', reading: '딧 다아 다아 딧', description: '자음 ㅈ' },
  { id: 'ko-ch', char: 'ㅊ', code: '-.-.', category: 'ko-consonant', lang: 'ko', reading: '다아 딧 다아 딧', description: '자음 ㅊ' },
  { id: 'ko-k', char: 'ㅋ', code: '-..-', category: 'ko-consonant', lang: 'ko', reading: '다아 딧 딧 다아', description: '자음 ㅋ' },
  { id: 'ko-t', char: 'ㅌ', code: '--..', category: 'ko-consonant', lang: 'ko', reading: '다아 다아 딧 딧', description: '자음 ㅌ' },
  { id: 'ko-p', char: 'ㅍ', code: '---', category: 'ko-consonant', lang: 'ko', reading: '다아 다아 다아', description: '자음 ㅍ' },
  { id: 'ko-h', char: 'ㅎ', code: '.---', category: 'ko-consonant', lang: 'ko', reading: '딧 다아 다아 다아', description: '자음 ㅎ' },
];

export const KOREAN_VOWELS: MorseChar[] = [
  { id: 'ko-a', char: 'ㅏ', code: '.', category: 'ko-vowel', lang: 'ko', reading: '딧', description: '모음 ㅏ' },
  { id: 'ko-ya', char: 'ㅑ', code: '..', category: 'ko-vowel', lang: 'ko', reading: '딧 딧', description: '모음 ㅑ' },
  { id: 'ko-eo', char: 'ㅓ', code: '-', category: 'ko-vowel', lang: 'ko', reading: '다아', description: '모음 ㅓ' },
  { id: 'ko-yeo', char: 'ㅕ', code: '...', category: 'ko-vowel', lang: 'ko', reading: '딧 딧 딧', description: '모음 ㅕ' },
  { id: 'ko-o', char: 'ㅗ', code: '.-', category: 'ko-vowel', lang: 'ko', reading: '딧 다아', description: '모음 ㅗ' },
  { id: 'ko-yo', char: 'ㅛ', code: '-.', category: 'ko-vowel', lang: 'ko', reading: '다아 딧', description: '모음 ㅛ' },
  { id: 'ko-u', char: 'ㅜ', code: '----', category: 'ko-vowel', lang: 'ko', reading: '다아 다아 다아 다아', description: '모음 ㅜ' },
  { id: 'ko-yu', char: 'ㅠ', code: '.-.-', category: 'ko-vowel', lang: 'ko', reading: '딧 다아 딧 다아', description: '모음 ㅠ' },
  { id: 'ko-eu', char: 'ㅡ', code: '-..', category: 'ko-vowel', lang: 'ko', reading: '다아 딧 딧', description: '모음 ㅡ' },
  { id: 'ko-i', char: 'ㅣ', code: '..-', category: 'ko-vowel', lang: 'ko', reading: '딧 딧 다아', description: '모음 ㅣ' },
  { id: 'ko-ae', char: 'ㅐ', code: '.--.-', category: 'ko-vowel', lang: 'ko', reading: '딧 다아 다아 딧 다아', description: '모음 ㅐ' },
  { id: 'ko-e', char: 'ㅔ', code: '-.-..', category: 'ko-vowel', lang: 'ko', reading: '다아 딧 다아 딧 딧', description: '모음 ㅔ' },
];

export const KOREAN_MORSE: MorseChar[] = [...KOREAN_CONSONANTS, ...KOREAN_VOWELS];

export const NUMBER_MORSE: MorseChar[] = [
  { id: 'num-0', char: '0', code: '-----', category: 'en-number', lang: 'en', reading: '다아 다아 다아 다아 다아', description: '숫자 0' },
  { id: 'num-1', char: '1', code: '.----', category: 'en-number', lang: 'en', reading: '딧 다아 다아 다아 다아', description: '숫자 1' },
  { id: 'num-2', char: '2', code: '..---', category: 'en-number', lang: 'en', reading: '딧 딧 다아 다아 다아', description: '숫자 2' },
  { id: 'num-3', char: '3', code: '...--', category: 'en-number', lang: 'en', reading: '딧 딧 딧 다아 다아', description: '숫자 3' },
  { id: 'num-4', char: '4', code: '....-', category: 'en-number', lang: 'en', reading: '딧 딧 딧 딧 다아', description: '숫자 4' },
  { id: 'num-5', char: '5', code: '.....', category: 'en-number', lang: 'en', reading: '딧 딧 딧 딧 딧', description: '숫자 5' },
  { id: 'num-6', char: '6', code: '-....', category: 'en-number', lang: 'en', reading: '다아 딧 딧 딧 딧', description: '숫자 6' },
  { id: 'num-7', char: '7', code: '--...', category: 'en-number', lang: 'en', reading: '다아 다아 딧 딧 딧', description: '숫자 7' },
  { id: 'num-8', char: '8', code: '---..', category: 'en-number', lang: 'en', reading: '다아 다아 다아 딧 딧', description: '숫자 8' },
  { id: 'num-9', char: '9', code: '----.', category: 'en-number', lang: 'en', reading: '다아 다아 다아 다아 딧', description: '숫자 9' },
];

export const SPECIAL_MORSE: MorseChar[] = [
  { id: 'sym-period', char: '.', code: '.-.-.-', category: 'en-symbol', lang: 'en', reading: '딧 다아 딧 다아 딧 다아', description: '마침표 (.)' },
  { id: 'sym-comma', char: ',', code: '--..--', category: 'en-symbol', lang: 'en', reading: '다아 다아 딧 딧 다아 다아', description: '쉼표 (,)' },
  { id: 'sym-question', char: '?', code: '..--..', category: 'en-symbol', lang: 'en', reading: '딧 딧 다아 다아 딧 딧', description: '물음표 (?)' },
  { id: 'sym-apostrophe', char: "'", code: '.----.', category: 'en-symbol', lang: 'en', reading: '딧 다아 다아 다아 다아 딧', description: '작은따옴표 (\')' },
  { id: 'sym-exclamation', char: '!', code: '-.-.--', category: 'en-symbol', lang: 'en', reading: '다아 딧 다아 딧 다아 다아', description: '느낌표 (!)' },
  { id: 'sym-slash', char: '/', code: '-..-.', category: 'en-symbol', lang: 'en', reading: '다아 딧 딧 다아 딧', description: '슬래시 (/)' },
  { id: 'sym-openparen', char: '(', code: '-.--.', category: 'en-symbol', lang: 'en', reading: '다아 딧 다아 다아 딧', description: '여는 괄호 (()' },
  { id: 'sym-closeparen', char: ')', code: '-.--.-', category: 'en-symbol', lang: 'en', reading: '다아 딧 다아 다아 딧 다아', description: '닫는 괄호 ())' },
  { id: 'sym-ampersand', char: '&', code: '.-...', category: 'en-symbol', lang: 'en', reading: '딧 다아 딧 딧 딧', description: '엠퍼샌드 (&)' },
  { id: 'sym-colon', char: ':', code: '---...', category: 'en-symbol', lang: 'en', reading: '다아 다아 다아 딧 딧 딧', description: '쌍점 (:)' },
  { id: 'sym-semicolon', char: ';', code: '-.-.-.', category: 'en-symbol', lang: 'en', reading: '다아 딧 다아 딧 다아 딧', description: '쌍시옷/쌍점 (;)' },
  { id: 'sym-equals', char: '=', code: '-...-', category: 'en-symbol', lang: 'en', reading: '다아 딧 딧 딧 다아', description: '등호 (=)' },
  { id: 'sym-plus', char: '+', code: '.-.-.', category: 'en-symbol', lang: 'en', reading: '딧 다아 딧 다아 딧', description: '더하기 (+)' },
  { id: 'sym-hyphen', char: '-', code: '-....-', category: 'en-symbol', lang: 'en', reading: '다아 딧 딧 딧 딧 다아', description: '하이픈 (-)' },
  { id: 'sym-underscore', char: '_', code: '..--.-', category: 'en-symbol', lang: 'en', reading: '딧 딧 다아 다아 딧 다아', description: '언더스코어 (_)' },
  { id: 'sym-quote', char: '"', code: '.-..-.', category: 'en-symbol', lang: 'en', reading: '딧 다아 딧 딧 다아 딧', description: '큰따옴표 (")' },
  { id: 'sym-dollar', char: '$', code: '...-..-', category: 'en-symbol', lang: 'en', reading: '딧 딧 딧 다아 딧 딧 다아', description: '달러 ($)' },
  { id: 'sym-at', char: '@', code: '.--.-.', category: 'en-symbol', lang: 'en', reading: '딧 다아 다아 딧 다아 딧', description: '골뱅이 (@)' },
];

export const ALL_MORSE: MorseChar[] = [
  ...KOREAN_MORSE,
  ...ENGLISH_MORSE,
  ...NUMBER_MORSE,
  ...SPECIAL_MORSE,
];

export const MORSE_LOOKUP_MAP = new Map<string, MorseChar>();
ALL_MORSE.forEach((item) => {
  MORSE_LOOKUP_MAP.set(item.code, item);
});

export const CHAR_LOOKUP_MAP = new Map<string, MorseChar>();
ALL_MORSE.forEach((item) => {
  CHAR_LOOKUP_MAP.set(item.char.toUpperCase(), item);
  CHAR_LOOKUP_MAP.set(item.char.toLowerCase(), item);
});

// Helper to decode a single Morse sequence (e.g. ".-") to character
export function decodeMorse(code: string): MorseChar | undefined {
  return MORSE_LOOKUP_MAP.get(code.trim());
}

// Decode full Morse string (e.g., "... --- ... / .--. .-. ...") into text
export function decodeMorseStringToText(morseString: string): string {
  if (!morseString.trim()) return '';
  const words = morseString.split('/');
  return words
    .map((wordStr) => {
      const letters = wordStr.trim().split(/\s+/);
      return letters
        .map((code) => {
          if (!code) return '';
          const found = MORSE_LOOKUP_MAP.get(code);
          return found ? found.char : code;
        })
        .join('');
    })
    .join(' ');
}

// Encode normal text (Korean, English, numbers, symbols) into Morse code
export function encodeTextToMorse(text: string): string {
  if (!text) return '';
  const words = text.split(' ');
  return words
    .map((word) => {
      const chars = Array.from(word);
      return chars
        .map((ch) => {
          const upper = ch.toUpperCase();
          const item = CHAR_LOOKUP_MAP.get(upper) || CHAR_LOOKUP_MAP.get(ch);
          return item ? item.code : ch;
        })
        .join(' ');
    })
    .join(' / ');
}
