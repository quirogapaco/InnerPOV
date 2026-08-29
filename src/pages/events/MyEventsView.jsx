import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MyEventsHeader from '../../components/event/MyEventsHeader';
import EventCard from '../../components/event/EventCard';
import { LayoutGrid, List, ArrowRight, QrCode, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function MyEventsView({ onNewEventClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            event_types ( name )
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedEvents = data.map((ev) => ({
          id: ev.id,
          slug: ev.slug,
          title: ev.title,
          coverUrl: ev.cover_photo_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
          category: ev.event_types?.name || ev.custom_type_name || 'Evento',
          status: ev.status,
          location: ev.location_name || 'Ubicación pendiente',
          date: ev.event_date ? new Date(ev.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Fecha pendiente',
          guests: 0,
          photos: 0,
          stages: 0,
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const filteredEvents = events.filter((event) =>
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
        {loading ? (
          <div className="col-span-full py-16 flex justify-center items-center">
             <Loader2 className="animate-spin text-neutral-400" size={32} />
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Link key={event.id} to={`/e/${event.slug}`} className="block">
              <EventCard event={event} />
            </Link>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-neutral-400 bg-white rounded-3xl border border-dashed border-neutral-200 p-8">
            <p className="font-sans text-sm">
              No se encontraron eventos {searchTerm && `con "${searchTerm}"`}
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