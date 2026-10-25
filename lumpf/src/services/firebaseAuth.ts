import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const DEFAULT_PHOTOGRAPHER_EMAIL = 'alita68.fotos@gmail.com';
export const DEFAULT_PHOTOGRAPHER_UID = 'xwTzAyeSVIP3k4o3HZp4gPnHy5k2';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in using the photographer password registered in Firebase Console
 * for user UID xwTzAyeSVIP3k4o3HZp4gPnHy5k2 (alita68.fotos@gmail.com)
 */
export const loginWithFirebasePassword = async (
  password: string,
  email: string = DEFAULT_PHOTOGRAPHER_EMAIL
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error al iniciar sesión con Firebase Password:', error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('La clave de acceso ingresada es incorrecta.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error(`El usuario ${email} no se encuentra registrado en Firebase Authentication.`);
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Inténtalo de nuevo más tarde.');
    }
    throw new Error(error.message || 'Error al autenticar en Firebase.');
  }
};

/**
 * Changes the photographer password directly in Firebase Authentication
 */
export const changeFirebasePassword = async (
  newPassword: string,
  oldPassword?: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No hay una sesión activa de fotógrafo en Firebase.');
  }

  if (newPassword.length < 6) {
    throw new Error('La nueva clave debe tener al menos 6 caracteres.');
  }

  try {
    // If oldPassword is provided and user has password provider, reauthenticate first
    if (oldPassword && user.email) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
    }

    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Error al actualizar contraseña en Firebase:', error);
    if (error.code === 'auth/requires-recent-login') {
      throw new Error(
        'Por seguridad, debes haber iniciado sesión recientemente para cambiar la clave. Cierra sesión y vuelve a entrar.'
      );
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('La clave actual ingresada es incorrecta.');
    }
    throw new Error(error.message || 'Error al cambiar la clave en Firebase.');
  }
};

/**
 * Sign in with Google to obtain OAuth2 token for Google Drive
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso OAuth2 de Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al conectar Google OAuth2:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setManualAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const logoutAdmin = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
