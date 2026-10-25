import React, { useState, useRef, useEffect } from 'react';
import {
  Gallery,
  PhotoItem,
  WatermarkConfig,
  LayoutType,
} from '../../types';
import {
  X,
  Upload,
  Image as ImageIcon,
  Lock,
  Trash2,
  Check,
  Star,
  Cloud,
  Loader2,
  Layers,
  Sliders,
  AlertCircle,
  FolderOpen,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { processImageForWeb } from '../../services/imageProcessor';
import {
  getOrCreateRootFolder,
  getOrCreateGalleryFolder,
  uploadFileToDrive,
  listAvailableDriveFolders,
  listPhotosFromDriveFolder,
  DriveFolderItem,
} from '../../services/googleDrive';
import { getAccessToken, googleSignIn } from '../../services/firebaseAuth';

interface GalleryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gallery: Gallery) => void;
  initialGallery?: Gallery | null;
  defaultWatermark: WatermarkConfig;
}

export const GalleryEditorModal: React.FC<GalleryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGallery,
  defaultWatermark,
}) => {
  const isEditing = !!initialGallery;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialGallery?.title || '');
  const [clientName, setClientName] = useState(initialGallery?.clientName || '');
  const [sessionDate, setSessionDate] = useState(
    initialGallery?.sessionDate || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<Gallery['category']>(
    initialGallery?.category || 'Bodas'
  );
  const [description, setDescription] = useState(initialGallery?.description || '');
  const [pinCode, setPinCode] = useState(initialGallery?.pinCode || '');
  const [enablePin, setEnablePin] = useState(!!initialGallery?.pinCode);
  const [layoutOverride, setLayoutOverride] = useState<LayoutType | undefined>(
    initialGallery?.layoutOverride
  );

  // Google Drive Folder State
  const [driveFolderId, setDriveFolderId] = useState<string | undefined>(
    initialGallery?.driveFolderId
  );
  const [driveFolderName, setDriveFolderName] = useState<string | undefined>(
    initialGallery?.driveFolderName
  );
  const [availableFolders, setAvailableFolders] = useState<DriveFolderItem[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  // Watermark State
  const [watermark, setWatermark] = useState<WatermarkConfig>(
    initialGallery?.watermarkConfig || { ...defaultWatermark }
  );

  // Photos State
  const [photos, setPhotos] = useState<PhotoItem[]>(initialGallery?.photos || []);
  const [coverImage, setCoverImage] = useState(initialGallery?.coverImage || '');

  // Upload progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Load available Google Drive folders if token is available
  useEffect(() => {
    if (isOpen) {
      getAccessToken().then((token) => {
        setIsDriveConnected(!!token);
        if (token) {
          fetchFolders();
        }
      });
    }
  }, [isOpen]);

  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const folders = await listAvailableDriveFolders();
      setAvailableFolders(folders);
    } catch (err: any) {
      console.warn('Error al obtener carpetas:', err.message);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleConnectDriveOAuth = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setIsDriveConnected(true);
        await fetchFolders();
        setSuccessNotice('Google Drive conectado exitosamente con OAuth2.');
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setErrorMessage(
          `Dominio no autorizado en Firebase: Agrega "${window.location.hostname}" en Firebase Console > Authentication > Settings > Authorized Domains.`
        );
      } else {
        setErrorMessage('Error al autorizar Google Drive: ' + err.message);
      }
    }
  };

  const handleSelectDriveFolder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setDriveFolderId(undefined);
      setDriveFolderName(undefined);
      return;
    }
    const found = availableFolders.find((f) => f.id === selectedId);
    setDriveFolderId(selectedId);
    setDriveFolderName(found?.name || 'Carpeta seleccionada');
  };

  // Sync photos from the selected Google Drive folder
  const handleSyncPhotosFromDrive = async () => {
    if (!driveFolderId) {
      setErrorMessage('Selecciona primero una carpeta de Google Drive.');
      return;
    }

    setIsSyncingDrive(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const drivePhotos = await listPhotosFromDriveFolder(driveFolderId);
      if (drivePhotos.length === 0) {
        setErrorMessage(
          'No se encontraron imágenes en la carpeta de Google Drive seleccionada.'
        );
        return;
      }

      // Merge avoiding duplicates by driveFileId
      const existingIds = new Set(photos.map((p) => p.driveFileId || p.id));
      const newItems = drivePhotos.filter((p) => !existingIds.has(p.driveFileId || p.id));

      const updated = [...photos, ...newItems];
      setPhotos(updated);

      if (!coverImage && updated.length > 0) {
        setCoverImage(updated[0].webUrl);
      }

      setSuccessNotice(
        `¡Se sincronizaron ${newItems.length} fotografías desde Google Drive! (Total en galería: ${updated.length})`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Error al sincronizar fotos desde Google Drive: ' + err.message);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessNotice('');
    const totalFiles = files.length;
    const newPhotos: PhotoItem[] = [];

    let targetDriveFolderId = driveFolderId;

    try {
      const token = await getAccessToken();

      // If no folder assigned yet, create one in root folder
      if (token && !targetDriveFolderId) {
        setUploadStatus('Creando subcarpeta en tu Google Drive...');
        try {
          const rootFolderId = await getOrCreateRootFolder();
          targetDriveFolderId = await getOrCreateGalleryFolder(title || 'Nueva Galeria', rootFolderId);
          setDriveFolderId(targetDriveFolderId);
          setDriveFolderName(`Galería - ${title || 'Nueva Galería'}`);
        } catch (err: any) {
          console.warn('Google Drive subcarpeta no creada:', err.message);
        }
      }

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const stepPercent = Math.round(((i) / totalFiles) * 100);
        setUploadPercent(stepPercent);
        setUploadStatus(`Procesando foto ${i + 1} de ${totalFiles}: ${file.name}`);

        // 1. Process for Web (Canvas resizing + optional watermark)
        const processed = await processImageForWeb(file, watermark, 1600, 0.84);

        let driveFileId: string | undefined;
        let driveDownloadUrl: string | undefined;
        let driveWebViewUrl: string | undefined;

        // 2. Upload original to Google Drive if connected
        if (token && targetDriveFolderId) {
          setUploadStatus(`Subiendo archivo original a Google Drive: ${file.name}...`);
          try {
            const driveResult = await uploadFileToDrive(
              processed.originalBlob,
              file.name,
              targetDriveFolderId
            );
            driveFileId = driveResult.id;
            driveDownloadUrl = driveResult.directDownloadUrl;
            driveWebViewUrl = driveResult.webViewLink;
          } catch (driveErr) {
            console.error('Error al subir a Drive:', driveErr);
          }
        }

        const photoItem: PhotoItem = {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          webUrl: processed.webUrl,
          originalUrl: driveDownloadUrl || processed.originalUrl,
          driveFileId,
          driveDownloadUrl,
          driveWebViewUrl,
          width: processed.width,
          height: processed.height,
          sizeBytes: processed.sizeBytes,
          dateAdded: new Date().toISOString(),
          hasWatermark: watermark.enabled,
        };

        newPhotos.push(photoItem);
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);

      if (!coverImage && updatedPhotos.length > 0) {
        setCoverImage(updatedPhotos[0].webUrl);
      }

      setUploadPercent(100);
      setSuccessNotice(`¡Se subieron y procesaron ${newPhotos.length} fotos con éxito!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Error al procesar imágenes: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetCover = (photoUrl: string) => {
    setCoverImage(photoUrl);
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    setPhotos(updated);
    if (coverImage && !updated.some((p) => p.webUrl === coverImage)) {
      setCoverImage(updated.length > 0 ? updated[0].webUrl : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('El título de la galería es obligatorio.');
      return;
    }

    const currentCover =
      coverImage ||
      (photos.length > 0
        ? photos[0].webUrl
        : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85');

    const finalGallery: Gallery = {
      id: initialGallery?.id || `gal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      clientName: clientName.trim() || 'Cliente Especial',
      sessionDate,
      category,
      description: description.trim(),
      coverImage: currentCover,
      pinCode: enablePin && pinCode.trim() ? pinCode.trim() : undefined,
      layoutOverride,
      watermarkConfig: watermark,
      photos,
      driveFolderId,
      driveFolderName,
      createdAt: initialGallery?.createdAt || new Date().toISOString(),
    };

    onSave(finalGallery);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-neutral-100 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {isEditing ? 'Editar Galería de Sesión' : 'Nueva Galería de Clientes'}
            </h3>
            <p className="text-xs text-neutral-400">
              Configura detalles, carpeta de Google Drive, fotos sincronizadas y descargas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form id="galleryForm" onSubmit={handleSubmit} className="space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">
                  Título de la Galería *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Boda Valentina & Rodrigo"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">
                  Nombre del Cliente / Novios *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ej. Valentina & Rodrigo"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">
                  Fecha de la Sesión
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Bodas">Bodas</option>
                  <option value="Editorial">Editorial</option>
                  <option value="Retrato">Retrato</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Fine Art">Fine Art</option>
                  <option value="Moda">Moda</option>
                  <option value="Maternidad">Maternidad</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1">
                Descripción / Historia de la Sesión
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve reseña sobre la localización, ambiente y estilo visual..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Google Drive Repository Assignment Section */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-blue-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  Carpeta Repositorio en Google Drive
                </label>

                {!isDriveConnected && (
                  <button
                    type="button"
                    onClick={handleConnectDriveOAuth}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition"
                  >
                    <Cloud className="w-3.5 h-3.5" /> Conectar con Google Drive
                  </button>
                )}
              </div>

              {isDriveConnected ? (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <select
                        value={driveFolderId || ''}
                        onChange={handleSelectDriveFolder}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="">-- Seleccionar carpeta de Google Drive --</option>
                        {availableFolders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            📁 {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={fetchFolders}
                      disabled={isLoadingFolders}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-neutral-300 flex items-center justify-center gap-1.5 transition"
                      title="Refrescar lista de carpetas de Drive"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFolders ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refrescar</span>
                    </button>

                    {driveFolderId && (
                      <button
                        type="button"
                        onClick={handleSyncPhotosFromDrive}
                        disabled={isSyncingDrive}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow transition"
                        title="Importar y sincronizar todas las fotos desde esta carpeta de Google Drive"
                      >
                        {isSyncingDrive ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sincronizando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Sincronizar Fotos de Drive
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {driveFolderId && (
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
                      <span>ID Carpeta: <code className="text-amber-300">{driveFolderId}</code></span>
                      <a
                        href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Abrir en Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Al sincronizar, las fotos de tu carpeta de Google Drive se mostrarán directamente en la galería y tus clientes podrán descargarlas en alta resolución mediante enlace público directo sin necesidad de iniciar sesión en Google.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-400">
                  Conecta tu cuenta de Google Drive para seleccionar una carpeta existente y vincular las imágenes originales sin compresión.
                </p>
              )}
            </div>

            {/* PIN Protection & Layout Override */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePin}
                      onChange={(e) => setEnablePin(e.target.checked)}
                      className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
                    />
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Proteger Descargas con PIN de Cliente
                  </label>
                </div>
                {enablePin && (
                  <input
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="ej. 4829"
                    className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm font-mono text-amber-300 tracking-wider focus:outline-none focus:border-amber-400"
                  />
                )}
                <p className="text-[11px] text-neutral-500 mt-1">
                  Los clientes deberán ingresar este PIN para descargar fotos en original o generar el ZIP.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-200 mb-1.5 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Diseño de Galería (Layout)
                </label>
                <select
                  value={layoutOverride || ''}
                  onChange={(e) =>
                    setLayoutOverride((e.target.value as LayoutType) || undefined)
                  }
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Usar diseño global del sitio</option>
                  <option value="editorial">Editorial / Minimalista (Revista)</option>
                  <option value="immersive">Inmersivo (Pantalla Completa Oscuro)</option>
                  <option value="masonry">Masonry (Cuadrícula Estilo Pinterest)</option>
                </select>
              </div>
            </div>

            {/* Watermark Configuration */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermark.enabled}
                    onChange={(e) =>
                      setWatermark({ ...watermark, enabled: e.target.checked })
                    }
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
                  />
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Marca de Agua en Vistas Previas Web
                </label>
                <span className="text-[11px] text-neutral-400">
                  {watermark.enabled ? 'Activada' : 'Desactivada'}
                </span>
              </div>

              {watermark.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Texto de Marca de Agua
                    </label>
                    <input
                      type="text"
                      value={watermark.text}
                      onChange={(e) =>
                        setWatermark({ ...watermark, text: e.target.value })
                      }
                      placeholder="ej. © Lumina Studios"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Posición</label>
                    <select
                      value={watermark.position}
                      onChange={(e) =>
                        setWatermark({
                          ...watermark,
                          position: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                    >
                      <option value="bottom-right">Esquina inferior derecha</option>
                      <option value="bottom-left">Esquina inferior izquierda</option>
                      <option value="top-right">Esquina superior derecha</option>
                      <option value="center">Centro diagonal (Anti-copia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Opacidad ({Math.round(watermark.opacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={watermark.opacity}
                      onChange={(e) =>
                        setWatermark({
                          ...watermark,
                          opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Batch Photo Upload Zone */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Fotografías en Galería ({photos.length})
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleBatchUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Subir Nuevas Fotos
                </button>
              </div>

              {/* Processing progress bar */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-neutral-300 font-mono">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      {uploadStatus}
                    </span>
                    <span className="font-mono text-amber-400">{uploadPercent}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Photos Grid */}
              {photos.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-800 hover:border-amber-500/40 rounded-xl p-8 text-center cursor-pointer bg-neutral-950/40 transition"
                >
                  <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-neutral-300">
                    Sube fotos desde tu equipo o selecciona una carpeta de Google Drive arriba
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Las fotos se optimizarán para navegación rápida y los originales se servirán de Google Drive.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                  {photos.map((p) => {
                    const isCover = coverImage === p.webUrl;

                    return (
                      <div
                        key={p.id}
                        className={`group relative aspect-[4/5] rounded-lg overflow-hidden border ${
                          isCover ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-neutral-800'
                        } bg-neutral-900`}
                      >
                        <img
                          src={p.webUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {isCover && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-black flex items-center gap-1 shadow">
                            <Star className="w-2.5 h-2.5 fill-current" /> Portada
                          </div>
                        )}

                        {p.driveFileId && (
                          <div className="absolute bottom-1.5 left-1.5 p-1 rounded bg-black/70 text-blue-300 text-[10px]">
                            <Cloud className="w-3 h-3" />
                          </div>
                        )}

                        {/* Hover controls */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(p.webUrl)}
                              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-200 border border-neutral-600 transition"
                            >
                              Hacer portada
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(p.id)}
                            className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 transition"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="galleryForm"
            disabled={isProcessing || isSyncingDrive}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isEditing ? 'Guardar Cambios' : 'Crear Galería'}
          </button>
        </div>
      </div>
    </div>
  );
};
