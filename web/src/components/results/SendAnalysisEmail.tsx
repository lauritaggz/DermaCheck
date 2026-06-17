import { useState } from 'react';
import { PrimaryButton } from '../PrimaryButton';
import { TextField } from '../TextField';
import type { AnalysisWithDiagnosis } from '../../types';
import { buildAnalysisEmailHtml } from '../../utils/buildAnalysisEmailHtml';
import { openAnalysisReportPreview, simulateAnalysisEmailSend } from '../../utils/analysisReportPreview';
import { isValidEmail } from '../../utils/validateEmail';

interface Props {
  analysis: AnalysisWithDiagnosis;
}

type Feedback = { type: 'success' | 'error'; message: string } | null;

export function SendAnalysisEmail({ analysis }: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function validateInput(): string | null {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Ingresa un correo electrónico.');
      return null;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError('El formato del correo no es válido.');
      return null;
    }
    setEmailError(null);
    return trimmed;
  }

  async function handlePreview() {
    const recipient = validateInput();
    if (!recipient) return;

    setLoadingPreview(true);
    setFeedback(null);
    try {
      const html = buildAnalysisEmailHtml(analysis, recipient);
      const opened = openAnalysisReportPreview(html);
      if (!opened) {
        setFeedback({
          type: 'error',
          message: 'No se pudo abrir la vista previa. Permite ventanas emergentes en el navegador.',
        });
        return;
      }
      setFeedback({
        type: 'success',
        message: 'Vista previa generada correctamente. Usa «Guardar como PDF» en el diálogo de impresión.',
      });
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleSimulateSend() {
    const recipient = validateInput();
    if (!recipient) return;

    setLoadingSend(true);
    setFeedback(null);
    try {
      const html = buildAnalysisEmailHtml(analysis, recipient);
      const result = await simulateAnalysisEmailSend(recipient, html);
      setFeedback({ type: 'success', message: result.message });
      setEmail('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo simular el envío.',
      });
    } finally {
      setLoadingSend(false);
    }
  }

  return (
    <div className="surface-card p-6">
      <h2 className="text-xl font-bold text-brand-900 mb-1">Recibir resumen por correo</h2>
      <p className="text-sm text-textSecondary mb-5">
        Ingresa tu correo para previsualizar o simular el envío del informe. El correo no se guarda en el sistema.
      </p>

      <TextField
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(null);
          setFeedback(null);
        }}
        error={emailError ?? undefined}
      />

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <PrimaryButton
          label={loadingPreview ? 'Generando…' : 'Generar vista previa'}
          variant="secondary"
          onClick={handlePreview}
          loading={loadingPreview}
          disabled={loadingPreview || loadingSend}
          className="w-full"
        />
        <PrimaryButton
          label={loadingSend ? 'Enviando…' : 'Simular envío'}
          onClick={handleSimulateSend}
          loading={loadingSend}
          disabled={loadingPreview || loadingSend}
          className="w-full"
        />
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm border-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
          role="status"
        >
          {feedback.message}
        </div>
      )}

      <p className="text-xs text-textMuted mt-4">
        MVP: el envío real por correo se integrará próximamente. Por ahora solo se genera la vista previa del informe.
      </p>
    </div>
  );
}
