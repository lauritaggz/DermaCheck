import { LEGAL_DOCUMENTS, LEGAL_DOC_VERSION } from '../constants/legalDocuments';
import { apiUrl, getApiBaseUrl } from '../config/api';
import type { ConsentStatus, DocumentAcceptanceRecord } from '../types';
import { parseApiErrorMessage } from '../utils/apiErrors';
import { delay } from '../utils/delay';

const MOCK_LATENCY_MS = 400;

const API_V1 = '/api/v1';

function buildLocalAcceptances(nowIso: string): DocumentAcceptanceRecord[] {
  return [
    {
      documentSlug: LEGAL_DOCUMENTS.consent_informed.slug,
      title: LEGAL_DOCUMENTS.consent_informed.shortTitle,
      versionAccepted: LEGAL_DOCUMENTS.consent_informed.version,
      acceptedAt: nowIso,
      status: 'accepted',
    },
    {
      documentSlug: LEGAL_DOCUMENTS.privacy_policy.slug,
      title: LEGAL_DOCUMENTS.privacy_policy.shortTitle,
      versionAccepted: LEGAL_DOCUMENTS.privacy_policy.version,
      acceptedAt: nowIso,
      status: 'accepted',
    },
  ];
}

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
   * Registra aceptación de todos los documentos requeridos (#115).
   * Con API: marca de tiempo en servidor. Sin API: demo local.
   */
  async acceptAllRequiredDocuments(userId: string): Promise<ConsentStatus> {
    const base = getApiBaseUrl();
    if (!base) {
      await delay(MOCK_LATENCY_MS);
      const now = new Date().toISOString();
      const acceptances = buildLocalAcceptances(now);
      return {
        accepted: true,
        acceptedAt: latestAcceptanceAt(acceptances),
        policyVersion: LEGAL_DOC_VERSION,
        acceptances,
        lastSyncedAt: null,
      };
    }

    const url = apiUrl(`${API_V1}/consents/accept`);
    const res = await fetch(url, {
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

  /** Consulta histórico de aceptaciones (#116). */
  async fetchUserAcceptances(userId: string): Promise<DocumentAcceptanceRecord[]> {
    if (!getApiBaseUrl()) {
      await delay(200);
      return [];
    }
    const url = apiUrl(`${API_V1}/consents/users/${encodeURIComponent(userId)}/acceptances`);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(await parseApiErrorMessage(res));
    }
    const rows = (await res.json()) as ApiAcceptanceRow[];
    return Array.isArray(rows) ? rows.map(mapApiAcceptance) : [];
  },
};
