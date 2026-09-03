import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageSquare, Download, Smile, ArrowUp, BadgeCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function getTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  
  const diffInMins = Math.floor(diffInMs / 60000);
  if (diffInMins < 1) return 'ahora';
  if (diffInMins < 60) return `${diffInMins}m`;
  
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} sem`;
}

const QUICK_EMOJIS = ['❤️', '✨', '🙌', '🥂', '😍', '😂', '🔥', '👏'];

export default function CommentsSection({ isOpen, onClose, mediaId, participant, onCommentAdded }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const touchStartY = useRef(0);

  // Resetear el estado de expansión cuando se abre
  useEffect(() => {
    if (isOpen) {
      setIsExpanded(false);
      document.body.style.overflow = 'hidden'; // Evita scroll de la pagina de fondo
    }
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mediaId) return;

    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_comments')
        .select(`
          id,
          content,
          created_at,
          participant_id,
          event_participants (
            display_name,
            role,
            user_id
          )
        `)
        .eq('media_id', mediaId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setComments(data);
      }
      setLoading(false);
    };

    fetchComments();
  }, [isOpen, mediaId]);

  if (!isOpen) return null;

  // Lógica para detectar el deslizamiento (swipe)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const distance = touchStartY.current - touchEndY;
    
    // Si desliza hacia arriba más de 40px
    if (distance > 40) {
      setIsExpanded(true);
    } 
    // Si desliza hacia abajo más de 40px y estaba expandido, regresarlo a la mitad
    else if (distance < -40 && isExpanded) {
      setIsExpanded(false);
    } 
    // Si desliza hacia abajo y NO estaba expandido, cerrar el modal
    else if (distance < -60 && !isExpanded) {
      onClose();
    }
  };

  // Detener la propagación de eventos para bloquear el slider trasero
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!newComment.trim() || isSubmitting || !participant?.id) return;

    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('media_comments')
      .insert({
        media_id: mediaId,
        participant_id: participant.id,
        content: newComment.trim()
      })
      .select(`
        id,
        content,
        created_at,
        participant_id,
        event_participants (
          display_name,
          role,
          user_id
        )
      `)
      .single();

    if (!error && data) {
      setComments((prev) => [data, ...prev]);
      setNewComment('');
      setShowEmojis(false);
      if (onCommentAdded) onCommentAdded();
    } else {
      console.error('Error submitting comment:', error);
    }
    
    setIsSubmitting(false);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/40 flex justify-center items-end animate-in fade-in duration-200"
      // Detenemos los eventos de touch para que el Swiper/Slider trasero no se mueva
      onTouchStart={stopPropagation}
      onTouchMove={stopPropagation}
      onPointerDown={stopPropagation}
      onPointerMove={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Overlay transparente: click cierra, y arrastrar expande/contrae */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      ></div>

      {/* Modal tipo Bottom Sheet */}
      <div 
        className={`bg-[#fdf8f8] w-full ${isExpanded ? 'h-[100dvh] rounded-none' : 'h-[65dvh] rounded-t-3xl'} shadow-2xl flex flex-col relative z-10 transition-all duration-300 ease-out animate-in slide-in-from-bottom`}
      >
        
        {/* Manija de arrastre (drag handle) */}
        <div 
          className="w-full flex justify-center pt-3 pb-2 shrink-0 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-1 bg-black/15 rounded-full mx-auto"></div>
        </div>

        {/* Header de estadísticas */}
        <div className="flex items-center justify-center px-6 py-4 border-b border-black/5 shrink-0">
          <h3 className='font-sans text-lg font-semibold text-[#1c1b1b]'>Comentarios</h3>
        </div>

        {/* Lista de Comentarios (con scroll interno) */}
        <div 
          className="flex-1 overflow-y-auto p-5 space-y-6"
          // Detenemos la propagación aquí también para que el scroll nativo funcione pero no mueva el slide de fondo
          onTouchMove={stopPropagation} 
        >
          {loading ? (
            <div className="flex justify-center p-4">
              <span className="text-sm text-neutral-500 font-sans">Cargando comentarios...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex justify-center p-4">
              <span className="text-sm text-neutral-500 font-sans">Aún no hay comentarios.</span>
            </div>
          ) : (
            comments.map((comment) => {
              const participant = comment.event_participants || {};
              const authorName = participant.display_name || 'Invitado';
              const isHost = participant.role === 'host';
              const timeAgo = getTimeAgo(comment.created_at);
              
              return (
                <div key={comment.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0 mt-0.5 flex items-center justify-center font-bold text-neutral-600 text-xs uppercase">
                    {authorName.charAt(0)}
                  </div>
                  
                  {isHost ? (
                    <div className="bg-[#f3f0ef] rounded-[18px] px-4 py-3 flex-1 border border-black/5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <p className="font-sans text-sm font-semibold text-[#1c1b1b]">{authorName}</p>
                        <BadgeCheck className="w-[14px] h-[14px] text-neutral-600" strokeWidth={2} />
                        <span className="text-[11px] font-sans font-medium text-neutral-500 ml-1">• {timeAgo}</span>
                      </div>
                      <p className="font-sans text-[15px] text-[#444748] mt-1.5 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <p className="font-sans text-sm font-semibold text-[#1c1b1b]">{authorName}</p>
                        <span className="text-[11px] font-sans font-medium text-neutral-500 ml-1">• {timeAgo}</span>
                      </div>
                      <p className="font-sans text-[15px] text-[#444748] mt-0.5 leading-snug">
                        {comment.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="p-4 bg-[#fdf8f8] shrink-0 pb-safe relative">
          
          {/* Emoji Popover */}
          {showEmojis && (
            <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-lg border border-black/5 p-2 flex gap-1 animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
              {QUICK_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewComment(prev => prev + emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-[#f1edec] rounded-full transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-[#f1edec] rounded-full px-4 py-2 border border-black/5 shadow-sm"
          >
            <button 
              type="button" 
              onClick={() => setShowEmojis(!showEmojis)}
              className={`${showEmojis ? 'text-black bg-black/5 rounded-full p-0.5' : 'text-neutral-600'} hover:text-black transition-colors shrink-0 -ml-1 mr-1`}
            >
              <Smile className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </button>
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={participant ? "Escribe un comentario..." : "Inicia sesión para comentar"}
              disabled={!participant || isSubmitting}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-sans mx-3 outline-none placeholder:text-neutral-500 text-[#1c1b1b]"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting || !participant}
              className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 hover:bg-black/80 disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors shadow-sm"
            >
               <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </form>
        </div>

      </div>
    </div>,
    document.body
  );
}
