'use client'; 
import { useState, useEffect } from 'react'; 
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import PageLoader from '@/components/PageLoader';

export default function DashboardPage() {   
  const theme = useTheme();
  const isDarkMode = theme?.isDarkMode ?? true;
  const setIsSidebarOpen = theme?.setIsSidebarOpen;
  
  const [currentUser, setCurrentUser] = useState(null);   
  const [showExitModal, setShowExitModal] = useState(false);
  const [isBoxLoading, setIsBoxLoading] = useState(false);
  const router = useRouter();   

  useEffect(() => {     
    // ✅ 1. فحص المستخدم المباشر
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});

    if (!activeUser || !activeUser.username) {
      router.push('/');
      return;
    }
    setCurrentUser(activeUser);   

    // ✅ 2. اعتراض زر الرجوع في المتصفح لمنع الخروج بالخطأ
    window.history.pushState(null, '', window.location.href);
    const handleBackButton = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      setShowExitModal(true); // إظهار النافذة المنبثقة التحذيرية الأنيقة
    };

    window.addEventListener('popstate', handleBackButton);
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [router]);   

  const handleConfirmExit = () => {
    setShowExitModal(false);
    setIsBoxLoading(true);
    setTimeout(() => {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      router.push('/');
    }, 400);
  };

  const handleCardClick = (path) => {
    // ✅ استخدام الحالة المحلية التي لا تسبب خطأ
    setIsBoxLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 600);
  };

  const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';   
  const isAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || uName === 'admin';   

  return (     
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn relative">              
      {/* شاشة التحميل الدائرية عند الضغط على المربعات */}
      <PageLoader show={isBoxLoading} />

      {/* Header Card */}       
      <header className={`p-5 sm:p-6 rounded-3xl border-2 shadow-2xl backdrop-blur-xl transition-all duration-300 flex justify-between items-center ${         
        isDarkMode            
          ? 'bg-slate-900/80 border-slate-800 shadow-slate-950/50'            
          : 'bg-white/90 border-slate-200 shadow-slate-300/40'       
      }`}>                  
        <button           
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(true)}           
          className={`p-3 px-5 rounded-2xl border-2 font-black transition-all flex items-center gap-3 cursor-pointer shadow-md hover:scale-105 active:scale-95 ${             
            isDarkMode                
              ? 'bg-slate-950 border-slate-700 text-emerald-400 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'                
              : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'           
          }`}         
        >           
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">             
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />           
          </svg>           
          <span className="text-xs font-black uppercase tracking-widest">MENÜ</span>         
        </button>         

        <div className={`px-4 py-2 rounded-2xl border-2 text-xs font-black tracking-wider uppercase shadow-inner ${           
          isAdmin              
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'              
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'         
        }`}>           
          {isAdmin ? 'YÖNETİCİ (ADMIN)' : 'KULLANICI'}         
        </div>       
      </header>       

      {/* Navigation Cards Grid */}       
      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>                  
        
        {/* 1. Doktor Çalışma Planları */}         
        <div onClick={() => handleCardClick('/schedule')} className="group cursor-pointer">           
          <div className={`h-full border-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-2xl relative overflow-hidden ${             
            isDarkMode                
              ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/80 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]'                
              : 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/60'           
          }`}>             
            <div className="flex items-center gap-4 mb-6">               
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">                 
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">                   
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />                 
                </svg>               
              </div>               
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide group-hover:text-emerald-400 transition-colors">                 
                DOKTOR ÇALIŞMA PLANLARI               
              </h2>             
            </div>             
            <div className="pt-4 border-t border-slate-800/60 flex justify-end items-center">               
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">                 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">                   
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />                 
                </svg>               
              </div>             
            </div>           
          </div>         
        </div>         

        {/* 2. Telefon Rehberi */}         
        <div onClick={() => handleCardClick('/phonebook')} className="group cursor-pointer">           
          <div className={`h-full border-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-2xl relative overflow-hidden ${             
            isDarkMode                
              ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500/80 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)]'                
              : 'bg-white border-slate-200 hover:border-blue-500 shadow-slate-200/60'           
          }`}>             
            <div className="flex items-center gap-4 mb-6">               
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shrink-0">                 
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">                   
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />                 
                </svg>               
              </div>               
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide group-hover:text-blue-400 transition-colors">                 
                TELEFON REHBERİ               
              </h2>             
            </div>             
            <div className="pt-4 border-t border-slate-800/60 flex justify-end items-center">               
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">                 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">                   
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />                 
                </svg>               
              </div>             
            </div>           
          </div>         
        </div>         

        {/* Admin Cards */}         
        {isAdmin && (           
          <>             
            {/* 3. Birim ve Doktor Yönetimi */}             
            <div onClick={() => handleCardClick('/admin/doctors')} className="group cursor-pointer">               
              <div className={`h-full border-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-2xl relative overflow-hidden ${                 
                isDarkMode                    
                  ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/80 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]'                    
                  : 'bg-white border-slate-200 hover:border-amber-500 shadow-slate-200/60'               
              }`}>                 
                <div className="flex items-center gap-4 mb-6">                   
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">                     
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">                       
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />                     
                    </svg>                   
                  </div>                   
                  <h2 className="text-base sm:text-lg font-black text-amber-500 uppercase tracking-wide group-hover:text-amber-400 transition-colors">                     
                    BİRİM VE DOKTOR YÖNETİMİ                   
                  </h2>                 
                </div>                 
                <div className="pt-4 border-t border-slate-800/60 flex justify-end items-center">                   
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-sm">                     
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">                       
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />                     
                    </svg>                   
                  </div>                 
                </div>               
              </div>             
            </div>             

            {/* 4. Kullanıcı Yönetimi */}             
            <div onClick={() => handleCardClick('/admin/users')} className="group cursor-pointer">               
              <div className={`h-full border-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-2xl relative overflow-hidden ${                 
                isDarkMode                    
                  ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/80 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]'                    
                  : 'bg-white border-slate-200 hover:border-amber-500 shadow-slate-200/60'               
              }`}>                 
                <div className="flex items-center gap-4 mb-6">                   
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">                     
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">                       
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />                     
                    </svg>                   
                  </div>                   
                  <h2 className="text-base sm:text-lg font-black text-amber-500 uppercase tracking-wide group-hover:text-amber-400 transition-colors">                     
                    KULLANICI YÖNETİMİ                   
                  </h2>                 
                </div>                 
                <div className="pt-4 border-t border-slate-800/60 flex justify-end items-center">                   
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-sm">                     
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">                       
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />                     
                    </svg>                   
                  </div>                 
                </div>               
              </div>             
            </div>           
          </>         
        )}       
      </div>     

      {/* ⚠️ نافذة تحذير الخروج بالخطأ */}
      {showExitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl border-2 p-7 shadow-2xl text-center space-y-5 animate-scaleUp ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto text-2xl animate-bounce">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-wide text-rose-500">
                SİSTEMDEN ÇIKIŞ YAPILSIN MI?
              </h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                Geri tuşuna bastınız. Uygulamadan çıkmak ve giriş ekranına dönmek istediğinize emin misiniz?
              </p>
            </div>

            <div className="flex gap-3 pt-2 font-black">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-2xl transition-all cursor-pointer shadow-md"
              >
                İPTAL
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-2xl shadow-lg transition-all cursor-pointer uppercase tracking-wider"
              >
                EVET, ÇIKIŞ YAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>   
  ); 
}