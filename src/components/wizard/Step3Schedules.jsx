import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Clock,
  Plus,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Circle,
  Lightbulb,
  X,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

export default function Step3Schedules({ formData, updateFormData }) {
  const [loadingDefaults, setLoadingTypes] = useState(false);
  const [defaultTasksCatalog, setDefaultTasksCatalog] = useState([]);

  // Estados locales para los datos del Paso 3
  const [schedules, setSchedules] = useState(formData.schedules || []);
  const [missions, setMissions] = useState(formData.missions || []);

  // Modal para agregar/editar etapas del cronograma
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('18:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('19:00');

  // Modal para agregar retos personalizados
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDescription] = useState('');

  // Helper para generar slug a partir de un texto
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

  // Helper para convertir "HH:MM" a minutos para ordenar
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // CONSULTAR TABLAS POR DEFECTO SEGÚN EL EVENT_TYPE_ID
  useEffect(() => {
    if (formData.schedules?.length > 0 || formData.missions?.length > 0) {
      return;
    }

    if (formData.isCustomType || !formData.eventTypeId) {
      setSchedules([]);
      setMissions([]);
      setDefaultTasksCatalog([]);
      return;
    }

    async function fetchDefaults() {
      setLoadingTypes(true);
      try {
        const { data: defaultSchedulesData, error: schedErr } = await supabase
          .from('default_event_schedules')
          .select('id, title, slug, suggested_order')
          .eq('event_type_id', formData.eventTypeId)
          .order('suggested_order', { ascending: true });

        if (schedErr) throw schedErr;

        const { data: defaultTasksData, error: tasksErr } = await supabase
          .from('default_event_tasks')
          .select('id, title, description')
          .eq('event_type_id', formData.eventTypeId);

        if (tasksErr) throw tasksErr;

        const initialSchedules = (defaultSchedulesData || []).map((ds, index) => ({
          id: `default-s-${index}`,
          title: ds.title,
          slug: ds.slug || generateSlug(ds.title),
          startTime: '18:00',
          endTime: '19:00',
          active: false,
          isDefault: true, // Identificador de origen
        }));

        const initialTasksCatalog = (defaultTasksData || []).map((dt) => ({
          id: dt.id,
          name: dt.title,
          slug: generateSlug(dt.title),
          description: dt.description || '',
          is_system_default: true,
        }));

        setDefaultTasksCatalog(initialTasksCatalog);
        setSchedules(initialSchedules);
        setMissions([]);
      } catch (error) {
        console.error('Error al cargar datos por defecto:', error);
      } finally {
        setLoadingTypes(false);
      }
    }

    fetchDefaults();
  }, [formData.eventTypeId, formData.isCustomType]);

  // Sincronización continua con el estado global
  useEffect(() => {
    updateFormData({
      schedules,
      missions,
    });
  }, [schedules, missions]);

  // --- MANEJO DE CRONOGRAMA ---

  // Abrir modal para crear
  const handleOpenAddSchedule = () => {
    setEditingScheduleId(null);
    setScheduleTitle('');
    setScheduleStartTime('20:00');
    setScheduleEndTime('21:00');
    setShowScheduleModal(true);
  };

  // Abrir modal para editar
  const handleOpenEditSchedule = (stage) => {
    setEditingScheduleId(stage.id);
    setScheduleTitle(stage.title);
    setScheduleStartTime(stage.startTime || '18:00');
    setScheduleEndTime(stage.endTime || '19:00');
    setShowScheduleModal(true);
  };

  // Guardar (Crear o Editar) desde el modal
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    if (editingScheduleId) {
      // Editar etapa existente
      setSchedules((prev) =>
        prev.map((item) =>
          item.id === editingScheduleId
            ? {
                ...item,
                title: scheduleTitle.trim(),
                slug: generateSlug(scheduleTitle),
                startTime: scheduleStartTime,
                endTime: scheduleEndTime,
              }
            : item
        )
      );
    } else {
      // Agregar nueva etapa
      const newSchedule = {
        id: `custom-s-${Date.now()}`,
        title: scheduleTitle.trim(),
        slug: generateSlug(scheduleTitle),
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        active: true,
        isDefault: false,
      };
      setSchedules((prev) => [...prev, newSchedule]);
    }

    setShowScheduleModal(false);
  };

  // Actualizar checkbox activo/inactivo
  const handleToggleScheduleActive = (id, active) => {
    setSchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active } : item))
    );
  };

  // Eliminar etapa (Desactiva si es por defecto, borra si es personalizada)
  const handleDeleteSchedule = (stage) => {
    if (stage.isDefault) {
      // Si es por defecto, solo se desmarca visualmente
      handleToggleScheduleActive(stage.id, false);
    } else {
      // Si fue creada por el usuario, se elimina del estado
      setSchedules((prev) => prev.filter((item) => item.id !== stage.id));
    }
  };

  // Ordenar etapas por hora de inicio (startTime)
  const sortedSchedules = [...schedules].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // --- VALIDACIÓN DE HORARIOS MONTADOS/INVÁLIDOS ---
  const getScheduleError = () => {
    const activeSchedules = schedules.filter((s) => s.active);

    for (let i = 0; i < activeSchedules.length; i++) {
      const a = activeSchedules[i];
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);

      if (aStart === null || aEnd === null) {
        return 'Por favor ingresa horas válidas para todas las etapas seleccionadas.';
      }

      const adjustedAEnd = aEnd < aStart ? aEnd + 1440 : aEnd;
      if (adjustedAEnd <= aStart) {
        return `La hora de fin en "${a.title}" debe ser posterior a la hora de inicio.`;
      }

      for (let j = i + 1; j < activeSchedules.length; j++) {
        const b = activeSchedules[j];
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);

        if (bStart === null || bEnd === null) continue;
        const adjustedBEnd = bEnd < bStart ? bEnd + 1440 : bEnd;

        // Choque de rangos horarios
        if (aStart < adjustedBEnd && adjustedAEnd > bStart) {
          return `Conflicto de horario: Las etapas "${a.title}" y "${b.title}" tienen horas montadas.`;
        }
      }
    }
    return null;
  };

  const errorMessage = getScheduleError();

  // --- MANEJO DE RETOS / MISIONES ---
  const isMissionSelected = (slug) => {
    return missions.some((m) => m.slug === slug);
  };

  const handleToggleMission = (catalogTask) => {
    if (isMissionSelected(catalogTask.slug)) {
      setMissions((prev) => prev.filter((m) => m.slug !== catalogTask.slug));
    } else {
      setMissions((prev) => [...prev, catalogTask]);
    }
  };

  const handleAddCustomMission = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const slug = generateSlug(customTitle);
    const newMission = {
      id: `custom-m-${Date.now()}`,
      name: customTitle.trim(),
      slug: slug,
      description: customDesc.trim() || 'Desafío fotográfico para la galería del evento.',
      is_system_default: false,
    };

    setMissions((prev) => [...prev, newMission]);
    setCustomTitle('');
    setCustomDescription('');
    setShowCustomModal(false);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-8 text-left animate-in fade-in duration-500 px-2 sm:px-0">
      {/* Encabezado */}
      <div>
        <span className="font-sans text-[11px] font-semibold text-neutral-600 bg-[#f7f3f2] px-3.5 py-1.5 rounded-full mb-2.5 inline-block tracking-wider uppercase">
          PASO 3: CRONOGRAMA Y RETOS
        </span>
        <h1 className="font-headline text-3xl md:text-4xl text-[#1c1b1b] font-medium mb-1.5 leading-tight">
          Etapas y Retos Fotográficos
        </h1>
        <p className="font-headline italic text-sm md:text-base text-[#444748]">
          Organiza los momentos de la fiesta y propone desafíos fotográficos a tus invitados.
        </p>
      </div>

      {loadingDefaults ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400">
          <Loader2 size={24} className="animate-spin text-black" />
          <p className="font-sans text-xs">Cargando catálogo por defecto...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SECCIÓN IZQUIERDA: LÍNEA DE TIEMPO */}
          <section className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-black/5 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-black" />
                <h3 className="font-headline text-lg font-medium text-[#1c1b1b]">Línea de Tiempo</h3>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSchedule}
                className="flex items-center gap-1.5 text-xs font-sans font-semibold text-black hover:opacity-70 transition-opacity"
              >
                <Plus size={16} />
                <span>Agregar Etapa</span>
              </button>
            </div>

            {sortedSchedules.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 font-sans text-xs space-y-2">
                <p>No hay etapas en la plantilla para este evento.</p>
                <button
                  type="button"
                  onClick={handleOpenAddSchedule}
                  className="text-black underline font-semibold"
                >
                  Haz clic para agregar tu primera etapa
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedSchedules.map((stage) => (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                      stage.active
                        ? 'bg-white border-black/20 shadow-sm'
                        : 'bg-[#F4F1EE]/50 border-black/5 opacity-70'
                    }`}
                  >
                    {/* Checkbox + Título + Horas */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={stage.active}
                        onChange={(e) => handleToggleScheduleActive(stage.id, e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-sans text-xs font-semibold truncate ${stage.active ? 'text-[#1c1b1b]' : 'text-neutral-500'}`}>
                          {stage.title}
                        </h4>
                        <span className="font-mono text-[11px] text-neutral-400 block">
                          {stage.startTime} - {stage.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Botones de Acción (Editar / Eliminar) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSchedule(stage)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                        title="Editar etapa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(stage)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar etapa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mensaje de Error Dinámico de Horarios */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200 text-red-600 font-sans text-xs animate-in fade-in">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
          </section>

          {/* SECCIÓN DERECHA: RETOS Y MISIONES */}
          <section className="lg:col-span-5 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-black" />
                <h3 className="font-headline text-lg font-medium text-[#1c1b1b]">
                  Retos para Invitados
                </h3>
              </div>
              <p className="font-sans text-xs text-neutral-500">
                Selecciona misiones temáticas para motivar a tus invitados a capturar recuerdos únicos.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {defaultTasksCatalog.map((task) => {
                const selected = isMissionSelected(task.slug);

                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleMission(task)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white border-black/5 hover:border-black/20 text-[#1c1b1b]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {selected ? (
                          <CheckCircle2 size={18} className="text-white" />
                        ) : (
                          <Circle size={18} className="text-neutral-300" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-sans text-xs font-bold leading-tight">
                          {task.name}
                        </h4>
                        {task.description && (
                          <p
                            className={`font-sans text-[11px] leading-relaxed ${
                              selected ? 'text-neutral-300' : 'text-neutral-500'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Misiones Personalizadas */}
              {missions
                .filter((m) => !defaultTasksCatalog.some((d) => d.slug === m.slug))
                .map((customM) => (
                  <div
                    key={customM.id}
                    className="p-3.5 rounded-xl bg-black text-white border border-black shadow-sm flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-sans text-xs font-bold leading-tight">
                          {customM.name}
                        </h4>
                        <p className="font-sans text-[11px] text-neutral-300 leading-relaxed">
                          {customM.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMissions((prev) => prev.filter((m) => m.slug !== customM.slug))
                      }
                      className="text-neutral-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-neutral-300 text-neutral-600 hover:text-black hover:border-black font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all bg-[#F4F1EE]/40"
              >
                <Plus size={16} />
                <span>Crear Reto Personalizado</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Banner Informativo */}
      <div className="bg-[#f7f3f2] rounded-2xl p-4 border border-black/5 flex items-center gap-3">
        <Lightbulb size={20} className="text-black flex-shrink-0" />
        <p className="font-sans text-xs text-neutral-600 leading-relaxed">
          <strong className="text-black">Tip Profesional:</strong> Seleccionar misiones bien definidas fomenta una mayor participación de los invitados.
        </p>
      </div>

      {/* MODAL CREAR / EDITAR ETAPA */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-black/10 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h3 className="font-headline text-lg font-medium text-black">
                {editingScheduleId ? 'Editar Etapa' : 'Agregar Nueva Etapa'}
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-neutral-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Nombre de la Etapa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cóctel de Bienvenida"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className="w-full bg-[#F4F1EE] border-none rounded-xl p-3 font-sans text-xs text-black outline-none focus:ring-1 focus:ring-black focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleStartTime}
                    onChange={(e) => setScheduleStartTime(e.target.value)}
                    className="w-full bg-[#F4F1EE] border-none rounded-xl p-3 font-sans text-xs text-black outline-none focus:ring-1 focus:ring-black focus:bg-white font-mono text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    className="w-full bg-[#F4F1EE] border-none rounded-xl p-3 font-sans text-xs text-black outline-none focus:ring-1 focus:ring-black focus:bg-white font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white font-sans text-xs font-semibold hover:opacity-90"
                >
                  {editingScheduleId ? 'Guardar Cambios' : 'Agregar Etapa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR RETO PERSONALIZADO */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-black/10 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h3 className="font-headline text-lg font-medium text-black">
                Crear Reto Personalizado
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-neutral-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomMission} className="space-y-4">
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Título del Reto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Selfie con los novios"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[#F4F1EE] border-none rounded-xl p-3 font-sans text-xs text-black outline-none focus:ring-1 focus:ring-black focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica a tus invitados en qué consiste esta misión..."
                  value={customDesc}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full bg-[#F4F1EE] border-none rounded-xl p-3 font-sans text-xs text-black outline-none focus:ring-1 focus:ring-black focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-full font-sans text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white font-sans text-xs font-semibold hover:opacity-90"
                >
                  Agregar Reto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}