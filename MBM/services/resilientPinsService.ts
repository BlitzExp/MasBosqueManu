/**
 * Resilient Map Pins Service
 * Handles map pin operations with offline-first approach
 */

import { MapPin } from '@/Modelo/MapPins';
import { isOnline } from './connectionManager';
import * as localdatabase from './localdatabase';
import { supabase } from './supabase';

export type MapPinInsert = Omit<MapPin, 'id'>;

export const getAllMapPinsResilient = async (): Promise<MapPin[]> => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from('Localizations')
        .select('*');
      
      if (error) throw error;
      
      // Cache locally
      if (data && data.length > 0) {
        await localdatabase.addPinsLocations(data);
      }
      
      return data as MapPin[];
    } else {
      // Fallback to local cache
      return await localdatabase.getPinsLocations();
    }
  } catch (error) {
    console.warn('Failed to get map pins from online, using local cache:', error);
    return await localdatabase.getPinsLocations();
  }
};

export const createMapPinResilient = async (pin: MapPinInsert): Promise<MapPin> => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from('Localizations')
        .insert(pin)
        .select()
        .single();
      
      if (error) throw error;
      
      // Cache locally
      await localdatabase.addPinsLocations([data]);
      return data as MapPin;
    } else {
      // Offline - save locally
      console.log('⚠️ Offline: Map pin saved locally for sync');
      await localdatabase.addPinsLocations([pin as any]);
      return { ...pin, id: `local_${Date.now()}` } as MapPin;
    }
  } catch (error) {
    console.warn('Failed to create map pin online, saving locally:', error);
    
    // Fallback to local
    await localdatabase.addPinsLocations([pin as any]);
    return { ...pin, id: `local_${Date.now()}` } as MapPin;
  }
};

export const updateMapPinResilient = async (pinId: string, updates: Partial<MapPin>): Promise<MapPin> => {
  try {
    if (!isOnline()) {
      throw new Error('Cannot update map pin while offline');
    }

    const { data, error } = await supabase
      .from('Localizations')
      .update(updates)
      .eq('id', pinId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update local cache
    await localdatabase.addPinsLocations([data]);
    return data as MapPin;
  } catch (error) {
    console.error('Update map pin error:', error);
    throw error;
  }
};

export const deleteMapPinResilient = async (pinId: string): Promise<boolean> => {
  try {
    if (!isOnline()) {
      throw new Error('Cannot delete map pin while offline');
    }

    const { error } = await supabase
      .from('Localizations')
      .delete()
      .eq('id', pinId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete map pin error:', error);
    throw error;
  }
};

export const getCachedMapPins = async (): Promise<MapPin[]> => {
  try {
    return await localdatabase.getPinsLocations();
  } catch (error) {
    console.error('Get cached map pins error:', error);
    return [];
  }
};
