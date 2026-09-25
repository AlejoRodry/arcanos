import React from 'react';
import { Poem } from '../types';

interface ArcanaCardItemProps {
  poem: Poem;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export const ArcanaCardItem: React.FC<ArcanaCardItemProps> = ({
  poem,
  isSelected,
  onSelect,
  index
}) => {
  // Extract numeral and name cleanly
  const dotIndex = poem.title.indexOf('. ');
  const numeral = dotIndex !== -1 ? poem.title.slice(0, dotIndex) : (index === 24 ? '✦' : `${index}`);
  const name = dotIndex !== -1 ? poem.title.slice(dotIndex + 2) : poem.title;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 md:p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden flex items-start gap-3 md:gap-3.5 border ${
        isSelected
          ? 'bg-gradient-to-r from-[#D4AF37]/22 via-[#D4AF37]/8 to-[#050B14]/85 border-[#D4AF37]/75 shadow-[0_8px_32px_rgba(0,0,0,0.65),0_0_25px_rgba(212,175,55,0.25)] translate-x-1'
          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-[#D4AF37]/40 hover:translate-x-1 shadow-[0_4px_16px_rgba(0,0,0,0.35)]'
      } backdrop-blur-xl active:scale-[0.99]`}>
      
      {/* Specular Highlight Top Edge */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-300 ${
          isSelected 
            ? 'bg-gradient-to-r from-[#00E5FF]/70 via-[#D4AF37] to-transparent opacity-100' 
            : 'bg-white/10 opacity-30 group-hover:opacity-100 group-hover:bg-gradient-to-r group-hover:from-white/20 group-hover:via-[#D4AF37]/50 group-hover:to-transparent'
        }`} 
      />

      {/* MD4 Stencil Squircle Container (Troquelado) */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div 
          className={`w-11 h-11 rounded-[14px] p-[1.5px] transition-all duration-500 flex items-center justify-center ${
            isSelected 
              ? 'bg-gradient-to-tr from-[#00E5FF] via-[#D4AF37] to-[#F59E0B] shadow-[0_0_15px_rgba(212,175,55,0.45)]'
              : 'bg-gradient-to-tr from-white/20 via-white/10 to-transparent group-hover:from-[#D4AF37]/60 group-hover:via-[#F3E5AB]/40 group-hover:to-transparent'
          }`}
        >
          <div className="w-full h-full rounded-[12.5px] bg-[#050B14]/90 backdrop-blur-md flex items-center justify-center">
            <span 
              className={`font-mono text-xs font-bold tracking-wider transition-colors duration-300 ${
                isSelected 
                  ? 'text-[#F3E5AB] drop-shadow-[0_0_8px_rgba(212,175,55,0.9)]' 
                  : 'text-gray-400 group-hover:text-[#D4AF37]'
              }`}
            >
              {numeral}
            </span>
          </div>
        </div>

        {/* Ambient Glow behind Squircle */}
        {isSelected && (
          <div className="absolute inset-0 rounded-[14px] bg-[#D4AF37]/35 blur-md -z-10 animate-pulse" />
        )}
      </div>

      {/* Card Content & Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 
            className={`font-serif text-[15px] font-semibold tracking-wide truncate transition-colors duration-300 ${
              isSelected ? 'text-[#F3E5AB]' : 'text-gray-200 group-hover:text-amber-100'
            }`}
          >
            {name}
          </h3>

          {/* Micro Status Chip */}
          {isSelected ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase flex-shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
              Activo
            </span>
          ) : (
            <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400 transition-colors flex-shrink-0">
              #{String(index).padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Hook Preview Inscription */}
        <p 
          className={`font-serif text-xs italic line-clamp-1 leading-snug transition-colors duration-300 ${
            isSelected 
              ? 'text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' 
              : 'text-gray-400 group-hover:text-gray-300'
          }`}
        >
          &ldquo;{poem.hook}&rdquo;
        </p>
      </div>

      {/* Active Left Vertical Accent Light Beam */}
      {isSelected && (
        <div className="absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full bg-gradient-to-b from-[#00E5FF] via-[#D4AF37] to-[#F59E0B] shadow-[0_0_12px_#D4AF37]" />
      )}
    </button>
  );
};
