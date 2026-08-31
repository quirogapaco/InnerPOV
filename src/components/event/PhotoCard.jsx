import React, { useState } from 'react';
import { Heart, MessageCircle, Lock } from 'lucide-react';

export default function PhotoCard({ photo, onLike, onComment, blurImage = false, onUnlock, viewMode = 'grid' }) {
  // photo data shape: { id, file_url, caption, likes_count, comments_count, event_participants: { display_name } }
  
  // Local state for optimistic UI updates
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(photo.likes_count || 0);
  const [isGiraffe, setIsGiraffe] = useState(false);
  
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle local state for immediate feedback
    if (liked) {
      setLikesCount(prev => prev - 1);
      setLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setLiked(true);
    }
    
    // Trigger external callback if provided (to save in database)
    if (onLike) {
      onLike(photo.id, !liked);
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
        className={`w-full ${viewMode === 'feed' ? 'h-auto max-h-[700px]' : (isGiraffe ? 'aspect-[2/3]' : 'h-auto')} object-cover transition-transform duration-500 ${blurImage ? 'blur-xl scale-110' : 'group-hover:scale-105'}`}
      />
      
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
                  onClick={handleLike}
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
