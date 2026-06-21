import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import type { User, ImageAsset, ConsentStatus, AnalysisWithDiagnosis } from '../types';
import { createEmptyConsentStatus } from '../utils/consentHelpers';
import { createAnonymousSessionId } from '../utils/sessionId';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  pendingImages: ImageAsset[];
  addPendingImage: (image: ImageAsset) => void;
  clearPendingImages: (options?: { revokeUrls?: boolean }) => void;
  /** Copia de imágenes reservada al pulsar «Analizar» (evita perderlas al navegar). */
  imagesForAnalysis: ImageAsset[] | null;
  queueImagesForAnalysis: (images: ImageAsset[]) => void;
  clearImagesForAnalysis: () => void;
  /** URLs locales para mostrar resultados sin depender de almacenamiento en servidor. */
  resultImageUrls: string[];
  setResultImageUrls: (urls: string[]) => void;
  sessionId: string | null;
  consent: ConsentStatus;
  setConsent: (consent: ConsentStatus) => void;
  analysisResult: AnalysisWithDiagnosis | null;
  setAnalysisResult: (result: AnalysisWithDiagnosis | null) => void;
  /** Limpia sesión de tótem: consentimiento, imágenes y sessionId (nuevo flujo). */
  resetKioskSession: () => void;
  /** Garantiza sessionId anónimo si el usuario llegó directo a /consent (p. ej. recarga). */
  ensureKioskSessionId: () => void;
}

export const MIN_FACE_CAPTURES = 1;
export const MAX_FACE_CAPTURES = 2;

/** @deprecated Usar MIN_FACE_CAPTURES / MAX_FACE_CAPTURES */
export const REQUIRED_FACE_CAPTURES = MAX_FACE_CAPTURES;

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEY_USER = 'dermacheck_user';

function revokeObjectUrls(urls: string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [consent, setConsentState] = useState<ConsentStatus>(() => createEmptyConsentStatus());
  const [pendingImages, setPendingImages] = useState<ImageAsset[]>([]);
  const [imagesForAnalysis, setImagesForAnalysis] = useState<ImageAsset[] | null>(null);
  const [resultImageUrls, setResultImageUrlsState] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisWithDiagnosis | null>(null);

  function addPendingImage(image: ImageAsset) {
    setPendingImages((prev) => [...prev, image]);
  }

  function clearPendingImages(options?: { revokeUrls?: boolean }) {
    const revoke = options?.revokeUrls !== false;
    setPendingImages((prev) => {
      if (revoke) {
        prev.forEach((img) => URL.revokeObjectURL(img.objectUrl));
      }
      return [];
    });
  }

  function setResultImageUrls(urls: string[]) {
    setResultImageUrlsState(urls);
  }

  function queueImagesForAnalysis(images: ImageAsset[]) {
    setImagesForAnalysis([...images]);
  }

  function clearImagesForAnalysis() {
    setImagesForAnalysis(null);
  }

  function setUser(newUser: User | null) {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }

  function setConsent(newConsent: ConsentStatus) {
    setConsentState(newConsent);
  }

  function resetKioskSession() {
    clearPendingImages();
    clearImagesForAnalysis();
    setResultImageUrlsState((prev) => {
      revokeObjectUrls(prev);
      return [];
    });
    setAnalysisResult(null);
    setConsentState(createEmptyConsentStatus());
    setSessionId(createAnonymousSessionId());
  }

  const ensureKioskSessionId = useCallback(() => {
    setSessionId((current) => current ?? createAnonymousSessionId());
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      pendingImages,
      addPendingImage,
      clearPendingImages,
      imagesForAnalysis,
      queueImagesForAnalysis,
      clearImagesForAnalysis,
      resultImageUrls,
      setResultImageUrls,
      sessionId,
      consent,
      setConsent,
      analysisResult,
      setAnalysisResult,
      resetKioskSession,
      ensureKioskSessionId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState debe usarse dentro de AppProvider');
  }
  return context;
}
