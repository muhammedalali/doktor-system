'use client'; 
import { useState, useEffect, useRef } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// 🩺 شاشة التحميل بنمط نبض النيون الأخضر الطبي Soft Luxe
function SeamlessECGLoader({ title = "YÜKLENİYOR...", isDarkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let x = 0;
    const speed = 2.8;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 320;
      canvas.height = 60;
    };
    resize();
    window.addEventListener('resize', resize);

    const getECGPoint = (xPos, width, height) => {
      const midY = height / 2;
      const cycleLength = width * 0.45; 
      const pos = (xPos % cycleLength) / cycleLength;

      if (pos >= 0.15 && pos < 0.22) {
        return midY - Math.sin((pos - 0.15) / 0.07 * Math.PI) * 3;
      }
      if (pos >= 0.25 && pos < 0.28) {
        return midY + 4;
      }
      if (pos >= 0.28 && pos < 0.33) {
        const t = (pos - 0.28) / 0.05;
        return midY - (Math.sin(t * Math.PI) * (height * 0.42));
      }
      if (pos >= 0.33 && pos < 0.37) {
        const t = (pos - 0.33) / 0.04;
        return midY + (Math.sin(t * Math.PI) * (height * 0.30));
      }
      if (pos >= 0.37 && pos < 0.40) {
        return midY - 3;
      }
      if (pos >= 0.45 && pos < 0.58) {
        return midY - Math.sin((pos - 0.45) / 0.13 * Math.PI) * 6;
      }
      return midY;
    };

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < width; i++) {
        const y = getECGPoint(i, width, height);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      const tailLength = 90;
      for (let i = 0; i < tailLength; i++) {
        const currentX = (x - i + width) % width;
        const currentY = getECGPoint(currentX, width, height);
        const alpha = Math.pow(1 - i / tailLength, 1.5);

        ctx.strokeStyle = isDarkMode 
          ? `rgba(16, 185, 129, ${alpha})` 
          : `rgba(5, 150, 105, ${alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = isDarkMode ? '#10b981' : '#059669';
        ctx.shadowBlur = i < 15 ? 6 : 1;

        ctx.beginPath();
        const prevX = (currentX - 1 + width) % width;
        const prevY = getECGPoint(prevX, width, height);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      x = (x + speed) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn select-none pointer-events-none">
      <div className={`flex flex-col items-center text-center gap-4 max-w-sm w-full p-6 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-emerald-100 text-slate-800'}`}>
        <div className={`w-full h-14 relative overflow-hidden rounded-2xl p-2 border ${isDarkMode ? 'bg-slate-950/70 border-emerald-900/40' : 'bg-emerald-50/80 border-emerald-200'}`}>
          <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
        </div>
        <h2 className={`text-xs font-bold tracking-wider uppercase ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// 💓 مكون الشعار المدمج
function HeaderECGLogo({ isDarkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let x = 0;
    const speed = 1.6;

    const resize = () => {
      canvas.width = 135;
      canvas.height = 16;
    };
    resize();

    const getECGPoint = (xPos, width, height) => {
      const midY = height / 2;
      const cycleLength = width * 0.48;
      const pos = (xPos % cycleLength) / cycleLength;

      if (pos >= 0.12 && pos < 0.20) {
        return midY - Math.sin((pos - 0.12) / 0.08 * Math.PI) * 1.2;
      }
      if (pos >= 0.22 && pos < 0.25) {
        return midY + 2;
      }
      if (pos >= 0.25 && pos < 0.30) {
        const t = (pos - 0.25) / 0.05;
        return midY - (Math.sin(t * Math.PI) * (height * 0.40));
      }
      if (pos >= 0.30 && pos < 0.35) {
        const t = (pos - 0.30) / 0.05;
        return midY + (Math.sin(t * Math.PI) * (height * 0.35));
      }
      if (pos >= 0.35 && pos < 0.38) {
        return midY - 1.5;
      }
      if (pos >= 0.45 && pos < 0.60) {
        return midY - Math.sin((pos - 0.45) / 0.15 * Math.PI) * 2.5;
      }
      return midY;
    };

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.3)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < width; i++) {
        const y = getECGPoint(i, width, height);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      const tailLength = 50;
      for (let i = 0; i < tailLength; i++) {
        const currentX = (x - i + width) % width;
        const currentY = getECGPoint(currentX, width, height);
        const alpha = Math.pow(1 - i / tailLength, 1.3);

        ctx.strokeStyle = isDarkMode 
          ? `rgba(16, 185, 129, ${alpha})`
          : `rgba(5, 150, 105, ${alpha})`;
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        const prevX = (currentX - 1 + width) % width;
        const prevY = getECGPoint(prevX, width, height);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      const headY = getECGPoint(x, width, height);
      ctx.beginPath();
      ctx.arc(x, headY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode ? '#34d399' : '#047857';
      ctx.shadowColor = isDarkMode ? '#10b981' : '#059669';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      x = (x + speed) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="w-[135px] h-[16px] block bg-transparent" />;
}

export default function DashboardPage() {   
  const [currentUser, setCurrentUser] = useState(null);   
  const [showExitModal, setShowExitModal] = useState(false);

  // ⚡ التحكم بالوضع الليلي والنهاري والمزامنة العامة
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ⚡ القوائم المنسدلة
  const [isOtherOperationsOpen, setIsOtherOperationsOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ⚡ شاشة التحميل
  const [isEcgLoading, setIsEcgLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('YÜKLENİYOR...');

  const otherOperationsRef = useRef(null);
  const modulesRef = useRef(null);
  const profileRef = useRef(null);
  const router = useRouter();   

  // قراءة ومزامنة الثيم المحفوظ عبر النظام بأكمله
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme === 'dark';
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // دالة تبديل الثيم وحفظه ونشره لجميع الصفحات
  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (otherOperationsRef.current && !otherOperationsRef.current.contains(event.target)) {
        setIsOtherOperationsOpen(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(event.target)) {
        setIsModulesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {     
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (!activeUser || !activeUser.username) {
      router.push('/');
      return;
    }
    setCurrentUser(activeUser);   

    let unsubscribeUser = () => {};
    if (activeUser.id) {
      unsubscribeUser = onSnapshot(doc(db, 'users', activeUser.id), (docSnap) => {
        if (docSnap.exists()) {
          const freshData = { id: docSnap.id, ...docSnap.data() };
          setCurrentUser(freshData);
          sessionStorage.setItem('user', JSON.stringify(freshData));
          if (localUser) localStorage.setItem('user', JSON.stringify(freshData));
        }
      });
    }

    return () => unsubscribeUser();
  }, [router]);   

  const handleConfirmExit = () => {
    setShowExitModal(false);
    setLoadingTitle('SİSTEMDEN ÇIKIŞ YAPILIYOR...');
    setIsEcgLoading(true);
    setTimeout(() => {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      router.push('/');
    }, 600);
  };

  const handleCardClick = (path, title) => {
    setIsOtherOperationsOpen(false);
    setIsModulesOpen(false);
    setIsProfileOpen(false);
    setLoadingTitle(title);
    setIsEcgLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 600);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';   
  const isGlobalAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || currentUser?.role === 'ADMIN';   
  const canManageDoctors = isGlobalAdmin || currentUser?.permissions?.canEditDoctors || currentUser?.permissions?.canDeleteDoctors;

  const otherOperationsList = [
    { id: 'schedule', title: 'DOKTOR ÇALIŞMA PLANLARI', path: '/schedule', show: true },
    { id: 'phonebook', title: 'TELEFON REHBERİ', path: '/phonebook', show: true },
    { id: 'doctors', title: 'BÖLÜM, DOKTOR DÜZELTME', path: '/admin/doctors', show: canManageDoctors },
  ];

  const softLuxeBtnStyle = `h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all duration-300 cursor-pointer border shadow-xs active:scale-95 ${
    isDarkMode 
      ? 'bg-slate-800/80 border-slate-700/80 text-slate-100 hover:bg-slate-800 hover:border-emerald-500/50 hover:text-emerald-400' 
      : 'bg-slate-50/90 border-slate-200/90 text-slate-800 hover:bg-emerald-50/60 hover:border-emerald-300 hover:text-emerald-700'
  }`;

  return (     
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-100/70 text-slate-800'}`}>              
      
      {/* 🩺 شاشة التحميل */}
      {isEcgLoading && <SeamlessECGLoader title={loadingTitle} isDarkMode={isDarkMode} />}

      {/* 🔵 الشريط العلوي العصري */}
      <header className={`w-full backdrop-blur-md border-b sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-sm' : 'bg-white/90 border-slate-200/80 shadow-xs'}`}>
        
        {/* ✨ الشعار */}
        <div className="flex items-center gap-2 select-none pointer-events-none cursor-default">
          <div className="flex flex-col relative items-center">
            <span className={`font-black text-sm sm:text-base tracking-[0.15em] bg-clip-text text-transparent uppercase ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]' 
                : 'bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 font-extrabold'
            }`}>
              DOKTORSYS
            </span>
            <div className="-mt-0.5 opacity-90">
              <HeaderECGLogo isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>

        {/* أزرار الهيدر */}
        <div className="flex items-center gap-2">
          
          {/* 1. الإشعارات */}
          <button 
            onClick={() => handleCardClick('/notifications', 'BİLDİRİMLER')}
            className={`relative h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/80 text-emerald-400 hover:bg-slate-800' 
                : 'bg-slate-50/90 border-slate-200/90 text-emerald-600 hover:bg-emerald-50/80'
            }`}
            title="Bildirimler"
          >
            <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">1</span>
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* 2. زر التكبير */}
          <button 
            onClick={toggleFullScreen}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800' 
                : 'bg-slate-50/90 border-slate-200/90 text-slate-600 hover:bg-slate-100'
            }`}
            title="Tam Ekran"
          >
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* 3. زر الوضع الليلي/النهاري */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-800' 
                : 'bg-slate-50/90 border-slate-200/90 text-slate-700 hover:bg-amber-50'
            }`}
            title={isDarkMode ? 'Gündüz Modu' : 'Gece Modu'}
          >
            {isDarkMode ? (
              <svg className="w-4.5 h-4.5 text-amber-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5 text-slate-700 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* 4. Diğer İşlemler */}
          <div className="relative" ref={otherOperationsRef}>
            <button
              onClick={() => setIsOtherOperationsOpen(!isOtherOperationsOpen)}
              className={softLuxeBtnStyle}
            >
              <svg className="w-4 h-4 text-sky-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden md:inline tracking-tight">Diğer İşlemler</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-200 ${isOtherOperationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOtherOperationsOpen && (
              <div className={`absolute right-0 top-full mt-2 w-56 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-semibold backdrop-blur-xl animate-fadeIn ${
                isDarkMode ? 'bg-slate-800/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'
              }`}>
                {otherOperationsList.filter(m => m.show).map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleCardClick(mod.path, mod.title)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/80 hover:text-emerald-400' : 'hover:bg-emerald-50/80 hover:text-emerald-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{mod.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Yetkili Modüller */}
          <div className="relative" ref={modulesRef}>
            <button
              onClick={() => setIsModulesOpen(!isModulesOpen)}
              className={softLuxeBtnStyle}
            >
              <svg className="w-4 h-4 text-sky-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="hidden md:inline tracking-tight">Yetkili Modüller</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-200 ${isModulesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isModulesOpen && (
              <div className={`absolute right-0 top-full mt-2 w-56 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-semibold backdrop-blur-xl animate-fadeIn ${
                isDarkMode ? 'bg-slate-800/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'
              }`}>
                {isGlobalAdmin ? (
                  <button
                    onClick={() => handleCardClick('/admin/users', 'KULLANICI YÖNETİMİ')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors font-semibold ${
                      isDarkMode ? 'hover:bg-slate-700/80 hover:text-emerald-400' : 'hover:bg-emerald-50/80 hover:text-emerald-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>KULLANICI YÖNETİMİ</span>
                  </button>
                ) : (
                  <div className="px-4 py-3 text-slate-400 text-center italic">
                    Yetkili modül bulunmamaktadır.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 👤 6. Profil - تم تفعيل وتوصيل جميع الأزرار والروابط الوظيفية */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={softLuxeBtnStyle}
            >
              <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="tracking-tight">Profil ({uName || 'KULLANICI'})</span>
              <svg className={`w-3.5 h-3.5 stroke-[2] opacity-70 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 top-full mt-2 w-60 border rounded-2xl shadow-xl py-2 z-[120] text-xs font-semibold backdrop-blur-xl animate-fadeIn ${
                isDarkMode ? 'bg-slate-800/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'
              }`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'}`}>
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{uName || 'Kullanıcı'}</p>
                  <p className="text-[11px] opacity-70 font-normal">{currentUser?.role || 'Kullanıcı'}</p>
                </div>

                <div className="py-1">
                  {/* تفعيل زر معلومات البروفايل */}
                  <button
                    onClick={() => handleCardClick('/profile', 'PROFİL BİLGİLERİ')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/80 hover:text-emerald-400' : 'hover:bg-emerald-50/80 hover:text-emerald-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil Bilgileri</span>
                  </button>

                  {/* تفعيل زر تغيير الرمز/كلمة المرور */}
                  <button
                    onClick={() => handleCardClick('/profile', 'ŞİFRE DEĞİŞTİR')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/80 hover:text-emerald-400' : 'hover:bg-emerald-50/80 hover:text-emerald-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-emerald-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Şifre Değiştir</span>
                  </button>

                  {/* تفعيل زر الإبلاغ عن مشكلة/عطل */}
                  <button
                    onClick={() => handleCardClick('/report', 'ARIZA BİLDİR')}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isDarkMode ? 'hover:bg-amber-950/40 text-amber-400' : 'hover:bg-amber-50 text-amber-700'
                    }`}
                  >
                    <svg className="w-4 h-4 text-amber-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Arıza Bildir</span>
                  </button>

                  {/* تفعيل زر الخروج من النظام */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowExitModal(true);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors border-t font-semibold ${
                      isDarkMode ? 'border-slate-700 hover:bg-rose-950/40 text-rose-400' : 'border-slate-100 hover:bg-rose-50 text-rose-600'
                    }`}
                  >
                    <svg className="w-4 h-4 text-rose-500 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 📄 المحتوى الرئيسي */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* بطاقة الترحيب */}
        <div className={`p-6 sm:p-8 rounded-3xl shadow-xs border relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            HOŞ GELDİNİZ, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{uName || 'KULLANICI'}</span>
          </h1>
          <p className="text-sm opacity-70 max-w-xl leading-relaxed">
            Sistem modüllerine ve profil ayarlarınıza yukarıdaki menüden kolayca erişebilirsiniz.
          </p>
        </div>

        {/* شبكة الوصول السريع */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => handleCardClick('/schedule', 'DOKTOR ÇALIŞMA PLANLARI')}
            className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">DOKTOR ÇALIŞMA PLANLARI</h3>
            <p className="text-xs opacity-70">Aylık ve günlük çalışma takvimlerini görüntüleyin.</p>
          </div>

          <div 
            onClick={() => handleCardClick('/phonebook', 'TELEFON REHBERİ')}
            className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-teal-950/60 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
              <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">TELEFON REHBERİ</h3>
            <p className="text-xs opacity-70">Dahili ve harici telefon numaralarına ulaşın.</p>
          </div>

          {canManageDoctors && (
            <div 
              onClick={() => handleCardClick('/admin/doctors', 'BÖLÜM, DOKTOR DÜZELTME')}
              className={`p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">BÖLÜM, DOKTOR DÜZELTME</h3>
              <p className="text-xs opacity-70">Doktor ve bölüm bilgilerini düzenleyin.</p>
            </div>
          )}
        </div>

      </main>

      {/* ⚠️ نافذة تأكيد الخروج */}
      {showExitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold">SİSTEMDEN ÇIKIŞ YAPILSIN MI?</h3>
              <p className="text-xs opacity-70 mt-1">Oturumunuz sonlandırılacaktır.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                İPTAL
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-colors"
              >
                ÇIKIŞ YAP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>   
  ); 
}