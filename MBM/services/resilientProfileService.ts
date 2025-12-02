/**
 * Resilient Profiles Service
 * Handles profile operations with offline-first approach
 */

import { isOnline } from './connectionManager';
import * as localdatabase from './localdatabase';
import { supabase } from './supabase';

export type ProfileInsert = Record<string, any>;

export const createProfileResilient = async (profile: ProfileInsert) => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from('Profiles')
        .insert(profile)
        .select()
        .single();
      
      if (error) throw error;
      
      // Cache locally
      await localdatabase.saveProfileLocally(data);
      return data;
    } else {
      // Offline - save locally for sync
      await localdatabase.saveProfileLocally(profile);
      console.log('⚠️ Offline: Profile saved locally for sync');
      return { ...profile, id: `local_${Date.now()}` };
    }
  } catch (error) {
    console.warn('Failed to create profile online, saving locally:', error);
    // Fallback to local
    await localdatabase.saveProfileLocally(profile);
    return { ...profile, id: `local_${Date.now()}` };
  }
};

export const getProfileResilient = async (userId: string) => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Cache locally
        await localdatabase.saveProfileLocally(data);
        return data;
      }
    }
    
    // Fallback to local cache
    return await localdatabase.getProfileLocally(userId);
  } catch (error) {
    console.warn('Failed to get profile from online, using local cache:', error);
    return await localdatabase.getProfileLocally(userId);
  }
};

export const updateProfileResilient = async (userId: string, updates: Partial<ProfileInsert>) => {
  try {
    if (isOnline()) {
      const { data, error } = await supabase
        .from('Profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Cache locally
      await localdatabase.saveProfileLocally(data);
      return data;
    } else {
      console.log('⚠️ Offline: Profile update saved locally for sync');
      const updated = { id: userId, ...updates };
      await localdatabase.saveProfileLocally(updated);
      return updated;
    }
  } catch (error) {
    console.warn('Failed to update profile online:', error);
    const updated = { id: userId, ...updates };
    await localdatabase.saveProfileLocally(updated);
    throw error;
  }
};

export const deleteProfileResilient = async (userId: string) => {
  try {
    if (!isOnline()) {
      throw new Error('Cannot delete profile while offline');
    }
    
    const { error } = await supabase
      .from('Profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete profile error:', error);
    throw error;
  }
};

export const getPendingProfiles = async () => {
  try {
    return await localdatabase.getPendingProfiles();
  } catch (error) {
    console.error('Get pending profiles error:', error);
    return [];
  }
};
