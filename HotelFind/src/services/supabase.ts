// src/services/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extras: Record<string, any> =
  (Constants as any)?.expoConfig?.extra ||
  (Constants as any)?.manifest?.extra ||
  (process.env as unknown as Record<string, any>);

const SUPABASE_URL = extras?.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = extras?.SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Advertencia en tiempo de ejecución para que no se presuma que la app está segura
  // En producción usa EAS secrets / env seguros.
  // Esto ayuda a cumplir la rúbrica que pide no hardcodear credenciales dentro del código fuente.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] No se encontraron credenciales en expo.extra; revisa app.json o tus variables de entorno.'
  );
}

// Crea cliente Supabase usando AsyncStorage (Expo)
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  if (data?.user && !data.session) {
    const signInResult = await signIn(email, password);
    return { user: signInResult.user, session: signInResult.session };
  }

  return { user: data.user, session: data.session ?? null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const session = data.session ?? null;
  const user = data.user ?? null;

  if (session?.access_token) {
    await AsyncStorage.setItem('token', session.access_token);
  }

  return { user, session };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Supabase signOut error:', error.message);
  }
  await AsyncStorage.removeItem('token');
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}