'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageLoader from '@/components/PageLoader';
import RealtimeNotification from '@/components/RealtimeNotification';
import SettingsModal from '@/components/modals/SettingsModal';

const ThemeContext = createContext();

export const colorPalettes = {
  // ⚪ White & Black Tones
  pureWhite: { label: 'Bembeyaz (Matte Beyaz)', dark: 'text-white', light: 'text-white', bg: 'bg-white', colorCode: '#ffffff' },
  pureBlack: { label: 'Kapkaranlık Siyah', dark: 'text-black', light: 'text-black', bg: 'bg-black', colorCode: '#000000' },

  // 🎨 Primary & Standard Colors
  emerald: { label: 'Zümrüt Yeşili', dark: 'text-emerald-400', light: 'text-emerald-800', bg: 'bg-emerald-500', colorCode: '#10b981' },
  green: { label: 'Doğal Yeşil', dark: 'text-green-400', light: 'text-green-800', bg: 'bg-green-500', colorCode: '#22c55e' },
  blue: { label: 'Klasik Mavi', dark: 'text-blue-400', light: 'text-blue-800', bg: 'bg-blue-500', colorCode: '#3b82f6' },
  red: { label: 'Kırmızı', dark: 'text-red-500', light: 'text-red-800', bg: 'bg-red-500', colorCode: '#ef4444' },
  yellow: { label: 'Parlak Sarı', dark: 'text-yellow-300', light: 'text-yellow-700', bg: 'bg-yellow-400', colorCode: '#eab308' },
  amber: { label: 'Altın Sarısı', dark: 'text-amber-400', light: 'text-amber-800', bg: 'bg-amber-500', colorCode: '#f59e0b' },
  orange: { label: 'Turuncu', dark: 'text-orange-400', light: 'text-orange-800', bg: 'bg-orange-500', colorCode: '#f97316' },
  purple: { label: 'Asil Mor', dark: 'text-purple-400', light: 'text-purple-800', bg: 'bg-purple-500', colorCode: '#a855f7' },
  cyan: { label: 'Siyan Mavisi', dark: 'text-cyan-400', light: 'text-cyan-800', bg: 'bg-cyan-500', colorCode: '#06b6d4' },
  indigo: { label: 'Gece Mavisi', dark: 'text-indigo-400', light: 'text-indigo-800', bg: 'bg-indigo-500', colorCode: '#6366f1' },

  // 🎭 Extended Palette & Tones
  fuchsia: { label: 'Açık Mor', dark: 'text-fuchsia-400', light: 'text-fuchsia-800', bg: 'bg-fuchsia-500', colorCode: '#d946ef' },
  pink: { label: 'Pembe', dark: 'text-pink-400', light: 'text-pink-800', bg: 'bg-pink-500', colorCode: '#ec4899' },
  rose: { label: 'Gül Kırmızı', dark: 'text-rose-400', light: 'text-rose-800', bg: 'bg-rose-500', colorCode: '#f43f5e' },
  lime: { label: 'Fıstık Yeşili', dark: 'text-lime-400', light: 'text-lime-800', bg: 'bg-lime-500', colorCode: '#84cc16' },
  teal: { label: 'Turkuaz', dark: 'text-teal-400', light: 'text-teal-800', bg: 'bg-teal-500', colorCode: '#14b8a6' },
  sky: { label: 'Gök Mavisi', dark: 'text-sky-400', light: 'text-sky-800', bg: 'bg-sky-500', colorCode: '#0ea5e9' },
  slate: { label: 'Gümüş Gri', dark: 'text-slate-300', light: 'text-slate-800', bg: 'bg-slate-500', colorCode: '#64748b' },
  mono: { label: 'Monokrom', dark: 'text-slate-100', light: 'text-slate-950', bg: 'bg-slate-800', colorCode: '#334155' },
  violet: { label: 'Menekşe', dark: 'text-violet-400', light: 'text-violet-800', bg: 'bg-violet-500', colorCode: '#8b5cf6' },
  stone: { label: 'Taş Grisi', dark: 'text-stone-300', light: 'text-stone-800', bg: 'bg-stone-500', colorCode: '#78716c' },
  neutral: { label: 'Nötr Gri', dark: 'text-neutral-300', light: 'text-neutral-800', bg: 'bg-neutral-500', colorCode: '#737373' },
  zinc: { label: 'Çinko Grisi', dark: 'text-zinc-300', light: 'text-zinc-800', bg: 'bg-zinc-500', colorCode: '#71717a' },
  
  // 🌙 Deep & Dark Tones
  emeraldDark: { label: 'Koyu Zümrüt', dark: 'text-emerald-600', light: 'text-emerald-950', bg: 'bg-emerald-700', colorCode: '#047857' },
  cyanDark: { label: 'Okyanus Siyanı', dark: 'text-cyan-600', light: 'text-cyan-950', bg: 'bg-cyan-700', colorCode: '#0e7490' },
  blueDeep: { label: 'Derin Mavi', dark: 'text-blue-600', light: 'text-blue-950', bg: 'bg-blue-700', colorCode: '#1d4ed8' },
  indigoRoyal: { label: 'Kraliyet Mavisi', dark: 'text-indigo-600', light: 'text-indigo-950', bg: 'bg-indigo-700', colorCode: '#4338ca' },
  purpleDark: { label: 'Mistik Mor', dark: 'text-purple-600', light: 'text-purple-950', bg: 'bg-purple-700', colorCode: '#6d28d9' },
  roseWine: { label: 'Bordo Gül', dark: 'text-rose-600', light: 'text-rose-950', bg: 'bg-rose-700', colorCode: '#be123c' },
  amberBronze: { label: 'Bronz Amber', dark: 'text-amber-600', light: 'text-amber-950', bg: 'bg-amber-700', colorCode: '#b45309' },
  tealForest: { label: 'Orman Turkuazı', dark: 'text-teal-600', light: 'text-teal-950', bg: 'bg-teal-700', colorCode: '#0f766e' },
  crimson: { label: 'Kan Kırmızı', dark: 'text-red-600', light: 'text-red-950', bg: 'bg-red-700', colorCode: '#b91c1c' },
  
  // ☀️ Soft & Light Tones
  mint: { label: 'Nane Yeşili', dark: 'text-emerald-300', light: 'text-emerald-700', bg: 'bg-emerald-300', colorCode: '#6ee7b7' },
  iceCyan: { label: 'Buz Siyanı', dark: 'text-cyan-200', light: 'text-cyan-900', bg: 'bg-cyan-300', colorCode: '#67e8f9' },
  neonPink: { label: 'Neon Pembe', dark: 'text-pink-300', light: 'text-pink-700', bg: 'bg-pink-400', colorCode: '#f472b6' },
  lavender: { label: 'Lavanta', dark: 'text-purple-300', light: 'text-purple-700', bg: 'bg-purple-300', colorCode: '#d8b4fe' },
  peach: { label: 'Şeftali', dark: 'text-orange-300', light: 'text-orange-700', bg: 'bg-orange-300', colorCode: '#fdba74' },
  gold: { label: 'Saf Altın', dark: 'text-yellow-400', light: 'text-yellow-800', bg: 'bg-yellow-500', colorCode: '#eab308' },
  olive: { label: 'Zeytin Yeşili', dark: 'text-lime-600', light: 'text-lime-950', bg: 'bg-lime-700', colorCode: '#4d7c0f' },
  navy: { label: 'Lacivert', dark: 'text-sky-700', light: 'text-sky-950', bg: 'bg-sky-900', colorCode: '#0c4a6e' },
  plum: { label: 'Erik Moru', dark: 'text-fuchsia-700', light: 'text-fuchsia-950', bg: 'bg-fuchsia-900', colorCode: '#701a75' },
  maroon: { label: 'Kestane', dark: 'text-rose-800', light: 'text-rose-950', bg: 'bg-rose-900', colorCode: '#881337' },
  coral: { label: 'Mercan', dark: 'text-rose-300', light: 'text-rose-700', bg: 'bg-rose-300', colorCode: '#fda4af' },
  aqua: { label: 'Açık Su Mavisi', dark: 'text-sky-300', light: 'text-sky-800', bg: 'bg-sky-300', colorCode: '#7dd3fc' },
  sage: { label: 'Adaçayı Yeşili', dark: 'text-green-300', light: 'text-green-800', bg: 'bg-green-300', colorCode: '#86efac' },
  sand: { label: 'Çöl Kum', dark: 'text-amber-200', light: 'text-amber-900', bg: 'bg-amber-200', colorCode: '#fde68a' },
  charcoal: { label: 'Kömür Gri', dark: 'text-slate-400', light: 'text-slate-900', bg: 'bg-slate-700', colorCode: '#334155' },
  midnight: { label: 'Gece Yarısı', dark: 'text-indigo-200', light: 'text-indigo-950', bg: 'bg-indigo-950', colorCode: '#1e1b4b' },
  sunset: { label: 'Gün Batımı', dark: 'text-orange-500', light: 'text-orange-900', bg: 'bg-orange-600', colorCode: '#ea580c' },
  electric: { label: 'Elektrik Mavi', dark: 'text-blue-300', light: 'text-blue-900', bg: 'bg-blue-400', colorCode: '#60a5fa' },
  cyberYellow: { label: 'Siber Sarı', dark: 'text-yellow-200', light: 'text-yellow-900', bg: 'bg-yellow-300', colorCode: '#fde047' },
  ultraViolet: { label: 'Ultraviyole', dark: 'text-violet-300', light: 'text-violet-900', bg: 'bg-violet-400', colorCode: '#a78bfa' },
  forest: { label: 'Derin Orman', dark: 'text-emerald-500', light: 'text-emerald-900', bg: 'bg-emerald-800', colorCode: '#065f46' },
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
  { id: 'font-bold-mono', label: 'Bold Monospace' },
  { id: 'font-condensed', label: 'Condensed Narrow' },
  { id: 'font-heading-heavy', label: 'Heading Heavy Bold' },
  { id: 'font-digital', label: 'Digital Matrix' },
  { id: 'font-subtle', label: 'Subtle Elegant Light' },
  { id: 'font-system', label: 'System UI Default' },
  { id: 'font-tech', label: 'Tech Pro Clean' },
  { id: 'font-rounded', label: 'Rounded Soft' },
  { id: 'font-sharp', label: 'Sharp Professional' },
  { id: 'font-retro', label: 'Retro Serif Classic' },
  { id: 'font-modern-slab', label: 'Modern Slab Serif' },
  { id: 'font-compact-sans', label: 'Compact Minimal Sans' },
  { id: 'font-wide-heading', label: 'Wide Expanded Display' },
  { id: 'font-thin-sans', label: 'Ultra Thin Sans' },
  { id: 'font-heavy-black', label: 'Heavy Black Impact' },
  { id: 'font-clean-grid', label: 'Clean Grid Display' },
  { id: 'font-code-pro', label: 'Code Developer Pro' },
  { id: 'font-news-serif', label: 'Editorial News Serif' },
  { id: 'font-geometric', label: 'Geometric Modern' },
  { id: 'font-humanist', label: 'Humanist Soft' },
  { id: 'font-grotesque', label: 'Neo Grotesque' },
  { id: 'font-futuristic', label: 'Cyber Tech Line' },
  { id: 'font-slab-bold', label: 'Slab Heavy Duty' },
  { id: 'font-hand-style', label: 'Casual Script Touch' },
  { id: 'font-gothic', label: 'Gothic Dark Line' },
  { id: 'font-narrow-mono', label: 'Narrow Monospace' },
  { id: 'font-expanded-mono', label: 'Expanded Mono Code' },
  { id: 'font-classic-roman', label: 'Classic Roman Elegant' },
  { id: 'font-ultra-bold', label: 'Ultra Heavy Display' },
  { id: 'font-fine-light', label: 'Fine Light Thin' },
  { id: 'font-balanced-sans', label: 'Balanced Geometric' },
  { id: 'font-hospital-clean', label: 'Medical Clean Sans' },
  { id: 'font-data-dense', label: 'Data Dense Compact' },
  { id: 'font-dashboard-pro', label: 'Dashboard Pro UI' },
  { id: 'font-soft-rounded', label: 'Soft Rounded Friendly' },
  { id: 'font-flat-minimal', label: 'Flat Minimal Modern' },
  { id: 'font-strong-caps', label: 'Strong Caps Heavy' },
  { id: 'font-executive', label: 'Executive Slate Serif' },
  { id: 'font-terminal', label: 'Green Terminal Mono' },
  { id: 'font-high-tech', label: 'High-Tech Interface' },
  { id: 'font-prime-sans', label: 'Prime Sans Bold' },
  { id: 'font-alpha-numeric', label: 'Alpha Numeric Grid' },
  { id: 'font-clean-slate', label: 'Clean Slate Sans' }
];

