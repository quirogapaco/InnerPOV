import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { renderIcon } from '../../utils/iconMapper';
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Camera,
  Plus,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';

const DEFAULT_COVERS = [
  {
    id: 'cover-1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    alt: 'Boda clásica romántica',
  },
  {
    id: 'cover-2',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
    alt: 'Detalles de mesa y recepción',
  },
  {
    id: 'cover-3',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    alt: 'Celebración elegante',
  },
];

export default function Step1Details({ formData, updateFormData, setCanProceed }) {
  const [eventTypes, setEventTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState({ isAvailable: true, message: '' });

  // 1. CARGAR CATALOGO DESDE SUPABASE
  useEffect(() => {
    async function fetchEventTypes() {
      try {
        const { data, error } = await supabase
          .from('event_types')
          .select('id, name, slug, icon')
          .order('name', { ascending: true });

        if (error) throw error;

        setEventTypes(data || []);

        // Si no hay un tipo seleccionado previa/e, asigna la Boda por defecto
        if (!formData.eventTypeId && !formData.isCustomType && data?.length > 0) {
          const defaultBoda = data.find((t) => t.slug === 'boda') || data[0];
          updateFormData({ eventTypeId: defaultBoda.id, isCustomType: false });
        }
      } catch (err) {
        console.error('Error al cargar tipos de evento:', err);
      } finally {
        setLoadingTypes(false);
      }
    }

    fetchEventTypes();

    if (!formData.coverPhotoUrl && DEFAULT_COVERS.length > 0) {
      updateFormData({ coverPhotoUrl: DEFAULT_COVERS[0].url });
    }
  }, []);

  // Generador de Slug
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Verificación de disponibilidad del slug
  const checkSlugAvailability = async (slugToCheck) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus({ isAvailable: false, message: 'El enlace debe tener al menos 3 caracteres.' });
      if (setCanProceed) setCanProceed(false);
      return;
    }

    setCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slugToCheck)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSlugStatus({
          isAvailable: false,
          message: 'Este enlace ya está en uso. Intenta con uno personalizado.',
        });
        if (setCanProceed) setCanProceed(false);
      } else {
        setSlugStatus({ isAvailable: true, message: '¡Enlace disponible!' });
        if (setCanProceed) setCanProceed(true);
      }
    } catch (err) {
      console.error('Error verificando slug:', err);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const newSlug = generateSlug(newTitle);
    updateFormData({ title: newTitle, slug: newSlug });
    checkSlugAvailability(newSlug);
  };

  // Selección de tipo estándar (Boda, Corporativo, etc.)
  const handleSelectStandardType = (typeId) => {
    updateFormData({
      eventTypeId: typeId,
      isCustomType: false,
      customTypeName: '',
    });
  };

  // Selección de la opción "Otro"
  const handleSelectCustomType = () => {
    updateFormData({
      eventTypeId: null,
      isCustomType: true,
      customTypeName: formData.customTypeName || '',
    });
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-10 text-left animate-in fade-in duration-500">
      <div>
        <span className="font-sans text-[11px] font-semibold text-neutral-600 bg-[#f7f3f2] px-3.5 py-1.5 rounded-full mb-3 inline-block tracking-wider uppercase">
          PASO 1: FUNDAMENTOS
        </span>
        <h1 className="font-headline text-3xl md:text-5xl text-[#1c1b1b] font-medium mb-2 leading-tight">
          Cuéntanos sobre el evento
        </h1>
        <p className="font-headline italic text-base md:text-lg text-[#444748]">
          Detalles básicos para personalizar la experiencia.
        </p>
      </div>

      {/* Selector Dinámico de Tipo de Evento */}
      <section className="space-y-4">
        <label className="font-sans text-xs font-semibold uppercase tracking-widest text-[#444748] block ml-1">
          Tipo de Evento
        </label>

        {loadingTypes ? (
          <div className="flex items-center gap-2 py-6 text-neutral-400 font-sans text-xs">
            <Loader2 size={16} className="animate-spin" /> Cargando catálogo de eventos...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Opciones devueltas por la BD */}
            {eventTypes.map((type) => {
              const isSelected = !formData.isCustomType && formData.eventTypeId === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectStandardType(type.id)}
                  className={`relative p-4 rounded-2xl text-left transition-all duration-300 ${
                    isSelected
                      ? 'bg-white border-2 border-black shadow-sm'
                      : 'bg-white border border-black/5 hover:border-black/30'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      isSelected ? 'bg-black text-white' : 'bg-[#e4dfd7]/50 text-black'
                    }`}
                  >
                    {renderIcon(type.icon, { size: 20 })}
                  </div>
                  <p
                    className={`font-sans text-xs font-semibold truncate ${
                      isSelected ? 'text-black' : 'text-[#444748]'
                    }`}
                  >
                    {type.name}
                  </p>
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-black">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Opción Virtual "Otro / Personalizado" */}
            <button
              type="button"
              onClick={handleSelectCustomType}
              className={`relative p-4 rounded-2xl text-left transition-all duration-300 ${
                formData.isCustomType
                  ? 'bg-white border-2 border-black shadow-sm'
                  : 'bg-white border border-black/5 hover:border-black/30'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  formData.isCustomType ? 'bg-black text-white' : 'bg-[#e4dfd7]/50 text-black'
                }`}
              >
                <Sparkles size={20} />
              </div>
              <p
                className={`font-sans text-xs font-semibold ${
                  formData.isCustomType ? 'text-black' : 'text-[#444748]'
                }`}
              >
                Otro
              </p>
              {formData.isCustomType && (
                <div className="absolute top-3 right-3 text-black">
                  <CheckCircle2 size={18} />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Input condicional cuando eligen "Otro" */}
        {formData.isCustomType && (
          <div className="pt-2 animate-in fade-in duration-300">
            <label className="font-sans text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5 ml-1">
              Especifica el tipo de evento
            </label>
            <input
              type="text"
              placeholder="Ej. Aniversario de Oro, Bautizo, Revelación de Sexo..."
              value={formData.customTypeName || ''}
              onChange={(e) => updateFormData({ customTypeName: e.target.value })}
              className="w-full bg-[#F4F1EE] border-none rounded-xl p-3.5 font-sans text-sm text-[#1c1b1b] placeholder-neutral-400 focus:ring-1 focus:ring-black focus:bg-white transition-all outline-none"
            />
          </div>
        )}
      </section>

      {/* Resto del formulario (Título, Slug, Fecha, Ubicación, Portada) */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold text-[#444748] uppercase tracking-widest ml-1">
              Título del Evento
            </label>
            <input
              type="text"
              placeholder="Ej. Boda de Sofía & Mateo"
              value={formData.title || ''}
              onChange={handleTitleChange}
              className="bg-[#F4F1EE] border-none rounded-xl p-4 font-sans text-sm text-[#1c1b1b] placeholder-neutral-400 focus:ring-1 focus:ring-black focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="font-sans text-xs font-semibold text-[#444748] uppercase tracking-widest">
                Enlace Personalizado
              </label>
              {checkingSlug && (
                <span className="flex items-center gap-1 font-sans text-[11px] text-neutral-400">
                  <Loader2 size={12} className="animate-spin" /> Verificando...
                </span>
              )}
            </div>

            <div
              className={`flex items-center bg-[#F4F1EE] rounded-xl px-4 transition-all border ${
                formData.slug && !checkingSlug
                  ? slugStatus.isAvailable
                    ? 'border-emerald-500/50 focus-within:ring-emerald-500'
                    : 'border-red-400 focus-within:ring-red-400'
                  : 'border-transparent focus-within:ring-black'
              }`}
            >
              <span className="text-neutral-400 font-sans text-xs font-medium select-none">
                innerpov.app/e/
              </span>
              <input
                type="text"
                placeholder="boda-sofia-mateo"
                value={formData.slug || ''}
                onChange={(e) => {
                  const customSlug = generateSlug(e.target.value);
                  updateFormData({ slug: customSlug });
                  checkSlugAvailability(customSlug);
                }}
                className="bg-transparent border-none p-4 flex-1 font-sans text-sm text-[#1c1b1b] outline-none focus:ring-0"
              />
              {formData.slug && !checkingSlug && (
                <div>
                  {slugStatus.isAvailable ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                </div>
              )}
            </div>

            {formData.slug && !checkingSlug && (
              <p
                className={`text-[11px] font-sans ml-1 ${
                  slugStatus.isAvailable ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {slugStatus.message}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold text-[#444748] uppercase tracking-widest ml-1">
              Fecha
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.eventDate || ''}
                onChange={(e) => updateFormData({ eventDate: e.target.value })}
                className="w-full bg-[#F4F1EE] border-none rounded-xl p-4 font-sans text-sm text-[#1c1b1b] outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all"
              />
              <CalendarIcon
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-semibold text-[#444748] uppercase tracking-widest ml-1">
              Ubicación
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Quinta San Luis, Ambato, Ecuador"
                value={formData.locationName || ''}
                onChange={(e) => updateFormData({ locationName: e.target.value })}
                className="w-full bg-[#F4F1EE] border-none rounded-xl p-4 font-sans text-sm text-[#1c1b1b] outline-none pr-12 focus:ring-1 focus:ring-black focus:bg-white transition-all"
              />
              <MapPin
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Foto de Portada */}
        <div className="flex flex-col gap-3 pt-2">
          <label className="font-sans text-xs font-semibold text-[#444748] uppercase tracking-widest ml-1">
            Foto de Portada
          </label>

          <div className="relative h-60 rounded-[24px] overflow-hidden border border-black/5 group cursor-pointer bg-[#F4F1EE]">
            {formData.coverPhotoUrl ? (
              <img
                src={formData.coverPhotoUrl}
                alt="Portada"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
                <Camera size={32} />
                <span className="font-sans text-xs">Selecciona una imagen de portada</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                <Camera size={16} className="text-white" />
                <span className="text-white font-sans text-xs font-semibold">
                  Cambiar Portada
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
            {DEFAULT_COVERS.map((cover) => {
              const isSelected = formData.coverPhotoUrl === cover.url;
              return (
                <button
                  key={cover.id}
                  type="button"
                  onClick={() => updateFormData({ coverPhotoUrl: cover.url })}
                  className={`flex-shrink-0 w-28 h-18 rounded-xl overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-black ring-2 ring-black/10'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={cover.url} alt={cover.alt} className="w-full h-full object-cover" />
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                const url = prompt('Ingresa la URL de una imagen para la portada:');
                if (url) updateFormData({ coverPhotoUrl: url });
              }}
              className="flex-shrink-0 w-28 h-18 rounded-xl bg-[#F4F1EE] flex flex-col items-center justify-center border border-dashed border-neutral-300 text-neutral-500 hover:text-black hover:border-black transition-colors"
            >
              <Plus size={20} />
              <span className="font-sans text-[10px] font-semibold mt-1">Personalizada</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}