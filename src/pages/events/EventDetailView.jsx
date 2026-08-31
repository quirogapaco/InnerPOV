import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, X, Copy, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import useEventParticipant from "../../hooks/useEventParticipant";
import EventHeader from "../../components/event/EventHeader";
import EventGalleryFeed from "../../components/event/EventGalleryFeed";
import UploadMediaModal from "../../components/event/UploadMediaModal";
import JoinEventModal from "../../components/event/JoinEventModal";
import GuestAuthModal from "../../components/event/GuestAuthModal";
import ParticipantsModal from "../../components/event/ParticipantsModal";

export default function EventDetailView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [showQRModal, setShowQRModal] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    participant,
    isParticipant,
    isBanned,
    loading: loadingParticipant,
    joinAsUser,
    joinAsGuest,
  } = useEventParticipant(event?.id);

  const fetchParticipants = async (eventId) => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('id, display_name, role, status, user_id, created_at')
        .eq('event_id', eventId)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error("Error al cargar participantes:", error);
    }
  };

  const fetchPhotos = async (eventId) => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from("media")
        .select("*, event_participants!media_participant_id_fkey(*)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error al cargar fotos:", error);
    }
  };

  useEffect(() => {
    async function loadEventData() {
      if (!slug) return;
      setLoading(true);
      try {
        const { data: eventData, error: eventErr } = await supabase
          .from("events")
          .select("*")
          .eq("slug", slug)
          .single();

        if (eventErr) throw eventErr;
        setEvent(eventData);

        const { data: schedData } = await supabase
          .from("event_schedules")
          .select("*")
          .eq("event_id", eventData.id)
          .order("start_time", { ascending: true });
        setSchedules(schedData || []);

        const { data: challengesData } = await supabase
          .from("event_challenges")
          .select("*")
          .eq("event_id", eventData.id)
          .order("created_at", { ascending: true });
        setAlbums(challengesData || []);

        const { data: settingsData } = await supabase
          .from("event_settings")
          .select("*")
          .eq("event_id", eventData.id)
          .single();

        if (settingsData) {
          setSettings(settingsData);
        }

        await fetchPhotos(eventData.id);
        await fetchParticipants(eventData.id);
      } catch (error) {
        console.error("Error al cargar evento:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEventData();
  }, [slug]);

  useEffect(() => {
    if (!event || !user || isParticipant || isBanned || loadingParticipant) {
      setJoinModalOpen(false);
      return;
    }

    setJoinModalOpen(true);
  }, [event, user, isParticipant, isBanned, loadingParticipant]);

  useEffect(() => {
    if (!event || user || isParticipant || isBanned || loadingParticipant) {
      setGuestModalOpen(false);
      return;
    }

    const guestKey = `innerpov_guest_${event.id}`;
    const guestToken = localStorage.getItem(guestKey);

    if (!guestToken) {
      setGuestModalOpen(true);
    }
  }, [event, user, isParticipant, isBanned, loadingParticipant]);

  if (loading || loadingParticipant) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-black" />
        <span className="font-sans text-xs text-neutral-400">
          Cargando experiencia...
        </span>
      </div>
    );
  }

  if (isBanned || participant?.status === "banned") {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-red-200 rounded-[28px] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <X size={30} />
          </div>
          <h1 className="font-headline text-3xl text-[#1c1b1b] font-medium mb-2">
            Acceso bloqueado
          </h1>
          <p className="font-sans text-sm text-neutral-600 leading-relaxed">
            Has sido removido de este evento por un moderador y no puedes entrar
            a la galería ni participar en sus retos.
          </p>
        </div>
      </div>
    );
  }

  const eventPublicUrl = `${window.location.origin}/e/${event?.slug}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    eventPublicUrl,
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventPublicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const isLocked = !isParticipant;

  return (
    <div
      className={`min-h-screen bg-[#fdf8f8] font-sans pb-28 ${isLocked ? "overflow-hidden" : ""}`}
    >
      <div
        className={
          isLocked ? "filter blur-md pointer-events-none select-none" : ""
        }
      >
        <EventHeader
          event={event}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQR={() => setShowQRModal(true)}
          onUploadClick={() => setIsUploadModalOpen(true)}
          onBack={() => navigate("/")}
          participantsCount={participants.length}
          photosCount={photos.length}
          onViewParticipants={() => setShowParticipantsModal(true)}
        />

        <main>
          <EventGalleryFeed
            activeTab={activeTab}
            schedules={schedules}
            albums={albums}
            photos={photos}
            slug={slug}
          />
        </main>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-black/5 pb-2">
              <h3 className="font-headline text-lg font-medium">
                QR del Evento
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-neutral-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="w-48 h-48 bg-white p-2 rounded-2xl border border-black/5 mx-auto">
              <img
                src={qrImageUrl}
                alt="QR"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-sans text-xs text-neutral-500">
              Muestra este código a tus invitados para ingresar al instante.
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl bg-[#f7f3f2] hover:bg-[#e4dfd7] text-black font-sans text-xs font-semibold transition-colors border border-black/5"
            >
              {copiedLink ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copiedLink ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <UploadMediaModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          eventId={event?.id}
          onSuccess={() => fetchPhotos(event?.id)}
        />
      )}

      {!isParticipant && user && joinModalOpen && (
        <JoinEventModal
          event={event}
          user={user}
          loading={loadingParticipant}
          onJoin={async () => {
            await joinAsUser();
            setJoinModalOpen(false);
          }}
          onSignOut={async () => {
            await signOut();
          }}
        />
      )}

      {!isParticipant && !user && guestModalOpen && (
        <GuestAuthModal
          event={event}
          loading={loadingParticipant}
          onGuestJoin={async (name) => {
            await joinAsGuest(name);
            setGuestModalOpen(false);
          }}
          onGoogleAuth={async () => {
            await signInWithGoogle(window.location.href);
          }}
          onEmailSignIn={async ({ email, password }) => {
            await signIn({ email, password });
          }}
          onEmailSignUp={async ({ email, password, fullName }) => {
            await signUp({ email, password, fullName });
          }}
        />
      )}

      {showParticipantsModal && (
        <ParticipantsModal
          isOpen={showParticipantsModal}
          onClose={() => setShowParticipantsModal(false)}
          participants={participants}
          currentUser={user}
        />
      )}
    </div>
  );
}
