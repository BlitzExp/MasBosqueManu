import * as logService from './logService';
import * as localdatabase from './localdatabase';

const RETRY_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 5;

interface SyncState {
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  failedAttempts: Map<number, number>;
}

const syncState: SyncState = {
  isRunning: false,
  intervalId: null,
  failedAttempts: new Map(),
};

/**
 * Attempt to sync a single pending log
 */
async function syncPendingLog(log: any): Promise<boolean> {
  try {
    const failCount = syncState.failedAttempts.get(log.id) || 0;
    
    // Skip if we've already retried too many times
    if (failCount >= MAX_RETRIES) {
      console.warn(`Max retries reached for log ${log.id}, skipping sync`);
      return false;
    }

    // Try to sync to server
    const result = await logService.createUserLog({
      userID: log.userID,
      name: log.name,
      logDate: log.logDate,
      ingressTime: log.ingressTime,
      exitTime: log.exitTime,
      description: log.description,
      image: log.image,
    });

    // Mark as synced in local DB
    if (result.id) {
      await localdatabase.markLogAsSynced(log.id, result.id);
      syncState.failedAttempts.delete(log.id);
      console.log(`✓ Successfully synced log ${log.id} (server ID: ${result.id})`);
      return true;
    }
    
    return false;
  } catch (error) {
    const failCount = (syncState.failedAttempts.get(log.id) || 0) + 1;
    syncState.failedAttempts.set(log.id, failCount);
    
    console.warn(
      `Failed to sync log ${log.id} (attempt ${failCount}/${MAX_RETRIES}):`,
      error
    );
    
    return false;
  }
}

/**
 * Sync all pending logs
 */
async function syncAllPendingLogs(): Promise<void> {
  try {
    const pendingLogs = await localdatabase.getPendingLogs();
    
    if (pendingLogs.length === 0) {
      console.log('No pending logs to sync');
      return;
    }

    console.log(`Starting sync of ${pendingLogs.length} pending logs...`);

    let successCount = 0;
    let failCount = 0;

    // Sync all pending logs
    for (const log of pendingLogs) {
      const synced = await syncPendingLog(log);
      if (synced) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay between requests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Sync complete: ${successCount} succeeded, ${failCount} failed/pending`
    );
  } catch (error) {
    console.error('Error during sync process:', error);
  }
}

/**
 * Background sync manager
 */
export const syncManager = {
  /**
   * Start the background sync process
   */
  start(): void {
    if (syncState.isRunning) {
      console.log('Sync manager already running');
      return;
    }

    console.log('Starting background sync manager...');
    syncState.isRunning = true;

    // Run sync immediately, then every RETRY_INTERVAL
    syncAllPendingLogs();

    syncState.intervalId = setInterval(
      () => {
        syncAllPendingLogs();
      },
      RETRY_INTERVAL
    );
  },

  /**
   * Stop the background sync process
   */
  stop(): void {
    if (!syncState.isRunning) {
      console.log('Sync manager not running');
      return;
    }

    console.log('Stopping background sync manager...');
    
    if (syncState.intervalId) {
      clearInterval(syncState.intervalId);
      syncState.intervalId = null;
    }

    syncState.isRunning = false;
  },

  /**
   * Manually trigger a sync
   */
  async triggerSync(): Promise<void> {
    console.log('Manually triggering sync...');
    await syncAllPendingLogs();
  },

  /**
   * Get sync status
   */
  getStatus(): {
    isRunning: boolean;
    failedAttempts: number;
  } {
    return {
      isRunning: syncState.isRunning,
      failedAttempts: syncState.failedAttempts.size,
    };
  },
};
