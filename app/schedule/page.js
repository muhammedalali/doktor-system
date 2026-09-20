'use client'; 
import { useState, useEffect, useRef } from 'react'; 
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import { useTheme } from '@/context/ThemeContext'; 
import { supabase } from '@/lib/supabase';

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
      fullDateObj: dateObj,
      date: `${dayNum}.${monthNum}.${year}`,
      day: dayName,
      status: initialStatus,
      holidayName: holidayName || null
    });
  }
  return days;
};

const defaultDoctors = [   
  {      
    id: 1,      
    name: 'DR. AHMET YILMAZ',      
    clinic: 'İÇ HASTALIKLARI (DAHİLİYE)',      
    status: 'POLİKLİNİK',      
    dahili: '1012',      
    roomNo: '102',     
    createdAt: 1726800000000,     
    scheduleDays: generateFullMonthSchedule(2026, 8)
  },   
  {      
    id: 2,      
    name: 'DR. AYŞE KAYA',      
    clinic: 'GÖZ HASTALIKLARI',      
    status: 'AMELİYATTA',      
    dahili: '1044',      
    roomNo: '205',     
    createdAt: 1726886400000,     
    scheduleDays: generateFullMonthSchedule(2026, 8)
  }
];

const statusStyles = {   
  'POLİKLİNİK': 'bg-emerald-600 text-white border-emerald-400 shadow-md',   
  'POLİK': 'bg-emerald-600 text-white border-emerald-400 shadow-md',   
  'AMELİYATTA': 'bg-purple-600 text-white border-purple-400 shadow-md',   
  'YILLIK İZİN': 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md',   
  'RAPORLU': 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md',   
  'NÖBET SONRASI İZİN': 'bg-sky-600 text-white border-sky-400 shadow-md',   
  'RESMİ TATİL': 'bg-indigo-700 text-white border-indigo-400 shadow-md',   
  'HAFTA SONU': 'bg-rose-600 text-white border-rose-400 shadow-md',
  'ASKERLİK': 'bg-slate-800 text-slate-300 border-slate-600 shadow-md'
};

