import React from 'react';

export default function Step4Publish({ formData }) {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline text-3xl md:text-5xl text-black font-medium mb-2">
          ¡Todo listo!
        </h1>
        <p className="font-sans text-sm text-neutral-500">
          Paso 4: Revisa el resumen de tu evento y genera los códigos de acceso para tus invitados.
        </p>
      </div>

      <div className="p-12 bg-white rounded-[24px] border border-black/5 text-center text-neutral-400 text-xs font-sans">
        [Aquí va la tarjeta de vista previa del evento y la tarjeta de acceso imprimible con QR]
      </div>
    </div>
  );
}