'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

// --- Ultra Modern SVG Icons ---
const ModernIcons = {
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25M5.25 12H3m15.364 6.364l-1.591-1.591M6.75 6.75L5.159 5.159m12.728 0l-1.591 1.591M6.75 17.25l-1.591 1.591M12 18a6 6 0 100-12 6 6 0 000 12z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  UserPlus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  // Modern Key Icon (رمز المفتاح الحديث)
  Key: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5m9-6h2.25m-2.25 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h11.25" />
    </svg>
  ),
  // Modern Trash Icon (رمز الحذف الحديث)
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  Send: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
};

const DEFAULT_PERMISSIONS = {
  canEditDoctors: false,
  canDeleteDoctors: false,
  canChangeStatus: false,
  canManageIssues: false,
  canViewReports: false,
};

export default function AdminUsersPage() {
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;
  const setIsDarkMode = themeContext?.setIsDarkMode || (() => {});
  const toggleTheme = themeContext?.toggleTheme;
  const setIsSidebarOpen = themeContext?.setIsSidebarOpen || (() => {});

  const [users, setUsers] = useState([]);
  const [systemIssues, setSystemIssues] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isTableVisible, setIsTableVisible] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Form State
  const [username, setUsername] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('KULLANICI');
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [userMsg, setUserMsg] = useState('');

  const router = useRouter();

  const handleToggleTheme = () => {
    if (toggleTheme) {
      toggleTheme();
    } else if (setIsDarkMode) {
      setIsDarkMode(!isDarkMode);
    }
  };

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const currentUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : {});
    const nameStr = currentUser.username ? currentUser.username.toLocaleUpperCase('tr-TR') : '';

    if (nameStr !== 'ADMIN' && currentUser.role !== 'YÖNETİCİ' && nameStr !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setUsers(usersData);
    });

    const unsubscribeIssues = onSnapshot(collection(db, 'system_issues'), (snapshot) => {
      const issuesData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setSystemIssues(issuesData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeIssues();
    };
  }, [router]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.surname && u.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm))
    );
  }, [users, searchTerm]);

  // Yeni Kullanıcı Ekleme
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!username || !surname || !password) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    const cleanUsername = username.trim().toLocaleUpperCase('tr-TR');
    const cleanSurname = surname.trim().toLocaleUpperCase('tr-TR');

    const newUserObj = {
      username: cleanUsername,
      surname: cleanSurname,
      fullName: `${cleanUsername} ${cleanSurname}`,
      phone: phone || '05555555555',
      password: password,
      role: role,
      permissions: permissions,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'users'), newUserObj);
      setUsername(''); setSurname(''); setPhone(''); setPassword('');
      setPermissions(DEFAULT_PERMISSIONS);
      setIsAddModalOpen(false);
      setUserMsg('Kullanıcı başarıyla eklendi!');
      setTimeout(() => setUserMsg(''), 4000);
    } catch (error) {
      alert(`Hata: ${error.message}`);
    }
  };

  // Şifre Güncelleme
  const handleUpdatePassword = async () => {
    if (!newPasswordInput || newPasswordInput.trim().length < 3) {
      alert('Lütfen geçerli bir şifre girin!');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', passwordResetUser.id), {
        password: newPasswordInput.trim()
      });
      setUserMsg(`Şifre güncellendi: ${passwordResetUser.username}`);
      setPasswordResetUser(null);
      setNewPasswordInput('');
      setTimeout(() => setUserMsg(''), 4000);
    } catch (e) {
      alert('Şifre güncellenirken bir hata oluştu!');
    }
  };

  // Yönetici Yanıtı Gönderme
  const handleSendAdminReply = async (issueId) => {
    const text = adminReplyText[issueId];
    if (!text || !text.trim()) return;

    try {
      await updateDoc(doc(db, 'system_issues', issueId), {
        adminReply: text.trim(),
        repliedAt: new Date().toISOString()
      });
      setAdminReplyText({ ...adminReplyText, [issueId]: '' });
      setUserMsg('Yanıtınız başarıyla gönderildi!');
      setTimeout(() => setUserMsg(''), 3000);
    } catch (e) {
      alert('Yanıt gönderilirken hata oluştu!');
    }
  };

  // Bildirim Silme
  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'system_issues', issueId));
      setUserMsg('Bildirim silindi!');
      setTimeout(() => setUserMsg(''), 3000);
    } catch (e) {
      alert('Silme işleminde hata oluştu!');
    }
  };

  // İzin Değiştirme
  const handleTogglePermission = async (userId, permKey) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const currentPerms = targetUser.permissions || DEFAULT_PERMISSIONS;
    const updatedPerms = { ...currentPerms, [permKey]: !currentPerms[permKey] };

    try {
      await updateDoc(doc(db, 'users', userId), { permissions: updatedPerms });
      if (selectedUserForDetails && selectedUserForDetails.id === userId) {
        setSelectedUserForDetails({ ...selectedUserForDetails, permissions: updatedPerms });
      }
    } catch (e) {
      console.error('İzin hatası:', e);
    }
  };

  // Kullanıcı Silme
  const handleDeleteUser = async (id) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      if (selectedUserForDetails?.id === id) setSelectedUserForDetails(null);
      setUserMsg('Kullanıcı başarıyla silindi.');
      setTimeout(() => setUserMsg(''), 3000);
    } catch (e) {
      console.error('Silme hatası:', e);
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-6 transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
    }`}>
      
      {/* NAVBAR */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex items-center justify-between gap-4 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-700/80 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-slate-200'
      }`}>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 text-slate-200 hover:border-slate-500' 
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title="Geri Dön"
          >
            <ModernIcons.ArrowLeft />
          </button>

          <button
            onClick={handleToggleTheme}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 hover:border-slate-500' 
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
            }`}
            title="Temayı Değiştir"
          >
            {isDarkMode ? <ModernIcons.Sun /> : <ModernIcons.Moon />}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNotificationsModalOpen(true)}
            className={`relative p-3 rounded-2xl border transition-all cursor-pointer ${
              systemIssues.length > 0
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 font-bold'
                : isDarkMode
                  ? 'bg-slate-950 border-slate-700 text-slate-200 hover:border-slate-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title="Bildirimler"
          >
            <ModernIcons.Bell />
            {systemIssues.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                {systemIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 text-emerald-400 hover:border-slate-500' 
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            title="Menü"
          >
            <ModernIcons.Menu />
          </button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {userMsg && (
        <div className={`p-4 border text-xs font-black rounded-2xl shadow-md flex items-center gap-3 ${
          isDarkMode 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
            : 'bg-emerald-100 border-emerald-400 text-emerald-900'
        }`}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          {userMsg}
        </div>
      )}

      {/* CONTROLS BAR */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl ${
        isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-300'
      }`}>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="px-5 py-3 rounded-2xl font-black text-xs uppercase bg-amber-500 text-slate-950 shadow-md">
            Kullanıcı Listesi ({users.length})
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs uppercase transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <ModernIcons.UserPlus />
            <span>Yeni Kullanıcı Ekle</span>
          </button>

          <button
            onClick={() => setIsTableVisible(!isTableVisible)}
            className={`px-4 py-3 rounded-2xl font-black text-xs uppercase border flex items-center gap-2 cursor-pointer transition-all ${
              isTableVisible 
                ? isDarkMode 
                  ? 'bg-slate-800 border-slate-600 text-slate-200' 
                  : 'bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-indigo-600/20 border-indigo-500 text-indigo-600 font-extrabold'
            }`}
          >
            {isTableVisible ? <ModernIcons.EyeOff /> : <ModernIcons.Eye />}
            <span>{isTableVisible ? 'Tabloyu Gizle' : 'Tabloyu Göster'}</span>
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="w-full sm:w-80 relative">
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <ModernIcons.Search />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim veya telefon ile ara..."
            className={`w-full pl-10 pr-8 py-2.5 rounded-2xl border text-xs font-bold outline-none transition-colors ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-amber-400' 
                : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-amber-500'
            }`}
          />
        </div>
      </div>

      {/* USERS TABLE */}
      {isTableVisible && (
        <div className={`rounded-3xl border overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-slate-300'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wider font-black ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-950 text-slate-300' 
                    : 'border-slate-300 bg-slate-100 text-slate-800'
                }`}>
                  <th className="p-4 pl-6">Kullanıcı</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Özel İzinler</th>
                  <th className="p-4 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-bold">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const userPerms = u.permissions || DEFAULT_PERMISSIONS;
                    const hasActivePerms = Object.values(userPerms).some(Boolean);

                    return (
                      <tr 
                        key={u.id} 
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-slate-800/60 border-slate-800' 
                            : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs uppercase shadow-sm">
                              {u.username ? u.username.charAt(0) : 'U'}
                            </div>
                            <div>
                              <span className={`font-black text-sm block ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                {u.username} {u.surname || ''}
                              </span>
                              <span className={`text-xs font-mono font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                @{u.username?.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`text-[11px] font-black px-3 py-1 rounded-xl uppercase tracking-wider border inline-block ${
                            u.role === 'YÖNETİCİ' || u.username === 'ADMIN'
                              ? isDarkMode
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                              : isDarkMode
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {u.role || 'KULLANICI'}
                          </span>
                        </td>

                        <td className={`p-4 font-mono font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                          {u.phone || '—'}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {userPerms.canEditDoctors && (
                              <span className={`text-[10px] font-black border px-2 py-0.5 rounded-md ${
                                isDarkMode ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-sky-100 text-sky-800 border-sky-300'
                              }`}>
                                Doktor Düzenleme
                              </span>
                            )}
                            {userPerms.canDeleteDoctors && (
                              <span className={`text-[10px] font-black border px-2 py-0.5 rounded-md ${
                                isDarkMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}>
                                Doktor Silme
                              </span>
                            )}
                            {userPerms.canChangeStatus && (
                              <span className={`text-[10px] font-black border px-2 py-0.5 rounded-md ${
                                isDarkMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                                Durum Değiştirme
                              </span>
                            )}
                            {!hasActivePerms && (
                              <span className={`text-[11px] font-bold italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Standart Erişim
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedUserForDetails(u)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                                isDarkMode 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600' 
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300'
                              }`}
                            >
                              <ModernIcons.Settings />
                              <span>Detaylar</span>
                            </button>

                            <button
                              onClick={() => setPasswordResetUser(u)}
                              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                                isDarkMode
                                  ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/40'
                                  : 'bg-amber-100 hover:bg-amber-500 text-amber-900 hover:text-slate-950 border-amber-300'
                              }`}
                              title="Şifre Değiştir"
                            >
                              <ModernIcons.Key />
                            </button>

                            {u.username !== 'ADMIN' && u.username !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                                  isDarkMode
                                    ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border-rose-500/40'
                                    : 'bg-rose-100 hover:bg-rose-600 text-rose-900 hover:text-white border-rose-300'
                                }`}
                                title="Kullanıcıyı Sil"
                              >
                                <ModernIcons.Trash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className={`p-12 text-center font-bold uppercase text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔔 1. MODAL: BİLDİRİMLER VE ŞİKAYETLER (DETAYLI VE MODERN) */}
      {isNotificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className={`max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-3xl border shadow-2xl flex flex-col ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-5 border-b flex justify-between items-center ${
              isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <ModernIcons.Bell />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide">
                    Sistem Bildirimleri ve Şikayetler
                  </h3>
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Toplam {systemIssues.length} bildirim kaydı mevcut
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsNotificationsModalOpen(false)} 
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-black hover:bg-slate-200'
                }`}
              >
                <ModernIcons.Close />
              </button>
            </div>

            {/* Modal Content / List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {systemIssues.length > 0 ? (
                systemIssues.map((req) => (
                  <div key={req.id} className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}>
                    
                    {/* Item Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-500/20 text-amber-600 font-bold">
                          <ModernIcons.User />
                        </span>
                        <span className={`text-xs font-black uppercase ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                          {req.username || 'Ziyaretçi / Anonim'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {req.createdAt && (
                          <div className={`flex items-center gap-1 text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <ModernIcons.Clock />
                            <span>{new Date(req.createdAt).toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteIssue(req.id)} 
                          className="text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                          title="Bildirimi Sil"
                        >
                          <ModernIcons.Trash />
                        </button>
                      </div>
                    </div>

                    {/* Issue Description */}
                    <div className="py-1">
                      <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {req.description || 'Detay açıklaması girilmedi.'}
                      </p>
                    </div>

                    {/* Previous Admin Reply */}
                    {req.adminReply && (
                      <div className={`p-3 rounded-xl text-xs border ${
                        isDarkMode 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-[11px] uppercase tracking-wider">Yönetici Yanıtı:</span>
                          {req.repliedAt && (
                            <span className="text-[10px] opacity-80">
                              {new Date(req.repliedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold">{req.adminReply}</p>
                      </div>
                    )}

                    {/* Admin Reply Input */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Yanıtınızı yazın..."
                        value={adminReplyText[req.id] || ''}
                        onChange={(e) => setAdminReplyText({ ...adminReplyText, [req.id]: e.target.value })}
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold outline-none transition-colors ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                        }`}
                      />
                      <button
                        onClick={() => handleSendAdminReply(req.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <ModernIcons.Send />
                        <span>Gönder</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto text-slate-400">
                    <ModernIcons.Bell />
                  </div>
                  <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Henüz yeni bir bildirim veya şikayet bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ➕ 2. MODAL: YENİ KULLANICI EKLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className={`max-w-xl w-full rounded-3xl border p-6 sm:p-8 space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-base font-black text-amber-500 uppercase">Yeni Kullanıcı Ekle</h3>
              <button onClick={() => setIsAddModalOpen(false)} className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>
                <ModernIcons.Close />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 font-bold text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-1.5 uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-4 py-3 border rounded-xl outline-none font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block mb-1.5 uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Soyadı</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={`w-full px-4 py-3 border rounded-xl outline-none font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-1.5 uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl outline-none font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block mb-1.5 uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Telefon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl outline-none font-bold ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1.5 uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl outline-none font-bold ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="KULLANICI">KULLANICI (Standart Kullanıcı)</option>
                  <option value="YÖNETİCİ">YÖNETİCİ (Sistem Yöneticisi)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`flex-1 py-3 font-bold rounded-xl uppercase cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase shadow-md cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚙️ 3. MODAL: DETAYLAR VE İZİN YÖNETİMİ */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className={`max-w-xl w-full rounded-3xl border p-6 sm:p-8 space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-base font-black text-amber-500 uppercase">
                {selectedUserForDetails.username} {selectedUserForDetails.surname} — İzin Yönetimi
              </h3>
              <button onClick={() => setSelectedUserForDetails(null)} className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>
                <ModernIcons.Close />
              </button>
            </div>

            <div className="space-y-4">
              <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Aşağıdaki özel izinleri aktifleştirebilir veya kapatabilirsiniz:
              </p>

              <div className="space-y-3">
                {[
                  { key: 'canEditDoctors', label: 'Doktor Düzenleme / Ekleme' },
                  { key: 'canDeleteDoctors', label: 'Doktor Silme' },
                  { key: 'canChangeStatus', label: 'Doktor Durumu Değiştirme' },
                  { key: 'canManageIssues', label: 'Bildirim Yönetimi' },
                  { key: 'canViewReports', label: 'Raporları Görüntüleme' },
                ].map((perm) => {
                  const isChecked = selectedUserForDetails.permissions?.[perm.key] || false;
                  return (
                    <div key={perm.key} className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {perm.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(selectedUserForDetails.id, perm.key)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {isChecked ? 'Açık' : 'Kapalı'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`pt-4 border-t flex justify-end ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="px-6 py-2.5 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shadow-md"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔑 4. MODAL: ŞİFRE DEĞİŞTİRME */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className={`max-w-md w-full rounded-3xl border p-6 space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-base font-black text-amber-500 uppercase">
                Şifre Değiştir: {passwordResetUser.username}
              </h3>
              <button onClick={() => setPasswordResetUser(null)} className={`p-2 rounded-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>
                <ModernIcons.Close />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block mb-2 text-xs font-bold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Yeni Şifre
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Yeni şifreyi girin..."
                  className={`w-full px-4 py-3 border rounded-xl text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl uppercase cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer uppercase"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}