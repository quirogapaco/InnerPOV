import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export default function WizardFooter({
  currentStep,
  totalSteps = 4,
  onPrev,
  onNext,
  isSubmitting = false,
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#fdf8f8]/80 backdrop-blur-xl border-t border-black/5">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between">
        {/* Botón Atrás */}
        <button
          onClick={onPrev}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-semibold transition-all ${
            isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'text-black hover:bg-black/5 active:scale-95'
          }`}
        >
          <ArrowLeft size={16} />
          <span>Atrás</span>
        </button>

        {/* Indicador de paso en Móvil */}
        <span className="md:hidden font-sans text-xs text-neutral-400 uppercase tracking-wider font-semibold">
          PASO {currentStep} DE {totalSteps}
        </span>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-4">
          <span className="hidden md:block font-sans text-xs text-neutral-400 uppercase tracking-widest font-semibold">
            PASO {currentStep} DE {totalSteps}
          </span>

          <button
            onClick={onNext}
            disabled={isSubmitting}
            className="bg-black text-white px-7 md:px-8 py-3 rounded-full font-sans text-xs font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <span>
              {isLastStep
                ? '✦ Publicar Evento'
                : currentStep === 3
                ? 'Ver Resumen'
                : 'Siguiente'}
            </span>
            {!isLastStep && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}