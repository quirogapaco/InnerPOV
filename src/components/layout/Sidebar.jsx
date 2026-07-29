import React from 'react';
import { Calendar, Users, Award, Settings, X, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'events', label: 'Mis Eventos', icon: Calendar },
  { id: 'participations', label: 'Participaciones', icon: Users },
  { id: 'subscription', label: 'Suscripción', icon: Award },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, user, isOpen, onClose, onSignOut }) {
  const userName = user?.user_metadata?.full_name || 'Francisco Quiroga';
  const userPlan = 'Plan Premium';

  return (
    <>
      {/* Backdrop oscuro para móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#fdf8f8] border-r border-[#c4c7c7]/20 flex flex-col py-8 px-6 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Encabezado Logo + Botón Cerrar en Móvil */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-2xl text-black font-semibold tracking-tight italic">
              InnerPOV
            </h1>
            <p className="font-sans text-[11px] font-semibold text-neutral-500 tracking-wider uppercase mt-0.5">
              Premium Photo Sharing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black md:hidden rounded-lg hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación de Pestañas */}
        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose(); // Cierra el menú al hacer clic en móvil
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-sans text-xs font-semibold transition-all duration-200 text-left ${
                  isActive
                    ? 'text-black font-bold border-r-2 border-black bg-[#e4dfd7]/40'
                    : 'text-neutral-500 hover:text-black hover:bg-[#e4dfd7]/20'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-black' : 'text-neutral-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tarjeta de Usuario Fija Abajo */}
        <div className="mt-auto pt-6 border-t border-black/5">
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#f7f3f2] border border-black/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#e7e2da] flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden text-left">
                <p className="font-sans text-xs font-semibold text-black truncate">
                  {userName}
                </p>
                <p className="font-sans text-[10px] text-neutral-500 truncate">
                  {userPlan}
                </p>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Cerrar sesión"
                className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded-lg"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}