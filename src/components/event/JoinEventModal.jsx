import React from 'react';
import { LogOut, Sparkles, UserCircle2 } from 'lucide-react';
import Button from '../ui/Button';

export default function JoinEventModal({
  event,
  user,
  onJoin,
  onSignOut,
  loading = false,
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-black/5 animate-in fade-in zoom-in duration-200 text-left space-y-6">
        
        {/* Cabecera Unificada */}
        <div className="text-center space-y-1">
          <span className="font-sans text-[10px] font-semibold text-neutral-500 bg-[#f7f3f2] px-3 py-1 rounded-full inline-block tracking-wider uppercase">
            INVITACIÓN
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-medium text-[#1c1b1b] leading-tight">
            Unirse a {event.title}
          </h2>
          <p className="font-sans text-xs text-neutral-500">
            Estás a un paso de compartir fotos y desbloquear retos.
          </p>
        </div>

        {/* Card del Usuario Logueado */}
        <div className="bg-[#f7f3f2] rounded-2xl p-4 flex items-center gap-3 border border-black/5">
          <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
            <UserCircle2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Conectado como
            </p>
            <p className="font-sans text-sm font-bold text-[#1c1b1b] truncate">
              {user?.user_metadata?.full_name || user?.email || 'Usuario'}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            onClick={onJoin}
            disabled={loading}
            className="w-full py-3.5"
          >
            {loading ? 'Uniéndote...' : `Unirme a ${event.title}`}
          </Button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-black font-sans text-xs font-medium py-2 transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión / Cambiar de cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}