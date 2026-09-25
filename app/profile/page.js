'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // حقول تغيير كلمة المرور
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const activeUser = sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);

    if (!activeUser) {
      router.push('/');
    } else {
      setCurrentUser(activeUser);
    }
  }, [router]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // التحقق البسيط من كلمة المرور الحالية (حسب هيكل قاعدة البيانات لديك)
        if (userData.password && userData.password !== currentPassword) {
          setError('Mevcut şifre hatalı.');
          setLoading(false);
          return;
        }

        await updateDoc(userRef, { password: newPassword });
        setMessage('Şifreniz başarıyla güncellendi.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setError('Şifre güncellenirken bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen font-sans p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* زر العودة */}
        <button 
          onClick={() => router.push('/dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          ← Panele Dön
        </button>

        {/* بطاقة معلومات الحساب */}
        <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h1 className="text-xl font-black mb-4 text-emerald-500">PROFİL BİLGİLERİ</h1>
          <div className="space-y-3 text-sm">
            <p><strong>Kullanıcı Adı:</strong> {currentUser?.username}</p>
            <p><strong>Rol / Yetki:</strong> {currentUser?.role || 'Kullanıcı'}</p>
          </div>
        </div>

        {/* بطاقة تغيير كلمة المرور */}
        <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-lg font-bold mb-4">ŞİFRE DEĞİŞTİR</h2>
          
          {message && <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold">{message}</div>}
          {error && <div className="p-3 mb-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold">{error}</div>}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Mevcut Şifre</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-80">Yeni Şifre</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}