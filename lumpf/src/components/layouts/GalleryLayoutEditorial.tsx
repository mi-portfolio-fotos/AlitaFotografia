import React from 'react';
import { Gallery, SiteSettings } from '../../types';
import { Calendar, Image as ImageIcon, Lock, ArrowUpRight, User } from 'lucide-react';
import { FONT_CLASSES } from '../../utils/theme';

interface GalleryLayoutProps {
  galleries: Gallery[];
  onSelectGallery: (gallery: Gallery) => void;
  settings: SiteSettings;
}

export const GalleryLayoutEditorial: React.FC<GalleryLayoutProps> = ({
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

  const [featured, ...rest] = galleries;
  const font = FONT_CLASSES[settings.activeFont];

  return (
    <div className="space-y-16">
      {/* Featured Lead Story */}
      {featured && (
        <article
          onClick={() => onSelectGallery(featured)}
          className="group relative cursor-pointer border border-neutral-800/80 bg-neutral-900/40 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
            {/* Visual Cover */}
            <div className="lg:col-span-7 relative h-[360px] sm:h-[460px] lg:h-[560px] overflow-hidden">
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60 lg:hidden" />
              {featured.pinCode && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-mono">
                  <Lock className="w-3.5 h-3.5" /> Protegida con PIN
                </div>
              )}
            </div>

            {/* Editorial Metadata */}
            <div className="lg:col-span-5 p-8 sm:p-12 space-y-6">
              <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-amber-400 font-mono">
                <span className="px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10">
                  {featured.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" /> {featured.sessionDate}
                </span>
              </div>

              <div>
                <h2
                  className={`text-3xl sm:text-4xl lg:text-5xl font-normal text-white group-hover:text-amber-200 transition-colors leading-tight ${font.heading}`}
                >
                  {featured.title}
                </h2>
                <div className="flex items-center gap-2 mt-3 text-sm text-neutral-400">
                  <User className="w-4 h-4 text-amber-500/70" />
                  <span>Cliente: <strong className="text-neutral-200 font-medium">{featured.clientName}</strong></span>
                </div>
              </div>

              <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
                {featured.description}
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-neutral-800 text-xs">
                <span className="inline-flex items-center gap-1.5 text-neutral-400 font-mono">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  {featured.photos.length} Fotografías
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300 group-hover:translate-x-1 transition-transform font-medium">
                  Explorar Galería <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Grid for other galleries */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {rest.map((gal) => (
            <article
              key={gal.id}
              onClick={() => onSelectGallery(gal)}
              className="group cursor-pointer space-y-4"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-900 group-hover:border-amber-500/40 transition-all duration-500">
                <img
                  src={gal.coverImage}
                  alt={gal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-80" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700 text-[11px] text-amber-300 font-mono">
                    {gal.category}
                  </span>
                  {gal.pinCode && (
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3" /> PIN
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-neutral-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> {gal.sessionDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> {gal.photos.length} fotos
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3
                  className={`text-2xl font-normal text-white group-hover:text-amber-200 transition-colors ${font.heading}`}
                >
                  {gal.title}
                </h3>
                <p className="text-xs text-neutral-400">Cliente: {gal.clientName}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
