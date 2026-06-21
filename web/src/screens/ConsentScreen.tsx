import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckboxRow } from '../components/CheckboxRow';
import { PrimaryButton } from '../components';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { SectionHeader } from '../components/layout/SectionHeader';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner';
import {
  CONSENT_MINORS_NOTICE,
  CONSENT_SUMMARY,
  CONSENT_TRAINING_OPTIONAL_NOTE,
  PRIVACY_SUMMARY,
  TRAINING_CONSENT_SUMMARY,
} from '../constants/disclaimers';
import { LEGAL_DOCUMENTS } from '../constants/legalDocuments';
import { useAppState } from '../context/AppContext';
import { consentService } from '../services/consentService';
import { canProceedWithRequiredConsent } from '../utils/consentHelpers';

export function ConsentScreen() {
  const { setConsent, sessionId, ensureKioskSessionId } = useAppState();
  const navigate = useNavigate();
  const [consentRead, setConsentRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [trainingConsent, setTrainingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureKioskSessionId();
  }, [ensureKioskSessionId]);

  const requiredAccepted = canProceedWithRequiredConsent(consentRead, privacyRead);

  async function handleContinue() {
    if (!requiredAccepted) {
      setError('Debes aceptar el consentimiento informado y la política de privacidad para continuar.');
      return;
    }
    const activeSessionId = sessionId;
    if (!activeSessionId) {
      setError('Sesión no iniciada. Vuelve al inicio e intenta de nuevo.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const next = await consentService.acceptKioskConsent({
        sessionId: activeSessionId,
        trainingConsentAccepted: trainingConsent,
      });
      flushSync(() => {
        setConsent(next);
      });
      navigate('/instructions', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la aceptación.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
          <SectionHeader
            title="Consentimiento y privacidad"
            description="Documentos legales · Uso en tótem · Cada visita requiere aceptación nueva"
          />

          <DisclaimerBanner
            variant="warning"
            title="Aviso importante"
            message="Los análisis de DermaCheck son preliminares y no reemplazan el criterio de un profesional de la salud."
          />

          <p className="my-4 text-xs text-textSecondary leading-relaxed rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
            {CONSENT_MINORS_NOTICE}
          </p>

          {error && (
            <div className="my-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <div className="space-y-4 my-6">
            <div className="surface-card p-6 border-l-4 border-l-brand-500">
              <h2 className="text-lg font-bold text-brand-900 mb-1">
                {LEGAL_DOCUMENTS.consent_informed.shortTitle}
              </h2>
              <p className="text-xs text-textMuted mb-3">Obligatorio · v{LEGAL_DOCUMENTS.consent_informed.version}</p>
              <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">{CONSENT_SUMMARY}</p>
            </div>

            <div className="surface-card p-6 border-l-4 border-l-teal-500">
              <h2 className="text-lg font-bold text-brand-900 mb-1">
                {LEGAL_DOCUMENTS.privacy_policy.shortTitle}
              </h2>
              <p className="text-xs text-textMuted mb-3">Obligatorio · v{LEGAL_DOCUMENTS.privacy_policy.version}</p>
              <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">{PRIVACY_SUMMARY}</p>
            </div>

            <div className="surface-card p-6 border-l-4 border-l-violet-400">
              <h2 className="text-lg font-bold text-brand-900 mb-1">
                {LEGAL_DOCUMENTS.consent_training.shortTitle}
              </h2>
              <p className="text-xs text-textMuted mb-3">Opcional · v{LEGAL_DOCUMENTS.consent_training.version}</p>
              <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">{TRAINING_CONSENT_SUMMARY}</p>
              <p className="mt-4 text-xs text-brand-700 font-medium leading-relaxed">
                {CONSENT_TRAINING_OPTIONAL_NOTE}
              </p>
            </div>
          </div>

          <div className="surface-card p-6 mb-6 border-2 border-brand-200 space-y-4">
            <CheckboxRow
              checked={consentRead}
              onToggle={() => { setConsentRead((v) => !v); setError(null); }}
              label={`He leído y acepto el consentimiento informado para el análisis dermatológico orientativo (v${LEGAL_DOCUMENTS.consent_informed.version}).`}
            />
            <CheckboxRow
              checked={privacyRead}
              onToggle={() => { setPrivacyRead((v) => !v); setError(null); }}
              label={`He leído y acepto la política de privacidad resumida (v${LEGAL_DOCUMENTS.privacy_policy.version}).`}
            />
            <div className="border-t border-slate-100 pt-4">
              <CheckboxRow
                checked={trainingConsent}
                onToggle={() => setTrainingConsent((v) => !v)}
                label="Autorizo de forma opcional que DermaCheck conserve mi imagen facial de manera segura para mejorar, validar o entrenar modelos de inteligencia artificial en el futuro."
              />
            </div>
          </div>

          <PrimaryButton
            label="Aceptar y comenzar análisis"
            onClick={handleContinue}
            loading={loading}
            disabled={!requiredAccepted || loading}
            className="w-full"
          />
        </div>
      </AppShell>
    </PageTransition>
  );
}
