import React from 'react';
import { Gallery, SiteSettings } from '../../types';
import { Calendar, Image as ImageIcon, Lock, ArrowRight } from 'lucide-react';
import { FONT_CLASSES } from '../../utils/theme';

interface GalleryLayoutProps {
  galleries: Gallery[];
  onSelectGallery: (gallery: Gallery) => void;
  settings: SiteSettings;
}

export const GalleryLayoutImmersive: React.FC<GalleryLayoutProps> = ({
  galleries,
  onSelectGallery,
  settings,
}) => {
  if (galleries.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500">
        <p>No hay galerías disponibles en esta categoría.</p>
      </div>
    );
  }

  const font = FONT_CLASSES[settings.activeFont];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleries.map((gal) => (
        <article
          key={gal.id}
          onClick={() => onSelectGallery(gal)}
          className="group relative h-[480px] sm:h-[540px] rounded-2xl overflow-hidden cursor-pointer border border-neutral-800 bg-neutral-950 shadow-2xl transition-all duration-700 hover:border-amber-400/50 hover:shadow-amber-500/10"
        >
          {/* Background Image */}
          <img
            src={gal.coverImage}
            alt={gal.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out brightness-90 group-hover:brightness-100"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/80" />

          {/* Top Badges */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
            <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-neutral-700/80 text-[11px] font-mono tracking-wider text-amber-300">
              {gal.category.toUpperCase()}
            </span>
            {gal.pinCode && (
              <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" /> PRIVADA
              </span>
            )}
          </div>

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                {gal.sessionDate} • {gal.clientName}
              </span>
              <h3
                className={`text-2xl sm:text-3xl text-white font-normal group-hover:text-amber-200 transition-colors leading-tight ${font.heading}`}
              >
                {gal.title}
              </h3>
            </div>

            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {gal.description}
            </p>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                {gal.photos.length} Fotos
              </span>

              <span className="inline-flex items-center gap-1.5 text-amber-300 group-hover:translate-x-1.5 transition-transform font-sans font-medium">
                Ver Sesión <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
