import React, { useState } from 'react';
import { Camera, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventGalleryFeed({ activeTab, schedules, albums, photos = [], slug }) {
  const [selectedSchedule, setSelectedSchedule] = useState('all');

  // TAB 1: FEED GENERAL (Pinterest Masonry)
  if (activeTab === 'feed') {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-neutral-400">
            <p className="font-sans text-xs">Aún no hay fotos compartidas en este evento.</p>
            <p className="font-sans text-[11px]">¡Sé el primero en subir un recuerdo!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm border border-black/5 group cursor-pointer hover:shadow-md transition-all duration-300"
              >
                <img
                  src={photo.file_url}
                  alt="Recuerdo"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // TAB 2: ETAPAS DEL EVENTO (Schedules)
  if (activeTab === 'schedules') {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Pills Selector de Etapas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSchedule('all')}
            className={`px-4 py-2 rounded-full font-sans text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSchedule === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white border border-black/5 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Todas las etapas
          </button>
          {schedules.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedSchedule(stage.id)}
              className={`px-4 py-2 rounded-full font-sans text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSchedule === stage.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white border border-black/5 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>

        {/* Mosaico de Fotos Filtrado */}
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm border border-black/5"
            >
              <img src={photo.file_url} alt="Etapa" className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 3: RETOS Y ÁLBUMES (Missions)
  if (activeTab === 'missions') {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        {albums.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 font-sans text-xs">
            No hay retos fotográficos configurados para este evento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Link
                to={`/e/${slug}/mission/${album.id}`}
                key={album.id}
                className="bg-white rounded-3xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 block"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F4F1EE] flex items-center justify-center text-black">
                  <Camera size={20} />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#1c1b1b]">{album.title}</h4>
                  {album.description && (
                    <p className="font-sans text-xs text-neutral-500 line-clamp-2 mt-0.5">
                      {album.description}
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-black/5 flex justify-between items-center text-[11px] font-sans text-neutral-400">
                  <span>Ver álbum del reto</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}