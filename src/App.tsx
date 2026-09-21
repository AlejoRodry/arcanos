import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParticleBackground } from './components/ParticleBackground';
import { CinematicReader } from './components/CinematicReader';
import { useSpeech } from './hooks/useSpeech';
import { poems } from './data/poems';
import { Play, X, Upload, Volume2, VolumeX, Moon, Sparkles } from 'lucide-react';
import { Poem } from './types';

type ThemeType = 'astrolabe' | 'cosmos';

export default function App() {
  const [selectedPoemId, setSelectedPoemId] = useState<string>(poems[0].id);
  const [theaterMode, setTheaterMode] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('astrolabe');
  
  // Audio State
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { isSpeaking, currentLineIndex, currentWordIndex, speak, stop } = useSpeech();

  const selectedPoem = poems.find(p => p.id === selectedPoemId) || poems[0];
  const currentIndex = poems.findIndex(p => p.id === selectedPoemId);

  // Audio Handling
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      setIsAudioPlaying(true);
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleStart = useCallback(() => {
    if (theaterMode) return;
    
    // Force stop any ongoing speech immediately before starting
    window.speechSynthesis.cancel();
    
    setTheaterMode(true);
    
    // Lower background music volume slightly when speaking starts
    if (audioRef.current) {
      audioRef.current.volume = 0.15;
    }

    setTimeout(() => {
      speak(selectedPoem.lines, () => {
        setTheaterMode(false);
        // Restore background music volume when done
        if (audioRef.current) {
          audioRef.current.volume = 0.4;
        }
      });
    }, 2000);
  }, [speak, selectedPoem.lines, theaterMode]);

  const handleStop = useCallback(() => {
    stop();
    setTheaterMode(false);
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
    }
  }, [stop]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (theaterMode) {
        if (e.key === 'Escape' || e.key === ' ') {
          e.preventDefault();
          handleStop();
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStart();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % poems.length;
          setSelectedPoemId(poems[nextIndex].id);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + poems.length) % poems.length;
          setSelectedPoemId(poems[prevIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theaterMode, currentIndex, handleStart, handleStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [stop, audioSrc]);

  return (
    <div className={`relative min-h-screen w-full overflow-hidden font-serif selection:bg-[#D4AF37] selection:text-[#050B14] transition-colors duration-1000 ${theme === 'cosmos' ? 'bg-[#020108]' : 'bg-[#050B14]'}`}>
      
      {/* Hidden Audio Element */}
      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          loop 
          autoPlay 
          volume={0.4} 
        />
      )}

      {/* --- BACKGROUND LAYER: ASTROLABE --- */}
      <AnimatePresence>
        {theme === 'astrolabe' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Victorian Damask Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.12] mix-blend-screen"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0c0 27.614-22.386 50-50 50v-2c26.51 0 48-21.49 48-48h2zm50 50c-27.614 0-50 22.386-50 50h-2c0-26.51 21.49-48 48-48v-2zm-50 50c0-27.614-22.386-50-50-50v2c26.51 0 48 21.49 48 48h2zm50-50c-27.614 0-50-22.386-50-50h2c0 26.51 21.49 48 48 48v2z' fill='%23D4AF37' fill-opacity='1' fill-rule='evenodd'/%3E%3Ccircle cx='50' cy='50' r='18' fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-opacity='1'/%3E%3Ccircle cx='0' cy='0' r='18' fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-opacity='1'/%3E%3Ccircle cx='100' cy='0' r='18' fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-opacity='1'/%3E%3Ccircle cx='0' cy='100' r='18' fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-opacity='1'/%3E%3Ccircle cx='100' cy='100' r='18' fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '120px 120px'
              }}
            />
            {/* Vignette Depth Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#03070D_85%)]" />

            {/* God Rays / Volumetric Light */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#D4AF37]/[0.06] via-[#D4AF37]/[0.01] to-transparent mix-blend-screen" />
            <div className="absolute -top-[30%] left-[10%] w-[80%] h-[120%] bg-gradient-to-b from-[#00E5FF]/[0.03] to-transparent rotate-[25deg] blur-3xl" />
            
            {/* Giant Rotating Astrolabe */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] md:w-[1500px] md:h-[1500px] opacity-[0.08] flex items-center justify-center"
              style={{ animation: 'spin 240s linear infinite' }}
            >
              <svg viewBox="0 0 800 800" className="w-full h-full stroke-[#D4AF37] fill-none" strokeWidth="1">
                <defs>
                  <path id="outerTextPath" d="M 400, 400 m -370, 0 a 370,370 0 1,1 740,0 a 370,370 0 1,1 -740,0" />
                  <path id="innerTextPath" d="M 400, 400 m -220, 0 a 220,220 0 1,1 440,0 a 220,220 0 1,1 -440,0" />
                  <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="400" cy="400" r="380" strokeDasharray="1 10" strokeWidth="3" opacity="0.6" />
                <circle cx="400" cy="400" r="365" strokeWidth="1" opacity="0.8" />
                <circle cx="400" cy="400" r="290" strokeDasharray="30 15 5 15" strokeWidth="1.5" />
                <g opacity="0.3" strokeWidth="0.5">
                  {[0, 60, 120, 180, 240, 300].map(angle => (
                    <circle key={angle} cx={400 + Math.cos(angle * Math.PI / 180) * 150} cy={400 + Math.sin(angle * Math.PI / 180) * 150} r="150" />
                  ))}
                </g>
                <g opacity="0.5" strokeWidth="1.5">
                  <path d="M 400 110 L 651.1 545 L 148.9 545 Z" />
                  <path d="M 400 690 L 148.9 255 L 651.1 255 Z" />
                </g>
                <g fill="#D4AF37" opacity="0.6">
                  <circle cx="400" cy="40" r="8" />
                  <circle cx="400" cy="760" r="8" />
                  <circle cx="40" cy="400" r="8" />
                  <circle cx="760" cy="400" r="8" />
                </g>
                <circle cx="400" cy="400" r="140" strokeDasharray="4 8" strokeWidth="2" />
                <circle cx="400" cy="400" r="25" fill="url(#glowGrad)" stroke="none" />
                <text fill="#D4AF37" stroke="none" fontSize="20" letterSpacing="8" opacity="0.8" fontWeight="400" className="font-serif">
                  <textPath href="#outerTextPath" startOffset="0%">
                    OMNIA MUTANTUR NIHIL INTERIT · FATO PRUDENTIA MINOR · IN GIRUM IMUS NOCTE ET CONSUMIMUR IGNI · MEMENTO MORI · 
                  </textPath>
                </text>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BACKGROUND LAYER: COSMOS --- */}
      <AnimatePresence>
        {theme === 'cosmos' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Deep Space Nebula Clouds */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020108] to-[#020108]" />
            <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-cyan-700/10 blur-[150px] mix-blend-screen" />
            
            {/* Rotating Starfield */}
            <div 
              className="absolute inset-[-50%] opacity-50"
              style={{
                backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0))`,
                backgroundSize: '200px 200px',
                animation: 'spin 400s linear infinite'
              }}
            />

            {/* Glowing Celestial Body */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10">
               <div className="absolute inset-0 rounded-full border-[1px] border-indigo-300/30 shadow-[0_0_100px_rgba(99,102,241,0.2)_inset]" />
               <div className="absolute inset-4 rounded-full border-[1px] border-dashed border-purple-300/20" style={{ animation: 'spin 120s linear infinite reverse' }} />
               <div className="absolute inset-12 rounded-full border-[1px] border-cyan-300/10" />
            </div>

            {/* Blue Constellations (SVG) */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 4px rgba(0,229,255,0.4))' }}>
                <style>
                  {`
                    @keyframes twinkle {
                      0%, 100% { opacity: 0.4; }
                      50% { opacity: 1; }
                    }
                    .constellation-node {
                      animation: twinkle 4s ease-in-out infinite;
                    }
                  `}
                </style>
                {/* Left Constellation */}
                <g stroke="#00E5FF" strokeWidth="0.8" fill="#00E5FF" opacity="0.8">
                  <path d="M 15vw 30vh L 25vw 20vh L 35vw 35vh L 20vw 45vh Z" fill="none" />
                  <path d="M 25vw 20vh L 30vw 10vh" fill="none" />
                  <circle cx="15vw" cy="30vh" r="2.5" className="constellation-node" />
                  <circle cx="25vw" cy="20vh" r="3.5" className="constellation-node" style={{ animationDelay: '1s' }} />
                  <circle cx="35vw" cy="35vh" r="2.5" className="constellation-node" style={{ animationDelay: '2s' }} />
                  <circle cx="20vw" cy="45vh" r="3.5" className="constellation-node" style={{ animationDelay: '0.5s' }} />
                  <circle cx="30vw" cy="10vh" r="2.5" className="constellation-node" style={{ animationDelay: '1.5s' }} />
                </g>
                
                {/* Right Constellation */}
                <g stroke="#818CF8" strokeWidth="0.8" fill="#818CF8" opacity="0.8">
                  <path d="M 75vw 60vh L 85vw 50vh L 80vw 35vh L 90vw 25vh" fill="none" />
                  <path d="M 85vw 50vh L 95vw 65vh" fill="none" />
                  <circle cx="75vw" cy="60vh" r="2.5" className="constellation-node" style={{ animationDelay: '0.2s' }} />
                  <circle cx="85vw" cy="50vh" r="3.5" className="constellation-node" style={{ animationDelay: '1.2s' }} />
                  <circle cx="80vw" cy="35vh" r="2.5" className="constellation-node" style={{ animationDelay: '2.2s' }} />
                  <circle cx="90vw" cy="25vh" r="2.5" className="constellation-node" style={{ animationDelay: '3s' }} />
                  <circle cx="95vw" cy="65vh" r="2.5" className="constellation-node" style={{ animationDelay: '1.7s' }} />
                </g>

                {/* Center-Bottom Constellation */}
                <g stroke="#00E5FF" strokeWidth="0.8" fill="#00E5FF" opacity="0.8">
                  <path d="M 45vw 75vh L 55vw 85vh L 65vw 70vh" fill="none" />
                  <path d="M 55vw 85vh L 50vw 95vh" fill="none" />
                  <circle cx="45vw" cy="75vh" r="2.5" className="constellation-node" style={{ animationDelay: '0.8s' }} />
                  <circle cx="55vw" cy="85vh" r="3.5" className="constellation-node" style={{ animationDelay: '1.8s' }} />
                  <circle cx="65vw" cy="70vh" r="2.5" className="constellation-node" style={{ animationDelay: '2.8s' }} />
                  <circle cx="50vw" cy="95vh" r="2.5" className="constellation-node" style={{ animationDelay: '3.5s' }} />
                </g>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ParticleBackground theme={theme} />

      {/* Main UI / Selection Panel */}
      <AnimatePresence>
        {!theaterMode && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={`absolute top-0 left-0 h-full w-full md:w-[420px] p-8 md:p-12 flex flex-col justify-center z-20 transition-colors duration-1000 ${
              theme === 'cosmos' 
                ? 'bg-gradient-to-r from-[#020108] via-[#020108]/90 to-transparent' 
                : 'bg-gradient-to-r from-[#02060F] via-[#02060F]/80 to-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl md:text-5xl text-[#D4AF37] font-semibold tracking-wide uppercase">
                Arcanos
              </h1>
              
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(t => t === 'astrolabe' ? 'cosmos' : 'astrolabe')}
                className="p-2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-white/5"
                title="Cambiar Escenario"
              >
                {theme === 'astrolabe' ? <Moon size={22} /> : <Sparkles size={22} />}
              </button>
            </div>
            
            <p className="text-gray-400 italic mb-12 tracking-wider">
              El teatro del destino
            </p>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 mb-8 space-y-4">
              {poems.map((poem) => (
                <button
                  key={poem.id}
                  onClick={() => setSelectedPoemId(poem.id)}
                  className={`w-full text-left px-6 py-4 transition-all duration-500 border-l-2 ${
                    selectedPoemId === poem.id
                      ? 'border-[#D4AF37] bg-white/5 text-[#D4AF37] translate-x-2'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  <div className="text-xl tracking-wider">{poem.title}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="group relative inline-flex flex-shrink-0 items-center justify-center gap-3 px-6 py-4 bg-transparent overflow-hidden text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-500 ease-out"
            >
              <div className="absolute inset-0 bg-[#D4AF37] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-out" />
              <Play size={20} className="relative z-10 flex-shrink-0 group-hover:text-[#050B14] transition-colors duration-500" />
              <span className="relative z-10 text-sm md:text-base uppercase tracking-[0.2em] whitespace-nowrap group-hover:text-[#050B14] transition-colors duration-500">
                Iniciar Lectura
              </span>
            </button>

            {/* Audio Upload Controls */}
            <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#D4AF37] transition-colors group">
                <Upload size={16} className="group-hover:-translate-y-1 transition-transform" />
                <span className="tracking-wider">Subir Música (.mp3)</span>
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleAudioUpload}
                />
              </label>

              {audioSrc && (
                <button 
                  onClick={toggleAudio}
                  className="p-2 hover:text-[#D4AF37] transition-colors"
                  title={isAudioPlaying ? "Pausar música" : "Reproducir música"}
                >
                  {isAudioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theater Mode Stop Button (Mobile Only) */}
      <AnimatePresence>
        {theaterMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            whileHover={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleStop}
            className="md:hidden absolute top-8 right-8 z-30 p-4 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cinematic Reader overlay */}
      <CinematicReader
        poem={selectedPoem}
        isSpeaking={isSpeaking}
        theaterMode={theaterMode}
        currentLineIndex={currentLineIndex}
        currentWordIndex={currentWordIndex}
        onFinish={() => setTheaterMode(false)}
      />
    </div>
  );
}
