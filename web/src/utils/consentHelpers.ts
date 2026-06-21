import { LEGAL_DOCUMENTS } from '../constants/legalDocuments';
import type { ConsentStatus } from '../types';

export function createEmptyConsentStatus(): ConsentStatus {
  return {
    accepted: false,
    acceptedAt: null,
    sessionId: null,
    consentAnalysisAccepted: false,
    privacyPolicyAccepted: false,
    trainingConsentAccepted: false,
    allowTrainingStorage: false,
    consentAnalysisVersion: null,
    privacyPolicyVersion: null,
    trainingConsentVersion: null,
    legalVersion: null,
  };
}

export function isConsentComplete(consent: ConsentStatus): boolean {
  return (
    consent.consentAnalysisAccepted
    && consent.privacyPolicyAccepted
    && Boolean(consent.sessionId)
    && consent.consentAnalysisVersion === LEGAL_DOCUMENTS.consent_informed.version
    && consent.privacyPolicyVersion === LEGAL_DOCUMENTS.privacy_policy.version
  );
}

export function canProceedWithRequiredConsent(
  consentRead: boolean,
  privacyRead: boolean,
): boolean {
  return consentRead && privacyRead;
}
