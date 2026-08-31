import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import EventHeader from '../../components/event/EventHeader';
import EventGalleryFeed from '../../components/event/EventGalleryFeed';
import UploadMediaModal from '../../components/event/UploadMediaModal';
import { Loader2, Plus, X } from 'lucide-react';

export default function EventDetailView() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchPhotos = async (eventId) => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*, event_participants!media_participant_id_fkey(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error al cargar fotos:', error);
    }
  };

  // 1. CARGA DE DATOS DESDE SUPABASE AL ENTRAR AL EVENTO
  useEffect(() => {
    async function loadEventData() {
      if (!slug) return;
      setLoading(true);
      try {
        // A. Consultar el evento por slug
        const { data: eventData, error: eventErr } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single();

        if (eventErr) throw eventErr;
        setEvent(eventData);

        // B. Consultar las etapas (schedules) asociadas
        const { data: schedData } = await supabase
          .from('event_schedules')
          .select('*')
          .eq('event_id', eventData.id)
          .order('start_time', { ascending: true });
        setSchedules(schedData || []);

        // C. Consultar los retos (challenges) asociados
        const { data: albumsData } = await supabase
          .from('event_challenges')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: true });
        setAlbums(albumsData || []);

        // E. Consultar configuración del evento (Settings)
        const { data: settingsData } = await supabase
          .from('event_settings')
          .select('*')
          .eq('event_id', eventData.id)
          .single();
        if (settingsData) {
          setSettings(settingsData);
        }

        // D. Cargar fotos
        await fetchPhotos(eventData.id);

      } catch (error) {
        console.error('Error al cargar evento:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEventData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-black" />
        <span className="font-sans text-xs text-neutral-400">Cargando experiencia...</span>
      </div>
    );
  }

  // URL del QR del evento
  const eventPublicUrl = `${window.location.origin}/e/${event?.slug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    eventPublicUrl
  )}`;

  return (
    <div className="min-h-screen bg-[#fdf8f8] font-sans pb-28">
      {/* Encabezado del Evento */}
      <EventHeader
        event={event}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQR={() => setShowQRModal(true)}
        onUploadClick={() => setIsUploadModalOpen(true)}
        onBack={() => navigate('/')}
      />

      {/* Contenido Dinámico de la Pestaña */}
      <main>
        <EventGalleryFeed
          activeTab={activeTab}
          schedules={schedules}
          albums={albums}
          photos={photos} // Aquí se pasan las fotos de la tabla de fotos
          slug={slug}
        />
      </main>

      {/* BOTÓN FLOTANTE INFERIOR ESTILO iOS (Floating Action Button)
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-blue-600 text-white font-sans text-xs font-semibold shadow-2xl flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Subir</span>
        </button>
      </div> */}

      {/* MODAL CÓDIGO QR */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-black/5 pb-2">
              <h3 className="font-headline text-lg font-medium">QR del Evento</h3>
              <button onClick={() => setShowQRModal(false)} className="text-neutral-400">
                <X size={18} />
              </button>
            </div>
            <div className="w-48 h-48 bg-white p-2 rounded-2xl border border-black/5 mx-auto">
              <img src={qrImageUrl} alt="QR" className="w-full h-full object-contain" />
            </div>
            <p className="font-sans text-xs text-neutral-500">
              Muestra este código a tus invitados para ingresar al instante.
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE SUBIDA DE MEDIA */}
      <UploadMediaModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        eventId={event?.id}
        onSuccess={() => fetchPhotos(event?.id)}
      />
    </div>
  );
}