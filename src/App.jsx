import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

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

  // Si existe sesión activa -> Muestra el Dashboard, si no -> Muestra AuthPage
  return user ? <DashboardPage /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}