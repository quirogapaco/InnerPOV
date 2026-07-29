import React from 'react';

export default function Step2Settings({ formData, updateFormData }) {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline text-3xl md:text-5xl text-black font-medium mb-2">
          Configuración y Límites
        </h1>
        <p className="font-sans text-sm text-neutral-500">
          Paso 2: Define los permisos y reglas para tus invitados.
        </p>
      </div>

      <div className="p-12 bg-white rounded-[24px] border border-black/5 text-center text-neutral-400 text-xs font-sans">
        [Aquí van los campos del Paso 2: Límite de invitados, máx. fotos, permitir videos y moderación]
      </div>
    </div>
  );
}