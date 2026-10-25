import React, { useState } from 'react';
import { Lock, Unlock, X, KeyRound, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
  galleryTitle: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  galleryTitle,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setHasError(true);
      setErrorMessage('Por favor ingresa el código PIN.');
      return;
    }

    if (correctPin && pinInput.trim() !== correctPin.trim()) {
      setHasError(true);
      setErrorMessage('El código PIN ingresado es incorrecto.');
      setPinInput('');
      return;
    }

    // Success
    setHasError(false);
    onSuccess();
    onClose();
  };

  const handleDigitClick = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      setHasError(false);
      if (correctPin && next === correctPin) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 200);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-neutral-900/95 border border-amber-500/30 rounded-2xl shadow-2xl text-neutral-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-serif text-white mb-2">Galería Protegida</h3>
          <p className="text-sm text-neutral-400">
            Para desbloquear las descargas originales y el archivo ZIP de{' '}
            <span className="text-amber-200 font-medium">"{galleryTitle}"</span>, introduce el PIN proporcionado por el fotógrafo.
          </p>
        </div>

        {/* Visual PIN circles */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                pinInput.length > idx
                  ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                  : 'border-neutral-700 bg-neutral-800/80'
              }`}
            />
          ))}
        </div>

        {hasError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setHasError(false);
              }}
              placeholder="Ingresa PIN numérico"
              className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] font-mono bg-neutral-950/80 border border-neutral-700 rounded-xl focus:outline-none focus:border-amber-400 text-white placeholder:text-neutral-600 placeholder:tracking-normal"
              autoFocus
            />
          </div>
        </form>

        {/* Interactive Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-12 rounded-xl bg-neutral-800/70 hover:bg-neutral-700/80 active:scale-95 text-lg font-medium text-neutral-200 border border-neutral-800 transition flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPinInput('')}
            className="h-12 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 text-xs text-neutral-400 border border-neutral-800/50 transition flex items-center justify-center"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-12 rounded-xl bg-neutral-800/70 hover:bg-neutral-700/80 active:scale-95 text-lg font-medium text-neutral-200 border border-neutral-800 transition flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDeleteDigit}
            className="h-12 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 text-sm text-neutral-400 border border-neutral-800/50 transition flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Unlock className="w-4 h-4" />
            Desbloquear
          </button>
        </div>
      </div>
    </div>
  );
};
