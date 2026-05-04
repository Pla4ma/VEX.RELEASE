/**
 * NetInfo Hook
 *
 * React hook for network connectivity state and monitoring.
 */

import { useEffect, useState, useCallback } from 'react';
import { getNetInfoAdapter, type NetworkState } from './NetInfoAdapter';

/**
 * NetInfo hook return type
 */
interface UseNetInfoReturn extends NetworkState {
  /** Check if connected */
  isOnline: boolean;
  /** Check if offline */
  isOffline: boolean;
  /** Connection is metered (cellular) */
  isMetered: boolean;
  /** Is on WiFi */
  isWifi: boolean;
  /** Is on cellular */
  isCellular: boolean;
  /** Refresh network state */
  refresh: () => Promise<void>;
}

/**
 * Hook for network connectivity
 */
export function useNetInfo(): UseNetInfoReturn {
  const adapter = getNetInfoAdapter();
  const [state, setState] = useState<NetworkState>(adapter.getCurrentState());

  useEffect(() => {
    // Initialize on mount
    adapter.initialize();

    // Subscribe to changes
    const unsubscribe = adapter.subscribe((newState) => {
      setState(newState);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [adapter]);

  const refresh = useCallback(async () => {
    await adapter.initialize();
  }, [adapter]);

  return {
    ...state,
    isOnline: state.isConnected && (state.isInternetReachable ?? false),
    isOffline: !state.isConnected || state.isInternetReachable === false,
    isMetered: state.type === 'cellular',
    isWifi: state.type === 'wifi',
    isCellular: state.type === 'cellular',
    refresh,
  };
}

/**
 * Hook for online/offline status only
 */
export function useIsOnline(): boolean {
  const { isOnline } = useNetInfo();
  return isOnline;
}

/**
 * Hook for connection type
 */
export function useConnectionType(): string {
  const { type } = useNetInfo();
  return type;
}
