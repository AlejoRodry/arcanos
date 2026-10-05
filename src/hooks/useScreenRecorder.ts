import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  SavedRecording, 
  saveRecordingToDB, 
  getAllRecordingsFromDB, 
  deleteRecordingFromDB, 
  clearAllRecordingsFromDB 
} from '../utils/recordingsDB';
import { masterAudioEngine } from '../utils/audioEngine';

export type AspectRatio = 'free' | '9:16' | '16:9' | '1:1';
export type RecordMode = 'video' | 'audio';

export const useScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [lastSavedRecording, setLastSavedRecording] = useState<SavedRecording | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatioState] = useState<AspectRatio>(() => {
    return (localStorage.getItem('radiant_recorder_aspect_ratio') as AspectRatio) || '9:16';
  });
  const [recordMode, setRecordModeState] = useState<RecordMode>(() => {
    return (localStorage.getItem('radiant_record_mode') as RecordMode) || 'video';
  });
  const [autoRecordOnStart, setAutoRecordOnStartState] = useState<boolean>(() => {
    return localStorage.getItem('radiant_auto_record') === 'true';
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopCroppingRef = useRef<(() => void) | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentMetadataRef = useRef<{ poemId: string; poemTitle: string; aspectRatio: string; recordMode: RecordMode }>({
    poemId: 'arcano',
    poemTitle: 'Arcano Revelado',
    aspectRatio: '9:16',
    recordMode: 'video'
  });
  const durationRef = useRef(0);

  const setAspectRatio = useCallback((ratio: AspectRatio) => {
    setAspectRatioState(ratio);
    localStorage.setItem('radiant_recorder_aspect_ratio', ratio);
  }, []);

  const setRecordMode = useCallback((mode: RecordMode) => {
    setRecordModeState(mode);
    localStorage.setItem('radiant_record_mode', mode);
  }, []);

  const setAutoRecordOnStart = useCallback((enabled: boolean) => {
    setAutoRecordOnStartState(enabled);
    localStorage.setItem('radiant_auto_record', enabled ? 'true' : 'false');
  }, []);

  const refreshRecordings = useCallback(async () => {
    try {
      const list = await getAllRecordingsFromDB();
      setSavedRecordings(list);
    } catch (err) {
      console.warn("Error cargando grabaciones de IndexedDB:", err);
    }
  }, []);

  useEffect(() => {
    refreshRecordings();
  }, [refreshRecordings]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async (meta: { poemId: string; poemTitle: string; aspectRatio: string; recordMode?: RecordMode }): Promise<boolean> => {
    setRecordingError(null);
    const activeMode = meta.recordMode || recordMode;
    currentMetadataRef.current = {
      poemId: meta.poemId,
      poemTitle: meta.poemTitle,
      aspectRatio: meta.aspectRatio,
      recordMode: activeMode
    };
    chunksRef.current = [];
    setVideoUrl(null);
    durationRef.current = 0;

    let rawStream: MediaStream | null = null;

    // Display / Tab capture with preferCurrentTab
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
      try {
        rawStream = await (navigator.mediaDevices as any).getDisplayMedia({
          preferCurrentTab: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'exclude',
          systemAudio: 'include',
          video: {
            displaySurface: 'browser',
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: {
            suppressLocalAudioPlayback: false
          }
        });
      } catch (displayErr: any) {
        console.warn("getDisplayMedia con preferCurrentTab falló, probando fallback estándar:", displayErr);
        try {
          rawStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 30, max: 30 }
            },
            audio: true
          });
        } catch (secondErr: any) {
          try {
            rawStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true
            });
          } catch (videoOnlyErr: any) {
            console.warn("El usuario canceló la selección de pestaña o no tiene permisos:", videoOnlyErr);
          }
        }
      }
    }

    // Canvas fallback if display media unavailable
    if (!rawStream && typeof document !== 'undefined') {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas && typeof (canvas as any).captureStream === 'function') {
        try {
          rawStream = (canvas as any).captureStream(30);
        } catch (canvasErr) {
          console.warn("Error capturando stream de canvas:", canvasErr);
        }
      }
    }

    if (!rawStream) {
      const msg = "Para grabar, selecciona 'Pestaña de Chrome' y marca 'Compartir audio'.";
      setRecordingError(msg);
      setIsRecording(false);
      return false;
    }

    try {
      streamRef.current = rawStream;

      // Handle user stopping screen share from browser banner
      const rawVideoTrack = rawStream.getVideoTracks()[0];
      if (rawVideoTrack && activeMode === 'video') {
        rawVideoTrack.onended = () => {
          stopRecording();
        };
      }
      const rawAudioTrack = rawStream.getAudioTracks()[0];
      if (rawAudioTrack && activeMode === 'audio') {
        rawAudioTrack.onended = () => {
          stopRecording();
        };
      }

      let recordingStream: MediaStream = rawStream;
      let selectedMime = '';
      let recorderOptions: MediaRecorderOptions = {};

      // Direct digital master audio stream from our internal audio engine (voice + ambient music)
      const internalAudioStream = masterAudioEngine.getRecordingAudioStream();
      const internalAudioTrack = internalAudioStream.getAudioTracks()[0];

      if (activeMode === 'audio') {
        // ============================================================
        // AUDIO-ONLY EXTRACTION (0% GPU/CPU overhead, 100% fluid)
        // Direct digital capture of voice narration and mystic music
        // ============================================================
        const tracksToRecord: MediaStreamTrack[] = [];
        if (internalAudioTrack) {
          tracksToRecord.push(internalAudioTrack);
        }
        rawStream.getAudioTracks().forEach(t => {
          if (!tracksToRecord.some(existing => existing.id === t.id)) {
            tracksToRecord.push(t);
          }
        });

        if (tracksToRecord.length === 0) {
          throw new Error("No se pudo iniciar el canal de audio del oráculo.");
        }

        recordingStream = new MediaStream(tracksToRecord);

        const audioTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/ogg'
        ];
        for (const mime of audioTypes) {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }

        recorderOptions = {
          mimeType: selectedMime || undefined,
          audioBitsPerSecond: 256_000
        };
      } else {
        // ============================================================
        // OPTIMIZED VIDEO CROPPING ENGINE (30 FPS Cinemático Fluido)
        // 33.3ms throttling + 6 Mbps bitrate para evitar caídas de FPS
        // ============================================================
        if (meta.aspectRatio && meta.aspectRatio !== 'free') {
          try {
            const videoEl = document.createElement('video');
            videoEl.srcObject = rawStream;
            videoEl.muted = true;
            videoEl.playsInline = true;
            await videoEl.play();

            // Native 1080p Dimensions
            const targetW = meta.aspectRatio === '9:16' ? 1080 : meta.aspectRatio === '1:1' ? 1080 : 1920;
            const targetH = meta.aspectRatio === '9:16' ? 1920 : meta.aspectRatio === '1:1' ? 1080 : 1080;
            const targetAspect = targetW / targetH;

            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = targetW;
            cropCanvas.height = targetH;
            const ctx = cropCanvas.getContext('2d', { alpha: false });
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'medium'; // Balance perfecto entre nitidez y velocidad de render
            }

            let animId: number;
            let lastFrameTime = 0;
            const fpsInterval = 1000 / 30; // 30 FPS exactos (33.3ms)

            const renderLoop = (timestamp: number) => {
              animId = requestAnimationFrame(renderLoop);

              // Throttling a 30 FPS: reduce el consumo de CPU/GPU a la mitad
              const elapsed = timestamp - lastFrameTime;
              if (elapsed < fpsInterval) return;
              lastFrameTime = timestamp - (elapsed % fpsInterval);

              if (videoEl.videoWidth && videoEl.videoHeight && ctx) {
                const srcW = videoEl.videoWidth;
                const srcH = videoEl.videoHeight;
                const srcAspect = srcW / srcH;

                let cropW = srcW;
                let cropH = srcH;
                let cropX = 0;
                let cropY = 0;

                if (srcAspect > targetAspect) {
                  // Panorámico a vertical (9:16)
                  cropW = srcH * targetAspect;
                  cropX = (srcW - cropW) / 2;
                } else {
                  // Vertical a panorámico
                  cropH = srcW / targetAspect;
                  cropY = (srcH - cropH) / 2;
                }

                ctx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
              }
            };

            animId = requestAnimationFrame(renderLoop);

            const croppedStream = (cropCanvas as any).captureStream(30) as MediaStream;
            // Transfer internal digital audio track (voice narration + ambient music)
            if (internalAudioTrack) {
              croppedStream.addTrack(internalAudioTrack);
            }
            // Also transfer any raw audio tracks from screen capture if present
            rawStream.getAudioTracks().forEach(track => {
              if (!croppedStream.getAudioTracks().some(t => t.id === track.id)) {
                croppedStream.addTrack(track);
              }
            });
            recordingStream = croppedStream;

            stopCroppingRef.current = () => {
              cancelAnimationFrame(animId);
              videoEl.pause();
              videoEl.srcObject = null;
            };
          } catch (cropError) {
            console.warn("Could not initialize aspect ratio cropping:", cropError);
          }
        }

        // Prioritize MP4 formats (H.264 / AVC)
        const candidateTypes = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4;codecs=avc1',
          'video/mp4;codecs=h264',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm'
        ];

        for (const mime of candidateTypes) {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }

        // Bitrate equilibrado a 6 Mbps: 1080p nítido, sin lag ni fotogramas perdidos
        recorderOptions = {
          mimeType: selectedMime || undefined,
          videoBitsPerSecond: 6_000_000,
          audioBitsPerSecond: 192_000
        };
      }

      const recorder = new MediaRecorder(recordingStream, recorderOptions);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        clearTimer();
        setIsRecording(false);
        setIsPaused(false);

        // Clean up cropping loop
        if (stopCroppingRef.current) {
          stopCroppingRef.current();
          stopCroppingRef.current = null;
        }

        const totalSecs = durationRef.current;
        if (chunksRef.current.length === 0) {
          console.warn("No se generaron fragmentos de archivo.");
          return;
        }

        const actualMime = selectedMime || (activeMode === 'audio' ? 'audio/mp4' : 'video/mp4');
        const blob = new Blob(chunksRef.current, { type: actualMime });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        const safeName = currentMetadataRef.current.poemTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_').toLowerCase();
        let fileName = '';

        if (activeMode === 'audio') {
          const isM4a = actualMime.includes('mp4') || actualMime.includes('m4a');
          const ext = isM4a ? 'm4a' : 'mp3';
          fileName = `${safeName}_locucion_audio.${ext}`;
        } else {
          const isMp4 = actualMime.includes('mp4');
          const ext = isMp4 ? 'mp4' : 'webm';
          fileName = `${safeName}_${currentMetadataRef.current.aspectRatio}.${ext}`;
        }

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Save persistently in the application IndexedDB
        try {
          const savedItem = await saveRecordingToDB({
            poemId: currentMetadataRef.current.poemId,
            poemTitle: `${currentMetadataRef.current.poemTitle} ${activeMode === 'audio' ? '(Audio)' : ''}`.trim(),
            aspectRatio: activeMode === 'audio' ? 'audio' : currentMetadataRef.current.aspectRatio,
            duration: totalSecs,
            durationFormatted: formatDuration(totalSecs),
            mimeType: actualMime,
            blob
          });
          setSavedRecordings(prev => [savedItem, ...prev]);
          setLastSavedRecording(savedItem);

          setTimeout(() => {
            setLastSavedRecording(null);
          }, 6000);
        } catch (saveErr) {
          console.error("Error guardando grabación en IndexedDB:", saveErr);
        }

        // Clean up tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(prev => prev + 1);
      }, 1000);

      return true;
    } catch (err: any) {
      console.error("Error iniciando MediaRecorder:", err);
      setRecordingError(err?.message || "Error al inicializar el grabador.");
      setIsRecording(false);
      return false;
    }
  }, [recordMode]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {
        // ignore
      }
      mediaRecorderRef.current.stop();
    }
    clearTimer();
    setIsRecording(false);
  }, []);

  const deleteRecording = useCallback(async (id: string) => {
    setSavedRecordings(prev => prev.filter(r => r.id !== id));
    try {
      await deleteRecordingFromDB(id);
      await refreshRecordings();
    } catch (err) {
      console.error("Error eliminando grabación:", err);
    }
  }, [refreshRecordings]);

  const clearAll = useCallback(async () => {
    setSavedRecordings([]);
    try {
      await clearAllRecordingsFromDB();
      await refreshRecordings();
    } catch (err) {
      console.error("Error limpiando grabaciones:", err);
    }
  }, [refreshRecordings]);

  const downloadRecording = useCallback((recording: SavedRecording) => {
    const url = URL.createObjectURL(recording.blob);
    const safeName = recording.poemTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_').toLowerCase();
    const isAudio = recording.mimeType.startsWith('audio/') || recording.aspectRatio === 'audio';
    
    let ext = 'mp4';
    if (isAudio) {
      ext = recording.mimeType.includes('mp4') || recording.mimeType.includes('m4a') ? 'm4a' : 'mp3';
    } else {
      ext = recording.mimeType.includes('mp4') ? 'mp4' : 'webm';
    }

    const fileName = isAudio 
      ? `${safeName}_locucion.${ext}` 
      : `${safeName}_${recording.aspectRatio}.${ext}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    durationFormatted: formatDuration(duration),
    videoUrl,
    aspectRatio,
    recordMode,
    autoRecordOnStart,
    savedRecordings,
    lastSavedRecording,
    recordingError,
    clearRecordingError: () => setRecordingError(null),
    setAspectRatio,
    setRecordMode,
    setAutoRecordOnStart,
    startRecording,
    stopRecording,
    deleteRecording,
    clearAllRecordings: clearAll,
    downloadRecording
  };
};
