/**
 * Abre el HTML del informe en una ventana imprimible (guardar como PDF desde el navegador).
 */
export function openAnalysisReportPreview(html: string): boolean {
  const previewWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000');
  if (!previewWindow) return false;

  previewWindow.document.open();
  previewWindow.document.write(html);
  previewWindow.document.close();
  previewWindow.focus();

  previewWindow.onload = () => {
    setTimeout(() => {
      previewWindow.print();
    }, 250);
  };

  return true;
}

/**
 * Simula el envío por correo sin persistir el destinatario.
 */
export async function simulateAnalysisEmailSend(
  _recipientEmail: string,
  html: string,
): Promise<{ ok: true; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (!html.includes('DermaCheck')) {
    throw new Error('No se pudo generar el informe.');
  }
  return {
    ok: true,
    message: 'Envío simulado correctamente. Esta función será integrada próximamente.',
  };
}
