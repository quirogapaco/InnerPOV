import React from 'react';
import { MapPin, Users, CalendarDays, Sparkles, Clock3, Camera, Image as ImageIcon } from 'lucide-react';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';

const normalizeEvent = (event = {}) => {
  const safeEvent = event || {};
  const scheduleCount = Array.isArray(safeEvent.event_schedules) ? safeEvent.event_schedules.length : 0;
  const challengeCount = Array.isArray(safeEvent.event_challenges) ? safeEvent.event_challenges.length : 0;

  return {
    id: safeEvent.id || String(Date.now()),
    title: safeEvent.title || 'Evento sin título',
    slug: safeEvent.slug || '',
    coverUrl:
      safeEvent.cover_photo_url ||
      safeEvent.coverUrl ||
      safeEvent.cover ||
      FALLBACK_COVER,
    category:
      safeEvent.custom_type_name ||
      safeEvent.category ||
      safeEvent.event_types?.name ||
      'Celebración',
    status: safeEvent.status || 'draft',
    location:
      safeEvent.location_name ||
      safeEvent.location ||
      'Ubicación por definir',
    date:
      safeEvent.event_date ||
      safeEvent.date ||
      null,
    guests:
      safeEvent.event_settings?.max_guests ??
      safeEvent.guests ??
      0,
    photos:
      safeEvent.event_settings?.max_photos_per_guest ??
      safeEvent.photos ??
      0,
    stages: safeEvent.stages ?? scheduleCount,
    challenges: safeEvent.challenges ?? challengeCount,
    isCustomType: Boolean(safeEvent.isCustomType || safeEvent.custom_type_name),
  };
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha por definir';

  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Fecha por definir';

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusMeta = {
  active: { label: 'Activo', badgeClass: 'bg-emerald-500/90 text-white' },
  draft: { label: 'Borrador', badgeClass: 'bg-[#e4dfd7]/90 text-[#65625c]' },
  archived: { label: 'Archivado', badgeClass: 'bg-neutral-200/90 text-neutral-600' },
};

export default function EventCard({ event, mode = 'grid', actions = null, className = '', onClick = null }) {
  const normalized = normalizeEvent(event);
  const meta = statusMeta[normalized.status] || statusMeta.draft;
  const isActive = normalized.status === 'active';
  const isDraft = normalized.status === 'draft';
  const isArchived = normalized.status === 'archived';

  const handleKeyDown = (eventKey) => {
    if (!onClick) return;
    if (eventKey.key === 'Enter' || eventKey.key === ' ') {
      eventKey.preventDefault();
      onClick();
    }
  };

  const renderPreviewBody = () => (
    <div className="p-5 sm:p-6 flex flex-col flex-1 text-left">
      <div className="mb-4">
        <h3 className="font-headline text-xl sm:text-2xl font-medium text-black group-hover:text-black/70 transition-colors leading-tight">
          {normalized.title}
        </h3>

        <p className="text-neutral-500 font-sans text-xs flex items-center gap-1.5 mt-2">
          {isActive && (
            <>
              <MapPin size={14} className="text-neutral-400 flex-shrink-0" />
              <span className="truncate">{normalized.location}</span>
            </>
          )}
          {isDraft && (
            <>
              <Clock3 size={14} className="text-neutral-400 flex-shrink-0" />
              <span>En proceso de configuración</span>
            </>
          )}
          {isArchived && (
            <>
              <CalendarDays size={14} className="text-neutral-400 flex-shrink-0" />
              <span>Evento finalizado</span>
            </>
          )}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-black/5">
        {isActive && (
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div>
              <p className="text-black font-bold text-sm sm:text-base">{normalized.guests}</p>
              <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                Invitados
              </p>
            </div>
            <div>
              <p className="text-black font-bold text-sm sm:text-base">{normalized.photos}</p>
              <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                Fotos
              </p>
            </div>
            <div>
              <p className="text-black font-bold text-sm sm:text-base">{normalized.stages}</p>
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
            <span className="font-sans font-medium">{normalized.challenges || 0} retos</span>
          </div>
        )}

        <div className="flex justify-between items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em]">
          <span>{formatDate(normalized.date)}</span>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );

  if (mode === 'preview') {
    return (
      <div className={`bg-white rounded-[24px] overflow-hidden border border-black/5 shadow-sm ${className}`}>
        <div className="relative h-64 sm:h-72 overflow-hidden bg-[#F4F1EE]">
          <img
            src={normalized.coverUrl}
            alt={normalized.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-sans font-semibold uppercase tracking-wider">
              {normalized.category}
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-medium leading-tight line-clamp-1">
              {normalized.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-200 pt-0.5">
              <CalendarDays size={14} />
              <span>{formatDate(normalized.date)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {normalized.stages > 0 && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(normalized.stages, 3) }).map((_, index) => (
                <span
                  key={`${normalized.id}-stage-${index}`}
                  className="px-3 py-1 rounded-full bg-[#F4F1EE] text-[#1c1b1b] font-sans text-[11px] font-semibold"
                >
                  {index === 0 ? 'Etapa principal' : `Etapa ${index + 1}`}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F4F1EE] flex items-center justify-center text-black flex-shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">Ubicación</h4>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                  {normalized.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F4F1EE] flex items-center justify-center text-black flex-shrink-0 mt-0.5">
                <Users size={18} />
              </div>
              <div>
                <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">Capacidad & Reglas</h4>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                  Hasta {normalized.guests || 150} invitados • {normalized.photos === 0 ? 'Fotos ilimitadas' : `${normalized.photos} fotos por persona`}
                </p>
              </div>
            </div>
          </div>

          {normalized.challenges > 0 && (
            <div className="pt-4 border-t border-black/5 space-y-2">
              <span className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Retos Fotográficos ({normalized.challenges})
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-sans text-neutral-700">
                  <Sparkles size={14} className="text-black flex-shrink-0" />
                  <span className="truncate">Prepárate para compartir momentos memorables.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`bg-white rounded-[24px] overflow-hidden border border-black/5 flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] ${
        isArchived ? 'grayscale-[0.3] hover:grayscale-0' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <img
          src={normalized.coverUrl}
          alt={normalized.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-black uppercase">
            {normalized.category}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md ${meta.badgeClass}`}>
            {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
            {meta.label}
          </span>
        </div>
      </div>

      {renderPreviewBody()}
    </div>
  );
}
