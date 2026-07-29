import React, { useState } from 'react';
import MyEventsHeader from '../../components/events/MyEventsHeader';
import EventCard from '../../components/events/EventCard';
import { LayoutGrid, List, ArrowRight, QrCode } from 'lucide-react';

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Boda de Sofía & Mateo',
    coverUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    category: 'Boda',
    status: 'active',
    location: 'Quinta San Luis, Ambato',
    date: '28 Jul 2026',
    guests: 120,
    photos: 340,
    stages: 4,
  },
  {
    id: '2',
    title: 'Boda de Carlos & Elena',
    coverUrl:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
    category: 'Boda',
    status: 'draft',
    location: 'En proceso de configuración',
    date: '15 Oct 2026',
    guests: 0,
    photos: 0,
    stages: 0,
  },
  {
    id: '3',
    title: 'Aniversario de Oro - Familia Quiroga',
    coverUrl:
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    category: 'Aniversario',
    status: 'archived',
    location: 'Quito, Ecuador',
    date: '12 Dec 2025',
    guests: 85,
    photos: 842,
    stages: 3,
  },
];

export default function MyEventsView({ onNewEventClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = MOCK_EVENTS.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 text-left">
      {/* 1. Encabezado exclusivo de Mis Eventos con Buscador y Crear Evento */}
      <MyEventsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewEventClick={onNewEventClick}
      />

      {/* 2. Título de la vista */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-medium text-black">
            Mis Eventos
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-500 mt-1">
            Gestiona y comparte tus momentos más significativos.
          </p>
        </div>

        <div className="hidden sm:flex gap-1.5 self-start sm:self-auto">
          <button className="p-2 rounded-xl border border-black/5 bg-white text-black shadow-sm">
            <LayoutGrid size={18} />
          </button>
          <button className="p-2 rounded-xl border border-black/5 bg-white text-neutral-400 hover:text-black">
            <List size={18} />
          </button>
        </div>
      </div>

      {/* 3. Rejilla Responsive de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-neutral-400 bg-white rounded-3xl border border-dashed border-neutral-200 p-8">
            <p className="font-sans text-sm">
              No se encontraron eventos con "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* 4. Banner Promocional Inferior */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 bg-[#e4dfd7]/20 rounded-[24px] p-6 sm:p-8 border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <h4 className="font-headline text-xl sm:text-2xl text-black font-medium mb-2">
              Personaliza tu experiencia
            </h4>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              InnerPOV te permite crear códigos QR únicos para cada etapa de tu boda. Facilita que tus invitados compartan esos ángulos que nadie más ve.
            </p>
            <button className="mt-4 flex items-center gap-2 text-black font-bold text-xs hover:gap-3 transition-all">
              <span>Saber más</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="hidden sm:flex w-28 h-28 bg-white/60 rounded-2xl backdrop-blur-sm items-center justify-center border border-black/5 flex-shrink-0">
            <QrCode size={48} className="text-black" />
          </div>
        </div>

        <div className="bg-black text-white rounded-[24px] p-6 sm:p-8 flex flex-col justify-between text-left">
          <div>
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80">
              Soporte Premium
            </span>
            <h4 className="font-headline text-xl sm:text-2xl font-medium mt-4 leading-tight">
              ¿Necesitas ayuda con tu evento?
            </h4>
          </div>
          <button className="w-full bg-white text-black font-sans text-xs font-semibold py-3.5 rounded-full mt-6 hover:bg-neutral-100 transition-colors">
            Contactar Concierge
          </button>
        </div>
      </section>
    </div>
  );
}