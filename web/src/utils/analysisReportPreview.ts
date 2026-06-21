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
