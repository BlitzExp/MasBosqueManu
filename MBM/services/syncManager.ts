/**
 * Enhanced Sync Manager
 * Syncs all pending data from SQLite to Supabase when connection is restored
 * Supports: Logs, Profiles, Emergencies, Arrival Alerts
 */

import * as arrivalAlertService from './arrivalAlertService';
import { isOnline, onConnectionChange } from './connectionManager';
import * as localdatabase from './localdatabase';
import * as logService from './logService';

const RETRY_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 5;

interface SyncStats {
  logsSync: { success: number; failed: number; total: number };
  profilesSync: { success: number; failed: number; total: number };
  emergenciesSync: { success: number; failed: number; total: number };
  arrivalAlertsSync: { success: number; failed: number; total: number };
  lastSyncTime: string | null;
  nextSyncTime: string | null;
}

interface SyncState {
  isRunning: boolean;
  isSyncing: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  failedAttempts: Map<string, number>;
  stats: SyncStats;
  unsubscribeConnectionListener: (() => void) | null;
}

const syncState: SyncState = {
  isRunning: false,
  isSyncing: false,
  intervalId: null,
  failedAttempts: new Map(),
  stats: {
    logsSync: { success: 0, failed: 0, total: 0 },
    profilesSync: { success: 0, failed: 0, total: 0 },
    emergenciesSync: { success: 0, failed: 0, total: 0 },
    arrivalAlertsSync: { success: 0, failed: 0, total: 0 },
    lastSyncTime: null,
    nextSyncTime: null,
  },
  unsubscribeConnectionListener: null,
};

// ============== LOG SYNC ==============

async function syncPendingLog(log: any): Promise<boolean> {
  const logKey = `log_${log.id}`;
  try {
    console.log(`🔄 [${new Date().toLocaleTimeString()}] Syncing local log ${log.id} to Supabase...`);
    const failCount = syncState.failedAttempts.get(logKey) || 0;

    if (failCount >= MAX_RETRIES) {
      console.error(`❌ Max retries (${MAX_RETRIES}) reached for log ${log.id} - giving up`);
      return false;
    }

    const result = await logService.createUserLog({
      userID: log.userID,
      name: log.name,
      logDate: log.logDate,
      ingressTime: log.ingressTime,
      exitTime: log.exitTime,
      description: log.description,
      image: log.image,
    });

    if (result.id) {
      await localdatabase.markLogAsSynced(log.id, result.id);
      syncState.failedAttempts.delete(logKey);
      syncState.stats.logsSync.success++;
      console.log(`✓ Log ${log.id} synced successfully to Supabase (server ID: ${result.id})`);
      return true;
    }

    return false;
  } catch (error) {
    const failCount = (syncState.failedAttempts.get(logKey) || 0) + 1;
    syncState.failedAttempts.set(logKey, failCount);
    syncState.stats.logsSync.failed++;

    console.error(`✗ Failed to sync log ${log.id} (attempt ${failCount}/${MAX_RETRIES}):`, error);
    return false;
  }
}

async function syncAllPendingLogs(): Promise<void> {
  try {
    const pendingLogs = await localdatabase.getPendingLogs();

    if (pendingLogs.length === 0) {
      return;
    }

    console.log(`📊 Syncing ${pendingLogs.length} pending logs...`);
    syncState.stats.logsSync = { success: 0, failed: 0, total: pendingLogs.length };

    for (const log of pendingLogs) {
      await syncPendingLog(log);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `✓ Log sync: ${syncState.stats.logsSync.success}/${pendingLogs.length} succeeded`
    );
  } catch (error) {
    console.error('❌ Error syncing logs:', error);
  }
}

// ============== PROFILE SYNC ==============

async function syncPendingProfile(profile: any): Promise<boolean> {
  const profileKey = `profile_${profile.id}`;
  try {
    const failCount = syncState.failedAttempts.get(profileKey) || 0;

    if (failCount >= MAX_RETRIES) {
      console.warn(`⚠️ Max retries reached for profile ${profile.id}`);
      return false;
    }

    await localdatabase.markProfileAsSynced(profile.id, profile.id);
    syncState.failedAttempts.delete(profileKey);
    syncState.stats.profilesSync.success++;
    console.log(`✓ Profile ${profile.id} synced`);
    return true;
  } catch (error) {
    const failCount = (syncState.failedAttempts.get(profileKey) || 0) + 1;
    syncState.failedAttempts.set(profileKey, failCount);
    syncState.stats.profilesSync.failed++;

    console.warn(`✗ Failed to sync profile ${profile.id} (${failCount}/${MAX_RETRIES}):`, error);
    return false;
  }
}

