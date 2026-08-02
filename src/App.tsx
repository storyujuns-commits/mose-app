import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, fetchUserProfile, fetchUserProgress, fetchUserSettings, saveUserProgress, saveUserSettings, syncUserToFirestore } from './lib/firebase';
import { UserProfile, UserProgress, UserSettings, TabType, Lesson } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { QuizView } from './views/QuizView';
import { StatsView } from './views/StatsView';
import { SettingsView } from './views/SettingsView';
import { FullScreenLessonView } from './views/FullScreenLessonView';
import { registerServiceWorker } from './lib/pwa';
import { KOREAN_MORSE, ENGLISH_MORSE } from './data/morseData';
import { calculateStreakUpdate } from './lib/rankAndStreak';

// Default initial state for guest / new user
const DEFAULT_PROGRESS: UserProgress = {
  koreanProgress: 0,
  englishProgress: 0,
  learnedCharacters: [],
  difficultCharacters: {},
  totalQuizCount: 0,
  correctQuizCount: 0,
  score: 0,
  streak: 1,
  longestStreak: 1,
  totalStudyDays: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  studyHistoryDates: [new Date().toISOString().split('T')[0]],
  completedLessons: [],
  totalStudyTime: 0,
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  theme: 'dark',
  language: 'ko',
  soundSpeed: 'normal',
  soundPitch: 600,
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quizFilterTargets, setQuizFilterTargets] = useState<string[] | undefined>(undefined);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Initialize PWA and Auth listener
  useEffect(() => {
    registerServiceWorker();

    // Load local storage fallback for guest
    const savedLocalProgress = localStorage.getItem('morse_local_progress');
    if (savedLocalProgress) {
      try { setProgress(JSON.parse(savedLocalProgress)); } catch {}
    }

    const savedLocalSettings = localStorage.getItem('morse_local_settings');
    if (savedLocalSettings) {
      try { setSettings(JSON.parse(savedLocalSettings)); } catch {}
    }

    // Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          let profile = await fetchUserProfile(user.uid);
          let cloudProgress = await fetchUserProgress(user.uid);
          let cloudSettings = await fetchUserSettings(user.uid);

          // If profile doc does not exist yet in Firestore, sync/create it now
          if (!profile) {
            await syncUserToFirestore(user);
            profile = await fetchUserProfile(user.uid);
            cloudProgress = await fetchUserProgress(user.uid);
            cloudSettings = await fetchUserSettings(user.uid);
          }

          // Fallback user profile if Firestore document reading fails
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            nickname: user.displayName || user.email?.split('@')[0] || '학습자',
            email: user.email || '',
            profileImage: user.photoURL || '',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            authProvider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
          };

          setCurrentUser(profile || fallbackProfile);
          if (cloudProgress) setProgress(cloudProgress);
          if (cloudSettings) setSettings(cloudSettings);
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
          // Always ensure currentUser is set so UI reflects authenticated state
          setCurrentUser({
            uid: user.uid,
            nickname: user.displayName || user.email?.split('@')[0] || '학습자',
            email: user.email || '',
            profileImage: user.photoURL || '',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            authProvider: 'email',
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Timer for active study time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const updated = { ...prev, totalStudyTime: (prev.totalStudyTime || 0) + 1 };
        if (currentUser) {
          saveUserProgress(currentUser.uid, { totalStudyTime: updated.totalStudyTime });
        } else {
          localStorage.setItem('morse_local_progress', JSON.stringify(updated));
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Save Progress Helper
  const handleSaveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    if (currentUser) {
      saveUserProgress(currentUser.uid, newProgress);
    } else {
      localStorage.setItem('morse_local_progress', JSON.stringify(newProgress));
    }
  };

  // Save Settings Helper
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (currentUser) {
      saveUserSettings(currentUser.uid, updated);
    } else {
      localStorage.setItem('morse_local_settings', JSON.stringify(updated));
    }
  };

  // Toggle character learned check
  const handleToggleLearned = (charId: string) => {
    const currentLearned = new Set(progress.learnedCharacters || []);
    if (currentLearned.has(charId)) {
      currentLearned.delete(charId);
    } else {
      currentLearned.add(charId);
    }

    const updatedLearned = Array.from(currentLearned);

    // Calculate progress percentages
    const totalKo = KOREAN_MORSE.length;
    const totalEn = ENGLISH_MORSE.length;

    const learnedKo = KOREAN_MORSE.filter(c => currentLearned.has(c.id)).length;
    const learnedEn = ENGLISH_MORSE.filter(c => currentLearned.has(c.id)).length;

    const newProgress: UserProgress = {
      ...progress,
      learnedCharacters: updatedLearned,
      koreanProgress: Math.min(100, Math.round((learnedKo / totalKo) * 100)),
      englishProgress: Math.min(100, Math.round((learnedEn / totalEn) * 100)),
    };

    handleSaveProgress(newProgress);
  };

  // Record Quiz Results
  const handleRecordQuizResult = (isCorrect: boolean, charId: string, points: number) => {
    const difficult = { ...progress.difficultCharacters };

    if (!isCorrect) {
      // Add or update wrong count
      const existing = difficult[charId] || { wrongCount: 0, totalCount: 0 };
      difficult[charId] = {
        wrongCount: existing.wrongCount + 1,
        totalCount: existing.totalCount + 1,
      };
    } else if (difficult[charId]) {
      // Correct answer reduces wrong penalty
      difficult[charId] = {
        wrongCount: Math.max(0, difficult[charId].wrongCount - 1),
        totalCount: difficult[charId].totalCount + 1,
      };
      if (difficult[charId].wrongCount === 0) {
        delete difficult[charId];
      }
    }

    const streakUpdate = calculateStreakUpdate(progress);

    const newProgress: UserProgress = {
      ...progress,
      ...streakUpdate,
      totalQuizCount: (progress.totalQuizCount || 0) + 1,
      correctQuizCount: (progress.correctQuizCount || 0) + (isCorrect ? 1 : 0),
      score: (progress.score || 0) + points,
      difficultCharacters: difficult,
    };

    handleSaveProgress(newProgress);
  };

  // Handle Full-Screen Lesson Finish
  const handleFinishLesson = (rewardXp: number, newLearnedIds: string[], newDifficultIds: string[]) => {
    const currentLearned = new Set(progress.learnedCharacters || []);
    newLearnedIds.forEach(id => currentLearned.add(id));
    const updatedLearned = Array.from(currentLearned);

    const totalKo = KOREAN_MORSE.length;
    const totalEn = ENGLISH_MORSE.length;
    const learnedKo = KOREAN_MORSE.filter(c => currentLearned.has(c.id)).length;
    const learnedEn = ENGLISH_MORSE.filter(c => currentLearned.has(c.id)).length;

    const completed = new Set(progress.completedLessons || []);
    if (activeLesson?.id) {
      completed.add(activeLesson.id);
    }

    const difficult = { ...progress.difficultCharacters };
    newDifficultIds.forEach(id => {
      const existing = difficult[id] || { wrongCount: 0, totalCount: 0 };
      difficult[id] = { wrongCount: existing.wrongCount + 1, totalCount: existing.totalCount + 1 };
    });

    const streakUpdate = calculateStreakUpdate(progress);

    const updatedProgress: UserProgress = {
      ...progress,
      ...streakUpdate,
      score: (progress.score || 0) + rewardXp,
      learnedCharacters: updatedLearned,
      koreanProgress: Math.min(100, Math.round((learnedKo / totalKo) * 100)),
      englishProgress: Math.min(100, Math.round((learnedEn / totalEn) * 100)),
      completedLessons: Array.from(completed),
      difficultCharacters: difficult,
    };

    handleSaveProgress(updatedProgress);
    setActiveLesson(null);
  };

  // Start Review Session
  const handleStartReview = () => {
    const targets = Object.keys(progress.difficultCharacters || {});
    setQuizFilterTargets(targets);
    setActiveTab('quiz');
  };

  // Reset Data
  const handleResetData = () => {
    handleSaveProgress(DEFAULT_PROGRESS);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        user={currentUser}
        progress={progress}
        settings={settings}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        onToggleTheme={() => handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-12">
        {activeTab === 'home' && (
          <HomeView
            user={currentUser}
            progress={progress}
            onChangeTab={setActiveTab}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onStartReview={handleStartReview}
            onStartLesson={(lesson) => setActiveLesson(lesson)}
          />
        )}

        {activeTab === 'learn' && (
          <LearnView
            learnedSet={new Set(progress.learnedCharacters || [])}
            onToggleLearned={handleToggleLearned}
            settings={settings}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            settings={settings}
            progress={progress}
            onRecordQuizResult={handleRecordQuizResult}
            onUpdateSettings={handleUpdateSettings}
            initialTargetIds={quizFilterTargets}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            user={currentUser}
            progress={progress}
            onStartReview={handleStartReview}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={currentUser}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onChangeTab={(tab) => {
          if (tab !== 'quiz') setQuizFilterTargets(undefined);
          setActiveTab(tab);
        }}
      />

      {/* Full Screen Interactive Lesson Overlay */}
      {activeLesson && (
        <FullScreenLessonView
          lesson={activeLesson}
          progress={progress}
          settings={settings}
          onClose={() => setActiveLesson(null)}
          onFinishLesson={handleFinishLesson}
        />
      )}

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        progress={progress}
      />
    </div>
  );
}

