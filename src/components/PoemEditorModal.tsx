import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  FileText, 
  Check, 
  Download, 
  Upload, 
  AlertTriangle,
  AlignLeft,
  ListOrdered,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Poem } from '../types';
import { defaultPoems, isPoemDifferentFromDefault, getDefaultPoem } from '../utils/poemsStorage';

interface PoemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  poems: Poem[];
  selectedPoemId: string;
  onSelectPoemId: (id: string) => void;
  onSavePoem: (updatedPoem: Poem) => void;
  onResetPoem: (id: string) => void;
  onResetAllPoems: () => void;
  onCreateNewPoem: () => void;
  onDeletePoem: (id: string) => void;
  onImportPoems: (poems: Poem[]) => void;
}

export const PoemEditorModal: React.FC<PoemEditorModalProps> = ({
  isOpen,
  onClose,
  poems,
  selectedPoemId,
  onSelectPoemId,
  onSavePoem,
  onResetPoem,
  onResetAllPoems,
  onCreateNewPoem,
  onDeletePoem,
  onImportPoems
}) => {
  const currentPoem = poems.find(p => p.id === selectedPoemId) || poems[0];

  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'backup'>('editor');
  const [versesMode, setVersesMode] = useState<'lines' | 'text'>('lines');
  
  // Working draft state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [hook, setHook] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync draft whenever currentPoem changes or modal opens
  useEffect(() => {
    if (currentPoem) {
      setTitle(currentPoem.title);
      setSubtitle(currentPoem.subtitle);
      setHook(currentPoem.hook);
      setLines([...currentPoem.lines]);
      setBulkText(currentPoem.lines.join('\n'));
      setSaveSuccess(false);
    }
  }, [currentPoem?.id, isOpen]);

  // Keep bulkText and lines in sync when switching modes
  const handleSwitchToBulk = () => {
    setBulkText(lines.join('\n'));
    setVersesMode('text');
  };

  const handleSwitchToLines = () => {
    const parsed = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    setLines(parsed.length > 0 ? parsed : ['']);
    setVersesMode('lines');
  };

  const handleBulkTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBulkText(val);
    const parsed = val
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    setLines(parsed.length > 0 ? parsed : ['']);
  };

  const handleLineChange = (index: number, val: string) => {
    const updated = [...lines];
    updated[index] = val;
    setLines(updated);
    setBulkText(updated.join('\n'));
  };

  const handleAddLine = () => {
    const updated = [...lines, ''];
    setLines(updated);
    setBulkText(updated.join('\n'));
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    const updated = lines.filter((_, i) => i !== index);
    setLines(updated);
    setBulkText(updated.join('\n'));
  };

  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lines.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...lines];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLines(updated);
    setBulkText(updated.join('\n'));
  };

  const handleSave = () => {
    if (!currentPoem) return;
    const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0);
    const updated: Poem = {
      ...currentPoem,
      title: title.trim() || currentPoem.title,
      subtitle: subtitle.trim() || currentPoem.subtitle,
      hook: hook.trim() || currentPoem.hook,
      lines: cleanLines.length > 0 ? cleanLines : ['(Verso vacío)']
    };
    onSavePoem(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(poems, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcanos_poemas_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportPoems(parsed);
          alert(`¡Se importaron ${parsed.length} poemas con éxito!`);
        } else {
          alert('El archivo no contiene un formato de poemas válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  const isCurrentModified = currentPoem ? isPoemDifferentFromDefault(currentPoem) : false;
  const isDefaultArcana = Boolean(getDefaultPoem(currentPoem?.id || ''));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#050B14]/98 border border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-100 flex items-center gap-2">
                <span>Editor Poético del Arcano</span>
                {isCurrentModified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-amber-500/40 bg-amber-500/10 text-amber-300">
                    Personalizado
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Modifica el título, la pregunta del umbral y los versos recitados en tiempo real.
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
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 px-3 rounded-xl font-serif text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Sparkles size={13} />
            <span>Editar Arcano Activo</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 px-3 rounded-xl font-serif text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <BookOpen size={13} />
            <span>Colección de Arcanos ({poems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-3 rounded-xl font-serif text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Download size={13} />
            <span>Respaldar / Reset</span>
          </button>
        </div>

        {/* TAB 1: EDITAR ARCANO ACTIVO */}
        {activeTab === 'editor' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4">
            {/* Quick Switch Arcana Dropdown */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-xs font-serif text-[#D4AF37] uppercase tracking-wider shrink-0">
                Arcano a Editar:
              </span>
              <select
                value={selectedPoemId}
                onChange={(e) => onSelectPoemId(e.target.value)}
                className="flex-1 max-w-xs bg-[#02060F] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-amber-200 font-serif focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                {poems.map(p => (
                  <option key={`opt-${p.id}`} value={p.id} className="bg-[#050B14] text-white">
                    {p.title} {isPoemDifferentFromDefault(p) ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 1: Título */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. Título del Arcano</span>
                <span className="text-[10px] text-gray-500 font-mono">{title.length} car.</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: 0. El Loco"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm text-gray-100 font-serif transition-all outline-none"
              />
            </div>

            {/* Field 2: Subtítulo / Epígrafe */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>2. Subtítulo / Epígrafe</span>
                <span className="text-[10px] text-gray-500 font-mono">{subtitle.length} car.</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej: El salto al abismo de lo desconocido"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm text-gray-200 italic font-serif transition-all outline-none"
              />
            </div>

            {/* Field 3: Pregunta del Umbral (Hook) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>3. Pregunta del Umbral (Hook)</span>
                  <span className="text-[10px] text-[#D4AF37] font-normal normal-case">
                    (Se recita antes del poema)
                  </span>
                </label>
                <span className="text-[10px] text-gray-500 font-mono">{hook.length} car.</span>
              </div>
              <textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                rows={2}
                placeholder="Ej: ¿Y si el mayor error de tu vida es seguir el camino seguro?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm text-amber-100 font-serif italic transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Field 4: Versos Poéticos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <span>4. Versos del Poema</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-amber-300">
                    {lines.length} versos
                  </span>
                </label>

                {/* Switcher: Línea por Línea vs Texto Corrido */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-sans">
                  <button
                    onClick={versesMode === 'text' ? handleSwitchToLines : undefined}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      versesMode === 'lines'
                        ? 'bg-[#D4AF37]/25 text-[#D4AF37] font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ListOrdered size={12} />
                    <span>Líneas</span>
                  </button>
                  <button
                    onClick={versesMode === 'lines' ? handleSwitchToBulk : undefined}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      versesMode === 'text'
                        ? 'bg-[#D4AF37]/25 text-[#D4AF37] font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <AlignLeft size={12} />
                    <span>Texto Completo</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Línea por Línea */}
              {versesMode === 'lines' ? (
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div 
                      key={`line-${idx}`} 
                      className="flex items-center gap-2 group p-1.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                    >
                      <span className="w-5 text-center text-[10px] font-mono text-gray-500 shrink-0 select-none">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => handleLineChange(idx, e.target.value)}
                        placeholder={`Verso ${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-transparent border-b border-transparent focus:border-[#D4AF37] text-xs text-gray-200 font-serif outline-none transition-colors"
                      />
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleMoveLine(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                          title="Subir verso"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveLine(idx, 'down')}
                          disabled={idx === lines.length - 1}
                          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                          title="Bajar verso"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length <= 1}
                          className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 cursor-pointer"
                          title="Eliminar verso"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddLine}
                    className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 text-gray-400 hover:text-[#D4AF37] text-xs font-serif flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Añadir nuevo verso</span>
                  </button>
                </div>
              ) : (
                /* Mode B: Texto Completo (Pega el poema entero) */
                <div className="space-y-1.5">
                  <textarea
                    value={bulkText}
                    onChange={handleBulkTextChange}
                    rows={8}
                    placeholder="Pega aquí los versos del poema, uno en cada línea..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs sm:text-sm text-gray-200 font-serif leading-relaxed transition-all outline-none resize-y"
                  />
                  <p className="text-[10px] text-gray-500 font-sans flex items-center gap-1">
                    <HelpCircle size={11} />
                    <span>Cada salto de línea será una estrofa leída por el narrador místico.</span>
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions for Active Poem */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                {isDefaultArcana && isCurrentModified && (
                  <button
                    onClick={() => {
                      if (confirm("¿Deseas restaurar este arcano a su texto poético original?")) {
                        onResetPoem(currentPoem.id);
                        const def = getDefaultPoem(currentPoem.id);
                        if (def) {
                          setTitle(def.title);
                          setSubtitle(def.subtitle);
                          setHook(def.hook);
                          setLines([...def.lines]);
                          setBulkText(def.lines.join('\n'));
                        }
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Restablecer a Original</span>
                  </button>
                )}

                {!isDefaultArcana && (
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el arcano personalizado "${currentPoem.title}"?`)) {
                        onDeletePoem(currentPoem.id);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar Arcano</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-600 text-[#050B14] font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>¡Guardado con éxito!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COLECCIÓN COMPLETA DE ARCANOS */}
        {activeTab === 'library' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-serif text-gray-300">
                Selecciona un arcano para editarlo o añade uno nuevo:
              </span>
              <button
                onClick={onCreateNewPoem}
                className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-serif font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <PlusCircle size={14} />
                <span>Nuevo Arcano Personalizado</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {poems.map((poem, idx) => {
                const isSelected = poem.id === selectedPoemId;
                const isModified = isPoemDifferentFromDefault(poem);
                const isCustom = !getDefaultPoem(poem.id);

                return (
                  <div
                    key={`lib-${poem.id}-${idx}`}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xs font-semibold text-gray-100 truncate">
                          {poem.title}
                        </span>
                        {isCustom && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono">
                            Creado por ti
                          </span>
                        )}
                        {isModified && !isCustom && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                            Modificado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-serif italic truncate mt-0.5">
                        &ldquo;{poem.hook}&rdquo;
                      </p>
                      <div className="text-[9px] text-gray-500 font-mono mt-1">
                        {poem.lines.length} versos
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onSelectPoemId(poem.id);
                          setActiveTab('editor');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D4AF37] text-[#050B14]'
                            : 'bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10'
                        }`}
                      >
                        {isSelected ? 'Editando' : 'Editar'}
                      </button>

                      {isCustom && (
                        confirmDeleteId === poem.id ? (
                          <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 p-1 rounded-xl text-xs">
                            <button
                              onClick={() => {
                                onDeletePoem(poem.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase cursor-pointer"
                            >
                              Borrar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[10px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(poem.id)}
                            className="p-1.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Eliminar este arcano"
                          >
                            <Trash2 size={13} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESPALDAR & RESTAURAR */}
        {activeTab === 'backup' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4">
            {/* Export */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37] font-serif text-sm font-semibold">
                <Download size={16} />
                <span>Exportar Colección a Archivo JSON</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Descarga una copia completa de todos tus poemas y arcanos modificados en tu computadora. Puedes usarlo para respaldarlos o compartirlos.
              </p>
              <button
                onClick={handleExportJSON}
                className="mt-2 px-4 py-2 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-serif font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <Download size={14} />
                <span>Descargar Archivo JSON de Poemas</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-serif text-sm font-semibold">
                <Upload size={16} />
                <span>Importar Colección desde Archivo JSON</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Restaura un archivo de respaldo previamente exportado para cargar todos los textos a la aplicación.
              </p>
              <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-serif font-semibold transition-all cursor-pointer">
                <Upload size={14} />
                <span>Seleccionar Archivo JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {/* Danger: Reset All */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-red-300 font-serif text-sm font-semibold">
                <AlertTriangle size={16} />
                <span>Restablecer Toda la Colección Original</span>
              </div>
              <p className="text-[11px] text-red-200/80 leading-relaxed font-sans">
                Elimina todas las modificaciones personalizadas y vuelve a los 22 poemas originales del Tarot que venían por defecto en la aplicación.
              </p>
              {confirmResetAll ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onResetAllPoems();
                      setConfirmResetAll(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase cursor-pointer"
                  >
                    Sí, restablecer todo
                  </button>
                  <button
                    onClick={() => setConfirmResetAll(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-serif cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmResetAll(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-serif font-semibold transition-all cursor-pointer"
                >
                  Restablecer a fábrica
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500 shrink-0 bg-[#02060F]/60">
          <span>Los cambios se guardan permanentemente en tu navegador</span>
          <span className="font-mono text-[#D4AF37]/70">Editor v1.0</span>
        </div>
      </motion.div>
    </div>
  );
};
