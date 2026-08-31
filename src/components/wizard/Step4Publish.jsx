import React from 'react';
import { Info } from 'lucide-react';
import EventCard from '../../components/event/EventCard';

export default function Step4Publish({ formData }) {
  const baseUrl = import.meta.env.VITE_PUBLIC_APP_URL || 'https://innerpov.app';
  const eventPublicUrl = `${baseUrl}/e/${formData.slug || 'mi-evento'}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    eventPublicUrl
  )}`;

  const previewEvent = {
    id: formData.id || 'draft-event',
    title: formData.title || 'Título del Evento',
    slug: formData.slug || 'mi-evento',
    cover_photo_url: formData.coverPhotoUrl,
    custom_type_name: formData.isCustomType ? formData.customTypeName : 'Celebración',
    status: 'draft',
    location_name: formData.locationName || 'Ubicación no especificada',
    event_date: formData.eventDate,
    event_settings: {
      max_guests: formData.maxGuests || 150,
      max_photos_per_guest: formData.maxPhotosPerGuest || 0,
    },
    event_schedules: (formData.schedules || []).filter((s) => s.active),
    event_challenges: formData.missions || [],
    challenges: (formData.missions || []).length,
    stages: (formData.schedules || []).filter((s) => s.active).length,
    guests: formData.maxGuests || 150,
    photos: formData.maxPhotosPerGuest || 0,
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 text-left animate-in fade-in duration-500 px-2 sm:px-0">
      <div className="text-center space-y-2">
        <span className="font-sans text-[11px] font-semibold text-neutral-600 bg-[#f7f3f2] px-3.5 py-1.5 rounded-full inline-block tracking-wider uppercase">
          PASO 4: REVISIÓN Y PUBLICACIÓN
        </span>
        <h1 className="font-headline text-3xl md:text-5xl text-[#1c1b1b] font-medium leading-tight">
          ¡Todo listo para publicar!
        </h1>
        <p className="font-headline italic text-sm md:text-base text-[#444748] max-w-xl mx-auto">
          Revisa el resumen de tu evento y verifica el código de acceso antes de confirmar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-[24px] overflow-hidden border border-black/5 shadow-sm">
          <EventCard event={previewEvent} mode="preview" className="border-none shadow-none rounded-none" />
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-black/5 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-black/5">
              <h3 className="font-headline text-xl text-[#1c1b1b] font-medium">
                Acceso para Invitados
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-sans text-[11px] font-semibold">
                Enlace Generado
              </span>
            </div>

            <div className="bg-[#FDFBF9] p-6 sm:p-8 rounded-[20px] flex flex-col items-center text-center border border-dashed border-neutral-300 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 font-sans text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                VISTA PREVIA DE ACCESO
              </div>

              <div className="mb-4">
                <h4 className="font-headline text-2xl text-[#1c1b1b] font-medium mb-1">
                  {formData.title || 'Evento'}
                </h4>
                <p className="font-sans text-[10px] text-neutral-400 uppercase tracking-widest">
                  Escanea para compartir tus fotos
                </p>
              </div>

              <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-sm my-3 flex items-center justify-center border border-black/5">
                <img
                  src={qrImageUrl}
                  alt="Código QR del Evento"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="font-sans text-xs text-neutral-500 max-w-[220px] leading-relaxed mb-3">
                Usa la cámara de tu teléfono para ingresar directamente a la galería del evento.
              </p>

              <div className="bg-white px-3.5 py-1.5 rounded-full border border-black/10 text-xs font-mono font-medium text-black">
                {eventPublicUrl}
              </div>
            </div>
          </div>

          <div className="bg-[#f7f3f2] p-4 rounded-xl border border-black/5 flex items-start gap-3">
            <Info size={18} className="text-black flex-shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              <strong className="text-black">Nota:</strong> Una vez publicado el evento, podrás descargar la plantilla imprimible en alta resolución y el código QR individual desde tu panel de control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
