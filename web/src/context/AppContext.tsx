import { createContext, type ReactNode, useContext, useState } from 'react';
import type { User, ImageAsset, ConsentStatus, AnalysisWithDiagnosis } from '../types';
import { LEGAL_DOC_VERSION } from '../constants/legalDocuments';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  pendingImages: ImageAsset[];
  addPendingImage: (image: ImageAsset) => void;
  clearPendingImages: () => void;
  /** Copia de imágenes reservada al pulsar «Analizar» (evita perderlas al navegar). */
  imagesForAnalysis: ImageAsset[] | null;
  queueImagesForAnalysis: (images: ImageAsset[]) => void;
  clearImagesForAnalysis: () => void;
  consent: ConsentStatus;
  setConsent: (consent: ConsentStatus) => void;
  analysisResult: AnalysisWithDiagnosis | null;
  setAnalysisResult: (result: AnalysisWithDiagnosis | null) => void;
}

export const MIN_FACE_CAPTURES = 1;
export const MAX_FACE_CAPTURES = 2;

/** @deprecated Usar MIN_FACE_CAPTURES / MAX_FACE_CAPTURES */
export const REQUIRED_FACE_CAPTURES = MAX_FACE_CAPTURES;

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEY_USER = 'dermacheck_user';
const STORAGE_KEY_CONSENT = 'dermacheck_consent';

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [consent, setConsentState] = useState<ConsentStatus>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONSENT);
    return saved ? JSON.parse(saved) : {
      accepted: false,
      acceptedAt: null,
      policyVersion: LEGAL_DOC_VERSION,
    };
  });

  const [pendingImages, setPendingImages] = useState<ImageAsset[]>([]);
  const [imagesForAnalysis, setImagesForAnalysis] = useState<ImageAsset[] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisWithDiagnosis | null>(null);

  function addPendingImage(image: ImageAsset) {
    setPendingImages((prev) => [...prev, image]);
  }

  function clearPendingImages() {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.objectUrl));
      return [];
    });
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
      localStorage.removeItem(STORAGE_KEY_CONSENT);
      setConsentState({
        accepted: false,
        acceptedAt: null,
        policyVersion: LEGAL_DOC_VERSION,
      });
    }
  }

  function setConsent(newConsent: ConsentStatus) {
    setConsentState(newConsent);
    localStorage.setItem(STORAGE_KEY_CONSENT, JSON.stringify(newConsent));
  }

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
      consent, 
      setConsent,
      analysisResult,
      setAnalysisResult,
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
