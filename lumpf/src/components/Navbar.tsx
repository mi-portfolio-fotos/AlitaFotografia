import React, { useState } from 'react';
import { SiteSettings, LayoutType } from '../types';
import {
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  Menu,
  X,
  Camera,
} from 'lucide-react';
import { FONT_CLASSES } from '../utils/theme';

interface NavbarProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onSelectLayout: (layout: LayoutType) => void;
  onNavigateHome: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenAdmin,
  isAdminLoggedIn,
  onSelectLayout,
  onNavigateHome,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const font = FONT_CLASSES[settings.activeFont];

  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-xl border-b border-neutral-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Photographer Name */}
        <div
          onClick={onNavigateHome}
          className="cursor-pointer group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`text-xl sm:text-2xl font-normal text-white group-hover:text-amber-200 transition-colors block leading-tight ${font.heading}`}
            >
              {settings.photographerName}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-mono block">
              {settings.brandTagline}
            </span>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-neutral-300">
          <button
            onClick={() => {
              onNavigateHome();
              onScrollToSection('galleries');
            }}
            className="hover:text-amber-300 transition cursor-pointer"
          >
            Galerías
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              onScrollToSection('about');
            }}
            className="hover:text-amber-300 transition cursor-pointer"
          >
            Sobre Mí
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              onScrollToSection('contact');
            }}
            className="hover:text-amber-300 transition cursor-pointer"
          >
            Contacto
          </button>

          {/* Quick Layout Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-sans">
            <span className="px-2 text-neutral-500 text-[9px] uppercase tracking-wider font-mono">
              Layout:
            </span>
            {(['editorial', 'immersive', 'masonry'] as LayoutType[]).map((lay) => (
              <button
                key={lay}
                onClick={() => onSelectLayout(lay)}
                className={`px-2.5 py-1 rounded-full capitalize transition ${
                  settings.activeLayout === lay
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {lay}
              </button>
            ))}
          </div>
        </div>

        {/* Right CTA / Admin Access */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition cursor-pointer ${
              isAdminLoggedIn
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-neutral-900/90 border-neutral-700/80 text-neutral-300 hover:bg-neutral-800 hover:border-amber-400/40'
            }`}
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Panel Admin</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Acceso Fotógrafo</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-6 bg-neutral-950 border-b border-neutral-800 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-mono tracking-wider uppercase text-neutral-300">
            <button
              onClick={() => {
                onNavigateHome();
                onScrollToSection('galleries');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-amber-300"
            >
              Galerías
            </button>
            <button
              onClick={() => {
                onNavigateHome();
                onScrollToSection('about');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-amber-300"
            >
              Sobre Mí
            </button>
            <button
              onClick={() => {
                onNavigateHome();
                onScrollToSection('contact');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-amber-300"
            >
              Contacto
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <span className="text-[11px] text-neutral-500 block mb-2 font-mono uppercase">
              Diseño de Galerías:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['editorial', 'immersive', 'masonry'] as LayoutType[]).map((lay) => (
                <button
                  key={lay}
                  onClick={() => {
                    onSelectLayout(lay);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 rounded-lg text-xs capitalize ${
                    settings.activeLayout === lay
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  {lay}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-medium text-amber-300 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isAdminLoggedIn ? 'Gestionar en Panel Admin' : 'Acceso Fotógrafo (Admin)'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
