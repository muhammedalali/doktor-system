'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

const ADMIN_DEFAULT_USER = {
  id: 'admin-fixed-id',
  username: 'ADMIN',
  surname: 'YÖNETİCİ',
  fullName: 'YÖNETİCİ ADMIN',
  role: 'YÖNETİCİ'
};

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
  const [allUsers, setAllUsers] = useState([ADMIN_DEFAULT_USER]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // جلب وتزامن المستخدمين من Firebase مع الضمان التام لظهور حساب ADMIN
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const dbUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const hasAdminInDb = dbUsers.some((u) => u.username?.toUpperCase() === 'ADMIN');
      
      if (!hasAdminInDb) {
        setAllUsers([ADMIN_DEFAULT_USER, ...dbUsers]);
      } else {
        setAllUsers(dbUsers);
      }
    }, (err) => {
      console.error('Firebase Fetch Users Error:', err);
      setAllUsers([ADMIN_DEFAULT_USER]);
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      unsubscribe();
    };
  }, []);

  const handleSkipAndRedirect = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowSuccessToast(false);
    router.push('/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanInputUsername = username.trim().toUpperCase();
    let foundUser = null;

    // 1. التحقق أولاً من أدمن النظام الأساسي
    if ((cleanInputUsername === 'ADMIN' || cleanInputUsername === 'ADMİN') && password === 'admin1233') {
      foundUser = ADMIN_DEFAULT_USER;
    } else {
      // 2. الاستعلام عن المستخدمين الآخرين من قاعدة بيانات Firebase
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '==', cleanInputUsername),
          where('password', '==', password)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          foundUser = { id: querySnapshot.docs[0].id, ...docData };
          foundUser.fullName = `${foundUser.username} ${foundUser.surname || ''}`;
        }
      } catch (err) {
        console.error('Login Query Error:', err);
      }
    }

    if (foundUser) {
      setError('');
      const isUserAdmin = foundUser.role === 'YÖNETİCİ' || foundUser.username === 'ADMIN' || foundUser.username === 'admin';

      setLoggedInUser(foundUser.fullName || foundUser.username);
      setIsAdminUser(isUserAdmin);
      setShowSuccessToast(true);
      setLoadingProgress(0);

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
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const filteredUsers = username.trim().length > 0
    ? allUsers.filter((u) =>
        u.username?.toUpperCase().includes(username.toUpperCase()) ||
        (u.surname && u.surname.toUpperCase().includes(username.toUpperCase()))
      )
    : allUsers;

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 px-4 relative overflow-hidden ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* النافذة المنبثقة عند نجاح تسجيل الدخول */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl transition-all duration-500 p-4">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm w-full relative z-10">
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
                {loggedInUser.toUpperCase()}
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
                <span className="text-lg animate-bounce">➔</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* زر التبديل بين النهار والليل */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 px-4 py-2.5 rounded-xl border-2 text-sm font-black transition-all cursor-pointer ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-400 hover:border-amber-400' : 'bg-white border-slate-300 text-slate-700 shadow-md hover:border-amber-500'
        }`}
      >
        {isDarkMode ? '☀️ GÜNDÜZ MODU' : '🌙 GECE MODU'}
      </button>

      {/* صندوق تسجيل الدخول الرئيسي */}
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
                setUsername(e.target.value.toUpperCase());
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
                {filteredUsers.map((u) => (
                  <div
                    key={u.id || u.username}
                    onClick={() => {
                      setUsername(u.username.toUpperCase());
                      setShowUserDropdown(false);
                    }}
                    className={`flex justify-between items-center p-3 cursor-pointer transition-colors text-sm font-black border-b last:border-b-0 ${
                      isDarkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-emerald-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 font-black flex items-center justify-center text-xs">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.username.toUpperCase()} {u.surname?.toUpperCase() || ''}</span>
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
                placeholder="Şifre"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
}