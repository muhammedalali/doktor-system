'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { db } from '@/lib/firebase';
import { addDoc, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';

const defaultDepartments = [
  'ÇOCUK SAĞLIĞI VE HASTALIKLARI',
  'ENFEKSİYON HASTALIKLARI',
  'GENEL CERRAHİ',
  'GÖĞÜS HASTALIKLARI',
  'ORTOPEDİ VE TRAVMATOLOJİ',
  'ÜROLOJİ',
  'KADIN HASTALIKLARI VE DOĞUM',
  'DERMATOLOJİ',
  'KULAK BURUN BOĞAZ (KBB)',
  'GÖZ HASTALIKLARI',
  'KARDİYOLOJİ',
  'PSİKİYATRİ',
  'NÖROLOJİ',
  'DİŞ HEKİMLİĞİ',
  'İÇ HASTALIKLARI (DAHİLİYE)',
  'RADYOLOJİ (USG)'
];

const departmentIcons = {
  'ÇOCUK SAĞLIĞI VE HASTALIKLARI': '👶',
  'ENFEKSİYON HASTALIKLARI': '🦠',
  'GENEL CERRAHİ': '🩺',
  'GÖĞÜS HASTALIKLARI': '🫁',
  'ORTOPEDİ VE TRAVMATOLOJİ': '🦴',
  'ÜROLOJİ': '🧬',
  'KADIN HASTALIKLARI VE DOĞUM': '🤱',
  'DERMATOLOJİ': '✨',
  'KULAK BURUN BOĞAZ (KBB)': '👂',
  'GÖZ HASTALIKLARI': '👁️',
  'KARDİYOLOJİ': '🫀',
  'PSİKİYATRİ': '🧠',
  'NÖROLOJİ': '⚡',
  'DİŞ HEKİMLİĞİ': '🦷',
  'İÇ HASTALIKLARI (DAHİLİYE)': '📋',
  'RADYOLOJİ (USG)': '📡'
};

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

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'POLİKLİNİK':
    case 'POLİK':
      return 'bg-emerald-600 text-white border-emerald-500 shadow-xs';
    case 'AMELİYATTA':
      return 'bg-purple-600 text-white border-purple-500 shadow-xs';
    case 'RESMİ TATİL':
      return 'bg-indigo-700 text-white border-indigo-500 shadow-xs font-black';
    case 'HAFTA SONU':
      return 'bg-rose-600 text-white border-rose-400 shadow-xs';
    case 'YILLIK İZİN':
    case 'RAPORLU':
      return 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs';
    case 'NÖBET SONRASI İZİN':
      return 'bg-sky-600 text-white border-sky-500 shadow-xs';
    case 'ASKERLİK':
      return 'bg-slate-800 text-slate-300 border-slate-600 shadow-xs font-black';
    default:
      return 'bg-slate-700 text-white border-slate-500';
  }
};

