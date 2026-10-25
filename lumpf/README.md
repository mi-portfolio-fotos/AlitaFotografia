# Lumina Studios — Portfolio y Galerías de Fotografía para Clientes

Una aplicación web moderna, elegante y de nivel profesional diseñada para fotógrafos que desean presentar sus colecciones con estilo editorial y entregar fotos originales de alta resolución a sus clientes conectándose directamente a su cuenta de **Google Drive**, sin pasar por la compresión agresiva de Google Fotos.

---

## 🌟 Características Principales

### 1. Panel de Administración (Configuración y Estilos)
- **Acceso seguro:** Autenticación exclusiva mediante la cuenta de Google verificada del fotógrafo (sin claves numéricas inseguras que terceros puedan probar o adivinar).
- **Personalización de Marca:**
  - Nombre del fotógrafo y eslogan de marca.
  - **Selector de Tipografías:**
    - *Editorial Serif:* Cormorant Garamond (elegancia y revistas de arte).
    - *High Luxury:* Cinzel & Montserrat (alta costura y lujo).
    - *Modern Editorial:* Playfair Display (estilo atemporal).
    - *Clean Minimalist:* Montserrat & Sans (fotografía contemporánea y documental).
  - **Paletas de Colores:** Obsidian & Gold, Champagne & Linen, Studio Monochrome, Velvet Noir & Rose, Earth & Terracotta.
  - **Selector de Diseños (Layouts):**
    - **Editorial / Minimalista:** Composición espaciosa con historia destacada y cuadrícula asimétrica.
    - **Inmersivo:** Fondo ultra oscuro, pantalla completa y estilo cinematográfico.
    - **Masonry:** Cuadrícula dinámica estilo Pinterest que respeta proporciones verticales y horizontales.
- **Gestor de Galerías:**
  - Crear, editar y eliminar sesiones con título, fecha, cliente, categoría y descripción.
  - **Carga de Fotos por Lote:**
    - *Compresión optimizada en Canvas:* Crea una versión rápida (~1600px, WebP/JPEG) para navegación instantánea sin retardos.
    - *Marca de agua visual opcional:* Configura texto (ej. `© Alejandra Suárez`), posición (centro diagonal o esquinas), opacidad y tamaño de fuente.
    - *Carga automática a Google Drive:* Sube el archivo original sin compresión a una subcarpeta dedicada en Google Drive y configura permisos públicos de descarga por enlace.
  - **Protección por PIN:** Asigna un código numérico de 4 a 6 dígitos a cualquier galería para desbloquear las descargas originales y el archivo ZIP.

### 2. Vista Pública de Galerías y Descargas
- Vista de portafolio organizada por categorías y buscador rápido.
- Vista de sesión con cabecera cinematográfica, fecha, cliente y total de fotos.
- **Sistema de Descargas Inteligente:**
  - **Descarga individual:** Elige entre versión *Web optimizada* o versión *Original de alta resolución*.
  - **Descarga Masiva en ZIP:** Empaqueta todas las fotos o únicamente las fotos seleccionadas con barra de progreso en vivo usando **JSZip**.
  - **Modal de Desbloqueo por PIN:** Si la galería está protegida, solicita el PIN antes de habilitar la descarga original o la creación del ZIP.
- **Visor Lightbox Integrado:** Navegación por teclado (flechas, escape), zoom, dimensiones en píxeles y peso del archivo.

---

## 📁 Estructura del Proyecto

