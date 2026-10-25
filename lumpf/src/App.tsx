import React, { useState, useEffect } from 'react';
import {
  Gallery,
  SiteSettings,
  LayoutType,
} from './types';
import {
  getSavedGalleries,
  getSavedSettings,
  saveGalleries,
  saveSettings,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GalleryDetailView } from './components/GalleryDetailView';
import { GalleryLayoutEditorial } from './components/layouts/GalleryLayoutEditorial';
import { GalleryLayoutImmersive } from './components/layouts/GalleryLayoutImmersive';
import { GalleryLayoutMasonry } from './components/layouts/GalleryLayoutMasonry';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { THEMES, FONT_CLASSES } from './utils/theme';
import {
  Search,
  Sparkles,
  Camera,
  Calendar,
  Cloud,
  CheckCircle2,
  Lock,
  ArrowRight,
  Send,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(getSavedSettings);
  const [galleries, setGalleries] = useState<Gallery[]>(getSavedGalleries);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Contact form state
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactDate, setContactDate] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Update storage whenever settings or galleries change
  const handleUpdateGalleries = (newGalleries: Gallery[]) => {
    setGalleries(newGalleries);
    saveGalleries(newGalleries);
    // If the currently viewed gallery was updated, sync it
    if (selectedGallery) {
      const updatedSelected = newGalleries.find((g) => g.id === selectedGallery.id);
      if (updatedSelected) setSelectedGallery(updatedSelected);
    }
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelectLayout = (layout: LayoutType) => {
    const updated = { ...settings, activeLayout: layout };
    handleUpdateSettings(updated);
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminDashboardOpen(true);
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered galleries
  const filteredGalleries = galleries.filter((gal) => {
    const matchesCategory =
      categoryFilter === 'Todas' || gal.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      gal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['Todas', 'Bodas', 'Editorial', 'Retrato', 'Eventos', 'Fine Art'];
  const currentTheme = THEMES[settings.activeTheme] || THEMES.obsidian;
  const currentFont = FONT_CLASSES[settings.activeFont] || FONT_CLASSES.editorial;

  const totalPhotosCount = galleries.reduce((acc, g) => acc + g.photos.length, 0);

  // If viewing a single gallery
  if (selectedGallery) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} ${currentFont.body}`}>
        <Navbar
          settings={settings}
          onOpenAdmin={handleOpenAdmin}
          isAdminLoggedIn={isAdminLoggedIn}
          onSelectLayout={handleSelectLayout}
          onNavigateHome={() => setSelectedGallery(null)}
          onScrollToSection={handleScrollToSection}
        />
        <GalleryDetailView
          gallery={selectedGallery}
          settings={settings}
          onBack={() => setSelectedGallery(null)}
        />
        <Footer settings={settings} onOpenAdmin={handleOpenAdmin} />

        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onSuccess={handleAdminLoginSuccess}
          authorizedEmail={settings.adminEmail}
        />

        <AdminDashboard
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          galleries={galleries}
          settings={settings}
          onUpdateGalleries={handleUpdateGalleries}
          onUpdateSettings={handleUpdateSettings}
          onLogoutAdmin={handleLogoutAdmin}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} text-neutral-100 ${currentFont.body} selection:bg-amber-500/30 selection:text-amber-200`}>
      {/* Navigation */}
      <Navbar
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
        onSelectLayout={handleSelectLayout}
        onNavigateHome={() => setSelectedGallery(null)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Hero Showcase Section */}
      <header className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-8 overflow-hidden border-b border-neutral-900">
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-xs font-mono tracking-wider text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PORTFOLIO PROFESIONAL & ENTREGAS A CLIENTES</span>
          </div>

          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-normal text-white max-w-4xl mx-auto tracking-tight leading-[1.08] ${currentFont.heading}`}
          >
            La luz, la emoción y la memoria eterna.
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {settings.bio}
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-sans">
                {galleries.length}
              </span>
              <span className="text-neutral-400 text-left leading-tight">
                Colecciones<br />Privadas
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-sans">
                {totalPhotosCount}
              </span>
              <span className="text-neutral-400 text-left leading-tight">
                Fotografías<br />en Alta Resolución
              </span>
            </div>
            <div className="h-6 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" />
              <span className="text-neutral-400 text-left leading-tight">
                Almacenamiento<br />Google Drive
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Galleries Section */}
      <section id="galleries" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        {/* Category Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                    : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente o sesión..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Selected Layout Rendering */}
        {settings.activeLayout === 'editorial' && (
          <GalleryLayoutEditorial
            galleries={filteredGalleries}
            onSelectGallery={(gal) => setSelectedGallery(gal)}
            settings={settings}
          />
        )}

        {settings.activeLayout === 'immersive' && (
          <GalleryLayoutImmersive
            galleries={filteredGalleries}
            onSelectGallery={(gal) => setSelectedGallery(gal)}
            settings={settings}
          />
        )}

        {settings.activeLayout === 'masonry' && (
          <GalleryLayoutMasonry
            galleries={filteredGalleries}
            onSelectGallery={(gal) => setSelectedGallery(gal)}
            settings={settings}
          />
        )}
      </section>

      {/* About Section */}
      <section id="about" className="border-t border-neutral-900 bg-neutral-950/60 py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                alt={settings.photographerName}
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-md text-xs font-mono text-amber-300">
              <span>{settings.location}</span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
              <Camera className="w-4 h-4" /> Filosofía & Proceso Artístico
            </div>

            <h2 className={`text-3xl sm:text-4xl text-white font-normal ${currentFont.heading}`}>
              La fotografía no es capturar cómo se ve algo, sino cómo se sintió.
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Cada reportaje y sesión de fotos se aborda con sensibilidad documental y criterio editorial. Trabajo con luz natural y espacios arquitectónicos auténticos, buscando la naturalidad y los gestos espontáneos que transmiten la verdadera historia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
                <span className="font-semibold text-white block">Entrega en Google Drive</span>
                <p className="text-neutral-400">
                  Acceso directo a tus archivos originales sin compresión agresiva y listos para impresión de alta calidad.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
                <span className="font-semibold text-white block">Protección & Privacidad</span>
                <p className="text-neutral-400">
                  Galerías protegidas por código PIN opcional para compartir con total seguridad con familia e invitados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Booking Section */}
      <section id="contact" className="py-24 px-4 sm:px-8 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Agenda tu fecha
            </span>
            <h2 className={`text-3xl sm:text-4xl text-white font-normal ${currentFont.heading}`}>
              Hablemos de tu Próxima Sesión
            </h2>
            <p className="text-xs text-neutral-400 max-w-lg mx-auto">
              Escríbeme para consultar disponibilidad para bodas, campañas editoriales o sesiones individuales.
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl">
            {contactFormSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-medium text-white">¡Mensaje Enviado con Éxito!</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Gracias por contactar con {settings.photographerName}. Te responderé en un plazo máximo de 24-48 horas.
                </p>
                <button
                  onClick={() => setContactFormSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactFormSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Fecha Estimada de la Sesión / Evento</label>
                  <input
                    type="date"
                    value={contactDate}
                    onChange={(e) => setContactDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Cuéntame sobre tu proyecto o boda</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Detalles sobre localización, tipo de reportaje, número de invitados o ideas visuales..."
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Enviar Solicitud de Información
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer settings={settings} onOpenAdmin={handleOpenAdmin} />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        authorizedEmail={settings.adminEmail}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        galleries={galleries}
        settings={settings}
        onUpdateGalleries={handleUpdateGalleries}
        onUpdateSettings={handleUpdateSettings}
        onLogoutAdmin={handleLogoutAdmin}
      />
    </div>
  );
}
