import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserProgress, UserSettings } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

// Google Auth Provider custom parameter
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Duplication Checks
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!username || username.trim().length < 3) return false;
  const usernameLower = username.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(db, 'usernames', usernameLower));
    return !snap.exists();
  } catch (err) {
    console.error('Error checking username availability:', err);
    return false;
  }
}

export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  if (!nickname || nickname.trim().length < 2) return false;
  const nicknameLower = nickname.trim().toLowerCase();
  try {
    const snap = await getDoc(doc(db, 'nicknames', nicknameLower));
    return !snap.exists();
  } catch (err) {
    console.error('Error checking nickname availability:', err);
    return false;
  }
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  if (!email || !email.includes('@')) return false;
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty;
  } catch (err) {
    console.error('Error checking email availability:', err);
    return true; // Fallback to Auth error on submit
  }
}

// Custom Signup with ID, Nickname, Email, Password
export async function signupWithCustomAccount({
  username,
  nickname,
  email,
  password,
  rememberMe = true,
}: {
  username: string;
  nickname: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanNickname = nickname.trim();
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check ID uniqueness
  const isUsernameFree = await checkUsernameAvailable(cleanUsername);
  if (!isUsernameFree) {
    throw new Error('이미 사용 중인 아이디입니다.');
  }

  // 2. Check Nickname uniqueness
  const isNicknameFree = await checkNicknameAvailable(cleanNickname);
  if (!isNicknameFree) {
    throw new Error('이미 사용 중인 닉네임입니다.');
  }

  // Set persistence according to rememberMe
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

  // 3. Create Firebase Auth user
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
      throw new Error('Firebase 콘솔에서 "이메일/비밀번호" 로그인 방식이 활성화되어 있지 않습니다. Firebase 콘솔 > Authentication > Sign-in method에서 이메일/비밀번호를 활성화해주세요.');
    }
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('이미 가입된 이메일 주소입니다.');
    }
    throw err;
  }
  const user = userCredential.user;

  // 4. Register mapping documents for fast lookup
  await setDoc(doc(db, 'usernames', cleanUsername), {
    username: cleanUsername,
    email: cleanEmail,
    uid: user.uid,
  });

  await setDoc(doc(db, 'nicknames', cleanNickname.toLowerCase()), {
    nickname: cleanNickname,
    uid: user.uid,
  });

  // 5. Initial sync user profile to Firestore
  const now = new Date().toISOString();
  const userRef = doc(db, 'users', user.uid);
  const newUserProfile: UserProfile = {
    uid: user.uid,
    username: cleanUsername,
    nickname: cleanNickname,
    email: cleanEmail,
    profileImage: '',
    createdAt: now,
    lastLogin: now,
    authProvider: 'custom',
  };
  await setDoc(userRef, newUserProfile);

  // 6. Initial progress & settings
  const initialProgress: UserProgress = {
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
  await setDoc(doc(db, 'progress', user.uid), initialProgress);

  const initialSettings: UserSettings = {
    soundEnabled: true,
    theme: 'dark',
    language: 'ko',
    soundSpeed: 'normal',
    soundPitch: 600,
  };
  await setDoc(doc(db, 'settings', user.uid), initialSettings);

  return user;
}

// Unified Login with ID or Email
export async function loginWithIdOrEmail(
  idOrEmail: string,
  pass: string,
  rememberMe: boolean = true
) {
  const cleanInput = idOrEmail.trim();

  // Set persistence
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

  let targetEmail = cleanInput;

  // If input doesn't look like an email, treat as Username / ID
  if (!cleanInput.includes('@')) {
    const usernameLower = cleanInput.toLowerCase();
    const snap = await getDoc(doc(db, 'usernames', usernameLower));
    if (!snap.exists()) {
      throw new Error('존재하지 않는 아이디입니다.');
    }
    targetEmail = snap.data().email;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, pass);
    const user = userCredential.user;
    await syncUserToFirestore(user);
    return user;
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      throw new Error('현재 도메인(storymorse.netlify.app)이 승인되지 않았습니다. Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 추가해주세요.');
    } else if (error.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
      throw new Error('Firebase 콘솔에서 "이메일/비밀번호" 로그인 방식이 활성화되어 있지 않습니다. Firebase 콘솔 > Authentication > Sign-in method에서 이메일/비밀번호를 활성화해주세요.');
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('비밀번호가 올바르지 않습니다.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('가입되지 않은 계정입니다.');
    }
    throw error;
  }
}

// Google Login
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserToFirestore(user, undefined, 'google');
    return user;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    if (error.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      throw new Error('현재 승인되지 않은 도메인에서 접속 중입니다. Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 "storymorse.netlify.app"을 추가해주세요.');
    } else if (error.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
      throw new Error('Firebase 콘솔에서 "Google" 로그인 방식이 활성화되어 있지 않습니다. Firebase 콘솔 > Authentication > Sign-in method에서 Google 로그인을 활성화해주세요.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('로그인 팝업창이 닫혔습니다.');
    }
    throw error;
  }
}

// Legacy direct email signup / login helpers
export async function signupWithEmail(email: string, pass: string, nickname: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await syncUserToFirestore(user, nickname, 'email');
  return user;
}

export async function loginWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await syncUserToFirestore(user);
  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

// Password Reset Email Helper
export async function requestPasswordReset(idOrEmail: string) {
  const cleanInput = idOrEmail.trim();
  let targetEmail = cleanInput;

  if (!cleanInput.includes('@')) {
    const snap = await getDoc(doc(db, 'usernames', cleanInput.toLowerCase()));
    if (!snap.exists()) {
      throw new Error('등록된 아이디를 찾을 수 없습니다.');
    }
    targetEmail = snap.data().email;
  }

  await sendPasswordResetEmail(auth, targetEmail);
  return targetEmail;
}

