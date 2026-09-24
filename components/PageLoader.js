'use client';

import { useState, useEffect, useRef } from 'react';

export default function PageLoader({ show, message = 'YÜKLENİYOR' }) {
  const [dots, setDots] = useState('');
  const canvasRef = useRef(null);

  // النقاط المتحركة (...)
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 350);

    return () => clearInterval(interval);
  }, [show]);

  // رسم تخطيط القلب بوضوح فوري ودون أي تأخير
  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    // نبدأ الإحداثي x من منتصف الشاشة لتبدأ النبضة ظاهرة وفورية تماماً
    let x = 150; 
    const speed = 3.0;

    const resize = () => {
      canvas.width = Math.min(window.innerWidth - 32, 700);
      canvas.height = 120;
    };
    resize();
    window.addEventListener('resize', resize);

    const getECGPoint = (xPos, width, height) => {
      const midY = height / 2;
      const cycleWidth = 280;
      const progress = (xPos % cycleWidth) / cycleWidth;

      if (progress > 0.32 && progress < 0.35) return midY - 6;
      if (progress >= 0.35 && progress < 0.38) return midY + 4;
      if (progress >= 0.38 && progress < 0.42) return midY - 50; // QRS Peak Upper (نبضة عالية وواضحة)
      if (progress >= 0.42 && progress < 0.47) return midY + 35; // QRS Peak Lower
      if (progress >= 0.47 && progress < 0.50) return midY - 10;
      if (progress >= 0.50 && progress < 0.56) return midY + 18; // T Wave
      return midY;
    };

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const primaryColor = '16, 185, 129'; // Emerald
      const glowColor = '#34d399';

      // 1. خط المنتصف الشفاف
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${primaryColor}, 0.25)`;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 8]);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. النبضة المتحركة المتوهجة الساطعة
      const tailLength = 160;
      for (let i = 0; i < tailLength; i++) {
        const currentX = (x - i + width) % width;
        const currentY = getECGPoint(currentX, width, height);
        const alpha = Math.pow(1 - i / tailLength, 1.5);

        ctx.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = alpha * 18;
        ctx.lineWidth = 3.2; // خط سميك وواضح جداً للعين

        ctx.beginPath();
        const prevX = (currentX - 1 + width) % width;
        const prevY = getECGPoint(prevX, width, height);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }

      // 3. رأس نبضة القلب المضيء
      const headY = getECGPoint(x, width, height);
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(x, headY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#a7f3d0';
      ctx.fill();

      x = (x + speed) % width;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xl transition-all duration-200 animate-fadeIn select-none pointer-events-auto">
      <div className="flex flex-col items-center text-center gap-4 p-4 w-full max-w-lg">
        
        {/* رسم نبض القلب المباشر الشفاف بالكامل بدون أي صناديق */}
        <div className="w-full h-28 relative overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />
        </div>

        {/* النص */}
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase font-mono flex items-center justify-center">
            <span>{message}</span>
            <span className="inline-block w-8 text-left text-emerald-400">{dots}</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            LÜTFEN BEKLEYİNİZ
          </p>
        </div>

      </div>
    </div>
  );
}