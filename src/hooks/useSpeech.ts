import { useState, useEffect, useCallback, useRef } from 'react';
import { Poem } from '../types';

export type SpeechStage = 'idle' | 'hook' | 'title' | 'lines';

let activeUtterance: SpeechSynthesisUtterance | null = null;

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechStage, setSpeechStage] = useState<SpeechStage>('idle');
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const isSkippingRef = useRef(false);
  const currentPoemRef = useRef<Poem | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const wordTimersRef = useRef<NodeJS.Timeout[]>([]);
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const esVoices = availableVoices.filter(v => v.lang.startsWith('es'));
      setVoices(esVoices.length > 0 ? esVoices : availableVoices);
    };

    loadVoices();
    if (window.speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      clearTimers();
    };
  }, []);

  const clearTimers = () => {
    wordTimersRef.current.forEach(t => clearTimeout(t));
    wordTimersRef.current = [];
    if (stageTimeoutRef.current) {
      clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = null;
    }
  };

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
      utterance.voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('es')) 
        || voices.find(v => v.lang.startsWith('es')) 
        || voices[0];
    }

    utterance.lang = 'es-ES';
    utterance.rate = 0.85; // Natural, clear, dignified pace
    utterance.pitch = 0.7; // Deeper resonant tone

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
        accumulatedTime += getWordDuration(prevWord, 0.85);

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

  const speakPoem = useCallback((poem: Poem, onComplete: () => void) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported");
      onComplete();
      return;
    }

    window.speechSynthesis.cancel();
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

      const utterance = createUtterance(
        poem.hook,
        () => {
          setSpeechStage('hook');
          setCurrentWordIndex(0);
        },
        () => {
          // Pause dramatically after the question before showing title
          stageTimeoutRef.current = setTimeout(() => {
            speakTitle();
          }, 1000);
        }
      );

      window.speechSynthesis.speak(utterance);
    };

    // --- STEP 2: SPEAK TITLE & SUBTITLE ---
    const speakTitle = () => {
      setSpeechStage('title');
      setCurrentLineIndex(-1);
      setCurrentWordIndex(0);

      // Natural speech for title & subtitle
      const cleanTitle = poem.title.replace(/^([0-9IVXLCDM]+)\.\s*/, '$1, ');
      const titleSpeechText = `${cleanTitle}. ${poem.subtitle}.`;

      const utterance = createUtterance(
        titleSpeechText,
        () => {
          setSpeechStage('title');
          setCurrentWordIndex(0);
        },
        () => {
          // Pause before recitation starts
          stageTimeoutRef.current = setTimeout(() => {
            speakLines(0);
          }, 1200);
        }
      );

      window.speechSynthesis.speak(utterance);
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
      const utterance = createUtterance(
        text,
        () => {
          setCurrentLineIndex(lineIdx);
          setCurrentWordIndex(0);
        },
        () => {
          // Short breathing pause between poem verses
          stageTimeoutRef.current = setTimeout(() => {
            speakLines(lineIdx + 1);
          }, 900);
        }
      );

      window.speechSynthesis.speak(utterance);
    };

    speakHook();
  }, [voices]);

  const stop = useCallback(() => {
    isSkippingRef.current = true;
    clearTimers();
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setTimeout(() => {
      isSkippingRef.current = false;
      if (speechStage === 'hook') {
        // Skip from hook to title
        setSpeechStage('title');
        const cleanTitle = poem.title.replace(/^([0-9IVXLCDM]+)\.\s*/, '$1, ');
        const titleSpeechText = `${cleanTitle}. ${poem.subtitle}.`;
        const utterance = createUtterance(
          titleSpeechText,
          () => {
            setSpeechStage('title');
            setCurrentWordIndex(0);
          },
          () => {
            stageTimeoutRef.current = setTimeout(() => {
              // start lines
              if (currentPoemRef.current) {
                // start lines
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
                  const u = createUtterance(
                    poem.lines[idx], 
                    () => {
                      setCurrentLineIndex(idx);
                      setCurrentWordIndex(0);
                    }, 
                    () => {
                      stageTimeoutRef.current = setTimeout(() => startFirstLine(idx + 1), 900);
                    }
                  );
                  window.speechSynthesis.speak(u);
                };
                startFirstLine(0);
              }
            }, 1200);
          }
        );
        window.speechSynthesis.speak(utterance);
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
          const u = createUtterance(
            poem.lines[idx], 
            () => {
              setCurrentLineIndex(idx);
              setCurrentWordIndex(0);
            }, 
            () => {
              stageTimeoutRef.current = setTimeout(() => startFirstLine(idx + 1), 900);
            }
          );
          window.speechSynthesis.speak(u);
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
            const u = createUtterance(
              poem.lines[idx], 
              () => {
                setCurrentLineIndex(idx);
                setCurrentWordIndex(0);
              }, 
              () => {
                stageTimeoutRef.current = setTimeout(() => startLine(idx + 1), 900);
              }
            );
            window.speechSynthesis.speak(u);
          };
          startLine(nextIdx);
        }
      }
    }, 60);
  }, [isSpeaking, speechStage, stop]);

  return {
    isSpeaking,
    speechStage,
    currentLineIndex,
    currentWordIndex,
    speakPoem,
    stop,
    skip
  };
};
