import React from 'react';
import {
  MapPin,
  Users,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function Step4Publish({ formData }) {
  // 1. Construir la URL del evento concatenando la variable de entorno con el slug
  const baseUrl = import.meta.env.VITE_PUBLIC_APP_URL || 'https://innerpov.app';
  const eventPublicUrl = `${baseUrl}/e/${formData.slug || 'mi-evento'}`;

  // 2. URL dinámica para la generación del código QR vía servicio remoto
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    eventPublicUrl
  )}`;

  // Formatear la fecha para la visualización
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

  // Filtrar las etapas activadas en el paso anterior
  const activeSchedules = (formData.schedules || []).filter((s) => s.active);

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 text-left animate-in fade-in duration-500 px-2 sm:px-0">
      {/* Encabezado */}
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

      {/* Rejilla Principal (2 Columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: TARJETA VISTA PREVIA DEL EVENTO */}
        <div className="bg-white rounded-[24px] overflow-hidden border border-black/5 shadow-sm space-y-0 hover:shadow-md transition-shadow">
          {/* Foto de Portada con Gradiente */}
          <div className="relative h-64 sm:h-72 overflow-hidden bg-[#F4F1EE]">
            {formData.coverPhotoUrl ? (
              <img
                src={formData.coverPhotoUrl}
                alt={formData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-sans text-xs">
                Sin foto de portada
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-sans font-semibold uppercase tracking-wider">
                {formData.isCustomType ? formData.customTypeName : 'Celebración'}
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-medium leading-tight line-clamp-1">
                {formData.title || 'Título del Evento'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-200 pt-0.5">
                <Calendar size={14} />
                <span>{formatDate(formData.eventDate)}</span>
              </div>
            </div>
          </div>

          {/* Cuerpo de la Tarjeta */}
          <div className="p-6 space-y-6">
            {/* Badges de Etapas Activas */}
            {activeSchedules.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeSchedules.map((schedule) => (
                  <span
                    key={schedule.id}
                    className="px-3 py-1 rounded-full bg-[#F4F1EE] text-[#1c1b1b] font-sans text-[11px] font-semibold"
                  >
                    {schedule.title}
                  </span>
                ))}
              </div>
            )}

            {/* Detalles de Ubicación e Invitados */}
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F4F1EE] flex items-center justify-center text-black flex-shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#1c1b1b]">Ubicación</h4>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                    {formData.locationName || 'Ubicación no especificada'}
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
                    Hasta {formData.maxGuests || 150} invitados • {formData.maxPhotosPerGuest === 0 ? 'Fotos ilimitadas' : `${formData.maxPhotosPerGuest} fotos por persona`}
                  </p>
                </div>
              </div>
            </div>

            {/* Misiones Seleccionadas */}
            {formData.missions && formData.missions.length > 0 && (
              <div className="pt-4 border-t border-black/5 space-y-2">
                <span className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Retos Fotográficos ({formData.missions.length})
                </span>
                <div className="space-y-1.5">
                  {formData.missions.slice(0, 3).map((m) => (
                    <div key={m.slug} className="flex items-center gap-2 text-xs font-sans text-neutral-700">
                      <CheckCircle2 size={14} className="text-black flex-shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </div>
                  ))}
                  {formData.missions.length > 3 && (
                    <span className="text-[11px] font-sans text-neutral-400 italic block pt-1">
                      + {formData.missions.length - 3} retos adicionales
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: TARJETA DE ACCESO CON CÓDIGO QR */}
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

            {/* Mockup de Tarjeta Imprimible */}
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

              {/* Render del Código QR */}
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

          {/* Mensaje Informativo para Descargas */}
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