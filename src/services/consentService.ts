import { AUTH_ERRORS } from '../constants/authMessages';
import { LEGAL_DOCUMENTS, LEGAL_DOC_VERSION } from '../constants/legalDocuments';
import { apiUrl, getApiBaseUrl } from '../config/api';
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
   * Registra aceptación de todos los documentos requeridos en el servidor.
   */
  async acceptAllRequiredDocuments(userId: string): Promise<ConsentStatus> {
    if (!getApiBaseUrl()) {
      throw new Error(AUTH_ERRORS.SERVER_REQUIRED);
    }

    const url = apiUrl(`${API_V1}/consents/accept`);
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          items: [
            { slug: LEGAL_DOCUMENTS.consent_informed.slug, version: LEGAL_DOCUMENTS.consent_informed.version },
            { slug: LEGAL_DOCUMENTS.privacy_policy.slug, version: LEGAL_DOCUMENTS.privacy_policy.version },
          ],
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

    return {
      accepted: true,
      acceptedAt: latestAcceptanceAt(acceptances),
      policyVersion: LEGAL_DOC_VERSION,
      acceptances,
      lastSyncedAt: synced,
    };
  },

  /** Consulta histórico de aceptaciones en el servidor. */
  async fetchUserAcceptances(userId: string): Promise<DocumentAcceptanceRecord[]> {
    if (!getApiBaseUrl()) {
      throw new Error(AUTH_ERRORS.SERVER_REQUIRED);
    }
    const url = apiUrl(`${API_V1}/consents/users/${encodeURIComponent(userId)}/acceptances`);
    let res: Response;
    try {
      res = await fetch(url, { headers: { Accept: 'application/json' } });
    } catch {
      throw new Error(formatApiNetworkError());
    }
    if (!res.ok) {
      throw new Error(await parseApiErrorMessage(res));
    }
    const rows = (await res.json()) as ApiAcceptanceRow[];
    return Array.isArray(rows) ? rows.map(mapApiAcceptance) : [];
  },
};
