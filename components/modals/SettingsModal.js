'use client';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsModal({ onClose }) {
  const {
    isDarkMode,
    zoomScale,
    changeZoom,
    setShowTableSettingsModal,
  } = useTheme();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl border-2 p-6 shadow-2xl flex flex-col justify-between transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex justify-between items-center pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl text-xl">⚙️</span>
            <h3 className="text-base font-black text-amber-500 uppercase tracking-wider">
              GENEL UYGULAMA AYARLARI
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-2xl font-black text-xl transition-all flex items-center justify-center cursor-pointer ${
              isDarkMode ? 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="my-6 space-y-5 font-black">
          {/* 1. TABLO GÖRÜNÜM AYARLARINI AÇ */}
          <button
            type="button"
            onClick={() => {
              onClose();
              setShowTableSettingsModal(true);
            }}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between shadow-md cursor-pointer group active:scale-[0.98] ${
              isDarkMode
                ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/80 hover:bg-slate-900'
                : 'bg-slate-50 border-slate-200 hover:border-amber-500/80 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xl">📊</span>
              <div>
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider">
                  TABLO GÖRÜNÜM AYARLARINI AÇ
                </h4>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Sütunlar, renkler, yazı tipleri ve görünüm stillerini özelleştirin
                </p>
              </div>
            </div>
            <span className="text-amber-500 font-mono text-sm transition-transform group-hover:translate-x-1">➔</span>
          </button>

          {/* 2. EKRAN ZUMU (ZOOM SCALE) */}
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-black text-amber-500 uppercase tracking-wider">
                EKRAN ZUMU (ZOOM SCALE)
              </label>
              <span className="text-xs font-mono font-black text-emerald-500 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                %{zoomScale}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => changeZoom(Math.max(80, zoomScale - 5))}
                className={`w-9 h-9 rounded-xl font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                -
              </button>

              <input
                type="range"
                min="80"
                max="130"
                step="5"
                value={zoomScale}
                onChange={(e) => changeZoom(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => changeZoom(Math.min(130, zoomScale + 5))}
                className={`w-9 h-9 rounded-xl font-black text-base flex items-center justify-center transition-all cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-95"
          >
            AYARLARI KAYDET VE KAPAT
          </button>
        </div>
      </div>
    </div>
  );
}