'use client';
import { useState, useEffect } from 'react';

export default function PageLoader({ show, message = 'Yükleniyor' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 350);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-xl transition-all duration-300 animate-fadeIn">
      <div className="flex flex-col items-center text-center gap-6 p-6 animate-scaleUp">
        {/* الرمز الدائري المتوهج */}
        <div className="relative w-24 h-24 flex items-center justify-center my-2">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin shadow-[0_0_25px_#10b981]"></div>
          <div className="absolute inset-2 rounded-full border-4 border-teal-500/10 border-b-teal-300 animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_20px_#14b8a6]"></div>
          <div className="w-6 h-6 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_30px_#10b981]"></div>
        </div>

        {/* النص والنقاط المتتابعة */}
        <div className="space-y-1">
          <h3 className="text-2xl font-black tracking-widest text-white uppercase font-mono">
            {message}<span className="inline-block w-8 text-left text-emerald-400">{dots}</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Lütfen Bekleyiniz
          </p>
        </div>
      </div>
    </div>
  );
}