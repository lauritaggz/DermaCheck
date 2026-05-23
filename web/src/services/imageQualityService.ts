export interface ImageQuality {
  brightness: number;
  sharpness: number;
  contrast: number;
  isGood: boolean;
  issues: string[];
}

export function evaluateImageData(imageData: ImageData, width: number, height: number): ImageQuality {
  const data = imageData.data;
  const pixelCount = data.length / 4;

  let brightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  brightness /= pixelCount;

  let variance = 0;
  const grayscale = new Uint8ClampedArray(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    grayscale[i / 4] = gray;
    variance += Math.pow(gray - brightness, 2);
  }
  const contrast = Math.sqrt(variance / pixelCount);

  let sharpness = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplacian = Math.abs(
        -grayscale[idx - width - 1] - grayscale[idx - width] - grayscale[idx - width + 1] -
        grayscale[idx - 1] + 8 * grayscale[idx] - grayscale[idx + 1] -
        grayscale[idx + width - 1] - grayscale[idx + width] - grayscale[idx + width + 1]
      );
      sharpness += laplacian;
    }
  }
  sharpness /= Math.max((width - 2) * (height - 2), 1);

  const issues: string[] = [];
  let isGood = true;
  if (brightness < 60) {
    issues.push('Muy oscuro - mejora la iluminación');
    isGood = false;
  } else if (brightness > 200) {
    issues.push('Muy brillante - reduce la luz');
    isGood = false;
  }
  if (sharpness < 15) {
    issues.push('Imagen borrosa - mantén la cámara estable');
    isGood = false;
  }
  if (contrast < 20) {
    issues.push('Bajo contraste - mejora el fondo o iluminación');
    isGood = false;
  }

  return { brightness, sharpness, contrast, isGood, issues };
}

export async function evaluateImageBlob(blob: Blob): Promise<ImageQuality> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen para validar calidad'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo crear contexto de canvas para validar calidad');
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return evaluateImageData(imageData, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
