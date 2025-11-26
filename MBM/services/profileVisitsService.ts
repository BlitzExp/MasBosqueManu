import { supabase } from './supabase';
import { Profile } from '@/Modelo/Profile';

export const increseProfileVisits = async (): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('No authenticated user');

    // Fetch current nvisits first
    const { data: current, error: fetchError } = await supabase
      .from('Profiles')
      .select('nvisits')
      .eq('id', user.id)
      .single();
    if (fetchError) throw fetchError;

    const newNvisits = (current?.nvisits ?? 0) + 1;

    const { data, error } = await supabase
      .from('Profiles')
      .update({ nvisits: newNvisits })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from increseProfileVisits');
    return data as Profile;
}

export const updateLastVisit = async (): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('No authenticated user');
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('Profiles')
      .update({ lastVisit: now })
        .eq('id', user.id)
        .select()
        .single();
    if (error) throw error;
    if (!data) throw new Error('No data returned from updateLastVisit');
    return data as Profile;
}