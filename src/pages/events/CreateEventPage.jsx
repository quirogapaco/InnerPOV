import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import WizardStepper from '../../components/wizard/WizardStepper';
import WizardFooter from '../../components/wizard/WizardFooter';
import Step1Details from '../../components/wizard/Step1Details';
import Step2Settings from '../../components/wizard/Step2Settings';
import Step3Schedules from '../../components/wizard/Step3Schedules';
import Step4Publish from '../../components/wizard/Step4Publish';
import { Loader2, Sparkles } from 'lucide-react';

export default function CreateEventPage({ onCancel, onEventCreated }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugValid, setIsSlugValid] = useState(true);

  const [formData, setFormData] = useState({
    eventTypeId: null,
    isCustomType: false,
    customTypeName: '',
    title: '',
    slug: '',
    eventDate: '',
    locationName: '',
    latitude: null,
    longitude: null,
    coverPhotoUrl: '',
    coverFile: null,
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

  // 🔍 VALIDACIÓN DEL PASO 1
  const isStep1Valid = () => {
    const hasType = formData.isCustomType
      ? formData.customTypeName.trim().length > 0
      : Boolean(formData.eventTypeId);

    const hasTitle = formData.title.trim().length > 0;
    const hasSlug = formData.slug.trim().length >= 3 && isSlugValid;
    const hasDate = Boolean(formData.eventDate);
    const hasLocationName = formData.locationName.trim().length > 0;
    const hasCoordinates = Boolean(formData.latitude && formData.longitude);
    const hasCover = Boolean(formData.coverPhotoUrl);

    return (
      hasType &&
      hasTitle &&
      hasSlug &&
      hasDate &&
      hasLocationName &&
      hasCoordinates &&
      hasCover
    );
  };

  // 🔍 VALIDACIÓN DEL PASO 3
  const isStep3Valid = () => {
    const activeSchedules = (formData.schedules || []).filter((s) => s.active);
    if (activeSchedules.length === 0) return true;

    const timeToMinutes = (timeStr) => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    for (let i = 0; i < activeSchedules.length; i++) {
      const a = activeSchedules[i];
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);

      if (aStart === null || aEnd === null) return false;

      const adjustedAEnd = aEnd < aStart ? aEnd + 1440 : aEnd;
      if (adjustedAEnd <= aStart) return false;

      for (let j = i + 1; j < activeSchedules.length; j++) {
        const b = activeSchedules[j];
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);

        if (bStart === null || bEnd === null) return false;
        const adjustedBEnd = bEnd < bStart ? bEnd + 1440 : bEnd;

        if (aStart < adjustedBEnd && adjustedAEnd > bStart) {
          return false;
        }
      }
    }
    return true;
  };

  const getIsNextDisabled = () => {
    if (currentStep === 1) return !isStep1Valid();
    if (currentStep === 2) return false;
    if (currentStep === 3) return !isStep3Valid();
    return false;
  };

  const handleNext = () => {
    if (getIsNextDisabled()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handlePublishEvent();
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

  // 🚀 PROCESO DE PUBLICACIÓN TOTAL
  const handlePublishEvent = async () => {
    setIsSubmitting(true);
    try {
      // 0. OBTENER Y VERIFICAR EL USUARIO AUTENTICADO
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No se encontró un usuario autenticado activo. Por favor, inicia sesión de nuevo.');
      }

      let finalCoverUrl = formData.coverPhotoUrl;

      // 1. SUBIDA DE LA IMAGEN A STORAGE
      if (formData.coverFile) {
        const file = formData.coverFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('event-covers').getPublicUrl(filePath);

        finalCoverUrl = publicUrl;
      }

      // 2. CREACIÓN DEL REGISTRO PADRE EN 'events'
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          slug: formData.slug,
          event_date: formData.eventDate,
          location_name: formData.locationName,
          latitude: formData.latitude,
          longitude: formData.longitude,
          cover_photo_url: finalCoverUrl,
          event_type_id: formData.isCustomType ? null : formData.eventTypeId,
          custom_type_name: formData.isCustomType ? formData.customTypeName : null,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // 2b. REGISTRO EN 'event_participants' (CREADOR COMO ADMIN)
      const { error: memberError } = await supabase
        .from('event_participants')
        .insert({
          event_id: newEvent.id,
          user_id: user.id,
          display_name: user.user_metadata?.full_name || 'Creador',
          role: 'MODERATOR',
        });

      if (memberError) throw memberError;

      // 3. REGISTRO EN 'event_settings'
      const { error: settingsError } = await supabase
        .from('event_settings')
        .insert({
          event_id: newEvent.id,
          max_guests: formData.maxGuests,
          max_photos_per_guest: formData.maxPhotosPerGuest,
          allow_videos: formData.allowVideos,
          require_moderation: formData.requireModeration,
        });

      if (settingsError) throw settingsError;

      // 4. REGISTROS EN 'event_schedules'
      const activeSchedules = (formData.schedules || []).filter((s) => s.active);
      if (activeSchedules.length > 0) {
        const schedulesToInsert = activeSchedules.map((s) => ({
          event_id: newEvent.id,
          title: s.title,
          slug: s.slug,
          start_time: formData.eventDate ? `${formData.eventDate}T${s.startTime}:00Z` : null,
          end_time: formData.eventDate ? `${formData.eventDate}T${s.endTime}:00Z` : null,
        }));

        const { error: schedError } = await supabase
          .from('event_schedules')
          .insert(schedulesToInsert);

        if (schedError) throw schedError;
      }

      // 5. REGISTROS EN 'event_challenges'
      if (formData.missions && formData.missions.length > 0) {
        const challengesToInsert = formData.missions.map((m) => ({
          event_id: newEvent.id,
          title: m.name || m.title,
          slug: m.slug,
          description: m.description,
          max_photos_allowed: m.max_photos_allowed || 1,
        }));

        const { error: challengesError } = await supabase.from('event_challenges').insert(challengesToInsert);

        if (challengesError) throw challengesError;
      }

      if (onEventCreated) onEventCreated();
      navigate(`/e/${formData.slug}`);
    } catch (error) {
      console.error('Error al publicar evento:', error);
      alert(error.message || 'Ocurrió un error al guardar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f8] font-sans pb-32 pt-28 relative">
      <WizardStepper currentStep={currentStep} onCancel={onCancel} />

      <main className="max-w-[1200px] mx-auto px-6 md:px-12">
        {currentStep === 1 && (
          <Step1Details
            formData={formData}
            updateFormData={updateFormData}
            setCanProceed={setIsSlugValid}
          />
        )}
        {currentStep === 2 && (
          <Step2Settings formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <Step3Schedules formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && <Step4Publish formData={formData} />}
      </main>

      <WizardFooter
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        isNextDisabled={getIsNextDisabled()}
      />

      {/* OVERLAY LOADER CUANDO IS_SUBMITTING ES TRUE */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 border border-black/5">
            <div className="w-16 h-16 bg-[#F4F1EE] rounded-2xl flex items-center justify-center mx-auto text-black relative">
              <Sparkles size={24} className="animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={36} className="animate-spin text-black stroke-[1.5]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-headline text-xl font-medium text-[#1c1b1b]">
                Tu evento se está creando...
              </h3>
              <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                Estamos configurando tu galería, generando el código QR y preparando las etapas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}