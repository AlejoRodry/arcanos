import { useState, useEffect, useCallback, useRef } from 'react';
import { Poem } from '../types';
import { masterAudioEngine } from '../utils/audioEngine';

export type SpeechStage = 'idle' | 'hook' | 'title' | 'lines';

let activeUtterance: SpeechSynthesisUtterance | null = null;

// Intelligent Spanish Voice Scorer (Neural, Natural, Theatrical Narrator)
export const findBestSpanishVoice = (voicesList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!voicesList || voicesList.length === 0) return null;

  // Filter Spanish voices
  const spanish = voicesList.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
  if (spanish.length === 0) return voicesList[0] || null;

  // Scoring function: higher score = more natural, clear, resonant narrator
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 10;
    const nameLower = v.name.toLowerCase();
    const uriLower = (v.voiceURI || '').toLowerCase();
    const langLower = v.lang.toLowerCase();

    // High fidelity neural / natural voice tags
    if (nameLower.includes('natural') || uriLower.includes('natural')) score += 60;
    if (nameLower.includes('neural') || uriLower.includes('neural')) score += 60;
    if (nameLower.includes('online') || uriLower.includes('online')) score += 35;
    if (nameLower.includes('premium') || uriLower.includes('premium')) score += 40;
    if (nameLower.includes('enhanced') || uriLower.includes('enhanced')) score += 45;
    if (nameLower.includes('google') || uriLower.includes('google')) score += 25;

    // Theatrical and expressive narrator personas
    if (nameLower.includes('jorge') || nameLower.includes('alvaro')) score += 30;
    if (nameLower.includes('helena') || nameLower.includes('laura')) score += 30;
    if (nameLower.includes('sabina') || nameLower.includes('raul')) score += 25;
    if (nameLower.includes('monica') || nameLower.includes('paulina')) score += 25;

    // Android / Google Speech Services network neural models
    if (uriLower.includes('network') || nameLower.includes('network')) score += 35;
    if (langLower === 'es-es' || langLower.startsWith('es-es')) score += 20;
    if (langLower.startsWith('es-mx') || langLower.startsWith('es-us')) score += 15;

    // Demote robotic or low-sample local fallbacks
    if (nameLower.includes('compact') || uriLower.includes('compact')) score -= 25;

    return score;
  };

  const sorted = [...spanish].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return sorted[0];
};

