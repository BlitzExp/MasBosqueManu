/**
 * Resilient Authentication Service
 * Handles authentication with fallback to local data when offline
 */

import { supabase } from './supabase';
import * as localdatabase from './localdatabase';
import { isOnline } from './connectionManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const signInResilient = async (email: string, password: string) => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      
      // Cache credentials for offline use
      await AsyncStorage.setItem('cachedEmail', email);
      await AsyncStorage.setItem('lastAuthTime', new Date().toISOString());
      
      return data;
    } else {
      // Offline - check cached credentials
      const cachedEmail = await AsyncStorage.getItem('cachedEmail');
      if (cachedEmail === email) {
        console.log('⚠️ Offline: Using cached credentials');
        return { user: { email } };
      } else {
        throw new Error('No internet connection. Please try again when online.');
      }
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUpResilient = async (email: string, password: string) => {
  try {
    if (!isOnline()) {
      throw new Error('Cannot sign up offline. Please connect to the internet.');
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    if (error) throw error;
    
    // Cache new user
    await AsyncStorage.setItem('cachedEmail', email);
    
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOutResilient = async () => {
  try {
    if (isOnline()) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    
    // Clear local cache
    await AsyncStorage.removeItem('cachedEmail');
    await AsyncStorage.removeItem('lastAuthTime');
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUserResilient = async () => {
  try {
    if (isOnline()) {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } else {
      // Return cached user info
      const cachedEmail = await AsyncStorage.getItem('cachedEmail');
      if (cachedEmail) {
        return { email: cachedEmail };
      }
      return null;
    }
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const getProfileByIdResilient = async (id: string) => {
  try {
    if (isOnline()) {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      
      // Cache locally
      await localdatabase.saveProfileLocally(data);
      return data;
    } else {
      // Try local cache
      return await localdatabase.getProfileLocally(id);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    // Fallback to local
    return await localdatabase.getProfileLocally(id);
  }
};

export const createProfileResilient = async (profile: Record<string, any>) => {
  try {
    if (isOnline()) {
      const { error } = await supabase.from('Profiles').insert(profile);
      if (error) throw error;
      
      // Cache locally
      await localdatabase.saveProfileLocally(profile);
      return true;
    } else {
      // Save only locally for later sync
      await localdatabase.saveProfileLocally(profile);
      console.log('⚠️ Offline: Profile saved locally, will sync when online');
      return true;
    }
  } catch (error) {
    console.error('Create profile error:', error);
    // Fallback to local storage
    await localdatabase.saveProfileLocally(profile);
    throw error;
  }
};
