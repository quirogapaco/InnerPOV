import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PhotoCard({ photo, onLike, onComment, blurImage = false, onUnlock, viewMode = 'grid', participant }) {
  // photo data shape: { id, file_url, caption, likes_count, comments_count, event_participants: { display_name } }

  const [liked, setLiked] = useState(photo.liked_by_me || false);
  const [likesCount, setLikesCount] = useState(photo.likes_count || 0);
  const [isGiraffe, setIsGiraffe] = useState(false);
  const [hearts, setHearts] = useState([]);
  const lastTap = useRef(0);

  const updateLikeInDB = async (isLiking) => {
    if (!participant?.id) return;
    
    // 3. El recuento de likes depende de likes_count de media
    const newCount = isLiking ? likesCount + 1 : likesCount - 1;
    setLikesCount(newCount);
    setLiked(isLiking);

    if (onLike) {
      onLike(photo.id, isLiking, newCount);
    }

    try {
      if (isLiking) {
        // 2. Agregar fila en media_likes
        const { data } = await supabase.from('media_likes')
          .select('id').match({ media_id: photo.id, participant_id: participant.id }).maybeSingle();
        if (!data) {
          await supabase.from('media_likes').insert({ media_id: photo.id, participant_id: participant.id });
        }
      } else {
        // 2. Borrar fila en media_likes
        await supabase.from('media_likes')
          .delete()
          .match({ media_id: photo.id, participant_id: participant.id });
      }
    } catch (err) {
      console.error('Error al actualizar like en BD:', err);
    }
  };

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    updateLikeInDB(!liked);
  };

  const handleTap = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      handleDoubleTapLike();
    }

    lastTap.current = now;
  };

  const handleDoubleTapLike = () => {
    // Create a new heart for the animation
    const id = Date.now() + Math.random();

    // Random offsets and rotations to make it look dynamic when spammed
    const randomX = Math.floor(Math.random() * 40) - 20; // -20px to 20px
    const randomY = Math.floor(Math.random() * 40) - 20;
    const randomRotation = Math.floor(Math.random() * 30) - 15; // -15deg to 15deg

    setHearts(prev => [...prev, { id, x: randomX, y: randomY, rotation: randomRotation }]);

    // Remove the specific heart after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 1000); // 1000ms duration for the animation

    // Only like, never unlike on double tap
    if (!liked) {
      updateLikeInDB(true);
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onComment) {
      onComment(photo);
    } else {
      console.log('Abrir modal de comentarios para la foto:', photo.id);
    }
  };

  const authorName = photo.event_participants?.display_name || 'Invitado';
  const commentsCount = photo.comments_count || 0;

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    // Si la imagen es más alta que 3:2 vertical (ratio > 1.5), es "jirafa"
    if (naturalHeight / naturalWidth > 1.5) {
      setIsGiraffe(true);
    }
  };

  return (
    <article className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-200 group hover:shadow-md transition-all duration-300 ${viewMode === 'grid' ? '' : 'mb-8 rounded-2xl'}`}>
      <img
        src={photo.file_url}
        alt={photo.caption || 'Recuerdo del evento'}
        onLoad={handleImageLoad}
        onClick={handleTap}
        className={`w-full select-none touch-manipulation ${viewMode === 'feed' ? 'h-auto max-h-[700px]' : (isGiraffe ? 'aspect-[2/3]' : 'h-auto')} object-cover transition-transform duration-500 ${blurImage ? 'blur-xl scale-110' : 'group-hover:scale-105'}`}
      />

      {/* Floating Heart Animations */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${heart.x}px, ${heart.y}px) rotate(${heart.rotation}deg)`
            }}
          >
            <Heart
              className="text-red-500 fill-red-500 drop-shadow-2xl"
              size={100}
              style={{ animation: 'heartPop 1s ease-out forwards' }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0.5); opacity: 1; }
          10% { transform: scale(1.2); opacity: 1; }
          25% { transform: scale(1); opacity: 1; }
          70% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {blurImage && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/10 gap-3">
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-black shadow-lg">
            <Lock size={18} />
          </div>
          {onUnlock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnlock();
              }}
              className="px-4 py-2.5 rounded-full bg-white text-black font-sans text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Desbloquear
            </button>
          )}
        </div>
      )}

      {!blurImage && viewMode === 'feed' && (
        <>
          {/* Top Overlay: User Info */}
          <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-2 pointer-events-none">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-white drop-shadow-md truncate">{authorName}</span>
          </div>

          {/* Bottom Overlay: Interactions & Caption */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pointer-events-none">
            {photo.caption && (
              <p className="text-white text-sm mb-3 drop-shadow-md line-clamp-2">
                {photo.caption}
              </p>
            )}
            <div className="flex items-center justify-between text-white/90 pointer-events-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <Heart size={18} className={liked ? 'text-red-500 fill-current' : 'text-white'} />
                  <span className="text-xs font-medium">{likesCount}</span>
                </button>

                <button
                  onClick={handleComment}
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <MessageCircle size={18} className="text-white" />
                  <span className="text-xs font-medium">{commentsCount}</span>
                </button>
              </div>

              {photo.taken_at && (
                <span className="text-[10px] uppercase tracking-wider opacity-75">
                  {new Date(photo.taken_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}
