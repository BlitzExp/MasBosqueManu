import { supabase } from './supabase';

export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    const userResp = await supabase.auth.getUser();
    const userId = userResp.data?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase.from('Profiles').select('role').eq('id', userId).single();
    if (error) return null;
    return data?.role ?? null;
  } catch (e) {
    return null;
  }
};

export const ensureMedico = async (): Promise<boolean> => {
  const role = await getCurrentUserRole();
  return !!role && role.toLowerCase() === 'medico';
};

export const ensureAdmin = async (): Promise<boolean> => {
  const role = await getCurrentUserRole();
  return !!role && role.toLowerCase() === 'admin';
};
