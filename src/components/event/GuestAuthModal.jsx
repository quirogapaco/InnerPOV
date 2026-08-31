import React, { useState } from 'react';
import { Mail, User, Lock, Sparkles } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function GuestAuthModal({
  event,
  onGuestJoin,
  onGoogleAuth,
  onEmailSignIn,
  onEmailSignUp,
  loading = false,
}) {
  // 'auth' (Iniciar Sesión / Registro) vs 'guest' (Entrar como Invitado)
  const [activeTab, setActiveTab] = useState('auth'); 
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await onEmailSignIn({ email, password });
      } else {
        await onEmailSignUp({ email, password, fullName });
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error en la autenticación.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setErrorMessage('');
    try {
      await onGuestJoin(guestName.trim());
    } catch (error) {
      setErrorMessage(error.message || 'Error al unirse como invitado.');
    }
  };

  const handleGoogleClick = async () => {
    setErrorMessage('');
    try {
      await onGoogleAuth();
    } catch (error) {
      setErrorMessage(error.message || 'Error al conectar con Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-black/5 animate-in fade-in zoom-in duration-200 text-left">
        
        {/* Cabecera Unificada */}
        <div className="mb-6 text-center space-y-1">
          <span className="font-sans text-[10px] font-semibold text-neutral-500 bg-[#f7f3f2] px-3 py-1 rounded-full inline-block tracking-wider uppercase">
            ACCESO AL EVENTO
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-medium text-[#1c1b1b] leading-tight">
            Unirse a {event?.title || 'este evento'}
          </h2>
          <p className="font-sans text-xs text-neutral-500">
            Elige cómo deseas participar para ver la galería y retos.
          </p>
        </div>

        {/* TabSwitcher Corregido con Selección Visible */}
        <div className="flex bg-[#f7f3f2] p-1 rounded-full w-full mb-5 border border-black/5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('auth');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-full font-sans text-xs transition-all duration-200 ${
              activeTab === 'auth'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-500 hover:text-black font-medium'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('guest');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-full font-sans text-xs transition-all duration-200 ${
              activeTab === 'guest'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-500 hover:text-black font-medium'
            }`}
          >
            Entrar como Invitado
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {errorMessage}
          </div>
        )}

        {/* OPCIÓN 1: CON CUENTA (LOGIN / REGISTRO) */}
        {activeTab === 'auth' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <Input
                label="Nombre completo"
                placeholder="Ej. Ana López"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User size={16} className="text-neutral-400" />}
                required
              />
            )}

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="hola@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rightAction={<Mail size={14} className="text-neutral-400" />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightAction={<Lock size={14} className="text-neutral-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={authLoading || loading}
              className="w-full mt-2"
            >
              {authLoading
                ? 'Ingresando...'
                : authMode === 'login'
                ? 'Iniciar Sesión y Entrar'
                : 'Crear Cuenta y Entrar'}
            </Button>

            {/* Alternar entre Login y Registro sin pestañas anidadas */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setErrorMessage('');
                }}
                className="text-xs font-sans text-neutral-500 hover:text-black transition-colors"
              >
                {authMode === 'login' ? (
                  <>
                    ¿No tienes cuenta? <strong className="underline underline-offset-2 text-black">Regístrate</strong>
                  </>
                ) : (
                  <>
                    ¿Ya tienes cuenta? <strong className="underline underline-offset-2 text-black">Inicia sesión</strong>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center my-4 w-full">
              <div className="flex-grow h-[1px] bg-neutral-200" />
              <span className="px-3 font-sans text-[10px] text-neutral-400 uppercase tracking-widest">
                o
              </span>
              <div className="flex-grow h-[1px] bg-neutral-200" />
            </div>

            {/* Botón Continuar con Google */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleClick}
              disabled={authLoading || loading}
              className="w-full"
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              }
            >
              Continuar con Google
            </Button>
          </form>
        ) : (
          /* OPCIÓN 2: ENTRAR COMO INVITADO (GUEST RÁPIDO) */
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="bg-[#f7f3f2] rounded-2xl p-4 border border-black/5 space-y-2">
              <div className="flex items-center gap-2 text-[#1c1b1b]">
                <Sparkles size={16} />
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Acceso Rápido sin Contraseña
                </p>
              </div>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Ingresa tu nombre o apodo para poder subir fotos y participar en los retos directamente.
              </p>
              <div className="pt-2">
                <Input
                  label="Tu nombre o apodo"
                  placeholder="Ej. Carlos M."
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  icon={<User size={16} className="text-neutral-400" />}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !guestName.trim()}
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar al Evento'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}