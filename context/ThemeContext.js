'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

const ThemeContext = createContext();

export const colorPalettes = {
  emerald: { label: 'Zümrüt Yeşili (Emerald)', dark: 'text-emerald-400', light: 'text-emerald-800', bg: 'bg-emerald-500', colorCode: '#10b981' },
  cyan: { label: 'Siyan Mavisi (Cyan)', dark: 'text-cyan-400', light: 'text-cyan-800', bg: 'bg-cyan-500', colorCode: '#06b6d4' },
  blue: { label: 'Klasik Mavi (Classic Blue)', dark: 'text-blue-400', light: 'text-blue-800', bg: 'bg-blue-500', colorCode: '#3b82f6' },
  indigo: { label: 'Gece Mavisi (Indigo)', dark: 'text-indigo-400', light: 'text-indigo-800', bg: 'bg-indigo-500', colorCode: '#6366f1' },
  purple: { label: 'Asil Mor (Purple)', dark: 'text-purple-400', light: 'text-purple-800', bg: 'bg-purple-500', colorCode: '#a855f7' },
  fuchsia: { label: 'Açık Mor (Fuchsia)', dark: 'text-fuchsia-400', light: 'text-fuchsia-800', bg: 'bg-fuchsia-500', colorCode: '#d946ef' },
  pink: { label: 'Pembe (Pink)', dark: 'text-pink-400', light: 'text-pink-800', bg: 'bg-pink-500', colorCode: '#ec4899' },
  rose: { label: 'Gül Kırmızı (Ruby Rose)', dark: 'text-rose-400', light: 'text-rose-800', bg: 'bg-rose-500', colorCode: '#f43f5e' },
  red: { label: 'Kırmızı (Red)', dark: 'text-red-500', light: 'text-red-800', bg: 'bg-red-500', colorCode: '#ef4444' },
  orange: { label: 'Turuncu (Orange)', dark: 'text-orange-400', light: 'text-orange-800', bg: 'bg-orange-500', colorCode: '#f97316' },
  amber: { label: 'Altın Sarısı (Amber Gold)', dark: 'text-amber-400', light: 'text-amber-800', bg: 'bg-amber-500', colorCode: '#f59e0b' },
  yellow: { label: 'Parlak Sarı (Yellow)', dark: 'text-yellow-300', light: 'text-yellow-700', bg: 'bg-yellow-400', colorCode: '#eab308' },
  lime: { label: 'Fıstık Yeşili (Lime)', dark: 'text-lime-400', light: 'text-lime-800', bg: 'bg-lime-500', colorCode: '#84cc16' },
  green: { label: 'Doğal Yeşil (Green)', dark: 'text-green-400', light: 'text-green-800', bg: 'bg-green-500', colorCode: '#22c55e' },
  teal: { label: 'Turkuaz (Teal)', dark: 'text-teal-400', light: 'text-teal-800', bg: 'bg-teal-500', colorCode: '#14b8a6' },
  sky: { label: 'Gök Mavisi (Sky)', dark: 'text-sky-400', light: 'text-sky-800', bg: 'bg-sky-500', colorCode: '#0ea5e9' },
  slate: { label: 'Gümüş Gri (Slate)', dark: 'text-slate-300', light: 'text-slate-800', bg: 'bg-slate-500', colorCode: '#64748b' },
  mono: { label: 'Beyaz / Siyah (Monochrome)', dark: 'text-slate-100', light: 'text-slate-950', bg: 'bg-slate-800', colorCode: '#334155' },
};