```text
├── index.html                     # Entrada HTML con fuentes Google Fonts (Cormorant, Cinzel, etc.)
├── metadata.json                  # Metadatos del applet
├── package.json                   # Dependencias (React 19, Tailwind CSS v4, Lucide, JSZip, Firebase)
├── vite.config.ts                 # Configuración de Vite y Tailwind
├── tsconfig.json                  # Configuración de TypeScript
├── firebase-applet-config.json    # Configuración de cliente Firebase / OAuth
├── src/
│   ├── main.tsx                   # Punto de arranque de React
│   ├── App.tsx                    # Componente raíz del portfolio y control de estado
│   ├── index.css                  # Tailwind CSS, variables tipográficas y efectos masonry
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript (Gallery, PhotoItem, SiteSettings, Watermark)
│   ├── utils/
│   │   └── theme.ts               # Paletas de color y definiciones de fuentes
│   ├── services/
│   │   ├── firebaseAuth.ts        # Autenticación con Google Auth y gestión de token en memoria
│   │   ├── googleDrive.ts         # Integración API Google Drive v3 (carpetas, upload multipart, links)
│   │   ├── imageProcessor.ts      # Procesamiento en Canvas (escalado web y marcas de agua)
│   │   ├── zipExporter.ts         # Generador de archivos ZIP masivos con JSZip
│   │   └── storage.ts             # Almacenamiento persistente local y datos precargados
│   └── components/
│       ├── Navbar.tsx             # Barra de navegación con logo, selector de layout y botón admin
│       ├── Footer.tsx             # Pie de página editorial con contacto y portal admin
│       ├── GalleryDetailView.tsx  # Vista detallada de la sesión fotográfica y barra de descarga
│       ├── LightboxModal.tsx      # Visor a pantalla completa con zoom y descarga directa
│       ├── PinModal.tsx           # Modal numérico para ingresar PIN de desbloqueo
│       ├── ZipDownloadProgressModal.tsx # Barra de progreso interactiva de descarga ZIP
│       ├── layouts/
│       │   ├── GalleryLayoutEditorial.tsx  # Layout estilo revista editorial
│       │   ├── GalleryLayoutImmersive.tsx  # Layout oscuro cinematográfico
│       │   └── GalleryLayoutMasonry.tsx    # Layout dinámico Pinterest
│       └── admin/
│           ├── AdminDashboard.tsx          # Panel de administración completo (3 pestañas)
│           ├── AdminLoginModal.tsx         # Pantalla de acceso por PIN o Google
│           └── GalleryEditorModal.tsx      # Creador/editor de sesiones y subida de fotos
└── README.md                      # Esta guía de despliegue y configuración
```

---

## 🚀 Cómo Subir el Código a GitHub

1. **Inicializar el repositorio Git (si no está inicializado):**
   ```bash
   git init
   git add .
   git commit -m "feat: Lumina Studios photography portfolio with Google Drive integration"
   ```

2. **Crear un nuevo repositorio en GitHub:**
   - Ve a [github.com/new](https://github.com/new).
   - Nómbralo (por ejemplo, `lumina-photography-portfolio`).
   - Deja el repositorio público o privado según tu preferencia.

3. **Vincular y subir tu código:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/lumina-photography-portfolio.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Cómo Publicar el Proyecto en Vercel

1. **Iniciar sesión en Vercel:**
   - Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.

2. **Importar el proyecto:**
   - Haz clic en **"Add New..."** ➔ **"Project"**.
   - Selecciona el repositorio de GitHub que acabas de subir (`lumina-photography-portfolio`).

3. **Configuración de Build:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Variables de Entorno (Environment Variables):**
   - Agrega tu variable de aplicación en caso de ser requerida:
     ```env
     VITE_APP_URL=https://tu-dominio.vercel.app
     ```
   - Asegúrate de incluir el archivo `firebase-applet-config.json` en tu despliegue o configurar las variables de Firebase si usas variables de entorno.

5. **Haz clic en "Deploy":**
   - En menos de 1 minuto tu aplicación estará disponible globalmente en una URL segura con HTTPS (ej. `https://lumina-photography.vercel.app`).

---

## 🔑 Configuración de Google Cloud Console (Google Drive API)

Para conectar tu propia cuenta de Google Drive en producción:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea o selecciona tu proyecto de Google Cloud.
3. Ve a **APIs & Services ➔ Library** y busca **"Google Drive API"**. Haz clic en **Habilitar (Enable)**.
4. En **APIs & Services ➔ Credentials**:
   - Crea un **OAuth 2.0 Client ID** de tipo **Web application**.
   - En **Authorized JavaScript origins**, agrega:
     - `http://localhost:3000` (para desarrollo local)
     - `https://tu-dominio.vercel.app` (para producción en Vercel)
5. En la pantalla de consentimiento de OAuth (**OAuth consent screen**):
   - Agrega el alcance (scope): `https://www.googleapis.com/auth/drive.file`.
   - Este alcance cumple con el principio de mínimo privilegio: solo permite acceder a los archivos y carpetas creados por la aplicación.
6. En el panel de administración de Lumina Studios:
   - Ve a la pestaña **Google Drive API**.
   - Haz clic en **"Conectar con Google Drive"**.
   - La aplicación creará automáticamente la carpeta principal `Lumina Photography Client Vault` y sincronizará todas las fotos que subas.

---

## 🔒 Seguridad y Privacidad
- Los tokens de acceso de Google Drive se mantienen en memoria volátil y nunca se guardan en `localStorage` o cookies inseguras.
- Las descargas originales se protegen mediante el código PIN configurado en cada galería individual.
