'use client'; 

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import { useData } from '@/context/DataContext';

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

const getStatusStyles = (status, isPast = false) => {
  const textStyle = 'text-white font-black tracking-wide';

  if (isPast) {
    return `bg-slate-600 ${textStyle}`;
  }

  const colorMap = {
    'POLİKLİNİK': `bg-emerald-600 ${textStyle}`, 
    'POLİK': `bg-emerald-600 ${textStyle}`,
    'AMELİYATTA': `bg-purple-600 ${textStyle}`, 
    'RESMİ TATİL': `bg-indigo-600 ${textStyle}`, 
    'HAFTA SONU': `bg-red-600 ${textStyle}`, 
    'YILLIK İZİN': `bg-sky-500 ${textStyle}`, 
    'RAPORLU': `bg-amber-600 ${textStyle}`, 
    'NÖBET SONRASI İZİN': `bg-teal-600 ${textStyle}`, 
    'ASKERLİK': `bg-stone-700 ${textStyle}`, 
    'ŞUA İZNİ': `bg-cyan-600 ${textStyle}`,
    'KONGRE/SEMİNER': `bg-blue-600 ${textStyle}`
  };

  return colorMap[status] || `bg-slate-700 ${textStyle}`;
};

const getDateTextColor = (status, dayName, isPast, isDarkMode) => {
  if (isPast) {
    return isDarkMode ? 'text-slate-400 font-extrabold' : 'text-slate-600 font-extrabold';
  }

  if (dayName === 'CUMARTESİ' || dayName === 'PAZAR' || status === 'HAFTA SONU') {
    return 'text-red-500 dark:text-red-400 font-black';
  }

  const textColors = {
    'POLİKLİNİK': 'text-emerald-500 dark:text-emerald-400 font-black',
    'POLİK': 'text-emerald-500 dark:text-emerald-400 font-black',
    'AMELİYATTA': 'text-purple-500 dark:text-purple-300 font-black',
    'RESMİ TATİL': 'text-indigo-500 dark:text-indigo-400 font-black',
    'HAFTA SONU': 'text-red-500 dark:text-red-400 font-black',
    'YILLIK İZİN': 'text-sky-500 dark:text-sky-400 font-black',
    'RAPORLU': 'text-amber-500 dark:text-amber-400 font-black',
    'NÖBET SONRASI İZİN': 'text-teal-500 dark:text-teal-400 font-black',
    'ASKERLİK': 'text-stone-400 dark:text-stone-300 font-black',
    'ŞUA İZNİ': 'text-cyan-500 dark:text-cyan-400 font-black',
    'KONGRE/SEMİNER': 'text-blue-500 dark:text-blue-400 font-black'
  };

  return textColors[status] || (isDarkMode ? 'text-slate-100 font-black' : 'text-slate-950 font-black');
};

