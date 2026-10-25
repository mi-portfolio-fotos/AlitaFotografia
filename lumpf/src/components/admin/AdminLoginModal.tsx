import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Lock, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import {
  googleSignIn,
  loginWithFirebasePassword,
  DEFAULT_PHOTOGRAPHER_EMAIL,
  DEFAULT_PHOTOGRAPHER_UID,
} from '../../services/firebaseAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string) => void;
  authorizedEmail: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  authorizedEmail,
}) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(authorizedEmail || DEFAULT_PHOTOGRAPHER_EMAIL);
  const [error, setError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  if (!isOpen) return null;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor ingresa la clave de fotógrafo registrada en Firebase.');
      return;
    }

    setIsSubmittingPassword(true);
    setError('');

    try {
      const user = await loginWithFirebasePassword(password, email);
      onSuccess(user.email || email);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión con Firebase.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setIsGoogleSigningIn(true);
    setError('');
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        const loggedEmail = (res.user.email || '').toLowerCase().trim();
        const targetEmail = (authorizedEmail || DEFAULT_PHOTOGRAPHER_EMAIL).toLowerCase().trim();

        if (targetEmail && loggedEmail !== targetEmail) {
          setError(
            `Acceso denegado: La cuenta ${loggedEmail} no tiene permisos de administrador. Solo la cuenta autorizada (${targetEmail}) puede acceder.`
          );
          return;
        }

        onSuccess(loggedEmail);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Inicio de sesión cancelado.');
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setError(
          `Dominio no autorizado en Firebase. Para usar Google Popup, agrega "${window.location.hostname}" en Firebase Console > Authentication > Settings > Authorized Domains. También puedes entrar directamente con tu clave de Firebase arriba.`
        );
      } else {
        setError('Error al autenticar con Google: ' + (err.message || 'Intente nuevamente'));
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-serif text-white">Acceso Exclusivo Fotógrafo</h3>
          <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
            Inicia sesión con la clave registrada en Firebase (Alita Fotografía) o con tu cuenta de Google verificada.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Firebase Password Login Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1">
              Usuario Fotógrafo (Firebase Auth)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-neutral-300 font-medium">
                Clave de Acceso (Firebase Console)
              </label>
              <span className="text-[10px] text-amber-400/80 font-mono">
                UID: {DEFAULT_PHOTOGRAPHER_UID.slice(0, 8)}...
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Ingresa tu clave de Firebase"
                className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 text-white placeholder:text-neutral-600"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingPassword}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmittingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verificando en Firebase...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Entrar al Panel de Fotógrafo <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 uppercase tracking-widest font-mono">
            o con Google
          </span>
          <div className="border-t border-neutral-800 w-full" />
        </div>

        {/* Google Secure Login Button */}
        <button
          onClick={handleGoogleAdminLogin}
          disabled={isGoogleSigningIn}
          className="w-full py-2.5 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-white flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          {isGoogleSigningIn ? 'Conectando...' : 'Iniciar Sesión con Google'}
        </button>
      </div>
    </div>
  );
};
