import { UserProgress, UserRankInfo } from '../types';

export const RANKS: UserRankInfo[] = [
  { title: '초보자', minXp: 0, nextXp: 200, color: 'from-amber-500 to-orange-500', badge: '🌱' },
  { title: '견습생', minXp: 200, nextXp: 600, color: 'from-emerald-500 to-teal-500', badge: '⚡' },
  { title: '통신병', minXp: 600, nextXp: 1500, color: 'from-blue-500 to-cyan-500', badge: '📡' },
  { title: '전문가', minXp: 1500, nextXp: 3000, color: 'from-purple-500 to-indigo-500', badge: '🎖️' },
  { title: '마스터', minXp: 3000, nextXp: 99999, color: 'from-yellow-400 to-amber-500', badge: '👑' },
];

export function getRankInfo(score: number): UserRankInfo {
  const xp = score || 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function calculateStreakUpdate(progress: UserProgress): Partial<UserProgress> {
  const today = new Date().toISOString().split('T')[0];
  const lastDateStr = progress.lastStudyDate;
  const history = progress.studyHistoryDates || [];

  if (lastDateStr === today) {
    // Already studied today
    return {
      lastStudyDate: today,
      studyHistoryDates: history.includes(today) ? history : [...history, today],
    };
  }

  // Check if yesterday was last study date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newCurrentStreak = progress.streak || 0;
  const longest = progress.longestStreak || progress.streak || 0;

  if (lastDateStr === yesterdayStr) {
    newCurrentStreak += 1;
  } else {
    // Missed one or more days, reset current streak to 1
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(longest, newCurrentStreak);
  const newStudyHistory = history.includes(today) ? history : [...history, today];

  return {
    streak: newCurrentStreak,
    longestStreak: newLongestStreak,
    totalStudyDays: newStudyHistory.length,
    lastStudyDate: today,
    studyHistoryDates: newStudyHistory,
  };
}
