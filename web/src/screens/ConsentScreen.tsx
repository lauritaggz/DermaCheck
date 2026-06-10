import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckboxRow } from '../components/CheckboxRow';
import { PrimaryButton } from '../components';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { SectionHeader } from '../components/layout/SectionHeader';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner';
import { CONSENT_SUMMARY, PRIVACY_SUMMARY } from '../constants/disclaimers';
import { LEGAL_DOCUMENTS } from '../constants/legalDocuments';
import { useAppState } from '../context/AppContext';
import { consentService } from '../services/consentService';

export function ConsentScreen() {
  const { setConsent, consent, user } = useAppState();
  const navigate = useNavigate();
  const [consentRead, setConsentRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => { if (consent.accepted) navigate('/home'); }, [consent.accepted, navigate]);

  const bothChecked = consentRead && privacyRead;

  async function handleContinue() {
    if (!user) return;
    if (!bothChecked) {
      setError('Marca ambas casillas para confirmar que leíste los documentos.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const next = await consentService.acceptAllRequiredDocuments(user.id);
      setConsent(next);
      navigate('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la aceptación.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
          <SectionHeader title="Consentimiento y privacidad"
            description={`Documentos v${LEGAL_DOCUMENTS.consent_informed.version} · Registro en servidor`} />

          <DisclaimerBanner variant="warning" title="Aviso importante"
            message="Los análisis de DermaCheck son preliminares y no reemplazan el criterio de un profesional de la salud." />

          {error && (
            <div className="my-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <div className="space-y-4 my-6">
            <div className="surface-card p-6">
              <h2 className="text-lg font-bold text-brand-900 mb-3">{LEGAL_DOCUMENTS.consent_informed.shortTitle}</h2>
              <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">{CONSENT_SUMMARY}</p>
            </div>
            <div className="surface-card p-6">
              <h2 className="text-lg font-bold text-brand-900 mb-3">{LEGAL_DOCUMENTS.privacy_policy.shortTitle}</h2>
              <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">{PRIVACY_SUMMARY}</p>
            </div>
          </div>

          <div className="surface-card p-6 mb-6 border-2 border-brand-200 space-y-4">
            <CheckboxRow checked={consentRead} onToggle={() => { setConsentRead((v) => !v); setError(null); }}
              label={`He leído y acepto el ${LEGAL_DOCUMENTS.consent_informed.shortTitle.toLowerCase()} (v${LEGAL_DOCUMENTS.consent_informed.version}).`} />
            <CheckboxRow checked={privacyRead} onToggle={() => { setPrivacyRead((v) => !v); setError(null); }}
              label={`He leído y acepto la ${LEGAL_DOCUMENTS.privacy_policy.shortTitle.toLowerCase()} (v${LEGAL_DOCUMENTS.privacy_policy.version}).`} />
          </div>

          <PrimaryButton label="Registrar aceptación y continuar" onClick={handleContinue}
            loading={loading} disabled={!bothChecked || loading} className="w-full" />
        </div>
      </AppShell>
    </PageTransition>
  );
}