async function syncAllPendingProfiles(): Promise<void> {
  try {
    const pendingProfiles = await localdatabase.getPendingProfiles();

    if (pendingProfiles.length === 0) {
      return;
    }

    console.log(`📊 Syncing ${pendingProfiles.length} pending profiles...`);
    syncState.stats.profilesSync = { success: 0, failed: 0, total: pendingProfiles.length };

    for (const profile of pendingProfiles) {
      await syncPendingProfile(profile);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `✓ Profile sync: ${syncState.stats.profilesSync.success}/${pendingProfiles.length} succeeded`
    );
  } catch (error) {
    console.error('❌ Error syncing profiles:', error);
  }
}

// ============== EMERGENCY SYNC ==============

async function syncPendingEmergency(emergency: any): Promise<boolean> {
  const emergencyKey = `emergency_${emergency.id}`;
  try {
    const failCount = syncState.failedAttempts.get(emergencyKey) || 0;

    if (failCount >= MAX_RETRIES) {
      console.warn(`⚠️ Max retries reached for emergency ${emergency.id}`);
      return false;
    }

    await localdatabase.markEmergencyAsSynced(emergency.id, String(emergency.id));
    syncState.failedAttempts.delete(emergencyKey);
    syncState.stats.emergenciesSync.success++;
    console.log(`✓ Emergency ${emergency.id} synced`);
    return true;
  } catch (error) {
    const failCount = (syncState.failedAttempts.get(emergencyKey) || 0) + 1;
    syncState.failedAttempts.set(emergencyKey, failCount);
    syncState.stats.emergenciesSync.failed++;

    console.warn(
      `✗ Failed to sync emergency ${emergency.id} (${failCount}/${MAX_RETRIES}):`,
      error
    );
    return false;
  }
}

async function syncAllPendingEmergencies(): Promise<void> {
  try {
    const pendingEmergencies = await localdatabase.getPendingEmergencies();

    if (pendingEmergencies.length === 0) {
      return;
    }

    console.log(`📊 Syncing ${pendingEmergencies.length} pending emergencies...`);
    syncState.stats.emergenciesSync = {
      success: 0,
      failed: 0,
      total: pendingEmergencies.length,
    };

    for (const emergency of pendingEmergencies) {
      await syncPendingEmergency(emergency);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `✓ Emergency sync: ${syncState.stats.emergenciesSync.success}/${pendingEmergencies.length} succeeded`
    );
  } catch (error) {
    console.error('❌ Error syncing emergencies:', error);
  }
}

// ============== ARRIVAL ALERT SYNC ==============

async function syncPendingArrivalAlert(alert: any): Promise<boolean> {
  const alertKey = `alert_${alert.id}`;
  try {
    const failCount = syncState.failedAttempts.get(alertKey) || 0;

    if (failCount >= MAX_RETRIES) {
      console.warn(`⚠️ Max retries reached for arrival alert ${alert.id}`);
      return false;
    }

    const result = await arrivalAlertService.createArrivalAlert({
      userID: alert.userID,
      name: alert.name,
      arrivalTime: alert.arrivalTime,
      exitTime: alert.exitTime,
    });

    if (result.id) {
      await localdatabase.markArrivalAlertAsSynced(alert.id, String(result.id));
      syncState.failedAttempts.delete(alertKey);
      syncState.stats.arrivalAlertsSync.success++;
      console.log(`✓ Arrival alert ${alert.id} synced`);
      return true;
    }

    return false;
  } catch (error) {
    const failCount = (syncState.failedAttempts.get(alertKey) || 0) + 1;
    syncState.failedAttempts.set(alertKey, failCount);
    syncState.stats.arrivalAlertsSync.failed++;

    console.warn(
      `✗ Failed to sync arrival alert ${alert.id} (${failCount}/${MAX_RETRIES}):`,
      error
    );
    return false;
  }
}

async function syncAllPendingArrivalAlerts(): Promise<void> {
  try {
    const pendingAlerts = await localdatabase.getPendingArrivalAlerts();

    if (pendingAlerts.length === 0) {
      return;
    }

    console.log(`📊 Syncing ${pendingAlerts.length} pending arrival alerts...`);
    syncState.stats.arrivalAlertsSync = {
      success: 0,
      failed: 0,
      total: pendingAlerts.length,
    };

    for (const alert of pendingAlerts) {
      await syncPendingArrivalAlert(alert);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `✓ Arrival alert sync: ${syncState.stats.arrivalAlertsSync.success}/${pendingAlerts.length} succeeded`
    );
  } catch (error) {
    console.error('❌ Error syncing arrival alerts:', error);
  }
}

// ============== MAIN SYNC FUNCTION ==============

