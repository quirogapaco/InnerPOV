import React from 'react';

export default function Step3Schedules({ formData, updateFormData }) {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline text-3xl md:text-5xl text-black font-medium mb-2">
          Etapas y Retos Fotográficos
        </h1>
        <p className="font-sans text-sm text-neutral-500">
          Paso 3: Organiza los momentos de la fiesta y propone misiones a tus invitados.
        </p>
      </div>

      <div className="p-12 bg-white rounded-[24px] border border-black/5 text-center text-neutral-400 text-xs font-sans">
        [Aquí va el selector de Etapas/Línea de tiempo y las Misiones de los Invitados]
      </div>
    </div>
  );
}