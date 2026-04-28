export function parseApiErrorMessage(res: Response): Promise<string> {
  return res.text().then((text) => {
    try {
      const json = JSON.parse(text);
      return json.detail || json.message || 'Error desconocido del servidor';
    } catch {
      return text || `Error ${res.status}`;
    }
  });
}
