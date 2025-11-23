import { MapPin } from '@/Modelo/MapPins';
import { supabase } from './supabase';

export type MapPinInsert = Omit<MapPin, 'id'>;

export const getAllMapPins = async (): Promise<MapPin[]> => {
  const { data, error } = await supabase
    .from('Localizations')
    .select('*');
    if (error) throw error;
    return data as MapPin[];
}