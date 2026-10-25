import React from 'react';
import { SiteSettings } from '../types';
import { Camera, Instagram, Mail, Phone, MapPin, Cloud, ShieldCheck } from 'lucide-react';
import { FONT_CLASSES } from '../utils/theme';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  const font = FONT_CLASSES[settings.activeFont];

  return (
    <footer className="border-t border-neutral-900 bg-[#070709] text-neutral-400 py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand identity */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className={`text-2xl text-white font-normal ${font.heading}`}>
              {settings.photographerName}
            </h3>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
            {settings.bio}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2 font-mono">
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>Galerías de clientes sincronizadas con Google Drive</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="md:col-span-4 space-y-3 text-xs">
          <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono">
            Contacto & Localización
          </h4>
          <ul className="space-y-2.5 text-neutral-300">
            <li className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400/70 shrink-0" />
              <span>{settings.location}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400/70 shrink-0" />
              <a
                href={`mailto:${settings.email}`}
                className="hover:text-amber-300 transition"
              >
                {settings.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400/70 shrink-0" />
              <a
                href={`tel:${settings.phone}`}
                className="hover:text-amber-300 transition"
              >
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Instagram className="w-4 h-4 text-amber-400/70 shrink-0" />
              <span className="text-neutral-300">{settings.instagram}</span>
            </li>
          </ul>
        </div>

        {/* Admin & Security */}
        <div className="md:col-span-3 space-y-3 text-xs">
          <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono">
            Portal Privado
          </h4>
          <p className="text-neutral-500 text-xs leading-relaxed">
            Área de administración exclusiva para fotógrafo: gestión de sesiones, subida masiva, marcas de agua y ajustes.
          </p>
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Acceder como Administrador</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-neutral-900/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-neutral-600 font-mono">
        <div>
          © {new Date().getFullYear()} {settings.photographerName}. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-4">
          <span>Google Drive Cloud Storage</span>
          <span>•</span>
          <span>Alta Resolución Original</span>
          <span>•</span>
          <span>ZIP Masivo</span>
        </div>
      </div>
    </footer>
  );
};
