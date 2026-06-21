import { AUTH_ERRORS } from '../constants/authMessages';
import { LEGAL_DOCUMENTS } from '../constants/legalDocuments';
import { resolveKioskUserId } from './kioskService';
import { apiUrl, isApiAvailable } from '../utils/api';
import type { ConsentStatus, DocumentAcceptanceRecord } from '../types';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { formatApiNetworkError } from '../utils/networkErrors';

const API_V1 = '/api/v1';

type ApiAcceptanceRow = {
  document_slug: string;
  title: string;
  version_accepted: string;
  accepted_at: string;
  status: string;
};

export type AcceptKioskConsentOptions = {
  sessionId: string;
  trainingConsentAccepted: boolean;
};

function mapApiAcceptance(row: ApiAcceptanceRow): DocumentAcceptanceRecord {
  return {
    documentSlug: row.document_slug,
    title: row.title,
    versionAccepted: row.version_accepted,
    acceptedAt: row.accepted_at,
    status: row.status,
  };
}

function latestAcceptanceAt(records: DocumentAcceptanceRecord[]): string | null {
  if (!records.length) return null;
  return records.reduce((max, r) => (r.acceptedAt > max ? r.acceptedAt : max), records[0].acceptedAt);
}

export const consentService = {
  /**
   * Registra evidencia de aceptación legal en el servidor (sin persistir en el cliente).
   */
  async acceptKioskConsent(options: AcceptKioskConsentOptions): Promise<ConsentStatus> {
    if (!isApiAvailable()) {
      throw new Error(AUTH_ERRORS.SERVER_REQUIRED);
    }

    const kioskUserId = await resolveKioskUserId();
    const items: Array<{ slug: string; version: string }> = [
      { slug: LEGAL_DOCUMENTS.consent_informed.slug, version: LEGAL_DOCUMENTS.consent_informed.version },
      { slug: LEGAL_DOCUMENTS.privacy_policy.slug, version: LEGAL_DOCUMENTS.privacy_policy.version },
    ];

    if (options.trainingConsentAccepted) {
      items.push({
        slug: LEGAL_DOCUMENTS.consent_training.slug,
        version: LEGAL_DOCUMENTS.consent_training.version,
      });
    }

    const url = apiUrl(`${API_V1}/consents/accept`);
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          user_id: kioskUserId,
          session_id: options.sessionId,
          items,
          consent_analysis: true,
          consent_privacy: true,
          consent_training: options.trainingConsentAccepted,
          consent_analysis_version: LEGAL_DOCUMENTS.consent_informed.version,
          privacy_policy_version: LEGAL_DOCUMENTS.privacy_policy.version,
          training_consent_version: options.trainingConsentAccepted
            ? LEGAL_DOCUMENTS.consent_training.version
            : null,
        }),
      });
    } catch {
      throw new Error(formatApiNetworkError());
    }

    if (!res.ok) {
      throw new Error(await parseApiErrorMessage(res));
    }

    const data = (await res.json()) as { acceptances: ApiAcceptanceRow[] };
    const acceptances = (data.acceptances ?? []).map(mapApiAcceptance);
    const synced = new Date().toISOString();
    const legalVersion = LEGAL_DOCUMENTS.consent_informed.version;

    return {
      accepted: true,
      acceptedAt: latestAcceptanceAt(acceptances),
      sessionId: options.sessionId,
      consentAnalysisAccepted: true,
      privacyPolicyAccepted: true,
      trainingConsentAccepted: options.trainingConsentAccepted,
      allowTrainingStorage: options.trainingConsentAccepted,
      consentAnalysisVersion: LEGAL_DOCUMENTS.consent_informed.version,
      privacyPolicyVersion: LEGAL_DOCUMENTS.privacy_policy.version,
      trainingConsentVersion: options.trainingConsentAccepted
        ? LEGAL_DOCUMENTS.consent_training.version
        : null,
      legalVersion,
      acceptances,
      lastSyncedAt: synced,
    };
  },
};
