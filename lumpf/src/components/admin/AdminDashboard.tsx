import React, { useState, useEffect } from 'react';
import {
  Gallery,
  PhotoItem,
  SiteSettings,
  FontType,
  ThemeType,
  LayoutType,
} from '../../types';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Lock,
  Image as ImageIcon,
  Palette,
  Type,
  Layout,
  Cloud,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User,
  Sliders,
  LogOut,
  FolderOpen,
  Sparkles,
  Info,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Loader2,
} from 'lucide-react';
import { GalleryEditorModal } from './GalleryEditorModal';
import {
  googleSignIn,
  logoutAdmin,
  getAccessToken,
  getCurrentUser,
  changeFirebasePassword,
  DEFAULT_PHOTOGRAPHER_EMAIL,
  DEFAULT_PHOTOGRAPHER_UID,
} from '../../services/firebaseAuth';
import {
  getOrCreateRootFolder,
  listAvailableDriveFolders,
  listPhotosFromDriveFolder,
  DriveFolderItem,
} from '../../services/googleDrive';
import { THEMES, FONT_CLASSES } from '../../utils/theme';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  galleries: Gallery[];
  settings: SiteSettings;
  onUpdateGalleries: (galleries: Gallery[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  galleries,
  settings,
  onUpdateGalleries,
  onUpdateSettings,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'galleries' | 'styles' | 'drive' | 'security'>('galleries');

  // Gallery editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);

  // Drive state
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveUserEmail, setDriveUserEmail] = useState<string | null>(null);
  const [driveRootId, setDriveRootId] = useState<string | null>(
    settings.googleDriveRootFolderId || null
  );
  const [driveStatusMessage, setDriveStatusMessage] = useState<string>('');
  const [driveFolders, setDriveFolders] = useState<DriveFolderItem[]>([]);
  const [isLoadingDriveFolders, setIsLoadingDriveFolders] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Local settings copy
  const [formSettings, setFormSettings] = useState<SiteSettings>({ ...settings });
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Firebase password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setFormSettings({ ...settings });
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      getAccessToken().then((token) => {
        if (token) {
          setDriveStatusMessage('Conexión con Google Drive activa mediante OAuth2.');
          loadDriveFolders();
        }
      });
    }
  }, [isOpen]);

  const loadDriveFolders = async () => {
    setIsLoadingDriveFolders(true);
    try {
      const folders = await listAvailableDriveFolders();
      setDriveFolders(folders);
    } catch (err: any) {
      console.warn('Error al cargar carpetas de Drive:', err.message);
    } finally {
      setIsLoadingDriveFolders(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateNewGallery = () => {
    setEditingGallery(null);
    setIsEditorOpen(true);
  };

  const handleEditGallery = (gal: Gallery) => {
    setEditingGallery(gal);
    setIsEditorOpen(true);
  };

  const handleDeleteGallery = (galId: string, title: string) => {
    const confirm = window.confirm(
      `¿Estás seguro de que deseas eliminar la galería "${title}"? Esta acción eliminará los enlaces locales.`
    );
    if (!confirm) return;

    const next = galleries.filter((g) => g.id !== galId);
    onUpdateGalleries(next);
  };

  const handleSaveGallery = (savedGallery: Gallery) => {
    const exists = galleries.some((g) => g.id === savedGallery.id);
    let updated: Gallery[];
    if (exists) {
      updated = galleries.map((g) => (g.id === savedGallery.id ? savedGallery : g));
    } else {
      updated = [savedGallery, ...galleries];
    }
    onUpdateGalleries(updated);
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSettings(formSettings);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleConnectDrive = async () => {
    setIsConnectingDrive(true);
    setDriveStatusMessage('Iniciando autenticación OAuth2 con Google Drive...');
    try {
      const res = await googleSignIn();
      if (res) {
        setDriveUserEmail(res.user.email || 'Cuenta de Google Conectada');
        setDriveStatusMessage('Conectando con Google Drive y buscando carpetas...');
        const rootId = await getOrCreateRootFolder();
        setDriveRootId(rootId);

        const updatedSettings: SiteSettings = {
          ...formSettings,
          googleDriveConnected: true,
          googleDriveRootFolderId: rootId,
        };
        setFormSettings(updatedSettings);
        onUpdateSettings(updatedSettings);
        setDriveStatusMessage('¡Google Drive OAuth2 conectado exitosamente!');
        await loadDriveFolders();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setDriveStatusMessage(
          `UNAUTHORIZED_DOMAIN:${window.location.hostname}`
        );
      } else {
        setDriveStatusMessage('Error al conectar Google Drive: ' + (err.message || 'Error'));
      }
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleDisconnectDrive = async () => {
    const updatedSettings: SiteSettings = {
      ...formSettings,
      googleDriveConnected: false,
    };
    setFormSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
    setDriveUserEmail(null);
    setDriveFolders([]);
    setDriveStatusMessage('Google Drive ha sido desconectado.');
  };

  // Create a gallery pre-assigned to a specific Drive folder
  const handleCreateGalleryFromFolder = async (folder: DriveFolderItem) => {
    const cleanTitle = folder.name.replace(/^Galería - /i, '').replace(/^Galeria - /i, '');

    // Attempt to auto-fetch photos from this folder
    let importedPhotos: PhotoItem[] = [];
    try {
      importedPhotos = await listPhotosFromDriveFolder(folder.id);
    } catch (e) {
      console.warn('No se pudieron precargar fotos:', e);
    }

    const newGal: Gallery = {
      id: `gal-${Date.now()}`,
      title: cleanTitle,
      clientName: cleanTitle,
      sessionDate: new Date().toISOString().split('T')[0],
      category: 'Editorial',
      description: `Sesión de fotos almacenada en Google Drive (Carpeta: ${folder.name}).`,
      coverImage:
        importedPhotos.length > 0
          ? importedPhotos[0].webUrl
          : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      driveFolderId: folder.id,
      driveFolderName: folder.name,
      photos: importedPhotos,
      createdAt: new Date().toISOString(),
    };

    setEditingGallery(newGal);
    setIsEditorOpen(true);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (newPassword.length < 6) {
      setPasswordChangeError('La nueva clave debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('La nueva clave y la confirmación no coinciden.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeFirebasePassword(newPassword, oldPassword);
      setPasswordChangeSuccess('¡Clave de fotógrafo actualizada correctamente en Firebase Console!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Error al cambiar la clave en Firebase.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentUser = getCurrentUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl text-neutral-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Panel de Administración <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono">Alita Fotografía</span>
              </h2>
              <p className="text-xs text-neutral-400">
                {currentUser?.email || formSettings.adminEmail} • {galleries.length} Galerías
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await logoutAdmin();
                onLogoutAdmin();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-xs text-neutral-300 transition"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('galleries')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'galleries'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Gestor de Galerías ({galleries.length})
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'drive'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cloud className="w-4 h-4" /> Google Drive OAuth2
            {formSettings.googleDriveConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('styles')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'styles'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Palette className="w-4 h-4" /> Diseño, Marca & Tipografías
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Seguridad & Clave Firebase
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/60">
          {/* TAB 1: Gestor de Galerías */}
          {activeTab === 'galleries' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Tus Galerías de Clientes</h3>
                  <p className="text-xs text-neutral-400">
                    Crea sesiones, vincula carpetas de Google Drive y asigna protección con PIN.
                  </p>
                </div>

                <button
                  onClick={handleCreateNewGallery}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Crear Nueva Galería
                </button>
              </div>

              {galleries.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-neutral-800 rounded-2xl">
                  <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-300">No hay galerías creadas aún</p>
                  <button
                    onClick={handleCreateNewGallery}
                    className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-semibold"
                  >
                    Crear la primera galería
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galleries.map((gal) => (
                    <div
                      key={gal.id}
                      className="flex gap-4 p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition"
                    >
                      <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
                        <img
                          src={gal.coverImage}
                          alt={gal.title}
                          className="w-full h-full object-cover"
                        />
                        {gal.pinCode && (
                          <div className="absolute top-1.5 left-1.5 p-1 rounded bg-black/70 text-amber-300">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {gal.category}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {gal.sessionDate}
                            </span>
                          </div>

                          <h4 className="text-sm font-medium text-white truncate mt-1">
                            {gal.title}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">
                            Cliente: {gal.clientName}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                            {gal.photos.length} Fotos {gal.pinCode ? `• PIN: ${gal.pinCode}` : '• Descarga libre'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 mt-2">
                          <div className="flex items-center gap-2">
                            {gal.driveFolderId && (
                              <span className="text-[10px] text-blue-400 flex items-center gap-1 font-mono">
                                <Cloud className="w-3 h-3" /> {gal.driveFolderName || 'Drive'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditGallery(gal)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                              title="Editar galería y fotos"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGallery(gal.id, gal.title)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
                              title="Eliminar galería"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Google Drive API & Folder Browser */}
          {activeTab === 'drive' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Conexión con Google Drive OAuth2
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Autentica tu cuenta para explorar carpetas, vincularlas a tus galerías y permitir descargas originales sin compresión.
                </p>
              </div>

              {/* Connection Status Card */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        Estado de Conexión Google Drive
                        {formSettings.googleDriveConnected ? (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            OAuth2 Conectado
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            No Conectado
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {driveUserEmail || (currentUser?.email ? `Sesión: ${currentUser.email}` : 'Conecta con Google para explorar carpetas.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {formSettings.googleDriveConnected ? (
                      <>
                        <button
                          onClick={loadDriveFolders}
                          disabled={isLoadingDriveFolders}
                          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveFolders ? 'animate-spin' : ''}`} />
                          Refrescar Carpetas
                        </button>
                        <button
                          onClick={handleDisconnectDrive}
                          className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition"
                        >
                          Desconectar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnectDrive}
                        disabled={isConnectingDrive}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        {isConnectingDrive ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Conectando OAuth2...
                          </>
                        ) : (
                          <>
                            <Cloud className="w-4 h-4" /> Autenticar con Google Drive
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {driveStatusMessage.startsWith('UNAUTHORIZED_DOMAIN:') ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Dominio no autorizado en Firebase Console</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      Firebase requiere que autorices la URL donde se ejecuta la app para permitir el inicio de sesión con Google Drive.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px]">
                      <span className="text-neutral-400">Dominio a autorizar:</span>
                      <code className="text-white bg-neutral-900 px-2 py-0.5 rounded select-all font-bold">
                        {driveStatusMessage.split('UNAUTHORIZED_DOMAIN:')[1]}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(driveStatusMessage.split('UNAUTHORIZED_DOMAIN:')[1]);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="ml-auto px-2.5 py-1 rounded bg-amber-500 text-black font-semibold text-[10px] hover:bg-amber-400 transition cursor-pointer"
                      >
                        {copiedDomain ? '¡Copiado!' : 'Copiar Dominio'}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-neutral-400">
                        Agrega este dominio en: <strong>Authentication ➔ Settings ➔ Authorized Domains</strong>
                      </span>
                      <a
                        href="https://console.firebase.google.com/project/alitafotografia/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-300 hover:text-amber-200 underline font-medium flex items-center gap-1"
                      >
                        Abrir Firebase Settings <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : driveStatusMessage ? (
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                    {driveStatusMessage}
                  </div>
                ) : null}
              </div>

              {/* Interactive Folder Browser */}
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-amber-400" />
                      Carpetas Disponibles en tu Google Drive ({driveFolders.length})
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Asigna cualquier carpeta como repositorio de una galería nueva o sincroniza sus imágenes.
                    </p>
                  </div>

                  {formSettings.googleDriveConnected && (
                    <button
                      onClick={loadDriveFolders}
                      disabled={isLoadingDriveFolders}
                      className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs transition"
                      title="Actualizar lista de carpetas"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveFolders ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>

                {!formSettings.googleDriveConnected ? (
                  <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl">
                    <Cloud className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-300">Autentica tu cuenta arriba para ver tus carpetas de Google Drive</p>
                  </div>
                ) : isLoadingDriveFolders ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                    <span>Cargando carpetas desde Google Drive API...</span>
                  </div>
                ) : driveFolders.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl">
                    <p className="text-xs text-neutral-400">No se encontraron carpetas en tu Google Drive.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                    {driveFolders.map((folder) => {
                      // Check if already used in a gallery
                      const assignedGallery = galleries.find((g) => g.driveFolderId === folder.id);

                      return (
                        <div
                          key={folder.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                              📁
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-medium text-white truncate">
                                {folder.name}
                              </h5>
                              <span className="text-[10px] text-neutral-500 font-mono block truncate">
                                ID: {folder.id}
                              </span>
                              {assignedGallery && (
                                <span className="text-[9px] text-emerald-400 font-mono">
                                  ✓ Vinculada a: {assignedGallery.title}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              onClick={() => handleCreateGalleryFromFolder(folder)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition flex items-center gap-1"
                              title="Crear o editar galería con esta carpeta"
                            >
                              <FolderPlus className="w-3 h-3" />
                              <span className="hidden sm:inline">Vincular</span>
                            </button>
                            <a
                              href={`https://drive.google.com/drive/folders/${folder.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                              title="Abrir en Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Explanatory security box */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 space-y-2">
                <div className="flex items-center gap-2 font-mono text-amber-300 uppercase tracking-wider text-[11px]">
                  <Info className="w-4 h-4" /> Acceso Público de Descarga Sin Iniciar Sesión
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-400">
                  Todas las fotos sincronizadas o subidas a estas carpetas se configuran automáticamente con permisos públicos de lectura (<code className="text-amber-200">reader: anyone</code>). De esta manera, tus clientes podrán abrir la galería con su link y descargar los archivos originales en alta calidad o en ZIP masivo sin tener que iniciar sesión con ninguna cuenta de Google.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Diseño, Marca & Tipografías */}
          {activeTab === 'styles' && (
            <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
              {savedFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Configuración y estilos guardados exitosamente!</span>
                </div>
              )}

              {/* Brand info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-amber-400">
                  1. Perfil y Marca del Fotógrafo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Nombre del Fotógrafo / Marca
                    </label>
                    <input
                      type="text"
                      value={formSettings.photographerName}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, photographerName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Lema / Especialidad de Marca
                    </label>
                    <input
                      type="text"
                      value={formSettings.brandTagline}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, brandTagline: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    Biografía / Presentación en el Portfolio
                  </label>
                  <textarea
                    rows={2}
                    value={formSettings.bio}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, bio: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Email de Contacto</label>
                    <input
                      type="email"
                      value={formSettings.email}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, email: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={formSettings.instagram}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, instagram: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={formSettings.location}
                      onChange={(e) =>
                        setFormSettings({ ...formSettings, location: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Typography options */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-amber-400">
                    2. Tipografía del Sitio (Fuentes)
                  </h3>
                  <span className="text-xs text-neutral-400">
                    {FONT_CLASSES[formSettings.activeFont].label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(FONT_CLASSES) as FontType[]).map((fontKey) => {
                    const f = FONT_CLASSES[fontKey];
                    const isSelected = formSettings.activeFont === fontKey;

                    return (
                      <div
                        key={fontKey}
                        onClick={() =>
                          setFormSettings({ ...formSettings, activeFont: fontKey })
                        }
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-neutral-800/80 border-amber-400 ring-1 ring-amber-400/40'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-amber-300">{f.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className={`text-xl text-white ${f.heading}`}>
                          Alita Fotografía Fine Art
                        </p>
                        <p className={`text-xs text-neutral-400 mt-1 ${f.body}`}>
                          Elegancia, luminosidad y momentos inolvidables.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Color Themes */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-amber-400">
                    3. Paleta de Colores
                  </h3>
                  <span className="text-xs text-neutral-400">
                    {THEMES[formSettings.activeTheme].name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(THEMES) as ThemeType[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = formSettings.activeTheme === themeKey;

                    return (
                      <div
                        key={themeKey}
                        onClick={() =>
                          setFormSettings({ ...formSettings, activeTheme: themeKey })
                        }
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-neutral-800/80 border-amber-400 ring-1 ring-amber-400/40'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-white">{t.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="flex gap-1.5 h-6 rounded-md overflow-hidden border border-neutral-800">
                          <div className={`flex-1 ${t.bg}`} />
                          <div className={`flex-1 ${t.cardBg}`} />
                          <div className={`flex-1 ${t.border} bg-amber-500/20`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Layout selector */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-amber-400">
                  4. Selector de Diseño / Layout de Galerías
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'editorial',
                      title: 'Editorial / Minimalista',
                      desc: 'Elegante estilo revista, espacio generoso y cabeceras asimétricas.',
                    },
                    {
                      id: 'immersive',
                      title: 'Inmersivo',
                      desc: 'Tarjetas a pantalla completa, fondo ultra oscuro y enfoque cinemático.',
                    },
                    {
                      id: 'masonry',
                      title: 'Masonry',
                      desc: 'Cuadrícula dinámica estilo Pinterest con diferentes alturas y flujo continuo.',
                    },
                  ].map((lay) => {
                    const isSelected = formSettings.activeLayout === lay.id;

                    return (
                      <div
                        key={lay.id}
                        onClick={() =>
                          setFormSettings({
                            ...formSettings,
                            activeLayout: lay.id as LayoutType,
                          })
                        }
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-neutral-800/80 border-amber-400 ring-1 ring-amber-400/40'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-semibold text-white">{lay.title}</h4>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {lay.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Guardar Todos los Cambios
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Seguridad & Cambio de Clave en Firebase */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Gestión de Clave en Firebase Console
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Cambia la contraseña de acceso exclusivo de fotógrafo registrada en tu proyecto de Firebase Authentication (Alita Fotografía).
                </p>
              </div>

              {/* User credentials badge */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Usuario Firebase:</span>
                  <span className="text-amber-300 font-medium">
                    {currentUser?.email || DEFAULT_PHOTOGRAPHER_EMAIL}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">UID Registrado:</span>
                  <span className="text-neutral-300">
                    {DEFAULT_PHOTOGRAPHER_UID}
                  </span>
                </div>
              </div>

              {passwordChangeError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              {passwordChangeSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{passwordChangeSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    Clave Actual (si iniciaste por contraseña)
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Introduce tu clave actual"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    Nueva Clave de Fotógrafo *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1">
                    Confirmar Nueva Clave *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva clave"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Actualizando en Firebase...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" /> Guardar Nueva Clave en Firebase
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Editor / Photo Uploader Modal */}
      <GalleryEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveGallery}
        initialGallery={editingGallery}
        defaultWatermark={formSettings.defaultWatermark}
      />
    </div>
  );
};
