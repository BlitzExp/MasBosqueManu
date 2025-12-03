/**
 * Resilient Authentication Service
 * Handles authentication with fallback to local data when offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOnline } from './connectionManager';
import * as localdatabase from './localdatabase';
import { LoggingService } from './loggingService';
import { supabase } from './supabase';

export const signInResilient = async (email: string, password: string) => {
  try {
    if (isOnline()) {
      // Try online first
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw error;
      
      // Cache credentials and user ID for offline use
      await AsyncStorage.setItem('cachedEmail', email);
      if (data.user?.id) {
        await AsyncStorage.setItem('cachedUserId', data.user.id);
        LoggingService.info('AUTH', `✓ User signed in: ${data.user.id}`);
      }
      await AsyncStorage.setItem('lastAuthTime', new Date().toISOString());
      
      return data;
    } else {
      // Offline - check cached credentials
      const cachedEmail = await AsyncStorage.getItem('cachedEmail');
      if (cachedEmail === email) {
        LoggingService.warn('AUTH', '⚠️ Offline: Using cached credentials');
        const cachedUserId = await AsyncStorage.getItem('cachedUserId');
        return { 
          user: { 
            id: cachedUserId || email,
            email 
          } 
        };
      } else {
        throw new Error('No internet connection. Please try again when online.');
      }
    }
  } catch (error) {
    LoggingService.error('AUTH', 'Sign in error:', error as Error);
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
    LoggingService.info('AUTH', `✓ User signed up: ${email}`);
    
    return data;
  } catch (error) {
    LoggingService.error('AUTH', 'Sign up error:', error as Error);
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
    LoggingService.info('AUTH', '✓ User signed out');
    
    return true;
  } catch (error) {
    LoggingService.error('AUTH', 'Sign out error:', error as Error);
    throw error;
  }
};

export const getCurrentUserResilient = async () => {
  try {
    if (isOnline()) {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Also cache the user ID locally for offline fallback
      if (data.user?.id) {
        await AsyncStorage.setItem('cachedUserId', data.user.id);
        LoggingService.info('AUTH', `✓ Cached user ID: ${data.user.id}`);
      }
      
      return data.user;
    } else {
      // Return cached user info with ID - MUST be from cachedUserId, never email
      const cachedUserId = await AsyncStorage.getItem('cachedUserId');
      const localUser = await localdatabase.getUser();
      
      if (cachedUserId) {
        LoggingService.warn('AUTH', '⚠️ Offline: Using cached user ID');
        return { 
          id: cachedUserId,
          email: localUser?.userId,
          user_metadata: {
            name: localUser?.name
          }
        };
      }
      
      LoggingService.error('AUTH', '❌ No cached user ID available and offline');
      return null;
    }
  } catch (error) {
    LoggingService.error('AUTH', 'Get current user error:', error as Error);
    
    // Last resort: try to get from local cache
    try {
      const cachedUserId = await AsyncStorage.getItem('cachedUserId');
      
      if (cachedUserId) {
        LoggingService.warn('AUTH', '⚠️ Using fallback cached user ID');
        return { 
          id: cachedUserId
        };
      }
    } catch (fallbackError) {
      LoggingService.error('AUTH', 'Fallback user fetch error:', fallbackError as Error);
    }
    
    LoggingService.error('AUTH', '❌ Cannot get user ID - no cached data available');
    return null;
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