export const useSpeech = () => {
  const isMobile = typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechStage, setSpeechStage] = useState<SpeechStage>('idle');
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(() => {
    return localStorage.getItem('radiant_selected_voice_uri');
  });
  
  // Adaptive acoustic defaults: Android Google TTS sounds distorted below 0.90, optimal at ~0.95
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    const saved = localStorage.getItem('radiant_speech_rate');
    return saved ? parseFloat(saved) : 0.86;
  });
  const [speechPitch, setSpeechPitchState] = useState<number>(() => {
    const saved = localStorage.getItem('radiant_speech_pitch');
    return saved ? parseFloat(saved) : (isMobile ? 0.95 : 0.82);
  });

  const isSkippingRef = useRef(false);
  const currentPoemRef = useRef<Poem | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const wordTimersRef = useRef<NodeJS.Timeout[]>([]);
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const selectedVoiceURIRef = useRef<string | null>(selectedVoiceURI);
  const speechRateRef = useRef<number>(speechRate);
  const speechPitchRef = useRef<number>(speechPitch);

  selectedVoiceURIRef.current = selectedVoiceURI;
  speechRateRef.current = speechRate;
  speechPitchRef.current = speechPitch;

  const setSelectedVoiceURI = useCallback((uri: string) => {
    setSelectedVoiceURIState(uri);
    selectedVoiceURIRef.current = uri;
    localStorage.setItem('radiant_selected_voice_uri', uri);
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    speechRateRef.current = rate;
    localStorage.setItem('radiant_speech_rate', rate.toString());
  }, []);

  const setSpeechPitch = useCallback((pitch: number) => {
    setSpeechPitchState(pitch);
    speechPitchRef.current = pitch;
    localStorage.setItem('radiant_speech_pitch', pitch.toString());
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        setVoices(availableVoices);

        // Check if saved voice exists on THIS current device
        const saved = localStorage.getItem('radiant_selected_voice_uri');
        const hasSaved = saved && availableVoices.some(v => v.voiceURI === saved || v.name === saved);

        if (hasSaved && saved) {
          setSelectedVoiceURI(saved);
        } else {
          // If no saved voice OR saved voice was from another device (e.g. PC vs Phone), pick best voice for THIS device
          const bestVoice = findBestSpanishVoice(availableVoices);
          if (bestVoice) {
            setSelectedVoiceURI(bestVoice.voiceURI);
          }
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      clearTimers();
    };
  }, [setSelectedVoiceURI]);

  const clearTimers = () => {
    wordTimersRef.current.forEach(t => clearTimeout(t));
    wordTimersRef.current = [];
    if (stageTimeoutRef.current) {
      clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = null;
    }
  };

  // Preview a voice with a sample sentence
  const previewVoice = useCallback((voice: SpeechSynthesisVoice, customRate?: number, customPitch?: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    clearTimers();
    const u = new SpeechSynthesisUtterance("El destino susurra secretos entre los arcanos.");
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = customRate ?? speechRateRef.current;
    u.pitch = customPitch ?? speechPitchRef.current;
    window.speechSynthesis.speak(u);
  }, []);

  // Calculate expected spoken duration of a Spanish word based on phonetics and length
  const getWordDuration = (word: string, rate: number = 0.85): number => {
    const clean = word.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '');
    const len = Math.max(1, clean.length);
    
    // Short monosyllables ("¿Y", "si", "el", "de", "tu") advance quickly (~180-220ms)
    // Multisyllable words ("camino", "seguro", "abismo") take ~340-420ms
    const baseMs = 135;
    const perCharMs = 36;
    
    let punctuationExtra = 0;
    if (/[,;:]$/.test(word)) punctuationExtra = 160;
    if (/[.?!]$/.test(word)) punctuationExtra = 260;

    const duration = (baseMs + len * perCharMs + punctuationExtra) / rate;
    return Math.max(150, Math.round(duration));
  };

  const createUtterance = (text: string, onStartCb: () => void, onEndCb: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;

    if (voices.length > 0) {
      const chosenVoice = voices.find(v => v.voiceURI === selectedVoiceURIRef.current)
        || (selectedVoiceURIRef.current ? voices.find(v => v.name === selectedVoiceURIRef.current) : null)
        || findBestSpanishVoice(voices)
        || voices[0];

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      }
    } else {
      utterance.lang = 'es-ES';
    }

    const currentRate = speechRateRef.current;
    utterance.rate = currentRate;
    utterance.pitch = speechPitchRef.current;

    const words = text.trim().split(/\s+/);

    utterance.onstart = () => {
      onStartCb();
      clearTimers();
      setCurrentWordIndex(0);

      // Schedule weighted word progression so text keeps lockstep with speech
      let accumulatedTime = 0;
      words.forEach((word, idx) => {
        if (idx === 0) return;
        const prevWord = words[idx - 1];
        accumulatedTime += getWordDuration(prevWord, currentRate);

        const timer = setTimeout(() => {
          setCurrentWordIndex(curr => Math.max(curr, idx));
        }, accumulatedTime);
        wordTimersRef.current.push(timer);
      });
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const textUpToBoundary = text.substring(0, event.charIndex);
        const match = textUpToBoundary.match(/\S+/g);
        const wordsSoFar = match ? match.length : 0;
        setCurrentWordIndex(curr => Math.max(curr, wordsSoFar));
      }
    };

    utterance.onend = () => {
      clearTimers();
      // Ensure all words are fully revealed when speech finishes
      setCurrentWordIndex(words.length);
      if (!isSkippingRef.current) {
        onEndCb();
      }
    };

    utterance.onerror = (e) => {
      clearTimers();
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error("Speech Synthesis Error:", e);
      }
      if (!isSkippingRef.current) {
        onEndCb();
      }
    };

    return utterance;
  };

  const speakText = useCallback(async (text: string, onStartCb: () => void, onEndCb: () => void) => {
    const cleanText = text.trim();
    if (!cleanText) {
      onEndCb();
      return;
    }

    const words = cleanText.split(/\s+/);

    // Primary: Web Audio API direct digital stream via masterAudioEngine
    // Feeds directly into user speakers AND the recording bus with 100% digital fidelity
    try {
      const success = await masterAudioEngine.playNarration(
        cleanText,
        () => {
          onStartCb();
          clearTimers();
          setCurrentWordIndex(0);
        },
        () => {
          clearTimers();
          setCurrentWordIndex(words.length);
          if (!isSkippingRef.current) {
            onEndCb();
          }
        },
        (progress) => {
          const targetIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
          setCurrentWordIndex(targetIndex);
        }
      );

      if (success) {
        return;
      }
    } catch (engineErr) {
      console.warn("masterAudioEngine playback error, using fallback:", engineErr);
    }

    // Secondary Fallback: Web Speech API
    const utterance = createUtterance(cleanText, onStartCb, onEndCb);
    if (window.speechSynthesis) {
      window.speechSynthesis.speak(utterance);
    }
  }, [voices]);

  const speakPoem = useCallback((poem: Poem, onComplete: () => void) => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearTimers();

    currentPoemRef.current = poem;
    onCompleteRef.current = onComplete;
    isSkippingRef.current = false;
    setIsSpeaking(true);

    // --- STEP 1: SPEAK HOOK (Pregunta del Umbral) ---
    const speakHook = () => {
      setSpeechStage('hook');
      setCurrentLineIndex(-1);
      setCurrentWordIndex(0);

      speakText(
        poem.hook,
        () => {
          setSpeechStage('hook');
          setCurrentWordIndex(0);
        },
        () => {
          stageTimeoutRef.current = setTimeout(() => {
            speakTitle();
          }, 1000);
        }
      );
    };

    // --- STEP 2: SPEAK TITLE & SUBTITLE ---
    const speakTitle = () => {
      setSpeechStage('title');
      setCurrentLineIndex(-1);
      setCurrentWordIndex(0);

      // Natural speech for title & subtitle: strip Roman numerals so TTS pronounces "El Mago" instead of "I, El Mago"
      const cleanTitle = poem.title.replace(/^[0-9IVXLCDM]+\.\s*/i, '').trim();
      const titleSpeechText = `${cleanTitle}. ${poem.subtitle}.`;

      speakText(
        titleSpeechText,
        () => {
          setSpeechStage('title');
          setCurrentWordIndex(0);
        },
        () => {
          stageTimeoutRef.current = setTimeout(() => {
            speakLines(0);
          }, 1200);
        }
      );
    };

    // --- STEP 3: SPEAK VERSES LINE BY LINE ---
    const speakLines = (lineIdx: number) => {
      if (lineIdx >= poem.lines.length) {
        setIsSpeaking(false);
        setSpeechStage('idle');
        setCurrentLineIndex(-1);
        setCurrentWordIndex(-1);
        if (onCompleteRef.current) onCompleteRef.current();
        return;
      }

      setSpeechStage('lines');
      setCurrentLineIndex(lineIdx);
      setCurrentWordIndex(0);

      const text = poem.lines[lineIdx];
      speakText(
        text,
        () => {
          setCurrentLineIndex(lineIdx);
          setCurrentWordIndex(0);
        },
        () => {
          stageTimeoutRef.current = setTimeout(() => {
            speakLines(lineIdx + 1);
          }, 900);
        }
      );
    };

    speakHook();
  }, [speakText]);

  const stop = useCallback(() => {
    isSkippingRef.current = true;
    clearTimers();
    masterAudioEngine.stopNarration();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeechStage('idle');
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
  }, []);

  const skip = useCallback(() => {
    const poem = currentPoemRef.current;
    if (!poem || !isSpeaking) return;

    isSkippingRef.current = true;
    clearTimers();
    masterAudioEngine.stopNarration();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setTimeout(() => {
      isSkippingRef.current = false;
      if (speechStage === 'hook') {
        // Skip from hook to title
        setSpeechStage('title');
        const cleanTitle = poem.title.replace(/^[0-9IVXLCDM]+\.\s*/i, '').trim();
        const titleSpeechText = `${cleanTitle}. ${poem.subtitle}.`;
        speakText(
          titleSpeechText,
          () => {
            setSpeechStage('title');
            setCurrentWordIndex(0);
          },
          () => {
            stageTimeoutRef.current = setTimeout(() => {
              if (currentPoemRef.current) {
                const startFirstLine = (idx: number) => {
                  if (idx >= poem.lines.length) {
                    setIsSpeaking(false);
                    setSpeechStage('idle');
                    if (onCompleteRef.current) onCompleteRef.current();
                    return;
                  }
                  setSpeechStage('lines');
                  setCurrentLineIndex(idx);
                  setCurrentWordIndex(0);
                  speakText(
                    poem.lines[idx], 
                    () => {
                      setCurrentLineIndex(idx);
                      setCurrentWordIndex(0);
                    }, 
                    () => {
                      stageTimeoutRef.current = setTimeout(() => startFirstLine(idx + 1), 900);
                    }
                  );
                };
                startFirstLine(0);
              }
            }, 1200);
          }
        );
      } else if (speechStage === 'title') {
        // Skip from title to lines
        setSpeechStage('lines');
        setCurrentLineIndex(0);
        setCurrentWordIndex(0);
        const startFirstLine = (idx: number) => {
          if (idx >= poem.lines.length) {
            setIsSpeaking(false);
            setSpeechStage('idle');
            if (onCompleteRef.current) onCompleteRef.current();
            return;
          }
          setSpeechStage('lines');
          setCurrentLineIndex(idx);
          setCurrentWordIndex(0);
          speakText(
            poem.lines[idx], 
            () => {
              setCurrentLineIndex(idx);
              setCurrentWordIndex(0);
            }, 
            () => {
              stageTimeoutRef.current = setTimeout(() => startFirstLine(idx + 1), 900);
            }
          );
        };
        startFirstLine(0);
      } else if (speechStage === 'lines') {
        // Skip to next line
        const nextIdx = currentLineIndex + 1;
        if (nextIdx >= poem.lines.length) {
          stop();
          if (onCompleteRef.current) onCompleteRef.current();
        } else {
          setCurrentLineIndex(nextIdx);
          setCurrentWordIndex(0);
          const startLine = (idx: number) => {
            if (idx >= poem.lines.length) {
              setIsSpeaking(false);
              setSpeechStage('idle');
              if (onCompleteRef.current) onCompleteRef.current();
              return;
            }
            setSpeechStage('lines');
            setCurrentLineIndex(idx);
            setCurrentWordIndex(0);
            speakText(
              poem.lines[idx], 
              () => {
                setCurrentLineIndex(idx);
                setCurrentWordIndex(0);
              }, 
              () => {
                stageTimeoutRef.current = setTimeout(() => startLine(idx + 1), 900);
              }
            );
          };
          startLine(nextIdx);
        }
      }
    }, 60);
  }, [isSpeaking, speechStage, currentLineIndex, speakText, stop]);

  return {
    isSpeaking,
    speechStage,
    currentLineIndex,
    currentWordIndex,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    previewVoice,
    speakPoem,
    stop,
    skip
  };
};