export default function SchedulePage() {   
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
  const [winPos, setWinPos] = useState({ x: 0, y: 0 });   
  const [winSize, setWinSize] = useState({ width: 750, height: 550 });   
  const [showClock, setShowClock] = useState(true);   
  const [currentTime, setCurrentTime] = useState(new Date());   
  const [showPrintModal, setShowPrintModal] = useState(false);   

  const todayRef = useRef(null);   
  const modalBoxRef = useRef(null);   
  const isDraggingRef = useRef(false);   
  const isResizingRef = useRef(false);   
  const dragStartRef = useRef({ x: 0, y: 0 });   
  const isFirstOpenRef = useRef(false);   

  const {      
    isDarkMode,      
    setIsSidebarOpen,      
    activeColor,      
    selectedFont,      
    zoomScale,      
    isStickyHeader    
  } = useTheme();   
  const router = useRouter();   

  const today = new Date();   
  today.setHours(0, 0, 0, 0);   
  const todayFormattedStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

  useEffect(() => {     
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);     
    return () => clearInterval(timer);   
  }, []);   

  useEffect(() => {     
    const savedClockShow = localStorage.getItem('app_show_clock');     
    if (savedClockShow !== null) {       
      setShowClock(savedClockShow === 'true');     
    }   
  }, []);   

  const toggleClockVisibility = () => {     
    const nextVal = !showClock;     
    setShowClock(nextVal);     
    localStorage.setItem('app_show_clock', String(nextVal));   
  };   

  useEffect(() => {     
    const activeDock = JSON.parse(localStorage.getItem('active_dock_schedule_user') || 'null');     
    if (activeDock) {       
      setSelectedDoctorDetail(activeDock.doctor);       
      setIsMinimized(activeDock.isMinimized);     
    }   
  }, []);   

  const updateGlobalDockStateUser = (doc, minState) => {     
    if (doc && minState) {       
      localStorage.setItem('active_dock_schedule_user', JSON.stringify({ doctor: doc, isMinimized: true }));     
    } else {       
      localStorage.removeItem('active_dock_schedule_user');     
    }   
  };   

  useEffect(() => {     
    const isModalActive = showPrintModal || (selectedDoctorDetail && !isMinimized) || editingDoctor || deletingDoctorId;     
    if (isModalActive) {       
      document.body.style.overflow = 'hidden';     
    } else {       
      document.body.style.overflow = 'auto';     
    }     
    return () => {       
      document.body.style.overflow = 'auto';     
    };   
  }, [showPrintModal, selectedDoctorDetail, isMinimized, editingDoctor, deletingDoctorId]);   

  useEffect(() => {     
    if (selectedDoctorDetail && isFirstOpenRef.current && todayRef.current) {       
      setTimeout(() => {         
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });         
        isFirstOpenRef.current = false;       
      }, 150);     
    }   
  }, [selectedDoctorDetail]);   

  const handleMouseDownHeader = (e) => {     
    if (isMaximized) return;     
    isDraggingRef.current = true;     
    dragStartRef.current = {       
      x: e.clientX - winPos.x,       
      y: e.clientY - winPos.y     
    };     
    const handleMouseMove = (moveEvent) => {       
      if (!isDraggingRef.current) return;       
      setWinPos({         
        x: moveEvent.clientX - dragStartRef.current.x,         
        y: moveEvent.clientY - dragStartRef.current.y       
      });     
    };     
    const handleMouseUp = () => {       
      isDraggingRef.current = false;       
      window.removeEventListener('mousemove', handleMouseMove);       
      window.removeEventListener('mouseup', handleMouseUp);     
    };     
    window.addEventListener('mousemove', handleMouseMove);     
    window.addEventListener('mouseup', handleMouseUp);   
  };   

  const handleMouseDownResize = (e) => {     
    e.stopPropagation();     
    isResizingRef.current = true;     
    const startX = e.clientX;     
    const startY = e.clientY;     
    const startWidth = winSize.width;     
    const startHeight = winSize.height;     
    const handleMouseMove = (moveEvent) => {       
      if (!isResizingRef.current) return;       
      const newWidth = Math.max(450, startWidth + (moveEvent.clientX - startX));       
      const newHeight = Math.max(350, startHeight + (moveEvent.clientY - startY));       
      setWinSize({ width: newWidth, height: newHeight });     
    };     
    const handleMouseUp = () => {       
      isResizingRef.current = false;       
      window.removeEventListener('mousemove', handleMouseMove);       
      window.removeEventListener('mouseup', handleMouseUp);     
    };     
    window.addEventListener('mousemove', handleMouseMove);     
    window.addEventListener('mouseup', handleMouseUp);   
  };   

  const getCurrentDayStatus = (doc) => {
    if (!doc.scheduleDays || doc.scheduleDays.length === 0) return doc.status || 'POLİKLİNİK';
    const todaySchedule = doc.scheduleDays.find(sd => sd.date === todayFormattedStr);
    if (todaySchedule) {
      return todaySchedule.status === 'POLİK' ? 'POLİKLİNİK' : todaySchedule.status;
    }
    const dayIndex = today.getDay();
    if (dayIndex === 0 || dayIndex === 6) return 'HAFTA SONU';
    return doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status;
  };

  const loadDoctorsFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      if (!error && data && data.length > 0) {
        const normalizedDocs = data.map(doc => {
          const updatedDays = doc.scheduleDays ? doc.scheduleDays.map(sd => {
            let dayObj;
            if (sd.fullDateObj) {
              dayObj = new Date(sd.fullDateObj);
            } else if (sd.date) {
              const parts = sd.date.split('.');
              if (parts.length === 3) {
                dayObj = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
              }
            }
            if (dayObj) {
              const dayIdx = dayObj.getDay();
              if ((dayIdx === 0 || dayIdx === 6) && (sd.status === 'POLİK' || sd.status === 'POLİKLİNİK')) {
                return { ...sd, status: 'HAFTA SONU' };
              }
            }
            return {
              ...sd,
              status: sd.status === 'POLİK' ? 'POLİKLİNİK' : sd.status
            };
          }) : generateFullMonthSchedule(2026, 8);

          return {
            ...doc,
            status: doc.status === 'POLİK' ? 'POLİKLİNİK' : doc.status,
            scheduleDays: updatedDays
          };
        });
        setDoctors(normalizedDocs);
      } else {
        setDoctors(defaultDoctors);
      }
    } catch (e) {
      console.error(e);
      setDoctors(defaultDoctors);
    }
  };

  useEffect(() => {     
    const sessionUser = sessionStorage.getItem('user');     
    const localUser = localStorage.getItem('user');     
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});     
    setCurrentUser(activeUser);     

    loadDoctorsFromSupabase();

    const channel = supabase
      .channel('realtime_doctors_schedule')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctors' },
        () => {
          loadDoctorsFromSupabase();
        }
      )
      .subscribe();

    const savedSort = localStorage.getItem('app_table_sort');     
    if (savedSort) setSortBy(savedSort);   

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);   

  const handleOpenDoctorDetail = (doc) => {     
    setSelectedDoctorDetail(doc);     
    isFirstOpenRef.current = true;     
    setIsMinimized(false);     
    setIsMaximized(false);     
    setWinPos({ x: 0, y: 0 });     
    setWinSize({ width: 750, height: 550 });     
    updateGlobalDockStateUser(doc, false);   
  };   

  const handleSortChange = (newSort) => {     
    setSortBy(newSort);     
    localStorage.setItem('app_table_sort', newSort);   
  };   

  const uName = currentUser?.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
  const isAdmin = uName === 'ADMIN' || currentUser?.role === 'YÖNETİCİ' || uName === 'ADMIN';   

  const filteredAndSortedDoctors = doctors     
    .filter((doc) => {       
      const currentStatus = getCurrentDayStatus(doc);
      const matchesFilter = filter === 'HEPSİ' || currentStatus === filter || (filter === 'POLİKLİNİK' && (currentStatus === 'POLİKLİNİK' || currentStatus === 'POLİK'));       
      const matchesSearch = doc.name.toUpperCase().includes(searchTerm.toUpperCase()) || doc.clinic.toUpperCase().includes(searchTerm.toUpperCase());       
      return matchesFilter && matchesSearch;     
    })     
    .sort((a, b) => {       
      if (sortBy === 'NAME_ASC') {         
        return a.name.localeCompare(b.name, 'tr');       
      } else if (sortBy === 'NAME_DESC') {         
        return b.name.localeCompare(a.name, 'tr');       
      } else if (sortBy === 'CLINIC_ASC') {         
        return a.clinic.localeCompare(b.clinic, 'tr');       
      } else if (sortBy === 'NEWEST') {         
        return (b.createdAt || b.id) - (a.createdAt || a.id);       
      } else if (sortBy === 'OLDEST') {         
        return (a.createdAt || a.id) - (b.createdAt || b.id);       
      }       
      return 0;     
    });   

  const handleDeleteDoctorConfirm = async () => {     
    if (!deletingDoctorId) return;     
    await supabase.from('doctors').delete().eq('id', deletingDoctorId);
    setDeletingDoctorId(null);   
  };   

  const handleSaveEditedDoctor = async (e) => {     
    e.preventDefault();     
    if (!editingDoctor) return;     
    await supabase.from('doctors').update(editingDoctor).eq('id', editingDoctor.id);
    setEditingDoctor(null);   
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
    a.download = `Doktor_Calisma_Listesi_${onlyDateStr.replace(/\./g, '_')}.csv`;     
    a.click();   
  };   

  const formattedLiveDate = currentTime.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' });   
  const onlyDateStr = currentTime.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });   
  const formattedLiveTimeWithSeconds = currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });   

  return (     
    <div style={{ zoom: `${zoomScale}%` }} className={`min-h-screen transition-colors duration-300 p-2 sm:p-4 md:p-6 relative ${selectedFont} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>              
      <style jsx global>{`         
        @media print {           
          body * {             
            visibility: hidden !important;           
          }           
          #printableA4Area, #printableA4Area * {             
            visibility: visible !important;           
          }           
          #printableA4Area {             
            position: absolute !important;             
            left: 0 !important;             
            top: 0 !important;             
            width: 100% !important;             
            padding: 0 !important;             
            margin: 0 !important;           
          }           
          @page {             
            size: A4 portrait;             
            margin: 5mm 8mm;           
          }         
        }       
      `}</style>       

      <div className="w-full max-w-7xl mx-auto space-y-2">                  
        {/* Upper Navigation Header */}         
        <div className={`transition-all p-2.5 sm:p-3.5 rounded-2xl shadow-md backdrop-blur-md ${           
          isStickyHeader ? 'sticky top-0 z-40' : 'relative z-10'         
        } ${isDarkMode ? 'bg-slate-900/90' : 'bg-white/90'}`}>                      
          <div className="flex flex-col md:flex-row justify-between items-center gap-2.5">                          
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">               
              <button                 
                onClick={() => setIsSidebarOpen && setIsSidebarOpen(true)}                 
                className={`px-3.5 py-2 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-105 ${selectedFont} ${                   
                  isDarkMode                      
                    ? `bg-slate-800 ${activeColor} hover:bg-slate-700`                      
                    : `bg-slate-100 ${activeColor} hover:bg-slate-200`                 
                }`}               
              >                 
                <span className={`text-base ${activeColor}`}>☰</span>                 
                <span className={`text-xs font-black tracking-widest uppercase ${activeColor}`}>MENÜ</span>               
              </button>               
              <button                 
                onClick={toggleClockVisibility}                 
                className={`relative p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-xs flex items-center justify-center hover:scale-110 active:scale-95 ${                   
                  showClock                      
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'                      
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-500 hover:text-slate-300'                 
                }`}                 
                title={showClock ? "Tarih ve Saati Gizle" : "Tarih ve Saati Göster"}               
              >                 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">                   
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />                 
                </svg>                                  
                {!showClock && (                   
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">                     
                    <span className="w-6 h-[2px] bg-rose-500 rotate-45 rounded-full shadow-xs"></span>                   
                  </span>                 
                )}               
              </button>             
            </div>             
            {showClock && (               
              <div className="flex items-center justify-center overflow-hidden rounded-xl border shadow-xs bg-slate-950/80 border-slate-800 transition-all animate-fadeIn">                 
                <span className={`px-3 py-1 text-xs sm:text-sm font-black uppercase ${                   
                  isDarkMode ? 'text-slate-200' : 'text-slate-300'                 
                }`}>                   
                  {formattedLiveDate}                 
                </span>                 
                <span className="bg-amber-500/15 text-amber-400 font-mono font-black px-3 py-1 border-l border-amber-500/30 tracking-widest text-xs sm:text-sm">                   
                  {formattedLiveTimeWithSeconds}                 
                </span>               
              </div>             
            )}             
            <div className="relative w-full md:w-60">               
              <input                 
                type="text"                 
                placeholder="DOKTOR VEYA BİRİM ARA..."                 
                value={searchTerm}                 
                onChange={(e) => setSearchTerm(e.target.value)}                 
                className={`w-full px-4 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 focus:outline-none shadow-inner ${                   
                  isDarkMode                      
                    ? 'bg-slate-950 text-slate-100 placeholder-slate-500 focus:bg-amber-400 focus:text-slate-950 focus:placeholder-slate-800 focus:ring-4 focus:ring-amber-400/30'                      
                    : 'bg-slate-50 text-slate-900 shadow-xs focus:bg-amber-400 focus:text-slate-950 focus:placeholder-slate-800 focus:ring-4 focus:ring-amber-400/40'                 
                }`}               
              />             
            </div>           
          </div>         
        </div>         

        {/* Status Badges Filter Strip */}         
        <div className={`sticky ${isStickyHeader ? 'top-[4.8rem] lg:top-[5.1rem]' : 'top-0'} z-30 transition-all py-1.5 px-3 rounded-2xl shadow-md backdrop-blur-md flex items-center justify-between gap-2 overflow-hidden ${           
          isDarkMode ? 'bg-slate-900/90' : 'bg-white/90'         
        }`}>           
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 w-full scrollbar-none">             
            {[               
              { label: 'TÜMÜ', key: 'HEPSİ' },               
              { label: 'POLİKLİNİK', key: 'POLİKLİNİK' },               
              { label: 'AMELİYATTAKİ DOKTORLAR', key: 'AMELİYATTA' },               
              { label: 'YILLIK İZİNDEKİLER', key: 'YILLIK İZİN' },               
              { label: 'RAPORLULAR', key: 'RAPORLU' },               
              { label: 'NÖBET SONRASI İZİNDEKİLER', key: 'NÖBET SONRASI İZİN' },             
            ].map((tab) => (               
              <button                 
                key={tab.key}                 
                onClick={() => setFilter(tab.key)}                 
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer whitespace-nowrap uppercase tracking-wide ${                   
                  filter === tab.key                     
                    ? 'bg-emerald-600 text-white shadow-md scale-105'                     
                    : isDarkMode                     
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'                     
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'                 
                }`}               
              >                 
                {tab.label}               
              </button>             
            ))}             
            <button               
              onClick={() => setShowPrintModal(true)}               
              className="h-8 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95 shrink-0 ml-1"               
              title="Yazdır / PDF / Excel Çıktısı Al"             
            >               
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">                 
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h14z" />               
              </svg>               
              <span className="hidden sm:inline text-xs uppercase font-extrabold">YAZDIR</span>             
            </button>             
            <select               
              value={sortBy}               
              onChange={(e) => handleSortChange(e.target.value)}               
              className={`h-8 px-2 rounded-xl text-xs font-black cursor-pointer transition-all focus:outline-none shrink-0 ${                 
                isDarkMode                    
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'                    
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'               
              }`}               
              title="Sıralama Seçenekleri"             
            >               
              <option value="NEWEST">En Yeni</option>               
              <option value="OLDEST">En Eski</option>               
              <option value="NAME_ASC">Doktor (A-Z)</option>               
              <option value="NAME_DESC">Doktor (Z-A)</option>               
              <option value="CLINIC_ASC">Birim (A-Z)</option>             
            </select>           
          </div>         
        </div>         

        {/* Excel Grid Table */}         
        <div className={`w-full border-2 rounded-3xl overflow-hidden shadow-xl transition-all ${           
          isDarkMode ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/80' : 'bg-white border-slate-300 shadow-slate-300/40'         
        }`}>           
          <div className="overflow-x-auto w-full scrollbar-thin">             
            <table className="w-full text-left border-collapse min-w-[750px]">               
              <thead>                 
                <tr className={`text-xs sm:text-sm font-black uppercase tracking-wider select-none ${                   
                  isDarkMode                      
                    ? 'bg-slate-800/90 text-amber-400 border-b-2 border-slate-700'                      
                    : 'bg-slate-200/90 text-slate-950 border-b-2 border-slate-300'                 
                }`}>                   
                  <th className={`p-4 border-r font-black tracking-wider ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>BİRİM</th>                   
                  <th className={`p-4 border-r font-black tracking-wider ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>DOKTOR ADI SOYADI</th>                   
                  <th className={`p-4 border-r font-black tracking-wider ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>DURUM</th>                   
                  <th className={`p-4 border-r font-black tracking-wider ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>DAHİLİ TEL</th>                   
                  <th className={`p-4 border-r font-black tracking-wider ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>ODA NO</th>                   
                  {isAdmin && <th className="p-4 text-center font-black tracking-wider">İŞLEMLER</th>}                 
                </tr>               
              </thead>               
              <tbody className={`text-sm sm:text-base font-black ${                 
                isDarkMode ? 'divide-y divide-slate-800/80' : 'divide-y divide-slate-200'               
              }`}>                 
                {filteredAndSortedDoctors.length > 0 ? (                   
                  filteredAndSortedDoctors.map((doc, index) => {
                    const activeStatusToday = getCurrentDayStatus(doc);
                    return (                     
                      <tr                        
                        key={doc.id}                        
                        className={`transition-colors duration-150 cursor-pointer ${                         
                          isDarkMode                            
                            ? index % 2 === 0                              
                              ? 'bg-slate-900/60 hover:bg-slate-800/95'                              
                              : 'bg-slate-950/40 hover:bg-slate-800/95'                           
                            : index % 2 === 0                              
                              ? 'bg-white hover:bg-emerald-100/90'                              
                              : 'bg-slate-50/80 hover:bg-emerald-100/90'                       
                        }`}                     
                      >                       
                        <td className={`p-4 border-r font-black transition-colors ${activeColor} ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`} onClick={() => handleOpenDoctorDetail(doc)}>                         
                          <span>{doc.clinic}</span>                       
                        </td>                       
                        <td className={`p-4 border-r font-black transition-colors ${activeColor} ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`} onClick={() => handleOpenDoctorDetail(doc)}>                         
                          <span className="font-extrabold">{doc.name}</span>                       
                        </td>                       
                        <td className={`p-4 border-r transition-colors ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`} onClick={() => handleOpenDoctorDetail(doc)}>                         
                          <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-black border-2 ${statusStyles[activeStatusToday] || 'bg-emerald-600 text-white'}`}>                           
                            <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>                           
                            {activeStatusToday}                         
                          </span>                       
                        </td>                       
                        <td className={`p-4 border-r font-black text-base sm:text-lg transition-colors ${activeColor} ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`} onClick={() => handleOpenDoctorDetail(doc)}>                         
                          {doc.dahili}                       
                        </td>                       
                        <td className={`p-4 border-r font-black text-base sm:text-lg transition-colors ${activeColor} ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`} onClick={() => handleOpenDoctorDetail(doc)}>                         
                          {doc.roomNo || '101'}                       
                        </td>                       
                        {isAdmin && (                         
                          <td className="p-4 text-center">                           
                            <div className="flex justify-center items-center gap-2">                             
                              <button                               
                                onClick={(e) => { e.stopPropagation(); setEditingDoctor(doc); }}                               
                                className="px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"                             
                              >                               
                                DÜZENLE                              
                              </button>                             
                              <button                               
                                onClick={(e) => { e.stopPropagation(); setDeletingDoctorId(doc.id); }}                               
                                className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"                             
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
                    <td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-slate-400 font-black border-dashed text-base">                         
                      Arama kriterlerinize uygun doktor kaydı bulunamadı.                     
                    </td>                   
                  </tr>                 
                )}               
              </tbody>             
            </table>           
          </div>           
          <div className="p-3 pr-6 flex justify-end items-center">             
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">               
              TOPLAM: {filteredAndSortedDoctors.length} DOKTOR             
            </span>           
          </div>         
        </div>       
      </div>       

      {/* Printable A4 Modal */}       
      {showPrintModal && (         
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-3 backdrop-blur-xs">           
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-5 shadow-2xl max-h-[95vh] overflow-y-auto border-2 border-slate-300">             
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 gap-2">               
              <div className="flex items-center gap-2">                 
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">                   
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h14z" />                 
                </svg>                 
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">                   
                  DOKTOR ÇALIŞMA LİSTESİ BASKISI                 
                </h2>               
              </div>               
              <div className="flex items-center gap-2">                 
                <button onClick={exportToExcel} className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs cursor-pointer transition-all shadow-sm flex items-center gap-1">                   
                  <span>📊</span> EXCEL                 
                </button>                 
                <button onClick={() => window.print()} className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs cursor-pointer transition-all shadow-sm flex items-center gap-1">                   
                  <span>🖨️</span> YAZDIR / PDF                 
                </button>                 
                <button onClick={() => setShowPrintModal(false)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs cursor-pointer transition-all">                   
                  ✕                
                </button>               
              </div>             
            </div>             
            <div id="printableA4Area" className="p-2 bg-white text-slate-950 font-sans leading-tight">               
              <div className="flex justify-between items-end mb-3 pb-2 border-b-2 border-slate-900">                 
                <div>                   
                  <h1 className="text-lg font-black text-slate-950 tracking-tight uppercase">                     
                    Doktor Çalışma Listesi                   
                  </h1>                 
                </div>                 
                <div className="text-right font-black font-mono text-[11px] text-slate-800">                   
                  <span>Tarih: {onlyDateStr}</span>                 
                </div>               
              </div>               
              <div className="w-full">                 
                <table className="w-full text-left border-collapse border border-slate-900 text-[11px]">                   
                  <thead>                     
                    <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">                       
                      <th className="py-1.5 px-2 border-r border-slate-700">BİRİM / POLİK</th>                       
                      <th className="py-1.5 px-2 border-r border-slate-700">DOKTOR ADI SOYADI</th>                       
                      <th className="py-1.5 px-2 border-r border-slate-700 text-center">DURUM</th>                       
                      <th className="py-1.5 px-2 border-r border-slate-700 text-center">DAHİLİ</th>                       
                      <th className="py-1.5 px-2 text-center">ODA NO</th>                     
                    </tr>                   
                  </thead>                   
                  <tbody className="divide-y divide-slate-300 font-bold">                     
                    {filteredAndSortedDoctors.map((doc, i) => {                       
                      const activeStatusToday = getCurrentDayStatus(doc);
                      return (
                        <tr key={doc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>                         
                          <td className="py-1 px-2 border-r border-slate-300 uppercase text-slate-900 font-extrabold">{doc.clinic}</td>                         
                          <td className="py-1 px-2 border-r border-slate-300 uppercase text-slate-950 font-black">{doc.name}</td>                         
                          <td className="py-1 px-2 border-r border-slate-300 text-center uppercase">                           
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${                             
                              activeStatusToday === 'AMELİYATTA' ? 'bg-purple-100 text-purple-900 border border-purple-300' :                             
                              activeStatusToday === 'POLİKLİNİK' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :                             
                              'bg-amber-100 text-amber-900 border border-amber-300'                           
                            }`}>                             
                              {activeStatusToday}                           
                            </span>                         
                          </td>                         
                          <td className="py-1 px-2 border-r border-slate-300 font-mono text-center text-slate-950">{doc.dahili}</td>                         
                          <td className="py-1 px-2 font-mono text-center text-slate-950">{doc.roomNo || '101'}</td>                       
                        </tr>                     
                      );
                    })}                   
                  </tbody>                 
                </table>               
              </div>               
              <div className="mt-2 pt-1 flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-200">                 
                <span>Hastane Bilgi Sistemi</span>                 
                <span>Saat: {formattedLiveTimeWithSeconds}</span>               
              </div>             
            </div>           
          </div>         
        </div>       
      )}       

      {/* Windows Interactive Schedule Detail Modal */}       
      {selectedDoctorDetail && (         
        <>           
          {!isMinimized && (             
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-6" onClick={(e) => { if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) { setSelectedDoctorDetail(null); updateGlobalDockStateUser(null, false); } }}>               
              <div ref={modalBoxRef} style={{ transform: !isMaximized ? `translate(${winPos.x}px, ${winPos.y}px)` : 'none', width: !isMaximized ? `${winSize.width}px` : '100%', height: !isMaximized ? `${winSize.height}px` : '100%' }} className={`flex flex-col relative shadow-2xl border-2 overflow-hidden transition-all duration-75 ${isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-3xl max-h-[85vh] rounded-3xl'} ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>                 
                <div onMouseDown={handleMouseDownHeader} className={`p-4 sm:p-5 border-b-2 flex justify-between items-center select-none ${isMaximized ? 'cursor-default' : 'cursor-move'} ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>                   
                  <div>                     
                    <h3 className="text-base sm:text-xl font-black text-emerald-500 uppercase">{selectedDoctorDetail.name}</h3>                     
                    <p className="text-xs sm:text-sm font-black text-slate-400 mt-0.5">                       
                      BİRİM: <span className="text-emerald-500 dark:text-emerald-400 font-black">{selectedDoctorDetail.clinic}</span> • DAHİLİ TEL: <span className="text-amber-500 dark:text-amber-400 font-black">{selectedDoctorDetail.dahili}</span> • ODA NO: <span className="text-emerald-500 dark:text-emerald-400 font-black">{selectedDoctorDetail.roomNo || '101'}</span>                     
                    </p>                   
                  </div>                   
                  <div className="flex items-center gap-1.5 font-mono">                     
                    <button onClick={() => { setIsMinimized(true); updateGlobalDockStateUser(selectedDoctorDetail, true); }} className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-base transition-all flex items-center justify-center cursor-pointer" title="Simge Durumuna Küçült">🗕</button>                     
                    <button onClick={() => setIsMaximized(!isMaximized)} className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-base transition-all flex items-center justify-center cursor-pointer" title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}>{isMaximized ? '🗗' : '🗖'}</button>                     
                    <button onClick={() => { setSelectedDoctorDetail(null); updateGlobalDockStateUser(null, false); }} className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-base transition-all flex items-center justify-center cursor-pointer" title="Kapat">✕</button>                   
                  </div>                 
                </div>                 
                <div className={`px-6 py-3 border-b ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                   
                  <h4 className="text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">                       
                    📅 DETAYLI ÇALIŞMA VE İZİN TAKVİMİ                 
                  </h4>                 
                </div>                 
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 font-black">                   
                  {selectedDoctorDetail.scheduleDays && selectedDoctorDetail.scheduleDays.length > 0 ? (                     
                    selectedDoctorDetail.scheduleDays.map((sd, idx) => {                       
                      let dayObj;                       
                      if (sd.fullDateObj) {                         
                        dayObj = new Date(sd.fullDateObj);                       
                      } else if (sd.date) {                         
                        const parts = sd.date.split('.');                         
                        if (parts.length === 3) {                           
                          dayObj = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);                         
                        }                       
                      }                                              
                      if (dayObj) dayObj.setHours(0, 0, 0, 0);                       
                      const isPast = dayObj && dayObj < today;                       
                      const isToday = dayObj && dayObj.getTime() === today.getTime();                       
                      const monthNum = dayObj ? String(dayObj.getMonth() + 1).padStart(2, '0') : '';                       
                      const dayNum = dayObj ? String(dayObj.getDate()).padStart(2, '0') : '';                       
                      const yearNum = dayObj ? dayObj.getFullYear() : '';                       
                      const isoDateStr = `${yearNum}-${monthNum}-${dayNum}`;                                              
                      const holidayName = TURKEY_OFFICIAL_HOLIDAYS_2026[isoDateStr];                       
                      return (                         
                        <div key={idx} ref={isToday ? todayRef : null} className={`flex justify-between items-center p-4 rounded-2xl border-2 font-black transition-all ${isPast ? 'opacity-40 grayscale-[30%]' : ''} ${isToday ? 'border-amber-400 bg-amber-500/10 shadow-lg scale-[1.005]' : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>                           
                          <div className="flex items-center gap-3 text-xs sm:text-sm">                             
                            <span className={`font-black ${isToday ? 'text-amber-500 dark:text-amber-400 text-base' : ''}`}>{sd.date}</span>                             
                            <span className="text-slate-400 text-xs font-sans">{sd.day}</span>                             
                            {isPast && <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-md font-sans font-bold">GEÇMİŞ TARİH</span>}                             
                            {isToday && <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-md font-sans">BUGÜN</span>}                             
                            {holidayName && <span className="text-[10px] bg-purple-600 text-white font-black px-2.5 py-0.5 rounded-md font-sans">🇹🇷 {holidayName}</span>}                           
                          </div>                           
                          <span className={`px-4 py-1.5 rounded-xl text-xs font-black border-2 ${statusStyles[sd.status] || 'bg-slate-800 text-slate-300'}`}>                             
                            {holidayName ? 'RESMİ TATİL' : sd.status}                           
                          </span>                         
                        </div>                       
                      );                     
                    })                   
                  ) : (                     
                    <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed rounded-2xl">                       
                      Bu doktor için detaylı takvim bulunmamaktadır.                     
                    </div>                   
                  )}                 
                </div>                 
                {!isMaximized && (                   
                  <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100" title="Boyutu Değiştir">                     
                    <span className="text-xs font-mono font-black">◢</span>                   
                  </div>                 
                )}               
              </div>             
            </div>           
          )}           
          
          {/* Minimized Dock */}           
          {isMinimized && (             
            <div className="fixed bottom-4 right-4 z-[250] transition-none animate-none">               
              <div onClick={() => { setIsMinimized(false); updateGlobalDockStateUser(selectedDoctorDetail, false); }} className={`p-3.5 px-5 rounded-2xl border-2 shadow-2xl flex items-center gap-4 cursor-pointer hover:scale-105 transition-all ${isDarkMode ? 'bg-slate-900 border-emerald-500/50 text-slate-100' : 'bg-white border-emerald-500 text-slate-900'}`}>                 
                <div className="flex items-center gap-2 font-black text-xs">                   
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>                   
                  <span>📅 {selectedDoctorDetail.name} (TAKVİM AÇIK)</span>                 
                </div>                                  
                <div className="flex items-center gap-1 font-mono">                   
                  <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); updateGlobalDockStateUser(selectedDoctorDetail, false); }} className="px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-white">🗖 BÜYÜT</button>                   
                  <button onClick={(e) => { e.stopPropagation(); setSelectedDoctorDetail(null); updateGlobalDockStateUser(null, false); }} className="px-2 py-1 bg-rose-500/20 text-rose-500 rounded-lg text-xs font-black hover:bg-rose-500 hover:text-white">✕</button>                 
                </div>               
              </div>             
            </div>           
          )}         
        </>       
      )}       

      {/* Edit Doctor Modal */}       
      {editingDoctor && (         
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">           
          <div className={`w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>             
            <div className="flex justify-between items-center mb-4 pb-2 border-b">               
              <h3 className="text-lg font-black text-amber-500">✏️ DOKTOR BİLGİSİ DÜZENLE</h3>               
              <button onClick={() => setEditingDoctor(null)} className="text-slate-400 font-black text-xl cursor-pointer">✕</button>             
            </div>             
            <form onSubmit={handleSaveEditedDoctor} className="space-y-4 font-black">               
              <div>                 
                <label className="block text-xs mb-1">DOKTOR ADI SOYADI</label>                 
                <input type="text" required value={editingDoctor.name} onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value.toUpperCase() })} className={`w-full px-3 py-2 rounded-xl border-2 font-black uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`} />               
              </div>               
              <div>                 
                <label className="block text-xs mb-1">BİRİM</label>                 
                <input type="text" required value={editingDoctor.clinic} onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value.toUpperCase() })} className={`w-full px-3 py-2 rounded-xl border-2 font-black uppercase ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`} />               
              </div>               
              <div>                 
                <label className="block text-xs mb-1">MEVCUT DURUM</label>                 
                <select value={editingDoctor.status} onChange={(e) => setEditingDoctor({ ...editingDoctor, status: e.target.value })} className={`w-full px-3 py-2 rounded-xl border-2 font-black ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>                   
                  <option value="POLİKLİNİK">POLİKLİNİK</option>                   
                  <option value="AMELİYATTA">AMELİYATTA</option>                   
                  <option value="YILLIK İZİN">YILLIK İZİN</option>                   
                  <option value="RAPORLU">RAPORLU</option>                   
                  <option value="NÖBET SONRASI İZİN">NÖBET SONRASI İZİN</option>                 
                </select>               
              </div>               
              <div>                 
                <label className="block text-xs mb-1">DAHİLİ NUMARASI</label>                 
                <input type="text" required value={editingDoctor.dahili} onChange={(e) => setEditingDoctor({ ...editingDoctor, dahili: e.target.value })} className={`w-full px-3 py-2 rounded-xl border-2 font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`} />               
              </div>               
              <div>                 
                <label className="block text-xs mb-1">ODA NO</label>                 
                <input type="text" required value={editingDoctor.roomNo || '101'} onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNo: e.target.value })} className={`w-full px-3 py-2 rounded-xl border-2 font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`} />               
              </div>               
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-base shadow-lg cursor-pointer">                 
                DEĞİŞİKLİKLERİ KAYDET               
              </button>             
            </form>           
          </div>         
        </div>       
      )}       

      {/* Delete Confirmation Modal */}       
      {deletingDoctorId && (         
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">           
          <div className={`w-full max-w-sm rounded-2xl border-2 p-6 shadow-2xl text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>             
            <h3 className="text-xl font-black mb-2 text-rose-500">🗑️ DOKTORU SİL</h3>             
            <p className="text-xs font-bold text-slate-400 mb-6">Bu doktoru silmek istediğinize emin misiniz?</p>             
            <div className="flex gap-3">               
              <button onClick={() => setDeletingDoctorId(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-black rounded-xl text-sm cursor-pointer">İPTAL</button>               
              <button onClick={handleDeleteDoctorConfirm} className="flex-1 py-2.5 bg-rose-600 text-white font-black rounded-xl text-sm shadow-md cursor-pointer">SİL</button>             
            </div>           
          </div>         
        </div>       
      )}     
    </div>   
  ); 
}