export type LayoutType = 'editorial' | 'immersive' | 'masonry';
export type FontType = 'editorial' | 'minimalist' | 'luxury' | 'modern';
export type ThemeType = 'obsidian' | 'champagne' | 'monochrome' | 'noir-rose' | 'earth-terracotta';

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: 'center' | 'bottom-right' | 'bottom-left' | 'top-right';
  opacity: number; // 0.1 to 1.0
  fontSize: number; // 14 to 48
}

export interface PhotoItem {
  id: string;
  name: string;
  webUrl: string; // Compressed preview URL (base64 or blob or Google Drive thumbnail)
  originalUrl?: string; // High-res original URL or object URL
  driveFileId?: string; // Google Drive file ID
  driveDownloadUrl?: string; // Direct download link from Google Drive
  driveWebViewUrl?: string; // Direct view link in Google Drive
  width: number;
  height: number;
  sizeBytes: number;
  isCover?: boolean;
  dateAdded: string;
  hasWatermark?: boolean;
}

export interface Gallery {
  id: string;
  title: string;
  clientName: string;
  sessionDate: string; // YYYY-MM-DD
  category: 'Bodas' | 'Editorial' | 'Retrato' | 'Eventos' | 'Fine Art' | 'Moda' | 'Maternidad' | 'Comercial';
  description: string;
  coverImage: string;
  pinCode?: string; // Optional 4-6 digit numeric PIN to unlock downloads
  isPrivate?: boolean;
  layoutOverride?: LayoutType; // Can override global layout
  watermarkConfig?: WatermarkConfig;
  driveFolderId?: string; // Google Drive subfolder ID for this gallery
  driveFolderName?: string;
  photos: PhotoItem[];
  createdAt: string;
}

export interface SiteSettings {
  photographerName: string;
  brandTagline: string;
  bio: string;
  email: string;
  phone: string;
  instagram: string;
  location: string;
  activeLayout: LayoutType;
  activeFont: FontType;
  activeTheme: ThemeType;
  defaultPinRequired: boolean;
  defaultWatermark: WatermarkConfig;
  googleDriveConnected: boolean;
  googleDriveRootFolderId?: string;
  adminEmail: string; // Authorized administrator Google email (e.g. alita68.fotos@gmail.com)
}

export interface ThemeColors {
  id: ThemeType;
  name: string;
  bg: string;
  cardBg: string;
  border: string;
  accent: string;
  accentHover: string;
  textPrimary: string;
  textSecondary: string;
  badge: string;
}
