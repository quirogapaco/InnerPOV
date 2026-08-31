import React from 'react';
import {
  ArrowLeft,
  MoreHorizontal,
  MapPin,
  Users,
  QrCode,
  Grid,
  Clock,
  Camera,
  Upload,
} from 'lucide-react';

export default function EventHeader({
  event,
  activeTab,
  setActiveTab,
  onOpenQR,
  onUploadClick,
  onBack,
  participantsCount = 0,
  photosCount = 0,
  onViewParticipants,
}) {
  // Formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha por definir';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Enlace dinámico de Google Maps con las coordenadas guardadas
  const googleMapsUrl =
    event?.latitude && event?.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
      : '#';

  return (
    <header className="relative w-full text-center overflow-hidden">
      {/* 1. PORTADA ADAPTATIVA RESPONSIVE CON DIFUMINADO GRADUAL HACIA EL FONDO (#fdf8f8) */}
      <div className="relative w-full h-[55vh] max-h-[420px] min-h-[280px] sm:h-[450px] overflow-hidden">
        <img
          src={
            event?.cover_photo_url ||
            'https://images.unsplash.com/photo-1519741497674-611481863552'
          }
          alt={event?.title || 'Portada del evento'}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />

        {/* Gradiente de difuminado que se desvanece al color de fondo (#fdf8f8) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-45% to-[#fdf8f8]" />

        {/* Botones Flotantes Superiores estilo iOS Glassmorphism */}
        <div className="absolute top-3 sm:top-4 left-4 right-4 flex justify-between items-center z-20">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-black shadow-sm hover:bg-white transition-all active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-black shadow-sm hover:bg-white transition-all active:scale-95"
            aria-label="Más opciones"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* 2. TEXTO MONTADO Y BLOQUE DE INFORMACIÓN */}
      <div className="-mt-28 sm:-mt-24 relative z-10 px-4 space-y-3 sm:space-y-4">
        {/* Título Principal */}
        <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl text-[#1c1b1b] font-semibold tracking-tight leading-tight max-w-2xl mx-auto px-2">
          {event?.title || 'Nombre del Evento'}
        </h1>

        {/* Fecha y Subtítulo */}
        <p className="font-sans text-xs sm:text-sm text-neutral-600 font-medium">
          {formatDate(event?.event_date)} {event?.location_name ? `• ${event.location_name}` : ''}
        </p>

        {/* Chips Informativos */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-1 max-w-md mx-auto">
          {googleMapsUrl !== '#' && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm flex items-center gap-1.5 font-sans text-xs text-neutral-700 hover:bg-white transition-all active:scale-95"
            >
              <MapPin size={14} className="text-black" />
              <span>Cómo llegar</span>
            </a>
          )}

          <button
            type="button"
            onClick={onViewParticipants}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm flex items-center gap-1.5 font-sans text-xs text-neutral-700 hover:bg-white transition-all active:scale-95"
          >
            <Users size={14} className="text-black" />
            <span>{participantsCount > 0 ? `${participantsCount} Participantes` : 'Participantes'}</span>
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm flex items-center gap-1.5 font-sans text-xs text-neutral-700 cursor-default">
            <Camera size={14} className="text-black" />
            <span>{photosCount > 0 ? `${photosCount} Recuerdos` : 'Recuerdos'}</span>
          </div>

          <button
            type="button"
            onClick={onOpenQR}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm flex items-center gap-1.5 font-sans text-xs text-neutral-700 hover:bg-white transition-all active:scale-95"
          >
            <QrCode size={14} className="text-black" />
            <span>Código QR</span>
          </button>
        </div>

        {/* Botón Prominente de Subir Foto */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-sans text-xs font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <Upload size={16} />
            <span>Subir Recuerdo</span>
          </button>
        </div>
      </div>

      {/* 3. MENÚ DE OPCIONES MINIMALISTA ESTILO IMAGEN (Icono + Texto) */}
      <div className="max-w-md mx-auto mt-6 sm:mt-8 border-t border-black/5 pt-4 px-6 flex justify-around items-center">
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'feed'
              ? 'text-black font-semibold scale-105'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Grid size={22} className={activeTab === 'feed' ? 'stroke-[2.2]' : 'stroke-[1.5]'} />
          <span className="font-sans text-[11px] tracking-wide">Memories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'schedules'
              ? 'text-black font-semibold scale-105'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Clock size={22} className={activeTab === 'schedules' ? 'stroke-[2.2]' : 'stroke-[1.5]'} />
          <span className="font-sans text-[11px] tracking-wide">Etapas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missions')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'missions'
              ? 'text-black font-semibold scale-105'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          <Camera size={22} className={activeTab === 'missions' ? 'stroke-[2.2]' : 'stroke-[1.5]'} />
          <span className="font-sans text-[11px] tracking-wide">Retos</span>
        </button>
      </div>
    </header>
  );
}