import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode
  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 font-sans ${className}`}>
          <CheckCircle size={14} className="text-[#D4AF37]" />
          <span>App instalada en el dispositivo</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/25 via-[#D4AF37]/15 to-[#D4AF37]/25 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-xs font-sans font-semibold tracking-wide active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all ${className}`}
        title="Instalar aplicación en la pantalla de inicio"
      >
        <Download size={14} className="text-[#D4AF37]" />
        <span>Instalar Aplicación (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 text-xs font-sans font-medium active:scale-95 transition-all ${className}`}
          title="Instalar en iPhone o iPad"
        >
          <Smartphone size={14} className="text-[#D4AF37]" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-sm rounded-3xl bg-[#050B14] border border-[#D4AF37]/50 p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-[#D4AF37]" />
                  <h3 className="text-base font-serif text-[#D4AF37] font-semibold">
                    Instalar en iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 border border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-300 font-sans leading-relaxed">
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>En Safari, pulsa el botón <strong>Compartir</strong> <Share size={12} className="inline mx-1 text-[#D4AF37]" /> en la barra inferior.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Baja y selecciona <strong>&laquo;Añadir a la pantalla de inicio&raquo;</strong>.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Pulsa <strong>Añadir</strong> en la esquina superior derecha. Podrás abrirla sin internet.</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] font-bold text-xs font-sans tracking-wide active:scale-95 shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
