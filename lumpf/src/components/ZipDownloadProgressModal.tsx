import React, { useEffect } from 'react';
import { Download, CheckCircle, Loader2, Sparkles, FolderArchive } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ZipDownloadProgressModalProps {
  isOpen: boolean;
  progress: number;
  statusText: string;
  isComplete: boolean;
  onClose: () => void;
  format: 'web' | 'original';
  itemCount: number;
}

export const ZipDownloadProgressModal: React.FC<ZipDownloadProgressModalProps> = ({
  isOpen,
  progress,
  statusText,
  isComplete,
  onClose,
  format,
  itemCount,
}) => {
  useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#d97706'],
      });
    }
  }, [isComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-center text-neutral-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          {isComplete ? (
            <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : (
            <FolderArchive className="w-8 h-8 text-amber-400 animate-pulse" />
          )}
        </div>

        <h3 className="text-xl font-semibold mb-1">
          {isComplete ? '¡Descarga Lista!' : 'Preparando Paquete ZIP'}
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          {itemCount} fotos en resolución {format === 'original' ? 'Original (Google Drive / Alta Fidelidad)' : 'Web Optimizada'}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-800 rounded-full h-3 mb-3 overflow-hidden p-0.5 border border-neutral-700">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isComplete
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                : 'bg-gradient-to-r from-amber-500 to-amber-300'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-neutral-400 mb-6 font-mono">
          <span className="truncate max-w-[280px] text-left">{statusText}</span>
          <span className="font-semibold text-amber-400 ml-2">{progress}%</span>
        </div>

        {isComplete ? (
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Entendido, cerrar
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            Por favor mantén esta ventana abierta mientras se compila el archivo...
          </div>
        )}
      </div>
    </div>
  );
};
