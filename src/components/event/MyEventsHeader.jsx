import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function MyEventsHeader({ searchTerm, setSearchTerm, onNewEventClick }) {
  return (
    <div className="sticky top-16 md:top-20 z-30 -mx-6 px-6 md:-mx-8 md:px-8 py-4 bg-[#fdf8f8]/90 backdrop-blur-md border-b border-black/5 transition-all">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        {/* Buscador Propio */}
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Buscar mis eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#e4dfd7]/30 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-xs font-sans text-black placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all"
          />
        </div>

        {/* Botón Crear Evento */}
        <button
          onClick={onNewEventClick}
          className="w-full sm:w-auto bg-black text-white font-sans text-xs font-semibold px-6 py-3 rounded-full hover:scale-[0.98] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm flex-shrink-0"
        >
          <Plus size={16} />
          <span>Crear Nuevo Evento</span>
        </button>
      </div>
    </div>
  );
}