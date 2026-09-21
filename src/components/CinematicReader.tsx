import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Poem } from '../types';

interface CinematicReaderProps {
  poem: Poem;
  isSpeaking: boolean;
  theaterMode: boolean;
  currentLineIndex: number;
  currentWordIndex: number;
  onFinish: () => void;
}

export const CinematicReader: React.FC<CinematicReaderProps> = ({
  poem,
  isSpeaking,
  theaterMode,
  currentLineIndex,
  currentWordIndex,
  onFinish
}) => {
  const [showTitle, setShowTitle] = useState(true);

  // When speech starts, we wait a bit before showing the first line, 
  // or we just rely on currentLineIndex.
  useEffect(() => {
    if (isSpeaking) {
      // Hide title shortly after starting
      const timer = setTimeout(() => setShowTitle(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowTitle(true);
    }
  }, [isSpeaking]);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none transition-all duration-1000 ${!theaterMode ? 'md:pl-[420px]' : 'pl-0'}`}>
      <AnimatePresence mode="wait">
        {!isSpeaking && showTitle && (
          <motion.div
            key="title-screen"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 1.5 } }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-[#D4AF37] mb-6 tracking-widest drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
              {poem.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-serif italic tracking-wide">
              {poem.subtitle}
            </p>
          </motion.div>
        )}

        {isSpeaking && currentLineIndex >= 0 && (
          <motion.div
            key={`line-${currentLineIndex}`}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.8 } }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl"
          >
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-3xl md:text-5xl font-serif leading-relaxed text-gray-100">
              {poem.lines[currentLineIndex].trim().split(/\s+/).map((word, wIdx) => {
                const isRevealed = wIdx <= currentWordIndex;
                const isCurrent = wIdx === currentWordIndex;
                
                return (
                  <motion.span
                    key={wIdx}
                    animate={{
                      opacity: isRevealed ? 1 : 0.1,
                      color: isCurrent ? '#D4AF37' : isRevealed ? '#F3E5AB' : '#4B5563',
                      textShadow: isCurrent ? '0 0 20px rgba(212,175,55,0.8)' : '0 0 0px rgba(0,0,0,0)',
                      y: isCurrent ? -2 : 0,
                      scale: isCurrent ? 1.05 : 1
                    }}
                    transition={{ duration: 0.3 }}
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

      {/* Subtle gold aura behind central text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] bg-[#D4AF37] opacity-[0.03] blur-[100px] rounded-full pointer-events-none -z-10" />
    </div>
  );
};
