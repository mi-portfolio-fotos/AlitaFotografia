import React from 'react';
import { Gallery, SiteSettings } from '../../types';
import { Calendar, Image as ImageIcon, Lock, ArrowUpRight } from 'lucide-react';
import { FONT_CLASSES } from '../../utils/theme';

interface GalleryLayoutProps {
  galleries: Gallery[];
  onSelectGallery: (gallery: Gallery) => void;
  settings: SiteSettings;
}

export const GalleryLayoutMasonry: React.FC<GalleryLayoutProps> = ({
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
    <div className="masonry-grid">
      {galleries.map((gal, index) => {
        // Vary aspect ratios for authentic masonry rhythm
        const aspectClasses = [
          'aspect-[3/4]',
          'aspect-[4/5]',
          'aspect-[1/1]',
          'aspect-[2/3]',
          'aspect-[16/10]',
        ];
        const chosenAspect = aspectClasses[index % aspectClasses.length];

        return (
          <article
            key={gal.id}
            onClick={() => onSelectGallery(gal)}
            className="masonry-item group cursor-pointer border border-neutral-800/80 rounded-2xl overflow-hidden bg-neutral-900/60 hover:border-amber-500/40 transition-all duration-500"
          >
            <div className={`relative ${chosenAspect} overflow-hidden bg-neutral-950`}>
              <img
                src={gal.coverImage}
                alt={gal.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700 text-[11px] font-mono text-amber-300">
                  {gal.category}
                </span>
                {gal.pinCode && (
                  <span className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Bottom Quick Tag */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                <span>{gal.photos.length} fotos</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> {gal.sessionDate}
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="p-5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`text-xl font-normal text-white group-hover:text-amber-200 transition-colors ${font.heading}`}
                >
                  {gal.title}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-300 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-xs text-neutral-400 line-clamp-2">
                {gal.description}
              </p>
              <div className="pt-2 text-[11px] text-neutral-500 font-mono">
                Cliente: <span className="text-neutral-300">{gal.clientName}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
