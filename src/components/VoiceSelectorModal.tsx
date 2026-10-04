import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mic, 
  X, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Play, 
  Pause, 
  Check, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Upload, 
  Music, 
  Music2, 
  Radio
} from 'lucide-react';
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
  audioSrc?: string | null;
  onAudioUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
  musicVolume?: number;
  onVolumeChange?: (volume: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  initialTab?: 'voice' | 'music';
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
  onPreviewVoice,
  audioSrc,
  onAudioUpload,
  isAudioPlaying = false,
  onToggleAudio,
  musicVolume = 0.2,
  onVolumeChange,
  isMuted = false,
  onToggleMute,
  initialTab = 'voice'
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'music'>(initialTab);
  const [filterLang, setFilterLang] = useState<'es' | 'all'>('es');
  const [testingURI, setTestingURI] = useState<string | null>(null);

  if (!isOpen) return null;

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
    onSpeechRateChange(0.86);
    onSpeechPitchChange(0.82);
    if (bestVoice) {
      onSelectVoice(bestVoice.voiceURI);
    }
  };

  const getCleanVoiceName = (v: SpeechSynthesisVoice) => {
    let name = v.name;
    name = name.replace(/^Microsoft\s+/i, '');
    name = name.replace(/^Google\s+/i, '');
    name = name.replace(/\s+Online\s+\(Natural\)/i, ' Natural');
    name = name.replace(/\s*\(España\)/i, ' (ES)');
    name = name.replace(/\s*\(México\)/i, ' (MX)');
    name = name.replace(/\s*\(Estados Unidos\)/i, ' (US)');
    return name;
  };

  const getVolumeIcon = (vol: number, muted: boolean) => {
    if (muted || vol === 0) return <VolumeX size={16} />;
    if (vol < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg bg-[#050B14]/98 border border-[#D4AF37]/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.15)] text-white overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              {activeTab === 'voice' ? <Mic size={16} /> : <Music size={16} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#D4AF37] tracking-wider">
                Ajustes de Sonido
              </h3>
              <p className="text-[11px] font-sans text-gray-400">
                Configura la voz del oráculo y la música de fondo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation: Voz vs Música */}
        <div className="flex border-b border-white/10 mb-4 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'voice'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Mic size={13} />
            <span>Voz del Narrador</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'music'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Music2 size={13} />
            <span>Música de Fondo</span>
            {audioSrc && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            )}
          </button>
        </div>

        {/* TAB 1: VOZ DEL NARRADOR */}
        {activeTab === 'voice' && (
          <>
            {/* Filter Tabs for Voices */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-xs font-sans text-gray-400">
                Voces disponibles ({displayedVoices.length}):
              </span>

              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-[11px] font-sans">
                <button
                  onClick={() => setFilterLang('es')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterLang === 'es'
                      ? 'bg-[#D4AF37] text-[#050B14] font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Español ({spanishVoices.length})
                </button>
                <button
                  onClick={() => setFilterLang('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterLang === 'all'
                      ? 'bg-[#D4AF37] text-[#050B14] font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Todas ({voices.length})
                </button>
              </div>
            </div>

            {/* Scrollable Voices List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[160px] max-h-[35vh]">
              {displayedVoices.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm font-sans">
                  Cargando catálogo de voces del dispositivo...
                </div>
              ) : (
                displayedVoices.map((voice, idx) => {
                  const isSelected = selectedVoiceURI === voice.voiceURI || selectedVoiceURI === voice.name;
                  const isTesting = testingURI === voice.voiceURI;
                  const isSpanish = voice.lang.startsWith('es');
                  const isRecommended = bestVoice && (voice.voiceURI === bestVoice.voiceURI || voice.name === bestVoice.name);

                  return (
                    <div
                      key={`voice-${voice.voiceURI || voice.name}-${voice.lang}-${idx}`}
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
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#D4AF37] active:scale-95 transition-colors cursor-pointer"
                  title="Restablecer cadencia y tono recomendados"
                >
                  <RotateCcw size={10} />
                  <span>Afinación Óptima</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Speed / Rate */}
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-300 font-sans">
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
                  <div className="flex justify-between text-[10px] text-gray-300 font-sans">
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

              {/* Windows & System Voices Hint */}
              <div className="mt-2.5 p-2 rounded-xl bg-white/[0.02] border border-[#D4AF37]/20 flex items-start gap-2 text-[10px] text-gray-400">
                <span className="text-[#D4AF37] text-xs shrink-0 mt-0.5">✦</span>
                <div className="leading-relaxed">
                  <span className="text-amber-200/90 font-medium">¿Cómo añadir más voces en tu PC?</span>
                  <p className="mt-0.5 text-gray-400">
                    En tu ordenador ve a <strong>Configuración de Windows &gt; Hora e idioma &gt; Voz &gt; Agregar voces</strong> (instala español de España o México). También puedes abrir esta app en <strong>Microsoft Edge</strong> para acceder sin costo a las voces <em>Natural Neural</em> (Álvaro, Elvira, etc.).
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: MÚSICA DE FONDO */}
        {activeTab === 'music' && (
          <div className="space-y-4 py-2">
            {/* Upload card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Upload size={16} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm text-[#D4AF37] font-medium">
                      {audioSrc ? "Música Cargada" : "Cargar Música de Fondo"}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-sans">
                      {audioSrc ? "Archivo listo para acompañar la narración" : "Soporta formatos .mp3, .wav, .m4a u .ogg"}
                    </p>
                  </div>
                </div>

                {onAudioUpload && (
                  <label className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-serif font-semibold tracking-wide cursor-pointer transition-all active:scale-95 shadow-sm">
                    <span>{audioSrc ? "Cambiar Pista" : "Seleccionar Archivo"}</span>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={onAudioUpload} 
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Player Controls & Volume Slider */}
            {audioSrc ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.04] via-[#D4AF37]/10 to-white/[0.02] border border-[#D4AF37]/40 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span className="font-serif text-xs text-[#D4AF37] font-semibold tracking-wider uppercase">
                      Reproductor de Acompañamiento
                    </span>
                  </div>

                  {onToggleAudio && (
                    <button
                      onClick={onToggleAudio}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-xs font-serif font-semibold active:scale-95 transition-all"
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause size={13} className="fill-[#D4AF37]" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} className="fill-[#D4AF37]" />
                          <span>Reproducir</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Volume slider */}
                {onVolumeChange && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-300 font-sans">
                      <span className="text-[11px] text-gray-400">Nivel de Volumen:</span>
                      <span className="text-[#D4AF37] font-mono font-bold">
                        {Math.round((isMuted ? 0 : musicVolume) * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {onToggleMute && (
                        <button
                          onClick={onToggleMute}
                          className="p-1.5 rounded-lg text-[#D4AF37] hover:bg-white/5 active:scale-95 transition-transform"
                          title={isMuted ? "Reactivar sonido" : "Silenciar"}
                        >
                          {getVolumeIcon(musicVolume, isMuted)}
                        </button>
                      )}

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : musicVolume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-400 font-sans space-y-1">
                <Radio size={20} className="mx-auto text-gray-500 mb-1 opacity-70" />
                <p className="font-serif text-gray-300">Sin pista de música cargada</p>
                <p className="text-[11px] text-gray-500">
                  Puedes cargar tu melodía instrumental o sonido ambiental preferido para que suene de fondo mientras se recitan los Arcanos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-gray-400 font-sans leading-tight">
            Tus preferencias de voz y sonido se guardan automáticamente.
          </p>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] text-xs font-serif font-bold tracking-wider active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all shrink-0 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Guardar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
