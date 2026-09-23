'use client'; 

import { useState, useEffect, useRef, useCallback, memo } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const TURKEY_OFFICIAL_HOLIDAYS_2026 = {   
  '2026-01-01': 'Yılbaşı',
  '2026-03-20': 'Ramazan Bayramı Arifesi',
  '2026-03-21': 'Ramazan Bayramı 1. Gün',
  '2026-03-22': 'Ramazan Bayramı 2. Gün',
  '2026-03-23': 'Ramazan Bayramı 3. Gün',
  '2026-04-23': 'Ulusal Egemenlik ve Çocuk Bayramı',
  '2026-05-01': 'Emek ve Dayanışma Günü',
  '2026-05-19': 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
  '2026-05-26': 'Kurban Bayramı Arifesi',
  '2026-05-27': 'Kurban Bayramı 1. Gün',
  '2026-05-28': 'Kurban Bayramı 2. Gün',
  '2026-05-29': 'Kurban Bayramı 3. Gün',
  '2026-05-30': 'Kurban Bayramı 4. Gün',
  '2026-07-15': 'Demokrasi ve Milli Birlik Günü',
  '2026-08-30': 'Zafer Bayramı',
  '2026-10-29': 'Cumhuriyet Bayramı' 
};

const generateFullMonthSchedule = (year = 2026, month = 8) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayNum = String(i).padStart(2, '0');
    const monthNum = String(month + 1).padStart(2, '0');
    const isoDateStr = `${year}-${monthNum}-${dayNum}`;
    const dateObj = new Date(year, month, i);
    const dayIndex = dateObj.getDay();
    const dayName = dayNames[dayIndex];
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const holidayName = TURKEY_OFFICIAL_HOLIDAYS_2026[isoDateStr];

    let initialStatus = 'POLİKLİNİK';
    if (holidayName) {
      initialStatus = 'RESMİ TATİL';
    } else if (isWeekend) {
      initialStatus = 'HAFTA SONU';
    }

    days.push({
      dayNumber: i,
      fullDateObj: dateObj.toISOString(),
      date: `${dayNum}.${monthNum}.${year}`,
      day: dayName,
      status: initialStatus,
      holidayName: holidayName || null
    });
  }
  return days;
};

