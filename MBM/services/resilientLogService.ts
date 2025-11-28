import { UserLog } from '@/Modelo/UserLog';
import NetInfo from "@react-native-community/netinfo";
import * as localdatabase from './localdatabase';
import * as logService from './logService';
import { syncManager } from './syncManager';


export type UserLogInsert = Omit<UserLog, 'id'>;

export const isConnected = async () => {
  const net = await NetInfo.fetch();
  if (!net.isInternetReachable) {
    alert("No tienes internet");
    return false;
  }
  return true;
};



/**
 * Create a user log with resilience:
 * 1. Try to post to online DB (Supabase)
 * 2. If fails, save to local DB
 * 3. Sync manager will retry periodically
 */
export const createUserLogResilient = async (log: UserLogInsert): Promise<UserLog> => {
  try {
    // Try online first
    return await logService.createUserLog(log);
  } catch (error) {
    console.warn('Failed to create log online, saving to local DB:', error);
    
    // Save to local DB for later sync
    const localLogId = await localdatabase.savePendingLog(log);
    
    // Return a mock UserLog object with the local ID
    return {
      id: `local_${localLogId}`,
      ...log,
    } as UserLog;
  }
};

/**
 * Get all user logs with resilience:
 * 1. Try to fetch from online DB
 * 2. If fails, return from local DB
 * 3. Combine both if online succeeds
 */
export const getAllUserLogsResilient = async (): Promise<UserLog[]> => {
  try {
    // Try online first
    return await logService.getAllUserLogs();
  } catch (error) {
    console.warn('Failed to get logs from online DB, using local fallback:', error);
    
    // Return local pending logs as fallback
    const localLogs = await localdatabase.getPendingLogs();
    return localLogs as UserLog[];
  }
};

/**
 * Get user logs for a specific user with resilience
 */
export const getUserLogsResilient = async (userID: string): Promise<UserLog[]> => {
  try {
    // Try online first
    return await logService.getUserLogs(userID);
  } catch (error) {
    console.warn('Failed to get user logs from online DB, using local fallback:', error);
    
    // Return local logs as fallback
    const localLogs = await localdatabase.getLocalUserLogs(userID);
    return localLogs as UserLog[];
  }
};

/**
 * Update a user log with resilience
 */
export const updateUserLogResilient = async (logID: string, updates: Partial<UserLog>): Promise<UserLog> => {
  // Don't try local update for now - only sync from server
  try {
    return await logService.updateUserLog(logID, updates);
  } catch (error) {
    console.warn('Failed to update log online:', error);
    throw error;
  }
};

/**
 * Delete a user log with resilience
 */
export const deleteUserLogResilient = async (logID: string): Promise<boolean> => {
  try {
    return await logService.deleteUserLog(logID);
  } catch (error) {
    console.warn('Failed to delete log online:', error);
    throw error;
  }
};

/**
 * Start the background sync process
 * This will attempt to sync pending logs every 30 seconds
 */
export const startBackgroundSync = () => {
  syncManager.start();
};

/**
 * Stop the background sync process
 */
export const stopBackgroundSync = () => {
  syncManager.stop();
};
