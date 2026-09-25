'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReportPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);
    try {
      const sessionUser = sessionStorage.getItem('user');
      const activeUser = sessionUser ? JSON.parse(sessionUser) : null;

      await addDoc(collection(db, 'reports'), {
        title,
        description,
        username: activeUser?.username || 'Bilinmeyen',
        createdAt: serverTimestamp(),
        status: 'Beklemede'
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Arıza bildirimi gönderilemedi.');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen font-sans p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="max-w-xl mx-auto space-y-6">
        
        <button 
          onClick={() => router.push('/dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          ← Panele Dön
        </button>

        <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h1 className="text-xl font-black mb-2 text-amber-500">ARIZA / SORUN BİLDİR</h1>
          <p className="text-xs opacity-70 mb-6">Sistemde karşılaştığınız hataları veya sorunları buradan bildirebilirsiniz.</p>

          {success && <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold">Bildiriminiz başarıyla gönderildi.</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-85">Konu / Başlık</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                placeholder="Örn: Sayfa yüklenme hatası"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-85">Sorun Açıklaması</label>
              <textarea 
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none resize-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                placeholder="Karşılaştığınız sorunu detaylıca açıklayın..."
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              {loading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}