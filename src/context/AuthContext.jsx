import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Obtener la sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Escuchar cambios de estado en tiempo real (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureSupabaseConfigured = () => {
    if (!supabase) {
      throw new Error('Falta configurar Supabase: crea un archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
    }
  };

  // --- MÉTODOS MODULARES DE AUTENTICACIÓN ---

  // A. Registro Directo con Email y Password (Sin verificación de correo)
  const signUp = async ({ email, password, fullName }) => {
    ensureSupabaseConfigured();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Guarda el nombre en los metadatos del usuario
        },
      },
    });

    if (error) throw error;
    return data;
  };

  // B. Iniciar Sesión Tradicional
  const signIn = async ({ email, password }) => {
    ensureSupabaseConfigured();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  // C. Iniciar Sesión / Registro con Google OAuth
  const signInWithGoogle = async () => {
    ensureSupabaseConfigured();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });

    if (error) throw error;
    return data;
  };

  // D. Cerrar Sesión
  const signOut = async () => {
    ensureSupabaseConfigured();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom Hook para consumir el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};