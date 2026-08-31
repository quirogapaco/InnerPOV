import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingConfig = !supabaseUrl || !supabaseAnonKey;

if (missingConfig) {
  console.warn(
    '[Supabase] Faltan las variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env.local y rellénalas.'
  );
}

export const supabase = missingConfig
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = Boolean(supabase);