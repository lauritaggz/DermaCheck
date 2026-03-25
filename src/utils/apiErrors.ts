/** Mensaje legible desde respuestas de error de FastAPI / Pydantic. */
export async function parseApiErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    const d = body.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
      return d.map((x: { msg?: string }) => x?.msg ?? JSON.stringify(x)).join(' ');
    }
  } catch {
    /* ignore */
  }
  return `Error del servidor (${res.status})`;
}
