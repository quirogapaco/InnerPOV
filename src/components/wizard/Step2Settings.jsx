import React from 'react';
// 1. Cambiamos Videocam por Video
import { Users, Camera, Video, ShieldCheck, Lightbulb } from 'lucide-react';

export default function Step2Settings({ formData, updateFormData }) {
  // Valores por defecto
  const maxGuests = formData.maxGuests ?? 150;
  const maxPhotosPerGuest = formData.maxPhotosPerGuest ?? 30;
  const allowVideos = formData.allowVideos ?? true;
  const requireModeration = formData.requireModeration ?? false;

  // Opciones predefinidas
  const GUEST_PRESETS = [50, 100, 150, 200];
  const PHOTO_PRESETS = [15, 30, 50, 0]; // 0 representa "Sin Límite"

  return (
    <div className="max-w-[800px] mx-auto space-y-6 text-left animate-in fade-in duration-500">
      {/* Encabezado del Paso 2 */}
      <div>
        <span className="font-sans text-[11px] font-semibold text-neutral-600 bg-[#f7f3f2] px-3.5 py-1.5 rounded-full mb-2.5 inline-block tracking-wider uppercase">
          PASO 2: CONFIGURACIÓN
        </span>
        <h1 className="font-headline text-3xl md:text-4xl text-[#1c1b1b] font-medium mb-1.5 leading-tight">
          Reglas y Límites de la Galería
        </h1>
        <p className="font-headline italic text-sm md:text-base text-[#444748]">
          Define los permisos y controles para los invitados a tu evento.
        </p>
      </div>

      {/* Rejilla Bento de Tarjetas (Compacta) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tarjeta A: Límite de Invitados */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-black/5 flex flex-col justify-between hover:border-black/15 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-black">
                <Users size={20} />
              </div>
            </div>
            <h3 className="font-headline text-lg text-[#1c1b1b] font-medium mb-1">
              Límite de Invitados
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed mb-4">
              Capacidad estimada de personas que podrán unirse al álbum mediante el código QR.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {GUEST_PRESETS.map((count) => {
              const isSelected = maxGuests === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateFormData({ maxGuests: count })}
                  className={`px-4 py-2 rounded-full font-sans text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-black text-white shadow-sm'
                      : 'border border-neutral-200 text-neutral-600 hover:bg-[#F4F1EE]'
                  }`}
                >
                  {count}
                </button>
              );
            })}
            
            {/* Input personalizado */}
            <input
              type="number"
              placeholder="Otro"
              value={GUEST_PRESETS.includes(maxGuests) ? '' : maxGuests}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateFormData({ maxGuests: isNaN(val) ? 0 : val });
              }}
              className="w-20 px-3 py-1.5 rounded-full bg-[#F4F1EE] border-none font-sans text-xs text-center text-black outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Tarjeta B: Límite de Fotos */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-black/5 flex flex-col justify-between hover:border-black/15 transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-black">
                <Camera size={20} />
              </div>
            </div>
            <h3 className="font-headline text-lg text-[#1c1b1b] font-medium mb-1">
              Límite de Fotos por Invitado
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed mb-4">
              Controla cuántas capturas puede subir cada invitado para garantizar la calidad.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {PHOTO_PRESETS.map((limit) => {
              const isSelected = maxPhotosPerGuest === limit;
              const label = limit === 0 ? 'Sin Límite' : `${limit} fotos`;

              return (
                <button
                  key={limit}
                  type="button"
                  onClick={() => updateFormData({ maxPhotosPerGuest: limit })}
                  className={`py-2 px-3 rounded-xl font-sans text-xs font-semibold text-center transition-all ${
                    isSelected
                      ? 'bg-black text-white shadow-sm'
                      : 'border border-neutral-200 text-neutral-600 hover:bg-[#F4F1EE]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjeta C: Permiso de Video */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-black/5 flex flex-col justify-between hover:border-black/15 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-black">
              {/* 2. Renderizamos <Video /> en lugar de <Videocam /> */}
              <Video size={20} />
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowVideos}
                onChange={(e) => updateFormData({ allowVideos: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
            </label>
          </div>

          <div>
            <h3 className="font-headline text-lg text-[#1c1b1b] font-medium mb-1">
              Permitir Clips de Video
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed">
              Habilita la subida de pequeños clips de video (máx. 15 segundos) en movimiento.
            </p>
          </div>
        </div>

        {/* Tarjeta D: Moderación de Contenido */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-black/5 flex flex-col justify-between hover:border-black/15 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-black">
              <ShieldCheck size={20} />
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requireModeration}
                onChange={(e) => updateFormData({ requireModeration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black" />
            </label>
          </div>

          <div>
            <h3 className="font-headline text-lg text-[#1c1b1b] font-medium mb-1">
              Moderación de Contenido
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed">
              Revisa y aprueba manualmente cada foto o video antes de publicarlo en el feed.
            </p>
          </div>
        </div>

      </section>

      {/* Banner Informativo */}
      <div className="bg-[#f7f3f2] rounded-2xl p-4 border border-black/5 flex items-center gap-3">
        <Lightbulb size={20} className="text-black flex-shrink-0" />
        <p className="font-sans text-xs text-neutral-600 leading-relaxed">
          <strong className="text-black">Tip Profesional:</strong> Activar la moderación es ideal para bodas grandes o corporativos. Desactivarla permite un feed en vivo dinámico.
        </p>
      </div>
    </div>
  );
}