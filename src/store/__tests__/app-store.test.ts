import { useAppStore } from '../appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    const state = useAppStore.getState();
    state.setInitialized(false);
    state.setOnline(false);
    state.setLastSyncTime(0);
  });

  it('initializes with default state', () => {
    const state = useAppStore.getState();
    expect(state.isInitialized).toBe(false);
    expect(state.isOnline).toBe(false);
    expect(state.lastSyncTime).toBeNull();
  });

  it('sets initialized state', () => {
    useAppStore.getState().setInitialized(true);
    expect(useAppStore.getState().isInitialized).toBe(true);
  });

  it('sets online state', () => {
    useAppStore.getState().setOnline(true);
    expect(useAppStore.getState().isOnline).toBe(true);
  });

  it('sets offline state from online', () => {
    useAppStore.getState().setOnline(true);
    useAppStore.getState().setOnline(false);
    expect(useAppStore.getState().isOnline).toBe(false);
  });

  it('sets last sync time', () => {
    const now = Date.now();
    useAppStore.getState().setLastSyncTime(now);
    expect(useAppStore.getState().lastSyncTime).toBe(now);
  });

  it('updates last sync time multiple times', () => {
    useAppStore.getState().setLastSyncTime(1000);
    useAppStore.getState().setLastSyncTime(2000);
    expect(useAppStore.getState().lastSyncTime).toBe(2000);
  });

  it('independently updates each field', () => {
    useAppStore.getState().setInitialized(true);
    useAppStore.getState().setOnline(true);
    useAppStore.getState().setLastSyncTime(42);
    const state = useAppStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.isOnline).toBe(true);
    expect(state.lastSyncTime).toBe(42);
  });
});
