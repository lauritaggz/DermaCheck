import { useState } from 'react';
import { PrimaryButton } from '../PrimaryButton';
import { TextField } from '../TextField';
import type { AnalysisWithDiagnosis } from '../../types';
import { buildAnalysisEmailHtml } from '../../utils/buildAnalysisEmailHtml';
import { openAnalysisReportPreview } from '../../utils/analysisReportPreview';
import { isValidEmail } from '../../utils/validateEmail';
import { sendAnalysisSummaryEmail } from '../../services/analysisEmailService';

interface Props {
  analysis: AnalysisWithDiagnosis;
}

type SendStatus = 'idle' | 'validating' | 'sending' | 'success' | 'error';

export function SendAnalysisEmail({ analysis }: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<SendStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const isBusy = status === 'validating' || status === 'sending' || loadingPreview;

  function validateInput(): string | null {
    setStatus('validating');
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Ingresa un correo electrónico.');
      setStatus('idle');
      return null;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError('El formato del correo no es válido.');
      setStatus('idle');
      return null;
    }
    setEmailError(null);
    return trimmed;
  }

  async function handlePreview() {
    if (loadingPreview || status === 'sending') return;
    const recipient = validateInput();
    if (!recipient) return;

    setLoadingPreview(true);
    setFeedbackMessage(null);
    setStatus('idle');
    try {
      const html = buildAnalysisEmailHtml(analysis, recipient);
      const opened = openAnalysisReportPreview(html);
      if (!opened) {
        setStatus('error');
        setFeedbackMessage(
          'No se pudo abrir la vista previa. Permite ventanas emergentes en el navegador.',
        );
        return;
      }
      setStatus('success');
      setFeedbackMessage(
        'Vista previa generada correctamente. Usa «Guardar como PDF» en el diálogo de impresión.',
      );
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleSend() {
    if (status === 'sending' || loadingPreview) return;
    const recipient = validateInput();
    if (!recipient) return;

    setStatus('sending');
    setFeedbackMessage(null);

    const result = await sendAnalysisSummaryEmail(recipient, analysis);

    if (result.success) {
      setStatus('success');
      setFeedbackMessage(result.message);
      setEmail('');
      return;
    }

    setStatus('error');
    setFeedbackMessage(result.message || 'No pudimos enviar el resumen. Intenta nuevamente.');
  }

  return (
    <div className="surface-card p-6">
      <h2 className="text-xl font-bold text-brand-900 mb-1">Recibe tu resumen por correo</h2>
      <p className="text-sm text-textSecondary mb-5">
        Ingresa tu correo para recibir una copia del resumen de tu análisis.
      </p>

      <TextField
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="off"
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(null);
          if (status !== 'idle') {
            setStatus('idle');
            setFeedbackMessage(null);
          }
        }}
        error={emailError ?? undefined}
      />

      <p className="text-xs text-textMuted mb-4">
        Tu correo se usará solo para enviar este resumen y no será almacenado.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <PrimaryButton
          label={loadingPreview ? 'Generando…' : 'Previsualizar informe'}
          variant="secondary"
          onClick={handlePreview}
          loading={loadingPreview}
          disabled={isBusy}
          className="w-full"
        />
        <PrimaryButton
          label={status === 'sending' ? 'Enviando…' : 'Enviar resumen'}
          onClick={handleSend}
          loading={status === 'sending'}
          disabled={isBusy}
          className="w-full"
        />
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-sm border-2 ${
            status === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
          role="status"
        >
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
