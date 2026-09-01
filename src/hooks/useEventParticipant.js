import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const getGuestStorageKey = (eventId) => `innerpov_guest_${eventId}`;

export default function useEventParticipant(eventId) {
  const { user } = useAuth();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [isParticipant, setIsParticipant] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const refreshParticipant = useCallback(async () => {
    if (!eventId) {
      setParticipant(null);
      setIsParticipant(false);
      setIsBanned(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (user) {
        const { data, error } = await supabase
          .from('event_participants')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        const nextParticipant = data || null;
        setParticipant(nextParticipant);
        setIsParticipant(Boolean(nextParticipant));
        setIsBanned(Boolean(nextParticipant?.status === 'banned'));
        return nextParticipant;
      }

      const guestStorageKey = getGuestStorageKey(eventId);
      const guestToken = localStorage.getItem(guestStorageKey);

      if (!guestToken) {
        setParticipant(null);
        setIsParticipant(false);
        setIsBanned(false);
        return null;
      }

      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('session_token', guestToken)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      const nextParticipant = data || null;
      setParticipant(nextParticipant);
      setIsParticipant(Boolean(nextParticipant));
      setIsBanned(Boolean(nextParticipant?.status === 'banned'));
      return nextParticipant;
    } catch (error) {
      console.error('Error al cargar participante del evento:', error);
      setParticipant(null);
      setIsParticipant(false);
      setIsBanned(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    refreshParticipant();
  }, [refreshParticipant]);

  const joinAsUser = useCallback(async () => {
    if (!eventId || !user) return null;

    try {
      // Check if already joined
      let { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        // Insert if not joined
        const { data: newData, error: insertError } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.email || 'Invitado',
            role: 'GUEST',
            status: 'active',
          })
          .select()
          .maybeSingle();
          
        if (insertError) {
          console.error("Supabase insert error:", insertError);
          throw insertError;
        }
        data = newData;
      } else if (error) {
        throw error;
      }

      setParticipant(data);
      setIsParticipant(Boolean(data));
      setIsBanned(Boolean(data?.status === 'banned'));
      return data;
    } catch (error) {
      console.error('Error al unirse como usuario:', error);
      throw error;
    }
  }, [eventId, user]);

  const joinAsGuest = useCallback(async (displayName) => {
    if (!eventId || !displayName?.trim()) return null;

    const token = crypto.randomUUID();
    const normalizedName = displayName.trim();

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          session_token: token,
          display_name: normalizedName,
          role: 'GUEST',
          status: 'active',
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      localStorage.setItem(getGuestStorageKey(eventId), token);
      setParticipant(data);
      setIsParticipant(Boolean(data));
      setIsBanned(Boolean(data?.status === 'banned'));
      return data;
    } catch (error) {
      console.error('Error al unirse como invitado:', error);
      throw error;
    }
  }, [eventId]);

  return {
    participant,
    isParticipant,
    isBanned,
    loading,
    joinAsUser,
    joinAsGuest,
    refreshParticipant,
  };
}
