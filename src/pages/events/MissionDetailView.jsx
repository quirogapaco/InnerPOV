import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Camera, Loader2, Plus } from 'lucide-react';
import UploadMediaModal from '../../components/event/UploadMediaModal';

export default function MissionDetailView() {
  const { slug, albumId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // NOTA: Usamos el ID hardcodeado que tienes en UploadMediaModal para pruebas
  const HARDCODED_GUEST_ID = "bb6459d2-22b5-4cf9-8d83-e60db174d35";

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
    (p) => (user && p.participant_id === user.id) || p.participant_id === HARDCODED_GUEST_ID
  );

  return (
    <div className="min-h-screen bg-[#fdf8f8] font-sans pb-28">
      {/* Encabezado Minimalista */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 border-b border-black/5 flex items-center justify-between">
        <button onClick={() => navigate(`/e/${slug}`)} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors">
          <ArrowLeft size={24} className="text-black" />
        </button>
        <h1 className="font-headline text-lg font-bold text-black flex-1 text-center truncate px-2">
          {album?.title || 'Reto Fotográfico'}
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        {/* Descripción del Reto */}
        {album?.description && (
          <div className="bg-white rounded-3xl p-5 border border-black/5 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#F4F1EE] mx-auto flex items-center justify-center text-black mb-2">
              <Camera size={24} />
            </div>
            <p className="font-sans text-sm text-neutral-600">{album.description}</p>
          </div>
        )}

        {/* Galería de Fotos */}
        {photos.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-neutral-400">
            <p className="font-sans text-xs">Nadie ha participado aún.</p>
            <p className="font-sans text-[11px]">¡Sé el primero en subir un recuerdo para este reto!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Mosaico de fotos */}
            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
              {photos.map((photo, idx) => {
                // Extraer el nombre del autor (soporta diferentes nombres de columnas)
                const authorName = 
                  photo.event_participants?.display_name || 
                  'Alguien';

                return (
                  <div
                    key={photo.id || idx}
                    className="relative break-inside-avoid rounded-3xl overflow-hidden shadow-sm border border-black/5 group hover:shadow-md transition-all duration-300"
                  >
                    <img
                      src={photo.file_url}
                      alt="Recuerdo del reto"
                      className={`w-full h-auto object-cover transition-transform duration-500 ${!hasParticipated ? 'blur-xl scale-110' : 'group-hover:scale-105'}`}
                    />
                    
                    {/* Botón individual de desbloqueo (si no ha participado) */}
                    {!hasParticipated && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
                        <button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="px-4 py-2.5 rounded-full bg-white text-black font-sans text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                          Desbloquear
                        </button>
                      </div>
                    )}
                    
                    {/* Firma de Autor (Oculta si no has participado) */}
                    {hasParticipated && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <p className="text-white font-sans text-xs font-semibold truncate drop-shadow-md">
                          {authorName}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
