import React from 'react';

export default function TabSwitcher({ activeTab, onTabChange }) {
  return (
    <div class="w-full bg-[#f7f3f2] p-1 rounded-full flex items-center border border-black/5">
      <button
        type="button"
        onClick={() => onTabChange('login')}
        class={`flex-1 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 ${
          activeTab === 'login'
            ? 'bg-white text-[#1A1A1A] shadow-sm'
            : 'text-neutral-500 hover:text-[#1A1A1A]'
        }`}
      >
        Iniciar Sesión
      </button>
      <button
        type="button"
        onClick={() => onTabChange('signup')}
        class={`flex-1 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 ${
          activeTab === 'signup'
            ? 'bg-white text-[#1A1A1A] shadow-sm'
            : 'text-neutral-500 hover:text-[#1A1A1A]'
        }`}
      >
        Crear Cuenta
      </button>
    </div>
  );
}