export const fontOptions = [
  { id: 'font-sans', label: 'Standard Sans (Sade & Modern)' },
  { id: 'font-mono', label: 'Monospace (Excel Grid & Sayısal)' },
  { id: 'font-serif', label: 'Serif (Klasik Resmi)' },
  { id: 'font-extrabold', label: 'Inter Extra Bold (Koyu)' },
  { id: 'font-light', label: 'Roboto Light (İnce)' },
  { id: 'font-medium', label: 'Poppins Compact' },
  { id: 'tracking-widest', label: 'Wide Spaced (Geniş)' },
  { id: 'font-semibold', label: 'Semibold Balanced' },
  { id: 'uppercase', label: 'ALL CAPS (Büyük Harf)' },
];

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPalette, setSelectedPalette] = useState('emerald');
  const [selectedFont, setSelectedFont] = useState('font-sans');
  const [zoomScale, setZoomScale] = useState(100);
  const [isStickyHeader, setIsStickyHeader] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // حالة التحكم لشاشة التحميل الموحدة
  const [pageLoading, setPageLoading] = useState(false);
  const pathname = usePathname();

  // ✅ ضبط العرض الزمني المتوازن (800ms) عند التنقل أو الرجوع
  useEffect(() => {
    if (pageLoading) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 800); // 👈 800ms توقيت ممتاز ومرن يظهر الأنيميشن بوضوح وبسرعة سريعة
      return () => clearTimeout(timer);
    }
  }, [pathname, pageLoading]);

  // ✅ التقاط زر الرجوع وإشعار شاشة التحميل فوراً
  useEffect(() => {
    const handlePopState = () => {
      setPageLoading(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Toast Notification State
  const [toastNotification, setToastNotification] = useState('');

  const triggerToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification('');
    }, 3500);
  };

  // Profile Modal Controls
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfileSubModal, setActiveProfileSubModal] = useState(null);

  const [editPhone, setEditPhone] = useState('');
  const [editUsernameReq, setEditUsernameReq] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');

  // Issue States
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [activeIssueTab, setActiveIssueTab] = useState('CREATE');
  const [issueCategory, setIssueCategory] = useState('Sistem / Teknik Hata');
  const [issueUrgency, setIssueUrgency] = useState('Normal');
  const [issueDescription, setIssueDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [userIssuesList, setUserIssuesList] = useState([]);
  const [editingIssueId, setEditingIssueId] = useState(null);

  const [currentUserData, setCurrentUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const user = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    
    setCurrentUserData(user);
    if (user?.phone) setEditPhone(user.phone);

    const userKey = user?.username ? `user_prefs_${user.username.toLowerCase()}` : 'global_user_prefs';
    const savedPrefs = JSON.parse(localStorage.getItem(userKey) || '{}');

    if (savedPrefs.isDarkMode !== undefined) setIsDarkMode(savedPrefs.isDarkMode);
    if (savedPrefs.selectedPalette) setSelectedPalette(savedPrefs.selectedPalette);
    if (savedPrefs.selectedFont) setSelectedFont(savedPrefs.selectedFont);
    if (savedPrefs.zoomScale) setZoomScale(savedPrefs.zoomScale);
    if (savedPrefs.isStickyHeader !== undefined) setIsStickyHeader(savedPrefs.isStickyHeader);

    const allIssues = JSON.parse(localStorage.getItem('app_system_issues') || '[]');
    const filtered = allIssues.filter(
      (item) => item.username?.toLocaleUpperCase('tr-TR') === user?.username?.toLocaleUpperCase('tr-TR')
    );
    setUserIssuesList(filtered);

    const nameReq = allIssues.find(i => i.category === 'Kullanıcı Adı Değişikliği' && i.username?.toLocaleUpperCase('tr-TR') === user?.username?.toLocaleUpperCase('tr-TR'));
    if (nameReq) {
      if (nameReq.isRead && nameReq.adminReply) {
        setUsernameStatus(`Yönetici Yanıtı: ${nameReq.adminReply}`);
      } else {
        setUsernameStatus('Talebiniz inceleme aşamasındadır...');
      }
    }
  }, [isSidebarOpen, showProfileModal, showIssueModal]);

  const savePreferences = (newPrefs) => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const user = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    const userKey = user?.username ? `user_prefs_${user.username.toLowerCase()}` : 'global_user_prefs';
    const currentSaved = JSON.parse(localStorage.getItem(userKey) || '{}');
    const updated = { ...currentSaved, ...newPrefs };
    localStorage.setItem(userKey, JSON.stringify(updated));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      savePreferences({ isDarkMode: next });
      return next;
    });
  };

  const changePalette = (key) => {
    setSelectedPalette(key);
    savePreferences({ selectedPalette: key });
  };

  const changeFont = (fontId) => {
    setSelectedFont(fontId);
    savePreferences({ selectedFont: fontId });
  };

  const changeZoom = (scale) => {
    setZoomScale(scale);
    savePreferences({ zoomScale: scale });
  };

  const toggleStickyHeader = () => {
    setIsStickyHeader((prev) => {
      const next = !prev;
      savePreferences({ isStickyHeader: next });
      return next;
    });
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsSidebarOpen(false);
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    document.body.style.overflow = 'auto';
    router.push('/');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUsernameRequest = (e) => {
    e.preventDefault();
    if (!editUsernameReq.trim()) return;

    const currentUName = currentUserData?.username?.toLocaleUpperCase('tr-TR');
    const allIssues = JSON.parse(localStorage.getItem('app_system_issues') || '[]');
    
    const nameReqObj = {
      id: Date.now(),
      username: currentUName,
      category: 'Kullanıcı Adı Değişikliği',
      urgency: 'Normal',
      description: `Kullanıcı adını '${editUsernameReq.trim().toLocaleUpperCase('tr-TR')}' olarak değiştirmek istiyor.`,
      date: new Date().toLocaleString('tr-TR'),
      isRead: false,
      adminReply: ''
    };
    
    localStorage.setItem('app_system_issues', JSON.stringify([nameReqObj, ...allIssues]));
    setUsernameStatus('Talebiniz inceleme aşamasındadır...');
    setActiveProfileSubModal(null);
    setEditUsernameReq('');
    triggerToast('Kullanıcı adı değiştirme talebiniz başarıyla iletildi');
  };

  const handleSavePhone = (e) => {
    e.preventDefault();

    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const currentUName = currentUserData?.username?.toLocaleUpperCase('tr-TR');
    let updatedUserObj = { ...currentUserData, phone: editPhone };

    const updatedUsersList = storedUsers.map((u) => {
      if (u.username?.toLocaleUpperCase('tr-TR') === currentUName) {
        return { ...u, ...updatedUserObj };
      }
      return u;
    });

    localStorage.setItem('app_users', JSON.stringify(updatedUsersList));
    sessionStorage.setItem('user', JSON.stringify(updatedUserObj));
    setCurrentUserData(updatedUserObj);

    setActiveProfileSubModal(null);
    triggerToast('Telefon numaranız başarıyla güncellendi');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();

    if (currentUserData?.password && oldPassword !== currentUserData.password) {
      alert('Eski şifrenizi hatalı girdiniz!');
      return;
    }
    if (newPassword.length < 4) {
      alert('Yeni şifre en az 4 karakter olmalıdır!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Yeni şifreler uyuşmuyor!');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const currentUName = currentUserData?.username?.toLocaleUpperCase('tr-TR');
    let updatedUserObj = { ...currentUserData, password: newPassword };

    const updatedUsersList = storedUsers.map((u) => {
      if (u.username?.toLocaleUpperCase('tr-TR') === currentUName) {
        return { ...u, ...updatedUserObj };
      }
      return u;
    });

    localStorage.setItem('app_users', JSON.stringify(updatedUsersList));
    sessionStorage.setItem('user', JSON.stringify(updatedUserObj));
    setCurrentUserData(updatedUserObj);

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveProfileSubModal(null);
    triggerToast('Şifreniz başarıyla değiştirildi');
  };

  const handleSaveIssue = (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    const allIssues = JSON.parse(localStorage.getItem('app_system_issues') || '[]');
    const uNameClean = currentUserData?.username?.toLocaleUpperCase('tr-TR') || 'KULLANICI';

    if (editingIssueId) {
      const updatedList = allIssues.map((item) => {
        if (item.id === editingIssueId && !item.isRead) {
          return {
            ...item,
            category: issueCategory,
            urgency: issueUrgency,
            description: issueDescription,
            file: attachedFile || item.file,
            updatedAt: new Date().toLocaleString('tr-TR')
          };
        }
        return item;
      });
      localStorage.setItem('app_system_issues', JSON.stringify(updatedList));
      triggerToast('Sorun bildiriminiz başarıyla güncellendi');
    } else {
      const newIssueObj = {
        id: Date.now(),
        username: uNameClean,
        category: issueCategory,
        urgency: issueUrgency,
        description: issueDescription,
        file: attachedFile,
        date: new Date().toLocaleString('tr-TR'),
        isRead: false,
        adminReply: ''
      };
      localStorage.setItem('app_system_issues', JSON.stringify([newIssueObj, ...allIssues]));
      triggerToast('Bildiriminiz başarıyla gönderildi');
    }

    setEditingIssueId(null);
    setIssueDescription('');
    setAttachedFile(null);

    const refreshed = JSON.parse(localStorage.getItem('app_system_issues') || '[]');
    setUserIssuesList(refreshed.filter((i) => i.username?.toLocaleUpperCase('tr-TR') === uNameClean));
    setActiveIssueTab('LIST');
  };

  const handleDeleteIssue = (id) => {
    const allIssues = JSON.parse(localStorage.getItem('app_system_issues') || '[]');
    const filtered = allIssues.filter((item) => item.id !== id);
    localStorage.setItem('app_system_issues', JSON.stringify(filtered));

    const uNameClean = currentUserData?.username?.toLocaleUpperCase('tr-TR') || 'KULLANICI';
    setUserIssuesList(filtered.filter((i) => i.username?.toLocaleUpperCase('tr-TR') === uNameClean));
    triggerToast('Bildirim başarıyla silindi');
  };

  const handleStartEditIssue = (item) => {
    if (item.isRead) return;
    setEditingIssueId(item.id);
    setIssueCategory(item.category);
    setIssueUrgency(item.urgency);
    setIssueDescription(item.description);
    setAttachedFile(item.file || null);
    setActiveIssueTab('CREATE');
  };

  const activeColor = isDarkMode 
    ? colorPalettes[selectedPalette]?.dark || 'text-emerald-400'
    : colorPalettes[selectedPalette]?.light || 'text-emerald-800';

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      selectedPalette,
      changePalette,
      selectedFont,
      changeFont,
      zoomScale,
      changeZoom,
      isStickyHeader,
      toggleStickyHeader,
      activeColor,
      isSidebarOpen,
      setIsSidebarOpen,
      setShowSettingsModal,
      pageLoading,
      setPageLoading
    }}>
      <div style={{ zoom: `${zoomScale}%` }} className={`min-h-screen transition-colors duration-300 ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        {/* شاشة التحميل العامة */}
        <PageLoader show={pageLoading} />

        {children}

        {/* CSS Animation for Toast */}
        <style jsx global>{`
          @keyframes slideLeftToRight {
            0% { transform: translateX(-100%); opacity: 0; }
            15% { transform: translateX(0); opacity: 1; }
            85% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(120%); opacity: 0; }
          }
          .animate-slide-toast {
            animation: slideLeftToRight 3.5s ease-in-out forwards;
          }
        `}</style>

        {/* Sliding Toast Notification */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-[300] pointer-events-none overflow-hidden">
            <span className="text-emerald-400 font-extrabold text-sm tracking-wide block animate-slide-toast drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]">
              {toastNotification}
            </span>
          </div>
        )}

        {/* Global Sidebar Drawer */}
        <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
          
          <div className={`fixed top-0 left-0 w-80 max-w-[85vw] h-full border-r-2 shadow-2xl flex flex-col justify-between z-10 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDarkMode ? 'bg-slate-900/98 border-slate-800 text-slate-100' : 'bg-white/98 border-slate-200 text-slate-900'}`}>
            
            <div className="p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <span className="text-xl">☰</span>
                <h3 className="text-xs font-black tracking-widest uppercase">MENÜ</h3>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-rose-500 font-black text-xl cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-black">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowProfileModal(true);
                }}
                className={`w-full p-4 rounded-2xl border-2 font-black text-xs flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.01] shadow-lg ${
                  isDarkMode 
                    ? 'bg-slate-950/80 border-slate-800 text-slate-100 hover:border-emerald-500/80' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-emerald-500/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">👤</span>
                  <span>PROFİL</span>
                </div>
                <span className="font-mono text-sm">➔</span>
              </button>

              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowIssueModal(true);
                }}
                className={`w-full p-4 rounded-2xl border-2 font-black text-xs flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.01] shadow-lg ${
                  isDarkMode 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/60' 
                    : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🚨</span>
                  <span>SORUN BİLDİR</span>
                </div>
                <span className="font-mono text-sm">➔</span>
              </button>

              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowSettingsModal(true);
                }}
                className={`w-full p-4 rounded-2xl border-2 font-black text-xs flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.01] shadow-lg ${
                  isDarkMode 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60' 
                    : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚙️</span>
                  <span>AYARLAR</span>
                </div>
                <span className="font-mono text-sm">➔</span>
              </button>
            </div>

            <div className="p-5 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-500 border-2 border-rose-500/20 font-black rounded-2xl text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span className="text-base">🚪</span>
                <span>ÇIKIŞ YAP</span>
              </button>
            </div>

          </div>
        </div>

        {/* Modal 1: PROFILE WINDOW */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
            <div className={`w-full max-w-2xl rounded-3xl border-2 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xl">👤</span>
                  <h3 className="text-base sm:text-lg font-black text-emerald-400 uppercase tracking-wide">
                    PROFİL VE HESAP YÖNETİMİ
                  </h3>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 font-black text-xl transition-all flex items-center justify-center cursor-pointer">✕</button>
              </div>

              <div className="my-6 space-y-4 font-black">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block">Kullanıcı Adınız</span>
                    <span className="text-sm font-extrabold text-amber-400">{currentUserData?.username || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block">Telefon</span>
                    <span className="text-sm font-mono text-emerald-400">{currentUserData?.phone || 'Tanımsız'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setActiveProfileSubModal('USERNAME')}
                    className="w-full p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/80 hover:border-amber-400 hover:bg-slate-800 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="text-xs font-black text-amber-400">🆔 KULLANICI ADI DEĞİŞTİRME TALEBİ</span>
                    <span className="font-mono text-sm">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileSubModal('PHONE')}
                    className="w-full p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/80 hover:border-emerald-400 hover:bg-slate-800 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="text-xs font-black text-emerald-400">📞 TELEFON NUMARASI GÜNCELLE</span>
                    <span className="font-mono text-sm">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileSubModal('PASSWORD')}
                    className="w-full p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/80 hover:border-rose-400 hover:bg-slate-800 flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="text-xs font-black text-rose-400">🔒 ŞİFRE DEĞİŞTİR</span>
                    <span className="font-mono text-sm">➔</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PROFILE SUB MODALS */}
        {activeProfileSubModal === 'USERNAME' && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black text-amber-400 uppercase">🆔 KULLANICI ADI TALEBİ</h4>
                <button onClick={() => setActiveProfileSubModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
              </div>

              <form onSubmit={handleSaveUsernameRequest} className="space-y-4 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">MEVCUT AD</label>
                  <input type="text" disabled value={currentUserData?.username || ''} className="w-full px-3.5 py-2.5 rounded-xl border-2 font-black uppercase text-xs bg-slate-950 border-slate-800 opacity-60 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-amber-400">YENİ AD TALEBİ</label>
                  <input type="text" required value={editUsernameReq} onChange={(e) => setEditUsernameReq(e.target.value.toLocaleUpperCase('tr-TR'))} placeholder="Yeni kullanıcı adı..." className="w-full px-3.5 py-2.5 rounded-xl border-2 font-black uppercase text-xs outline-none bg-slate-950 border-slate-800 focus:border-amber-400" />
                </div>

                {usernameStatus && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[11px] font-bold text-center">
                    {usernameStatus}
                  </div>
                )}

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer">KAYDET</button>
              </form>
            </div>
          </div>
        )}

        {activeProfileSubModal === 'PHONE' && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black text-emerald-400 uppercase">📞 TELEFON NUMARASI GÜNCELLE</h4>
                <button onClick={() => setActiveProfileSubModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
              </div>

              <form onSubmit={handleSavePhone} className="space-y-4 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">TELEFON NUMARASI</label>
                  <input type="text" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="05XXXXXXXXX" className="w-full px-3.5 py-2.5 rounded-xl border-2 font-mono text-xs outline-none bg-slate-950 border-slate-800 focus:border-emerald-500" />
                </div>

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer">KAYDET</button>
              </form>
            </div>
          </div>
        )}

        {activeProfileSubModal === 'PASSWORD' && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black text-rose-400 uppercase">🔒 ŞİFRE DEĞİŞTİR</h4>
                <button onClick={() => setActiveProfileSubModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-3 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">ESKİ ŞİFRE</label>
                  <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2 rounded-xl border-2 font-black text-xs outline-none bg-slate-950 border-slate-800 focus:border-rose-500" />
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">YENİ ŞİFRE</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2 rounded-xl border-2 font-black text-xs outline-none bg-slate-950 border-slate-800 focus:border-rose-500" />
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">YENİ ŞİFRE (TEKRAR)</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2 rounded-xl border-2 font-black text-xs outline-none bg-slate-950 border-slate-800 focus:border-rose-500" />
                </div>

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer">KAYDET</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: ISSUE WINDOW */}
        {showIssueModal && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fadeIn">
            <div className={`w-full max-w-5xl h-full max-h-[92vh] rounded-3xl border-2 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl text-xl">🚨</span>
                  <h3 className="text-base sm:text-lg font-black text-rose-400 uppercase tracking-wide">SORUN BİLDİR</h3>
                </div>

                <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                  <button onClick={() => setActiveIssueTab('CREATE')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeIssueTab === 'CREATE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>📝 YENİ BİLDİRİM</button>
                  <button onClick={() => setActiveIssueTab('LIST')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeIssueTab === 'LIST' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>📬 TALEPLERİM ({userIssuesList.length})</button>
                </div>

                <button onClick={() => setShowIssueModal(false)} className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 font-black text-xl transition-all flex items-center justify-center cursor-pointer">✕</button>
              </div>

              {activeIssueTab === 'CREATE' && (
                <form onSubmit={handleSaveIssue} className="my-6 space-y-5 font-black">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1 text-slate-400">SORUN KATEGORİSİ</label>
                      <select value={issueCategory} onChange={(e) => setIssueCategory(e.target.value)} className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                        <option value="Sistem / Teknik Hata">Sistem / Teknik Hata</option>
                        <option value="Doktor Planı Yanlışlığı">Doktor Planı Yanlışlığı</option>
                        <option value="Telefon Rehberi Hatalı">Telefon Rehberi Hatalı</option>
                        <option value="Öneri / İstek">Öneri / İstek</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs mb-1 text-slate-400">ACİLİYET DURUMU</label>
                      <select value={issueUrgency} onChange={(e) => setIssueUrgency(e.target.value)} className={`w-full px-4 py-3 rounded-2xl border-2 font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                        <option value="Normal">Normal</option>
                        <option value="Çok Acil">Çok Acil 🚨</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-slate-400">AÇIKLAMA METNİ</label>
                    <textarea rows="4" required value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Yaşadığınız sorunu detaylıca buraya yazınız..." className={`w-full p-4 rounded-2xl border-2 font-sans text-xs outline-none focus:border-rose-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}></textarea>
                  </div>

                  <div>
                    <label className="block text-xs mb-2 text-slate-400">DOSYA / EKLENTİ YÜKLE</label>
                    <div className={`border-2 border-dashed rounded-3xl p-6 text-center relative transition-all ${attachedFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-amber-400 bg-slate-950/40'}`}>
                      <input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {attachedFile ? (
                        <div className="flex justify-between items-center px-4 font-mono">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📎</span>
                            <div className="text-left">
                              <p className="text-xs font-black text-emerald-400">{attachedFile.name}</p>
                              <p className="text-[10px] text-slate-400">{attachedFile.size}</p>
                            </div>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }} className="p-2 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl text-xs">İPTAL ✕</button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-3xl block">📁</span>
                          <p className="text-xs font-black text-slate-300">Dosyaları buraya sürükleyin veya seçmek için tıklayın</p>
                          <p className="text-[10px] text-slate-500 font-normal">Görsel, Video, Ses Kaydı veya Doküman (Maksimum 50MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    {editingIssueId && (
                      <button type="button" onClick={() => { setEditingIssueId(null); setIssueDescription(''); setAttachedFile(null); }} className="px-6 py-4 bg-slate-800 text-slate-300 font-black text-xs rounded-2xl cursor-pointer hover:bg-slate-700">İPTAL</button>
                    )}
                    <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition-all cursor-pointer uppercase tracking-widest active:scale-95">GÖNDER</button>
                  </div>
                </form>
              )}

              {activeIssueTab === 'LIST' && (
                <div className="my-6 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {userIssuesList.length > 0 ? (
                    userIssuesList.map((item) => (
                      <div key={item.id} className={`p-5 border-2 rounded-3xl space-y-3 text-xs font-black transition-all ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 uppercase font-black">{item.category}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${item.urgency === 'Çok Acil' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'}`}>{item.urgency}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold ${item.isRead ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>{item.isRead ? 'GÖRÜLDÜ 👁️' : 'BEKLEMEDE ⏳'}</span>
                        </div>
                        <p className="text-slate-300 text-xs font-normal font-sans leading-relaxed">{item.description}</p>
                        {item.file && (
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                            <span className="text-[11px] text-emerald-400 font-mono">📎 Eklenti: {item.file.name}</span>
                            <a href={item.file.data} download={item.file.name} className="text-[10px] text-amber-400 hover:underline">İNDİR 📥</a>
                          </div>
                        )}
                        {item.adminReply && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-sans">
                            <strong>Yönetici Yanıtı:</strong> {item.adminReply}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                          <span>Tarih: {item.date}</span>
                          <div className="flex gap-3">
                            {!item.isRead ? (<button onClick={() => handleStartEditIssue(item)} className="text-emerald-400 hover:underline cursor-pointer font-bold">DÜZENLE ✏️</button>) : (<span className="text-slate-500">Okunduğu için kilitlendi</span>)}
                            <button onClick={() => handleDeleteIssue(item.id)} className="text-rose-500 hover:underline cursor-pointer font-bold">SİL 🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 text-center font-bold">Henüz gönderilmiş bir bildiriminiz bulunmuyor.</div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal 3: Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className={`w-full max-w-sm rounded-3xl border-2 p-6 shadow-2xl text-center space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
              <div>
                <h3 className="text-base font-black uppercase tracking-wide">ÇIKIŞ YAPMA TALEBİ</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">Çıkış yapmak istediğinize emin misiniz?</p>
              </div>
              <div className="flex gap-3 pt-2 font-black">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-2xl transition-all cursor-pointer">İPTAL</button>
                <button onClick={confirmLogout} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-2xl shadow-lg transition-all cursor-pointer">EVET, ÇIKIŞ YAP</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: SETTINGS WINDOW */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fadeIn">
            <div className={`w-full max-w-3xl h-full max-h-[90vh] rounded-3xl border-2 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-xl">⚙️</span>
                  <h3 className="text-base font-black tracking-wider text-amber-500 uppercase">AYARLAR</h3>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 font-black text-xl transition-all flex items-center justify-center cursor-pointer">✕</button>
              </div>

              <div className="my-6 space-y-6 font-black">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/60">
                    <span className="text-xs">Gece / Gündüz Modu</span>
                    <button onClick={toggleTheme} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${isDarkMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white'}`}>{isDarkMode ? '☀️ GÜNDÜZ' : '🌙 GECE'}</button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/60">
                    <span className="text-xs">Üst Menüyü Sabitle</span>
                    <button onClick={toggleStickyHeader} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${isStickyHeader ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{isStickyHeader ? 'AÇIK' : 'KAPALI'}</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-slate-400">YAZI TİPİ (FONT SEÇİMİ)</label>
                  <select value={selectedFont} onChange={(e) => changeFont(e.target.value)} className={`w-full p-4 rounded-2xl border-2 text-xs font-black outline-none cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                    {fontOptions.map((f) => (<option key={f.id} value={f.id} className="py-2">{f.label}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-slate-400">TABLO RENK TEMASI (18 RENK)</label>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-2xl border border-white/20 shadow-md shrink-0 transition-all duration-300" style={{ backgroundColor: colorPalettes[selectedPalette]?.colorCode }}></span>
                    <select value={selectedPalette} onChange={(e) => changePalette(e.target.value)} className={`w-full p-4 rounded-2xl border-2 text-xs font-black outline-none cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                      {Object.keys(colorPalettes).map((key) => (<option key={key} value={key} className="py-2">{colorPalettes[key].label}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-slate-400">EKRAN ZUMU (ZOOM SCALE)</label>
                    <span className="text-xs font-mono text-emerald-500 font-black">%{zoomScale}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => changeZoom(Math.max(70, zoomScale - 5))} className="w-10 h-10 rounded-2xl font-black bg-slate-800 border text-slate-200 hover:bg-emerald-600 transition-all cursor-pointer">−</button>
                    <input type="range" min="70" max="130" step="5" value={zoomScale} onChange={(e) => changeZoom(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg" />
                    <button onClick={() => changeZoom(Math.min(130, zoomScale + 5))} className="w-10 h-10 rounded-2xl font-black bg-slate-800 border text-slate-200 hover:bg-emerald-600 transition-all cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={() => { setShowSettingsModal(false); triggerToast('Ayarlar başarıyla kaydedildi'); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition-all cursor-pointer uppercase tracking-wider">TAMAM</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);