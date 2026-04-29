import { createContext, type ReactNode, useContext, useState } from 'react';
import type { User, ImageAsset, ConsentStatus, AnalysisWithDiagnosis } from '../types';
import { LEGAL_DOC_VERSION } from '../constants/legalDocuments';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  pendingImage: ImageAsset | null;
  setPendingImage: (image: ImageAsset | null) => void;
  consent: ConsentStatus;
  setConsent: (consent: ConsentStatus) => void;
  analysisResult: AnalysisWithDiagnosis | null;
  setAnalysisResult: (result: AnalysisWithDiagnosis | null) => void;
}

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

  const [pendingImage, setPendingImage] = useState<ImageAsset | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisWithDiagnosis | null>(null);

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
      pendingImage, 
      setPendingImage, 
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
