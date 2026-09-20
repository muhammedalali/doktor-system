'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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
      return 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-500 shadow-sm';
    case 'AMELİYATTA':
      return 'bg-purple-600 dark:bg-purple-600 text-white border-purple-500 shadow-sm';
    case 'RESMİ TATİL':
      return 'bg-indigo-700 dark:bg-indigo-600 text-white border-indigo-500 shadow-sm font-black';
    case 'HAFTA SONU':
      return 'bg-rose-600 dark:bg-rose-600 text-white border-rose-400 shadow-sm';
    case 'YILLIK İZİN':
    case 'RAPORLU':
      return 'bg-amber-500 dark:bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm';
    case 'NÖBET SONRASI İZİN':
      return 'bg-sky-600 dark:bg-sky-600 text-white border-sky-500 shadow-sm';
    case 'ASKERLİK':
      return 'bg-slate-800 text-slate-300 border-slate-600 shadow-sm font-black';
    default:
      return 'bg-slate-700 text-white border-slate-500';
  }
};

export default function AdminDoctorsPage() {
  const { isDarkMode, activeColor, setIsSidebarOpen } = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState(defaultDepartments);
  const [newCustomDept, setNewCustomDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);

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
    if (uName !== 'ADMIN' && currentUser.role !== 'YÖNETİCİ' && uName !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      const docsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setDoctors(docsData);
    }, (err) => {
      console.error('Firebase Admin Doctors Error:', err);
    });

    const savedDepts = JSON.parse(localStorage.getItem('app_departments') || '[]');
    if (savedDepts.length > 0) {
      setDepartments(savedDepts);
    } else {
      setDepartments(defaultDepartments);
      localStorage.setItem('app_departments', JSON.stringify(defaultDepartments));
    }

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if ((showScheduleModal && !isMinimized) || showAddDocModal || deletingDept || deletingDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showScheduleModal, isMinimized, showAddDocModal, deletingDept, deletingDoc]);

  // 🎯 التمرير التلقائي لليوم الحالي يحدث **مرة واحدة فقط** عند فتح النافذة
  useEffect(() => {
    if (showScheduleModal && selectedDoctor && !isMinimized && isFirstOpenRef.current) {
      const timer = setTimeout(() => {
        if (todayRef.current) {
          todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        isFirstOpenRef.current = false; // تجميد التمرير كي لا يتكرر عند تغيير الحالات بالأسفل
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showScheduleModal, selectedDoctor, isMinimized]);

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
    isFirstOpenRef.current = true; // تفعيل ميزة التمرير لليوم الحالي للفتح الأول فقط
    setIsMinimized(false);
    setIsMaximized(false);
    setWinPos({ x: 0, y: 0 });
    setShowScheduleModal(true);
  };

  const handleRegenerateMonth = async (year, month) => {
    if (!selectedDoctor) return;
    const newSchedule = generateFullMonthSchedule(year, month);
    const updatedDoc = { ...selectedDoctor, scheduleDays: newSchedule };
    setSelectedDoctor(updatedDoc);
    try {
      await updateDoc(doc(db, 'doctors', selectedDoctor.id), { scheduleDays: newSchedule });
      triggerToast(`Takvim güncellendi: ${month + 1}.${year}`);
    } catch (e) {
      console.error('Regenerate month error:', e);
    }
  };

  const handleDayStatusChange = async (index, newStatus) => {
    if (!selectedDoctor) return;
    const updatedSchedule = [...selectedDoctor.scheduleDays];
    updatedSchedule[index].status = newStatus;
    const updatedDoc = { ...selectedDoctor, scheduleDays: updatedSchedule };
    setSelectedDoctor(updatedDoc);
    try {
      await updateDoc(doc(db, 'doctors', selectedDoctor.id), { scheduleDays: updatedSchedule });
    } catch (e) {
      console.error('Update day status error:', e);
    }
  };

  const handleAddCustomDepartment = (e) => {
    e.preventDefault();
    if (!newCustomDept.trim()) return;
    const deptUpper = newCustomDept.trim().toLocaleUpperCase('tr-TR');
    if (!departments.includes(deptUpper)) {
      const updated = [...departments, deptUpper];
      setDepartments(updated);
      localStorage.setItem('app_departments', JSON.stringify(updated));
      triggerToast(`Bölüm eklendi: ${deptUpper}`);
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
      triggerToast(`Doktor silindi: ${deletingDoc.name}`);
      setDeletingDoc(null);
    } catch (e) {
      console.error('Delete doctor error:', e);
    }
  };

  const handleSaveNewDoctor = async (e) => {
    e.preventDefault();
    if (!docName) return;
    const newDoc = {
      name: docName.trim().toLocaleUpperCase('tr-TR'),
      clinic: docClinic.trim().toLocaleUpperCase('tr-TR'),
      status: 'POLİKLİNİK',
      dahili: docDahili || '',
      roomNo: docRoomNo || '',
      scheduleDays: generateFullMonthSchedule(2026, 8),
      createdAt: Date.now()
    };
    try {
      await addDoc(collection(db, 'doctors'), newDoc);
      setDocName(''); setDocDahili(''); setDocRoomNo('');
      setShowAddDocModal(false);
      triggerToast(`Doktor eklendi: ${newDoc.name}`);
    } catch (e) {
      console.error('Add doctor error:', e);
    }
  };

  const getDoctorsByDept = (deptName) => {
    const cleanDept = deptName.trim().toLocaleUpperCase('tr-TR');
    return doctors.filter(d => d.clinic?.trim().toLocaleUpperCase('tr-TR') === cleanDept);
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`px-4 py-2.5 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-105 ${
              isDarkMode ? 'bg-slate-950 border-slate-700 text-emerald-400 hover:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg">☰</span>
            <span className="text-xs font-black tracking-widest uppercase">MENÜ</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-black tracking-wide text-amber-500 uppercase">
            BÖLÜM VE DOKTOR YÖNETİMİ
          </h1>
        </div>

        <div className="flex items-center gap-2 font-black text-xs">
          <button
            onClick={() => toggleAllDepartments(false)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 rounded-xl transition-all cursor-pointer"
          >
            📂 TÜMÜNÜ AÇ
          </button>
          <button
            onClick={() => toggleAllDepartments(true)}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
          >
            📁 TÜMÜNÜ KAPAT
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-5 rounded-2xl border-2 shadow-md flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <h3 className="text-xs font-black text-amber-400 uppercase mb-3">➕ YENİ BÖLÜM OLUŞTUR</h3>
          <form onSubmit={handleAddCustomDepartment} className="flex gap-3">
            <input
              type="text"
              placeholder="ÖRNEK: İÇ HASTALIKLARI..."
              value={newCustomDept}
              onChange={(e) => setNewCustomDept(e.target.value.toLocaleUpperCase('tr-TR'))}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-black uppercase text-xs outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300'
              }`}
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md transition-all">
              + BÖLÜM EKLE
            </button>
          </form>
        </div>

        <div className={`p-5 rounded-2xl border-2 shadow-md flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <h3 className="text-xs font-black text-emerald-400 uppercase mb-3">👨‍⚕️ YENİ DOKTOR EKLE</h3>
          <div className="flex justify-between items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Yeni doktor ve çalışma planı ekleyin:</span>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              + DOKTOR EKLE
            </button>
          </div>
        </div>
      </div>

      {/* Cards of Departments and Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {departments.map((dept) => {
          const deptDocs = getDoctorsByDept(dept);
          const isCollapsed = collapsedDepts[dept] || false;
          const deptIcon = departmentIcons[dept] || '🏥';

          return (
            <div key={dept} className={`p-5 rounded-2xl border-2 font-black space-y-4 shadow-md transition-all duration-300 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
            }`}>
              
              <div 
                onClick={() => toggleCollapseDepartment(dept)}
                className="flex justify-between items-center pb-2 border-b border-slate-700/50 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl p-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20">{deptIcon}</span>
                  <span className={`text-sm font-black uppercase transition-colors group-hover:text-amber-400 ${activeColor}`}>
                    {dept}
                  </span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
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
                    className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg text-xs transition-all cursor-pointer"
                    title={isCollapsed ? "Genişlet" : "Daralt"}
                  >
                    {isCollapsed ? '▼' : '▲'}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="space-y-3 animate-fadeIn">
                  {deptDocs.length > 0 ? (
                    deptDocs.map((doc) => (
                      <div 
                        key={doc.id} 
                        onClick={() => handleOpenSchedule(doc)}
                        className={`p-3.5 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.02] ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-amber-500/50' : 'bg-slate-50 border-slate-200 hover:border-amber-500'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className={`font-extrabold text-sm ${activeColor}`}>{doc.name}</div>
                          <div className="flex gap-2">
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[10px] font-mono font-black px-2 py-0.5 rounded-md">
                              DAHİLİ: {doc.dahili || '-'}
                            </span>
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black px-2 py-0.5 rounded-md">
                              ODA: {doc.roomNo || '-'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingDoc(doc);
                          }}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg border border-rose-500/30 text-xs font-black cursor-pointer transition-all"
                          title="Doktoru Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 font-bold p-3 text-center border-2 border-dashed border-slate-800 rounded-xl">
                      Bu bölümde doktor kaydı bulunmuyor.
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Delete Department Modal */}
      {deletingDept && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border-2 p-6 shadow-2xl text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <h3 className="text-xl font-black mb-2 text-rose-500">🗑️ BÖLÜMÜ SİL</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">
              <span className="text-amber-400 font-black">{deletingDept}</span> bölümünü silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-3 font-black">
              <button onClick={() => setDeletingDept(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDepartment} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs shadow-md cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Doctor Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border-2 p-6 shadow-2xl text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <h3 className="text-xl font-black mb-2 text-rose-500">🗑️ DOKTORU SİL</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">
              <span className="text-amber-400 font-black">{deletingDoc.name}</span> isimli doktoru silmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-3 font-black">
              <button onClick={() => setDeletingDoc(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer">İPTAL</button>
              <button onClick={handleConfirmDeleteDoctor} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs shadow-md cursor-pointer">EVET, SİL</button>
            </div>
          </div>
        </div>
      )}

      {/* Full Schedule Window Modal */}
      {showScheduleModal && selectedDoctor && (
        <>
          {!isMinimized && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-6"
              onClick={(e) => {
                if (!isMaximized && modalBoxRef.current && !modalBoxRef.current.contains(e.target)) {
                  setShowScheduleModal(false);
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
                    : 'rounded-3xl max-w-[95vw] max-h-[95vh]'
                } ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                
                {/* Header */}
                <div 
                  onMouseDown={handleMouseDownHeader}
                  className={`p-4 sm:p-5 border-b-2 flex justify-between items-center select-none ${
                    isMaximized ? 'cursor-default' : 'cursor-move'
                  } ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
                >
                  <div>
                    <h3 className="text-base sm:text-xl font-black text-amber-500 uppercase">{selectedDoctor.name}</h3>
                    <p className="text-xs font-black text-blue-500 dark:text-blue-400 mt-0.5">
                      {selectedDoctor.clinic} • DAHİLİ: <span className="font-mono">{selectedDoctor.dahili || '-'}</span> • ODA NO: <span className="font-mono">{selectedDoctor.roomNo || '-'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button 
                      onClick={() => setIsMinimized(true)}
                      className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-base transition-all flex items-center justify-center cursor-pointer"
                      title="Simge Durumuna Küçült"
                    >
                      🗕
                    </button>
                    <button 
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-base transition-all flex items-center justify-center cursor-pointer"
                      title={isMaximized ? "Eski Boyuta Getir" : "Ekranı Kapla"}
                    >
                      {isMaximized ? '🗗' : '🗖'}
                    </button>
                    <button 
                      onClick={() => setShowScheduleModal(false)}
                      className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-base transition-all flex items-center justify-center cursor-pointer"
                      title="Kapat"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Filter / Month Changer Bar */}
                <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wider">📅 AYLIK ÇALIŞMA TAKVİMİ:</span>
                  <div className="flex gap-2 font-black">
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setSelectedMonth(m);
                        handleRegenerateMonth(selectedYear, m);
                      }} 
                      className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black outline-none cursor-pointer ${
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
                      className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black outline-none cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>

                {/* List Body With Exact Past/Today Calculation and Single Auto-scroll */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 font-black">
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
                        className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${
                          isPast 
                            ? 'opacity-35 grayscale-[40%] bg-slate-950/30 border-slate-800/80 text-slate-500' 
                            : isToday 
                            ? 'border-amber-400 bg-amber-500/15 shadow-xl scale-[1.005] text-amber-300' 
                            : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-xs sm:text-sm">
                          <span className={`font-black ${isToday ? 'text-amber-400 text-base' : ''}`}>{sd.date}</span>
                          <span className="font-sans text-xs opacity-75">{sd.day}</span>
                          
                          {/* 📌 شارة التاريخ القديم */}
                          {isPast && (
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-md font-sans font-bold">
                              GEÇMİŞ TARİH
                            </span>
                          )}

                          {/* 📌 شارة اليوم الحاضر */}
                          {isToday && (
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-md font-sans animate-bounce">
                              BUGÜN
                            </span>
                          )}

                          {sd.holidayName && (
                            <span className="text-[10px] bg-purple-600 text-white font-black px-2.5 py-0.5 rounded-md font-sans">
                              🇹🇷 {sd.holidayName}
                            </span>
                          )}
                        </div>

                        <select
                          value={sd.status}
                          disabled={isPast}
                          onChange={(e) => handleDayStatusChange(idx, e.target.value)}
                          className={`px-4 py-2 rounded-xl border-2 text-xs font-black outline-none transition-all cursor-pointer ${getStatusBadgeStyle(sd.status)} ${
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
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center opacity-40 hover:opacity-100"
                    title="Boyutu Değiştir"
                  >
                    <span className="text-xs font-mono font-black">◢</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMinimized && (
            <div className="fixed bottom-4 right-4 z-[250]">
              <div 
                onClick={() => setIsMinimized(false)}
                className={`p-3.5 px-5 rounded-2xl border-2 shadow-2xl flex items-center gap-4 cursor-pointer hover:scale-105 transition-all ${
                  isDarkMode ? 'bg-slate-900 border-amber-500/50 text-slate-100' : 'bg-white border-amber-500 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>📅 {selectedDoctor.name} (TAKVİM AÇIK)</span>
                </div>
                
                <div className="flex items-center gap-1 font-mono">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
                    className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-xs font-black hover:bg-amber-500 hover:text-slate-950"
                  >
                    🗖 BÜYÜT
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowScheduleModal(false); }} 
                    className="px-2 py-1 bg-rose-500/20 text-rose-500 rounded-lg text-xs font-black hover:bg-rose-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Add Doctor */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
              <h3 className="text-xs font-black text-emerald-500 uppercase">➕ YENİ DOKTOR EKLE</h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 font-black text-xl cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveNewDoctor} className="space-y-4 font-black">
              <div>
                <label className="block text-xs mb-1 text-slate-400">KLİNİK / BÖLÜM SEÇİN</label>
                <select
                  value={docClinic}
                  onChange={(e) => setDocClinic(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 font-black text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1 text-slate-400">DOKTOR ADI SOYADI</label>
                <input
                  type="text"
                  required
                  placeholder="ÖRNEK: DR. İBRAHİM KAYA"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value.toLocaleUpperCase('tr-TR'))}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 font-black text-xs focus:border-emerald-500 outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-amber-500">DAHİLİ NO</label>
                  <input
                    type="text"
                    placeholder="1045"
                    value={docDahili}
                    onChange={(e) => setDocDahili(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 font-mono text-xs focus:border-amber-500 outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-emerald-500">ODA NO</label>
                  <input
                    type="text"
                    placeholder="102"
                    value={docRoomNo}
                    onChange={(e) => setDocRoomNo(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 font-mono text-xs focus:border-emerald-500 outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg cursor-pointer transition-all">
                SİSTEME KAYDET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200]">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 text-xs font-black flex items-center gap-2">
            <span>✅</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}