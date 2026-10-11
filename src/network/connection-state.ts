import type { ConnectionState } from '../lib/repository/retry';

export function resolveConnectionState(input: {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}): ConnectionState {
  if (!input.isConnected) {
    return 'offline';
  }
  if (input.isInternetReachable === true) {
    return 'online';
  }
  return 'unknown';
}
