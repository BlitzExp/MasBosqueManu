import { UserLog } from '@/Modelo/UserLog';
import NetInfo from "@react-native-community/netinfo";
import * as localdatabase from './localdatabase';
import { LoggingService } from './loggingService';
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
 * 1. Check if log already exists to prevent duplicates
 * 2. Try to post to online DB (Supabase)
 * 3. If fails, save to local DB
 * 4. Sync manager will retry immediately + periodically
 */
export const createUserLogResilient = async (log: UserLogInsert): Promise<UserLog> => {
  try {
    LoggingService.info('LOG_CREATION', '📝 Creating log - trying Supabase first...');
    
    // Check if log already exists (prevent duplicates)
    const exists = await logService.logAlreadyExists(log);
    if (exists) {
      LoggingService.warn('LOG_DUPLICATE', '⚠️ Log already exists in Supabase, not creating duplicate');
      throw new Error('Log already exists');
    }
    
    // Try online first
    const result = await logService.createUserLog(log);
    LoggingService.info('LOG_CREATED', `✓ Log created in Supabase: ${result.id}`);
    return result;
  } catch (error) {
    LoggingService.warn('LOG_FALLBACK', '⚠️ Supabase failed, saving locally:', error as Error);
    
    // Save to local DB for later sync
    const localLogId = await localdatabase.savePendingLog(log);
    LoggingService.info('LOG_LOCAL_SAVED', `✓ Log saved locally (ID: ${localLogId})`);
    
    // IMPORTANT: Trigger sync immediately (don't wait 30 seconds)
    LoggingService.info('SYNC_TRIGGER', '🔄 Triggering immediate sync...');
    try {
      await syncManager.triggerSync();
    } catch (syncError) {
      LoggingService.warn('SYNC_FAILED', '⚠️ Sync trigger failed (will retry on schedule):', syncError as Error);
    }
    
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
    const onlineLogs = await logService.getAllUserLogs();
    LoggingService.info('LOG_CACHE', `💾 Caching ${onlineLogs.length} logs locally...`);
    for (const log of onlineLogs) {
      await localdatabase.saveSyncedLog(log);
    }

    return onlineLogs;
  } catch (error) {
    LoggingService.warn('LOG_FETCH_FALLBACK', 'Failed to get all user logs from online DB, using local fallback:', error as Error);
    
    // Return local logs as fallback
    const localLogs = await localdatabase.getAllLocalUserLogs();
    return localLogs as UserLog[];
  }
};

/**
 * Get user logs for a specific user with resilience:
 * 1. Try to fetch from online DB
 * 2. Save fetched logs to local DB for offline access
 * 3. If fails, return from local DB
 */
export const getUserLogsResilient = async (userID: string): Promise<UserLog[]> => {
  try {
    // Try online first
    const onlineLogs = await logService.getUserLogs(userID);
    
    // Save logs to local DB for offline access
    LoggingService.info('LOG_CACHE', `💾 Caching ${onlineLogs.length} logs locally...`);
    for (const log of onlineLogs) {
      await localdatabase.saveSyncedLog(log);
    }
    
    return onlineLogs;
  } catch (error) {
    LoggingService.warn('LOG_FETCH_FALLBACK', 'Failed to get user logs from online DB, using local fallback:', error as Error);
    
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
    LoggingService.warn('LOG_UPDATE_FAILED', 'Failed to update log online:', error as Error);
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
    LoggingService.warn('LOG_DELETE_FAILED', 'Failed to delete log online:', error as Error);
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
