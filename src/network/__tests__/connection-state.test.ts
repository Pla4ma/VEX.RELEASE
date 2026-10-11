import { resolveConnectionState } from '../connection-state';

describe('resolveConnectionState', () => {
  it('returns unknown until internet reachability is known', () => {
    expect(
      resolveConnectionState({
        isConnected: true,
        isInternetReachable: null,
      }),
    ).toBe('unknown');
  });

  it('distinguishes offline from online connectivity', () => {
    expect(resolveConnectionState({ isConnected: false, isInternetReachable: false })).toBe('offline');
    expect(resolveConnectionState({ isConnected: true, isInternetReachable: true })).toBe('online');
  });
});
