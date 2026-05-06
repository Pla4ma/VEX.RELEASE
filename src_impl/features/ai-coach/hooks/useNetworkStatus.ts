/**
 * useNetworkStatus Hook
 *
 * Returns network connectivity status.
 */

import { useMemo } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

export function useNetworkStatus(): NetworkStatus {
  const netInfo = useNetInfo();
  return useMemo(
    () => ({
      isConnected: netInfo.isConnected ?? true,
      isInternetReachable: netInfo.isInternetReachable ?? true,
      type: netInfo.type ?? null,
    }),
    [netInfo],
  );
}
