import React, { useState } from 'react';
import {
  Gallery,
  PhotoItem,
  SiteSettings,
} from '../types';
import {
  ArrowLeft,
  Calendar,
  Download,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  Share2,
  FolderArchive,
  Image as ImageIcon,
  User,
  Check,
} from 'lucide-react';
import { LightboxModal } from './LightboxModal';
import { PinModal } from './PinModal';
import { ZipDownloadProgressModal } from './ZipDownloadProgressModal';
import { downloadPhotosAsZip, downloadSinglePhoto } from '../services/zipExporter';
import { FONT_CLASSES } from '../utils/theme';

interface GalleryDetailViewProps {
  gallery: Gallery;
  settings: SiteSettings;
  onBack: () => void;
}

export const GalleryDetailView: React.FC<GalleryDetailViewProps> = ({
  gallery,
  settings,
  onBack,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(!gallery.pinCode);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // ZIP progress state
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [zipIsComplete, setZipIsComplete] = useState(false);
  const [zipFormat, setZipFormat] = useState<'web' | 'original'>('original');
  const [zipCount, setZipCount] = useState(0);

  // Feedback toast for link copied
  const [copiedLink, setCopiedLink] = useState(false);

  const font = FONT_CLASSES[settings.activeFont];

  const handleToggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotoIds.size === gallery.photos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(gallery.photos.map((p) => p.id)));
    }
  };

  const handleStartZipDownload = async (format: 'web' | 'original', onlySelected: boolean = false) => {
    // If format is original or user wants full package and PIN is set and not unlocked:
    if (gallery.pinCode && !isPinUnlocked && format === 'original') {
      setIsPinModalOpen(true);
      return;
    }

    const photosToDownload = onlySelected && selectedPhotoIds.size > 0
      ? gallery.photos.filter((p) => selectedPhotoIds.has(p.id))
      : gallery.photos;

    if (photosToDownload.length === 0) return;

    setZipFormat(format);
    setZipCount(photosToDownload.length);
    setZipProgress(5);
    setZipStatusText('Iniciando descarga por lotes...');
    setZipIsComplete(false);
    setIsZipModalOpen(true);

    try {
      await downloadPhotosAsZip(
        photosToDownload,
        gallery.title,
        format,
        (progress, status) => {
          setZipProgress(progress);
          setZipStatusText(status);
        }
      );
      setZipIsComplete(true);
    } catch (err) {
      console.error('Error al generar ZIP:', err);
      setZipStatusText('Ocurrió un error al compilar el archivo ZIP.');
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-28">
      {/* Cinematic Cover Header */}
      <section className="relative h-[55vh] min-h-[420px] max-h-[640px] w-full overflow-hidden">
        <img
          src={gallery.coverImage}
          alt={gallery.title}
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/40" />

        {/* Top Floating Bar */}
        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur-md border border-neutral-700/80 text-xs font-medium text-neutral-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Galerías
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur-md border border-neutral-700/80 text-xs text-neutral-300 transition"
              title="Copiar enlace de la galería"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </>
              )}
            </button>

            {gallery.pinCode && (
              <button
                onClick={() => {
                  if (!isPinUnlocked) setIsPinModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full backdrop-blur-md border text-xs font-mono transition ${
                  isPinUnlocked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                {isPinUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PIN Desbloqueado</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>PIN Requerido</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Hero Info */}
        <div className="absolute bottom-8 left-4 sm:left-12 right-4 sm:right-12 z-20 space-y-3 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-wider text-amber-400 uppercase">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
              {gallery.category}
            </span>
            <span className="text-neutral-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {gallery.sessionDate}
            </span>
            <span className="text-neutral-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {gallery.clientName}
            </span>
          </div>

          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-normal text-white drop-shadow-md leading-tight ${font.heading}`}
          >
            {gallery.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
            {gallery.description}
          </p>
        </div>
      </section>

      {/* Actions and Download Bar */}
      <section className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-xl border-y border-neutral-800/80 px-4 sm:px-12 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Photos count & Selection status */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-mono text-neutral-300">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <strong>{gallery.photos.length}</strong> Fotografías
            </span>

            {isSelectMode && (
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-amber-300 font-mono text-xs border border-neutral-700">
                {selectedPhotoIds.size} seleccionadas
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedPhotoIds(new Set());
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
                isSelectMode
                  ? 'bg-neutral-800 border-amber-500/40 text-amber-300'
                  : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {isSelectMode ? (
                <>
                  <CheckSquare className="w-4 h-4 text-amber-400" /> Modo Selección Activo
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" /> Seleccionar Fotos
                </>
              )}
            </button>

            {isSelectMode && (
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 border border-neutral-700 transition"
              >
                {selectedPhotoIds.size === gallery.photos.length ? 'Desmarcar Todas' : 'Seleccionar Todas'}
              </button>
            )}

            {/* Mass Download Web */}
            <button
              onClick={() => handleStartZipDownload('web', isSelectMode)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition cursor-pointer"
              title="Descargar fotos seleccionadas o todas en formato Web optimizado (ZIP)"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              ZIP Web ({isSelectMode && selectedPhotoIds.size > 0 ? selectedPhotoIds.size : gallery.photos.length})
            </button>

            {/* Mass Download Original */}
            <button
              onClick={() => handleStartZipDownload('original', isSelectMode)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition cursor-pointer"
              title="Descargar fotos en resolución original de alta fidelidad desde Google Drive (ZIP)"
            >
              {gallery.pinCode && !isPinUnlocked ? (
                <Lock className="w-4 h-4 text-black" />
              ) : (
                <FolderArchive className="w-4 h-4 text-black" />
              )}
              ZIP Original {gallery.pinCode && !isPinUnlocked ? '(Bloqueado)' : ''}
            </button>

            {/* Google Drive folder link if connected */}
            {gallery.driveFolderId && (
              <a
                href={`https://drive.google.com/drive/folders/${gallery.driveFolderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium transition"
                title="Abrir carpeta de esta galería en Google Drive"
              >
                <ExternalLink className="w-4 h-4" /> Drive
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Grid of session photos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-12 py-12">
        {gallery.photos.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-neutral-800 rounded-2xl">
            <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-300">Esta galería no tiene fotos todavía</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Accede al panel de administración para subir imágenes con marca de agua y sincronización en Google Drive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {gallery.photos.map((photo, index) => {
              const isSelected = selectedPhotoIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-xl overflow-hidden bg-neutral-900 border transition-all duration-300 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[0.98]'
                      : 'border-neutral-800/80 hover:border-amber-500/40 hover:shadow-xl'
                  }`}
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (isSelectMode) {
                        handleToggleSelectPhoto(photo.id);
                      } else {
                        setLightboxIndex(index);
                      }
                    }}
                  >
                    <img
                      src={photo.webUrl}
                      alt={photo.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Checkbox trigger */}
                    <div
                      className={`absolute top-3 left-3 z-20 ${
                        isSelectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectPhoto(photo.id);
                      }}
                    >
                      <button className="p-1 rounded-md bg-black/60 backdrop-blur-md border border-neutral-700 text-white hover:border-amber-400">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-300" />
                        )}
                      </button>
                    </div>

                    {/* Photo dimensions & Drive badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.driveFileId && (
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-blue-300 border border-blue-500/30">
                          Drive
                        </span>
                      )}
                    </div>

                    {/* Hover action bar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <span className="text-[11px] font-mono text-neutral-300 truncate max-w-[140px]">
                        {photo.name}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Download Web */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSinglePhoto(photo, 'web');
                          }}
                          className="p-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition"
                          title="Descargar versión web"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Download Original */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (gallery.pinCode && !isPinUnlocked) {
                              setIsPinModalOpen(true);
                            } else {
                              downloadSinglePhoto(photo, 'original');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black shadow transition"
                          title="Descargar versión original"
                        >
                          {gallery.pinCode && !isPinUnlocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <LightboxModal
          isOpen={true}
          photos={gallery.photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={(idx) => setLightboxIndex(idx)}
          galleryRequiresPin={!!gallery.pinCode}
          isPinUnlocked={isPinUnlocked}
          onRequestPinUnlock={() => setIsPinModalOpen(true)}
        />
      )}

      {/* PIN Security Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        correctPin={gallery.pinCode}
        galleryTitle={gallery.title}
        onSuccess={() => {
          setIsPinUnlocked(true);
        }}
      />

      {/* ZIP Packaging Progress Modal */}
      <ZipDownloadProgressModal
        isOpen={isZipModalOpen}
        progress={zipProgress}
        statusText={zipStatusText}
        isComplete={zipIsComplete}
        format={zipFormat}
        itemCount={zipCount}
        onClose={() => setIsZipModalOpen(false)}
      />
    </div>
  );
};
