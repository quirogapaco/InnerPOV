import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Camera, Loader2, Plus, MoreHorizontal, Users, Lock, Unlock, CheckCircle } from 'lucide-react';
import UploadMediaModal from '../../components/event/UploadMediaModal';
import PhotoCard from '../../components/event/PhotoCard';
import MediaGallery from '../../components/event/MediaGallery';

export default function MissionDetailView() {
  const { slug, albumId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentParticipantId, setCurrentParticipantId] = useState(null);

  const fetchMissionData = async () => {
    try {
      // 1. Obtener Evento
      const { data: eventData, error: eventErr } = await supabase
        .from('events')
        .select('id, title, slug')
        .eq('slug', slug)
        .single();

      if (eventErr) throw eventErr;
      setEvent(eventData);

      if (user) {
        const { data: participantData } = await supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', eventData.id)
          .eq('user_id', user.id)
          .single();
        
        if (participantData) {
          setCurrentParticipantId(participantData.id);
        }
      }

      // 2. Obtener Álbum / Reto
      const { data: albumData, error: albumErr } = await supabase
        .from('event_challenges')
        .select('*')
        .eq('id', albumId)
        .single();

      if (albumErr) throw albumErr;
      setAlbum(albumData);

      // 3. Obtener Fotos y nombres de usuario relacionados
      const { data: photosData, error: photosErr } = await supabase
        .from('media')
        .select('*, event_participants!media_participant_id_fkey(*)')
        .eq('event_id', eventData.id)
        .eq('challenge_id', albumId)
        .order('created_at', { ascending: false });

      if (photosErr) throw photosErr;
      setPhotos(photosData || []);

    } catch (error) {
      console.error('Error cargando los datos del reto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionData();
  }, [slug, albumId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-black" />
        <span className="font-sans text-xs text-neutral-400">Cargando reto...</span>
      </div>
    );
  }

  // Lógica BeReal: Comprobar si el usuario actual ha subido al menos una foto
  const hasParticipated = photos.some(
    (p) => currentParticipantId && p.participant_id === currentParticipantId
  );

  const userPhoto = photos.find(
    (p) => currentParticipantId && p.participant_id === currentParticipantId
  );

  return (
    <div className="min-h-screen bg-[#fdf8f8] font-sans pb-28">
      {/* Top Navigation Area */}
      <header className="sticky top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-black/5">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-black" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-sans text-[13px] text-black uppercase tracking-[0.05em] font-semibold">
              Álbum de Reto
            </h1>
            <span className="font-sans text-[11px] text-neutral-500 mt-0.5 font-medium">
              {photos.length} {photos.length === 1 ? 'recuerdo' : 'recuerdos'}
            </span>
          </div>
          <button
            className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-neutral-50 transition-colors"
          >
            <MoreHorizontal size={20} className="text-black" />
          </button>
        </div>
      </header>

      <main className="pt-8 pb-12 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Challenge Summary Card */}
        <section className="bg-white rounded-3xl border border-black/5 p-6 md:p-8 mb-12 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#e4dfd7] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                <Camera size={24} />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#e4dfd7] text-[#65625c] font-sans text-[13px] font-semibold uppercase tracking-wider">
                  Reto Activo
                </span>
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 font-sans text-[13px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Users size={14} /> {photos.length > 0 ? new Set(photos.map(p => p.participant_id)).size : 0} participantes
                </span>
              </div>
            </div>

            <h2 className="font-headline text-3xl md:text-5xl text-black font-semibold mb-4">
              {album?.title || 'Reto Fotográfico'}
            </h2>

            <p className="font-sans text-lg text-neutral-600 max-w-2xl mb-8">
              {album?.description || 'Sube aquí tu mejor recuerdo para este reto.'}
            </p>

            {!hasParticipated && (
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-50 rounded-xl text-neutral-500 font-sans text-[13px] font-semibold">
                <Lock size={18} />
                <span>Regla: Sube tu foto para desbloquear la galería</span>
              </div>
            )}
            {hasParticipated && (
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-neutral-50 rounded-xl text-neutral-500 font-sans text-[13px] font-semibold">
                <Unlock size={18} />
                <span>¡Galería desbloqueada!</span>
              </div>
            )}
          </div>
        </section>

        {/* User Participation Box */}
        {hasParticipated && userPhoto && (
          <section className="mb-12">
            <h3 className="font-headline text-2xl text-black font-medium mb-6">Tu Recuerdo Subido</h3>
            <div className="bg-white rounded-3xl border border-black/5 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <div className="w-full md:w-[200px] rounded-xl overflow-hidden relative group bg-black/5 flex items-center justify-center">
                <img
                  src={userPhoto.file_url}
                  alt="Tu foto subida"
                  className="w-full max-h-[250px] object-contain rounded-xl"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center items-start w-full">
                <div className="flex items-center gap-2 mb-2 text-neutral-600">
                  <CheckCircle size={18} />
                  <span className="font-sans text-base font-medium">Foto subida con éxito</span>
                </div>
                <p className="font-sans text-[13px] font-semibold text-neutral-400 mb-6">
                  {new Date(userPhoto.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-6 py-3 rounded-full border border-black/5 bg-transparent text-black font-sans text-[15px] font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2"
                >
                  <Camera size={18} />
                  Subir otra foto
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Unlocked Community Photo Gallery */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <h3 className="font-headline text-2xl text-black font-medium">Muro de Recuerdos del Reto</h3>
            <span className="font-sans text-[13px] text-neutral-500 uppercase tracking-wider font-semibold">
              {photos.length} Fotos
            </span>
          </div>

          <MediaGallery 
            photos={photos} 
            emptyStateMessage="Nadie ha participado aún. ¡Sé el primero en subir un recuerdo para este reto!"
            blurImage={!hasParticipated}
            onUnlock={() => setIsUploadModalOpen(true)}
          />
        </section>
      </main>

      {/* Botón Flotante */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-black text-white font-sans text-xs font-semibold shadow-2xl flex items-center gap-2 hover:bg-neutral-800 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Subir a este reto</span>
        </button>
      </div>

      {/* Modal de Subida (Recibe el albumId específico) */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        eventId={event?.id}
        albumId={album?.id} // Vincula la foto al reto
        onSuccess={() => fetchMissionData()} // Recargar para desbloquear automáticamente
      />
    </div>
  );
}
