import React from 'react';
import { Bell, Menu } from 'lucide-react';

export default function Header({ onOpenMobileMenu }) {
  return (
    <header className="flex justify-between items-center w-full px-6 md:px-8 h-16 md:h-20 sticky top-0 bg-[#fdf8f8]/80 backdrop-blur-md z-40 border-b border-[#c4c7c7]/10">
      {/* Botón menú hamburguesa (solo móvil) */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-neutral-600 hover:text-black transition-colors rounded-xl hover:bg-neutral-100"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-headline text-xl text-black font-semibold italic">
          InnerPOV
        </h1>
      </div>

      {/* Espaciador desktop */}
      <div className="hidden md:block" />

      {/* Notificaciones */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-500 hover:text-black transition-colors rounded-full hover:bg-neutral-100">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}