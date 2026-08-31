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
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const getScheduleTimeMeta = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes === null || endMinutes === null) {
      return {
        crossesMidnight: false,
        isValidDuration: false,
        durationMinutes: 0,
        nextDayOffset: 0,
      };
    }

    const crossesMidnight = endMinutes <= startMinutes;
    const effectiveEndMinutes = crossesMidnight ? endMinutes + 1440 : endMinutes;
    const durationMinutes = effectiveEndMinutes - startMinutes;

    return {
      crossesMidnight,
      isValidDuration: durationMinutes >= 15 && startMinutes !== endMinutes,
      durationMinutes,
      nextDayOffset: crossesMidnight ? 1 : 0,
    };
  };

  const formatScheduleIso = (baseDate, timeValue, dayOffset = 0) => {
    if (!baseDate || !timeValue) return null;
    const [hours, minutes] = timeValue.split(':').map(Number);
    const date = new Date(`${baseDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    date.setUTCHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  const handlePublishEvent = async () => {
    setIsSubmitting(true);

    let uploadedCoverPath = null;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No se encontró un usuario autenticado activo. Por favor, inicia sesión de nuevo.');
      }

      let finalCoverUrl = formData.coverPhotoUrl;

      if (formData.coverFile) {
        const file = formData.coverFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        uploadedCoverPath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(uploadedCoverPath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('event-covers').getPublicUrl(uploadedCoverPath);

        finalCoverUrl = publicUrl;
      }

      const activeSchedules = (formData.schedules || []).filter((s) => s.active);
      const schedulesPayload = activeSchedules.map((s) => {
        const scheduleMeta = getScheduleTimeMeta(s.startTime, s.endTime);

        if (!scheduleMeta.isValidDuration) {
          throw new Error(`La etapa "${s.title}" debe tener una duración mínima de 15 minutos.`);
        }

        return {
          title: s.title,
          slug: s.slug,
          start_time: formData.eventDate ? formatScheduleIso(formData.eventDate, s.startTime, 0) : null,
          end_time: formData.eventDate
            ? formatScheduleIso(formData.eventDate, s.endTime, scheduleMeta.nextDayOffset)
            : null,
          location_name: s.location_name || null,
          latitude: s.latitude || null,
          longitude: s.longitude || null,
          instructions: s.instructions || null,
        };
      });

      const missionsPayload = (formData.missions || []).map((m) => ({
        name: m.name,
        slug: m.slug,
        description: m.description,
        is_system_default: m.is_system_default ?? false,
      }));

      const { data: createdEvent, error: rpcError } = await supabase.rpc('create_event_with_data', {
        p_title: formData.title,
        p_slug: formData.slug,
        p_event_date: formData.eventDate,
        p_location_name: formData.locationName,
        p_latitude: formData.latitude,
        p_longitude: formData.longitude,
        p_cover_photo_url: finalCoverUrl,
        p_event_type_id: formData.isCustomType ? null : formData.eventTypeId,
        p_custom_type_name: formData.isCustomType ? formData.customTypeName : null,
        p_status: 'active',
        p_max_guests: formData.maxGuests,
        p_max_photos_per_guest: formData.maxPhotosPerGuest,
        p_allow_videos: formData.allowVideos,
        p_require_moderation: formData.requireModeration,
        p_user_id: user.id,
        p_schedules: schedulesPayload,
        p_missions: missionsPayload,
      });

      if (rpcError) throw rpcError;

      const eventResult = Array.isArray(createdEvent) ? createdEvent[0] : createdEvent;

      if (!eventResult?.event_id) {
        throw new Error('La creación del evento no devolvió un identificador válido.');
      }

      if (onEventCreated) onEventCreated();
      navigate(`/e/${formData.slug}`);
    } catch (error) {
      console.error('Error al publicar evento:', error);

      if (uploadedCoverPath) {
        try {
          await supabase.storage.from('event-covers').remove([uploadedCoverPath]);
        } catch (cleanupError) {
          console.error('No se pudo limpiar la imagen subida tras el error:', cleanupError);
        }
      }

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