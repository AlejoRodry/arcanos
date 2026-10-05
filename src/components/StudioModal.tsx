import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  X, 
  Smartphone, 
  Monitor, 
  Square, 
  Maximize2, 
  Circle, 
  Check, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  FolderDown,
  Trash2,
  Play,
  Pause,
  Clock,
  HardDrive,
  Film,
  Volume2,
  Headphones,
  Zap
} from 'lucide-react';
import { AspectRatio, RecordMode } from '../hooks/useScreenRecorder';
import { SavedRecording } from '../utils/recordingsDB';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  onSelectAspectRatio: (ratio: AspectRatio) => void;
  recordMode: RecordMode;
  onSelectRecordMode: (mode: RecordMode) => void;
  isRecording: boolean;
  recordingDuration: string;
  autoRecordOnStart: boolean;
  onToggleAutoRecord: (enabled: boolean) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  savedRecordings: SavedRecording[];
  onDownloadRecording: (rec: SavedRecording) => void;
  onDeleteRecording: (id: string) => void;
  onClearAllRecordings: () => void;
  videoUrl: string | null;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  onSelectAspectRatio,
  recordMode,
  onSelectRecordMode,
  isRecording,
  recordingDuration,
  autoRecordOnStart,
  onToggleAutoRecord,
  onStartRecording,
  onStopRecording,
  savedRecordings,
  onDownloadRecording,
  onDeleteRecording,
  onClearAllRecordings,
  videoUrl
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'library'>('record');
  const [previewingRecording, setPreviewingRecording] = useState<{ id: string; url: string; isAudio: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  if (!isOpen) return null;

  const ratios: { id: AspectRatio; label: string; sublabel: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: '9:16',
      label: '9:16 Vertical',
      sublabel: 'Shorts, TikTok, Reels',
      icon: <Smartphone size={20} />,
      desc: 'Encuadra el oráculo en formato vertical de smartphone listo para redes'
    },
    {
      id: '16:9',
      label: '16:9 Panorámico',
      sublabel: 'YouTube, Cine, PC',
      icon: <Monitor size={20} />,
      desc: 'Formato apaisado cinemático tradicional de alta definición'
    },
    {
      id: '1:1',
      label: '1:1 Cuadrado',
      sublabel: 'Instagram Feed',
      icon: <Square size={20} />,
      desc: 'Encuadre simétrico para publicaciones fijas de redes sociales'
    },
    {
      id: 'free',
      label: 'Pantalla Completa',
      sublabel: 'Todo el monitor',
      icon: <Maximize2 size={20} />,
      desc: 'Ocupa la totalidad de la ventana activa de tu navegador'
    }
  ];

  const handlePreview = (rec: SavedRecording) => {
    const isAudio = rec.mimeType.startsWith('audio/') || rec.aspectRatio === 'audio';
    if (previewingRecording && previewingRecording.id === rec.id) {
      URL.revokeObjectURL(previewingRecording.url);
      setPreviewingRecording(null);
    } else {
      if (previewingRecording) {
        URL.revokeObjectURL(previewingRecording.url);
      }
      const url = URL.createObjectURL(rec.blob);
      setPreviewingRecording({ id: rec.id, url, isAudio });
    }
  };

  const totalBytes = savedRecordings.reduce((acc, curr) => acc + curr.fileSize, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#050B14]/95 border border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              {recordMode === 'audio' ? <Headphones size={20} /> : <Film size={20} />}
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-100 flex items-center gap-2">
                <span>Estudio de Grabación del Oráculo</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-normal border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
                  {recordMode === 'audio' ? 'Modo Audio' : '30 FPS Optimizado'}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                {recordMode === 'audio' 
                  ? 'Extrae la locución pura + música mística (0% lag para tu teléfono)' 
                  : 'Graba en Full HD 1080p con encuadre automático listo para redes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 pt-3 pb-2 flex gap-2 border-b border-white/5 shrink-0 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 px-3 rounded-xl font-serif text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'record'
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Circle size={10} className={isRecording ? "fill-red-500 text-red-500 animate-pulse" : "fill-current"} />
            <span>Configurar y Grabar</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 px-3 rounded-xl font-serif text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <FolderDown size={13} />
            <span>Archivos Guardados</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              savedRecordings.length > 0
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold'
                : 'bg-white/5 text-gray-400'
            }`}>
              {savedRecordings.length}
            </span>
          </button>
        </div>

        {/* TAB 1: CONFIGURACIÓN & GRABAR */}
        {activeTab === 'record' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-4 sm:p-5">
            {/* Step 1: Selector de Modo (Video vs Audio-Only) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase flex items-center justify-between">
                <span>1. Formato de Salida</span>
                <span className="text-[10px] text-amber-300 font-sans flex items-center gap-1">
                  <Zap size={11} />
                  {recordMode === 'audio' ? '0% consumo de CPU (Fluido en teléfono)' : '30 FPS Optimizado'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Option A: Video */}
                <button
                  onClick={() => onSelectRecordMode('video')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    recordMode === 'video'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${recordMode === 'video' ? 'bg-[#D4AF37] text-[#050B14]' : 'bg-white/5 text-gray-400'}`}>
                    <Film size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-xs font-semibold text-gray-100 flex items-center gap-1.5">
                      <span>Video Cinemático</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-mono font-bold">.MP4</span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">
                      1080p a 30 FPS con astrolabio y texto
                    </div>
                  </div>
                </button>

                {/* Option B: Audio Only */}
                <button
                  onClick={() => onSelectRecordMode('audio')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    recordMode === 'audio'
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-gray-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${recordMode === 'audio' ? 'bg-[#D4AF37] text-[#050B14]' : 'bg-white/5 text-gray-400'}`}>
                    <Volume2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-xs font-semibold text-gray-100 flex items-center gap-1.5">
                      <span>Sólo Audio / Locución</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">.M4A / .MP3</span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">
                      Cero lag • Ideal para editar en teléfono
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: En Modo Video -> Aspect Ratio / En Modo Audio -> Card Explicativa */}
            {recordMode === 'video' ? (
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase flex items-center justify-between">
                  <span>2. Encuadre de Video</span>
                  <span className="text-[10px] font-mono text-[#D4AF37]">
                    {ratios.find(r => r.id === aspectRatio)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ratios.map((r) => {
                    const isSelected = aspectRatio === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => onSelectAspectRatio(r.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                          isSelected
                            ? 'border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                            : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-200 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#D4AF37] text-[#050B14]' : 'bg-white/5 text-gray-300'}`}>
                            {r.icon}
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#050B14] flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <div className="font-serif text-xs font-semibold text-gray-100">
                          {r.label}
                        </div>
                        <div className="text-[10px] font-sans text-gray-400 mt-0.5 truncate">
                          {r.sublabel}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-serif text-xs font-bold">
                  <Headphones size={15} />
                  <span>Máxima Fluidez para tu Teléfono</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                  El oráculo recitará el poema y extraerá <strong>la locución de voz y la música mística</strong> en un archivo de audio puro sin procesar video. No causa nada de lag en tu computadora y puedes transferir el archivo a tu teléfono para montar el video directamente en <strong>CapCut, TikTok o Instagram Reels</strong>.
                </p>
              </div>
            )}

            {/* Step 3: Automatización */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="pr-4">
                  <span className="text-xs text-gray-200 font-sans group-hover:text-white transition-colors block">
                    Grabar al Iniciar Lectura automáticamente
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Inicia la captura desde que empieza el arcano y guarda el archivo al finalizar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRecordOnStart}
                  onChange={(e) => onToggleAutoRecord(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 accent-[#D4AF37] cursor-pointer shrink-0"
                />
              </label>
            </div>

            {/* Step 4: Botón de Acción Principal */}
            <div className="space-y-2 pt-1">
              {!isRecording ? (
                <button
                  onClick={onStartRecording}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-semibold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Circle size={12} className="fill-white" />
                  <span>
                    {recordMode === 'audio' 
                      ? 'Comenzar a Grabar Sólo Audio (.M4A / .MP3)' 
                      : 'Comenzar a Grabar Video Cinemático (.MP4)'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onStopRecording}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-600 text-[#050B14] font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer animate-pulse"
                >
                  <Square size={12} className="fill-[#050B14]" />
                  <span>Detener Grabación y Guardar ({recordingDuration})</span>
                </button>
              )}
            </div>

            {/* Footer explicativo */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck size={14} className="text-[#D4AF37] shrink-0" />
              <span>
                {recordMode === 'audio'
                  ? 'Recuerda marcar "Compartir audio de la pestaña" en el diálogo del navegador para capturar la locución.'
                  : 'Video optimizado a 30 FPS nativo con renderizado equilibrado para evitar tirones de rendimiento.'}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: BIBLIOTECA DE ARCHIVOS */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-3">
            {/* Header info */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <HardDrive size={14} className="text-[#D4AF37]" />
                <span>{savedRecordings.length} archivos guardados</span>
                <span className="opacity-40">•</span>
                <span className="text-[#D4AF37] font-mono">{totalMB} MB</span>
              </div>

              {savedRecordings.length > 0 && (
                isConfirmingClearAll ? (
                  <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 px-2.5 py-1 rounded-xl text-xs">
                    <span className="text-red-200 text-[10px]">¿Vaciar todo?</span>
                    <button
                      onClick={() => {
                        if (previewingRecording) {
                          URL.revokeObjectURL(previewingRecording.url);
                          setPreviewingRecording(null);
                        }
                        onClearAllRecordings();
                        setIsConfirmingClearAll(false);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Sí, borrar
                    </button>
                    <button
                      onClick={() => setIsConfirmingClearAll(false)}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingClearAll(true)}
                    className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={11} />
                    <span>Vaciar galería</span>
                  </button>
                )
              )}
            </div>

            {/* In-Modal Player if Previewing */}
            {previewingRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-[#02060F] border border-[#D4AF37]/50 space-y-2 overflow-hidden shadow-lg"
              >
                <div className="flex items-center justify-between text-xs text-[#D4AF37] font-serif">
                  <span>Reproduciendo previsualización ({previewingRecording.isAudio ? 'Audio' : 'Video'})</span>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(previewingRecording.url);
                      setPreviewingRecording(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                {previewingRecording.isAudio ? (
                  <audio
                    src={previewingRecording.url}
                    controls
                    autoPlay
                    className="w-full my-2"
                  />
                ) : (
                  <video
                    src={previewingRecording.url}
                    controls
                    autoPlay
                    className="w-full max-h-52 rounded-xl bg-black object-contain mx-auto"
                  />
                )}
              </motion.div>
            )}

            {/* List of Saved Files */}
            {savedRecordings.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mx-auto">
                  <Film size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-sm text-gray-200">
                    No hay grabaciones guardadas aún
                  </h4>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-1 font-sans">
                    Cuando inicies una grabación de video o audio, el archivo terminado se guardará aquí permanentemente para que puedas reproducirlo o descargarlo.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('record')}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-serif font-semibold hover:bg-[#D4AF37]/30 transition-all cursor-pointer"
                >
                  Grabar mi primer archivo
                </button>
              </div>
            ) : (
              savedRecordings.map((rec, idx) => {
                const isPlayingThis = previewingRecording?.id === rec.id;
                const isAudio = rec.mimeType.startsWith('audio/') || rec.aspectRatio === 'audio';

                return (
                  <div
                    key={`rec-${rec.id}-${idx}`}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#D4AF37]/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <button
                          onClick={() => handlePreview(rec)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            isPlayingThis
                              ? 'bg-[#D4AF37] text-[#050B14] shadow-[0_0_15px_#D4AF37]'
                              : 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/30 group-hover:scale-105'
                          }`}
                          title={isPlayingThis ? "Pausar" : "Reproducir"}
                        >
                          {isPlayingThis ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                        </button>

                        <div className="min-w-0">
                          <h4 className="font-serif text-sm font-semibold text-gray-100 truncate group-hover:text-[#D4AF37] transition-colors">
                            {rec.poemTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-sans mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded font-mono ${
                              isAudio 
                                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300' 
                                : 'bg-white/5 border border-white/10 text-[#D4AF37]'
                            }`}>
                              {isAudio ? 'AUDIO' : rec.aspectRatio}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={10} /> {rec.durationFormatted}
                            </span>
                            <span>•</span>
                            <span>{rec.fileSizeFormatted}</span>
                          </div>
                        </div>
                      </div>

                      {/* Download & Delete Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onDownloadRecording(rec)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/15 hover:from-[#D4AF37]/40 hover:to-[#D4AF37]/30 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-serif font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                          title="Descargar archivo"
                        >
                          <Download size={13} />
                          <span>Descargar</span>
                        </button>

                        {deletingId === rec.id ? (
                          <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/50 px-2 py-1 rounded-xl text-xs shrink-0">
                            <span className="text-red-200 text-[10px]">¿Borrar?</span>
                            <button
                              onClick={() => {
                                if (previewingRecording?.id === rec.id) {
                                  URL.revokeObjectURL(previewingRecording.url);
                                  setPreviewingRecording(null);
                                }
                                onDeleteRecording(rec.id);
                                setDeletingId(null);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(rec.id)}
                            className="p-1.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500 shrink-0 bg-[#02060F]/60">
          <span>Formatos soportados: MP4 (H.264), M4A, WebM</span>
          <span className="font-mono text-[#D4AF37]/70">Motor v3.0 Fluido</span>
        </div>
      </motion.div>
    </div>
  );
};
