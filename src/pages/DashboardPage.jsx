import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MyEventsView from './events/MyEventsView';
import CreateEventPage from './events/CreateEventPage';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false); // Estado del Wizard
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Si el usuario está creando un evento, muestra la vista completa del Wizard
  if (isCreatingEvent) {
    return (
      <CreateEventPage
        onCancel={() => setIsCreatingEvent(false)}
        onEventCreated={() => setIsCreatingEvent(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f8] font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSignOut={signOut}
      />

      <main className="md:ml-64 min-h-screen flex flex-col">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <div className="p-6 md:p-8 max-w-[1400px] w-full mx-auto flex-1">
          {activeTab === 'events' && (
            <MyEventsView onNewEventClick={() => setIsCreatingEvent(true)} />
          )}

          {activeTab === 'participations' && (
            <div className="py-16 text-center text-neutral-400 font-sans">
              <h3 className="font-headline text-2xl text-black">Participaciones</h3>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="py-16 text-center text-neutral-400 font-sans">
              <h3 className="font-headline text-2xl text-black">Suscripción & Plan</h3>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="py-16 text-center text-neutral-400 font-sans">
              <h3 className="font-headline text-2xl text-black">Configuración</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}