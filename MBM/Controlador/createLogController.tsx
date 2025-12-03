import type { UserLog } from '@/Modelo/UserLog';
import { isOnline } from '@/services/connectionManager';
import { getUserName } from '@/services/localdatabase';
import { LoggingService } from '@/services/loggingService';
import { uploadImageToSupabase } from '@/services/logService';
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
    LoggingService.info('CLOCK_IN', "Clocking in");
    setArrivalHour(getCurrentTimeString());
    await increseProfileVisits();
    await updateLastVisit();
    LoggingService.info('CLOCK_IN', "Clock in successful");
  } catch (error) {
    LoggingService.error('CLOCK_IN', "Clock in error:", error as Error);
    Alert.alert('Error', 'No se pudo registrar entrada');
  }
}

export function clockOut(setDepartureHour: (value: string) => void) {
  setDepartureHour(getCurrentTimeString());
  LoggingService.info('CLOCK_OUT', "Clocking out");
}

type SubmitParams = {
  arrivalHour: string;
  departureHour: string;
  description?: string;
  image?: string | null; 
  onSuccess?: () => void;
};

export async function submitLog({ arrivalHour, departureHour, description, image, onSuccess }: SubmitParams) {
  try {
    LoggingService.info('SUBMIT_LOG', "Submitting log...");
    
    const user = await getCurrentUserResilient();

    if (!user) {
      LoggingService.error('SUBMIT_LOG', 'No user found');
      Alert.alert('Error', 'Debes iniciar sesión.');
      return;
    }
    let publicImageUrl = null;
    if (image) {
      publicImageUrl = await uploadImageToSupabase(image);
      if (!publicImageUrl) {
         Alert.alert('Aviso', 'La imagen no se pudo subir, pero se guardará el registro.');
      }
    }

    let userID = (user as any)?.id;
    
    if (!userID) {
      LoggingService.error('SUBMIT_LOG', 'User ID is missing. User object:', user as any);
      Alert.alert('Error', 'No se pudo obtener el ID de usuario. Por favor inicia sesión nuevamente.');
      return;
    }

    // Validate that userID looks like a UUID (not an email)
    if (userID.includes('@')) {
      LoggingService.error('SUBMIT_LOG', 'Invalid userID (contains @):', userID);
      Alert.alert('Error', 'ID de usuario inválido. Por favor inicia sesión nuevamente.');
      return;
    }

    const name = await getUserName();

    const log: UserLog = {
      userID,
      name,
      logDate: new Date().toISOString().split('T')[0],
      ingressTime: arrivalHour || null,
      exitTime: departureHour || null,
      description: description || null,
      image: publicImageUrl, 
    };

    await createUserLogResilient(log);
    
    const connectionStatus = isOnline() ? 'Sincronizado' : 'Esperando conexión';
    LoggingService.info('SUBMIT_LOG', `Log created: ${connectionStatus}`);

    Alert.alert('Éxito', `Bitácora enviada. ${!isOnline() ? '(Se sincronizará cuando tenga conexión)' : ''}`);
    onSuccess?.();
  } catch (err: any) {
    LoggingService.error('SUBMIT_LOG', "Submit log error:", err);
    Alert.alert('Error', err?.message ?? String(err));
  }
}


export default {
  getCurrentTimeString,
  clockIn,
  clockOut,
  submitLog,
};