// Change User Password
export async function changeUserPassword(currentPass: string, newPass: string) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('로그인 정보가 존재하지 않습니다.');

  // Reauthenticate
  const cred = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, cred);

  // Update password
  await updatePassword(user, newPass);
}

// Change User Nickname
export async function changeUserNickname(uid: string, newNickname: string, oldNickname?: string) {
  const cleanNew = newNickname.trim();
  if (cleanNew.length < 2) throw new Error('닉네임은 2자 이상이어야 합니다.');

  if (oldNickname && oldNickname.toLowerCase() !== cleanNew.toLowerCase()) {
    const isFree = await checkNicknameAvailable(cleanNew);
    if (!isFree) throw new Error('이미 사용 중인 닉네임입니다.');

    // Delete old nickname mapping
    await deleteDoc(doc(db, 'nicknames', oldNickname.toLowerCase()));
  }

  // Set new mapping
  await setDoc(doc(db, 'nicknames', cleanNew.toLowerCase()), { nickname: cleanNew, uid });

  // Update profile
  await updateDoc(doc(db, 'users', uid), { nickname: cleanNew });
}

// Change User Email
export async function changeUserEmail(uid: string, newEmail: string, currentPass: string, username?: string) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('로그인 정보가 존재하지 않습니다.');

  const cleanNewEmail = newEmail.trim().toLowerCase();

  // Reauthenticate
  const cred = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, cred);

  // Update email in Auth
  await updateEmail(user, cleanNewEmail);

  // Update profile doc
  await updateDoc(doc(db, 'users', uid), { email: cleanNewEmail });

  // Update username mapping doc if exists
  if (username) {
    await updateDoc(doc(db, 'usernames', username.toLowerCase()), { email: cleanNewEmail });
  }
}

// Update Profile Image
export async function updateUserProfileImage(uid: string, imageUrl: string) {
  await updateDoc(doc(db, 'users', uid), { profileImage: imageUrl });
}

// Delete Account Permanently
export async function deleteUserAccountPermanently(uid: string, passwordForReauth?: string, username?: string, nickname?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인 정보가 존재하지 않습니다.');

  // Reauthenticate if password provided
  if (passwordForReauth && user.email) {
    const cred = EmailAuthProvider.credential(user.email, passwordForReauth);
    await reauthenticateWithCredential(user, cred);
  }

  // Clean up Firestore documents
  try { await deleteDoc(doc(db, 'users', uid)); } catch {}
  try { await deleteDoc(doc(db, 'progress', uid)); } catch {}
  try { await deleteDoc(doc(db, 'settings', uid)); } catch {}
  if (username) {
    try { await deleteDoc(doc(db, 'usernames', username.toLowerCase())); } catch {}
  }
  if (nickname) {
    try { await deleteDoc(doc(db, 'nicknames', nickname.toLowerCase())); } catch {}
  }

  // Delete Auth user
  await deleteUser(user);
}

// Initial Sync or Fetch User Document
export async function syncUserToFirestore(user: User, nicknameOverride?: string, authProvider?: 'custom' | 'google' | 'email') {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  const now = new Date().toISOString();

  if (!snap.exists()) {
    const newUserProfile: UserProfile = {
      uid: user.uid,
      nickname: nicknameOverride || user.displayName || user.email?.split('@')[0] || '학습자',
      email: user.email || '',
      profileImage: user.photoURL || '',
      createdAt: now,
      lastLogin: now,
      authProvider: authProvider || (user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'),
    };
    await setDoc(userRef, newUserProfile);

    // Initial default progress
    const initialProgress: UserProgress = {
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
    await setDoc(doc(db, 'progress', user.uid), initialProgress);

    // Initial default settings
    const initialSettings: UserSettings = {
      soundEnabled: true,
      theme: 'system',
      language: 'ko',
      soundSpeed: 'normal',
      soundPitch: 600,
    };
    await setDoc(doc(db, 'settings', user.uid), initialSettings);
  } else {
    await updateDoc(userRef, {
      lastLogin: now,
      profileImage: user.photoURL || snap.data()?.profileImage || '',
    });
  }
}

// Fetch Functions
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function fetchUserProgress(uid: string): Promise<UserProgress | null> {
  try {
    const snap = await getDoc(doc(db, 'progress', uid));
    return snap.exists() ? (snap.data() as UserProgress) : null;
  } catch (err) {
    console.error('Error fetching user progress:', err);
    return null;
  }
}

export async function fetchUserSettings(uid: string): Promise<UserSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'settings', uid));
    return snap.exists() ? (snap.data() as UserSettings) : null;
  } catch (err) {
    console.error('Error fetching user settings:', err);
    return null;
  }
}

// Save / Update Functions
export async function saveUserProgress(uid: string, progress: Partial<UserProgress>) {
  if (!uid) return;
  try {
    const ref = doc(db, 'progress', uid);
    await setDoc(ref, progress, { merge: true });
  } catch (err) {
    console.error('Error saving user progress:', err);
  }
}

export async function saveUserSettings(uid: string, settings: Partial<UserSettings>) {
  if (!uid) return;
  try {
    const ref = doc(db, 'settings', uid);
    await setDoc(ref, settings, { merge: true });
  } catch (err) {
    console.error('Error saving user settings:', err);
  }
}
