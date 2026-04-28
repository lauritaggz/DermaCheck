import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { decode, type RawImageData } from 'jpeg-js';

/** Códigos internos para priorizar mensajes en UI. */
export type CaptureValidationIssueCode =
  | 'decode_error'
  | 'illumination_dark'
  | 'illumination_bright'
  | 'face_not_visible'
  | 'face_off_center';

export type CaptureValidationIssue = {
  code: CaptureValidationIssueCode;
  message: string;
};

export type CaptureValidationResult = {
  ok: boolean;
  issues: CaptureValidationIssue[];
};

const PREVIEW_MAX_WIDTH = 380;
const STRIDE = 2;

const DARK_MEAN_LUMA = 48;
const BRIGHT_MEAN_LUMA = 236;
const HIGHLIGHT_RATIO_MAX = 0.24;
const HIGHLIGHT_LUMA = 248;

const CENTER_SKIN_RATIO_MIN = 0.026;
const MIN_SKIN_PIXELS_TOTAL = 320;
const CENTER_LUMA_STD_MIN = 9;

const CENTROID_DX_MAX = 0.14;
const CENTROID_DY_MAX = 0.17;
const FACE_CENTROID_Y_NORM = 0.42;

const ISSUE_PRIORITY: Record<CaptureValidationIssueCode, number> = {
  decode_error: 0,
  illumination_dark: 1,
  illumination_bright: 2,
  face_not_visible: 3,
  face_off_center: 4,
};

/** Mensaje unificado: fallo en la validación local previa al envío al servidor. */
const MSG_DECODE_DEMO =
  'La comprobación local de luz y encuadre es básica y a veces no puede leer la foto en este dispositivo. Repite la captura o usa «Continuar de todos modos» para enviar la imagen al análisis con IA.';

function decodeIssue(): CaptureValidationIssue {
  return { code: 'decode_error', message: MSG_DECODE_DEMO };
}

