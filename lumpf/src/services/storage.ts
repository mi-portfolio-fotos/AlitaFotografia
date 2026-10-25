import { Gallery, SiteSettings } from '../types';

const STORAGE_KEY_GALLERIES = 'lumina_galleries_v1';
const STORAGE_KEY_SETTINGS = 'lumina_site_settings_v1';

export const DEFAULT_SETTINGS: SiteSettings = {
  photographerName: 'Alita Fotografía',
  brandTagline: 'Fotografía Fine Art, Bodas & Editorial',
  bio: 'Capturando la emoción pura, la elegancia de la luz natural y los momentos eternos con una mirada documental y estética cinematográfica.',
  email: 'alita68.fotos@gmail.com',
  phone: '+34 612 345 678',
  instagram: '@alita.fotografia',
  location: 'Madrid • Barcelona • Destinos Internacionales',
  activeLayout: 'editorial',
  activeFont: 'editorial',
  activeTheme: 'obsidian',
  defaultPinRequired: false,
  defaultWatermark: {
    enabled: true,
    text: '© Alejandra Suárez Photography',
    position: 'bottom-right',
    opacity: 0.45,
    fontSize: 22,
  },
  googleDriveConnected: false,
  adminEmail: 'alita68.fotos@gmail.com',
};

export const INITIAL_GALLERIES: Gallery[] = [
  {
    id: 'gal-valeria-mateo',
    title: 'Valeria & Mateo — Amor en la Costa',
    clientName: 'Valeria & Mateo',
    sessionDate: '2025-09-18',
    category: 'Bodas',
    description: 'Ceremonia íntima al atardecer frente a los acantilados mediterráneos, con luz dorada y detalles rústico-elegantes.',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    pinCode: '2468',
    isPrivate: false,
    layoutOverride: 'editorial',
    watermarkConfig: {
      enabled: true,
      text: '© Alejandra Suárez — Boda Valeria & Mateo',
      position: 'bottom-right',
      opacity: 0.4,
      fontSize: 20,
    },
    createdAt: '2025-09-20T14:00:00Z',
    photos: [
      {
        id: 'p-vm-1',
        name: 'Valeria_Mateo_Abrazo_01.jpg',
        webUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=3200&q=95',
        width: 3200,
        height: 2133,
        sizeBytes: 4200000,
        dateAdded: '2025-09-20T14:00:00Z',
        isCover: true,
      },
      {
        id: 'p-vm-2',
        name: 'Valeria_Mateo_Votos_02.jpg',
        webUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=3000&q=95',
        width: 3000,
        height: 2000,
        sizeBytes: 3800000,
        dateAdded: '2025-09-20T14:05:00Z',
      },
      {
        id: 'p-vm-3',
        name: 'Valeria_Mateo_Detalle_Anillo_03.jpg',
        webUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2800&q=95',
        width: 2800,
        height: 1867,
        sizeBytes: 3100000,
        dateAdded: '2025-09-20T14:10:00Z',
      },
      {
        id: 'p-vm-4',
        name: 'Valeria_Mateo_Vestido_Espalda_04.jpg',
        webUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=2600&q=95',
        width: 2600,
        height: 3900,
        sizeBytes: 4500000,
        dateAdded: '2025-09-20T14:15:00Z',
      },
      {
        id: 'p-vm-5',
        name: 'Valeria_Mateo_Atardecer_Rocas_05.jpg',
        webUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=3400&q=95',
        width: 3400,
        height: 2267,
        sizeBytes: 5200000,
        dateAdded: '2025-09-20T14:20:00Z',
      },
      {
        id: 'p-vm-6',
        name: 'Valeria_Mateo_Banquete_Luces_06.jpg',
        webUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=3000&q=95',
        width: 3000,
        height: 2000,
        sizeBytes: 3900000,
        dateAdded: '2025-09-20T14:25:00Z',
      },
    ],
  },
  {
    id: 'gal-vogue-editorial',
    title: 'Seda & Sombra — Alta Costura 2025',
    clientName: 'Atelier Maison Noire',
    sessionDate: '2025-10-02',
    category: 'Editorial',
    description: 'Campaña de moda otoño-invierno inspirada en la arquitectura brutalista y los contrastes dramáticos de claroscuro.',
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    isPrivate: false,
    layoutOverride: 'immersive',
    watermarkConfig: {
      enabled: true,
      text: 'LUMINA STUDIOS • EDITORIAL',
      position: 'center',
      opacity: 0.35,
      fontSize: 26,
    },
    createdAt: '2025-10-04T10:00:00Z',
    photos: [
      {
        id: 'p-vg-1',
        name: 'Editorial_Maison_01.jpg',
        webUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=3000&q=95',
        width: 3000,
        height: 4000,
        sizeBytes: 4900000,
        dateAdded: '2025-10-04T10:00:00Z',
        isCover: true,
      },
      {
        id: 'p-vg-2',
        name: 'Editorial_Maison_Perfil_02.jpg',
        webUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=3200&q=95',
        width: 3200,
        height: 4800,
        sizeBytes: 5600000,
        dateAdded: '2025-10-04T10:05:00Z',
      },
      {
        id: 'p-vg-3',
        name: 'Editorial_Maison_Texturas_03.jpg',
        webUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2900&q=95',
        width: 2900,
        height: 1933,
        sizeBytes: 3700000,
        dateAdded: '2025-10-04T10:10:00Z',
      },
      {
        id: 'p-vg-4',
        name: 'Editorial_Maison_Velo_04.jpg',
        webUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=3100&q=95',
        width: 3100,
        height: 4650,
        sizeBytes: 6100000,
        dateAdded: '2025-10-04T10:15:00Z',
      },
      {
        id: 'p-vg-5',
        name: 'Editorial_Maison_Joyas_05.jpg',
        webUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2800&q=95',
        width: 2800,
        height: 4200,
        sizeBytes: 4800000,
        dateAdded: '2025-10-04T10:20:00Z',
      },
    ],
  },
  {
    id: 'gal-lucia-retrato',
    title: 'Lucía en la Toscana — Retrato Íntimo',
    clientName: 'Lucía Bernabé',
    sessionDate: '2025-08-14',
    category: 'Retrato',
    description: 'Sesión artística individual capturada en una villa del siglo XVIII entre cipreses y luz crepuscular.',
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=85',
    pinCode: '1122',
    isPrivate: false,
    layoutOverride: 'masonry',
    watermarkConfig: {
      enabled: false,
      text: '© Alejandra Suárez',
      position: 'bottom-right',
      opacity: 0.3,
      fontSize: 18,
    },
    createdAt: '2025-08-16T12:00:00Z',
    photos: [
      {
        id: 'p-lb-1',
        name: 'Lucia_Ventana_01.jpg',
        webUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=3000&q=95',
        width: 3000,
        height: 4500,
        sizeBytes: 5100000,
        dateAdded: '2025-08-16T12:00:00Z',
        isCover: true,
      },
      {
        id: 'p-lb-2',
        name: 'Lucia_Cipreses_02.jpg',
        webUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=3200&q=95',
        width: 3200,
        height: 2133,
        sizeBytes: 3900000,
        dateAdded: '2025-08-16T12:05:00Z',
      },
      {
        id: 'p-lb-3',
        name: 'Lucia_Sombras_03.jpg',
        webUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=2900&q=95',
        width: 2900,
        height: 3800,
        sizeBytes: 4300000,
        dateAdded: '2025-08-16T12:10:00Z',
      },
      {
        id: 'p-lb-4',
        name: 'Lucia_Mirada_04.jpg',
        webUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=3000&q=95',
        width: 3000,
        height: 4500,
        sizeBytes: 4700000,
        dateAdded: '2025-08-16T12:15:00Z',
      },
      {
        id: 'p-lb-5',
        name: 'Lucia_Lino_05.jpg',
        webUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=85',
        originalUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=2800&q=95',
        width: 2800,
        height: 3500,
        sizeBytes: 4100000,
        dateAdded: '2025-08-16T12:20:00Z',
      },
    ],
  },
];

export function getSavedGalleries(): Gallery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_GALLERIES, JSON.stringify(INITIAL_GALLERIES));
      return INITIAL_GALLERIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error al cargar galerías locales:', err);
    return INITIAL_GALLERIES;
  }
}

export function saveGalleries(galleries: Gallery[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GALLERIES, JSON.stringify(galleries));
  } catch (err) {
    console.error('Error al guardar galerías:', err);
  }
}

export function getSavedSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const cleaned = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      adminEmail: parsed.adminEmail || DEFAULT_SETTINGS.adminEmail,
    };
    delete (cleaned as any).adminPasscode;
    return cleaned;
  } catch (err) {
    console.error('Error al cargar configuración:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error al guardar configuración:', err);
  }
}
