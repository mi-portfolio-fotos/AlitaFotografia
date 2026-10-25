import { WatermarkConfig } from '../types';

export interface ProcessedPhotoResult {
  webBlob: Blob;
  webUrl: string;
  originalBlob: Blob;
  originalUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Loads an image file into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Applies watermark onto a canvas 2D context
 */
function applyWatermarkToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  watermark: WatermarkConfig
) {
  if (!watermark.enabled || !watermark.text.trim()) return;

  ctx.save();
  const text = watermark.text.trim();
  const baseScale = Math.min(width, height) / 1000;
  const calculatedFontSize = Math.max(16, Math.round((watermark.fontSize || 24) * baseScale));

  ctx.font = `300 ${calculatedFontSize}px 'Cormorant Garamond', 'Cinzel', Georgia, serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${watermark.opacity || 0.4})`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const padding = Math.max(20, Math.round(30 * baseScale));

  let x = padding;
  let y = height - padding;

  switch (watermark.position) {
    case 'center':
      ctx.translate(width / 2, height / 2);
      ctx.rotate((-25 * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `400 ${Math.round(calculatedFontSize * 1.5)}px 'Cinzel', serif`;
      ctx.fillText(text.toUpperCase(), 0, 0);

      // Subtle decorative line above and below
      ctx.strokeStyle = `rgba(255, 255, 255, ${(watermark.opacity || 0.4) * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-textWidth * 0.8, -calculatedFontSize);
      ctx.lineTo(textWidth * 0.8, -calculatedFontSize);
      ctx.moveTo(-textWidth * 0.8, calculatedFontSize);
      ctx.lineTo(textWidth * 0.8, calculatedFontSize);
      ctx.stroke();
      ctx.restore();
      return;

    case 'top-right':
      x = width - textWidth - padding;
      y = padding + calculatedFontSize;
      break;

    case 'bottom-left':
      x = padding;
      y = height - padding;
      break;

    case 'bottom-right':
    default:
      x = width - textWidth - padding;
      y = height - padding;
      break;
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Compresses an image for fast web delivery and optionally applies a watermark
 */
export async function processImageForWeb(
  file: File | Blob,
  watermark?: WatermarkConfig,
  maxDimension: number = 1600,
  quality: number = 0.84
): Promise<ProcessedPhotoResult> {
  const originalBlob = file instanceof Blob ? file : new Blob([file]);
  const originalUrl = URL.createObjectURL(originalBlob);

  const img = await loadImage(originalUrl);
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  // Calculate target dimensions
  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
      targetHeight = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto de imagen canvas.');
  }

  // Draw image with smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Apply watermark if configured
  if (watermark && watermark.enabled) {
    applyWatermarkToCanvas(ctx, targetWidth, targetHeight, watermark);
  }

  // Output as WebP (or JPEG fallback)
  const mimeType = 'image/jpeg';
  const webBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Fallo al comprimir imagen en canvas.'));
      },
      mimeType,
      quality
    );
  });

  const webUrl = URL.createObjectURL(webBlob);

  return {
    webBlob,
    webUrl,
    originalBlob,
    originalUrl,
    width: naturalWidth,
    height: naturalHeight,
    sizeBytes: originalBlob.size,
  };
}
