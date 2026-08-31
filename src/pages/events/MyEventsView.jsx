import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, ArrowRight, QrCode, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import MyEventsHeader from '../../components/event/MyEventsHeader';
import EventCard from '../../components/event/EventCard';

export default function MyEventsView({ onNewEventClick }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setEvents([]);
          return;
        }

        const { data, error: eventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            slug,
            cover_photo_url,
            event_date,
            location_name,
            status,
            created_by,
            custom_type_name,
            event_types ( name, icon ),
            event_settings ( max_guests, max_photos_per_guest ),
            event_schedules ( id, title, slug, start_time, end_time ),
            event_challenges ( id, title, slug )
          `)
          .eq('created_by', user.id)
          .order('event_date', { ascending: false });

        if (eventsError) throw eventsError;

        setEvents(data || []);
      } catch (fetchError) {
        console.error('Error al cargar eventos del usuario:', fetchError);
        setError(fetchError.message || 'No se pudieron cargar tus eventos.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return events;

    return events.filter((event) => {
      const title = (event.title || '').toLowerCase();
      const location = (event.location_name || '').toLowerCase();
      return title.includes(term) || location.includes(term);
    });
  }, [events, searchTerm]);

  return (
    <div className="space-y-6 md:space-y-8 text-left">
      <MyEventsHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewEventClick={onNewEventClick}
      />

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

      {loading ? (
        <div className="flex items-center justify-center gap-3 bg-white rounded-3xl border border-black/5 py-16 text-neutral-500">
          <Loader2 size={20} className="animate-spin text-black" />
          <span className="font-sans text-sm">Cargando tus eventos...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-3xl p-5 text-red-700">
          <AlertTriangle size={18} />
          <span className="font-sans text-sm">{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => event.slug && navigate(`/e/${event.slug}`)}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-neutral-400 bg-white rounded-3xl border border-dashed border-neutral-200 p-8">
              <p className="font-sans text-sm">
                {searchTerm
                  ? `No se encontraron eventos con "${searchTerm}"`
                  : 'Todavía no tienes eventos creados.'}
              </p>
            </div>
          )}
        </div>
      )}

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