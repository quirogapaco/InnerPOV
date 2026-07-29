import React, { useState } from 'react';
import WizardStepper from '../../components/wizard/WizardStepper';
import WizardFooter from '../../components/wizard/WizardFooter';
import Step1Details from '../../components/wizard/Step1Details';
import Step2Settings from '../../components/wizard/Step2Settings';
import Step3Schedules from '../../components/wizard/Step3Schedules';
import Step4Publish from '../../components/wizard/Step4Publish';

export default function CreateEventPage({ onCancel, onEventCreated }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Objeto central de datos que alimentará los 4 pasos
  const [formData, setFormData] = useState({
    eventTypeId: '',
    title: '',
    slug: '',
    eventDate: '',
    locationName: '',
    latitude: null,
    longitude: null,
    coverPhotoUrl: '',
    maxGuests: 150,
    maxPhotosPerGuest: 30,
    allowVideos: true,
    requireModeration: false,
    schedules: [],
    missions: [],
  });

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Al presionar "Publicar Evento" en el Paso 4
      alert('¡Evento listo para ser guardado en Supabase!');
      if (onEventCreated) onEventCreated();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f8] font-sans pb-32 pt-28">
      {/* 1. Stepper Superior Fijo */}
      <WizardStepper currentStep={currentStep} />

      {/* 2. Contenido Dinámico según el Paso */}
      <main className="max-w-[1200px] mx-auto px-6 md:px-12">
        {currentStep === 1 && (
          <Step1Details formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <Step2Settings formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <Step3Schedules formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && <Step4Publish formData={formData} />}
      </main>

      {/* 3. Barrita de Navegación Fija Abajo */}
      <WizardFooter
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}