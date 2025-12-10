import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oarfqnsfaawwpszbopme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcmZxbnNmYWF3d3BzemJvcG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxOTUxNTMsImV4cCI6MjA3OTc3MTE1M30.e-Hp5yx8hKQDy53rLso_SU04NslQYDErIAulKtLAOEQ';

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

export const signInUser = async (email: string, password: string) => {
    const { user, error } = await supabase.auth.signIn({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return user;
};