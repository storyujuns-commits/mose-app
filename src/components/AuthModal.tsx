import React, { useState, useEffect } from 'react';
import { 
  X, LogIn, UserPlus, Mail, Lock, User, Cloud, CheckCircle2, AlertCircle, 
  KeyRound, ShieldCheck, Check, Sparkles, RefreshCw, Trash2, Edit3, Image, ChevronRight, LogOut
} from 'lucide-react';
import { 
  loginWithGoogle, 
  loginWithIdOrEmail, 
  signupWithCustomAccount, 
  logoutUser, 
  checkUsernameAvailable, 
  checkNicknameAvailable, 
  checkEmailAvailable,
  requestPasswordReset,
  changeUserPassword,
  changeUserNickname,
  changeUserEmail,
  updateUserProfileImage,
  deleteUserAccountPermanently
} from '../lib/firebase';
import { UserProfile, UserProgress } from '../types';
import { getRankInfo } from '../lib/rankAndStreak';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  progress?: UserProgress;
}

// Preset Avatars for custom accounts
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser, progress }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'manage'>('login');

  // Login Form States
  const [loginIdOrEmail, setLoginIdOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRememberMe, setLoginRememberMe] = useState(true);

  // Signup Form States
  const [signupUsername, setSignupUsername] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupRememberMe, setSignupRememberMe] = useState(true);

  // Duplication Check States
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; msg: string }>({ checked: false, available: false, msg: '' });
  const [nicknameStatus, setNicknameStatus] = useState<{ checked: boolean; available: boolean; msg: string }>({ checked: false, available: false, msg: '' });
  const [emailStatus, setEmailStatus] = useState<{ checked: boolean; available: boolean; msg: string }>({ checked: false, available: false, msg: '' });

  // Forgot Password States
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  // Manage Sub-Modals / Views
  const [activeManageTab, setActiveManageTab] = useState<'overview' | 'nickname' | 'password' | 'email' | 'avatar' | 'delete'>('overview');
  const [editNickname, setEditNickname] = useState('');
  const [editCurrentPass, setEditCurrentPass] = useState('');
  const [editNewPass, setEditNewPass] = useState('');
  const [editNewPassConfirm, setEditNewPassConfirm] = useState('');
  const [editNewEmail, setEditNewEmail] = useState('');
  const [deletePassConfirm, setDeletePassConfirm] = useState('');

  // General Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      if (currentUser) {
        setMode('manage');
        setActiveManageTab('overview');
        setEditNickname(currentUser.nickname || '');
        setEditNewEmail(currentUser.email || '');
      } else {
        setMode('login');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Password Security Checks
  const hasMinLength = signupPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(signupPassword);
  const hasNumber = /[0-9]/.test(signupPassword);
  const isPasswordSecure = hasMinLength && hasLetter && hasNumber;
  const isPasswordMatched = signupPassword.length > 0 && signupPassword === signupPasswordConfirm;

  // Real-time Username Check
  const handleCheckUsername = async () => {
    const clean = signupUsername.trim();
    if (clean.length < 3) {
      setUsernameStatus({ checked: true, available: false, msg: '아이디는 최소 3자 이상이어야 합니다.' });
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
      setUsernameStatus({ checked: true, available: false, msg: '영문, 숫자, 언더바(_), 하이픈(-)만 사용 가능합니다.' });
      return;
    }
    setLoading(true);
    const free = await checkUsernameAvailable(clean);
    setLoading(false);
    if (free) {
      setUsernameStatus({ checked: true, available: true, msg: '사용 가능한 아이디입니다.' });
    } else {
      setUsernameStatus({ checked: true, available: false, msg: '이미 사용 중인 아이디입니다.' });
    }
  };

  // Real-time Nickname Check
  const handleCheckNickname = async () => {
    const clean = signupNickname.trim();
    if (clean.length < 2) {
      setNicknameStatus({ checked: true, available: false, msg: '닉네임은 2자 이상 입력해주세요.' });
      return;
    }
    setLoading(true);
    const free = await checkNicknameAvailable(clean);
    setLoading(false);
    if (free) {
      setNicknameStatus({ checked: true, available: true, msg: '사용 가능한 닉네임입니다.' });
    } else {
      setNicknameStatus({ checked: true, available: false, msg: '이미 사용 중인 닉네임입니다.' });
    }
  };

  // Real-time Email Check
  const handleCheckEmail = async () => {
    const clean = signupEmail.trim();
    if (!clean || !clean.includes('@')) {
      setEmailStatus({ checked: true, available: false, msg: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }
    setLoading(true);
    const free = await checkEmailAvailable(clean);
    setLoading(false);
    if (free) {
      setEmailStatus({ checked: true, available: true, msg: '사용 가능한 이메일입니다.' });
    } else {
      setEmailStatus({ checked: true, available: false, msg: '이미 가입된 이메일입니다.' });
    }
  };

  // Custom Account Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signupUsername || !signupNickname || !signupEmail || !signupPassword) {
      setErrorMsg('모든 필수 입력 항목을 채워주세요.');
      return;
    }
    if (!isPasswordSecure) {
      setErrorMsg('비밀번호가 안전 조건(8자 이상, 영문, 숫자 포함)을 충족하지 않습니다.');
      return;
    }
    if (!isPasswordMatched) {
      setErrorMsg('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      await signupWithCustomAccount({
        username: signupUsername,
        nickname: signupNickname,
        email: signupEmail,
        password: signupPassword,
        rememberMe: signupRememberMe,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Custom ID or Email Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginIdOrEmail || !loginPassword) {
      setErrorMsg('아이디(이메일)와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await loginWithIdOrEmail(loginIdOrEmail, loginPassword, loginRememberMe);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setForgotSuccessMsg('');
    if (!forgotInput) {
      setErrorMsg('아이디 또는 이메일을 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      const emailSentTo = await requestPasswordReset(forgotInput);
      setForgotSuccessMsg(`${emailSentTo} 주소로 비밀번호 재설정 메일이 전송되었습니다.`);
    } catch (err: any) {
      setErrorMsg(err.message || '비밀번호 재설정 이메일 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      onClose();
    } catch (err: any) {
      setErrorMsg('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Account Update Handlers
  const handleUpdateNickname = async () => {
    if (!currentUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      await changeUserNickname(currentUser.uid, editNickname, currentUser.nickname);
      setSuccessMsg('닉네임이 성공적으로 변경되었습니다.');
      setTimeout(() => setActiveManageTab('overview'), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || '닉네임 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (editNewPass !== editNewPassConfirm) {
      setErrorMsg('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (editNewPass.length < 8 || !/[a-zA-Z]/.test(editNewPass) || !/[0-9]/.test(editNewPass)) {
      setErrorMsg('새 비밀번호는 8자 이상, 영문 및 숫자를 포함해야 합니다.');
      return;
    }
    try {
      setLoading(true);
      await changeUserPassword(editCurrentPass, editNewPass);
      setSuccessMsg('비밀번호가 안전하게 변경되었습니다.');
      setEditCurrentPass('');
      setEditNewPass('');
      setEditNewPassConfirm('');
      setTimeout(() => setActiveManageTab('overview'), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || '비밀번호 변경 실패 (현재 비밀번호를 확인해주세요).');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!currentUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      await changeUserEmail(currentUser.uid, editNewEmail, editCurrentPass, currentUser.username);
      setSuccessMsg('이메일 주소가 변경되었습니다.');
      setTimeout(() => setActiveManageTab('overview'), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || '이메일 변경 실패 (현재 비밀번호를 확인해주세요).');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatar = async (imgUrl: string) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      await updateUserProfileImage(currentUser.uid, imgUrl);
      setSuccessMsg('프로필 이미지가 변경되었습니다.');
      setTimeout(() => setActiveManageTab('overview'), 1000);
    } catch (err: any) {
      setErrorMsg('프로필 이미지 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setErrorMsg('');
    try {
      setLoading(true);
      await deleteUserAccountPermanently(currentUser.uid, deletePassConfirm, currentUser.username, currentUser.nickname);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '계정 삭제 실패 (비밀번호를 확인해주세요).');
    } finally {
      setLoading(false);
    }
  };

  const rankInfo = progress ? getRankInfo(progress.score || 0) : null;
  const joinDate = currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('ko-KR') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl relative text-slate-100 my-8 max-h-[90vh] flex flex-col">
        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {currentUser ? '회원 프로필 & 계정 관리' : mode === 'signup' ? '자체 회원가입' : mode === 'forgot-password' ? '비밀번호 찾기' : '로그인'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser ? '학습 데이터가 계정과 동기화됩니다' : '모스부호 마스터 통합 계정'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Alert Messages */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto py-4 flex-1 space-y-4">
          {/* ======================================= */}
          {/* LOGGED IN USER: ACCOUNT MANAGEMENT MODE */}
          {/* ======================================= */}
          {currentUser ? (
            <div>
              {activeManageTab === 'overview' && (
                <div className="space-y-4">
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-slate-800/90 to-blue-950/40 border border-slate-700/60 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border-2 border-blue-500/40 text-blue-300 font-extrabold flex items-center justify-center overflow-hidden shadow-md">
                          {currentUser.profileImage ? (
                            <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{currentUser.nickname.slice(0, 1)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setActiveManageTab('avatar')}
                          className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-slate-700 rounded-lg text-blue-400 hover:text-white"
                          title="프로필 이미지 변경"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-extrabold text-white truncate">{currentUser.nickname}</h4>
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                            {currentUser.authProvider === 'custom' ? '자체 계정' : currentUser.authProvider === 'google' ? 'Google' : '이메일'}
                          </span>
                        </div>
                        {currentUser.username && (
                          <p className="text-xs font-mono text-blue-400">@{currentUser.username}</p>
                        )}
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">가입일: {joinDate || '최근'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning Stats Grid */}
                  {rankInfo && progress && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">계급</span>
                        <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                          <span>{rankInfo.badge}</span>
                          <span>{rankInfo.title}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">XP</span>
                        <span className="text-xs font-black text-white">{progress.score || 0} XP</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">연속 학습</span>
                        <span className="text-xs font-black text-amber-400">{progress.streak || 1}일</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">완료 레슨</span>
                        <span className="text-xs font-black text-emerald-400">{(progress.completedLessons || []).length}개</span>
                      </div>
                    </div>
                  )}

                  {/* Manage Menu Buttons */}
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-2 space-y-1">
                    <button
                      onClick={() => setActiveManageTab('nickname')}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>닉네임 변경</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      onClick={() => setActiveManageTab('avatar')}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-purple-400" />
                        <span>프로필 아바타 / 이미지 변경</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    {currentUser.authProvider === 'custom' && (
                      <>
                        <button
                          onClick={() => setActiveManageTab('password')}
                          className="w-full p-2.5 rounded-xl hover:bg-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span>비밀번호 변경</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>

                        <button
                          onClick={() => setActiveManageTab('email')}
                          className="w-full p-2.5 rounded-xl hover:bg-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <span>이메일 주소 변경</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Actions: Logout & Delete Account */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>로그아웃</span>
                    </button>

                    <button
                      onClick={() => setActiveManageTab('delete')}
                      className="text-[11px] text-red-400 hover:text-red-300 hover:underline font-semibold text-center mt-1"
                    >
                      계정 영구 삭제 (회원 탈퇴)
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Edit Nickname */}
              {activeManageTab === 'nickname' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-white">닉네임 변경</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">새 닉네임</label>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveManageTab('overview')}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleUpdateNickname}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      저장하기
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Edit Avatar */}
              {activeManageTab === 'avatar' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-white">프로필 아바타 선택</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectAvatar(url)}
                        className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-blue-500 transition-all active:scale-95"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveManageTab('overview')}
                    className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs mt-2"
                  >
                    돌아가기
                  </button>
                </div>
              )}

              {/* Sub-view: Edit Password */}
              {activeManageTab === 'password' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-white">비밀번호 변경</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">현재 비밀번호</label>
                    <input
                      type="password"
                      value={editCurrentPass}
                      onChange={(e) => setEditCurrentPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">새 비밀번호 (8자 이상, 영문+숫자)</label>
                    <input
                      type="password"
                      value={editNewPass}
                      onChange={(e) => setEditNewPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">새 비밀번호 확인</label>
                    <input
                      type="password"
                      value={editNewPassConfirm}
                      onChange={(e) => setEditNewPassConfirm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveManageTab('overview')}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    >
                      비밀번호 변경
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Edit Email */}
              {activeManageTab === 'email' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-white">이메일 변경</h4>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">새 이메일 주소</label>
                    <input
                      type="email"
                      value={editNewEmail}
                      onChange={(e) => setEditNewEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">본인 확인 비밀번호</label>
                    <input
                      type="password"
                      value={editCurrentPass}
                      onChange={(e) => setEditCurrentPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveManageTab('overview')}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleUpdateEmail}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      이메일 변경
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Delete Account */}
              {activeManageTab === 'delete' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-red-400">계정 영구 삭제 (회원 탈퇴)</h4>
                  <p className="text-[11px] text-red-300 leading-relaxed">
                    주의: 계정을 삭제하면 학습 진도, 누적 XP, 연속 학습 일수, 저장된 아이디 데이터가 완전히 삭제되며 복구할 수 없습니다.
                  </p>
                  {currentUser.authProvider === 'custom' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">확인 비밀번호</label>
                      <input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={deletePassConfirm}
                        onChange={(e) => setDeletePassConfirm(e.target.value)}
                        className="w-full bg-slate-950 border border-red-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveManageTab('overview')}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                    >
                      탈퇴 확인
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ======================================= */
            /* UNAUTHENTICATED: LOGIN / SIGNUP / FORGOT */
            /* ======================================= */
            <div>
              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(''); }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  자체 회원가입
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setErrorMsg(''); }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'forgot-password' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* MODE 1: LOGIN */}
              {mode === 'login' && (
                <div className="space-y-4">
                  {/* Google Login Quick Button */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google 계정으로 로그인</span>
                  </button>

                  <div className="flex items-center">
                    <div className="flex-1 border-t border-slate-800" />
                    <span className="px-3 text-[11px] text-slate-500 font-medium">또는 자체 계정 로그인</span>
                    <div className="flex-1 border-t border-slate-800" />
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">아이디 또는 이메일</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="아이디 또는 이메일 주소"
                          value={loginIdOrEmail}
                          onChange={(e) => setLoginIdOrEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold text-slate-400">비밀번호</label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot-password')}
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          비밀번호를 잊으셨나요?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="password"
                          placeholder="비밀번호"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Remember Me Option */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="rememberMeLogin"
                        checked={loginRememberMe}
                        onChange={(e) => setLoginRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                      />
                      <label htmlFor="rememberMeLogin" className="text-xs text-slate-300 font-semibold cursor-pointer">
                        자동 로그인 (로그인 상태 유지)
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 active:scale-95 mt-2"
                    >
                      {loading ? '로그인 처리 중...' : '로그인'}
                    </button>
                  </form>
                </div>
              )}

              {/* MODE 2: SIGNUP */}
              {mode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  {/* Username (ID) Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-400">아이디 (ID)</label>
                      <button
                        type="button"
                        onClick={handleCheckUsername}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-2 py-0.5 rounded-lg font-bold"
                      >
                        중복 확인
                      </button>
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="영문, 숫자 (3~20자)"
                        value={signupUsername}
                        onChange={(e) => {
                          setSignupUsername(e.target.value);
                          setUsernameStatus({ checked: false, available: false, msg: '' });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {usernameStatus.checked && (
                      <p className={`text-[10px] mt-1 font-semibold ${usernameStatus.available ? 'text-emerald-400' : 'text-red-400'}`}>
                        {usernameStatus.msg}
                      </p>
                    )}
                  </div>

                  {/* Nickname Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-400">닉네임</label>
                      <button
                        type="button"
                        onClick={handleCheckNickname}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-2 py-0.5 rounded-lg font-bold"
                      >
                        중복 확인
                      </button>
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="2자 이상 닉네임"
                        value={signupNickname}
                        onChange={(e) => {
                          setSignupNickname(e.target.value);
                          setNicknameStatus({ checked: false, available: false, msg: '' });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {nicknameStatus.checked && (
                      <p className={`text-[10px] mt-1 font-semibold ${nicknameStatus.available ? 'text-emerald-400' : 'text-red-400'}`}>
                        {nicknameStatus.msg}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-400">이메일 주소</label>
                      <button
                        type="button"
                        onClick={handleCheckEmail}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-2 py-0.5 rounded-lg font-bold"
                      >
                        중복 확인
                      </button>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          setEmailStatus({ checked: false, available: false, msg: '' });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {emailStatus.checked && (
                      <p className={`text-[10px] mt-1 font-semibold ${emailStatus.available ? 'text-emerald-400' : 'text-red-400'}`}>
                        {emailStatus.msg}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 mb-1 block">비밀번호</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="비밀번호 설정"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Security Requirements Checklist */}
                    <div className="flex gap-2 text-[10px] mt-1 text-slate-400">
                      <span className={hasMinLength ? 'text-emerald-400 font-bold' : ''}>• 8자 이상</span>
                      <span className={hasLetter ? 'text-emerald-400 font-bold' : ''}>• 영문 포함</span>
                      <span className={hasNumber ? 'text-emerald-400 font-bold' : ''}>• 숫자 포함</span>
                    </div>
                  </div>

                  {/* Password Confirm Field */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 mb-1 block">비밀번호 확인</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="비밀번호 재입력"
                        value={signupPasswordConfirm}
                        onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {signupPasswordConfirm.length > 0 && (
                      <p className={`text-[10px] mt-1 font-semibold ${isPasswordMatched ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                      </p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMeSignup"
                      checked={signupRememberMe}
                      onChange={(e) => setSignupRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                    />
                    <label htmlFor="rememberMeSignup" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      자동 로그인 (회원가입 후 유지)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 active:scale-95 mt-2"
                  >
                    {loading ? '가입 처리 중...' : '회원가입 완료'}
                  </button>
                </form>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {mode === 'forgot-password' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                    <KeyRound className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>가입하신 아이디 또는 이메일 주소를 입력하시면 비밀번호 재설정 전용 링크를 전송해 드립니다.</span>
                  </div>

                  {forgotSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold">
                      {forgotSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">아이디 또는 이메일</label>
                      <input
                        type="text"
                        placeholder="아이디 또는 이메일 입력"
                        value={forgotInput}
                        onChange={(e) => setForgotInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      {loading ? '발송 중...' : '재설정 이메일 전송'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
