import type { UserLog } from '@/Modelo/UserLog';
import { getUserName } from '@/services/localdatabase';
import { increseProfileVisits, updateLastVisit } from '@/services/profileVisitsService';
import { createUserLogResilient } from '@/services/resilientLogService';
import { supabase } from '@/services/supabase';
import { Alert } from 'react-native';

export function getCurrentTimeString() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function clockIn(setArrivalHour: (value: string) => void) {
  console.log("Clocking in");
  setArrivalHour(getCurrentTimeString());
  await increseProfileVisits();
  await updateLastVisit();
}

export function clockOut(setDepartureHour: (value: string) => void) {
  setDepartureHour(getCurrentTimeString());
}

type SubmitParams = {
  arrivalHour: string;
  departureHour: string;
  description?: string;
  onSuccess?: () => void;
};

export async function submitLog({ arrivalHour, departureHour, description, onSuccess }: SubmitParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión.');
      return;
    }

    const name = await getUserName();

    const log: UserLog = {
      userID: user.id,
      name,
      logDate: new Date().toISOString().split('T')[0],
      ingressTime: arrivalHour || null,
      exitTime: departureHour || null,
      description: description || null,
      image: null,
    };

    await createUserLogResilient(log);
    

    Alert.alert('Éxito', 'Bitácora enviada.');
    onSuccess?.();
  } catch (err: any) {
    console.log(err);
    Alert.alert('Error', err?.message ?? String(err));
  }
}


export default {
  getCurrentTimeString,
  clockIn,
  clockOut,
  submitLog,
};