function base64ToUint8Array(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, '');
  const atobFn = globalThis.atob;
  if (typeof atobFn !== 'function') {
    throw new Error('atob unavailable');
  }
  const binary = atobFn(clean);
  const len = binary.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function readUriBytes(uri: string): Promise<Uint8Array> {
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const res = await fetch(uri);
    if (!res.ok) {
      throw new Error(`fetch ${res.status}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  }
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToUint8Array(b64);
}

function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Heurística RGB simple (incluye tonos medios; solo orientativa antes del modelo). */
function skinLike(r: number, g: number, b: number): boolean {
  if (r < 52 || g < 38 || b < 28) return false;
  if (r <= g || r <= b) return false;
  if (r - g < 10) return false;
  if (r - b < 10) return false;
  if (g < b * 0.82) return false;
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  if (maxc - minc < 14) return false;
  return true;
}

function sortIssues(issues: CaptureValidationIssue[]): CaptureValidationIssue[] {
  return [...issues].sort((a, b) => ISSUE_PRIORITY[a.code] - ISSUE_PRIORITY[b.code]);
}

async function uriToJpegBytes(uri: string): Promise<Uint8Array> {
  const prepared = await manipulateAsync(uri, [{ resize: { width: PREVIEW_MAX_WIDTH } }], {
    compress: 0.82,
    format: SaveFormat.JPEG,
  });
  return readUriBytes(prepared.uri);
}

function analyzeBuffer(jpegBytes: Uint8Array): CaptureValidationResult {
  const issues: CaptureValidationIssue[] = [];
  let decoded: RawImageData<Uint8Array>;
  try {
    decoded = decode(jpegBytes, {
      useTArray: true,
      maxMemoryUsageInMB: 128,
      tolerantDecoding: true,
    }) as RawImageData<Uint8Array>;
  } catch {
    return { ok: false, issues: [decodeIssue()] };
  }

  const { width: W, height: H, data } = decoded;
  const px = W * H;
  if (!W || !H || !data || data.length < px) {
    return { ok: false, issues: [decodeIssue()] };
  }

  const channelsApprox = data.length / px;
  let step: number;
  if (channelsApprox >= 3.5) {
    step = 4;
  } else if (channelsApprox >= 2.5) {
    step = 3;
  } else {
    step = 1;
  }
  if (Math.abs(data.length - step * px) > 4) {
    return { ok: false, issues: [decodeIssue()] };
  }

  let sumL = 0;
  let nSample = 0;
  let highlights = 0;

  for (let y = 0; y < H; y += STRIDE) {
    for (let x = 0; x < W; x += STRIDE) {
      const i = (y * W + x) * step;
      const r = data[i];
      const g = step === 1 ? r : data[i + 1];
      const b = step === 1 ? r : data[i + 2];
      const L = luma(r, g, b);
      sumL += L;
      nSample += 1;
      if (L >= HIGHLIGHT_LUMA) highlights += 1;
    }
  }

  const meanL = sumL / Math.max(nSample, 1);
  const highlightRatio = highlights / Math.max(nSample, 1);

  if (meanL < DARK_MEAN_LUMA) {
    issues.push({
      code: 'illumination_dark',
      message: 'La imagen tiene poca iluminación. Busca luz suave frontal y repite la captura.',
    });
  }
  if (meanL > BRIGHT_MEAN_LUMA || highlightRatio > HIGHLIGHT_RATIO_MAX) {
    issues.push({
      code: 'illumination_bright',
      message: 'La imagen está demasiado clara o quemada. Evita contraluz fuerte y repite la captura.',
    });
  }

  const x0 = Math.floor(W * 0.28);
  const x1 = Math.floor(W * 0.72);
  const y0 = Math.floor(H * 0.16);
  const y1 = Math.floor(H * 0.72);

  let centerSkin = 0;
  let centerN = 0;
  let sumLc = 0;
  let sumLcSq = 0;
  let nCenter = 0;

  for (let y = y0; y < y1; y += STRIDE) {
    for (let x = x0; x < x1; x += STRIDE) {
      const i = (y * W + x) * step;
      const r = data[i];
      const g = step === 1 ? r : data[i + 1];
      const b = step === 1 ? r : data[i + 2];
      const L = luma(r, g, b);
      sumLc += L;
      sumLcSq += L * L;
      nCenter += 1;
      if (skinLike(r, g, b)) {
        centerSkin += 1;
      }
      centerN += 1;
    }
  }

  const centerMeanL = nCenter ? sumLc / nCenter : 0;
  const centerVar = nCenter ? sumLcSq / nCenter - centerMeanL * centerMeanL : 0;
  const centerStd = Math.sqrt(Math.max(centerVar, 0));
  const centerSkinRatio = centerN ? centerSkin / centerN : 0;

  let skinSumX = 0;
  let skinSumY = 0;
  let skinCount = 0;

  for (let y = 0; y < H; y += STRIDE) {
    for (let x = 0; x < W; x += STRIDE) {
      const i = (y * W + x) * step;
      const r = data[i];
      const g = step === 1 ? r : data[i + 1];
      const b = step === 1 ? r : data[i + 2];
      if (skinLike(r, g, b)) {
        skinSumX += x + 0.5;
        skinSumY += y + 0.5;
        skinCount += 1;
      }
    }
  }

  if (issues.some((i) => i.code === 'illumination_dark' || i.code === 'illumination_bright')) {
    return { ok: issues.length === 0, issues: sortIssues(issues) };
  }

  if (skinCount < MIN_SKIN_PIXELS_TOTAL || centerSkinRatio < CENTER_SKIN_RATIO_MIN) {
    issues.push({
      code: 'face_not_visible',
      message: 'No se detecta bien el rostro. Acerca el rostro al marco, sin taparlo, y repite la captura.',
    });
  } else if (centerStd < CENTER_LUMA_STD_MIN && centerSkinRatio < CENTER_SKIN_RATIO_MIN * 1.4) {
    issues.push({
      code: 'face_not_visible',
      message: 'No se detecta bien el rostro. Asegúrate de que se vea entero y repite la captura.',
    });
  }

  const hasFaceVisibilityIssue = issues.some((i) => i.code === 'face_not_visible');
  if (!hasFaceVisibilityIssue && skinCount >= MIN_SKIN_PIXELS_TOTAL) {
    const cx = skinSumX / skinCount / W;
    const cy = skinSumY / skinCount / H;
    if (Math.abs(cx - 0.5) > CENTROID_DX_MAX || Math.abs(cy - FACE_CENTROID_Y_NORM) > CENTROID_DY_MAX) {
      issues.push({
        code: 'face_off_center',
        message: 'El rostro no está centrado correctamente. Colócalo dentro del óvalo y repite la captura.',
      });
    }
  }

  return { ok: issues.length === 0, issues: sortIssues(issues) };
}

/**
 * Validación heurística (brillo + proxy de piel/centrado). Complementa al modelo de visión; no es diagnóstico clínico.
 */
export async function validateCaptureImage(uri: string): Promise<CaptureValidationResult> {
  try {
    const bytes = await uriToJpegBytes(uri);
    return analyzeBuffer(bytes);
  } catch {
    return { ok: false, issues: [decodeIssue()] };
  }
}
