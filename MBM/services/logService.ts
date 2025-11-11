import { supabase } from './supabase';

export const createUserLog = async (log) => {
  const {
    userID,
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


export const getUserLogs = async (userID) => {
  const { data, error } = await supabase
    .from('UserLogs')
    .select('*')
    .eq('userID', userID)
    .order('logDate', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateUserLog = async (logID, updates) => {
  const { data, error } = await supabase
    .from('UserLogs')
    .update(updates)
    .eq('id', logID)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUserLog = async (logID) => {
  const { error } = await supabase
    .from('UserLogs')
    .delete()
    .eq('id', logID);

  if (error) throw error;
  return true;
};

