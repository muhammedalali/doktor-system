'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  // قائمة إشعارات تجريبية (يمكن ربطها بقاعدة بيانات لاحقاً إذا رغبت)
  const notificationsList = [
    {
      id: 1,
      title: 'Sistem Güncellemesi',
      description: 'Doktorsys arريوت موديولات التحكم تم تحديثها بنجاح إلى النسخة الحديثة.',
      time: 'Bugün, 20:00',
      read: false
    }
  ];

  return (
    <div className={`min-h-screen font-sans p-6 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* زر العودة */}
        <button 
          onClick={() => router.push('/dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          ← Panele Dön
        </button>

        {/* بطاقة الإشعارات */}
        <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h1 className="text-xl font-black mb-4 text-emerald-500">BİLDİRİMLER</h1>
          
          <div className="space-y-3">
            {notificationsList.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <span className="text-[10px] opacity-60">{item.time}</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}