export default function AdminDoctorsPage() {
  const { isDarkMode, activeColor, setIsSidebarOpen } = useTheme();
  const { doctors, setDoctors } = useData();
  
  const [openedFolder, setOpenedFolder] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  const [departments, setDepartments] = useState(defaultDepartments);
  const [newCustomDept, setNewCustomDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [collapsedDepts, setCollapsedDepts] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [winPos, setWinPos] = useState({ x: 0, y: 0 });
  const [winSize, setWinSize] = useState({ width: 850, height: 600 });
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [deletingDept, setDeletingDept] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const [docName, setDocName] = useState('');
  const [docClinic, setDocClinic] = useState(defaultDepartments[0]);
  const [docDahili, setDocDahili] = useState('');
  const [docRoomNo, setDocRoomNo] = useState('');

  const todayRef = useRef(null);
  const modalBoxRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isFirstOpenRef = useRef(false);
  const isScheduleDirtyRef = useRef(false);

  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const currentUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    const uName = currentUser.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';
    const hasPermission = currentUser.role === 'YÖNETİCİ' || uName === 'ADMIN' || currentUser.permissions?.canEditDoctors;

    if (!hasPermission) {
      router.push('/dashboard');
      return;
    }

    const savedDepts = JSON.parse(localStorage.getItem('app_departments') || '[]');
    if (savedDepts.length > 0) {
      setDepartments(savedDepts);
    } else {
      setDepartments(defaultDepartments);
      localStorage.setItem('app_departments', JSON.stringify(defaultDepartments));
    }
  }, [router]);

  useEffect(() => {
    if ((showScheduleModal && !isMinimized) || editingDoctor || deletingDept || deletingDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showScheduleModal, isMinimized, editingDoctor, deletingDept, deletingDoc]);

  useEffect(() => {
    if (showScheduleModal && selectedDoctor && !isMinimized && isFirstOpenRef.current) {
      const timer = setTimeout(() => {
        if (todayRef.current) {
          todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        isFirstOpenRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showScheduleModal, selectedDoctor, isMinimized]);

  const handleSmartBack = () => {
    if (openedFolder) {
      setOpenedFolder(null);
    } else {
      router.push('/dashboard');
    }
  };

  const handleMouseDownHeader = (e) => {
    if (isMaximized) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - winPos.x, y: e.clientY - winPos.y };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      setWinPos({ x: moveEvent.clientX - dragStartRef.current.x, y: moveEvent.clientY - dragStartRef.current.y });
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
      const newWidth = Math.max(500, startWidth + (moveEvent.clientX - startX));
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

  const handleOpenSchedule = (doc) => {
    setSelectedDoctor(doc);
    isFirstOpenRef.current = true;
    isScheduleDirtyRef.current = false;
    setIsMinimized(false);
    setIsMaximized(false);
    setWinPos({ x: 0, y: 0 });
    setShowScheduleModal(true);
  };

  const handleCloseScheduleModal = async () => {
    if (selectedDoctor && isScheduleDirtyRef.current) {
      try {
        await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
          scheduleDays: selectedDoctor.scheduleDays,
          updatedAt: Date.now()
        });
        if (setDoctors) {
          setDoctors(prev => prev.map(d => d.id === selectedDoctor.id ? selectedDoctor : d));
        }
      } catch (e) {
        console.error('Takvim güncelleme hatası:', e);
      }
    }
    isScheduleDirtyRef.current = false;
    setShowScheduleModal(false);
  };

  const handleRegenerateMonth = (year, month) => {
    if (!selectedDoctor) return;
    const newSchedule = generateFullMonthSchedule(year, month);
    const updatedDoc = { ...selectedDoctor, scheduleDays: newSchedule };
    setSelectedDoctor(updatedDoc);
    isScheduleDirtyRef.current = true;
  };

  const handleDayStatusChange = (index, newStatus) => {
    if (!selectedDoctor) return;
    const updatedSchedule = [...selectedDoctor.scheduleDays];
    updatedSchedule[index].status = newStatus;
    const updatedDoc = { ...selectedDoctor, scheduleDays: updatedSchedule };
    setSelectedDoctor(updatedDoc);
    isScheduleDirtyRef.current = true;
  };

  const handleAddCustomDepartment = (e) => {
    e.preventDefault();
    if (!newCustomDept.trim()) return;
    const deptUpper = newCustomDept.trim().toLocaleUpperCase('tr-TR');
    if (!departments.includes(deptUpper)) {
      const updated = [...departments, deptUpper];
      setDepartments(updated);
      localStorage.setItem('app_departments', JSON.stringify(updated));
      triggerToast(`Bölüm başarıyla eklendi: ${deptUpper}`);
    }
    setNewCustomDept('');
  };

  const handleConfirmDeleteDepartment = () => {
    if (!deletingDept) return;
    const updatedDepts = departments.filter(d => d !== deletingDept);
    setDepartments(updatedDepts);
    localStorage.setItem('app_departments', JSON.stringify(updatedDepts));
    triggerToast(`Bölüm silindi: ${deletingDept}`);
    setDeletingDept(null);
  };

  const handleConfirmDeleteDoctor = async () => {
    if (!deletingDoc) return;
    try {
      await deleteDoc(doc(db, 'doctors', deletingDoc.id));
      if (setDoctors) {
        setDoctors(prev => prev.filter(d => d.id !== deletingDoc.id));
      }
      triggerToast(`Doktor silindi: ${deletingDoc.name}`);
      setDeletingDoc(null);
    } catch (e) {
      console.error('Doktor silme hatası:', e);
    }
  };

  const handleSaveNewDoctor = async (e) => {
    e.preventDefault();
    if (!docName) return;
    const now = Date.now();
    const newDoc = {
      name: docName.trim().toLocaleUpperCase('tr-TR'),
      clinic: docClinic.trim().toLocaleUpperCase('tr-TR'),
      status: 'POLİKLİNİK',
      dahili: docDahili || '',
      roomNo: docRoomNo || '',
      scheduleDays: generateFullMonthSchedule(2026, 8),
      createdAt: now,
      updatedAt: now
    };
    try {
      const docRef = await addDoc(collection(db, 'doctors'), newDoc);
      if (setDoctors) {
        setDoctors(prev => [...prev, { id: docRef.id, ...newDoc }]);
      }
      setDocName(''); setDocDahili(''); setDocRoomNo('');
      triggerToast(`Doktor eklendi: ${newDoc.name}`);
    } catch (e) {
      console.error('Doktor ekleme hatası:', e);
    }
  };

  const handleSaveEditedDoctor = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    try {
      const updatedData = {
        name: editingDoctor.name.trim().toLocaleUpperCase('tr-TR'),
        clinic: editingDoctor.clinic.trim().toLocaleUpperCase('tr-TR'),
        dahili: editingDoctor.dahili || '',
        roomNo: editingDoctor.roomNo || '',
        updatedAt: Date.now()
      };
      await updateDoc(doc(db, 'doctors', editingDoctor.id), updatedData);
      if (setDoctors) {
        setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? { ...d, ...updatedData } : d));
      }
      setEditingDoctor(null);
      triggerToast(`Doktor bilgileri güncellendi: ${editingDoctor.name}`);
    } catch (e) {
      console.error('Doktor güncelleme hatası:', e);
    }
  };

  const getDoctorsByDept = (deptName) => {
    const cleanDept = deptName.trim().toLocaleUpperCase('tr-TR');
    let filtered = doctors.filter(d => d.clinic?.trim().toLocaleUpperCase('tr-TR') === cleanDept);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleUpperCase('tr-TR');
      filtered = filtered.filter(d => 
        d.name?.includes(q) || 
        d.dahili?.includes(q) || 
        d.roomNo?.includes(q)
      );
    }

    return filtered;
  };

  const toggleCollapseDepartment = (deptName) => {
    setCollapsedDepts(prev => ({
      ...prev,
      [deptName]: !prev[deptName]
    }));
  };

  const toggleAllDepartments = (collapseState) => {
    const newStates = {};
    departments.forEach(dept => {
      newStates[dept] = collapseState;
    });
    setCollapsedDepts(newStates);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 min-h-screen">
      
      {/* 🔝 HEADER BAR */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border-2 shadow-lg flex items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        
        <button
          onClick={handleSmartBack}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 font-black transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950"
          title={openedFolder ? "Ana Menüye Dön" : "Ana Sayfaya Dön"}
        >
          <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-sm sm:text-lg font-black tracking-wide text-amber-500 uppercase">
            🏥 BÖLÜM VE DOKTOR YÖNETİMİ
          </h1>
          {openedFolder && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {openedFolder === 'ADD_FOLDER' ? '• Bölüm ve Doktor Ekle' : '• Eklenen Bölüm ve Doktorlar'}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 font-black transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 ${
            isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400 hover:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'
          }`}
          title="Menü"
        >
          <span className="text-base">☰</span>
        </button>
      </div>

      {/* 📁 ANA KLASÖR GÖRÜNÜMÜ */}
      {!openedFolder && (
        <div className="flex flex-wrap justify-start items-start gap-4 sm:gap-5 py-4 animate-fadeIn">
          
          <div
            onClick={() => setOpenedFolder('ADD_FOLDER')}
            className={`w-full sm:w-72 p-4 sm:p-5 rounded-2xl border-2 shadow-md cursor-pointer flex flex-col justify-between space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-2xl font-black text-amber-500 select-none">
                ➕
              </span>
              <h2 className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                Bölüm ve Doktor Ekle
              </h2>
            </div>

            <div className="flex justify-end pt-1">
              <span className="text-base font-black text-amber-500">
                ➜
              </span>
            </div>
          </div>

          <div
            onClick={() => setOpenedFolder('LIST_FOLDER')}
            className={`w-full sm:w-72 p-4 sm:p-5 rounded-2xl border-2 shadow-md cursor-pointer flex flex-col justify-between space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-2xl font-black text-emerald-500 select-none">
                📑
              </span>
              <h2 className="text-xs sm:text-sm font-black text-emerald-500 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                Eklenen Bölüm ve Doktorlar
              </h2>
            </div>

            <div className="flex justify-end pt-1">
              <span className="text-base font-black text-emerald-500">
                ➜
              </span>
            </div>
          </div>

        </div>
      )}

      {/* 📌 KLASÖR 1: BÖLÜM VE DOKTOR EKLE */}
      {openedFolder === 'ADD_FOLDER' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-md space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-700/50">
                <span className="text-xl">🏥</span>
                <h3 className="text-xs sm:text-sm font-black text-amber-500 uppercase">1. BÖLÜM / KLİNİK EKLE</h3>
              </div>

              <form onSubmit={handleAddCustomDepartment} className="space-y-3.5 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400 uppercase tracking-wider">BÖLÜM ADI</label>
                  <input
                    type="text"
                    required
                    placeholder="ÖRNEK: NÖROLOJİ"
                    value={newCustomDept}
                    onChange={(e) => setNewCustomDept(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs uppercase outline-none focus:border-amber-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-xs transition-all uppercase tracking-wider"
                >
                  + BÖLÜMÜ KAYDET
                </button>
              </form>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-md space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-700/50">
                <span className="text-xl">👨‍⚕️</span>
                <h3 className="text-xs sm:text-sm font-black text-emerald-500 uppercase">2. DOKTOR VE TAKVİM EKLE</h3>
              </div>

              <form onSubmit={handleSaveNewDoctor} className="space-y-3 font-black">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-400 uppercase tracking-wider">KLİNİK / BÖLÜM SEÇİN</label>
                  <select
                    value={docClinic}
                    onChange={(e) => setDocClinic(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs outline-none cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{departmentIcons[dept] || '🏥'} {dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] mb-1 text-slate-400 uppercase tracking-wider">DOKTOR ADI SOYADI</label>
                  <input
                    type="text"
                    required
                    placeholder="ÖRNEK: DR. AHMET YILMAZ"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black text-xs focus:border-emerald-500 outline-none uppercase ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] mb-1 text-amber-500 uppercase tracking-wider">DAHİLİ TEL</label>
                    <input
                      type="text"
                      placeholder="1012"
                      value={docDahili}
                      onChange={(e) => setDocDahili(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-mono text-xs focus:border-amber-500 outline-none ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1 text-emerald-500 uppercase tracking-wider">ODA NO</label>
                    <input
                      type="text"
                      placeholder="102"
                      value={docRoomNo}
                      onChange={(e) => setDocRoomNo(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-mono text-xs focus:border-emerald-500 outline-none ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-xs transition-all uppercase tracking-wider"
                >
                  + DOKTORU SİSTEME KAYDET
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* 📌 KLASÖR 2: EKLENEN BÖLÜM VE DOKTORLAR */}
      {openedFolder === 'LIST_FOLDER' && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-md ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
          }`}>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 mb-4 border-b border-slate-700/50">
              
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="🔍 Doktor Ara (İsim, Dahili, Oda)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border-2 font-black text-xs outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => toggleAllDepartments(false)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 rounded-xl transition-all cursor-pointer font-black text-[11px]"
                >
                  📂 TÜMÜNÜ AÇ
                </button>
                <button
                  onClick={() => toggleAllDepartments(true)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer font-black text-[11px]"
                >
                  📁 TÜMÜNÜ KAPAT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {departments.map((dept) => {
                const deptDocs = getDoctorsByDept(dept);
                const isCollapsed = collapsedDepts[dept] || false;
                const deptIcon = departmentIcons[dept] || '🏥';

                if (searchQuery.trim() && deptDocs.length === 0) return null;

                return (
                  <div key={dept} className={`p-4 rounded-2xl border-2 font-black space-y-3 shadow-xs transition-all ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}>
                    
                    <div 
                      onClick={() => toggleCollapseDepartment(dept)}
                      className="flex justify-between items-center pb-2 border-b border-slate-700/50 cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{deptIcon}</span>
                        <span className={`text-xs font-black uppercase transition-colors group-hover:text-amber-400 ${activeColor}`}>
                          {dept}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-black">
                          {deptDocs.length} DOKTOR
                        </span>
                        
                        <button
                          onClick={() => setDeletingDept(dept)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                          title="Bölümü Sil"
                        >
                          🗑️
                        </button>

                        <button
                          onClick={() => toggleCollapseDepartment(dept)}
                          className="p-1 text-amber-400 hover:bg-amber-500/10 rounded-lg text-xs transition-all cursor-pointer"
                          title={isCollapsed ? "Genişlet" : "Daralt"}
                        >
                          {isCollapsed ? '▼' : '▲'}
                        </button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-2 animate-fadeIn">
                        {deptDocs.length > 0 ? (
                          deptDocs.map((doc) => (
                            <div 
                              key={doc.id} 
                              onClick={() => handleOpenSchedule(doc)}
                              className={`p-3 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01] ${
                                isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-500'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className={`font-black text-xs uppercase ${activeColor}`}>{doc.name}</div>
                                <div className="flex gap-1.5">
                                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md">
                                    TEL: {doc.dahili || '-'}
                                  </span>
                                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md">
                                    ODA: {doc.roomNo || '-'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDoctor(doc);
                                  }}
                                  className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 rounded-lg border border-amber-500/30 text-[11px] font-black cursor-pointer transition-all"
                                  title="Doktoru Düzenle"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingDoc(doc);
                                  }}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-500/30 text-[11px] font-black cursor-pointer transition-all"
                                  title="Doktoru Sil"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] text-slate-500 font-black p-3 text-center border-2 border-dashed border-slate-800 rounded-xl">
                            Bu bölümde doktor kaydı bulunmuyor.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ✏️ DÜZENLEME MODALI */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-md rounded-2xl border-2 p-5 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
              <h3 className="text-xs font-black text-amber-500 uppercase">✏️ DOKTOR BİLGİSİ DÜZENLE</h3>
              <button onClick={() => setEditingDoctor(null)} className="text-slate-400 font-black text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEditedDoctor} className="space-y-3.5 font-black">
              <div>
                <label className="block text-[11px] mb-1 text-slate-400 uppercase">KLİNİK / BÖLÜM</label>
                <select
                  value={editingDoctor.clinic}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, clinic: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 font-black text-xs outline-none cursor-pointer ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-400 uppercase">DOKTOR ADI SOYADI</label>
                <input
                  type="text"
                  required
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value.toLocaleUpperCase('tr-TR') })}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 font-black text-xs outline-none uppercase ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] mb-1 text-amber-500 uppercase">DAHİLİ TEL</label>
                  <input
                    type="text"
                    value={editingDoctor.dahili || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, dahili: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 font-mono text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] mb-1 text-emerald-500 uppercase">ODA NO</label>
                  <input
                    type="text"
                    value={editingDoctor.roomNo || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNo: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 font-mono text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer transition-all uppercase tracking-wider">
                GÜNCELLEMELERİ KAYDET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ BÖLÜM SİLME MODALI */}
      {deletingDept && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-xs rounded-2xl border-2 p-5 shadow-2xl text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <h3 className="text-base font-black mb-1 text-rose-500">🗑️ BÖLÜMÜ SİL</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-5">
              <span className="text-amber-400 font-black">{deletingDept}</span> bölümünü silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2.5 font-black">
              <button onClick={() => setDeletingDept(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDepartment} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs shadow-md cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ DOKTOR SİLME MODALI */}
      {deletingDoc && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className={`w-full max-w-xs rounded-2xl border-2 p-5 shadow-2xl text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <h3 className="text-base font-black mb-1 text-rose-500">🗑️ DOKTORU SİL</h3>
            <p className="text-[11px] font-bold text-slate-400 mb-5">
              <span className="text-amber-400 font-black">{deletingDoc.name}</span> isimli doktoru silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-2.5 font-black">
              <button onClick={() => setDeletingDoc(null)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDoctor} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs shadow-md cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* 📅 DOKTOR AYLIK TAKVİM PENCERESİ MODALI */}
      {showScheduleModal && selectedDoctor && (
        <>
          {!isMinimized && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-5"
              onClick={(e) => {
                if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) {
                  handleCloseScheduleModal();
                }
              }}
            >
              <div 
                ref={modalBoxRef}
                style={{
                  transform: !isMaximized ? `translate(${winPos.x}px, ${winPos.y}px)` : 'none',
                  width: !isMaximized ? `${winSize.width}px` : '100%',
                  height: !isMaximized ? `${winSize.height}px` : '100%'
                }}
                className={`flex flex-col relative shadow-2xl border-2 overflow-hidden transition-all duration-75 ${
                  isMaximized 
                    ? 'w-full h-full max-w-none max-h-none rounded-none' 
                    : 'rounded-2xl max-w-[95vw] max-h-[95vh]'
                } ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                
                <div 
                  onMouseDown={handleMouseDownHeader}
                  className={`p-3.5 sm:p-4 border-b-2 flex justify-between items-center select-none ${
                    isMaximized ? 'cursor-default' : 'cursor-move'
                  } ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
                >
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-amber-500 uppercase">{selectedDoctor.name}</h3>
                    <p className="text-[11px] font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
                      {selectedDoctor.clinic} • DAHİLİ: <span className="font-mono text-amber-400">{selectedDoctor.dahili || '-'}</span> • ODA NO: <span className="font-mono text-emerald-400">{selectedDoctor.roomNo || '-'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    <button 
                      onClick={() => setIsMinimized(true)}
                      className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-sm transition-all flex items-center justify-center cursor-pointer"
                      title="Simge Durumuna Küçült"
                    >
                      🗕
                    </button>
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-sm transition-all flex items-center justify-center cursor-pointer"
                      title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}
                    >
                      {isMaximized ? '🗗' : '🗖'}
                    </button>
                    <button 
                      onClick={handleCloseScheduleModal}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-sm transition-all flex items-center justify-center cursor-pointer"
                      title="Kapat"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider">📅 AYLIK ÇALIŞMA TAKVİMİ:</span>
                  <div className="flex gap-2 font-black">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setSelectedMonth(m);
                        handleRegenerateMonth(selectedYear, m);
                      }} 
                      className={`px-2.5 py-1 rounded-lg border-2 text-[11px] font-black outline-none cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map((mName, idx) => (
                        <option key={idx} value={idx}>{mName}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => {
                        const y = parseInt(e.target.value);
                        setSelectedYear(y);
                        handleRegenerateMonth(y, selectedMonth);
                      }} 
                      className={`px-2.5 py-1 rounded-lg border-2 text-[11px] font-black outline-none cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2 font-black">
                  {selectedDoctor.scheduleDays && selectedDoctor.scheduleDays.map((sd, idx) => {
                    const itemDate = parseItemDate(sd);
                    let isPast = false;
                    let isToday = false;

                    if (itemDate) {
                      itemDate.setHours(0, 0, 0, 0);
                      isPast = itemDate.getTime() < today.getTime();
                      isToday = itemDate.getTime() === today.getTime();
                    }

                    return (
                      <div 
                        key={idx} 
                        ref={isToday ? todayRef : null}
                        className={`flex justify-between items-center p-3 rounded-xl border-2 transition-all ${
                          isPast 
                            ? 'opacity-35 grayscale-[40%] bg-slate-950/30 border-slate-800/80 text-slate-500' 
                            : isToday 
                            ? 'border-amber-400 bg-amber-500/15 shadow-md scale-[1.002] text-amber-300' 
                            : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className={`font-black ${isToday ? 'text-amber-400 text-sm' : ''}`}>{sd.date}</span>
                          
                          <span className={`text-[11px] font-black uppercase tracking-wide ${isToday ? 'text-amber-400' : 'text-slate-300'}`}>
                            {sd.day}
                          </span>
                          
                          {isPast && (
                            <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-sans font-bold">
                              GEÇMİŞ
                            </span>
                          )}

                          {isToday && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded font-sans uppercase tracking-wider">
                              BUGÜN
                            </span>
                          )}

                          {sd.holidayName && (
                            <span className="text-[9px] bg-purple-600 text-white font-black px-2 py-0.5 rounded font-sans">
                              🇹🇷 {sd.holidayName}
                            </span>
                          )}
                        </div>

                        <select
                          value={sd.status}
                          disabled={isPast}
                          onChange={(e) => handleDayStatusChange(idx, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg border-2 text-[11px] font-black outline-none transition-all cursor-pointer ${getStatusBadgeStyle(sd.status)} ${
                            isPast ? 'cursor-not-allowed opacity-60' : ''
                          }`}
                        >
                          <option value="POLİKLİNİK" className="bg-emerald-600 text-white">POLİKLİNİK</option>
                          <option value="AMELİYATTA" className="bg-purple-600 text-white">AMELİYATTA</option>
                          <option value="RESMİ TATİL" className="bg-indigo-700 text-white">RESMİ TATİL</option>
                          <option value="HAFTA SONU" className="bg-rose-600 text-white">HAFTA SONU</option>
                          <option value="YILLIK İZİN" className="bg-amber-500 text-slate-950">YILLIK İZİN</option>
                          <option value="RAPORLU" className="bg-amber-500 text-slate-950">RAPORLU</option>
                          <option value="NÖBET SONRASI İZİN" className="bg-sky-600 text-white">NÖBET SONRASI İZİN</option>
                          <option value="ASKERLİK" className="bg-slate-800 text-white">ASKERLİK</option>
                        </select>
                      </div>
                    );
                  })}
                </div>

                {!isMaximized && (
                  <div 
                    onMouseDown={handleMouseDownResize}
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100"
                    title="Boyutu Değiştir"
                  >
                    <span className="text-[10px] font-mono font-black">◢</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMinimized && (
            <div className="fixed bottom-4 right-4 z-[250]">
              <div 
                onClick={() => setIsMinimized(false)}
                className={`p-3 px-4 rounded-xl border-2 shadow-xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-all ${
                  isDarkMode ? 'bg-slate-900 border-amber-500/50 text-slate-100' : 'bg-white border-amber-500 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>📅 {selectedDoctor.name} (TAKVİM)</span>
                </div>
                
                <div className="flex items-center gap-1 font-mono">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded text-[11px] font-black hover:bg-amber-500 hover:text-slate-950"
                  >
                    🗖 BÜYÜT
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCloseScheduleModal(); }} 
                    className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded text-[11px] font-black hover:bg-rose-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 🔔 BİLDİRİM / TOAST */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-[200]">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl border-2 border-emerald-400 text-xs font-black flex items-center gap-2 animate-fadeIn">
            <span>✅</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}