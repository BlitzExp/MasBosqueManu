import { UserLog } from '@/Modelo/UserLog';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

export type UserLogInsert = Omit<UserLog, 'id'>;

export const createUserLog = async (log: UserLogInsert): Promise<UserLog> => {
  const {
    userID,
    name,
    logDate,
    ingressTime,
    exitTime,
    description,
    image
  } = log;

  const { data, error } = await supabase
    .from('UserLogs')
    .insert({
      userID,
      name,           
      logDate,
      ingressTime,
      exitTime,
      description,
      image
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllUserLogs = async (): Promise<UserLog[]> => {
  const { data, error } = await supabase
    .from('UserLogs')
    .select('*')
    .order('logDate', { ascending: false });

  if (error) throw error;

  return data as UserLog[];
};

export const getUserLogs = async (userID: string): Promise<UserLog[]> => {
  const { data, error } = await supabase
    .from('UserLogs')
    .select('*')
    .eq('userID', userID)
    .order('logDate', { ascending: false });

  if (error) throw error;
  return data as UserLog[];
};

export const updateUserLog = async (logID: string, updates: Partial<UserLog>): Promise<UserLog> => {
  const { data, error } = await supabase
    .from('UserLogs')
    .update(updates)
    .eq('id', logID)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserLog = async (logID: string): Promise<boolean> => {
  const { error } = await supabase
    .from('UserLogs')
    .delete()
    .eq('id', logID);

  if (error) throw error;
  return true;
};

export const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // 2. Convert Base64 to ArrayBuffer
    const fileData = decode(base64);

    // 3. Generate a unique file name (e.g., user-id_timestamp.jpg)
    // You might want to pass the userID here for better folder structure
    const fileName = `log_${new Date().getTime()}.jpg`;

    // 4. Upload to the bucket
    const { data, error } = await supabase.storage
      .from('Log File Uploads') 
      .upload(fileName, fileData, {
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      throw error;
    }

    // 5. Get the Public URL to save in the database
    const { data: publicData } = supabase.storage
      .from('Log File Uploads')
      .getPublicUrl(fileName);

    return publicData.publicUrl;

  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Check if a log with the same userID, logDate, and times already exists
 * This prevents duplicate logs when syncing from offline
 */
export const logAlreadyExists = async (log: UserLogInsert): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('UserLogs')
      .select('id')
      .eq('userID', log.userID)
      .eq('logDate', log.logDate)
      .eq('ingressTime', log.ingressTime || null)
      .eq('exitTime', log.exitTime || null)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking if log exists:', error);
    // If we can't verify, assume it doesn't exist to allow sync attempt
    return false;
  }
};
