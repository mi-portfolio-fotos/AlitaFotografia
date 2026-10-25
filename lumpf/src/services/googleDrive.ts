import { getAccessToken } from './firebaseAuth';
import { PhotoItem } from '../types';

const ROOT_FOLDER_NAME = 'Lumina Photography Client Vault';

export interface DriveUploadResult {
  id: string;
  name: string;
  webContentLink?: string;
  webViewLink?: string;
  directDownloadUrl: string;
}

export interface DriveFolderItem {
  id: string;
  name: string;
  modifiedTime?: string;
}

/**
 * Ensures the main client vault root folder exists in the user's Google Drive.
 */
export async function getOrCreateRootFolder(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No hay sesión de Google activa. Inicia sesión para conectar Google Drive.');
  }

  // Check if root folder exists
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${ROOT_FOLDER_NAME}' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Error al buscar carpeta en Drive: ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create root folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: ROOT_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Carpeta principal de almacenamiento de galerías fotográficas de clientes para Lumina Studios',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Error al crear carpeta principal en Google Drive: ${err}`);
  }

  const newFolder = await createRes.json();
  try {
    await makeItemPublic(newFolder.id);
  } catch (e) {
    console.warn('No se pudo hacer pública la carpeta raíz:', e);
  }

  return newFolder.id;
}

/**
 * Lists all available folders in Google Drive so the photographer can pick one as a repository
 */
export async function listAvailableDriveFolders(): Promise<DriveFolderItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No hay sesión activa de Google Drive. Conecta tu cuenta primero con OAuth2.');
  }

  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=name&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al listar carpetas de Google Drive: ${err}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetches all photos from a specific Google Drive folder, ensures public read permissions,
 * and formats them into PhotoItem objects for the gallery.
 */
export async function listPhotosFromDriveFolder(folderId: string): Promise<PhotoItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No hay sesión de Google Drive activa.');
  }

  // Make folder publicly accessible by link
  makeItemPublic(folderId).catch(() => {});

  const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,webContentLink,webViewLink,thumbnailLink,imageMediaMetadata)&pageSize=200`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al leer fotos de la carpeta de Drive: ${err}`);
  }

  const data = await res.json();
  const files = data.files || [];

  const photos: PhotoItem[] = files.map((file: any) => {
    // Ensure public permission so anyone with the link can view & download without login
    makeItemPublic(file.id).catch(() => {});

    // Google Drive high-resolution thumbnail endpoint (accessible by link when public)
    const highResThumb = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`;
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;

    return {
      id: `drive-${file.id}`,
      name: file.name,
      webUrl: highResThumb,
      originalUrl: directDownloadUrl,
      driveFileId: file.id,
      driveDownloadUrl: directDownloadUrl,
      driveWebViewUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
      width: file.imageMediaMetadata?.width || 2400,
      height: file.imageMediaMetadata?.height || 1600,
      sizeBytes: parseInt(file.size || '3500000', 10),
      dateAdded: new Date().toISOString(),
    };
  });

  return photos;
}

/**
 * Creates or retrieves a subfolder for a specific gallery
 */
export async function getOrCreateGalleryFolder(galleryTitle: string, rootFolderId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('No hay sesión activa de Google.');

  const folderName = `Galería - ${galleryTitle.trim()}`;
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and '${rootFolderId}' in parents and trashed = false`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create subfolder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Error al crear subcarpeta de galería: ${err}`);
  }

  const folder = await createRes.json();
  await makeItemPublic(folder.id).catch(() => {});
  return folder.id;
}

/**
 * Makes a file or folder readable by anyone with the link
 */
export async function makeItemPublic(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;

  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
      allowFileDiscovery: false,
    }),
  });
}

/**
 * Uploads an image file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  fileBlob: Blob,
  fileName: string,
  parentFolderId?: string,
  onProgress?: (percent: number) => void
): Promise<DriveUploadResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Se requiere autenticación de Google Drive para subir imágenes.');
  }

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: fileBlob.type || 'image/jpeg',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const arrayBuffer = await fileBlob.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  const header = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}${delimiter}Content-Type: ${fileBlob.type || 'image/jpeg'}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;

  // Convert binary to base64
  let binary = '';
  const len = fileBytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = fileBytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64Data = btoa(binary);

  const multipartRequestBody = header + base64Data + closeDelimiter;

  if (onProgress) onProgress(40);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webContentLink,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (onProgress) onProgress(80);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fallo al subir a Google Drive (${response.status}): ${errorText}`);
  }

  const fileData = await response.json();
  const fileId = fileData.id;

  // Make public so download links work seamlessly for clients without login
  await makeItemPublic(fileId).catch(() => {});

  if (onProgress) onProgress(100);

  const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  return {
    id: fileId,
    name: fileData.name || fileName,
    webContentLink: fileData.webContentLink || directDownloadUrl,
    webViewLink: fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    directDownloadUrl,
  };
}

/**
 * Deletes a file from Drive with safe explicit call
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok;
}
