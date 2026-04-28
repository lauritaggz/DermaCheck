import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckboxRow } from '../components/CheckboxRow';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
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

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (consent.accepted) {
      navigate('/home');
    }
  }, [consent.accepted, navigate]);

  const bothChecked = consentRead && privacyRead;

  async function handleContinue() {
    if (!user) return;
    if (!bothChecked) {
      setError('Marca ambas casillas para confirmar que leíste el consentimiento y la política de privacidad.');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const next = await consentService.acceptAllRequiredDocuments(user.id);
      setConsent(next);
      navigate('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la aceptación. Revisa la conexión o el servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <PageTransition>
      <ScreenContainer scroll>
      <div className="py-8 max-w-3xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            ⚠️ Los análisis de DermaCheck son preliminares y no reemplazan el criterio de un profesional de la salud.
          </p>
        </div>

        <h1 className="text-3xl font-bold text-primary mb-2">
          Consentimiento y privacidad
        </h1>
        <p className="text-sm text-textMuted mb-8">
          Documentos en versión {LEGAL_DOCUMENTS.consent_informed.version} · Registro en servidor
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-surface rounded-2xl p-6 mb-6 border border-borderLight">
          <h2 className="text-xl font-semibold text-text mb-3">
            {LEGAL_DOCUMENTS.consent_informed.shortTitle}
          </h2>
          <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">
            {CONSENT_SUMMARY}
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 mb-6 border border-borderLight">
          <h2 className="text-xl font-semibold text-text mb-3">
            {LEGAL_DOCUMENTS.privacy_policy.shortTitle}
          </h2>
          <p className="text-sm text-textSecondary whitespace-pre-line leading-relaxed">
            {PRIVACY_SUMMARY}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-primary/20 space-y-4">
          <CheckboxRow
            checked={consentRead}
            onToggle={() => {
              setConsentRead(v => !v);
              setError(null);
            }}
            label={`He leído y acepto el ${LEGAL_DOCUMENTS.consent_informed.shortTitle.toLowerCase()} (versión ${LEGAL_DOCUMENTS.consent_informed.version}).`}
          />
          
          <CheckboxRow
            checked={privacyRead}
            onToggle={() => {
              setPrivacyRead(v => !v);
              setError(null);
            }}
            label={`He leído y acepto la ${LEGAL_DOCUMENTS.privacy_policy.shortTitle.toLowerCase()} (versión ${LEGAL_DOCUMENTS.privacy_policy.version}).`}
          />
        </div>

        <PrimaryButton
          label="Registrar aceptación y continuar"
          onPress={handleContinue}
          loading={loading}
          disabled={!bothChecked || loading}
          className="w-full"
        />
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
