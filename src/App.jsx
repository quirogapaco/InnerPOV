import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/events/CreateEventPage';
import EventDetailView from './pages/events/EventDetailView';
import MissionDetailView from './pages/events/MissionDetailView';

function AppContent() {
  const { user, loading } = useAuth();

  // Spinner de carga mientras Supabase verifica la sesión en localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f8] font-sans text-xs text-neutral-400">
        Cargando InnerPOV...
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública para ver un evento sin requerir autenticación */}
      <Route path="/e/:slug" element={<EventDetailView />} />
      <Route path="/e/:slug/mission/:albumId" element={<MissionDetailView />} />

      {/* Ruta para inicio de sesión / registro */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Rutas que requieren autenticación */}
      <Route
        path="/"
        element={user ? <DashboardPage /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/create-event"
        element={
          user ? (
            <CreateEventPage
              onCancel={() => window.history.back()}
              onEventCreated={() => { }}
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}