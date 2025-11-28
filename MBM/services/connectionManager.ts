/**
 * Connection Manager
 * Manages internet connectivity detection and provides offline/online mode switching
 * This allows the app to function offline and sync when connection is restored
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface ConnectionListener {
  (isOnline: boolean): void;
}

interface ConnectionManagerState {
  isOnline: boolean;
  isConnecting: boolean;
  listeners: Set<ConnectionListener>;
  unsubscribe: (() => void) | null;
}

const state: ConnectionManagerState = {
  isOnline: true,
  isConnecting: false,
  listeners: new Set(),
  unsubscribe: null,
};

/**
 * Initialize connection monitoring
 * Should be called once when the app starts
 */
export const initializeConnectionManager = async () => {
  try {
    // Get initial state
    const netState = await NetInfo.fetch();
    updateConnectionState(netState);

    // Subscribe to connection changes
    state.unsubscribe = NetInfo.addEventListener((netState) => {
      updateConnectionState(netState);
    });

    console.log(`✓ Connection manager initialized. Online: ${state.isOnline}`);
  } catch (error) {
    console.error('Failed to initialize connection manager:', error);
    // Assume online if we can't determine
    state.isOnline = true;
  }
};

/**
 * Update connection state and notify listeners
 */
const updateConnectionState = (netState: NetInfoState) => {
  const wasOnline = state.isOnline;
  const isNowOnline = netState.isInternetReachable === true;

  if (wasOnline !== isNowOnline) {
    state.isOnline = isNowOnline;
    console.log(`🔌 Connection changed: ${state.isOnline ? 'ONLINE' : 'OFFLINE'}`);

    // Notify all listeners
    state.listeners.forEach((listener) => {
      try {
        listener(state.isOnline);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return state.isOnline;
};

/**
 * Force a connection check
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const netState = await NetInfo.fetch();
    updateConnectionState(netState);
    return state.isOnline;
  } catch (error) {
    console.error('Error checking connection:', error);
    return state.isOnline;
  }
};

/**
 * Subscribe to connection state changes
 * Returns a function to unsubscribe
 */
export const onConnectionChange = (listener: ConnectionListener): (() => void) => {
  state.listeners.add(listener);

  return () => {
    state.listeners.delete(listener);
  };
};

/**
 * Get current connection state details
 */
export const getConnectionState = async (): Promise<NetInfoState> => {
  return await NetInfo.fetch();
};

/**
 * Stop monitoring connections
 */
export const stopConnectionManager = () => {
  if (state.unsubscribe) {
    state.unsubscribe();
    state.unsubscribe = null;
  }
  state.listeners.clear();
  console.log('✓ Connection manager stopped');
};
