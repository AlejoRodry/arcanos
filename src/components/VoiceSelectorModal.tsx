import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, X, Volume2, Play, Check, Sliders, Sparkles, RotateCcw } from 'lucide-react';
import { findBestSpanishVoice } from '../hooks/useSpeech';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onSelectVoice: (voiceURI: string) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  speechPitch: number;
  onSpeechPitchChange: (pitch: number) => void;
  onPreviewVoice: (voice: SpeechSynthesisVoice, rate?: number, pitch?: number) => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceURI,
  onSelectVoice,
  speechRate,
  onSpeechRateChange,
  speechPitch,
  onSpeechPitchChange,
  onPreviewVoice
}) => {
  const [filterLang, setFilterLang] = useState<'es' | 'all'>('es');
  const [testingURI, setTestingURI] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMobile = typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const bestVoice = findBestSpanishVoice(voices);
  const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
  const displayedVoices = filterLang === 'es' && spanishVoices.length > 0 ? spanishVoices : voices;

  const handleTest = (voice: SpeechSynthesisVoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingURI(voice.voiceURI);
    onPreviewVoice(voice, speechRate, speechPitch);
    setTimeout(() => {
      setTestingURI(null);
    }, 2800);
  };

  const handleResetOptimal = () => {
    const optimalRate = 0.86;
    const optimalPitch = isMobile ? 0.95 : 0.82;
    onSpeechRateChange(optimalRate);
    onSpeechPitchChange(optimalPitch);
  };

  const getCleanVoiceName = (voice: SpeechSynthesisVoice) => {
    return voice.name
      .replace(/Microsoft\s+/gi, '')
      .replace(/Google\s+/gi, 'Google ')
      .replace(/\s*\(.*\)/g, '')
      .trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal / Adaptive Bottom Sheet (MD4 Continuum) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full md:max-w-lg max-h-[88vh] flex flex-col rounded-t-[28px] md:rounded-3xl bg-[#050B14]/95 border-t md:border border-[#D4AF37]/50 p-5 sm:p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.85)] md:shadow-[0_0_60px_rgba(212,175,55,0.3)] backdrop-blur-2xl text-white overflow-hidden z-10"
      >
        {/* Radiant Atmosphere Light */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

        {/* Android Drag Handle Indicator */}
        <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mb-3 md:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F5D77F] to-[#8C6D1F] flex items-center justify-center text-[#050B14] shadow-[0_0_18px_rgba(212,175,55,0.45)] shrink-0">
              <Mic size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] md:text-[11px] uppercase tracking-widest text-[#D4AF37]/80 font-sans font-bold truncate">
                Voz en Off & Recitación
              </span>
              <h3 className="text-lg md:text-xl font-serif text-[#D4AF37] font-medium leading-snug">
                Seleccionar Voz del Oráculo
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-[#D4AF37] hover:bg-white/10 active:scale-95 transition-all shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Device Information Tip */}
        <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-gray-300 font-sans flex items-center justify-between gap-2 shrink-0">
          <span>📱 Cada dispositivo tiene sus propias voces. Elige la que mejor suene en tu teléfono:</span>
        </div>

        {/* Language Filter Tabs */}
        {spanishVoices.length > 0 && (
          <div className="flex items-center gap-2 mb-2.5 shrink-0">
            <button
              onClick={() => setFilterLang('es')}
              className={`px-3 py-1 rounded-xl text-xs font-sans tracking-wide transition-all ${
                filterLang === 'es'
                  ? 'border border-[#D4AF37]/60 bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)] font-semibold'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Español ({spanishVoices.length})
            </button>
            <button
              onClick={() => setFilterLang('all')}
              className={`px-3 py-1 rounded-xl text-xs font-sans tracking-wide transition-all ${
                filterLang === 'all'
                  ? 'border border-[#D4AF37]/60 bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)] font-semibold'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Todas las Voces ({voices.length})
            </button>
          </div>
        )}

        {/* Scrollable Voice List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 -mr-1 my-1">
          {displayedVoices.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm font-sans">
              Cargando catálogo de voces del dispositivo...
            </div>
          ) : (
            displayedVoices.map((voice) => {
              const isSelected = selectedVoiceURI === voice.voiceURI || selectedVoiceURI === voice.name;
              const isTesting = testingURI === voice.voiceURI;
              const isSpanish = voice.lang.startsWith('es');
              const isRecommended = bestVoice && (voice.voiceURI === bestVoice.voiceURI || voice.name === bestVoice.name);

              return (
                <div
                  key={voice.voiceURI || voice.name}
                  onClick={() => onSelectVoice(voice.voiceURI)}
                  className={`group relative p-3 rounded-xl sm:rounded-2xl transition-all border cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected 
                        ? 'bg-[#D4AF37] text-[#050B14]' 
                        : 'bg-white/5 border border-white/10 text-gray-400 group-hover:text-[#D4AF37]'
                    }`}>
                      {isSelected ? <Check size={16} /> : <Volume2 size={15} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-serif font-medium truncate ${
                          isSelected ? 'text-[#D4AF37]' : 'text-gray-200'
                        }`}>
                          {getCleanVoiceName(voice)}
                        </span>
                        
                        {isRecommended && (
                          <span className="text-[9px] font-sans px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#D4AF37]/30 to-[#F3E5AB]/20 text-[#F3E5AB] border border-[#D4AF37]/50 font-bold shrink-0 shadow-[0_0_6px_rgba(212,175,55,0.3)]">
                            ✦ Recomendada
                          </span>
                        )}

                        {isSpanish && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                            {voice.lang}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-sans text-gray-400 block truncate mt-0.5">
                        {voice.name}
                      </span>
                    </div>
                  </div>

                  {/* Preview Voice Button */}
                  <button
                    onClick={(e) => handleTest(voice, e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-sans transition-all active:scale-95 shrink-0 ${
                      isTesting
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#050B14] font-semibold animate-pulse'
                        : 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25'
                    }`}
                    title="Escuchar muestra"
                  >
                    <Play size={12} className={isTesting ? 'fill-[#050B14]' : ''} />
                    <span className="text-[11px]">{isTesting ? 'Hablando' : 'Probar'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Acoustic Fine Tuning Section (Pitch & Cadence) */}
        <div className="pt-3 border-t border-white/10 mt-2 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-[#D4AF37] font-sans">
            <span className="flex items-center gap-1.5 font-medium">
              <Sliders size={13} />
              Afinación de la Voz
            </span>
            <button
              onClick={handleResetOptimal}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#D4AF37] active:scale-95 transition-colors"
              title="Restablecer cadencia y tono recomendados"
            >
              <RotateCcw size={10} />
              <span>Afinación Óptima</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Speed / Rate */}
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex justify-between text-[10px] text-gray-300">
                <span>Cadencia</span>
                <span className="text-[#D4AF37] font-mono">{speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.65"
                max="1.15"
                step="0.05"
                value={speechRate}
                onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
            </div>

            {/* Pitch / Tone */}
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex justify-between text-[10px] text-gray-300">
                <span>Tono (Resonancia)</span>
                <span className="text-[#D4AF37] font-mono">{speechPitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.2"
                step="0.05"
                value={speechPitch}
                onChange={(e) => onSpeechPitchChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 mt-2 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-gray-400 font-sans leading-tight">
            La voz seleccionada se guardará para todas tus lecturas.
          </p>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] text-xs font-sans font-bold tracking-wider active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all shrink-0"
          >
            <Sparkles size={13} />
            <span>Aceptar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

