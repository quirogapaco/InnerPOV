import React, { useState } from 'react';
import { X, Search, UserCircle2, ShieldCheck, Star } from 'lucide-react';
import Input from '../ui/Input';

export default function ParticipantsModal({
  isOpen,
  onClose,
  participants = [],
  currentUser, // Para identificar "Tú"
}) {
  if (!isOpen) return null;

  // Ordenar: HOST primero, luego MODERATOR, luego GUEST
  const roleOrder = { host: 1, moderator: 2, guest: 3 };
  const sortedParticipants = [...participants].sort((a, b) => {
    return (roleOrder[a.role] || 4) - (roleOrder[b.role] || 4);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md shadow-2xl border border-black/5 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-[#fdf8f8]">
          <div className="flex items-center gap-3">
            <h3 className="font-headline text-lg sm:text-xl font-medium text-[#1c1b1b]">
              Participantes
            </h3>
            <span className="bg-[#e4dfd7] text-black font-sans text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {participants.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-black hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista con Scroll */}
        <div className="overflow-y-auto max-h-[380px] p-2 sm:p-4">
          {sortedParticipants.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="font-sans text-sm text-neutral-500">
                Aún no hay participantes en este evento.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {sortedParticipants.map((p) => {
                const isCurrentUser = currentUser?.id === p.user_id;

                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#f7f3f2] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 flex-shrink-0">
                        <UserCircle2 size={18} />
                      </div>
                      <div className="truncate">
                        <p className="font-sans text-xs font-semibold text-[#1c1b1b] flex items-center gap-2 truncate">
                          {p.display_name || 'Usuario'}
                          {isCurrentUser && (
                            <span className="text-[9px] text-neutral-400 font-normal">
                              (Tú)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      {p.role === 'host' && (
                        <span className="flex items-center gap-1 text-black font-sans text-[10px] font-bold uppercase">
                          <Star size={10} /> Host
                        </span>
                      )}
                      {p.role === 'moderator' && (
                        <span className="flex items-center gap-1 text-neutral-600 font-sans text-[10px] font-bold uppercase">
                          <ShieldCheck size={10} /> Mod
                        </span>
                      )}
                      {p.role === 'guest' && (
                        <span className="text-neutral-400 font-sans text-[10px]">
                          Invitado
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