const parseItemDate = (item) => {
  if (!item) return null;
  if (typeof item.date === 'string' && item.date.includes('.')) {
    const parts = item.date.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  if (item.fullDateObj) {
    const d = new Date(item.fullDateObj);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const getStatusStyles = (status, contrast = 'high', isPast = false) => {
  if (isPast) {
    return 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600 font-black';
  }

  const colorMap = {
    'POLİKLİNİK': 'bg-emerald-600 text-white border-emerald-500 font-black shadow-xs',
    'POLİK': 'bg-emerald-600 text-white border-emerald-500 font-black shadow-xs',
    'AMELİYATTA': 'bg-purple-700 text-white border-purple-500 font-black shadow-xs',
    'YILLIK İZİN': 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs',
    'RAPORLU': 'bg-rose-600 text-white border-rose-500 font-black shadow-xs',
    'NÖBET SONRASI İZİN': 'bg-sky-600 text-white border-sky-400 font-black shadow-xs',
    'RESMİ TATİL': 'bg-indigo-700 text-white border-indigo-500 font-black shadow-xs',
    'HAFTA SONU': 'bg-rose-600 text-white border-rose-600 font-black shadow-xs',
    'ASKERLİK': 'bg-slate-800 text-slate-100 border-slate-600 font-black shadow-xs',
    'ŞUA İZNİ': 'bg-teal-600 text-white border-teal-500 font-black shadow-xs',
    'KONGRE/SEMİNER': 'bg-blue-600 text-white border-blue-500 font-black shadow-xs'
  };
  return colorMap[status] || 'bg-emerald-600 text-white border-emerald-500 font-black';
};

const getDateTextColor = (status, dayName, isPast, isDarkMode) => {
  if (isPast) {
    return isDarkMode ? 'text-slate-300 font-extrabold' : 'text-slate-700 font-extrabold';
  }

  if (dayName === 'CUMARTESİ' || dayName === 'PAZAR' || status === 'HAFTA SONU') {
    return 'text-rose-600 dark:text-rose-400 font-black';
  }

  const textColors = {
    'POLİKLİNİK': 'text-emerald-600 dark:text-emerald-400 font-black',
    'POLİK': 'text-emerald-600 dark:text-emerald-400 font-black',
    'AMELİYATTA': 'text-purple-600 dark:text-purple-400 font-black',
    'YILLIK İZİN': 'text-amber-600 dark:text-amber-400 font-black',
    'RAPORLU': 'text-rose-600 dark:text-rose-400 font-black',
    'NÖBET SONRASI İZİN': 'text-sky-600 dark:text-sky-400 font-black',
    'RESMİ TATİL': 'text-indigo-600 dark:text-indigo-400 font-black',
    'ASKERLİK': 'text-slate-600 dark:text-slate-300 font-black',
    'ŞUA İZNİ': 'text-teal-600 dark:text-teal-400 font-black',
    'KONGRE/SEMİNER': 'text-blue-600 dark:text-blue-400 font-black'
  };

  return textColors[status] || (isDarkMode ? 'text-slate-100 font-black' : 'text-slate-950 font-black');
};

export default function SchedulePage() {   
  const { doctors: rawDoctors } = useData(); 
  const [filter, setFilter] = useState('HEPSİ');   
  const [searchTerm, setSearchTerm] = useState('');   
  const [sortBy, setSortBy] = useState('NEWEST');   
  const [doctors, setDoctors] = useState([]);   
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState(null);   
  const [editingDoctor, setEditingDoctor] = useState(null);   
  const [deletingDoctorId, setDeletingDoctorId] = useState(null);   
  const [currentUser, setCurrentUser] = useState(null);   
  const [isMaximized, setIsMaximized] = useState(false);   
  const [isMinimized, setIsMinimized] = useState(false);   
  const [showPrintModal, setShowPrintModal] = useState(false);   
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const todayRef = useRef(null);   
  const modalBoxRef = useRef(null);
  
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const {      
    isDarkMode,      
    toggleTheme,
    setIsSidebarOpen,      
    selectedFont,      
    zoomScale,      
    activeColor,
    tableSettings = { 
      showClinic: true, 
      showDoctorName: true, 
      showStatus: true, 
      showPhone: true, 
      showRoomNo: true, 
      borderStyle: 'horizontal', 
      rowPadding: 'normal', 
      fontWeight: 'font-bold'
    }
  } = useTheme();   
  const router = useRouter();   

  const today = useRef(new Date());
  today.current.setHours(0, 0, 0, 0);
  const todayFormattedStr = `${String(today.current.getDate()).padStart(2, '0')}.${String(today.current.getMonth() + 1).padStart(2, '0')}.${today.current.getFullYear()}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {     
    const isModalActive = showPrintModal || (selectedDoctorDetail && !isMinimized) || editingDoctor || deletingDoctorId;     
    document.body.style.overflow = isModalActive ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };   
  }, [showPrintModal, selectedDoctorDetail, isMinimized, editingDoctor, deletingDoctorId]);   

  useEffect(() => {     
    if (selectedDoctorDetail && !isMinimized) {       
      requestAnimationFrame(() => {
        if (todayRef.current) {
          todayRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });         
        }
      });
    }   
  }, [selectedDoctorDetail, isMinimized]);   

  const getCurrentDayStatus = useCallback((doc) => {
    if (!doc.scheduleDays || doc.scheduleDays.length === 0) return doc.status || 'POLİKLİNİK';
    const todaySchedule = doc.scheduleDays.find(sd => sd.date === todayFormattedStr);
    if (todaySchedule) {
      return todaySchedule.status === 'POLİK' ? 'POLİKLİNİK' : todaySchedule.status;
    }
    const dayIndex = today.current.getDay();
    if (dayIndex === 0 || dayIndex === 6) return 'HAFTA SONU';
    return doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status;
  }, [todayFormattedStr]);

  useEffect(() => {     
    const sessionUser = sessionStorage.getItem('user');     
    const localUser = localStorage.getItem('user');     
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});     
    setCurrentUser(activeUser);     

    const savedSort = localStorage.getItem('app_table_sort');     
    if (savedSort) setSortBy(savedSort);   
  }, []);

  useEffect(() => {
    if (rawDoctors && rawDoctors.length > 0) {
      const normalizedDocs = rawDoctors.map(doc => {
        const updatedDays = doc.scheduleDays ? doc.scheduleDays.map(sd => {
          let dayObj = parseItemDate(sd);
          if (dayObj) {
            const dayIdx = dayObj.getDay();
            if ((dayIdx === 0 || dayIdx === 6) && (sd.status === 'POLİK' || sd.status === 'POLİKLİNİK')) {
              return { ...sd, status: 'HAFTA SONU' };
            }
          }
          return { ...sd, status: sd.status === 'POLİK' ? 'POLİKLİNİK' : sd.status };
        }) : generateFullMonthSchedule(2026, 8);

        return {
          ...doc,
          status: doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status,
          scheduleDays: updatedDays
        };
      });
      setDoctors(normalizedDocs);
    } else {
      setDoctors([]);
    }
  }, [rawDoctors]);

  const handleOpenDoctorDetail = (doc) => {     
    setSelectedDoctorDetail(doc);     
    setIsMinimized(false);     
    setIsMaximized(false);     
  };   

  const handleSortChange = (newSort) => {     
    setSortBy(newSort);     
    localStorage.setItem('app_table_sort', newSort);   
  };   

  const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
  const isAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ';   

  const filteredAndSortedDoctors = doctors     
    .filter((doc) => {       
      const currentStatus = getCurrentDayStatus(doc);
      const matchesFilter = filter === 'HEPSİ' || currentStatus === filter || (filter === 'POLİKLİNİK' && (currentStatus === 'POLİKLİNİK' || currentStatus === 'POLİK'));       
      const matchesSearch = doc.name.toUpperCase().includes(searchTerm.toUpperCase()) || doc.clinic.toUpperCase().includes(searchTerm.toUpperCase());       
      return matchesFilter && matchesSearch;     
    })     
    .sort((a, b) => {       
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name, 'tr');       
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name, 'tr');       
      if (sortBy === 'CLINIC_ASC') return a.clinic.localeCompare(b.clinic, 'tr');       
      if (sortBy === 'NEWEST') return (b.createdAt || b.id) - (a.createdAt || a.id);       
      if (sortBy === 'OLDEST') return (a.createdAt || a.id) - (b.createdAt || b.id);       
      return 0;     
    });   

  const handleDeleteDoctorConfirm = async () => {     
    if (!deletingDoctorId) return;     
    try {
      await deleteDoc(doc(db, 'doctors', deletingDoctorId));
      setDeletingDoctorId(null);
    } catch (e) {
      console.error('Silme hatası:', e);
    }   
  };   

  const handleSaveEditedDoctor = async (e) => {     
    e.preventDefault();     
    if (!editingDoctor) return;     
    try {
      await updateDoc(doc(db, 'doctors', editingDoctor.id), editingDoctor);
      setEditingDoctor(null);
    } catch (e) {
      console.error('Güncelleme hatası:', e);
    }   
  };   

  const exportToExcel = () => {     
    let tableCSV = 'BİRİM;DOKTOR ADI SOYADI;DURUM;DAHİLİ TEL;ODA NO\n';     
    filteredAndSortedDoctors.forEach((doc) => {       
      const currentStatus = getCurrentDayStatus(doc);
      tableCSV += `"${doc.clinic}";"${doc.name}";"${currentStatus}";"${doc.dahili}";"${doc.roomNo || '101'}"\n`;     
    });     
    const blob = new Blob(['\uFEFF' + tableCSV], { type: 'text/csv;charset=utf-8;' });     
    const url = URL.createObjectURL(blob);     
    const a = document.createElement('a');     
    a.href = url;     
    a.download = `Doktor_Calisma_Listesi_${todayFormattedStr.replace(/\./g, '_')}.csv`;     
    a.click();   
  };

  const getBorderClass = () => {
    if (tableSettings.borderStyle === 'none') return '';
    if (tableSettings.borderStyle === 'grid') return 'border-r border-slate-200 dark:border-slate-800/80';
    return 'border-r border-slate-200/60 dark:border-slate-800/60';
  };

  const getRowPaddingClass = () => {
    if (tableSettings.rowPadding === 'compact') return 'py-1.5 px-3';
    if (tableSettings.rowPadding === 'spacious') return 'py-4 px-5';
    return 'py-2.5 px-4';
  };

  const statusFilterList = [
    { label: 'HEPSİ', key: 'HEPSİ' },
    { label: 'POLİKLİNİK', key: 'POLİKLİNİK' },
    { label: 'AMELİYATTA', key: 'AMELİYATTA' },
    { label: 'YILLIK İZİN', key: 'YILLIK İZİN' },
    { label: 'RAPORLU', key: 'RAPORLU' },
    { label: 'NÖBET SONRASI İZİN', key: 'NÖBET SONRASI İZİN' },
  ];

  const sortOptionsList = [
    { label: 'En Yeni Eklenenler', key: 'NEWEST' },
    { label: 'En Eski Eklenenler', key: 'OLDEST' },
    { label: 'Doktor Adına Göre (A-Z)', key: 'NAME_ASC' },
    { label: 'Doktor Adına Göre (Z-A)', key: 'NAME_DESC' },
    { label: 'Bölüme Göre (A-Z)', key: 'CLINIC_ASC' },
  ];

  const getSortLabel = (key) => {
    const found = sortOptionsList.find(item => item.key === key);
    return found ? found.label : 'Sıralama';
  };

  return (     
    <div dir="ltr" style={{ zoom: `${zoomScale}%` }} className={`min-h-screen transition-colors duration-300 p-2 sm:p-3 lg:p-4 relative ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>              
      
      {/* 🖨️ PRINT STYLES */}
      <style jsx global>{`         
        @media print {           
          body * { visibility: hidden !important; }           
          #printableA4Area, #printableA4Area * { visibility: visible !important; }           
          #printableA4Area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }           
        }       
      `}</style>

      <div className="w-full max-w-full mx-auto space-y-3">                  
        
        {/* 🌟 HEADER */}
        <div 
          style={{ willChange: 'transform' }}
          className={`no-print sticky top-1 z-50 rounded-2xl py-2 px-3 shadow-md backdrop-blur-md transition-none ${
            isDarkMode ? 'bg-slate-900/90 shadow-slate-950/40' : 'bg-white/95 shadow-slate-200/60'
          }`}
        >                      
          
          <div className="flex flex-row items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">                          
            
            {/* 📍 أقصى اليسار: زر العودة (تم تحسين الألوان لتصبح شديدة الوضوح للوضعين) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => router.push('/dashboard')}
                className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-90 flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-400 hover:bg-amber-400 hover:text-slate-950 shadow-xs' 
                    : 'bg-slate-200/80 border-slate-300 text-slate-900 hover:bg-slate-900 hover:text-white shadow-xs'
                }`}
                title="Ana Sayfaya Dön"
              >
                <svg className="w-5 h-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            </div>

            {/* 📍 الوسط: حقل البحث */}
            <div className="relative flex-1 min-w-[150px] max-w-full sm:max-w-xs mx-1">               
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input                 
                type="text"                 
                placeholder="Doktor veya Birim Ara..."                 
                value={searchTerm}                 
                onChange={(e) => setSearchTerm(e.target.value)}                 
                className={`w-full pl-8 pr-7 py-1.5 rounded-xl text-xs font-extrabold focus:outline-none border-0 ${                   
                  isDarkMode                      
                    ? 'bg-slate-950/80 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-400/30'                      
                    : 'bg-slate-100/90 text-slate-900 placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-amber-500/30 shadow-inner'                 
                }`}               
              />             

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-rose-500 font-black text-[11px] cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 📍 أقصى اليمين: الأزرار */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* 🌙 / ☀️ زر الوضع الليلي/النهاري */}
              <button
                onClick={toggleTheme}
                className={`p-1 rounded-xl cursor-pointer flex items-center justify-center active:scale-90 ${
                  isDarkMode 
                    ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10' 
                    : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50'
                }`}
                title={isDarkMode ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" className="fill-amber-400" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l-1.414-1.414M6.05 6.05L4.636 4.636" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" className="fill-indigo-600" />
                  </svg>
                )}
              </button>

              <div className="h-4 w-[1.5px] bg-slate-300/60 dark:bg-slate-700/60 rounded-full"></div>

              {/* 1. 🎯 DURUM */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}
                  className={`font-black text-xs cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isDarkMode ? 'text-amber-400' : 'text-slate-800'
                  }`}
                  title="Durum Seç"
                >
                  <span className="font-extrabold uppercase tracking-tight">{filter}</span>
                  <svg className="w-3 h-3 stroke-[2.5] opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFilterDropdown && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl z-50 animate-fadeIn backdrop-blur-2xl ${
                    isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-center pb-1.5 px-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-black text-amber-500 uppercase">DURUM SEÇİN</span>
                      <button onClick={() => setShowFilterDropdown(false)} className="w-4 h-4 rounded-full bg-slate-800/20 hover:bg-rose-500 hover:text-white font-black text-[10px] flex items-center justify-center">✕</button>
                    </div>
                    <div className="space-y-1 mt-1.5 font-black">
                      {statusFilterList.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => {
                            setFilter(item.key);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                            filter === item.key
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : isDarkMode
                              ? 'hover:bg-slate-800/80 text-slate-300'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span>{item.label}</span>
                          {filter === item.key && <span className="font-mono text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-[1.5px] bg-slate-300/60 dark:bg-slate-700/60 rounded-full"></div>

              {/* 2. ↕️ SIRALAMA */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}
                  className={`font-black text-xs cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isDarkMode ? 'text-amber-400' : 'text-slate-800'
                  }`}
                  title="Sıralama / Filtreleme"
                >
                  <span className="font-extrabold uppercase tracking-tight">{getSortLabel(sortBy)}</span>
                  <svg className="w-3 h-3 stroke-[2.5] opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSortDropdown && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 animate-fadeIn backdrop-blur-2xl ${
                    isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-center pb-1.5 px-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-black text-amber-500 uppercase">SIRALAMA SEÇENEKLERİ</span>
                      <button onClick={() => setShowSortDropdown(false)} className="w-4 h-4 rounded-full bg-slate-800/20 hover:bg-rose-500 hover:text-white font-black text-[10px] flex items-center justify-center">✕</button>
                    </div>
                    <div className="space-y-1 mt-1.5 font-black">
                      {sortOptionsList.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => {
                            handleSortChange(item.key);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                            sortBy === item.key
                              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                              : isDarkMode
                              ? 'hover:bg-slate-800/80 text-slate-300'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span>{item.label}</span>
                          {sortBy === item.key && <span className="font-mono text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-[1.5px] bg-slate-300/60 dark:bg-slate-700/60 rounded-full"></div>

              {/* 3. 📥 PRINT BUTTON */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className={`p-1 flex items-center justify-center cursor-pointer active:scale-90 ${
                    isDarkMode ? 'text-amber-400' : 'text-slate-800'
                  }`}
                  title="İndir / Yazdır"
                >
                  <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                  </svg>
                </button>
              </div>

              {/* 4. ☰ MENÜ */}
              <button
                onClick={() => setIsSidebarOpen && setIsSidebarOpen(true)}
                className={`px-2 py-1 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-950/80 text-emerald-400 hover:bg-slate-800' 
                    : 'bg-slate-100/90 text-emerald-800 hover:bg-slate-200'
                }`}
                title="Menü"
              >
                <span className="text-xs">☰</span>
                <span className="hidden md:inline">MENÜ</span>
              </button>

            </div>

          </div>         
        </div>         

        {/* 📊 الجدول الرئيسي */}         
        <div className={`w-full rounded-3xl overflow-hidden shadow-2xl border ${           
          isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/80' : 'bg-white border-slate-200 shadow-slate-200/50'         
        }`}>           
          <div className="overflow-x-auto w-full relative">             
            <table className={`w-full min-w-full text-left border-collapse ${selectedFont} ${tableSettings.fontWeight}`}>               
              
              <thead className="sticky top-0 z-20 shadow-sm">                 
                <tr className={`text-xs sm:text-sm font-black uppercase select-none ${
                  tableSettings.borderStyle !== 'none' ? 'border-b-2' : ''
                } ${                   
                  isDarkMode                      
                    ? 'bg-slate-950 text-amber-400 border-slate-800'                      
                    : 'bg-slate-200 text-slate-950 border-slate-300'                 
                }`}>                   
                  {tableSettings.showClinic && (
                    <th className={`${getRowPaddingClass()} ${getBorderClass()} font-black`}>BİRİM</th>                   
                  )}

                  {tableSettings.showDoctorName && (
                    <th className={`${getRowPaddingClass()} ${getBorderClass()} font-black`}>DOKTOR ADI SOYADI</th>                   
                  )}

                  {tableSettings.showStatus && (
                    <th className={`${getRowPaddingClass()} ${getBorderClass()} font-black text-center`}>DURUM</th>                   
                  )}

                  {tableSettings.showPhone && (
                    <th className={`${getRowPaddingClass()} ${getBorderClass()} font-black`}>DAHİLİ TEL</th>                   
                  )}

                  {tableSettings.showRoomNo && (
                    <th className={`${getRowPaddingClass()} ${isAdmin ? getBorderClass() : ''} font-black`}>ODA NO</th>                   
                  )}

                  {isAdmin && <th className={`${getRowPaddingClass()} text-center font-black`}>İŞLEMLER</th>}                 
                </tr>               
              </thead>               
              
              <tbody className={`text-xs sm:text-sm md:text-base font-black ${activeColor}`}>                 
                {filteredAndSortedDoctors.length > 0 ? (                   
                  filteredAndSortedDoctors.map((doc, index) => {
                    const activeStatusToday = getCurrentDayStatus(doc);
                    return (                     
                      <tr                        
                        key={doc.id}                        
                        onClick={() => handleOpenDoctorDetail(doc)}
                        className={`cursor-pointer ${
                          tableSettings.borderStyle !== 'none' ? 'border-b border-slate-200/70 dark:border-slate-800/60' : ''
                        } ${                         
                          isDarkMode                            
                            ? index % 2 === 0                              
                              ? 'bg-slate-900/60 hover:bg-slate-800/80'                              
                              : 'bg-slate-950/40 hover:bg-slate-800/80'                           
                            : index % 2 === 0                              
                              ? 'bg-white hover:bg-emerald-100/60'                              
                              : 'bg-slate-50 hover:bg-emerald-100/60'                       
                        }`}                     
                      >                       
                        {/* 1. Birim */}
                        {tableSettings.showClinic && (
                          <td className={`${getRowPaddingClass()} ${getBorderClass()} font-black ${activeColor}`}>                         
                            <span>{doc.clinic}</span>                       
                          </td>                       
                        )}

                        {/* 2. Doktor Adı */}
                        {tableSettings.showDoctorName && (
                          <td className={`${getRowPaddingClass()} ${getBorderClass()} font-black ${activeColor}`}>                         
                            <span className="font-extrabold">{doc.name}</span>                       
                          </td>                       
                        )}

                        {/* 3. Durum */}
                        {tableSettings.showStatus && (
                          <td className={`${getRowPaddingClass()} ${getBorderClass()} text-center`}>                         
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center justify-center w-36 h-8 rounded-xl text-xs font-black border-2 ${getStatusStyles(activeStatusToday, 'high')}`}>                           
                                <span className="w-2 h-2 rounded-full bg-current mr-1.5 animate-pulse shrink-0"></span>                           
                                <span className="truncate">{activeStatusToday}</span>
                              </span>                       
                            </div>
                          </td>                       
                        )}

                        {/* 4. Dahili Tel */}
                        {tableSettings.showPhone && (
                          <td className={`${getRowPaddingClass()} ${getBorderClass()} font-black text-sm sm:text-base font-mono ${activeColor}`}>                         
                            {doc.dahili}                       
                          </td>                       
                        )}

                        {/* 5. Oda No */}
                        {tableSettings.showRoomNo && (
                          <td className={`${getRowPaddingClass()} font-mono ${activeColor} ${isAdmin ? getBorderClass() : ''}`}>                         
                            {doc.roomNo || '101'}                       
                          </td>                       
                        )}

                        {/* 6. İşlemler */}
                        {isAdmin && (                         
                          <td className={`${getRowPaddingClass()} text-center`}>                           
                            <div className="flex justify-center items-center gap-1.5">                             
                              <button                               
                                onClick={(e) => { e.stopPropagation(); setEditingDoctor(doc); }}                               
                                className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer shadow-xs active:scale-95"                             
                              >                               
                                DÜZENLE                              
                              </button>                             
                              <button                               
                                onClick={(e) => { e.stopPropagation(); setDeletingDoctorId(doc.id); }}                               
                                className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] sm:text-xs font-black cursor-pointer shadow-xs active:scale-95"                             
                              >                               
                                SİL                             
                              </button>                           
                            </div>                         
                          </td>                       
                        )}                     
                      </tr>                   
                    );
                  })                 
                ) : (                   
                  <tr>                     
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-black border-dashed text-base">                         
                      Arama kriterlerinize uygun doktor kaydı bulunamadı.                     
                    </td>                   
                  </tr>                 
                )}               
              </tbody>             
            </table>           
          </div>           
          <div className="p-3 pr-6 flex justify-end items-center border-t border-slate-200 dark:border-slate-800/60">             
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase">               
              TOPLAM: {filteredAndSortedDoctors.length} DOKTOR             
            </span>           
          </div>         
        </div>       
      </div>       

      {/* ✏️ MODAL: Düzenleme */}
      {editingDoctor && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <h3 className="text-base sm:text-lg font-black text-amber-500 uppercase">DOKTOR BİLGİLERİNİ DÜZENLE</h3>
              <button onClick={() => setEditingDoctor(null)} className="text-slate-400 hover:text-rose-500 font-black text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveEditedDoctor} className="space-y-4 mt-4 font-black">
              <div>
                <label className="text-xs text-slate-400">DOKTOR ADI SOYADI</label>
                <input
                  type="text"
                  value={editingDoctor.name || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className={`w-full mt-1 p-3 rounded-2xl text-xs border font-black ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">BİRİM / POLİKLİNİK</label>
                <input
                  type="text"
                  value={editingDoctor.clinic || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value })}
                  className={`w-full mt-1 p-3 rounded-2xl text-xs border font-black ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">DAHİLİ TEL</label>
                  <input
                    type="text"
                    value={editingDoctor.dahili || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, dahili: e.target.value })}
                    className={`w-full mt-1 p-3 rounded-2xl text-xs border font-black ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">ODA NO</label>
                  <input
                    type="text"
                    value={editingDoctor.roomNo || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNo: e.target.value })}
                    className={`w-full mt-1 p-3 rounded-2xl text-xs border font-black ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingDoctor(null)} className="px-4 py-2.5 rounded-2xl bg-slate-700/50 text-slate-300 text-xs font-black">İPTAL</button>
                <button type="submit" className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-md hover:bg-emerald-500">KAYDET</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL: Silme Onayı */}
      {deletingDoctorId && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-base sm:text-lg font-black text-rose-500 uppercase">DOKTOR SİLİNSİN Mİ?</h3>
            <p className="text-xs text-slate-400 mt-2 font-bold">Bu doktor kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end gap-2 pt-6 font-black">
              <button onClick={() => setDeletingDoctorId(null)} className="px-4 py-2.5 rounded-2xl bg-slate-700/50 text-slate-300 text-xs">İPTAL</button>
              <button onClick={handleDeleteDoctorConfirm} className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white text-xs shadow-md hover:bg-rose-500">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* 📥 Printable A4 Modal */}       
      {showPrintModal && (         
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-3 backdrop-blur-xs animate-fadeIn">           
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-300">             
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 gap-2">               
              <div className="flex items-center gap-2">                 
                <span className="text-2xl">🖨️</span>                
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">                   
                  DOKTOR ÇALIŞMA LİSTESİ İNDİR VE YAZDIR                
                </h2>               
              </div>               
              <div className="flex items-center gap-2">                 
                <button onClick={exportToExcel} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5">                   
                  <span>📊</span> EXCEL İNDİR                 
                </button>                 
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5">                   
                  <span>🖨️</span> YAZDIR / PDF               
                </button>                 
                <button onClick={() => setShowPrintModal(false)} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs cursor-pointer">                   
                  ✕                
                </button>               
              </div>             
            </div>             

            <div id="printableA4Area" className="p-4 bg-white text-slate-950 font-sans leading-tight">               
              <div className="flex justify-between items-end mb-4 pb-2 border-b-2 border-slate-900">                 
                <div>                   
                  <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase">                     
                    Doktor Çalışma Çizelgesi Listesi                   
                  </h1>                 
                </div>                 
                <div className="text-right font-black font-mono text-xs text-slate-800">                   
                  <span>Tarih: {todayFormattedStr}</span>                 
                </div>               
              </div>               

              <div className="w-full">                 
                <table className="w-full text-left border-collapse text-xs">                   
                  <thead>                     
                    <tr className="bg-slate-900 text-white font-black uppercase text-[11px] border-b-2 border-slate-900">                       
                      <th className="py-2 px-2.5 border-r border-slate-700">BİRİM / POLİK</th>                       
                      <th className="py-2 px-2.5 border-r border-slate-700">DOKTOR ADI SOYADI</th>                       
                      <th className="py-2 px-2.5 border-r border-slate-700 text-center">DURUM</th>                       
                      <th className="py-2 px-2.5 border-r border-slate-700 text-center">DAHİLİ</th>                       
                      <th className="py-2 px-2.5 text-center">ODA NO</th>                     
                    </tr>                   
                  </thead>                   
                  <tbody className="divide-y divide-slate-200 font-bold">                     
                    {filteredAndSortedDoctors.map((doc, i) => {                       
                      const activeStatusToday = getCurrentDayStatus(doc);
                      return (
                        <tr key={doc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-900 font-extrabold">{doc.clinic}</td>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-950 font-black">{doc.name}</td>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center uppercase font-black text-xs">{activeStatusToday}</td>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 font-mono text-center text-slate-950">{doc.dahili}</td>                         
                          <td className="py-2 px-2.5 font-mono text-center text-slate-950">{doc.roomNo || '101'}</td>                       
                        </tr>                     
                      );
                    })}                   
                  </tbody>                 
                </table>               
              </div>               
            </div>           
          </div>         
        </div>       
      )}       

      {/* 📅 MODAL DETAIL */}
      {selectedDoctorDetail && (         
        <>           
          {isMinimized ? (
            <div className="fixed bottom-4 right-4 sm:right-6 z-[170]">
              <div 
                onClick={() => setIsMinimized(false)}
                className={`p-3.5 px-5 rounded-2xl shadow-2xl border-2 flex items-center gap-4 cursor-pointer backdrop-blur-md active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-900/95 border-amber-500/50 text-slate-100 shadow-amber-500/10' 
                    : 'bg-white/95 border-emerald-500/50 text-slate-900 shadow-emerald-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight">{selectedDoctorDetail.name}</h4>
                    <p className="text-[10px] font-extrabold text-amber-500 uppercase">{getCurrentDayStatus(selectedDoctorDetail)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300/40 dark:border-slate-800/60 pl-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                    className="p-1 hover:text-amber-500 font-black text-sm"
                    title="Aç"
                  >
                    🗖
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDoctorDetail(null); }} 
                    className="p-1 hover:text-rose-500 font-black text-sm"
                    title="Kapat"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-6 animate-fadeIn" 
              onClick={(e) => { if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) { setSelectedDoctorDetail(null); } }}
            >               
              <div 
                ref={modalBoxRef} 
                className={`flex flex-col relative shadow-2xl border-2 overflow-hidden ${
                  isMaximized 
                    ? 'w-full h-full max-w-none max-h-none rounded-none' 
                    : 'w-full max-w-3xl h-[85vh] rounded-3xl'
                } ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >                 
                <div className={`p-4 sm:p-5 border-b-2 flex justify-between items-center select-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>                   
                  <div>                     
                    <h3 className="text-base sm:text-xl font-black text-emerald-500 dark:text-emerald-400 uppercase">{selectedDoctorDetail.name}</h3>                     
                    <p className="text-xs sm:text-sm font-black text-slate-500 dark:text-slate-400 mt-0.5">                       
                      BİRİM: <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedDoctorDetail.clinic}</span> • DAHİLİ TEL: <span className="text-amber-500 font-black">{selectedDoctorDetail.dahili}</span> • ODA NO: <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedDoctorDetail.roomNo || '101'}</span>                     
                    </p>                   
                  </div>                   
                  
                  <div className="flex items-center gap-1.5 font-mono">                     
                    <button 
                      onClick={() => setIsMinimized(true)} 
                      className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-base flex items-center justify-center cursor-pointer active:scale-90" 
                      title="Simge Durumuna Küçült"
                    >
                      🗕
                    </button>                     
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)} 
                      className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-base flex items-center justify-center cursor-pointer active:scale-90" 
                      title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}
                    >
                      {isMaximized ? '🗗' : '🗖'}
                    </button>                     
                    <button 
                      onClick={() => setSelectedDoctorDetail(null)} 
                      className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-base flex items-center justify-center cursor-pointer active:scale-90" 
                      title="Kapat"
                    >
                      ✕
                    </button>                   
                  </div>                 
                </div>                 

                <div className={`px-6 py-3 border-b ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                   
                  <h4 className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase">                       
                    📅 DETAYLI ÇALIŞMA VE İZİN TAKVİMİ                 
                  </h4>                 
                </div>                 

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 font-black">                   
                  {selectedDoctorDetail.scheduleDays && selectedDoctorDetail.scheduleDays.length > 0 ? (                     
                    selectedDoctorDetail.scheduleDays.map((sd, idx) => {                       
                      
                      const itemDate = parseItemDate(sd);
                      let isPast = false;
                      let isToday = false;

                      if (itemDate) {
                        itemDate.setHours(0, 0, 0, 0);
                        isPast = itemDate.getTime() < today.current.getTime();
                        isToday = itemDate.getTime() === today.current.getTime();
                      }

                      const monthNum = itemDate ? String(itemDate.getMonth() + 1).padStart(2, '0') : '';                       
                      const dayNum = itemDate ? String(itemDate.getDate()).padStart(2, '0') : '';                       
                      const yearNum = itemDate ? itemDate.getFullYear() : '';                       
                      const isoDateStr = `${yearNum}-${monthNum}-${dayNum}`;                                              
                      const holidayName = TURKEY_OFFICIAL_HOLIDAYS_2026[isoDateStr];                       
                      const dateColorClass = getDateTextColor(sd.status, sd.day, isPast, isDarkMode);

                      return (                         
                        <div 
                          key={idx} 
                          ref={isToday ? todayRef : null} 
                          className={`flex justify-between items-center p-4 rounded-2xl border-2 font-black ${
                            isToday 
                              ? isDarkMode
                                ? 'border-amber-400 bg-slate-900 shadow-xl ring-2 ring-amber-400/30' 
                                : 'border-amber-500 bg-amber-50/90 shadow-md ring-2 ring-amber-500/20'
                              : isPast
                              ? isDarkMode
                                ? 'border-slate-800 bg-slate-950/80'
                                : 'border-slate-300 bg-slate-100/90'
                              : isDarkMode 
                              ? 'bg-slate-950 border-slate-800' 
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >                           
                          <div className="flex items-center gap-3 text-xs sm:text-sm">                             
                            <span className={`font-black tracking-tight ${dateColorClass} ${isToday ? 'text-base' : ''}`}>
                              {sd.date}
                            </span>                             
                            
                            <span className={`text-xs font-black uppercase ${dateColorClass}`}>
                              {sd.day}
                            </span>                             
                            
                            {isPast && (
                              <span className="text-[11px] text-rose-500 dark:text-rose-400 font-black tracking-wide">
                                GEÇMİŞ TARİH
                              </span>
                            )}                             
                            
                            {isToday && (
                              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-md font-sans uppercase shadow-xs">
                                BUGÜN
                              </span>
                            )}                             
                            
                            {holidayName && (
                              <span className="text-[10px] bg-purple-600 text-white font-black px-2.5 py-0.5 rounded-md font-sans">
                                🇹🇷 {holidayName}
                              </span>
                            )}                           
                          </div>                           
                          
                          <div className="flex justify-center shrink-0">
                            <span className={`w-36 sm:w-40 h-8 rounded-xl text-xs font-black border-2 flex items-center justify-center text-center ${getStatusStyles(sd.status, 'high', isPast)}`}>                             
                              <span className="truncate px-2">{holidayName ? 'RESMİ TATİL' : sd.status}</span>
                            </span>                         
                          </div>
                        </div>                       
                      );                     
                    })                   
                  ) : (                     
                    <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed rounded-2xl">                       
                      Bu doktor için detaylı takvim bulunmamaktadır.                     
                    </div>                   
                  )}                 
                </div>                 
              </div>             
            </div> 
          )}          
        </>       
      )}       

    </div>   
  ); 
}