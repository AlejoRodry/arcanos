import { useState, useEffect, useCallback } from 'react';

// Keep utterance in memory globally to prevent garbage collection bugs in Web Speech API
let activeUtterance: SpeechSynthesisUtterance | null = null;

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Try to find a Spanish voice, preferably a deeper/male one if possible, or just default ES
      const esVoices = availableVoices.filter(v => v.lang.startsWith('es'));
      setVoices(esVoices.length > 0 ? esVoices : availableVoices);
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((textLines: string[], onComplete: () => void) => {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis not supported");
      onComplete();
      return;
    }

    window.speechSynthesis.cancel(); // Clear any ongoing speech
    setIsSpeaking(true);
    setCurrentLineIndex(0);
    setCurrentWordIndex(0);

    let currentLine = 0;

    const speakLine = (lineIdx: number) => {
      if (lineIdx >= textLines.length) {
        setIsSpeaking(false);
        setCurrentLineIndex(-1);
        setCurrentWordIndex(-1);
        onComplete();
        return;
      }

      const text = textLines[lineIdx];
      const utterance = new SpeechSynthesisUtterance(text);
      activeUtterance = utterance;
      
      if (voices.length > 0) {
        // Try to pick a specific voice if available, else first ES voice
        utterance.voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('es')) || voices[0];
      }

      utterance.lang = 'es-ES';
      utterance.rate = 0.75; // Slower for dramatic effect
      utterance.pitch = 0.6; // Deeper voice

      let wordBoundaryFired = false;
      let fallbackInterval: ReturnType<typeof setInterval>;

      utterance.onstart = () => {
        setCurrentLineIndex(lineIdx);
        setCurrentWordIndex(0);
        
        // Fallback for voices/browsers that don't fire onboundary events
        fallbackInterval = setInterval(() => {
          if (!wordBoundaryFired) {
            setCurrentWordIndex((prev) => {
              const totalWords = text.trim().split(/\s+/).length;
              if (prev + 1 < totalWords) return prev + 1;
              return prev;
            });
          }
        }, 450); // Roughly 450ms per word at 0.75 rate
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          wordBoundaryFired = true;
          // Calculate which word we are on based on character index
          const textUpToBoundary = text.substring(0, event.charIndex);
          const match = textUpToBoundary.match(/\S+/g);
          const wordsSoFar = match ? match.length : 0;
          setCurrentWordIndex(wordsSoFar);
        }
      };

      utterance.onend = () => {
        clearInterval(fallbackInterval);
        // Short pause between lines
        setTimeout(() => {
          speakLine(lineIdx + 1);
        }, 800);
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' errors happen normally when stopping or skipping
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.error("Speech Synthesis Error:", e);
        }
        clearInterval(fallbackInterval);
        
        // If it's a real error, or if we got interrupted before finishing, we need to clean up
        // However, we don't want to prematurely end the theater mode if the user is just
        // navigating, so we'll only call onComplete if it's a genuine error or the sequence is done.
        // For now, to prevent the app from freezing on error, we always reset state.
        setIsSpeaking(false);
        onComplete();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakLine(0);

  }, [voices]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentLineIndex(-1);
    setCurrentWordIndex(-1);
  }, []);

  return {
    isSpeaking,
    currentLineIndex,
    currentWordIndex,
    speak,
    stop
  };
};
