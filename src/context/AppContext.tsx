import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LEGAL_DOC_VERSION } from '../constants/legalDocuments';
import type { ConsentStatus, ImageAsset, SkinAnalysisResult, User } from '../types';
import { clearPersistedSession, loadPersistedSession, savePersistedSession } from '../services/sessionStorage';

const DEFAULT_CONSENT: ConsentStatus = {
  accepted: false,
  acceptedAt: null,
  policyVersion: LEGAL_DOC_VERSION,
};

type AppContextValue = {
  hydrated: boolean;
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
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [consent, setConsent] = useState<ConsentStatus>(DEFAULT_CONSENT);
  const [pendingImage, setPendingImage] = useState<ImageAsset | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<SkinAnalysisResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { user: u, consent: c } = await loadPersistedSession();
      if (cancelled) return;
      if (u) {
        setUser(u);
        setConsent(c ?? DEFAULT_CONSENT);
      } else if (c) {
        setConsent(c);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      if (user) {
        await savePersistedSession(user, consent);
      } else {
        await clearPersistedSession();
      }
    })();
  }, [hydrated, user, consent]);

  const resetSession = useCallback(() => {
    setUser(null);
    setConsent(DEFAULT_CONSENT);
    setPendingImage(null);
    setLastAnalysis(null);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
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
    [hydrated, user, consent, pendingImage, lastAnalysis, resetSession],
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
