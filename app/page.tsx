'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const SECURITY_QUESTIONS = [
  'En sevdiğiniz yemek nedir?',
  'En sevdiğiniz spor dalı nedir?',
  'Ortaokulunuzun adı nedir?',
  'En sevdiğiniz çocukluk arkadaşınızın adı nedir?',
  'İlk evcil hayvanınızın adı nedir?'
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Modals & Reset Pass State
  const [modalType, setModalType] = useState<'NONE' | 'FORGOT' | 'CHANGE' | 'NEW_PASS' | 'FAILED_3_TIMES'>('NONE');
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Form Inputs for Verification
  const [verifyUsername, setVerifyUsername] = useState('');
  const [verifyBirthDate, setVerifyBirthDate] = useState('');
  const [verifyPhone, setVerifyPhone] = useState('');
  const [verifySecurityQuestion, setVerifySecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [verifySecurityAnswer, setVerifySecurityAnswer] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // New Password Inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [targetUserObj, setTargetUserObj] = useState<any>(null);

  // Support Request Details
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const adminExists = storedUsers.some((u: any) => u.username?.toLowerCase() === 'admin');
    let combinedUsers = storedUsers;
    if (!adminExists) {
      combinedUsers = [
        { 
          id: 1, 
          username: 'ADMIN', 
          surname: 'YÖNETİCİ', 
          birthDate: '1990-01-01', 
          phone: '05555555555',
          securityQuestion: SECURITY_QUESTIONS[0],
          securityAnswer: 'LAHMACUN',
          password: 'admin1233', 
          role: 'YÖNETİCİ' 
        },
        ...storedUsers
      ];
      localStorage.setItem('app_users', JSON.stringify(combinedUsers));
    }
    setAllUsers(combinedUsers);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSkipAndRedirect = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowSuccessToast(false);
    router.push('/dashboard');
  };

  const resetModalFields = () => {
    setVerifyUsername('');
    setVerifyBirthDate('');
    setVerifyPhone('');
    setVerifySecurityQuestion(SECURITY_QUESTIONS[0]);
    setVerifySecurityAnswer('');
    setNewPassword('');
    setConfirmPassword('');
    setModalError('');
    setModalSuccess('');
    setTargetUserObj(null);
    setSupportSentSuccess(false);
  };

  const closeModal = () => {
    setModalType('NONE');
    resetModalFields();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const cleanInputUsername = username.trim().toLocaleUpperCase('tr-TR');

    let foundUser = null;
    if ((cleanInputUsername === 'ADMIN' || cleanInputUsername === 'ADMİN') && password === 'admin1233') {
      foundUser = { username: 'ADMIN', fullName: 'YÖNETİCİ ADMİN', role: 'YÖNETİCİ' };
    } else {
      foundUser = storedUsers.find(
        (u: any) => u.username?.toLocaleUpperCase('tr-TR') === cleanInputUsername && u.password === password
      );
    }

    if (foundUser) {
      setError('');
      setFailedAttempts(0);
      const isUserAdmin = foundUser.role === 'YÖNETİCİ' || foundUser.username === 'ADMIN' || foundUser.username === 'admin';
      
      setLoggedInUser(foundUser.fullName || foundUser.username);
      setIsAdminUser(isUserAdmin);
      setShowSuccessToast(true);
      setLoadingProgress(0);
      localStorage.setItem('user', JSON.stringify(foundUser));

      if (isUserAdmin) {
        const totalDuration = 60000;
        const updateInterval = 500;
        let elapsed = 0;
        setRemainingSeconds(60);

        intervalRef.current = setInterval(() => {
          elapsed += updateInterval;
          const currentProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
          const leftSecs = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
          setLoadingProgress(currentProgress);
          setRemainingSeconds(leftSecs);
          if (elapsed >= totalDuration) {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }, updateInterval);

        timerRef.current = setTimeout(() => {
          setShowSuccessToast(false);
          router.push('/dashboard');
        }, totalDuration);

      } else {
        const totalDuration = 1800;
        let elapsed = 0;
        intervalRef.current = setInterval(() => {
          elapsed += 200;
          setLoadingProgress(Math.min(100, Math.round((elapsed / totalDuration) * 100)));
        }, 200);

        timerRef.current = setTimeout(() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setShowSuccessToast(false);
          router.push('/dashboard');
        }, totalDuration);
      }

    } else {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const handleVerifyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const cleanU = verifyUsername.trim().toLocaleUpperCase('tr-TR');
    const cleanAns = verifySecurityAnswer.trim().toLocaleUpperCase('tr-TR');

    const matchedUser = storedUsers.find((u: any) => {
      const uNameMatch = u.username?.toLocaleUpperCase('tr-TR') === cleanU;
      const birthMatch = u.birthDate ? u.birthDate === verifyBirthDate : true;
      const phoneMatch = u.phone ? u.phone.trim() === verifyPhone.trim() : true;
      const qMatch = u.securityQuestion ? u.securityQuestion === verifySecurityQuestion : true;
      const ansMatch = u.securityAnswer ? u.securityAnswer.trim().toLocaleUpperCase('tr-TR') === cleanAns : true;
      return uNameMatch && birthMatch && phoneMatch && qMatch && ansMatch;
    });

    if (matchedUser) {
      setTargetUserObj(matchedUser);
      setModalType('NEW_PASS');
      setModalError('');
      setFailedAttempts(0);
    } else {
      const newFailCount = failedAttempts + 1;
      setFailedAttempts(newFailCount);

      if (newFailCount >= 3) {
        setModalType('FAILED_3_TIMES');
      } else {
        setModalError(`Girdiğiniz bilgiler eşleşmiyor! (Kalan Hak: ${3 - newFailCount})`);
      }
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setModalError('Şifre en az 4 karakter olmalıdır!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Şifreler birbiriyle uyuşmuyor!');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => {
      if (u.id === targetUserObj.id || u.username === targetUserObj.username) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    setModalSuccess('Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.');
    
    setTimeout(() => {
      closeModal();
    }, 2000);
  };

  const handleSendSupportRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const existingRequests = JSON.parse(localStorage.getItem('app_support_requests') || '[]');
    const newReq = {
      id: Date.now(),
      username: verifyUsername.trim().toLocaleUpperCase('tr-TR') || username.trim().toLocaleUpperCase('tr-TR') || 'BELİRTİLMEDİ',
      birthDate: verifyBirthDate || 'BELİRTİLMEDİ',
      phone: verifyPhone || 'BELİRTİLMEDİ',
      date: new Date().toLocaleString('tr-TR'),
      status: 'BEKLEMEDE'
    };

    localStorage.setItem('app_support_requests', JSON.stringify([newReq, ...existingRequests]));
    setSupportSentSuccess(true);

    setTimeout(() => {
      closeModal();
      setFailedAttempts(0);
    }, 2500);
  };

  const filteredUsers = username.trim().length > 0 
    ? allUsers.filter((u: any) =>
        u.username?.toLocaleUpperCase('tr-TR').includes(username.toLocaleUpperCase('tr-TR')) ||
        (u.surname && u.surname.toLocaleUpperCase('tr-TR').includes(username.toLocaleUpperCase('tr-TR')))
      )
    : [];

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 px-4 relative overflow-hidden ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Frameless Floating Interactive Loader Overlay */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl transition-all duration-500 p-4 animate-fadeIn">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm w-full relative z-10 animate-scaleUp">
            
            <div className="relative w-24 h-24 flex items-center justify-center my-2">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin shadow-[0_0_25px_#10b981]"></div>
              <div className="absolute inset-2 rounded-full border-4 border-teal-500/10 border-b-teal-300 animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_20px_#14b8a6]"></div>
              <div className="w-6 h-6 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_30px_#10b981]"></div>
            </div>

            <div className="space-y-2 w-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#10b981]"></span>
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  {isAdminUser ? 'ADMİN GİRİŞİ BAŞARILI' : 'GİRİŞ BAŞARILI'}
                </span>
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                HOŞ GELDİNİZ
              </h2>

              <p className="text-base font-black text-emerald-400 uppercase tracking-wide">
                {loggedInUser.toLocaleUpperCase('tr-TR')}
              </p>
            </div>

            <div className="w-full space-y-2.5 max-w-xs">
              <div className="flex justify-between items-center text-xs font-mono font-black text-slate-300">
                <span>{isAdminUser ? `KALAN SÜRE: ${remainingSeconds}s` : 'SİSTEM YÜKLENİYOR...'}</span>
                <span className="text-emerald-400 text-sm">{loadingProgress}%</span>
              </div>
              
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div 
                  style={{ width: `${loadingProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_#10b981]"
                ></div>
              </div>
            </div>

            {isAdminUser && (
              <button
                onClick={handleSkipAndRedirect}
                className="mt-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center gap-3 hover:scale-105 active:scale-95"
              >
                <span>HIZLI GEÇİŞ YAP</span>
                <span className="text-lg animate-bounce">⚡</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 px-4 py-2.5 rounded-xl border-2 text-sm font-black transition-all cursor-pointer ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-400 hover:border-amber-400' : 'bg-white border-slate-300 text-slate-700 shadow-md hover:border-amber-500'
        }`}
      >
        {isDarkMode ? '☀️ GÜNDÜZ MODU' : '🌙 GECE MODU'}
      </button>

      {/* Main Login Card */}
      <div className={`max-w-md w-full border-2 rounded-2xl p-8 shadow-2xl transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-3 border-emerald-500/20 border-t-emerald-400 animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            <div className="absolute inset-2 rounded-full border-3 border-teal-500/20 border-b-teal-300 animate-[spin_1.5s_linear_infinite_reverse]"></div>
            <div className="w-5 h-5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_20px_#10b981]"></div>
          </div>

          <h2 className="text-2xl font-black uppercase tracking-wide">DOKTOR TAKİP SİSTEMİ</h2>
          <p className={`text-sm font-bold mt-1 uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>LÜTFEN GİRİŞ YAPIN</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm rounded-xl text-center font-black">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative" ref={dropdownRef}>
            <label className={`block text-sm font-black mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              value={username}
              onFocus={() => setShowUserDropdown(true)}
              onChange={(e) => {
                setUsername(e.target.value.toLocaleUpperCase('tr-TR'));
                setShowUserDropdown(true);
              }}
              className={`w-full px-4 py-3 rounded-xl border-2 font-black uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              placeholder="Kullanıcı Adı"
              autoComplete="off"
            />

            {showUserDropdown && filteredUsers.length > 0 && (
              <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border-2 shadow-2xl z-40 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {filteredUsers.map((u: any) => (
                  <div
                    key={u.id || u.username}
                    onClick={() => {
                      setUsername(u.username.toLocaleUpperCase('tr-TR'));
                      setShowUserDropdown(false);
                    }}
                    className={`flex justify-between items-center p-3 cursor-pointer transition-colors text-sm font-black border-b last:border-b-0 ${
                      isDarkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-emerald-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 font-black flex items-center justify-center text-xs">
                        {u.username.charAt(0).toLocaleUpperCase('tr-TR')}
                      </div>
                      <span>{u.username.toLocaleUpperCase('tr-TR')} {u.surname?.toLocaleUpperCase('tr-TR') || ''}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">@{u.username.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-black mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all pr-12 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
                placeholder="••••••••"
              />
              {/* Transparent SVG Eye Icon Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? (
                  // Open Eye SVG
                  <svg className="w-5 h-5 opacity-80 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Eye-Off Slash SVG
                  <svg className="w-5 h-5 opacity-80 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 013.98-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.182-1.928a3 3 0 01-4.243-4.243" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-base transition-all shadow-lg cursor-pointer"
          >
            GİRİŞ YAP
          </button>
        </form>

        {/* Footer Links: Forgot & Change Password */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 flex justify-between items-center text-xs font-black">
          <button
            onClick={() => {
              resetModalFields();
              setModalType('FORGOT');
            }}
            className="text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
          >
            🔑 ŞİFREMİ UNUTTUM
          </button>
          
          <button
            onClick={() => {
              resetModalFields();
              setModalType('CHANGE');
            }}
            className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            🔄 ŞİFREMİ DEĞİŞTİR
          </button>
        </div>
      </div>

      {/* Advanced Verification Modal with Security Question */}
      {(modalType === 'FORGOT' || modalType === 'CHANGE') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border-2 p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <h3 className="text-base font-black text-amber-500 uppercase tracking-wide">
                {modalType === 'FORGOT' ? '🔑 ŞİFREMİ UNUTTUM' : '🔄 ŞİFRE DEĞİŞTİRME'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 font-black text-xl cursor-pointer">✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl font-black text-center">
                {modalError}
              </div>
            )}

            <form onSubmit={handleVerifyAccount} className="space-y-4 font-black">
              <div>
                <label className="block text-xs mb-1 text-slate-400">KULLANICI ADI</label>
                <input
                  type="text"
                  required
                  value={verifyUsername}
                  onChange={(e) => setVerifyUsername(e.target.value.toLocaleUpperCase('tr-TR'))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black uppercase text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                  placeholder="Kullanıcı adınız"
                />
              </div>

              <div>
                <label className="block text-xs mb-1 text-slate-400">DOĞUM TARİHİ</label>
                <input
                  type="date"
                  required
                  value={verifyBirthDate}
                  onChange={(e) => setVerifyBirthDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs mb-1 text-slate-400">TELEFON NUMARASI</label>
                <input
                  type="text"
                  required
                  value={verifyPhone}
                  onChange={(e) => setVerifyPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-mono text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                  placeholder="05XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-xs mb-1 text-amber-400">GÜVENLİK SORUSU</label>
                <select
                  value={verifySecurityQuestion}
                  onChange={(e) => setVerifySecurityQuestion(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {SECURITY_QUESTIONS.map((q, idx) => (
                    <option key={idx} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1 text-amber-400">GÜVENLİK SORUSU CEVABI</label>
                <input
                  type="text"
                  required
                  value={verifySecurityAnswer}
                  onChange={(e) => setVerifySecurityAnswer(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black uppercase text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                  placeholder="Cevabınız"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                KİMLİĞİ DOĞRULA VEYA İLERLE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Password Modal with Transparent Eye Icon */}
      {modalType === 'NEW_PASS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border-2 p-7 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <h3 className="text-base font-black text-emerald-400 uppercase tracking-wide">
                ✨ YENİ ŞİFRE BELİRLEME
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 font-black text-xl cursor-pointer">✕</button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl font-black text-center">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs rounded-xl font-black text-center">
                {modalSuccess}
              </div>
            )}

            {!modalSuccess && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4 font-black">
                <div>
                  <label className="block text-xs mb-1 text-slate-400">YENİ ŞİFRE</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs outline-none pr-10 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? (
                        <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.02 10.02 0 013.98-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.182-1.928a3 3 0 01-4.243-4.243" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-400">YENİ ŞİFRE (TEKRAR)</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                >
                  YENİ ŞİFREYİ KAYDET
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Failed Attempts Support Request Modal */}
      {modalType === 'FAILED_3_TIMES' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl border-2 border-rose-500/60 p-7 shadow-2xl space-y-5 text-center ${
            isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
          }`}>
            <div className="text-4xl animate-bounce">🚨</div>
            <h3 className="text-lg font-black text-rose-500 uppercase">3 HATALI DENEME!</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">
              Girdiğiniz bilgiler 3 kez üst üste doğrulanamadı. Şifre sıfırlama talebinizi doğrudan Adminde yer alan destek paneline iletebilirsiniz.
            </p>

            {supportSentSuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black rounded-2xl">
                Talebiniz Yöneticiye (Admin) Başarıyla İletildi! En kısa sürede incelenecektir.
              </div>
            ) : (
              <form onSubmit={handleSendSupportRequest} className="space-y-4 font-black text-left">
                <div>
                  <label className="block text-xs mb-1 text-slate-400">KULLANICI ADI</label>
                  <input
                    type="text"
                    required
                    value={verifyUsername || username}
                    onChange={(e) => setVerifyUsername(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black uppercase text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-400">DOĞUM TARİHİ</label>
                  <input
                    type="date"
                    required
                    value={verifyBirthDate}
                    onChange={(e) => setVerifyBirthDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 font-black rounded-xl text-xs cursor-pointer"
                  >
                    İPTAL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                  >
                    ADMİNE TALEP GÖNDER 🚀
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}