const defaultTableSettings = {
  showClinic: true,
  showDoctorName: true,
  showStatus: true,
  showPhone: true,
  showRoomNo: true,
  borderStyle: 'horizontal',
  rowPadding: 'normal',
  fontWeight: 'font-bold',
  textShadow: 'none',
  letterSpacing: 'tracking-normal'
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPalette, setSelectedPalette] = useState('emerald');
  const [selectedFont, setSelectedFont] = useState('font-sans');
  const [zoomScale, setZoomScale] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTableSettingsModal, setShowTableSettingsModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [tableSettings, setTableSettings] = useState(defaultTableSettings);
  const [pageLoading, setPageLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pageLoading) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, pageLoading]);

  useEffect(() => {
    const handlePopState = () => {
      setPageLoading(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [toastNotification, setToastNotification] = useState('');

  const triggerToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification('');
    }, 2500);
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfileSubModal, setActiveProfileSubModal] = useState(null);

  const [editPhone, setEditPhone] = useState('');
  const [editUsernameReq, setEditUsernameReq] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');

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
    if (savedPrefs.tableSettings) setTableSettings(savedPrefs.tableSettings);

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

  const updateTableSettings = (newSettings) => {
    setTableSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      savePreferences({ tableSettings: updated });
      return updated;
    });
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
    triggerToast('Tema rengi başarıyla değiştirildi');
  };

  const changeFont = (fontId) => {
    setSelectedFont(fontId);
    savePreferences({ selectedFont: fontId });
    triggerToast('Yazı tipi değiştirildi');
  };

  const changeZoom = (scale) => {
    setZoomScale(scale);
    savePreferences({ zoomScale: scale });
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

  const fontScaleStyle = {
    fontSize: `${(zoomScale / 100) * 0.95}rem`
  };

  const getShadowClass = () => {
    if (tableSettings.textShadow === 'soft') return 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]';
    if (tableSettings.textShadow === 'strong') return 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]';
    if (tableSettings.textShadow === 'glow') return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    return '';
  };

  const sampleDoctors = [
    { clinic: 'KARDİYOLOJİ', name: 'DR. AHMET YILMAZ', status: 'POLİKLİNİK', phone: '4012', roomNo: '102' },
    { clinic: 'NÖROLOJİ', name: 'DR. AYŞE KAYA', status: 'AMELİYATTA', phone: '4015', roomNo: '204' },
  ];

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
      activeColor,
      isSidebarOpen,
      setIsSidebarOpen,
      setShowSettingsModal,
      setShowTableSettingsModal,
      pageLoading,
      setPageLoading,
      tableSettings,
      updateTableSettings
    }}>
      <div style={fontScaleStyle} className={`min-h-screen transition-colors duration-150 ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        <PageLoader show={pageLoading} />

        {children}

        <RealtimeNotification isDarkMode={isDarkMode} />

        <style jsx global>{`
          @keyframes slideLeftToRight {
            0% { transform: translateX(-100%); opacity: 0; }
            15% { transform: translateX(0); opacity: 1; }
            85% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(120%); opacity: 0; }
          }
          .animate-slide-toast {
            animation: slideLeftToRight 2.5s ease-in-out forwards;
          }
        `}</style>

        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-[300] pointer-events-none overflow-hidden">
            <span className="text-emerald-400 font-extrabold text-sm tracking-wide block animate-slide-toast drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]">
              {toastNotification}
            </span>
          </div>
        )}

        {/* 🚀 Side Menu Drawer */}
        <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto backdrop-blur-md' : 'opacity-0 pointer-events-none backdrop-blur-none'}`}>
          <div className="fixed inset-0 bg-black/60 transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}></div>
          
          <div className={`fixed top-0 left-0 w-84 max-w-[88vw] h-full shadow-2xl flex flex-col justify-between z-10 transition-all duration-300 ease-out border-r backdrop-blur-2xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            isDarkMode 
              ? 'bg-slate-900/95 border-slate-800/80 text-slate-100 shadow-slate-950' 
              : 'bg-white/95 border-slate-200/80 text-slate-900 shadow-slate-300'
          }`}>
            
            {/* Menu Header */}
            <div className={`p-5 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">SİSTEM MENÜSÜ</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hızlı Kontrol Paneli</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className={`w-8 h-8 rounded-xl font-black text-sm transition-all flex items-center justify-center cursor-pointer active:scale-90 ${
                  isDarkMode ? 'bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400' : 'bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-black">
              
              {/* 1. PROFİL */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowProfileModal(true);
                }}
                className={`w-full p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-95 shadow-xs ${
                  isDarkMode 
                    ? 'bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-100' 
                    : 'bg-slate-50/80 border-slate-200/80 hover:border-emerald-500/50 hover:bg-emerald-50/80 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                    <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black tracking-wide uppercase block">PROFİL</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Hesap Ayarları ve Değişiklikler</span>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1 font-mono text-sm">➔</span>
              </button>

              {/* 2. SORUN BİLDİR */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowIssueModal(true);
                }}
                className={`w-full p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-95 shadow-xs ${
                  isDarkMode 
                    ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/15 text-rose-300' 
                    : 'bg-rose-50/60 border-rose-200/80 hover:border-rose-400 hover:bg-rose-100/80 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black tracking-wide uppercase block">SORUN BİLDİR</span>
                    <span className="text-[10px] opacity-70 font-medium block">Hata veya Öneri Gönderin</span>
                  </div>
                </div>
                <span className="opacity-60 group-hover:opacity-100 transition-transform group-hover:translate-x-1 font-mono text-sm">➔</span>
              </button>

              {/* 3. GENEL AYARLAR */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowSettingsModal(true);
                }}
                className={`w-full p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-95 shadow-xs ${
                  isDarkMode 
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/15 text-amber-300' 
                    : 'bg-amber-50/60 border-amber-200/80 hover:border-amber-400 hover:bg-amber-100/80 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <svg className="w-5 h-5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black tracking-wide uppercase block">GENEL AYARLAR</span>
                    <span className="text-[10px] opacity-70 font-medium block">Tema, Font ve Görünüm</span>
                  </div>
                </div>
                <span className="opacity-60 group-hover:opacity-100 transition-transform group-hover:translate-x-1 font-mono text-sm">➔</span>
              </button>

            </div>

            {/* Logout Footer */}
            <div className={`p-4 border-t shrink-0 ${isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200/80 bg-slate-50/50'}`}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-2xl text-xs transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-rose-600/20 active:scale-95 uppercase tracking-wider"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
                </svg>
                <span>ÇIKIŞ YAP</span>
              </button>
            </div>

          </div>
        </div>

        {/* 👤 PROFİL MODAL */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
            <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              
              <div className={`flex justify-between items-center pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xl">👤</div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-500 uppercase tracking-wide">
                      PROFİL VE HESAP YÖNETİMİ
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Kullanıcı Bilgileriniz ve Talepleriniz</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className={`w-9 h-9 rounded-2xl font-black text-base transition-all flex items-center justify-center cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white'}`}>✕</button>
              </div>

              <div className="my-6 space-y-4 font-black">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block font-bold">Kullanıcı Adınız</span>
                    <span className="text-sm font-extrabold text-amber-500">{currentUserData?.username || '-'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase block font-bold">Telefon Numaranız</span>
                    <span className="text-sm font-mono text-emerald-500">{currentUserData?.phone || 'Tanımsız'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setActiveProfileSubModal('USERNAME')}
                    className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all cursor-pointer hover:scale-[1.01] active:scale-95 ${
                      isDarkMode ? 'border-slate-800 bg-slate-950/80 hover:border-amber-400/60' : 'border-slate-200 bg-slate-50 hover:border-amber-500/60'
                    }`}
                  >
                    <span className="text-xs font-black text-amber-500 uppercase tracking-wide">🆔 KULLANICI ADI DEĞİŞTİRME TALEBİ</span>
                    <span className="font-mono text-sm text-slate-400">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileSubModal('PHONE')}
                    className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all cursor-pointer hover:scale-[1.01] active:scale-95 ${
                      isDarkMode ? 'border-slate-800 bg-slate-950/80 hover:border-emerald-400/60' : 'border-slate-200 bg-slate-50 hover:border-emerald-500/60'
                    }`}
                  >
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-wide">📞 TELEFON NUMARASI GÜNCELLE</span>
                    <span className="font-mono text-sm text-slate-400">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileSubModal('PASSWORD')}
                    className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all cursor-pointer hover:scale-[1.01] active:scale-95 ${
                      isDarkMode ? 'border-slate-800 bg-slate-950/80 hover:border-rose-400/60' : 'border-slate-200 bg-slate-50 hover:border-rose-500/60'
                    }`}
                  >
                    <span className="text-xs font-black text-rose-500 uppercase tracking-wide">🔒 ŞİFRE DEĞİŞTİR</span>
                    <span className="font-mono text-sm text-slate-400">➔</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PROFILE SUB MODALS */}
        {activeProfileSubModal === 'USERNAME' && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <h4 className="text-xs font-black text-amber-500 uppercase">🆔 KULLANICI ADI TALEBİ</h4>
                <button onClick={() => setActiveProfileSubModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
              </div>

              <form onSubmit={handleSaveUsernameRequest} className="space-y-4 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">MEVCUT AD</label>
                  <input type="text" disabled value={currentUserData?.username || ''} className={`w-full px-3.5 py-2.5 rounded-xl border font-black uppercase text-xs opacity-60 cursor-not-allowed ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`} />
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-amber-500">YENİ AD TALEBİ</label>
                  <input type="text" required value={editUsernameReq} onChange={(e) => setEditUsernameReq(e.target.value.toLocaleUpperCase('tr-TR'))} placeholder="Yeni kullanıcı adı..." className={`w-full px-3.5 py-2.5 rounded-xl border font-black uppercase text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-amber-400' : 'bg-slate-50 border-slate-300 focus:border-amber-500'}`} />
                </div>

                {usernameStatus && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-[11px] font-bold text-center">
                    {usernameStatus}
                  </div>
                )}

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-95">KAYDET</button>
              </form>
            </div>
          </div>
        )}

        {activeProfileSubModal === 'PHONE' && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <h4 className="text-xs font-black text-emerald-500 uppercase">📞 TELEFON NUMARASI GÜNCELLE</h4>
                <button onClick={() => setActiveProfileSubModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
              </div>

              <form onSubmit={handleSavePhone} className="space-y-4 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">TELEFON NUMARASI</label>
                  <input type="text" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="05XXXXXXXXX" className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 focus:border-emerald-500'}`} />
                </div>

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-95">KAYDET</button>
              </form>
            </div>
          </div>
        )}

        {activeProfileSubModal === 'PASSWORD' && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <h4 className="text-xs font-black text-rose-500 uppercase">🔒 ŞİFRE DEĞİŞTİR</h4>
                <button onClick={() => setActiveProfileSubModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-3 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">ESKİ ŞİFRE</label>
                  <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className={`w-full px-3.5 py-2 rounded-xl border font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-rose-500' : 'bg-slate-50 border-slate-300 focus:border-rose-500'}`} />
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">YENİ ŞİFRE</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={`w-full px-3.5 py-2 rounded-xl border font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-rose-500' : 'bg-slate-50 border-slate-300 focus:border-rose-500'}`} />
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-slate-400">YENİ ŞİFRE (TEKRAR)</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={`w-full px-3.5 py-2 rounded-xl border font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-rose-500' : 'bg-slate-50 border-slate-300 focus:border-rose-500'}`} />
                </div>

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-95">KAYDET</button>
              </form>
            </div>
          </div>
        )}

        {/* 🚨 ISSUE WINDOW */}
        {showIssueModal && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fadeIn">
            <div className={`w-full max-w-5xl h-full max-h-[92vh] rounded-3xl border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              
              <div className={`flex justify-between items-center pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl text-xl">🚨</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-rose-500 uppercase tracking-wide">SORUN BİLDİR</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Sistemle ilgili taleplerinizi veya hataları iletin</p>
                  </div>
                </div>

                <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button onClick={() => setActiveIssueTab('CREATE')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeIssueTab === 'CREATE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>📝 YENİ BİLDİRİM</button>
                  <button onClick={() => setActiveIssueTab('LIST')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeIssueTab === 'LIST' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>📬 TALEPLERİM ({userIssuesList.length})</button>
                </div>

                <button onClick={() => setShowIssueModal(false)} className={`w-9 h-9 rounded-2xl font-black text-base transition-all flex items-center justify-center cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white'}`}>✕</button>
              </div>

              {activeIssueTab === 'CREATE' && (
                <form onSubmit={handleSaveIssue} className="my-6 space-y-5 font-black">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1 text-slate-400">SORUN KATEGORİSİ</label>
                      <select value={issueCategory} onChange={(e) => setIssueCategory(e.target.value)} className={`w-full px-4 py-3 rounded-2xl border font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                        <option value="Sistem / Teknik Hata">Sistem / Teknik Hata</option>
                        <option value="Doktor Planı Yanlışlığı">Doktor Planı Yanlışlığı</option>
                        <option value="Telefon Rehberi Hatalı">Telefon Rehberi Hatalı</option>
                        <option value="Öneri / İstek">Öneri / İstek</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs mb-1 text-slate-400">ACİLİYET DURUMU</label>
                      <select value={issueUrgency} onChange={(e) => setIssueUrgency(e.target.value)} className={`w-full px-4 py-3 rounded-2xl border font-black text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                        <option value="Normal">Normal</option>
                        <option value="Çok Acil">Çok Acil 🚨</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-slate-400">AÇIKLAMA METNİ</label>
                    <textarea rows="4" required value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Yaşadığınız sorunu detaylıca buraya yazınız..." className={`w-full p-4 rounded-2xl border font-sans text-xs outline-none focus:border-rose-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}></textarea>
                  </div>

                  <div>
                    <label className="block text-xs mb-2 text-slate-400">DOSYA / EKLENTİ YÜKLE</label>
                    <div className={`border-2 border-dashed rounded-3xl p-6 text-center relative transition-all ${attachedFile ? 'border-emerald-500 bg-emerald-500/10' : (isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:border-amber-400' : 'border-slate-300 bg-slate-50 hover:border-amber-500')}`}>
                      <input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {attachedFile ? (
                        <div className="flex justify-between items-center px-4 font-mono">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📎</span>
                            <div className="text-left">
                              <p className="text-xs font-black text-emerald-500">{attachedFile.name}</p>
                              <p className="text-[10px] text-slate-400">{attachedFile.size}</p>
                            </div>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }} className="p-2 bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl text-xs cursor-pointer">İPTAL ✕</button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-3xl block">📁</span>
                          <p className={`text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Dosyaları buraya sürükleyin veya seçmek için tıklayın</p>
                          <p className="text-[10px] text-slate-500 font-normal">Görsel, Video, Ses Kaydı veya Doküman (Maksimum 50MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    {editingIssueId && (
                      <button type="button" onClick={() => { setEditingIssueId(null); setIssueDescription(''); setAttachedFile(null); }} className={`px-6 py-4 font-black text-xs rounded-2xl cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>İPTAL</button>
                    )}
                    <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition-all cursor-pointer uppercase tracking-widest active:scale-95">GÖNDER</button>
                  </div>
                </form>
              )}

              {activeIssueTab === 'LIST' && (
                <div className="my-6 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {userIssuesList.length > 0 ? (
                    userIssuesList.map((item) => (
                      <div key={item.id} className={`p-5 border rounded-3xl space-y-3 text-xs font-black transition-all ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 uppercase font-black">{item.category}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${item.urgency === 'Çok Acil' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')}`}>{item.urgency}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold ${item.isRead ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-500 border border-amber-500/40'}`}>{item.isRead ? 'GÖRÜLDÜ 👁️' : 'BEKLEMEDE ⏳'}</span>
                        </div>
                        <p className={`text-xs font-normal font-sans leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.description}</p>
                        {item.file && (
                          <div className={`p-3 border rounded-2xl flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                            <span className="text-[11px] text-emerald-500 font-mono">📎 Eklenti: {item.file.name}</span>
                            <a href={item.file.data} download={item.file.name} className="text-[10px] text-amber-500 hover:underline">İNDİR 📥</a>
                          </div>
                        )}
                        {item.adminReply && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl text-xs font-sans">
                            <strong>Yönetici Yanıtı:</strong> {item.adminReply}
                          </div>
                        )}
                        <div className={`flex justify-between items-center pt-3 border-t text-[10px] font-mono ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
                          <span>Tarih: {item.date}</span>
                          <div className="flex gap-3">
                            {!item.isRead ? (<button onClick={() => handleStartEditIssue(item)} className="text-emerald-500 hover:underline cursor-pointer font-bold">DÜZENLE ✏️</button>) : (<span className="text-slate-500">Okunduğu için kilitlendi</span>)}
                            <button onClick={() => handleDeleteIssue(item.id)} className="text-rose-500 hover:underline cursor-pointer font-bold">SİL 🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-12 border border-dashed rounded-3xl text-center font-bold ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>Henüz gönderilmiş bir bildiriminiz bulunmuyor.</div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* 🚪 Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl text-center space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-xl">🚪</div>
                <h3 className="text-base font-black uppercase tracking-wide">ÇIKIŞ YAPMA TALEBİ</h3>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">Çıkış yapmak istediğinize emin misiniz?</p>
              </div>
              <div className="flex gap-3 pt-2 font-black">
                <button onClick={() => setShowLogoutConfirm(false)} className={`flex-1 py-3 text-xs rounded-2xl transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>İPTAL</button>
                <button onClick={confirmLogout} className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs rounded-2xl shadow-lg transition-all cursor-pointer uppercase active:scale-95">EVET, ÇIKIŞ YAP</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal Component */}
        {showSettingsModal && (
          <SettingsModal onClose={() => { setShowSettingsModal(false); triggerToast('Ayarlar başarıyla kaydedildi'); }} />
        )}

        {/* 🛠️ GELİŞMİŞ TABLO GÖRÜNÜM AYARLARI */}
        {showTableSettingsModal && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
            <div
              className={`w-full max-w-3xl h-full max-h-[92vh] rounded-3xl border p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className={`flex justify-between items-center pb-3 border-b gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowTableSettingsModal(false);
                      setShowSettingsModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer border active:scale-95 ${
                      isDarkMode 
                        ? 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border-amber-500/30' 
                        : 'bg-slate-100 hover:bg-amber-500 hover:text-white text-amber-700 border-amber-500/40'
                    }`}
                    title="Genel Ayarlara Dön"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    <span>GERİ</span>
                  </button>

                  <h3 className="text-sm sm:text-base font-black text-amber-500 uppercase tracking-wider">
                    GELİŞMİŞ TABLO VEYA TEMA AYARLARI
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setShowTableSettingsModal(false);
                    triggerToast('Tablo ayarları güncellendi');
                  }}
                  className={`w-8 h-8 rounded-xl font-black text-sm transition-all flex items-center justify-center cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-4 font-black text-xs">
                
                {/* 1. RENK TEMA SEÇİMİ */}
                <div className={`p-4 rounded-2xl border flex justify-between items-center gap-3 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <label className="block text-xs font-black text-amber-500 uppercase tracking-wider">
                      🎨 RENK TEMA SEÇİMİ
                    </label>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      Mevcut Tema: <span className="font-bold text-emerald-400">{colorPalettes[selectedPalette]?.label}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColorModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 uppercase"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30 block" style={{ backgroundColor: colorPalettes[selectedPalette]?.colorCode }}></span>
                    <span>TÜM RENKLERİ GÖR ({Object.keys(colorPalettes).length}) ➔</span>
                  </button>
                </div>

                {/* 2. YAZI TİPİ SEÇİMİ */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <label className="block text-xs font-black text-amber-500 uppercase tracking-wider mb-2">
                    🔤 YAZI TİPİ SEÇİMİ (SEÇENEKLİ LİSTE)
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => changeFont(e.target.value)}
                    className={`w-full p-3 rounded-xl border font-bold text-xs outline-none cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  >
                    {fontOptions.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. YAZI KALINLIĞI, GÖLGESİ VEYA HARF ARALIĞI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="block text-[11px] font-black text-amber-500 uppercase tracking-wider mb-2">
                      💪 YAZI KALINLIĞI
                    </label>
                    <select
                      value={tableSettings.fontWeight}
                      onChange={(e) => updateTableSettings({ fontWeight: e.target.value })}
                      className={`w-full p-2 rounded-xl border font-bold text-xs outline-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="font-normal">Normal (Standart)</option>
                      <option value="font-semibold">Yarı Kalın (Semibold)</option>
                      <option value="font-bold">Kalın (Bold)</option>
                      <option value="font-black">Çok Kalın (Extra Black)</option>
                    </select>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="block text-[11px] font-black text-amber-500 uppercase tracking-wider mb-2">
                      ✨ YAZI GÖLGESİ / EFEKT
                    </label>
                    <select
                      value={tableSettings.textShadow}
                      onChange={(e) => updateTableSettings({ textShadow: e.target.value })}
                      className={`w-full p-2 rounded-xl border font-bold text-xs outline-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="none">Gölgesiz (Düz)</option>
                      <option value="soft">Hafif Gölge (Soft)</option>
                      <option value="strong">Belirgin Koyu Gölge</option>
                      <option value="glow">Neon Işıltısı (Glow)</option>
                    </select>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="block text-[11px] font-black text-amber-500 uppercase tracking-wider mb-2">
                      ↔️ HARF ARALIĞI
                    </label>
                    <select
                      value={tableSettings.letterSpacing}
                      onChange={(e) => updateTableSettings({ letterSpacing: e.target.value })}
                      className={`w-full p-2 rounded-xl border font-bold text-xs outline-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="tracking-tighter">Çok Sıkı</option>
                      <option value="tracking-normal">Normal Aralık</option>
                      <option value="tracking-wide">Geniş Harf</option>
                      <option value="tracking-widest">Çok Geniş Harf</option>
                    </select>
                  </div>
                </div>

                {/* 4. SÜTUN GÖRÜNÜRLÜKLERİ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="block text-[11px] font-black text-amber-500 uppercase tracking-wider mb-2">
                      👁️ SÜTUN GÖRÜNÜRLÜKLERİ
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'showClinic', label: 'BİRİM' },
                        { id: 'showDoctorName', label: 'DOKTOR' },
                        { id: 'showStatus', label: 'DURUM' },
                        { id: 'showPhone', label: 'TEL' },
                        { id: 'showRoomNo', label: 'ODA' },
                      ].map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => updateTableSettings({ [col.id]: !tableSettings[col.id] })}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            tableSettings[col.id]
                              ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                              : (isDarkMode ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-white text-slate-400 border-slate-200')
                          }`}
                        >
                          {col.label} {tableSettings[col.id] ? '✓' : '✕'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="block text-[11px] font-black text-amber-500 uppercase tracking-wider mb-2">
                      📐 IZGARA VE SATIR STİLİ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={tableSettings.borderStyle}
                        onChange={(e) => updateTableSettings({ borderStyle: e.target.value })}
                        className={`p-2 rounded-xl border font-bold text-xs outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="horizontal">Yatay Çizgili</option>
                        <option value="grid">Tam Izgara</option>
                        <option value="none">Çizgisiz</option>
                      </select>

                      <select
                        value={tableSettings.rowPadding}
                        onChange={(e) => updateTableSettings({ rowPadding: e.target.value })}
                        className={`p-2 rounded-xl border font-bold text-xs outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="compact">Sıkı Yükseklik</option>
                        <option value="normal">Normal Yükseklik</option>
                        <option value="spacious">Geniş Yükseklik</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CANLI CANLI MÜKEMMEL TABLO ÖNİZLEMESİ */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-amber-500 uppercase flex items-center gap-1.5">
                      <span>🖥️</span> CANLI CANLI MÜKEMMEL TABLO ÖNİZLEMESİ
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${activeColor}`}>
                      Aktif Renk: {colorPalettes[selectedPalette]?.label}
                    </span>
                  </div>

                  <div className={`w-full rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                    <table className={`w-full text-left border-collapse text-xs ${selectedFont} ${tableSettings.fontWeight} ${getShadowClass()} ${tableSettings.letterSpacing}`}>
                      <thead>
                        <tr className={`uppercase ${isDarkMode ? 'bg-slate-800/90 text-amber-400 border-b border-slate-700' : 'bg-slate-200 text-slate-800 border-b border-slate-300'}`}>
                          {tableSettings.showClinic && <th className="p-2.5">BİRİM</th>}
                          {tableSettings.showDoctorName && <th className="p-2.5">DOKTOR ADI</th>}
                          {tableSettings.showStatus && <th className="p-2.5 text-center">DURUM</th>}
                          {tableSettings.showPhone && <th className="p-2.5">DAHİLİ TEL</th>}
                          {tableSettings.showRoomNo && <th className="p-2.5">ODA NO</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {sampleDoctors.map((doc, idx) => (
                          <tr key={idx} className={`border-b ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                            {tableSettings.showClinic && <td className={`p-2.5 ${activeColor}`}>{doc.clinic}</td>}
                            {tableSettings.showDoctorName && <td className="p-2.5">{doc.name}</td>}
                            {tableSettings.showStatus && (
                              <td className="p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                  doc.status === 'POLİKLİNİK' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                }`}>
                                  {doc.status}
                                </span>
                              </td>
                            )}
                            {tableSettings.showPhone && <td className="p-2.5 font-mono">{doc.phone}</td>}
                            {tableSettings.showRoomNo && <td className="p-2.5 font-mono">{doc.roomNo}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* AYARLARI KAYDET VE KAPAT */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTableSettingsModal(false);
                    triggerToast('Tablo ayarları güncellendi');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-95"
                >
                  AYARLARI KAYDET VE KAPAT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TÜM RENK TEMALARI */}
        {showColorModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className={`w-full max-w-2xl rounded-3xl border p-5 shadow-2xl flex flex-col justify-between max-h-[85vh] ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <h4 className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-wider">
                  🎨 TÜM RENK TEMALARI ({Object.keys(colorPalettes).length} RENK SEÇENEĞİ)
                </h4>
                <button
                  onClick={() => setShowColorModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-black text-sm flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 overflow-y-auto p-1 pr-2 max-h-[60vh]">
                {Object.keys(colorPalettes).map((key) => {
                  const item = colorPalettes[key];
                  const isSelected = selectedPalette === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        changePalette(key);
                        setShowColorModal(false);
                      }}
                      className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
                        isSelected 
                          ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-md' 
                          : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300')
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full shadow-inner block border border-white/30" style={{ backgroundColor: item.colorCode }}></span>
                      <span className="truncate w-full text-[11px] font-black">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className={`pt-3 border-t text-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black rounded-xl text-xs cursor-pointer uppercase tracking-wider"
                >
                  KAPAT
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);