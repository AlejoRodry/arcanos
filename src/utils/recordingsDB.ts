export interface SavedRecording {
  id: string;
  poemId: string;
  poemTitle: string;
  aspectRatio: string;
  duration: number;
  durationFormatted: string;
  fileSize: number;
  fileSizeFormatted: string;
  createdAt: number;
  mimeType: string;
  blob: Blob;
}

interface StoredRecordingRecord {
  id: string;
  poemId: string;
  poemTitle: string;
  aspectRatio: string;
  duration: number;
  durationFormatted: string;
  fileSize: number;
  fileSizeFormatted: string;
  createdAt: number;
  mimeType: string;
  buffer: ArrayBuffer;
}

const DB_NAME = 'ArcanosStudioRecordingsDB';
const DB_VERSION = 2; // Incremented for ArrayBuffer compatibility
const STORE_NAME = 'recordings';

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está soportado en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt', { unique: false });
      store.createIndex('poemId', 'poemId', { unique: false });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const saveRecordingToDB = async (
  item: Omit<SavedRecording, 'id' | 'createdAt' | 'fileSize' | 'fileSizeFormatted'>
): Promise<SavedRecording> => {
  const db = await openDB();
  const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const createdAt = Date.now();
  const fileSize = item.blob.size;
  const fileSizeFormatted = formatBytes(fileSize);

  // Convert Blob to ArrayBuffer so it can be cloned without DataCloneError in all browsers
  const buffer = await item.blob.arrayBuffer();

  const storedRecord: StoredRecordingRecord = {
    id,
    poemId: item.poemId,
    poemTitle: item.poemTitle,
    aspectRatio: item.aspectRatio,
    duration: item.duration,
    durationFormatted: item.durationFormatted,
    fileSize,
    fileSizeFormatted,
    createdAt,
    mimeType: item.mimeType,
    buffer
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(storedRecord);

    req.onsuccess = () => {
      resolve({
        id,
        poemId: item.poemId,
        poemTitle: item.poemTitle,
        aspectRatio: item.aspectRatio,
        duration: item.duration,
        durationFormatted: item.durationFormatted,
        fileSize,
        fileSizeFormatted,
        createdAt,
        mimeType: item.mimeType,
        blob: item.blob
      });
    };

    req.onerror = () => reject(req.error);
  });
};

export const getAllRecordingsFromDB = async (): Promise<SavedRecording[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('createdAt');
    const req = index.getAll();

    req.onsuccess = () => {
      const records = req.result as StoredRecordingRecord[];
      // Convert stored ArrayBuffers back to Blobs
      const results: SavedRecording[] = records.map(r => ({
        id: r.id,
        poemId: r.poemId,
        poemTitle: r.poemTitle,
        aspectRatio: r.aspectRatio,
        duration: r.duration,
        durationFormatted: r.durationFormatted,
        fileSize: r.fileSize,
        fileSizeFormatted: r.fileSizeFormatted,
        createdAt: r.createdAt,
        mimeType: r.mimeType,
        blob: new Blob([r.buffer], { type: r.mimeType })
      })).reverse();
      resolve(results);
    };

    req.onerror = () => reject(req.error);
  });
};

export const deleteRecordingFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const clearAllRecordingsFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};
