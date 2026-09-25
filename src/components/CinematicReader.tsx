import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Poem } from '../types';
import { SpeechStage } from '../hooks/useSpeech';
import { Sparkles, Compass } from 'lucide-react';

interface CinematicReaderProps {
  poem: Poem;
  isSpeaking: boolean;
  theaterMode: boolean;
  speechStage: SpeechStage;
  currentLineIndex: number;
  currentWordIndex: number;
  onFinish: () => void;
  onSkip?: () => void;
}

export const CinematicReader: React.FC<CinematicReaderProps> = ({
  poem,
  isSpeaking,
  theaterMode,
  speechStage,
  currentLineIndex,
  currentWordIndex,
  onSkip
}) => {
  return (
    <div
      onClick={onSkip}
      className={`absolute inset-0 flex flex-col items-center justify-center p-4 md:p-12 z-10 select-none transition-all duration-1000 ${
        !theaterMode 
          ? 'md:pl-[440px] pointer-events-none pb-28 md:pb-12' 
          : 'pl-0 cursor-pointer pointer-events-auto pb-8 md:pb-12'
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
            className="text-center w-full max-w-sm sm:max-w-xl md:max-w-3xl flex flex-col items-center px-2"
          >
            {/* ARCANA TITLE & SUBTITLE (ARRIBA) */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-[#D4AF37] mb-2 md:mb-3 tracking-widest drop-shadow-[0_0_25px_rgba(212,175,55,0.45)]">
              {poem.title}
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-gray-300 font-serif italic tracking-wide mb-6 md:mb-8">
              {poem.subtitle}
            </p>

            {/* Radiant Divider */}
            <div className="w-32 md:w-48 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mb-6 md:mb-8" />

            {/* MD4 Stencil Container: Squircle with 3-point Gradient & Cutout Icon (ABAJO) */}
            <div className="relative mb-4 group">
              <div className="w-13 h-13 md:w-15 md:h-15 rounded-[18px] md:rounded-[20px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#996515] p-[1.5px] shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-center justify-center">
                <div className="w-full h-full rounded-[17px] md:rounded-[19px] bg-[#050B14]/85 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-[20px] bg-[#D4AF37]/20 blur-xl -z-10 group-hover:scale-125 transition-transform duration-700" />
            </div>

            {/* VISUAL HOOK (PREGUNTA DEL UMBRAL - ABAJO) */}
            <div className="relative mb-6 px-5 md:px-7 py-4 md:py-5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-[#D4AF37]/25 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-xl">
              <div className="text-[10px] md:text-[11px] font-mono tracking-[0.25em] text-[#D4AF37]/80 uppercase mb-2">
                // Pregunta del Umbral
              </div>
              <p className="text-base sm:text-xl md:text-2xl text-amber-100/95 font-serif italic leading-relaxed tracking-wide">
                &ldquo;{poem.hook}&rdquo;
              </p>
            </div>

            {/* Keyboard hints (Desktop Only) */}
            <div className="hidden md:flex mt-2 text-xs font-sans tracking-widest text-gray-500 uppercase items-center gap-3">
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5">Espacio / Enter</span>
              <span>Iniciar Lectura</span>
              <span className="opacity-40">•</span>
              <span className="px-2 py-1 rounded border border-white/10 bg-white/5">↑ / ↓</span>
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
            className="text-center max-w-4xl px-4 flex flex-col items-center"
          >
            {/* Spatial Radiant Stencil Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="mb-6 md:mb-8"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[28px] bg-gradient-to-tr from-[#00E5FF]/40 via-[#D4AF37] to-[#F59E0B] p-[1.5px] shadow-[0_0_50px_rgba(212,175,55,0.35)] flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] md:rounded-[26px] bg-[#02060F]/90 backdrop-blur-xl flex items-center justify-center">
                  <Compass className="w-7 h-7 md:w-9 md:h-9 text-[#D4AF37] animate-pulse" />
                </div>
              </div>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[11px] md:text-sm font-mono tracking-[0.35em] text-[#D4AF37] uppercase mb-4 md:mb-6 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            >
              // El Umbral del Destino
            </motion.span>

            {/* Word-by-word Illuminated Hook Question */}
            <div className="flex flex-wrap justify-center gap-x-2 md:gap-x-3.5 gap-y-2 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic text-amber-50 leading-snug md:leading-tight tracking-wide drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-w-3xl">
              {poem.hook.trim().split(/\s+/).map((word, wIdx) => {
                const isRevealed = wIdx <= currentWordIndex;
                const isCurrent = wIdx === currentWordIndex;

                return (
                  <motion.span
                    key={wIdx}
                    animate={{
                      opacity: isRevealed ? 1 : 0.35,
                      color: isCurrent ? '#D4AF37' : isRevealed ? '#FFFBEB' : '#9CA3AF',
                      textShadow: isCurrent ? '0 0 25px rgba(212,175,55,0.9)' : '0 0 0px rgba(0,0,0,0)',
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
              animate={{ width: '12rem' }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-6 md:mt-8"
            />

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-[11px] md:text-xs text-gray-400 mt-4 md:mt-6 font-sans tracking-widest uppercase"
            >
              Toca o presiona [Espacio] para saltar
            </motion.span>
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
            className="text-center max-w-4xl px-4 flex flex-col items-center"
          >
            <div className="text-xs md:text-sm font-mono tracking-[0.3em] text-gray-400 uppercase mb-3 md:mb-4 opacity-75">
              Arcano Revelado
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#D4AF37] mb-4 md:mb-6 tracking-widest drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]">
              {poem.title}
            </h1>
            <p className="text-base sm:text-xl md:text-3xl text-gray-200 font-serif italic tracking-wide max-w-2xl mb-6">
              {poem.subtitle}
            </p>

            {/* Radiant Voice Wave Activity */}
            <div className="flex items-center gap-1.5 mt-2">
              {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.4].map((scale, i) => (
                <motion.span
                  key={i}
                  animate={{ scaleY: [0.3, scale, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 h-5 rounded-full bg-[#D4AF37]/60"
                />
              ))}
            </div>

            <span className="text-[11px] md:text-xs text-gray-400 mt-6 font-sans tracking-widest uppercase opacity-40">
              Toca o presiona [Espacio] para saltar
            </span>
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
            className="text-center max-w-4xl px-4"
          >
            <div className="flex flex-wrap justify-center gap-x-2 md:gap-x-3 gap-y-1.5 md:gap-y-2 text-2xl sm:text-3xl md:text-5xl font-serif leading-relaxed text-gray-100">
              {poem.lines[currentLineIndex].trim().split(/\s+/).map((word, wIdx) => {
                const isRevealed = wIdx <= currentWordIndex;
                const isCurrent = wIdx === currentWordIndex;

                return (
                  <motion.span
                    key={wIdx}
                    animate={{
                      opacity: isRevealed ? 1 : 0.15,
                      color: isCurrent ? '#D4AF37' : isRevealed ? '#F3E5AB' : '#4B5563',
                      textShadow: isCurrent ? '0 0 25px rgba(212,175,55,0.9)' : '0 0 0px rgba(0,0,0,0)',
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
