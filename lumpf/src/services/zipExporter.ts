import JSZip from 'jszip';
import { PhotoItem } from '../types';

export interface ZipProgressCallback {
  (percentage: number, statusText: string): void;
}

/**
 * Downloads a single photo directly in the browser.
 * Works seamlessly even if the user has no Google account logged in.
 */
export async function downloadSinglePhoto(
  photo: PhotoItem,
  format: 'web' | 'original'
): Promise<void> {
  // If original format with Google Drive direct download URL:
  if (format === 'original' && photo.driveDownloadUrl) {
    const directUrl = photo.driveDownloadUrl;
    const a = document.createElement('a');
    a.href = directUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = photo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const urlToFetch =
    format === 'original' && photo.originalUrl
      ? photo.originalUrl
      : photo.webUrl;

  try {
    const response = await fetch(urlToFetch);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    const extension = 'jpg';
    const cleanName = photo.name.replace(/\.[^/.]+$/, '');
    a.download = `${cleanName}-${format === 'original' ? 'ORIGINAL' : 'WEB'}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch (err) {
    console.error('Error al descargar foto directa:', err);
    // Fallback: trigger native download via link
    const a = document.createElement('a');
    a.href = urlToFetch;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = photo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Bundles selected or all photos into a ZIP file with live progress.
 * Supports public Google Drive direct links and web previews.
 */
export async function downloadPhotosAsZip(
  photos: PhotoItem[],
  galleryTitle: string,
  format: 'web' | 'original',
  onProgress?: ZipProgressCallback
): Promise<void> {
  if (photos.length === 0) return;

  const zip = new JSZip();
  const folderName = `${galleryTitle.replace(/[^a-zA-Z0-9_\- ]/g, '')}_${format.toUpperCase()}`;
  const folder = zip.folder(folderName) || zip;

  const total = photos.length;

  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    const progressPercent = Math.round((i / total) * 85);
    if (onProgress) {
      onProgress(progressPercent, `Descargando imagen ${i + 1} de ${total}: ${photo.name}`);
    }

    // Try webUrl first if format is web, or original if format is original
    const preferredUrl = format === 'original' && photo.originalUrl ? photo.originalUrl : photo.webUrl;
    const fallbackUrl = photo.webUrl;

    let blobLoaded = false;

    // Attempt primary URL
    try {
      const response = await fetch(preferredUrl);
      if (response.ok) {
        const blob = await response.blob();
        const ext = photo.name.includes('.') ? photo.name.split('.').pop() : 'jpg';
        const baseName = photo.name.replace(/\.[^/.]+$/, '');
        const fileName = `${String(i + 1).padStart(2, '0')}_${baseName}.${ext}`;
        folder.file(fileName, blob);
        blobLoaded = true;
      }
    } catch (e) {
      // Primary failed, will try fallback
    }

    // Attempt fallback if primary failed
    if (!blobLoaded && fallbackUrl && fallbackUrl !== preferredUrl) {
      try {
        const fallbackRes = await fetch(fallbackUrl);
        if (fallbackRes.ok) {
          const fallbackBlob = await fallbackRes.blob();
          const ext = photo.name.includes('.') ? photo.name.split('.').pop() : 'jpg';
          const baseName = photo.name.replace(/\.[^/.]+$/, '');
          const fileName = `${String(i + 1).padStart(2, '0')}_${baseName}.${ext}`;
          folder.file(fileName, fallbackBlob);
          blobLoaded = true;
        }
      } catch (e2) {
        console.warn(`No se pudo descargar la imagen ${photo.name} para el ZIP.`);
      }
    }
  }

  if (onProgress) {
    onProgress(90, 'Comprimiendo archivo ZIP...');
  }

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const zipGenProgress = 90 + Math.round((metadata.percent / 100) * 10);
      if (onProgress) {
        onProgress(zipGenProgress, `Generando ZIP: ${Math.round(metadata.percent)}%`);
      }
    }
  );

  if (onProgress) {
    onProgress(100, '¡Archivo ZIP listo para descarga!');
  }

  // Trigger download
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
