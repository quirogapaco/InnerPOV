import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MyEventsView from './events/MyEventsView';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <MyEventsView onNewEventClick={() => navigate('/create-event')} />
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