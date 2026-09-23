'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function RealtimeNotification({ isDarkMode }) {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const isFirstDocs = useRef(true);
  const isFirstPhone = useRef(true);
  const timerRef = useRef(null);

  const showToast = (data) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification(data);
    setIsVisible(true);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  useEffect(() => {
    // 1. DOKTORLAR CANLI DİNLENİYOR (TÜM KOLEKSİYON)
    const unsubDocs = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      if (isFirstDocs.current) {
        isFirstDocs.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') return;

        const data = change.doc.data();

        if (change.type === 'added') {
          showToast({
            title: 'YENİ DOKTOR EKLENDİ!',
            message: `${data.name || 'Doktor'} - ${data.clinic || 'Klinik'}`,
            subText: `Dahili: ${data.dahili || '-'} | Oda: ${data.roomNo || '-'}`,
            icon: '👨‍⚕️',
            badge: 'DOKTOR KAYDI',
            glowColor: 'shadow-[0_0_40px_rgba(16,185,129,0.35)]',
            borderColor: 'border-emerald-500/80',
            badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
            progressBg: 'bg-emerald-400'
          });
        } else if (change.type === 'modified') {
          showToast({
            title: 'DOKTOR BİLGİSİ DÜZELTİLDİ!',
            message: `${data.name || 'Doktor'} (${data.clinic || 'Klinik'})`,
            subText: `Dahili: ${data.dahili || '-'} | Oda: ${data.roomNo || '-'}`,
            icon: '✏️',
            badge: 'DÜZELTME',
            glowColor: 'shadow-[0_0_40px_rgba(245,158,11,0.35)]',
            borderColor: 'border-amber-500/80',
            badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
            progressBg: 'bg-amber-400'
          });
        }
      });
    }, (err) => console.error('Realtime Doc Error:', err));

    // 2. TELEFON REHBERİ CANLI DİNLENİYOR (TÜM KOLEKSİYON)
    const unsubPhone = onSnapshot(collection(db, 'phonebook'), (snapshot) => {
      if (isFirstPhone.current) {
        isFirstPhone.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') return;

        const data = change.doc.data();

        if (change.type === 'added') {
          showToast({
            title: 'YENİ DAHİLİ NUMARA!',
            message: `${data.name || 'Birim'} (${data.department || 'Departman'})`,
            subText: `Dahili Tel: ${data.dahili || '-'}`,
            icon: '📞',
            badge: 'REHBER EKLEME',
            glowColor: 'shadow-[0_0_40px_rgba(59,130,246,0.35)]',
            borderColor: 'border-blue-500/80',
            badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
            progressBg: 'bg-blue-400'
          });
        } else if (change.type === 'modified') {
          showToast({
            title: 'NUMARA DÜZELTİLDİ!',
            message: `${data.name || 'Birim'} (${data.department || 'Departman'})`,
            subText: `Güncel Dahili: ${data.dahili || '-'}`,
            icon: '✏️',
            badge: 'DÜZELTME',
            glowColor: 'shadow-[0_0_40px_rgba(245,158,11,0.35)]',
            borderColor: 'border-amber-500/80',
            badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
            progressBg: 'bg-amber-400'
          });
        }
      });
    }, (err) => console.error('Realtime Phone Error:', err));

    // 3. YENİ BÖLÜM EKLEME (LOCALSTORAGE)
    const handleStorageChange = (e) => {
      if (e.key === 'app_departments_last_added' && e.newValue) {
        try {
          const deptData = JSON.parse(e.newValue);
          showToast({
            title: 'YENİ BRANŞ / BİRİM!',
            message: `${deptData.name} birimi sisteme tanımlandı.`,
            subText: 'Poliklinik ve doktor eklenebilir.',
            icon: '🏥',
            badge: 'YENİ BİRİM',
            glowColor: 'shadow-[0_0_40px_rgba(168,85,247,0.35)]',
            borderColor: 'border-purple-500/80',
            badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
            progressBg: 'bg-purple-400'
          });
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubDocs();
      unsubPhone();
      window.removeEventListener('storage', handleStorageChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
      }`}
    >
      <div
        className={`relative overflow-hidden p-4 rounded-3xl border-2 backdrop-blur-3xl transition-all duration-300 ${
          notification.glowColor
        } ${notification.borderColor} ${
          isDarkMode
            ? 'bg-slate-950/90 text-slate-100'
            : 'bg-white/95 text-slate-900'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner">
              {notification.icon}
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${notification.badgeBg}`}>
                {notification.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">ŞİMDİ</span>
            </div>

            <h4 className="text-xs font-black tracking-wide text-amber-400 uppercase">
              {notification.title}
            </h4>
            <p className="text-xs font-black text-slate-200 leading-snug">
              {notification.message}
            </p>
            {notification.subText && (
              <p className="text-[11px] font-mono font-bold text-emerald-400 pt-0.5">
                {notification.subText}
              </p>
            )}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-rose-500 transition-colors text-xs font-black p-1.5 hover:bg-slate-800/60 rounded-xl cursor-pointer"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60 overflow-hidden">
          <div
            className={`h-full ${notification.progressBg} transition-all duration-[6000ms] ease-linear ${
              isVisible ? 'w-0' : 'w-full'
            }`}
          />
        </div>
      </div>
    </div>
  );
}