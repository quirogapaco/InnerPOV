import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthCarousel from '../components/auth/AuthCarousel';
import TabSwitcher from '../components/ui/TabSwitcher';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle, user } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Manejo centralizado del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[AuthPage] handleSubmit iniciado', { activeTab, email: formData.email });
    setLoading(true);
    setErrorMessage('');

    try {
      if (activeTab === 'login') {
        console.log('[AuthPage] llamando a signIn...');
        const res = await signIn({
          email: formData.email,
          password: formData.password,
        });
        console.log('[AuthPage] signIn exitoso', res);
      } else {
        console.log('[AuthPage] llamando a signUp...');
        const res = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
        console.log('[AuthPage] signUp exitoso', res);
      }
    } catch (error) {
      console.error('[AuthPage] Error en handleSubmit:', error);
      setErrorMessage(error.message || 'Ocurrió un error en la autenticación.');
    } finally {
      console.log('[AuthPage] finally: cambiando loading a false');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(error.message || 'Error al iniciar sesión con Google.');
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden bg-[#FDFBF9]">
      <AuthCarousel />

      <main className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16 relative z-30">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center">
          <h1 className="font-headline text-4xl md:text-5xl text-[#1A1A1A] italic tracking-tight mb-8">
            InnerPOV
          </h1>

          <div className="w-full mb-6">
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {errorMessage && (
            <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-left">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {activeTab === 'signup' && (
              <Input
                label="Nombre Completo"
                placeholder="Ej. Ana García"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="hola@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />

            <Button type="submit" variant="primary" disabled={loading} className="mt-2">
              {loading
                ? 'Cargando...'
                : activeTab === 'login'
                ? 'Iniciar Sesión'
                : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="flex items-center my-6 w-full">
            <div className="flex-grow h-[1px] bg-neutral-200" />
            <span className="px-4 font-sans text-[11px] text-neutral-400 uppercase tracking-widest">
              o
            </span>
            <div className="flex-grow h-[1px] bg-neutral-200" />
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleAuth}
            disabled={loading}
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

          <footer className="mt-12 flex flex-col items-center space-y-3">
            <div className="flex space-x-6">
              <a href="#" className="font-sans text-xs text-neutral-500 hover:text-black underline underline-offset-4 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="font-sans text-xs text-neutral-500 hover:text-black underline underline-offset-4 transition-colors">
                Terms of Service
              </a>
            </div>
            <p className="font-sans text-[10px] text-neutral-400 uppercase tracking-widest">
              © 2026 InnerPOV. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}