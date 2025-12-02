interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  data?: any;
}

let logBuffer: LogEntry[] = [];

/**
 * Debug logger - logs to console which shows in adb logcat
 * For release builds: use 'adb logcat | grep MBM' to see real-time logs
 */
export const debugLog = {
  info: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data
    };
    logBuffer.push(entry);
    console.log(`[MBM-INFO] ℹ️ ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      data
    };
    logBuffer.push(entry);
    console.warn(`[MBM-WARN] ⚠️ ${message}`, data);
  },

  error: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      data
    };
    logBuffer.push(entry);
    console.error(`[MBM-ERROR] ❌ ${message}`, data);
  },

  debug: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message,
      data
    };
    logBuffer.push(entry);
    console.debug(`[MBM-DEBUG] 🐛 ${message}`, data);
  },

  getLogs: async (): Promise<string> => {
    try {
      const content = logBuffer
        .map(entry => `[${entry.timestamp}] ${entry.level}: ${entry.message}${entry.data ? ' ' + JSON.stringify(entry.data) : ''}`)
        .join('\n');
      return content || 'No logs yet';
    } catch (error) {
      return `Error getting logs: ${error}`;
    }
  },

  clearLogs: async () => {
    try {
      logBuffer = [];
      console.log('[MBM-INFO] ✓ Logs cleared');
    } catch (error) {
      console.error('[MBM-ERROR] Error clearing logs:', error);
    }
  }
};
