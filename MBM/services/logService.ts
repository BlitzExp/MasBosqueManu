import { UserLog } from '@/Modelo/UserLog';
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


