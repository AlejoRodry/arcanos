import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParticleBackground } from './components/ParticleBackground';
import { CinematicReader } from './components/CinematicReader';
import { useSpeech } from './hooks/useSpeech';
import { poems } from './data/poems';
import { 
  Play, 
  X, 
  Upload, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Compass,
  Info,
  RotateCw
} from 'lucide-react';
import { circleInscriptions, CircleInscription, getNextCircleInscription } from './data/circleInscriptions';

type ThemeType = 'astrolabe' | 'cosmos';

export default function App() {
  const [selectedPoemId, setSelectedPoemId] = useState<string>(poems[0].id);
  const [theaterMode, setTheaterMode] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('astrolabe');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [currentInscription, setCurrentInscription] = useState<CircleInscription>(getNextCircleInscription);
  const [isInscriptionModalOpen, setIsInscriptionModalOpen] = useState(false);
  
  // Audio State
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const touchStartX = useRef<number | null>(null);

  const { isSpeaking, speechStage, currentLineIndex, currentWordIndex, speakPoem, stop, skip } = useSpeech();

  const handleNextInscription = () => {
    const currentIdx = circleInscriptions.findIndex(c => c.id === currentInscription.id);
    const nextIdx = (currentIdx + 1) % circleInscriptions.length;
    localStorage.setItem('radiant_astrolabe_phrase_index', nextIdx.toString());
    setCurrentInscription(circleInscriptions[nextIdx]);
  };

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
    
    setTheaterMode(true);
    setIsMobileDrawerOpen(false);
    
    if (audioRef.current) {
      audioRef.current.volume = 0.15;
    }

    speakPoem(selectedPoem, () => {
      setTheaterMode(false);
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
      }
    });
  }, [theaterMode, selectedPoem, speakPoem]);

  const handleStop = useCallback(() => {
    stop();
    setTheaterMode(false);
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
    }
  }, [stop]);

  // Touch swipe gestures for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (theaterMode || isMobileDrawerOpen) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || theaterMode || isMobileDrawerOpen) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        // Swiped left -> Next arcano
        const nextIndex = (currentIndex + 1) % poems.length;
        setSelectedPoemId(poems[nextIndex].id);
      } else {
        // Swiped right -> Previous arcano
        const prevIndex = (currentIndex - 1 + poems.length) % poems.length;
        setSelectedPoemId(poems[prevIndex].id);
      }
    }
    touchStartX.current = null;
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (theaterMode) {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleStop();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          skip();
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
  }, [theaterMode, currentIndex, handleStart, handleStop, skip]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [stop, audioSrc]);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative min-h-screen w-full overflow-hidden font-serif selection:bg-[#D4AF37] selection:text-[#050B14] transition-colors duration-1000 ${
        theme === 'cosmos' ? 'bg-[#020108]' : 'bg-[#050B14]'
      }`}
    >
      {/* Hidden Audio Element */}
      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          loop 
          autoPlay 
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
            
            {/* Rotating Astrolabe */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] md:w-[1500px] md:h-[1500px] opacity-[0.11] flex items-center justify-center transition-opacity duration-700"
              style={{ animation: 'spin 240s linear infinite' }}
            >
              <svg viewBox="0 0 800 800" className="w-full h-full stroke-[#D4AF37] fill-none" strokeWidth="1">
                <defs>
                  <path id="outerTextPath" d="M 400, 400 m -370, 0 a 370,370 0 1,1 740,0 a 370,370 0 1,1 -740,0" />
                  <path id="innerTextPath" d="M 400, 400 m -225, 0 a 225,225 0 1,1 450,0 a 225,225 0 1,1 -450,0" />
                  <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="400" cy="400" r="380" strokeDasharray="1 10" strokeWidth="3" opacity="0.6" />
                <circle cx="400" cy="400" r="365" strokeWidth="1" opacity="0.8" />
                <circle cx="400" cy="400" r="290" strokeDasharray="30 15 5 15" strokeWidth="1.5" />
                <g opacity="0.35" strokeWidth="0.5">
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
                <circle cx="400" cy="400" r="225" strokeDasharray="4 8" strokeWidth="1.5" opacity="0.5" />
                <circle cx="400" cy="400" r="140" strokeDasharray="4 8" strokeWidth="2" />
                <circle cx="400" cy="400" r="25" fill="url(#glowGrad)" stroke="none" />

                {/* Outer Inscription Ring (Latin) */}
                <text fill="#D4AF37" stroke="none" fontSize="18" letterSpacing="7" opacity="0.9" fontWeight="400" className="font-serif">
                  <textPath href="#outerTextPath" startOffset="0%">
                    {currentInscription.outerLatin}
                  </textPath>
                </text>

                {/* Inner Inscription Ring (Latin) */}
                <text fill="#D4AF37" stroke="none" fontSize="13" letterSpacing="5" opacity="0.8" fontWeight="400" className="font-serif">
                  <textPath href="#innerTextPath" startOffset="0%">
                    {currentInscription.innerLatin}
                  </textPath>
                </text>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BACKGROUND LAYER: COSMOS (ESCENARIO NOCTURNO CON CONSTELACIONES) --- */}
      <AnimatePresence>
        {theme === 'cosmos' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Deep Space Nebula */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#020108] to-[#020108]" />
            <div className="absolute top-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-purple-600/12 blur-[130px] mix-blend-screen" />
            <div className="absolute bottom-[20%] right-[10%] w-[55vw] h-[55vw] rounded-full bg-cyan-700/15 blur-[160px] mix-blend-screen" />
            
            {/* Rotating Starfield */}
            <div 
              className="absolute inset-[-50%] opacity-60"
              style={{
                backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #00E5FF, rgba(0,0,0,0))`,
                backgroundSize: '220px 220px',
                animation: 'spin 400s linear infinite'
              }}
            />

            {/* Glowing Celestial Body / Orbit Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-15">
              <div className="absolute inset-0 rounded-full border border-indigo-400/40 shadow-[0_0_100px_rgba(99,102,241,0.25)_inset]" />
              <div className="absolute inset-8 rounded-full border border-dashed border-cyan-400/30" style={{ animation: 'spin 180s linear infinite reverse' }} />
              <div className="absolute inset-20 rounded-full border border-purple-400/20" />
            </div>

            {/* Radiant Cyan & Indigo Constellations (Escenario Nocturno) */}
            <div className="absolute inset-0 pointer-events-none opacity-85 overflow-hidden">
              <svg 
                className="w-full h-full" 
                xmlns="http://www.w3.org/2000/svg" 
                style={{ 
                  animation: 'celestialDrift 45s ease-in-out infinite alternate',
                  willChange: 'transform'
                }}
              >
                <defs>
                  {/* High performance GPU Star Corona Glow */}
                  <filter id="coronaCyan" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                  </filter>
                  <filter id="coronaIndigo" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                  </filter>
                  <radialGradient id="starCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="40%" stopColor="#00E5FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <style>
                  {`
                    @keyframes celestialDrift {
                      0% { transform: scale(1) translate3d(0, 0, 0); }
                      50% { transform: scale(1.015) translate3d(6px, -8px, 0); }
                      100% { transform: scale(1) translate3d(0, 0, 0); }
                    }
                    @keyframes starBreatheSlow {
                      0%, 100% { opacity: 0.35; }
                      50% { opacity: 0.95; }
                    }
                    @keyframes starBreatheFast {
                      0%, 100% { opacity: 0.45; }
                      50% { opacity: 1; }
                    }
                    @keyframes filamentPulse {
                      0%, 100% { opacity: 0.25; stroke-dashoffset: 0; }
                      50% { opacity: 0.7; stroke-dashoffset: 16; }
                    }
                    .star-breathe-1 {
                      animation: starBreatheSlow 5.2s ease-in-out infinite;
                    }
                    .star-breathe-2 {
                      animation: starBreatheFast 3.8s ease-in-out infinite;
                    }
                    .star-breathe-3 {
                      animation: starBreatheSlow 4.5s ease-in-out infinite;
                    }
                    .filament-line {
                      animation: filamentPulse 6s ease-in-out infinite;
                    }
                  `}
                </style>

                {/* ======================================================== */}
                {/* Constelación 1: Osa Mayor (Ursa Major / Superior Izq) */}
                {/* ======================================================== */}
                <g opacity="0.85">
                  <path 
                    d="M 16vw 22vh L 24vw 18vh L 32vw 22vh L 38vw 28vh L 32vw 36vh L 24vw 34vh L 24vw 18vh" 
                    fill="none" 
                    stroke="#00E5FF" 
                    strokeWidth="0.9" 
                    strokeDasharray="4 2" 
                    className="filament-line"
                  />
                  {/* Star Nodes (Corona + Diamond Core) */}
                  {[
                    { cx: '16vw', cy: '22vh', r: 2.8, anim: 'star-breathe-1', delay: '0.4s' },
                    { cx: '24vw', cy: '18vh', r: 3.5, anim: 'star-breathe-2', delay: '1.2s' },
                    { cx: '32vw', cy: '22vh', r: 2.8, anim: 'star-breathe-3', delay: '2.0s' },
                    { cx: '38vw', cy: '28vh', r: 3.8, anim: 'star-breathe-1', delay: '2.8s' },
                    { cx: '32vw', cy: '36vh', r: 3.0, anim: 'star-breathe-2', delay: '0.8s' },
                    { cx: '24vw', cy: '34vh', r: 3.2, anim: 'star-breathe-3', delay: '1.6s' }
                  ].map((star, idx) => (
                    <g key={idx} className={star.anim} style={{ animationDelay: star.delay }}>
                      <circle cx={star.cx} cy={star.cy} r={star.r * 2.2} fill="#00E5FF" opacity="0.3" filter="url(#coronaCyan)" />
                      <circle cx={star.cx} cy={star.cy} r={star.r} fill="#FFFFFF" />
                      <circle cx={star.cx} cy={star.cy} r={star.r * 0.6} fill="#E0F7FA" />
                    </g>
                  ))}
                </g>

                {/* ======================================================== */}
                {/* Constelación 2: Orión & Cinturón de 3 Estrellas (Derecha) */}
                {/* ======================================================== */}
                <g opacity="0.9">
                  {/* Filamentos conectores */}
                  <path d="M 74vw 20vh L 86vw 17vh" fill="none" stroke="#818CF8" strokeWidth="1" className="filament-line" />
                  <path d="M 78vw 29vh L 80.5vw 30.5vh L 83vw 32vh" fill="none" stroke="#00E5FF" strokeWidth="1.3" />
                  <path d="M 75vw 42vh L 78vw 29vh" fill="none" stroke="#818CF8" strokeWidth="0.9" className="filament-line" style={{ animationDelay: '1s' }} />
                  <path d="M 86vw 17vh L 83vw 32vh L 87vw 40vh" fill="none" stroke="#818CF8" strokeWidth="0.9" className="filament-line" style={{ animationDelay: '2s' }} />
                  <path d="M 74vw 20vh L 78vw 29vh" fill="none" stroke="#818CF8" strokeWidth="0.9" className="filament-line" style={{ animationDelay: '0.5s' }} />
                  <path d="M 75vw 42vh L 87vw 40vh" fill="none" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

                  {/* Betelgeuse (Supergigante Roja/Ámbar) */}
                  <g className="star-breathe-1" style={{ animationDelay: '0.2s' }}>
                    <circle cx="74vw" cy="20vh" r="9" fill="#F59E0B" opacity="0.35" filter="url(#coronaCyan)" />
                    <circle cx="74vw" cy="20vh" r="4.2" fill="#FDE68A" />
                    <circle cx="74vw" cy="20vh" r="2.2" fill="#FFFFFF" />
                  </g>

                  {/* Bellatrix (Gigante Azul) */}
                  <g className="star-breathe-2" style={{ animationDelay: '1.8s' }}>
                    <circle cx="86vw" cy="17vh" r="8" fill="#00E5FF" opacity="0.4" filter="url(#coronaCyan)" />
                    <circle cx="86vw" cy="17vh" r="3.6" fill="#A5F3FC" />
                    <circle cx="86vw" cy="17vh" r="1.8" fill="#FFFFFF" />
                  </g>

                  {/* Cinturón de Orión (Tres Estrellas Místicas) */}
                  {[
                    { cx: '78vw', cy: '29vh', delay: '0.6s' },
                    { cx: '80.5vw', cy: '30.5vh', delay: '1.4s' },
                    { cx: '83vw', cy: '32vh', delay: '2.2s' }
                  ].map((star, idx) => (
                    <g key={idx} className="star-breathe-2" style={{ animationDelay: star.delay }}>
                      <circle cx={star.cx} cy={star.cy} r="6" fill="#00E5FF" opacity="0.25" filter="url(#coronaCyan)" />
                      <circle cx={star.cx} cy={star.cy} r="2.8" fill="#FFFFFF" />
                    </g>
                  ))}

                  {/* Saiph */}
                  <g className="star-breathe-3" style={{ animationDelay: '3.0s' }}>
                    <circle cx="75vw" cy="42vh" r="6" fill="#818CF8" opacity="0.3" filter="url(#coronaIndigo)" />
                    <circle cx="75vw" cy="42vh" r="3.0" fill="#E0E7FF" />
                  </g>

                  {/* Rigel (Supergigante Azul de Alta Luminosidad) */}
                  <g className="star-breathe-1" style={{ animationDelay: '2.6s' }}>
                    <circle cx="87vw" cy="40vh" r="10" fill="#00E5FF" opacity="0.45" filter="url(#coronaCyan)" />
                    <circle cx="87vw" cy="40vh" r="4.5" fill="#E0F7FA" />
                    <circle cx="87vw" cy="40vh" r="2.4" fill="#FFFFFF" />
                  </g>
                </g>

                {/* ======================================================== */}
                {/* Constelación 3: Casiopea (Corona de la Reina - Superior) */}
                {/* ======================================================== */}
                <g opacity="0.85">
                  <path 
                    d="M 58vw 9vh L 63vw 14vh L 69vw 10vh L 74vw 15vh L 80vw 11vh" 
                    fill="none" 
                    stroke="#00E5FF" 
                    strokeWidth="0.85" 
                    className="filament-line"
                    style={{ animationDelay: '1.5s' }}
                  />
                  {[
                    { cx: '58vw', cy: '9vh', r: 2.6, delay: '0.5s' },
                    { cx: '63vw', cy: '14vh', r: 3.4, delay: '1.5s' },
                    { cx: '69vw', cy: '10vh', r: 3.8, delay: '2.5s' },
                    { cx: '74vw', cy: '15vh', r: 3.0, delay: '3.5s' },
                    { cx: '80vw', cy: '11vh', r: 2.6, delay: '1.0s' }
                  ].map((star, idx) => (
                    <g key={idx} className="star-breathe-3" style={{ animationDelay: star.delay }}>
                      <circle cx={star.cx} cy={star.cy} r={star.r * 2} fill="#00E5FF" opacity="0.3" filter="url(#coronaCyan)" />
                      <circle cx={star.cx} cy={star.cy} r={star.r} fill="#FFFFFF" />
                    </g>
                  ))}
                </g>

                {/* ======================================================== */}
                {/* Constelación 4: Cygnus / La Cruz Cósmica (Inferior) */}
                {/* ======================================================== */}
                <g opacity="0.8">
                  <path d="M 44vw 68vh L 52vw 74vh L 60vw 80vh" fill="none" stroke="#818CF8" strokeWidth="0.85" className="filament-line" style={{ animationDelay: '0.8s' }} />
                  <path d="M 48vw 80vh L 52vw 74vh L 56vw 66vh" fill="none" stroke="#818CF8" strokeWidth="0.85" className="filament-line" style={{ animationDelay: '2.4s' }} />
                  
                  {/* Deneb */}
                  <g className="star-breathe-1" style={{ animationDelay: '0.9s' }}>
                    <circle cx="44vw" cy="68vh" r="8" fill="#00E5FF" opacity="0.4" filter="url(#coronaCyan)" />
                    <circle cx="44vw" cy="68vh" r="3.8" fill="#FFFFFF" />
                  </g>
                  {/* Sadr & Albireo */}
                  {[
                    { cx: '52vw', cy: '74vh', r: 3.2, delay: '2.1s' },
                    { cx: '60vw', cy: '80vh', r: 2.8, delay: '3.1s' },
                    { cx: '48vw', cy: '80vh', r: 2.6, delay: '1.3s' },
                    { cx: '56vw', cy: '66vh', r: 2.6, delay: '2.7s' }
                  ].map((star, idx) => (
                    <g key={idx} className="star-breathe-2" style={{ animationDelay: star.delay }}>
                      <circle cx={star.cx} cy={star.cy} r={star.r * 1.8} fill="#818CF8" opacity="0.25" filter="url(#coronaIndigo)" />
                      <circle cx={star.cx} cy={star.cy} r={star.r} fill="#E0E7FF" />
                    </g>
                  ))}
                </g>

                {/* Sutiles Ejes de Conexión Interestelar */}
                <g stroke="#00E5FF" strokeWidth="0.35" strokeDasharray="6 12" opacity="0.25">
                  <path d="M 16vw 22vh L 58vw 9vh" fill="none" />
                  <path d="M 38vw 28vh L 74vw 20vh" fill="none" />
                  <path d="M 32vw 36vh L 44vw 68vh" fill="none" />
                  <path d="M 60vw 80vh L 75vw 42vh" fill="none" />
                </g>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ParticleBackground theme={theme} />

      {/* ======================================================== */}
      {/* --- DESKTOP UI: FIXED LEFT PANEL (hidden on mobile) --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!theaterMode && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`hidden md:flex absolute top-0 left-0 h-full w-[420px] p-8 lg:p-10 flex-col justify-between z-20 transition-all duration-1000 backdrop-blur-2xl border-r border-[#D4AF37]/30 shadow-[24px_0_70px_rgba(0,0,0,0.85),inset_-1px_0_2px_rgba(212,175,55,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] ${
              theme === 'cosmos' 
                ? 'bg-gradient-to-b from-[#060412]/92 via-[#03010A]/95 to-[#010006]/98' 
                : 'bg-gradient-to-b from-[#060D1A]/92 via-[#030710]/95 to-[#010408]/98'
            }`}
          >
            {/* MD4 Radiant Edge Guides & Specular Beams */}
            <div className="absolute top-0 right-0 w-[1.5px] h-full bg-gradient-to-b from-transparent via-[#D4AF37]/80 via-[#00E5FF]/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-[8px] h-full bg-gradient-to-b from-transparent via-[#D4AF37]/20 via-[#00E5FF]/10 to-transparent blur-[4px] pointer-events-none" />
            
            {/* Ambient Corner Atmosphere */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#D4AF37]/[0.09] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#00E5FF]/[0.06] blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#D4AF37]/[0.06] via-transparent to-transparent pointer-events-none" />

            {/* Subtle MD4 Stencil Corner Accents */}
            <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-[#D4AF37]/40 pointer-events-none" />
            <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-[#D4AF37]/40 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l border-[#D4AF37]/40 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-[#D4AF37]/40 pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl lg:text-4xl text-[#D4AF37] font-semibold tracking-wider uppercase">
                  Arcanos
                </h1>
                
                <div className="flex items-center gap-1.5">
                  {/* Sentencia del Círculo Modal Trigger */}
                  <button
                    onClick={() => setIsInscriptionModalOpen(true)}
                    className="p-2.5 text-[#D4AF37]/75 hover:text-[#D4AF37] transition-all rounded-xl hover:bg-white/5 border border-white/5 group relative"
                    title="Ver qué dice el Círculo Sagrado del Fondo"
                  >
                    <Info size={19} />
                  </button>

                  {/* Theme Toggle Button */}
                  <button
                    onClick={() => setTheme(t => t === 'astrolabe' ? 'cosmos' : 'astrolabe')}
                    className="p-2.5 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors rounded-xl hover:bg-white/5 border border-white/5"
                    title="Cambiar Escenario"
                  >
                    {theme === 'astrolabe' ? <Moon size={20} /> : <Sparkles size={20} />}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-400 italic mb-6 tracking-wider text-sm">
                El teatro del destino
              </p>
            </div>

            {/* Scrollable list of Arcanos */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-2.5">
              {poems.map((poem) => {
                const isSelected = selectedPoemId === poem.id;
                return (
                  <button
                    key={poem.id}
                    onClick={() => setSelectedPoemId(poem.id)}
                    className={`w-full text-left px-5 py-3 rounded-xl transition-all duration-300 border backdrop-blur-sm group relative overflow-hidden ${
                      isSelected
                        ? 'border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/15 to-transparent text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] translate-x-1.5'
                        : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:border-white/15 hover:bg-white/[0.05] hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-serif font-medium tracking-wide">
                        {poem.title}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      )}
                    </div>
                    <p className={`text-xs italic line-clamp-1 mt-1 font-serif transition-colors ${
                      isSelected ? 'text-amber-200/80' : 'text-gray-500 group-hover:text-gray-400'
                    }`}>
                      &ldquo;{poem.hook}&rdquo;
                    </p>
                  </button>
                );
              })}
            </div>

            <div>
              <button
                onClick={handleStart}
                className="w-full group relative inline-flex flex-shrink-0 items-center justify-center gap-3 px-6 py-4 bg-transparent overflow-hidden text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-xl transition-all duration-500 ease-out shadow-[0_0_25px_rgba(212,175,55,0.15)]"
              >
                <div className="absolute inset-0 bg-[#D4AF37] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-out" />
                <Play size={20} className="relative z-10 flex-shrink-0 group-hover:text-[#050B14] transition-colors duration-500" />
                <span className="relative z-10 text-sm lg:text-base uppercase tracking-[0.2em] whitespace-nowrap group-hover:text-[#050B14] transition-colors duration-500 font-semibold">
                  Iniciar Lectura
                </span>
              </button>

              {/* Desktop Audio Controls */}
              <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer hover:text-[#D4AF37] transition-colors group">
                  <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />
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
                    className="p-1.5 hover:text-[#D4AF37] transition-colors rounded"
                    title={isAudioPlaying ? "Pausar música" : "Reproducir música"}
                  >
                    {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* --- ANDROID / MOBILE TOP BAR (Visible only on < md) --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!theaterMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-0 left-0 right-0 z-30 px-5 py-4 flex items-center justify-between border-b border-white/10 bg-[#02060F]/80 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <h1 className="text-xl font-serif text-[#D4AF37] tracking-wider uppercase font-semibold">
                Arcanos
              </h1>
              <span className="text-[11px] font-mono text-gray-400 ml-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                {currentIndex + 1}/{poems.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio Upload / Play on Mobile */}
              <label className="p-2 text-gray-400 hover:text-[#D4AF37] rounded-xl hover:bg-white/5 cursor-pointer">
                <Upload size={18} />
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
                  className="p-2 text-[#D4AF37] rounded-xl hover:bg-white/5"
                >
                  {isAudioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              )}

              {/* Inscription Info Trigger on Mobile */}
              <button
                onClick={() => setIsInscriptionModalOpen(true)}
                className="p-2 text-[#D4AF37]/80 hover:text-[#D4AF37] rounded-xl hover:bg-white/5"
                title="Sentencia del Círculo Sagrado"
              >
                <Info size={18} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(t => t === 'astrolabe' ? 'cosmos' : 'astrolabe')}
                className="p-2 text-[#D4AF37]/80 hover:text-[#D4AF37] rounded-xl hover:bg-white/5"
              >
                {theme === 'astrolabe' ? <Moon size={18} /> : <Sparkles size={18} />}
              </button>

              {/* Arcana Selector Drawer Trigger */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-sans tracking-wider"
              >
                <Compass size={14} />
                <span>Lista</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* --- ANDROID / MOBILE BOTTOM DOCK (Visible only on < md) --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!theaterMode && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="md:hidden absolute bottom-0 left-0 right-0 z-30 p-4 flex items-center justify-between gap-3 bg-gradient-to-t from-[#02060F] via-[#02060F]/90 to-transparent pointer-events-auto"
          >
            {/* Previous Arcana Button */}
            <button
              onClick={() => {
                const prev = (currentIndex - 1 + poems.length) % poems.length;
                setSelectedPoemId(poems[prev].id);
              }}
              className="w-12 h-12 rounded-2xl border border-white/10 bg-[#050B14]/80 backdrop-blur-xl text-gray-300 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Arcano anterior"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Central "Iniciar Lectura" Radiant Button */}
            <button
              onClick={handleStart}
              className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#050B14] font-semibold flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(212,175,55,0.4)] active:scale-[0.98] transition-transform"
            >
              <Play size={18} className="fill-[#050B14]" />
              <span className="text-sm uppercase tracking-widest font-sans font-bold">
                Iniciar Lectura
              </span>
            </button>

            {/* Next Arcana Button */}
            <button
              onClick={() => {
                const next = (currentIndex + 1) % poems.length;
                setSelectedPoemId(poems[next].id);
              }}
              className="w-12 h-12 rounded-2xl border border-white/10 bg-[#050B14]/80 backdrop-blur-xl text-gray-300 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Arcano siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* --- ANDROID MOBILE BOTTOM SHEET / ARCANOS DRAWER --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-h-[82vh] bg-[#050B14]/95 border-t border-[#D4AF37]/30 rounded-t-[28px] p-6 flex flex-col z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-serif text-[#D4AF37] font-semibold">
                    Colección de Arcanos
                  </h2>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">
                    26 Arcanos Mayores & Arcanos Ocultos
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 py-1">
                {poems.map((poem, idx) => {
                  const isSelected = selectedPoemId === poem.id;
                  return (
                    <button
                      key={poem.id}
                      onClick={() => {
                        setSelectedPoemId(poem.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                          : 'border-white/5 bg-white/[0.02] text-gray-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-medium text-base">
                          {poem.title}
                        </span>
                        <span className="text-[11px] font-mono opacity-50">
                          #{idx}
                        </span>
                      </div>
                      <p className={`text-xs italic line-clamp-1 mt-1 font-serif ${
                        isSelected ? 'text-amber-200/90' : 'text-gray-500'
                      }`}>
                        &ldquo;{poem.hook}&rdquo;
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* --- THEATER MODE EXIT BUTTON (Mobile & Desktop) --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {theaterMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleStop}
            className="absolute top-6 right-6 z-40 p-3.5 rounded-full border border-[#D4AF37]/40 bg-[#050B14]/80 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)] active:scale-95"
            title="Cerrar lectura (Esc)"
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* --- MD4 MODAL: INSCRIPCIÓN DEL CÍRCULO SAGRADO --- */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isInscriptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInscriptionModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-lg rounded-3xl bg-[#050B14]/95 border border-[#D4AF37]/50 p-6 md:p-8 shadow-[0_0_60px_rgba(212,175,55,0.3)] backdrop-blur-2xl text-white overflow-hidden z-10"
            >
              {/* Radiant Atmosphere Light */}
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsInscriptionModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-[#D4AF37] hover:bg-white/10 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5 pr-8">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F5D77F] to-[#8C6D1F] flex items-center justify-center text-[#050B14] shadow-[0_0_18px_rgba(212,175,55,0.45)] shrink-0">
                  <Compass size={22} />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D4AF37]/80 font-sans font-bold">
                    El Círculo Sagrado del Fondo
                  </span>
                  <h3 className="text-xl font-serif text-[#D4AF37] font-medium leading-snug">
                    {currentInscription.themeTitle}
                  </h3>
                </div>
              </div>

              {/* Inscriptions Content */}
              <div className="space-y-4 my-5">
                {/* Anillo Exterior */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#D4AF37]/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#00E5FF]">
                      Anillo Exterior (Latín)
                    </span>
                  </div>
                  <p className="font-serif italic text-amber-100 text-sm md:text-base leading-relaxed mb-2 tracking-wide">
                    {currentInscription.outerLatin}
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans font-light">
                    <strong className="text-amber-300 font-normal">Traducción: </strong>
                    {currentInscription.translationOuter}
                  </p>
                </div>

                {/* Anillo Interior */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#D4AF37]/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">
                      Anillo Interior (Latín)
                    </span>
                  </div>
                  <p className="font-serif italic text-amber-200/90 text-sm md:text-base leading-relaxed mb-2 tracking-wide">
                    {currentInscription.innerLatin}
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans font-light">
                    <strong className="text-amber-300 font-normal">Traducción: </strong>
                    {currentInscription.translationInner}
                  </p>
                </div>

                {/* Orígenes / Fuente */}
                <div className="px-1 text-[11px] text-gray-400 font-serif flex items-center gap-1.5">
                  <span className="text-[#D4AF37]/80 font-semibold font-sans uppercase tracking-wider text-[10px]">
                    Fuente:
                  </span>
                  <span>{currentInscription.origins}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6 gap-3">
                <button
                  onClick={handleNextInscription}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] text-xs font-sans font-semibold tracking-wider transition-colors active:scale-95"
                >
                  <RotateCw size={14} />
                  <span>Girar Círculo (Siguiente)</span>
                </button>

                <p className="text-[11px] text-gray-400 font-sans text-right max-w-[210px] leading-tight">
                  Cambia automáticamente cada vez que abres la aplicación.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* --- CINEMATIC READER (Center Display & Recitation) --- */}
      {/* ======================================================== */}
      <CinematicReader
        poem={selectedPoem}
        isSpeaking={isSpeaking}
        theaterMode={theaterMode}
        speechStage={speechStage}
        currentLineIndex={currentLineIndex}
        currentWordIndex={currentWordIndex}
        onFinish={() => setTheaterMode(false)}
        onSkip={skip}
      />
    </div>
  );
}
