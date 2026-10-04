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
  Film
} from 'lucide-react';
import { AspectRatio } from '../hooks/useScreenRecorder';
import { SavedRecording } from '../utils/recordingsDB';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  onSelectAspectRatio: (ratio: AspectRatio) => void;
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
  const [previewingRecording, setPreviewingRecording] = useState<{ id: string; url: string } | null>(null);
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
    if (previewingRecording && previewingRecording.id === rec.id) {
      URL.revokeObjectURL(previewingRecording.url);
      setPreviewingRecording(null);
    } else {
      if (previewingRecording) {
        URL.revokeObjectURL(previewingRecording.url);
      }
      const url = URL.createObjectURL(rec.blob);
      setPreviewingRecording({ id: rec.id, url });
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
        className="relative w-full max-w-lg bg-[#050B14]/98 border border-[#D4AF37]/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.15)] text-white overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Video size={16} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#D4AF37] tracking-wider flex items-center gap-2">
                <span>Estudio & Grabaciones</span>
                {isRecording && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono animate-pulse">
                    <Circle size={7} className="fill-red-500 text-red-500" />
                    REC {recordingDuration}
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-sans text-gray-400">
                Graba en 9:16 o 16:9 y guarda tus videos en el sistema
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (previewingRecording) {
                URL.revokeObjectURL(previewingRecording.url);
                setPreviewingRecording(null);
              }
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-4 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('record')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'record'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Video size={13} />
            <span>Configuración & Grabar</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-3 text-xs font-serif tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-[#D4AF37] text-[#D4AF37] font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderDown size={13} />
            <span>Videos Guardados</span>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {/* Section 1: Selector de Relación de Aspecto */}
            <div>
              <div className="text-xs font-serif font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>1. Formato (Relación de Aspecto)</span>
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

            {/* Section 2: Opciones de Grabación Automática */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="text-xs font-serif font-semibold text-gray-300 uppercase tracking-wider">
                2. Automatización
              </div>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="pr-4">
                  <span className="text-xs text-gray-200 font-sans group-hover:text-white transition-colors block">
                    Grabar al Iniciar Lectura automáticamente
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Graba desde que empieza el arcano y guarda el video en el sistema al terminar
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

            {/* Section 3: Botones de Acción */}
            <div className="space-y-2">
              {!isRecording ? (
                <button
                  onClick={onStartRecording}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-semibold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Circle size={12} className="fill-white" />
                  <span>Comenzar a Grabar y Recitar Arcano (.MP4)</span>
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

            {/* Section 4: Aclaración Legal & Formato */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-[10px] text-gray-400 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-200/90 font-medium font-serif text-xs">
                <ShieldCheck size={14} className="text-[#D4AF37]" />
                <span>Formato Universal .MP4 & YouTube:</span>
              </div>
              <p>
                Los videos se exportan y guardan en formato <strong>.MP4</strong> listo para YouTube, TikTok e Instagram. Al pulsar el botón, el oráculo entrará automáticamente en modo cine y comenzará a recitar el arcano mientras graba.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: VIDEOS GUARDADOS EN EL SISTEMA */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-[220px]">
            {/* Library Overview Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <HardDrive size={14} className="text-[#D4AF37]" />
                <span>{savedRecordings.length} videos guardados</span>
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

            {/* In-Modal Video Player if Previewing */}
            {previewingRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-[#02060F] border border-[#D4AF37]/50 space-y-2 overflow-hidden shadow-lg"
              >
                <div className="flex items-center justify-between text-xs text-[#D4AF37] font-serif">
                  <span>Reproduciendo previsualización</span>
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
                <video
                  src={previewingRecording.url}
                  controls
                  autoPlay
                  className="w-full max-h-52 rounded-xl bg-black object-contain mx-auto"
                />
              </motion.div>
            )}

            {/* List of Saved Videos */}
            {savedRecordings.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mx-auto">
                  <Film size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-sm text-gray-200">
                    No hay videos guardados aún
                  </h4>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-1 font-sans">
                    Cuando inicies una grabación, el video terminado se guardará aquí permanentemente para que puedas reproducirlo o descargarlo cuando quieras.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('record')}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-serif font-semibold hover:bg-[#D4AF37]/30 transition-all cursor-pointer"
                >
                  Grabar mi primer video
                </button>
              </div>
            ) : (
              savedRecordings.map((rec, idx) => {
                const isPlayingThis = previewingRecording?.id === rec.id;
                const dateStr = new Date(rec.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

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
                          title={isPlayingThis ? "Pausar" : "Reproducir video"}
                        >
                          {isPlayingThis ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                        </button>

                        <div className="min-w-0">
                          <h4 className="font-serif text-sm font-semibold text-gray-100 truncate group-hover:text-[#D4AF37] transition-colors">
                            {rec.poemTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-sans mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 font-mono text-[#D4AF37]">
                              {rec.aspectRatio}
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
                          title="Descargar este video a tu computadora"
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
                            title="Eliminar grabación"
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
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500 shrink-0">
          <span>Tus grabaciones se conservan seguras en el navegador / app</span>
          <span className="text-[#D4AF37] font-mono">1080p 60FPS</span>
        </div>
      </motion.div>
    </div>
  );
};
