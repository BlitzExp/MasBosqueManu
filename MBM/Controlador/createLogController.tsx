import type { UserLog } from '@/Modelo/UserLog';
import { isOnline } from '@/services/connectionManager';
import { getUserName } from '@/services/localdatabase';
import { increseProfileVisits, updateLastVisit } from '@/services/profileVisitsService';
import { getCurrentUserResilient } from '@/services/resilientAuthService';
import { createUserLogResilient } from '@/services/resilientLogService';
import { Alert } from 'react-native';

export function getCurrentTimeString() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function clockIn(setArrivalHour: (value: string) => void) {
  try {
    console.log("⏱️ Clocking in");
    setArrivalHour(getCurrentTimeString());
    await increseProfileVisits();
    await updateLastVisit();
    console.log("✓ Clock in successful");
  } catch (error) {
    console.error("❌ Clock in error:", error);
    Alert.alert('Error', 'No se pudo registrar entrada');
  }
}

export function clockOut(setDepartureHour: (value: string) => void) {
  setDepartureHour(getCurrentTimeString());
  console.log("⏱️ Clocking out");
}

type SubmitParams = {
  arrivalHour: string;
  departureHour: string;
  description?: string;
  onSuccess?: () => void;
};

export async function submitLog({ arrivalHour, departureHour, description, onSuccess }: SubmitParams) {
  try {
    console.log("📝 Submitting log...");
    
    const user = await getCurrentUserResilient();

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión.');
      return;
    }

    const name = await getUserName();

    const log: UserLog = {
      userID: (user as any)?.id || (user as any)?.email || 'unknown',
      name,
      logDate: new Date().toISOString().split('T')[0],
      ingressTime: arrivalHour || null,
      exitTime: departureHour || null,
      description: description || null,
      image: null,
    };

    await createUserLogResilient(log);
    
    const connectionStatus = isOnline() ? '✓ Sincronizado' : '⚠️ Esperando conexión';
    console.log(`✓ Log created: ${connectionStatus}`);

    Alert.alert('Éxito', `Bitácora enviada. ${!isOnline() ? '(Se sincronizará cuando tenga conexión)' : ''}`);
    onSuccess?.();
  } catch (err: any) {
    console.error("❌ Submit log error:", err);
    Alert.alert('Error', err?.message ?? String(err));
  }
}


export default {
  getCurrentTimeString,
  clockIn,
  clockOut,
  submitLog,
};