async function syncAll(): Promise<void> {
  if (!isOnline()) {
    console.log('⚠️ [OFFLINE] Skipping sync - no internet connection');
    return;
  }

  if (syncState.isSyncing) {
    console.log('⏳ Sync already in progress - skipping');
    return;
  }

  syncState.isSyncing = true;
  syncState.stats.lastSyncTime = new Date().toISOString();

  try {
    console.log(`🔄 [${new Date().toLocaleTimeString()}] Starting sync cycle...`);
    
    // Check for pending items
    const pendingLogs = await localdatabase.getPendingLogs();
    const pendingProfiles = await localdatabase.getPendingProfiles();
    const pendingEmergencies = await localdatabase.getPendingEmergencies();
    const pendingAlerts = await localdatabase.getPendingArrivalAlerts();
    
    const totalPending = pendingLogs.length + pendingProfiles.length + pendingEmergencies.length + pendingAlerts.length;
    
    if (totalPending === 0) {
      console.log('✓ No pending items to sync');
      return;
    }
    
    console.log(`📊 Pending items: ${pendingLogs.length} logs, ${pendingProfiles.length} profiles, ${pendingEmergencies.length} emergencies, ${pendingAlerts.length} alerts`);
    
    await syncAllPendingLogs();
    await syncAllPendingProfiles();
    await syncAllPendingEmergencies();
    await syncAllPendingArrivalAlerts();
    
    console.log(`✓ Sync cycle completed at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error('❌ Error during sync cycle:', error);
  } finally {
    syncState.isSyncing = false;
  }
}

// ============== SYNC MANAGER API ==============

export const syncManager = {
  /**
   * Start the background sync process
   */
  start(): void {
    if (syncState.isRunning) {
      console.log('✓ Sync manager already running');
      return;
    }

    console.log('🚀 Starting background sync manager...');
    syncState.isRunning = true;

    // Run sync immediately
    syncAll();

    // Run sync every RETRY_INTERVAL
    syncState.intervalId = setInterval(() => {
      if (isOnline()) {
        syncAll();
      }
    }, RETRY_INTERVAL);

    // Listen to connection changes
    syncState.unsubscribeConnectionListener = onConnectionChange((isOnlineNow) => {
      if (isOnlineNow) {
        console.log('🔌 Connection restored! Triggering sync...');
        syncAll();
      } else {
        console.log('📡 Connection lost. Going offline mode.');
      }
    });

    console.log('✓ Sync manager started');
  },

  /**
   * Stop the background sync process
   */
  stop(): void {
    if (!syncState.isRunning) {
      console.log('ℹ️ Sync manager not running');
      return;
    }

    console.log('⏹️ Stopping background sync manager...');

    if (syncState.intervalId) {
      clearInterval(syncState.intervalId);
      syncState.intervalId = null;
    }

    if (syncState.unsubscribeConnectionListener) {
      syncState.unsubscribeConnectionListener();
      syncState.unsubscribeConnectionListener = null;
    }

    syncState.isRunning = false;
    console.log('✓ Sync manager stopped');
  },

  /**
   * Manually trigger a sync
   */
  async triggerSync(): Promise<void> {
    console.log('🔄 Manually triggering sync...');
    await syncAll();
  },

  /**
   * Get detailed sync status
   */
  getStatus(): {
    isRunning: boolean;
    isSyncing: boolean;
    stats: SyncStats;
  } {
    return {
      isRunning: syncState.isRunning,
      isSyncing: syncState.isSyncing,
      stats: syncState.stats,
    };
  },

  /**
   * Get number of pending items to sync
   */
  async getPendingCount(): Promise<{
    logs: number;
    profiles: number;
    emergencies: number;
    arrivalAlerts: number;
    total: number;
  }> {
    const [logs, profiles, emergencies, arrivalAlerts] = await Promise.all([
      (async () => (await localdatabase.getPendingLogs()).length)(),
      (async () => (await localdatabase.getPendingProfiles()).length)(),
      (async () => (await localdatabase.getPendingEmergencies()).length)(),
      (async () => (await localdatabase.getPendingArrivalAlerts()).length)(),
    ]);

    return {
      logs,
      profiles,
      emergencies,
      arrivalAlerts,
      total: logs + profiles + emergencies + arrivalAlerts,
    };
  },

  /**
   * Reset sync statistics
   */
  resetStats(): void {
    syncState.stats = {
      logsSync: { success: 0, failed: 0, total: 0 },
      profilesSync: { success: 0, failed: 0, total: 0 },
      emergenciesSync: { success: 0, failed: 0, total: 0 },
      arrivalAlertsSync: { success: 0, failed: 0, total: 0 },
      lastSyncTime: null,
      nextSyncTime: null,
    };
    console.log('✓ Sync statistics reset');
  },
};
