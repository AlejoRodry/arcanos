import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  SavedRecording, 
  saveRecordingToDB, 
  getAllRecordingsFromDB, 
  deleteRecordingFromDB, 
  clearAllRecordingsFromDB 
} from '../utils/recordingsDB';

export type AspectRatio = 'free' | '9:16' | '16:9' | '1:1';

export const useScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [lastSavedRecording, setLastSavedRecording] = useState<SavedRecording | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatioState] = useState<AspectRatio>(() => {
    return (localStorage.getItem('radiant_recorder_aspect_ratio') as AspectRatio) || 'free';
  });
  const [autoRecordOnStart, setAutoRecordOnStartState] = useState<boolean>(() => {
    return localStorage.getItem('radiant_auto_record') === 'true';
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopCroppingRef = useRef<(() => void) | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentMetadataRef = useRef<{ poemId: string; poemTitle: string; aspectRatio: string }>({
    poemId: 'arcano',
    poemTitle: 'Arcano Revelado',
    aspectRatio: 'free'
  });
  const durationRef = useRef(0);

  const setAspectRatio = useCallback((ratio: AspectRatio) => {
    setAspectRatioState(ratio);
    localStorage.setItem('radiant_recorder_aspect_ratio', ratio);
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

  const startRecording = useCallback(async (meta: { poemId: string; poemTitle: string; aspectRatio: string }): Promise<boolean> => {
    setRecordingError(null);
    currentMetadataRef.current = meta;
    chunksRef.current = [];
    setVideoUrl(null);
    durationRef.current = 0;

    let rawStream: MediaStream | null = null;

    // Strategy 1: Display / Tab capture with preferCurrentTab
    // This tells Chrome to focus on THIS tab and NOT the entire desktop screen
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
      try {
        rawStream = await (navigator.mediaDevices as any).getDisplayMedia({
          preferCurrentTab: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'exclude',
          systemAudio: 'include',
          video: {
            displaySurface: 'browser',
            width: { ideal: 1920, max: 3840 },
            height: { ideal: 1080, max: 2160 },
            frameRate: { ideal: 60, max: 60 }
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
              width: { ideal: 1920, max: 3840 },
              height: { ideal: 1080, max: 2160 },
              frameRate: { ideal: 60, max: 60 }
            },
            audio: true
          });
        } catch (secondErr: any) {
          try {
            rawStream = await navigator.mediaDevices.getDisplayMedia({
              video: {
                width: { ideal: 1920, max: 3840 },
                height: { ideal: 1080, max: 2160 },
                frameRate: { ideal: 60, max: 60 }
              }
            });
          } catch (videoOnlyErr: any) {
            console.warn("El usuario canceló la selección de pestaña o no tiene permisos:", videoOnlyErr);
          }
        }
      }
    }

    // Strategy 2: Canvas Capture Fallback if display media was declined
    if (!rawStream && typeof document !== 'undefined') {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas && typeof (canvas as any).captureStream === 'function') {
        try {
          rawStream = (canvas as any).captureStream(60);
        } catch (canvasErr) {
          console.warn("Error capturando stream de canvas:", canvasErr);
        }
      }
    }

    if (!rawStream) {
      const msg = "Para grabar solo el oráculo, selecciona 'Pestaña de Chrome' y marca 'Compartir audio'.";
      setRecordingError(msg);
      setIsRecording(false);
      return false;
    }

    try {
      streamRef.current = rawStream;

      // Handle user stopping screen share from browser banner
      const rawVideoTrack = rawStream.getVideoTracks()[0];
      if (rawVideoTrack) {
        rawVideoTrack.onended = () => {
          stopRecording();
        };
      }

      // -------------------------------------------------------------
      // ASPECT RATIO CROPPING ENGINE (True 1080p Full HD 9:16 Shorts / 16:9 / 1:1)
      // Extracts the center of the application in crystal-clear Full HD
      // -------------------------------------------------------------
      let recordingStream = rawStream;

      if (meta.aspectRatio && meta.aspectRatio !== 'free') {
        try {
          const videoEl = document.createElement('video');
          videoEl.srcObject = rawStream;
          videoEl.muted = true;
          videoEl.playsInline = true;
          await videoEl.play();

          // Full HD Native Dimensions: 1080x1920 for Shorts/TikTok/Reels, 1920x1080 for YouTube, 1080x1080 for Square
          const targetW = meta.aspectRatio === '9:16' ? 1080 : meta.aspectRatio === '1:1' ? 1080 : 1920;
          const targetH = meta.aspectRatio === '9:16' ? 1920 : meta.aspectRatio === '1:1' ? 1080 : 1080;
          const targetAspect = targetW / targetH;

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = targetW;
          cropCanvas.height = targetH;
          const ctx = cropCanvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }

          let animId: number;
          const renderLoop = () => {
            if (videoEl.videoWidth && videoEl.videoHeight && ctx) {
              const srcW = videoEl.videoWidth;
              const srcH = videoEl.videoHeight;
              const srcAspect = srcW / srcH;

              let cropW = srcW;
              let cropH = srcH;
              let cropX = 0;
              let cropY = 0;

              if (srcAspect > targetAspect) {
                // Source is wider than target (e.g. 16:9 desktop, target is 9:16 vertical)
                cropW = srcH * targetAspect;
                cropX = (srcW - cropW) / 2;
              } else {
                // Source is taller than target
                cropH = srcW / targetAspect;
                cropY = (srcH - cropH) / 2;
              }

              ctx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
            }
            animId = requestAnimationFrame(renderLoop);
          };

          animId = requestAnimationFrame(renderLoop);

          const croppedStream = (cropCanvas as any).captureStream(60) as MediaStream;
          // Forward audio tracks from original stream
          rawStream.getAudioTracks().forEach(track => croppedStream.addTrack(track));
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

      // Prioritize MP4 formats (H.264 / AVC) so recordings are saved in true MP4
      let selectedMime = '';
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

      // Configure high-bitrate encoder for razor-sharp quality (12 Mbps Full HD)
      const recorderOptions: MediaRecorderOptions = {
        mimeType: selectedMime || undefined,
        videoBitsPerSecond: 12_000_000,
        audioBitsPerSecond: 256_000
      };

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
          console.warn("No se generaron fragmentos de video.");
          return;
        }

        // Store with real MIME type to prevent browser media decoder corruption
        const actualMime = selectedMime || 'video/mp4';
        const blob = new Blob(chunksRef.current, { type: actualMime });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        // Auto trigger download for user with correct extension
        const isMp4 = actualMime.includes('mp4');
        const ext = isMp4 ? 'mp4' : 'webm';
        const safeName = currentMetadataRef.current.poemTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_').toLowerCase();
        const fileName = `${safeName}_${currentMetadataRef.current.aspectRatio}.${ext}`;

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
            poemTitle: currentMetadataRef.current.poemTitle,
            aspectRatio: currentMetadataRef.current.aspectRatio,
            duration: totalSecs,
            durationFormatted: formatDuration(totalSecs),
            mimeType: actualMime,
            blob
          });
          setSavedRecordings(prev => [savedItem, ...prev]);
          setLastSavedRecording(savedItem);

          // Clear notification after 6 seconds
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

      recorder.start(1000); // 1-second chunks
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Start duration counter
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
  }, []);

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
    // Optimistic UI state update so item disappears instantly
    setSavedRecordings(prev => prev.filter(r => r.id !== id));
    try {
      await deleteRecordingFromDB(id);
      await refreshRecordings();
    } catch (err) {
      console.error("Error eliminando grabación:", err);
    }
  }, [refreshRecordings]);

  const clearAll = useCallback(async () => {
    // Optimistic UI state update
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
    const ext = recording.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const fileName = `${safeName}_${recording.aspectRatio}.${ext}`;

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
    autoRecordOnStart,
    savedRecordings,
    lastSavedRecording,
    recordingError,
    clearRecordingError: () => setRecordingError(null),
    setAspectRatio,
    setAutoRecordOnStart,
    startRecording,
    stopRecording,
    deleteRecording,
    clearAllRecordings: clearAll,
    downloadRecording
  };
};
