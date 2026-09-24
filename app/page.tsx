'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { 
  CalendarDays, 
  LogIn, 
  ArrowRight,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  // 🔄 فحص تلقائي: إذا كان المستخدم مسجلاً للدخول يتم توجيهه فوراً لـ /dashboard
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (activeUser && activeUser.username) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden flex flex-col justify-between selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />
      <div className="absolute bottom-1/4 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-teal-500/10 rounded-full blur-2xl pointer-events-none transform-gpu" />

      {/* Header Bar */}
      <header className={`w-full py-4 sm:py-5 px-4 sm:px-10 flex justify-between items-center z-20 border-b sticky top-0 transition-colors duration-200 ${
        isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-300 bg-white/95 shadow-sm'
      }`}>
        
        <div className="relative cursor-default select-none">
          <h1 className={`font-black text-lg sm:text-2xl tracking-widest uppercase transition-colors duration-200 bg-clip-text text-transparent ${
            isDarkMode 
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500' 
              : 'bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900'
          }`}>
            DOKTOR ÇALIŞMA PLANI
          </h1>
        </div>

        <button
          onClick={toggleTheme}
          className={`px-3 sm:px-4 py-2 rounded-xl border-2 text-xs font-black transition-all duration-150 active:scale-95 flex items-center gap-2 cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400' 
              : 'bg-white border-slate-300 text-slate-800 hover:bg-amber-50 hover:border-amber-500'
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">GÜNDÜZ MODU</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">GECE MODU</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center z-10 w-full space-y-6 sm:space-y-8">
        
        {/* ECG Wave Animation */}
        <div className="w-full max-w-2xl py-2 flex flex-col items-center justify-center relative pointer-events-none">
          <svg 
            className="w-full h-16 sm:h-20 overflow-visible transform-gpu" 
            viewBox="0 0 1000 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="30%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <path 
              d="M0,60 L1000,60" 
              stroke={isDarkMode ? '#334155' : '#cbd5e1'} 
              strokeWidth="1.5" 
              strokeDasharray="6 6"
              opacity="0.5" 
            />

            <path 
              stroke="url(#ecgGradient)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-smoothEcg transform-gpu"
              d="M 0,60 L 150,60 C 165,60 170,52 175,60 C 180,68 185,60 190,60 L 220,60 C 228,60 232,67 236,60 C 240,50 245,70 248,60 L 260,60 L 268,72 L 278,8 L 290,112 L 302,40 L 312,68 L 320,60 L 340,60 C 352,60 360,42 372,42 C 384,42 390,60 400,60 L 550,60 C 565,60 570,52 575,60 C 580,68 585,60 590,60 L 620,60 C 628,60 632,67 636,60 C 640,50 645,70 648,60 L 660,60 L 668,72 L 678,8 L 690,112 L 702,40 L 712,68 L 720,60 L 740,60 C 752,60 760,42 772,42 C 784,42 790,60 800,60 L 1000,60"
            />
          </svg>
        </div>

        {/* High-Contrast Interactive Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl">
          
          {/* Card 1: Doktor Çalışma Listesi */}
          <div 
            onClick={() => router.push('/schedule')}
            className={`group relative cursor-pointer rounded-2xl p-5 sm:p-6 border-2 transition-all duration-150 ease-out transform-gpu hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md will-change-transform ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800 hover:bg-emerald-950/40 hover:border-emerald-400' 
                : 'bg-white border-slate-200/90 hover:bg-emerald-50/80 hover:border-emerald-600'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
            
            <div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-150 mb-4 ${
                isDarkMode
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-400'
                  : 'bg-emerald-100/70 border-emerald-300 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
              }`}>
                <CalendarDays className="w-6 h-6" />
              </div>

              <h3 className={`text-xl sm:text-2xl font-black transition-colors duration-150 ${
                isDarkMode 
                  ? 'text-slate-100 group-hover:text-emerald-300' 
                  : 'text-slate-900 group-hover:text-emerald-900'
              }`}>
                Doktor Çalışma Listesi
              </h3>
            </div>

            <div className={`mt-6 pt-4 border-t flex items-center justify-between font-black text-xs sm:text-sm tracking-wide transition-colors duration-150 ${
              isDarkMode 
                ? 'border-slate-800 text-emerald-400 group-hover:text-emerald-300' 
                : 'border-slate-200 text-emerald-700 group-hover:text-emerald-800'
            }`}>
              <span>LİSTEYİ İNCELE</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-slate-950'
                  : 'bg-emerald-200/60 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white'
              }`}>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
              </div>
            </div>
          </div>

          {/* Card 2: Sisteme Giriş Yap */}
          <div 
            onClick={() => router.push('/login')}
            className={`group relative cursor-pointer rounded-2xl p-5 sm:p-6 border-2 transition-all duration-150 ease-out transform-gpu hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md will-change-transform ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800 hover:bg-teal-950/40 hover:border-teal-400' 
                : 'bg-white border-slate-200/90 hover:bg-teal-50/80 hover:border-teal-600'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500 opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
            
            <div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-150 mb-4 ${
                isDarkMode
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-400'
                  : 'bg-teal-100/70 border-teal-300 text-teal-800 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600'
              }`}>
                <LogIn className="w-6 h-6" />
              </div>

              <h3 className={`text-xl sm:text-2xl font-black transition-colors duration-150 ${
                isDarkMode 
                  ? 'text-slate-100 group-hover:text-teal-300' 
                  : 'text-slate-900 group-hover:text-teal-900'
              }`}>
                Sisteme Giriş Yap
              </h3>
            </div>

            <div className={`mt-6 pt-4 border-t flex items-center justify-between font-black text-xs sm:text-sm tracking-wide transition-colors duration-150 ${
              isDarkMode 
                ? 'border-slate-800 text-teal-400 group-hover:text-teal-300' 
                : 'border-slate-200 text-teal-700 group-hover:text-teal-800'
            }`}>
              <span>GİRİŞ EKRANINA GİT</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                isDarkMode
                  ? 'bg-teal-500/10 text-teal-400 group-hover:bg-teal-400 group-hover:text-slate-950'
                  : 'bg-teal-200/60 text-teal-800 group-hover:bg-teal-600 group-hover:text-white'
              }`}>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes smoothEcg {
          0% { stroke-dashoffset: 2000; }
          100% { stroke-dashoffset: 0; }
        }

        .animate-smoothEcg {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: smoothEcg 4s linear infinite;
          will-change: stroke-dashoffset;
        }
      `}</style>
    </div>
  );
}