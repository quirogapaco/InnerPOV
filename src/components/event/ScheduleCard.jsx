import React, { useState } from 'react';
import { Clock, MapPin, AlignLeft, ChevronDown, ChevronUp, History } from 'lucide-react';

export default function ScheduleCard({ schedule, isCurrent = false }) {
  const [expanded, setExpanded] = useState(isCurrent || false);

  // Helper para extraer la hora en formato HH:MM
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calcular duración para formato "Xh Ym de duración"
  const getDuration = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end) - new Date(start);
    if (diffMs <= 0) return null;
    
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const durationStr = getDuration(schedule.start_time, schedule.end_time);

  // Construir link de Google Maps
  const mapLink = schedule.latitude && schedule.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${schedule.latitude},${schedule.longitude}`
    : schedule.location_name
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(schedule.location_name)}`
    : null;

  return (
    <div 
      className={`bg-white rounded-[20px] p-3 sm:p-4 border transition-all duration-300 ${
        isCurrent 
          ? 'border-black/20 shadow-md ring-1 ring-black/5' 
          : 'border-black/5 shadow-sm hover:shadow-md'
      }`}
    >
      <div 
        className="flex items-start gap-4 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        {/* Placeholder Ícono (Equivalente al círculo de imagen) */}
        <div className="w-12 h-12 rounded-[14px] bg-[#f7f3f2] flex items-center justify-center flex-shrink-0 border border-black/5 text-neutral-400">
          <Clock size={20} strokeWidth={1.5} />
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Header con Título y Chevron */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="font-headline text-base sm:text-lg font-medium text-[#1c1b1b] leading-tight">
                {schedule.title}
              </h3>
              {isCurrent && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  En Curso
                </span>
              )}
            </div>
            <button className="text-neutral-400 mt-0.5 transition-transform">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Hora de inicio (siempre visible) */}
          <div className="flex items-center gap-1.5 text-neutral-500 mt-0.5">
            <Clock size={14} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="font-sans text-xs font-medium">
              {formatTime(schedule.start_time)}
            </span>
          </div>

          {/* Área Expandible */}
          <div 
            className={`grid transition-all duration-300 ease-in-out ${
              expanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden space-y-2">
              
              {/* Duración */}
              {durationStr && (
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <History size={14} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="font-sans text-xs font-medium">{durationStr} de duración</span>
                </div>
              )}

              {/* Ubicación */}
              {schedule.location_name && (
                <div className="flex items-start gap-1.5 text-neutral-500">
                  <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0 mt-[2px]" />
                  {mapLink ? (
                    <a 
                      href={mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-sans text-xs font-medium underline underline-offset-[3px] hover:text-black transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {schedule.location_name}
                    </a>
                  ) : (
                    <span className="font-sans text-xs font-medium">
                      {schedule.location_name}
                    </span>
                  )}
                </div>
              )}

              {/* Instrucciones */}
              {schedule.instructions && (
                <div className="flex items-start gap-1.5 text-neutral-500">
                  <AlignLeft size={14} strokeWidth={1.5} className="flex-shrink-0 mt-[2px]" />
                  <p className="font-sans text-xs leading-relaxed whitespace-pre-wrap font-medium">
                    {schedule.instructions}
                  </p>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}