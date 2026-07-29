import React from 'react';
import { Check, Bell } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Detalles' },
  { number: 2, label: 'Ajustes' },
  { number: 3, label: 'Cronograma' },
  { number: 4, label: 'Publicar' },
];

export default function WizardStepper({ currentStep, user }) {
  const userAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fdf8f8]/80 backdrop-blur-xl border-b border-black/5">
      <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1200px] mx-auto">
        {/* Logo Brand */}
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-2xl font-bold tracking-tight text-black italic">
            InnerPOV
          </h1>
        </div>

        {/* Barrita de Pasos (Stepper) - Visible en Desktop */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-black text-white'
                        : isActive
                        ? 'border-2 border-black text-black bg-white'
                        : 'border border-[#E5E0D8] text-neutral-400 bg-transparent'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : step.number}
                  </div>
                  <span
                    className={`font-sans text-xs ${
                      isActive || isCompleted
                        ? 'font-semibold text-black'
                        : 'text-neutral-400 font-normal'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Línea conectora entre pasos */}
                {index < STEPS.length - 1 && (
                  <div className="h-[1px] w-6 lg:w-10 bg-black/10" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Perfil & Notificaciones */}
        <div className="flex items-center gap-3 md:gap-4">
          <button className="p-2 text-neutral-500 hover:text-black transition-colors rounded-full hover:bg-black/5">
            <Bell size={20} />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-black/10 flex-shrink-0">
            <img
              src={userAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}