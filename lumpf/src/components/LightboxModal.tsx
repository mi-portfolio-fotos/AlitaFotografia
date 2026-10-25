import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Lock,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { PhotoItem } from '../types';
import { downloadSinglePhoto } from '../services/zipExporter';

interface LightboxModalProps {
  isOpen: boolean;
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
  onRequestPinUnlock: () => void;
  isPinUnlocked: boolean;
  galleryRequiresPin: boolean;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onIndexChange,
  onRequestPinUnlock,
  isPinUnlocked,
  galleryRequiresPin,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || !currentPhoto) return null;

  const handleNext = () => {
    setIsZoomed(false);
    onIndexChange((currentIndex + 1) % photos.length);
  };

  const handlePrev = () => {
    setIsZoomed(false);
    onIndexChange((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleDownload = async (format: 'web' | 'original') => {
    if (format === 'original' && galleryRequiresPin && !isPinUnlocked) {
      onRequestPinUnlock();
      return;
    }

    setIsDownloading(true);
    try {
      await downloadSinglePhoto(currentPhoto, format);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-fadeIn text-neutral-100 select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-neutral-800/80 bg-neutral-950/60 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-wider text-neutral-400">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="hidden sm:inline text-xs text-neutral-300 truncate max-w-[200px]">
            {currentPhoto.name}
          </span>
          {currentPhoto.driveFileId && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <Cloud className="w-3 h-3" /> Drive
            </span>
          )}
        </div>

        {/* Download & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition"
            title={isZoomed ? 'Alejar' : 'Acercar zoom'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* Web Download */}
          <button
            onClick={() => handleDownload('web')}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700 transition"
            title="Descargar en tamaño optimizado para redes y web"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden md:inline">Descargar</span> Web
          </button>

          {/* Original High-Res Download */}
          <button
            onClick={() => handleDownload('original')}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition"
            title="Descargar en resolución original de alta fidelidad"
          >
            {galleryRequiresPin && !isPinUnlocked ? (
              <Lock className="w-3.5 h-3.5 text-neutral-900" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
            )}
            <span className="hidden md:inline">Descargar</span> Original
          </button>

          {currentPhoto.driveWebViewUrl && (
            <a
              href={currentPhoto.driveWebViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition"
              title="Abrir en Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-500/20 hover:text-rose-400 border border-neutral-800 transition"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Image Display */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-20 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-white transition hover:scale-105"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-white transition hover:scale-105"
            aria-label="Siguiente foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <div
          className={`relative max-w-full max-h-full transition-transform duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentPhoto.webUrl}
            alt={currentPhoto.name}
            className="max-h-[82vh] max-w-[92vw] object-contain mx-auto shadow-2xl rounded-sm pointer-events-auto"
            loading="eager"
          />
        </div>
      </div>

      {/* Footer Info */}
      <footer className="px-6 py-2.5 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
        <div>
          <span>Dimensiones: {currentPhoto.width} × {currentPhoto.height} px</span>
          <span className="mx-2 text-neutral-700">•</span>
          <span>Tamaño orig: ~{(currentPhoto.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
        </div>
        <div className="flex items-center gap-2">
          {galleryRequiresPin && (
            <span
              className={`inline-flex items-center gap-1 ${
                isPinUnlocked ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isPinUnlocked ? (
                <>Descarga original autorizada</>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> PIN requerido para original
                </>
              )}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};
