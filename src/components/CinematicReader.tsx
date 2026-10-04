import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Poem } from '../types';
import { SpeechStage } from '../hooks/useSpeech';
import { Sparkles, Compass, Play, ChevronLeft, ChevronRight, Mic, Info } from 'lucide-react';

interface CinematicReaderProps {
  poem: Poem;
  isSpeaking: boolean;
  theaterMode: boolean;
  speechStage: SpeechStage;
  currentLineIndex: number;
  currentWordIndex: number;
  onFinish: () => void;
  onSkip?: () => void;
  onStart?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onOpenVoiceModal?: () => void;
  onOpenInscriptionModal?: () => void;
  activeVoiceName?: string;
  aspectRatio?: 'free' | '9:16' | '16:9' | '1:1';
}

export const CinematicReader: React.FC<CinematicReaderProps> = ({
  poem,
  isSpeaking,
  theaterMode,
  speechStage,
  currentLineIndex,
  currentWordIndex,
  onSkip,
  onStart,
  onPrev,
  onNext,
  onOpenVoiceModal,
  onOpenInscriptionModal,
  activeVoiceName,
  aspectRatio = 'free'
}) => {
  return (
    <div
      onClick={onSkip}
      translate="no"
      className={`notranslate absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 z-10 select-none transition-all duration-1000 ${
        !theaterMode 
          ? 'md:pl-[295px] lg:pl-[325px] pointer-events-none pt-14 md:pt-0' 
          : 'pl-0 cursor-pointer pointer-events-auto p-4 md:p-6'
      }`}
    >
      <AnimatePresence mode="wait">
        {/* --- IDLE PREVIEW SCREEN (When not in Theater Mode) --- */}
        {!theaterMode && (
          <motion.div
            key={`preview-${poem.id}`}
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(8px)', transition: { duration: 0.5 } }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center w-full max-w-sm sm:max-w-md md:max-w-xl flex flex-col items-center px-2"
          >
            {/* ARCANA TITLE & SUBTITLE (ARRIBA) */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#D4AF37] mb-1 md:mb-2 tracking-widest drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              {poem.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 font-serif italic tracking-wide mb-2 md:mb-4">
              {poem.subtitle}
            </p>

            {/* Radiant Divider */}
            <div className="w-20 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mb-2 md:mb-4" />

            {/* MD4 Stencil Container: Squircle with 3-point Gradient & Cutout Icon */}
            <div className="relative mb-2.5 md:mb-3 group">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-[14px] md:rounded-[16px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#996515] p-[1.5px] shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center">
                <div className="w-full h-full rounded-[13px] md:rounded-[15px] bg-[#050B14]/85 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37] drop-shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-[16px] bg-[#D4AF37]/15 blur-lg -z-10 group-hover:scale-125 transition-transform duration-700" />
            </div>

            {/* VISUAL HOOK (PREGUNTA DEL UMBRAL) */}
            <div className="relative mb-3 sm:mb-4 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-[#D4AF37]/25 shadow-[0_6px_24px_rgba(0,0,0,0.45)] w-full max-w-md lg:max-w-lg">
              <div className="text-[9px] md:text-[10px] font-mono tracking-[0.25em] text-[#D4AF37]/80 uppercase mb-1 sm:mb-1.5">
                // Pregunta del Umbral
              </div>
              <p className="text-xs sm:text-sm md:text-base text-amber-100/95 font-serif italic leading-relaxed tracking-wide">
                &ldquo;{poem.hook}&rdquo;
              </p>
            </div>

            {/* ANDROID / MOBILE MAIN ACTIONS (COLOCADAS MÁS ARRIBA, DIRECTO EN PANTALLA) */}
            <div className="md:hidden w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-2.5 pointer-events-auto mt-1 mb-2">
              {/* Action Buttons Row */}
              <div className="w-full flex items-center justify-between gap-2.5 sm:gap-3">
                <button
                  onClick={onPrev}
                  className="w-12 h-12 rounded-2xl border border-white/15 bg-[#050B14]/90 backdrop-blur-xl text-gray-200 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 flex items-center justify-center active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)] shrink-0"
                  title="Arcano anterior"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  onClick={onStart}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.4)] active:scale-[0.98] transition-transform"
                >
                  <Play size={17} className="fill-[#050B14]" />
                  <span className="text-xs sm:text-sm uppercase tracking-widest font-sans font-bold">
                    Iniciar Lectura
                  </span>
                </button>

                <button
                  onClick={onNext}
                  className="w-12 h-12 rounded-2xl border border-white/15 bg-[#050B14]/90 backdrop-blur-xl text-gray-200 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 flex items-center justify-center active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)] shrink-0"
                  title="Arcano siguiente"
                >
                  <ChevronRight size={22} />
                </button>
              </div>

              {/* Quick Options Pills Row (Voz & Círculo Sagrado) */}
              <div className="flex items-center justify-center gap-2 w-full pt-1">
                {onOpenVoiceModal && (
                  <button
                    onClick={onOpenVoiceModal}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-xs text-gray-300 hover:text-[#D4AF37] active:scale-95 transition-all shadow-sm"
                    title="Configurar voz del narrador"
                  >
                    <Mic size={13} className="text-[#D4AF37] shrink-0" />
                    <span className="text-[11px] font-sans truncate">{activeVoiceName || "Voz"}</span>
                  </button>
                )}

                {onOpenInscriptionModal && (
                  <button
                    onClick={onOpenInscriptionModal}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 text-xs text-gray-300 hover:text-[#D4AF37] active:scale-95 transition-all shadow-sm"
                    title="Ver sentencia del círculo sagrado"
                  >
                    <Info size={13} className="text-[#D4AF37] shrink-0" />
                    <span className="text-[11px] font-sans truncate">Círculo Sagrado</span>
                  </button>
                )}
              </div>
            </div>

            {/* Keyboard hints (Desktop Only) */}
            <div className="hidden md:flex mt-1.5 text-[10px] font-sans tracking-wider text-gray-500 uppercase items-center gap-2">
              <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px]">Espacio / Enter</span>
              <span>Iniciar</span>
              <span className="opacity-40">•</span>
              <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px]">↑ / ↓</span>
              <span>Cambiar Arcano</span>
            </div>
          </motion.div>
        )}

        {/* --- THEATER MODE STAGE 1: GANCHO VISUAL (Narrado por la voz en off) --- */}
        {theaterMode && speechStage === 'hook' && (
          <motion.div
            key={`theater-hook-${poem.id}`}
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)', transition: { duration: 0.8 } }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`text-center px-4 flex flex-col items-center ${aspectRatio === '9:16' ? 'max-w-sm' : 'max-w-3xl'}`}
          >
            {/* Spatial Radiant Stencil Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="mb-4 md:mb-6"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-gradient-to-tr from-[#00E5FF]/40 via-[#D4AF37] to-[#F59E0B] p-[1.5px] shadow-[0_0_35px_rgba(212,175,55,0.3)] flex items-center justify-center">
                <div className="w-full h-full rounded-[18px] md:rounded-[22px] bg-[#02060F]/90 backdrop-blur-xl flex items-center justify-center">
                  <Compass className="w-6 h-6 md:w-8 md:h-8 text-[#D4AF37] animate-pulse" />
                </div>
              </div>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-[#D4AF37] uppercase mb-3 md:mb-4 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            >
              // El Umbral del Destino
            </motion.span>

            {/* Word-by-word Illuminated Hook Question */}
            <div className={`flex flex-wrap justify-center gap-x-2 md:gap-x-3 gap-y-1.5 font-serif italic text-amber-50 leading-snug md:leading-tight tracking-wide drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] ${
              aspectRatio === '9:16' ? 'text-xl sm:text-2xl max-w-xs' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl max-w-2xl'
            }`}>
              {poem.hook.trim().split(/\s+/).map((word, wIdx) => {
                const isRevealed = wIdx <= currentWordIndex;
                const isCurrent = wIdx === currentWordIndex;

                return (
                  <motion.span
                    key={`hook-w-${wIdx}-${word}`}
                    animate={{
                      opacity: isCurrent ? 1 : isRevealed ? 0.95 : 0.7,
                      color: isCurrent ? '#D4AF37' : isRevealed ? '#FFFBEB' : '#E2E8F0',
                      textShadow: isCurrent ? '0 0 20px rgba(212,175,55,0.85)' : 'none',
                      y: isCurrent ? -2 : 0,
                      scale: isCurrent ? 1.05 : 1
                    }}
                    transition={{ duration: 0.25 }}
                    className="inline-block transition-colors"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '8rem' }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-4 md:mt-6"
            />
          </motion.div>
        )}

        {/* --- THEATER MODE STAGE 2: EL TÍTULO (Narrado por la voz en off) --- */}
        {theaterMode && speechStage === 'title' && (
          <motion.div
            key={`theater-title-${poem.id}`}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 0.8 } }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`text-center px-4 flex flex-col items-center ${aspectRatio === '9:16' ? 'max-w-sm' : 'max-w-3xl'}`}
          >
            <div className="text-[10px] md:text-xs font-mono tracking-[0.25em] text-gray-400 uppercase mb-2 md:mb-3 opacity-75">
              Arcano Revelado
            </div>
            <h1 className={`font-serif text-[#D4AF37] mb-3 md:mb-4 tracking-widest drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] ${
              aspectRatio === '9:16' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
            }`}>
              {poem.title}
            </h1>
            <p className={`text-gray-200 font-serif italic tracking-wide mb-4 ${
              aspectRatio === '9:16' ? 'text-xs sm:text-sm max-w-xs' : 'text-sm sm:text-base md:text-lg lg:text-xl max-w-xl'
            }`}>
              {poem.subtitle}
            </p>

            {/* Radiant Voice Wave Activity */}
            <div className="flex items-center gap-1.5 mt-1">
              {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.4].map((scale, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.3, scale, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 h-4 rounded-full bg-[#D4AF37]/60"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* --- THEATER MODE STAGE 3: RECITACIÓN CINEMATOGRÁFICA DE VERSOS --- */}
        {theaterMode && speechStage === 'lines' && currentLineIndex >= 0 && poem.lines[currentLineIndex] && (
          <motion.div
            key={`line-${currentLineIndex}`}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)', transition: { duration: 0.6 } }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`text-center px-4 ${aspectRatio === '9:16' ? 'max-w-xs sm:max-w-sm' : 'max-w-3xl'}`}
          >
            <div className={`flex flex-wrap justify-center gap-x-2 md:gap-x-2.5 gap-y-1.5 font-serif leading-relaxed text-gray-100 ${
              aspectRatio === '9:16' ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
            }`}>
              {poem.lines[currentLineIndex].trim().split(/\s+/).map((word, wIdx) => {
                const isRevealed = wIdx <= currentWordIndex;
                const isCurrent = wIdx === currentWordIndex;

                return (
                  <motion.span
                    key={`l-${currentLineIndex}-w-${wIdx}-${word}`}
                    animate={{
                      opacity: isCurrent ? 1 : isRevealed ? 0.95 : 0.65,
                      color: isCurrent ? '#D4AF37' : isRevealed ? '#FFFBEB' : '#E2E8F0',
                      textShadow: isCurrent ? '0 0 20px rgba(212,175,55,0.85)' : 'none',
                      y: isCurrent ? -2 : 0,
                      scale: isCurrent ? 1.05 : 1
                    }}
                    transition={{ duration: 0.25 }}
                    className="inline-block transition-colors"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Radiant Aura behind central typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] bg-gradient-to-r from-[#00E5FF]/[0.02] via-[#D4AF37]/[0.05] to-[#F59E0B]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
};
