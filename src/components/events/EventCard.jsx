import React from 'react';
import { MapPin, Clock, History, Image as ImageIcon } from 'lucide-react';

export default function EventCard({ event }) {
  const { title, coverUrl, category, status, location, date, guests, photos, stages } = event;

  const isActive = status === 'active';
  const isDraft = status === 'draft';
  const isArchived = status === 'archived';

  return (
    <div
      className={`bg-white rounded-[24px] overflow-hidden border border-black/5 flex flex-col group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] ${
        isArchived ? 'grayscale-[0.3] hover:grayscale-0' : ''
      }`}
    >
      {/* Portada */}
      <div className="relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Categoría */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-black uppercase">
            {category}
          </span>
        </div>

        {/* Estado */}
        <div className="absolute top-4 right-4">
          {isActive && (
            <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Activo
            </span>
          )}
          {isDraft && (
            <span className="bg-[#e4dfd7]/90 text-[#65625c] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Borrador
            </span>
          )}
          {isArchived && (
            <span className="bg-neutral-200/90 text-neutral-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Archivado
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 text-left">
        <div className="mb-4">
          <h3 className="font-headline text-xl sm:text-2xl font-medium text-black group-hover:text-black/70 transition-colors leading-tight">
            {title}
          </h3>

          <p className="text-neutral-500 font-sans text-xs flex items-center gap-1.5 mt-2">
            {isActive && (
              <>
                <MapPin size={14} className="text-neutral-400 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </>
            )}
            {isDraft && (
              <>
                <Clock size={14} className="text-neutral-400 flex-shrink-0" />
                <span>En proceso de configuración</span>
              </>
            )}
            {isArchived && (
              <>
                <History size={14} className="text-neutral-400 flex-shrink-0" />
                <span>Evento finalizado</span>
              </>
            )}
          </p>
        </div>

        {/* Métricas e Info */}
        <div className="mt-auto pt-4 border-t border-black/5">
          {isActive && (
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div>
                <p className="text-black font-bold text-sm sm:text-base">{guests}</p>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                  Invitados
                </p>
              </div>
              <div>
                <p className="text-black font-bold text-sm sm:text-base">{photos}</p>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                  Fotos
                </p>
              </div>
              <div>
                <p className="text-black font-bold text-sm sm:text-base">{stages}</p>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                  Etapas
                </p>
              </div>
            </div>
          )}

          {isDraft && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-white bg-[#e7e2da]" />
                <div className="w-7 h-7 rounded-full border-2 border-white bg-[#e5e2e1]" />
                <div className="w-7 h-7 rounded-full border-2 border-white bg-[#e6e2df] flex items-center justify-center text-[10px] font-bold text-neutral-600">
                  +
                </div>
              </div>
            </div>
          )}

          {isArchived && (
            <div className="flex items-center gap-2 mb-4 text-neutral-500 text-xs">
              <ImageIcon size={16} />
              <span className="font-sans font-medium">842 Galerías</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em]">
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}