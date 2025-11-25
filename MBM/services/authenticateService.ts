import { supabase } from './supabase';

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const getProfileById = async (id: string) => {
  const { data, error } = await supabase
    .from('Profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const createProfile = async (profile: Record<string, any>) => {
  const { error } = await supabase.from('Profiles').insert(profile);
  if (error) throw error;
  return true;
};