export default function PublicScheduleTable() {   
  const { doctors: rawDoctors } = useData(); 

  const [filter, setFilter] = useState('HEPSİ');   
  const [searchTerm, setSearchTerm] = useState('');   
  const [sortBy, setSortBy] = useState('NEWEST');   
  const [doctors, setDoctors] = useState([]);   
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState(null);   
  const [isMaximized, setIsMaximized] = useState(false);   
  const [isMinimized, setIsMinimized] = useState(false);   
  const [showPrintModal, setShowPrintModal] = useState(false);   
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const [showScrollToTodayTop, setShowScrollToTodayTop] = useState(false);
  const [showScrollToTodayBottom, setShowScrollToTodayBottom] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportCategory, setReportCategory] = useState('SİSTEM_HATASI');
  const [reportSuccessMsg, setReportSuccessMsg] = useState(false);

  const todayRef = useRef(null);   
  const modalBoxRef = useRef(null);
  const modalScrollContainerRef = useRef(null);
  
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const menuDropdownRef = useRef(null);

  const {      
    isDarkMode,      
    toggleTheme,
    setShowTableSettingsModal,
    selectedFont = 'font-sans',      
    zoomScale = 100,      
    activeColor = 'text-slate-900 dark:text-slate-100',
    tableSettings = { 
      showClinic: true, 
      showDoctorName: true, 
      showStatus: true, 
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
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {     
    const isModalActive = showPrintModal || (selectedDoctorDetail && !isMinimized) || showReportModal;     
    document.body.style.overflow = isModalActive ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };   
  }, [showPrintModal, selectedDoctorDetail, isMinimized, showReportModal]);   

  const scrollToTodayInstant = useCallback(() => {
    if (todayRef.current && modalScrollContainerRef.current) {
      const container = modalScrollContainerRef.current;
      const todayElement = todayRef.current;
      const targetScrollTop = todayElement.offsetTop - (container.clientHeight / 2) + (todayElement.clientHeight / 2);
      container.scrollTop = Math.max(0, targetScrollTop);
    }
  }, []);

  const scrollToTodaySmooth = useCallback(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {     
    if (selectedDoctorDetail && !isMinimized) {       
      requestAnimationFrame(() => {
        scrollToTodayInstant();
      });
    }   
  }, [selectedDoctorDetail, isMinimized, scrollToTodayInstant]);   

  const handleModalScroll = (e) => {
    const container = e.target;
    if (!todayRef.current) return;

    const todayTop = todayRef.current.offsetTop;
    const currentScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    if (currentScrollTop + containerHeight < todayTop - 30) {
      setShowScrollToTodayBottom(true);
      setShowScrollToTodayTop(false);
    } 
    else if (currentScrollTop > todayTop + 120) {
      setShowScrollToTodayTop(true);
      setShowScrollToTodayBottom(false);
    } 
    else {
      setShowScrollToTodayTop(false);
      setShowScrollToTodayBottom(false);
    }
  };

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

  const filteredAndSortedDoctors = useMemo(() => {
    return doctors     
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
  }, [doctors, filter, searchTerm, sortBy, getCurrentDayStatus]);

  const handleSendReport = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    const existingReports = JSON.parse(localStorage.getItem('app_user_reports') || '[]');
    const newReport = {
      id: Date.now(),
      category: reportCategory,
      text: reportText,
      date: new Date().toLocaleString('tr-TR'),
      user: 'MİSAFİR (ZİYARETÇİ)'
    };

    localStorage.setItem('app_user_reports', JSON.stringify([newReport, ...existingReports]));
    setReportSuccessMsg(true);

    setTimeout(() => {
      setShowReportModal(false);
      setReportText('');
      setReportSuccessMsg(false);
    }, 2000);
  };

  const exportToExcel = () => {     
    let tableCSV = 'BİRİM;DOKTOR ADI SOYADI;DURUM\n';     
    filteredAndSortedDoctors.forEach((doc) => {       
      const currentStatus = getCurrentDayStatus(doc);
      tableCSV += `"${doc.clinic}";"${doc.name}";"${currentStatus}"\n`;     
    });     
    const blob = new Blob(['\uFEFF' + tableCSV], { type: 'text/csv;charset=utf-8;' });     
    const url = URL.createObjectURL(blob);     
    const a = document.createElement('a');     
    a.href = url;     
    a.download = `Doktor_Calisma_Listesi_${todayFormattedStr.replace(/\./g, '_')}.csv`;     
    a.click();   
  };

  // ⚙️ إعدادات المسافات بين الأسطر
  const getRowPaddingClass = () => {
    if (tableSettings.rowPadding === 'compact') return 'py-2 px-4';
    if (tableSettings.rowPadding === 'spacious') return 'py-4.5 px-6';
    return 'py-3.5 px-5';
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
    <div dir="ltr" style={{ zoom: `${zoomScale}%` }} className={`min-h-screen p-2 sm:p-4 lg:p-6 relative ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>              
      
      {/* 🖨️ PRINT STYLES */}
      <style jsx global>{`         
        @media print {           
          body * { visibility: hidden !important; }           
          #printableA4Area, #printableA4Area * { visibility: visible !important; }           
          #printableA4Area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }           
        }       
      `}</style>

      <div className="w-full max-w-full mx-auto space-y-4">                  
        
        {/* 🌟 HEADER */}
        <div className={`no-print sticky top-2 z-50 rounded-2xl py-2.5 px-4 shadow-xl ${
          isDarkMode 
            ? 'bg-slate-900 border border-slate-800' 
            : 'bg-white border border-slate-200'
        }`}>                      
          
          <div className="flex flex-row items-center justify-between gap-3 w-full flex-wrap sm:flex-nowrap">                          
            
            <div className="flex items-center shrink-0">
              <button
                onClick={() => router.push('/')}
                className={`p-2.5 rounded-2xl border-2 cursor-pointer shadow-lg flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-slate-800 text-amber-400 border-amber-400/60' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-600/60'
                }`}
                title="Ana Sayfaya Dön"
              >
                <svg className="w-5 h-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            </div>

            {/* Arama Kutusu */}
            <div className="relative flex-1 min-w-[160px] max-w-full sm:max-w-xs mx-1">               
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input                 
                type="text"                 
                placeholder="Doktor veya Birim Ara..."                 
                value={searchTerm}                 
                onChange={(e) => setSearchTerm(e.target.value)}                 
                className={`w-full pl-9 pr-8 py-2 rounded-2xl text-xs font-extrabold focus:outline-none border ${                   
                  isDarkMode                      
                    ? 'bg-slate-950 text-slate-100 border-slate-800 placeholder-slate-500'                      
                    : 'bg-slate-100 text-slate-900 border-slate-200 placeholder-slate-500'                 
                }`}               
              />             

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 font-black text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Butonlar */}
            <div className="flex items-center gap-2 shrink-0">
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-2xl cursor-pointer flex items-center justify-center ${
                  isDarkMode 
                    ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' 
                    : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
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

              <div className="h-5 w-[1.5px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>

              {/* DURUM */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); setShowMenuDropdown(false); }}
                  className={`px-2.5 py-1.5 rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 ${
                    isDarkMode ? 'text-amber-400 bg-amber-400/10' : 'text-slate-800 bg-slate-100'
                  }`}
                  title="Durum Seç"
                >
                  <span className="font-extrabold uppercase tracking-tight">{filter}</span>
                  <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFilterDropdown && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl z-50 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-center pb-1.5 px-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-black text-amber-500 uppercase">DURUM SEÇİN</span>
                      <button onClick={() => setShowFilterDropdown(false)} className="w-4 h-4 rounded-full bg-slate-800/20 font-black text-[10px] flex items-center justify-center">✕</button>
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
                              ? 'bg-emerald-600 text-white font-black'
                              : isDarkMode
                              ? 'text-slate-300'
                              : 'text-slate-800'
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

              <div className="h-5 w-[1.5px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>

              {/* SIRALAMA */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); setShowMenuDropdown(false); }}
                  className={`px-2.5 py-1.5 rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 ${
                    isDarkMode ? 'text-amber-400 bg-amber-400/10' : 'text-slate-800 bg-slate-100'
                  }`}
                  title="Sıralama / Filtreleme"
                >
                  <span className="font-extrabold uppercase tracking-tight">{getSortLabel(sortBy)}</span>
                  <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSortDropdown && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex justify-between items-center pb-1.5 px-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-black text-amber-500 uppercase">SIRALAMA SEÇENEKLERİ</span>
                      <button onClick={() => setShowSortDropdown(false)} className="w-4 h-4 rounded-full bg-slate-800/20 font-black text-[10px] flex items-center justify-center">✕</button>
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
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : isDarkMode
                              ? 'text-slate-300'
                              : 'text-slate-800'
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

              <div className="h-5 w-[1.5px] bg-slate-300 dark:bg-slate-700 rounded-full"></div>

              {/* YAZDIR / İNDİR */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className={`p-2 rounded-2xl flex items-center justify-center cursor-pointer ${
                    isDarkMode ? 'text-amber-400 bg-amber-400/10' : 'text-slate-800 bg-slate-100'
                  }`}
                  title="İndir / Yazdır"
                >
                  <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                  </svg>
                </button>
              </div>

              {/* ☰ MENÜ */}
              <div className="relative" ref={menuDropdownRef}>
                <button
                  onClick={() => {
                    setShowMenuDropdown(!showMenuDropdown);
                    setShowFilterDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className={`px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-950 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                  title="Menü"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <span className="hidden md:inline">MENÜ</span>
                </button>

                {showMenuDropdown && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-2xl border-2 p-2 shadow-2xl z-50 font-black text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    
                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setShowReportModal(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 ${
                        isDarkMode ? 'hover:bg-slate-800 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                      }`}
                    >
                      <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <span>Sorun Bildir</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenuDropdown(false);
                        setShowTableSettingsModal && setShowTableSettingsModal(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 ${
                        isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-amber-50 text-amber-600'
                      }`}
                    >
                      <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Genel Ayarlar</span>
                    </button>

                  </div>
                )}
              </div>

            </div>

          </div>         
        </div>         

        {/* 📊 ZİYARETÇİ TABLOSU */}         
        <div className={`w-full rounded-3xl overflow-hidden shadow-2xl border ${           
          isDarkMode 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200'         
        }`}>           
          <div className="overflow-x-auto w-full relative">             
            <table className={`w-full min-w-full text-left border-collapse ${selectedFont} ${tableSettings.fontWeight}`}>               
              
              <thead className="sticky top-0 z-20">                 
                <tr className={`text-xs sm:text-sm font-black uppercase select-none border-b ${                   
                  isDarkMode                      
                    ? 'bg-slate-950 text-amber-400 border-slate-800'                      
                    : 'bg-slate-100 text-slate-900 border-slate-300'                 
                }`}>                   
                  {tableSettings.showClinic && (
                    <th className={`${getRowPaddingClass()} border-r border-slate-300 dark:border-slate-800/80 font-black tracking-wide`}>
                      BİRİM
                    </th>                   
                  )}

                  {tableSettings.showDoctorName && (
                    <th className={`${getRowPaddingClass()} border-r border-slate-300 dark:border-slate-800/80 font-black tracking-wide`}>
                      DOKTOR ADI SOYADI
                    </th>                   
                  )}

                  {tableSettings.showStatus && (
                    <th className={`${getRowPaddingClass()} font-black text-center tracking-wide`}>
                      DURUM
                    </th>                   
                  )}
                </tr>               
              </thead>               
              
              <tbody className={`text-xs sm:text-sm md:text-base ${activeColor} divide-y divide-slate-200 dark:divide-slate-800/80`}>                 
                {filteredAndSortedDoctors.length > 0 ? (                   
                  filteredAndSortedDoctors.map((doc, index) => {
                    const activeStatusToday = getCurrentDayStatus(doc);
                    return (                     
                      <tr                        
                        key={doc.id}                        
                        onClick={() => handleOpenDoctorDetail(doc)}
                        className={`cursor-pointer transition-colors duration-150 ${                         
                          isDarkMode                            
                            ? index % 2 === 0                              
                              ? 'bg-slate-900 hover:bg-slate-800/60'                              
                              : 'bg-slate-950 hover:bg-slate-800/60'                           
                            : index % 2 === 0                              
                              ? 'bg-white hover:bg-slate-100/80'                              
                              : 'bg-slate-50 hover:bg-slate-100/80'                       
                        }`}                     
                      >                       
                        {tableSettings.showClinic && (
                          <td className={`${getRowPaddingClass()} border-r border-slate-200 dark:border-slate-800/80 ${activeColor}`}>                         
                            <span>{doc.clinic}</span>                       
                          </td>                       
                        )}

                        {tableSettings.showDoctorName && (
                          <td className={`${getRowPaddingClass()} border-r border-slate-200 dark:border-slate-800/80 ${activeColor}`}>                         
                            <span>{doc.name}</span>                       
                          </td>                       
                        )}

                        {tableSettings.showStatus && (
                          <td className={`${getRowPaddingClass()} text-center`}>                         
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center justify-center w-36 h-8 rounded-xl text-xs font-black ${getStatusStyles(activeStatusToday)}`}>                           
                                <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse shrink-0"></span>                           
                                <span className="truncate">{activeStatusToday}</span>
                              </span>                       
                            </div>
                          </td>                       
                        )}
                      </tr>                   
                    );
                  })                 
                ) : (                   
                  <tr>                     
                    <td colSpan={3} className="p-12 text-center text-slate-400 font-black border-dashed text-base">                         
                      Arama kriterlerinize uygun doktor kaydı bulunamadı.                     
                    </td>                   
                  </tr>                 
                )}               
              </tbody>             
            </table>           
          </div>           
          <div className="p-3 pr-6 flex justify-end items-center border-t border-slate-200 dark:border-slate-800">             
            <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">               
              TOPLAM: {filteredAndSortedDoctors.length} DOKTOR             
            </span>           
          </div>         
        </div>       
      </div>       

      {/* ⚠️ MODAL: Sorun Bildir */}
      {showReportModal && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-base font-black text-rose-500 uppercase">SORUN BİLDİR</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 font-black text-lg">✕</button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs rounded-2xl text-center">
                Bildiriminiz yöneticiye başarıyla iletildi. Teşekkür ederiz!
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4 font-black">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">KATEGORİ</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-black outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="SİSTEM_HATASI">Sistem Hatası / Çalışmıyor</option>
                    <option value="YANLIS_BILGI">Hatalı Doktor Bilgisi</option>
                    <option value="ONERI">Öneri / İstek</option>
                    <option value="DIGER">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">SORUN AÇIKLAMASI</label>
                  <textarea
                    required
                    rows="4"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Lütfen yaşadığınız sorunu detaylıca açıklayın..."
                    className={`w-full p-3 rounded-xl border text-xs font-black outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-black cursor-pointer"
                  >
                    İPTAL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer"
                  >
                    BİLDİRİMİ GÖNDER 🚀
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 📥 Printable A4 Modal */}       
      {showPrintModal && (         
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-3">           
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-300">             
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 gap-2">               
              <div className="flex items-center gap-2">                 
                <span className="text-2xl">🖨️</span>                
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">                   
                  DOKTOR ÇALIŞMA LİSTESİ İNDİR VE YAZDIR                
                </h2>               
              </div>               
              <div className="flex items-center gap-2">                 
                <button onClick={exportToExcel} className="px-4 py-2 bg-emerald-700 text-white font-black rounded-xl text-xs cursor-pointer flex items-center gap-1.5">                   
                  <span>📊</span> EXCEL İNDİR                 
                </button>                 
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-900 text-white font-black rounded-xl text-xs cursor-pointer flex items-center gap-1.5">                   
                  <span>🖨️</span> YAZDIR / PDF               
                </button>                 
                <button onClick={() => setShowPrintModal(false)} className="px-3 py-2 bg-slate-200 text-slate-800 font-black rounded-xl text-xs cursor-pointer">                   
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
                      <th className="py-2 px-2.5 text-center">DURUM</th>                       
                    </tr>                   
                  </thead>                   
                  <tbody className="divide-y divide-slate-200 font-bold">                     
                    {filteredAndSortedDoctors.map((doc, i) => {                       
                      const activeStatusToday = getCurrentDayStatus(doc);
                      return (
                        <tr key={doc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-900 font-extrabold">{doc.clinic}</td>                         
                          <td className="py-2 px-2.5 border-r border-slate-300 uppercase text-slate-950 font-black">{doc.name}</td>                         
                          <td className="py-2 px-2.5 text-center uppercase font-black text-xs">{activeStatusToday}</td>                         
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
                className={`p-3.5 px-5 rounded-2xl shadow-2xl border-2 flex items-center gap-4 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-amber-500/50 text-slate-100' 
                    : 'bg-white border-emerald-500/50 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight">{selectedDoctorDetail.name}</h4>
                    <p className="text-[10px] font-extrabold text-amber-500 uppercase">{getCurrentDayStatus(selectedDoctorDetail)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300 dark:border-slate-800 pl-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                    className="p-1 text-amber-500 font-black text-sm"
                    title="Aç"
                  >
                    🗖
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDoctorDetail(null); }} 
                    className="p-1 text-rose-500 font-black text-sm"
                    title="Kapat"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-6" 
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
                      BİRİM: <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedDoctorDetail.clinic}</span>                  
                    </p>                   
                  </div>                   
                  
                  <div className="flex items-center gap-1.5 font-mono">                     
                    <button 
                      onClick={() => setIsMinimized(true)} 
                      className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 font-black text-base flex items-center justify-center cursor-pointer" 
                      title="Simge Durumuna Küçült"
                    >
                      🗕
                    </button>                     
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)} 
                      className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 font-black text-base flex items-center justify-center cursor-pointer" 
                      title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}
                    >
                      {isMaximized ? '🗗' : '🗖'}
                    </button>                     
                    <button 
                      onClick={() => setSelectedDoctorDetail(null)} 
                      className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 font-black text-base flex items-center justify-center cursor-pointer" 
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

                <div className="relative flex-1 overflow-hidden">

                  {showScrollToTodayTop && (
                    <button
                      onClick={scrollToTodaySmooth}
                      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl border cursor-pointer flex items-center gap-2.5 ${
                        isDarkMode
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-950'
                          : 'bg-white border-emerald-600 text-emerald-900 shadow-slate-400'
                      }`}
                    >
                      <svg className="w-4 h-4 stroke-[3] text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="tracking-wide">BUGÜNE GİT ({todayFormattedStr})</span>
                    </button>
                  )}

                  {showScrollToTodayBottom && (
                    <button
                      onClick={scrollToTodaySmooth}
                      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full font-black text-xs shadow-2xl border cursor-pointer flex items-center gap-2.5 ${
                        isDarkMode
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-950'
                          : 'bg-white border-emerald-600 text-emerald-900 shadow-slate-400'
                      }`}
                    >
                      <svg className="w-4 h-4 stroke-[3] text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="tracking-wide">BUGÜNE GİT ({todayFormattedStr})</span>
                    </button>
                  )}

                  <div 
                    ref={modalScrollContainerRef}
                    onScroll={handleModalScroll}
                    className="h-full overflow-y-auto p-4 sm:p-6 space-y-3 font-black"
                  >                   
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
                            className={`flex justify-between items-center p-4 sm:p-5 rounded-2xl border-2 font-black ${
                              isToday 
                                ? isDarkMode
                                  ? 'border-amber-400 bg-slate-900 shadow-2xl' 
                                  : 'border-emerald-600 bg-emerald-100 shadow-2xl'
                                : isPast
                                ? isDarkMode
                                  ? 'border-slate-800 bg-slate-950 opacity-80'
                                  : 'border-slate-300 bg-slate-100 opacity-80'
                                : isDarkMode 
                                ? 'bg-slate-950 border-slate-800' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >                           
                            <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">                             
                              <span className={`font-black tracking-tight ${dateColorClass} ${isToday ? 'text-lg sm:text-xl font-black' : 'text-sm sm:text-base'}`}>
                                {sd.date}
                              </span>                             
                              
                              <span className={`font-black uppercase ${dateColorClass} ${isToday ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                                {sd.day}
                              </span>                             
                              
                              {isPast && (
                                <span className="text-[11px] sm:text-xs text-rose-500 dark:text-rose-400 font-black tracking-wide">
                                  GEÇMİŞ TARİH
                                </span>
                              )}                             
                              
                              {isToday && (
                                <span className="text-xs sm:text-sm bg-amber-400 text-slate-950 font-black px-3.5 py-1 rounded-xl uppercase shadow-lg border border-amber-300 tracking-wider">
                                  BUGÜN
                                </span>
                              )}                             
                              
                              {holidayName && (
                                <span className="text-xs bg-purple-600 text-white font-black px-2.5 py-1 rounded-lg font-sans">
                                  🇹🇷 {holidayName}
                                </span>
                              )}                           
                            </div>                           
                            
                            <div className="flex justify-center shrink-0">
                              <span className={`w-36 sm:w-44 h-9 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center text-center ${getStatusStyles(sd.status, isPast)}`}>                             
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
            </div> 
          )}          
        </>       
      )}       

    </div>   
  ); 
}