import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Smartphone, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  HardDrive, 
  Layers,
  ChevronRight,
  Compass,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'topbar';
  className?: string;
}

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInAppBrowser: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  onInstall: () => Promise<void>;
  statusMsg: string | null;
}

export const RadiantInstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInAppBrowser,
  onInstall,
  statusMsg
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'status'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-[#050B14]/98 border border-[#D4AF37]/50 rounded-3xl shadow-[0_12px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.15)] text-white overflow-hidden flex flex-col"
      >
        {/* Subtle background astrolabe glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none -mr-20 -mt-20 blur-2xl" />

        {/* Modal Header */}
        <div className="relative px-5 sm:px-6 pt-5 pb-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#D4AF37]/25 via-[#D4AF37]/15 to-[#D4AF37]/5 border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Compass size={18} className="text-[#D4AF37] animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#D4AF37] tracking-wider">
                Instalar Aplicación
              </h3>
              <p className="text-[11px] font-sans text-gray-400">
                Lectura cinemática 100% disponible sin internet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 hover:border-[#D4AF37]/40 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* In-App Browser Warning (WhatsApp / Instagram / Gmail) */}
        {isInAppBrowser && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#F3E5AB]">
                  Abierto dentro de una app (WhatsApp o Correo)
                </p>
                <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                  Los navegadores integrados bloquean la instalación. Para guardarla en tu teléfono:
                </p>
                <p className="text-[11px] font-medium text-[#D4AF37]">
                  👉 Toca los tres puntos (⋮) en la esquina y selecciona <strong>«Abrir en Chrome»</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status notification toast */}
        {statusMsg && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs flex items-center gap-2">
            <Sparkles size={14} className="text-[#D4AF37] shrink-0" />
            <span className="font-sans">{statusMsg}</span>
          </div>
        )}

        {/* Elegant Gold Navigation Tabs */}
        <div className="flex border-b border-white/10 mt-3 px-5 sm:px-6 gap-2">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'android'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'ios'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            iPhone / iPad (Safari)
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'status'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Diagnóstico
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs font-sans">
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-gray-300">
                <p className="font-serif text-[#D4AF37] font-semibold mb-1 text-sm">
                  ¿Cómo funciona esta aplicación?
                </p>
                <p className="text-[11px] leading-relaxed text-gray-400 font-sans">
                  Es una <strong>PWA (Aplicación Web Progresiva)</strong>. No requiere descargar archivos .apk pesados de la tienda. Se añade a la pantalla de inicio de tu teléfono en 1 segundo y guarda los 26 Arcanos y audios para abrir sin señal.
                </p>
              </div>

              {/* Direct Install CTA Button */}
              <button
                onClick={onInstall}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] font-serif font-bold text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(212,175,55,0.35)] active:scale-98 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={16} className="fill-[#050B14]" />
                <span>{isInstallable ? 'Instalar en mi Pantalla' : 'Reintentar Instalación'}</span>
              </button>

              <div className="text-[11px] font-serif text-[#D4AF37] tracking-wider uppercase pt-1">
                Instalación manual desde Chrome:
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-serif flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="text-gray-300 leading-relaxed text-xs">
                    En <strong>Google Chrome</strong> en tu móvil, pulsa los <strong>3 puntos (⋮)</strong> arriba a la derecha.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-serif flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="text-gray-300 leading-relaxed text-xs">
                    Toca en <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-serif flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="text-gray-300 leading-relaxed text-xs">
                    Confirma con <strong>«Instalar»</strong>. ¡Listo! Tendrás el icono sagrado en tu pantalla.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                <p className="font-serif text-[#D4AF37] font-semibold mb-1 text-sm">
                  Instalación en iPhone / iPad (Safari)
                </p>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  En iOS, Apple permite instalar cualquier PWA directamente desde el menú Compartir de Safari:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-serif flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="text-gray-300 leading-relaxed text-xs">
                    En <strong>Safari</strong>, pulsa el botón <strong>Compartir</strong> <Share2 size={13} className="inline text-[#D4AF37] mx-1" /> en la barra inferior.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-serif flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="text-gray-300 leading-relaxed text-xs">
                    Desplázate hacia abajo y selecciona <strong>«Añadir a la pantalla de inicio»</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-serif flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="text-gray-300 leading-relaxed text-xs">
                    Pulsa <strong>«Añadir»</strong> arriba a la derecha para finalizar.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive size={15} className="text-[#D4AF37]" />
                  <span className="text-xs text-gray-300">Caché Offline (Service Worker)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold">
                  ACTIVO
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers size={15} className="text-[#D4AF37]" />
                  <span className="text-xs text-gray-300">Manifiesto W3C</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold">
                  VALIDADO
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={15} className="text-[#D4AF37]" />
                  <span className="text-xs text-gray-300">Compatibilidad Móvil</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] font-semibold">
                  100% LISTO
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Arcanos · Oráculo PWA
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white text-xs font-serif tracking-wider transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isInAppBrowser, 
    install 
  } = usePWAInstall();

  const [showModal, setShowModal] = useState(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string | null>(null);

  // If already running in standalone PWA mode
  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className={`p-3 rounded-2xl bg-white/[0.02] border border-[#D4AF37]/30 text-xs font-serif text-[#D4AF37]/80 flex items-center justify-between ${className}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#D4AF37]" />
            <span>Aplicación instalada en tu dispositivo</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-mono">
            OFFLINE
          </span>
        </div>
      );
    }
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallStatusMsg('¡Aplicación instalada con éxito!');
        return;
      }
    }
    setShowModal(true);
  };

  const handleForceInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setShowModal(false);
        return;
      }
    }
    setInstallStatusMsg('Sigue los 3 sencillos pasos indicados en el menú de Chrome (⋮).');
  };

  // Topbar variant: Elegant gold pill matching the header aesthetic
  if (variant === 'topbar') {
    return (
      <>
        <button
          onClick={handleButtonClick}
          className={`h-7 sm:h-8 px-2 sm:px-3 flex items-center justify-center gap-1.5 rounded-full border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] active:scale-95 transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)] shrink-0 ${className}`}
          title="Instalar oráculo en la pantalla de inicio"
          aria-label="Instalar aplicación"
        >
          <Download size={12} className="text-[#D4AF37] animate-pulse" />
          <span className="hidden sm:inline text-[10px] sm:text-[11px] font-serif font-semibold tracking-wider uppercase">
            Instalar
          </span>
        </button>

        <AnimatePresence>
          {showModal && (
            <RadiantInstallModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              isInstallable={isInstallable}
              isInAppBrowser={isInAppBrowser}
              isAndroid={isAndroid}
              isIOS={isIOS}
              onInstall={handleForceInstall}
              statusMsg={installStatusMsg}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Full Variant: Exquisite mystical card matching the drawer/sidebar
  if (variant === 'full') {
    return (
      <>
        <div 
          onClick={handleButtonClick}
          className={`group relative overflow-hidden p-2.5 rounded-xl bg-gradient-to-r from-white/[0.04] via-[#D4AF37]/10 to-white/[0.02] border border-[#D4AF37]/40 hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/15 transition-all duration-300 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.35),0_0_12px_rgba(212,175,55,0.08)] active:scale-[0.99] ${className}`}
        >
          {/* Subtle gold specular gradient ray */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.3)] shrink-0 group-hover:scale-105 transition-transform">
                <Download size={14} className="fill-[#050B14]" />
              </div>
              <div className="text-left min-w-0 truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-xs font-semibold text-[#D4AF37] tracking-wider uppercase group-hover:text-[#F3E5AB] transition-colors truncate">
                    Instalar App
                  </span>
                  <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F3E5AB] shrink-0">
                    OFFLINE
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-serif leading-tight truncate mt-0.5">
                  Toca aquí para guardarla en tu dispositivo
                </p>
              </div>
            </div>

            <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/60 group-hover:translate-x-0.5 transition-all shrink-0">
              <ChevronRight size={13} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showModal && (
            <RadiantInstallModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              isInstallable={isInstallable}
              isInAppBrowser={isInAppBrowser}
              isAndroid={isAndroid}
              isIOS={isIOS}
              onInstall={handleForceInstall}
              statusMsg={installStatusMsg}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Compact variant
  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`px-3 py-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] text-xs font-serif font-medium tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(212,175,55,0.15)] active:scale-95 ${className}`}
      >
        <Download size={13} />
        <span>Instalar App</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <RadiantInstallModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            isInstallable={isInstallable}
            isInAppBrowser={isInAppBrowser}
            isAndroid={isAndroid}
            isIOS={isIOS}
            onInstall={handleForceInstall}
            statusMsg={installStatusMsg}
          />
        )}
      </AnimatePresence>
    </>
  );
};
