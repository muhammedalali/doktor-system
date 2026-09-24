'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar({ setShowReportModal, setShowSettingsModal }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  // التحقق مما إذا كان المستخدم زائرًا غير مسجل دخول
  const isPublicMode = searchParams.get('public') === 'true';
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const isLoggedIn = !!storedUser && !isPublicMode;

  return (
    <header className={`w-full py-4 px-6 flex justify-between items-center border-b transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Brand Logo */}
      <div 
        onClick={() => router.push('/')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="font-black text-base uppercase tracking-wider">
          Doktor Çalışma Sistemi
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Night / Day Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Options Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2.5 rounded-xl border text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-emerald-500' : 'bg-slate-100 border-slate-300 hover:border-emerald-500'
            }`}
          >
            <span>MENÜ</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {showDropdown && (
            <div className={`absolute right-0 mt-2 w-52 rounded-2xl border-2 shadow-2xl z-50 p-2 font-black text-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* 1. Sorun Bildir */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowReportModal(true);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                  isDarkMode ? 'hover:bg-slate-800 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                }`}
              >
                <span>⚠️ Sorun Bildir</span>
              </button>

              {/* 2. Ayarlar */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowSettingsModal(true);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 ${
                  isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-amber-50 text-amber-600'
                }`}
              >
                <span>⚙️ Genel Ayarlar</span>
              </button>

              {/* Profile Link: Only visible for authenticated logged-in users */}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/profile');
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 border-t mt-1 pt-2 ${
                    isDarkMode ? 'hover:bg-slate-800 border-slate-800 text-emerald-400' : 'hover:bg-emerald-50 border-slate-100 text-emerald-600'
                  }`}
                >
                  <span>👤 Profilim</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}