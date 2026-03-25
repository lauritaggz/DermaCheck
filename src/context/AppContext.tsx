import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ConsentStatus, ImageAsset, SkinAnalysisResult, User } from '../types';

const DEFAULT_CONSENT: ConsentStatus = {
  accepted: false,
  acceptedAt: null,
  policyVersion: '1.0-demo',
};

type AppContextValue = {
  user: User | null;
  setUser: (user: User | null) => void;
  consent: ConsentStatus;
  setConsent: (c: ConsentStatus) => void;
  pendingImage: ImageAsset | null;
  setPendingImage: (img: ImageAsset | null) => void;
  lastAnalysis: SkinAnalysisResult | null;
  setLastAnalysis: (r: SkinAnalysisResult | null) => void;
  resetSession: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [consent, setConsent] = useState<ConsentStatus>(DEFAULT_CONSENT);
  const [pendingImage, setPendingImage] = useState<ImageAsset | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<SkinAnalysisResult | null>(null);

  const resetSession = useCallback(() => {
    setUser(null);
    setConsent(DEFAULT_CONSENT);
    setPendingImage(null);
    setLastAnalysis(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      consent,
      setConsent,
      pendingImage,
      setPendingImage,
      lastAnalysis,
      setLastAnalysis,
      resetSession,
    }),
    [user, consent, pendingImage, lastAnalysis, resetSession],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState debe usarse dentro de AppProvider');
  }
  return ctx;
}
