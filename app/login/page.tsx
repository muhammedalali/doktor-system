'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

// مكون تخطيط القلب العصري والمنتظم بدون أي مربع (Seamless Transparent Canvas)
function SeamlessECGCanvas({ isError = false }: { isError?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const speed = isError ? 4.0 : 2.5;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 60;
    };
    resize();
    window.addEventListener('resize', resize);

    const getECGPoint = (xPos: number, width: number, height: number) => {
      const midY = height / 2;
      const cycle = xPos % width;
      const progress = cycle / width;

      if (progress > 0.35 && progress < 0.38) return midY - 5;
      if (progress >= 0.38 && progress < 0.41) return midY + 3;
      if (progress >= 0.41 && progress < 0.44) return midY - 26;
      if (progress >= 0.44 && progress < 0.48) return midY + 18;
      if (progress >= 0.48 && progress < 0.51) return midY - 8;
      if (progress >= 0.51 && progress < 0.54) return midY + 2;
      return midY;
    };

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const primaryColor = isError ? '244, 63, 94' : '16, 185, 129';
      const glowColor = isError ? '#f43f5e' : '#10b981';

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${primaryColor}, 0.18)`;
      ctx.lineWidth = 1.8;
      for (let i = 0; i < width; i++) {
        const y = getECGPoint(i, width, height);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      const tailLength = 80;
      for (let i = 0; i < tailLength; i++) {
        const currentX = (x - i + width) % width;
        const currentY = getECGPoint(currentX, width, height);
        const alpha = Math.pow(1 - i / tailLength, 1.5);

        ctx.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = alpha * 10;
        ctx.lineWidth = 2.0;

        ctx.beginPath();
        const prevX = (currentX - 1 + width) % width;
        const prevY = getECGPoint(prevX, width, height);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      const headY = getECGPoint(x, width, height);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(x, headY, 3, 0, Math.PI * 2);
      ctx.fillStyle = isError ? '#ffe4e6' : '#a7f3d0';
      ctx.fill();

      x = (x + speed) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isError]);

  return <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedLockTime = localStorage.getItem('login_lock_until');
    if (storedLockTime) {
      const lockUntil = parseInt(storedLockTime, 10);
      const now = Date.now();
      if (lockUntil > now) {
        const remaining = Math.ceil((lockUntil - now) / 1000);
        setIsLocked(true);
        setLockTimer(remaining);
        startLockCountdown(remaining);
      } else {
        localStorage.removeItem('login_lock_until');
      }
    }

    // 🔄 الاستماع المباشر (Real-time Listener) من Firebase Firestore
    const unsubscribeFirestore = onSnapshot(collection(db, 'users'), (snapshot) => {
      const firestoreUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // دمج حساب ADMIN الافتراضي مع مستخدمي السيرفر
      const adminExists = firestoreUsers.some((u: any) => u.username?.toLowerCase() === 'admin');
      let combined = firestoreUsers;
      if (!adminExists) {
        combined = [
          { 
            id: 'admin-default', 
            username: 'ADMIN', 
            surname: 'YÖNETİCİ', 
            phone: '05555555555',
            password: 'admin1233', 
            role: 'YÖNETİCİ' 
          },
          ...firestoreUsers
        ];
      }

      setAllUsers(combined);
      localStorage.setItem('app_users', JSON.stringify(combined));
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribeFirestore();
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
    };
  }, []);

  const startLockCountdown = (seconds: number) => {
    if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
    let current = seconds;

    lockIntervalRef.current = setInterval(() => {
      current -= 1;
      setLockTimer(current);
      if (current <= 0) {
        if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
        setIsLocked(false);
        setFailedAttempts(0);
        setError('');
        localStorage.removeItem('login_lock_until');
      }
    }, 1000);
  };

  const handleSkipAndRedirect = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowSuccessToast(false);
    router.push('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const cleanInputUsername = username.trim().toLocaleUpperCase('tr-TR');

    let foundUser = null;
    if ((cleanInputUsername === 'ADMIN' || cleanInputUsername === 'ADMİN') && password === 'admin1233') {
      foundUser = { username: 'ADMIN', fullName: 'YÖNETİCİ ADMİN', role: 'YÖNETİCİ' };
    } else {
      // البحث أولاً في الـ State المحمل من Firebase
      foundUser = allUsers.find(
        (u: any) => u.username?.toLocaleUpperCase('tr-TR') === cleanInputUsername && u.password === password
      );
    }

    if (foundUser) {
      setError('');
      setFailedAttempts(0);
      const isUserAdmin = foundUser.role === 'YÖNETİCİ' || foundUser.username === 'ADMIN' || foundUser.username === 'admin';
      
      setLoggedInUser(foundUser.fullName || `${foundUser.username} ${foundUser.surname || ''}`);
      setIsAdminUser(isUserAdmin);
      setShowSuccessToast(true);
      setLoadingProgress(0);

      // حفظ بيانات الدخول والجلسة
      sessionStorage.setItem('user', JSON.stringify(foundUser));
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
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        const lockDurationSeconds = 1800;
        const lockUntil = Date.now() + lockDurationSeconds * 1000;
        localStorage.setItem('login_lock_until', lockUntil.toString());
        setLockTimer(lockDurationSeconds);
        startLockCountdown(lockDurationSeconds);
        setError('Çok sayıda hatalı deneme! Hesabınız 30 dakika süreyle kilitlenmiştir.');
      } else {
        setError(`Kullanıcı adı veya şifre hatalı! (Kalan Hak: ${3 - newAttempts})`);
      }
    }
  };

  const formatLockTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
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

      {/* Modern Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        type="button"
        className={`absolute top-6 right-6 flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer group active:scale-95 z-30 ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-700/80 text-amber-400 hover:border-amber-400/50 hover:shadow-amber-500/10' 
            : 'bg-white/90 border-slate-200 text-slate-800 hover:border-emerald-500/40 hover:shadow-emerald-500/10'
        }`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
          {isDarkMode ? (
            <svg className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </div>
        <span className="text-xs font-black tracking-wider uppercase">
          {isDarkMode ? 'GÜNDÜZ' : 'GECE'}
        </span>
      </button>

      {/* Floating Interactive Loader Overlay */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm w-full relative z-10">
            
            <div className="w-full h-16 relative my-2 overflow-hidden">
              <SeamlessECGCanvas isError={false} />
            </div>

            <div className="space-y-2 w-full">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  {isAdminUser ? 'ADMİN GİRİŞİ BAŞARILI' : 'GİRİŞ BAŞARILI'}
                </span>
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight">
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
              
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
                <div 
                  style={{ width: `${loadingProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out"
                ></div>
              </div>
            </div>

            {isAdminUser && (
              <button
                onClick={handleSkipAndRedirect}
                className="mt-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all duration-150 cursor-pointer flex items-center gap-3 active:scale-95 shadow-lg"
              >
                <span>HIZLI GEÇİŞ YAP</span>
                <span className="text-lg animate-bounce">⚡</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className={`max-w-md w-full border-2 rounded-3xl p-8 shadow-2xl transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-black/50' : 'bg-white border-slate-200/80 shadow-slate-200/80'
      }`}>
        <div className="text-center mb-6 flex flex-col items-center">
          
          <div className="w-full h-16 relative flex items-center justify-center mb-2 overflow-hidden">
            <SeamlessECGCanvas isError={isLocked || !!error} />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-wide">SİSTEME GİRİŞ YAP</h2>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-2xl border-2 backdrop-blur-md transition-all duration-300 ${
            isLocked 
              ? 'bg-rose-500/15 border-rose-500/60 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
              : 'bg-amber-500/15 border-amber-500/50 text-amber-400'
          }`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0">
                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-rose-400">
                  {isLocked ? 'GÜVENLİK KİLİDİ AKTİF' : 'GİRİŞ BAŞARISIZ'}
                </h4>
                <p className="text-sm font-bold leading-tight">
                  {error}
                </p>
                {isLocked && (
                  <div className="mt-2 pt-2 border-t border-rose-500/30 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">TEKRAR DENEME SÜRESİ:</span>
                    <span className="text-base font-mono font-black text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-lg border border-rose-500/40">
                      ⏱️ {formatLockTime(lockTimer)}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
              disabled={isLocked}
              value={username}
              onFocus={() => setShowUserDropdown(true)}
              onChange={(e) => {
                setUsername(e.target.value.toLocaleUpperCase('tr-TR'));
                setShowUserDropdown(true);
              }}
              className={`w-full px-4 py-3 rounded-xl border-2 font-black uppercase outline-none transition-all duration-150 ${
                isLocked
                  ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800'
                  : isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-400 focus:bg-emerald-950/20' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-emerald-50/50'
              }`}
              placeholder="Kullanıcı Adı"
              autoComplete="off"
            />

            {showUserDropdown && filteredUsers.length > 0 && !isLocked && (
              <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border-2 shadow-xl z-40 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}>
                {filteredUsers.map((u: any, idx: number) => (
                  <div
                    key={u.id || `${u.username}-${idx}`}
                    onClick={() => {
                      setUsername(u.username.toLocaleUpperCase('tr-TR'));
                      setShowUserDropdown(false);
                    }}
                    className={`flex justify-between items-center p-3 cursor-pointer transition-colors duration-150 text-sm font-black border-b last:border-b-0 ${
                      isDarkMode 
                        ? 'hover:bg-emerald-950/40 border-slate-800 text-slate-200 hover:text-emerald-300' 
                        : 'hover:bg-emerald-50 border-slate-100 text-slate-800 hover:text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full font-black flex items-center justify-center text-xs ${
                        isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.username ? u.username.charAt(0).toLocaleUpperCase('tr-TR') : 'U'}
                      </div>
                      <span>{u.username?.toLocaleUpperCase('tr-TR')} {u.surname?.toLocaleUpperCase('tr-TR') || ''}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">@{u.username?.toLowerCase()}</span>
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
                disabled={isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 font-black outline-none transition-all duration-150 pr-12 ${
                  isLocked
                    ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800'
                    : isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-400 focus:bg-emerald-950/20' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-emerald-50/50'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5 opacity-80 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
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
            disabled={isLocked}
            className={`w-full py-3.5 px-4 font-black rounded-xl text-base transition-all duration-150 shadow-lg cursor-pointer mt-2 flex items-center justify-center gap-2 ${
              isLocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]'
            }`}
          >
            {isLocked ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>SİSTEM KİLİTLİ ({formatLockTime(lockTimer)})</span>
              </>
            ) : (
              <span>GİRİŞ YAP</span>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}